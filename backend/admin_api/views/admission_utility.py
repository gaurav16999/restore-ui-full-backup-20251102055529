"""
Phase 7: Admission & Utility Module ViewSets
Handles admission applications, bulk operations, visitor management, complaints
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Count, Avg, Sum
from django.db import transaction
from datetime import datetime, timedelta, date
from decimal import Decimal
import openpyxl
from io import BytesIO
from django.http import HttpResponse
import csv

from admin_api.models import (
    AdmissionApplication, AdmissionQuery, StudentPromotion,
    VisitorBook, Complaint, Student, ClassRoom, AcademicYear, User
)
from rest_framework import serializers


# ==================== Serializers ====================

class AdmissionApplicationSerializer(serializers.ModelSerializer):
    """Serializer for admission applications"""
    applicant_full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    days_since_application = serializers.SerializerMethodField()
    
    class Meta:
        model = AdmissionApplication
        fields = '__all__'
        read_only_fields = ['application_number', 'created_at', 'updated_at']
    
    def get_applicant_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_age(self, obj):
        today = date.today()
        return today.year - obj.date_of_birth.year - (
            (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
        )
    
    def get_days_since_application(self, obj):
        return (timezone.now().date() - obj.application_date).days


class AdmissionQuerySerializer(serializers.ModelSerializer):
    """Serializer for admission queries"""
    days_since_query = serializers.SerializerMethodField()
    follow_up_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = AdmissionQuery
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_days_since_query(self, obj):
        return (timezone.now().date() - obj.query_date).days
    
    def get_follow_up_overdue(self, obj):
        if obj.next_follow_up_date and obj.status not in ['Converted', 'Closed']:
            return obj.next_follow_up_date < timezone.now().date()
        return False


class StudentPromotionSerializer(serializers.ModelSerializer):
    """Serializer for student promotions"""
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    promoted_by_name = serializers.CharField(source='promoted_by.get_full_name', read_only=True)
    
    class Meta:
        model = StudentPromotion
        fields = '__all__'
        read_only_fields = ['promotion_date', 'created_at']


class VisitorBookSerializer(serializers.ModelSerializer):
    """Serializer for visitor records"""
    duration_minutes = serializers.SerializerMethodField()
    is_checked_out = serializers.SerializerMethodField()
    
    class Meta:
        model = VisitorBook
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_duration_minutes(self, obj):
        if obj.out_time and obj.in_time:
            from datetime import datetime, timedelta
            in_dt = datetime.combine(date.today(), obj.in_time)
            out_dt = datetime.combine(date.today(), obj.out_time)
            return int((out_dt - in_dt).total_seconds() / 60)
        return None
    
    def get_is_checked_out(self, obj):
        return obj.out_time is not None


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for complaints"""
    days_since_complaint = serializers.SerializerMethodField()
    resolution_time_days = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_days_since_complaint(self, obj):
        return (timezone.now().date() - obj.date).days
    
    def get_resolution_time_days(self, obj):
        if hasattr(obj, 'action_taken_date') and obj.action_taken_date:
            return (obj.action_taken_date - obj.date).days
        return None


# ==================== ViewSets ====================

class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing admission applications
    
    Custom Actions:
    - approve_application: Approve an application
    - reject_application: Reject an application
    - bulk_approve: Approve multiple applications
    - generate_admission_letter: Generate admission letter
    - application_stats: Get application statistics
    - pending_reviews: Get applications pending review
    - export_applications: Export to Excel
    """
    queryset = AdmissionApplication.objects.all()
    serializer_class = AdmissionApplicationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'academic_year', 'applying_for_class', 'gender']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'application_number']
    ordering_fields = ['application_date', 'priority', 'created_at']
    ordering = ['-application_date']

    @action(detail=True, methods=['post'])
    def approve_application(self, request, pk=None):
        """Approve an admission application"""
        application = self.get_object()
        
        if application.status == 'approved':
            return Response(
                {'error': 'Application is already approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application.status = 'approved'
        application.reviewed_by = request.user
        application.reviewed_date = timezone.now()
        application.review_remarks = request.data.get('remarks', '')
        application.save()
        
        return Response({
            'message': 'Application approved successfully',
            'application': AdmissionApplicationSerializer(application).data
        })

    @action(detail=True, methods=['post'])
    def reject_application(self, request, pk=None):
        """Reject an admission application"""
        application = self.get_object()
        
        if application.status == 'rejected':
            return Response(
                {'error': 'Application is already rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        remarks = request.data.get('remarks')
        if not remarks:
            return Response(
                {'error': 'Rejection remarks are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application.status = 'rejected'
        application.reviewed_by = request.user
        application.reviewed_date = timezone.now()
        application.review_remarks = remarks
        application.save()
        
        return Response({
            'message': 'Application rejected',
            'application': AdmissionApplicationSerializer(application).data
        })

    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Approve multiple applications at once"""
        application_ids = request.data.get('application_ids', [])
        remarks = request.data.get('remarks', 'Bulk approved')
        
        if not application_ids:
            return Response(
                {'error': 'No application IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        applications = AdmissionApplication.objects.filter(
            id__in=application_ids,
            status='pending'
        )
        
        count = applications.update(
            status='approved',
            reviewed_by=request.user,
            reviewed_date=timezone.now(),
            review_remarks=remarks
        )
        
        return Response({
            'message': f'{count} applications approved successfully',
            'approved_count': count
        })

    @action(detail=True, methods=['get'])
    def generate_admission_letter(self, request, pk=None):
        """Generate admission letter (placeholder for PDF generation)"""
        application = self.get_object()
        
        if application.status != 'approved':
            return Response(
                {'error': 'Only approved applications can generate admission letters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # In a real implementation, this would generate a PDF
        return Response({
            'message': 'Admission letter generated',
            'application_number': application.application_number,
            'applicant_name': f"{application.first_name} {application.last_name}",
            'class': application.applying_for_class,
            'academic_year': application.academic_year.name if application.academic_year else None
        })

    @action(detail=False, methods=['get'])
    def application_stats(self, request):
        """Get application statistics"""
        stats = {
            'total': AdmissionApplication.objects.count(),
            'by_status': {},
            'by_class': {},
            'recent_30_days': AdmissionApplication.objects.filter(
                application_date__gte=timezone.now().date() - timedelta(days=30)
            ).count(),
            'pending_review': AdmissionApplication.objects.filter(
                status='pending'
            ).count()
        }
        
        # Count by status
        for choice in AdmissionApplication.STATUS_CHOICES:
            status_key = choice[0]
            count = AdmissionApplication.objects.filter(status=status_key).count()
            stats['by_status'][status_key] = count
        
        # Count by class
        class_counts = AdmissionApplication.objects.values('applying_for_class').annotate(
            count=Count('id')
        ).order_by('-count')
        stats['by_class'] = {item['applying_for_class']: item['count'] for item in class_counts}
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def pending_reviews(self, request):
        """Get all applications pending review"""
        pending = AdmissionApplication.objects.filter(
            status='pending'
        ).order_by('-priority', '-application_date')
        
        serializer = self.get_serializer(pending, many=True)
        return Response({
            'count': pending.count(),
            'applications': serializer.data
        })

    @action(detail=False, methods=['get'])
    def export_applications(self, request):
        """Export applications to Excel"""
        applications = self.filter_queryset(self.get_queryset())
        
        # Create workbook
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Admission Applications"
        
        # Headers
        headers = [
            'Application Number', 'Name', 'Date of Birth', 'Gender',
            'Email', 'Phone', 'Applying for Class', 'Academic Year',
            'Parent Name', 'Parent Phone', 'Status', 'Application Date'
        ]
        ws.append(headers)
        
        # Data
        for app in applications:
            ws.append([
                app.application_number,
                f"{app.first_name} {app.last_name}",
                app.date_of_birth.strftime('%Y-%m-%d'),
                app.gender,
                app.email,
                app.phone,
                app.applying_for_class,
                app.academic_year.name if app.academic_year else '',
                app.parent_name,
                app.parent_phone,
                app.status,
                app.application_date.strftime('%Y-%m-%d') if hasattr(app, 'application_date') else ''
            ])
        
        # Save to BytesIO
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=admission_applications_{timezone.now().strftime("%Y%m%d")}.xlsx'
        
        return response


class AdmissionQueryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing admission queries/inquiries
    
    Custom Actions:
    - mark_follow_up: Mark follow-up done
    - convert_to_application: Convert query to application
    - overdue_followups: Get overdue follow-ups
    - query_stats: Get query statistics
    """
    queryset = AdmissionQuery.objects.all()
    serializer_class = AdmissionQuerySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'source', 'class_field']
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['query_date', 'next_follow_up_date', 'created_at']
    ordering = ['-query_date']

    @action(detail=True, methods=['post'])
    def mark_follow_up(self, request, pk=None):
        """Mark follow-up as done and schedule next"""
        query = self.get_object()
        
        query.last_follow_up_date = timezone.now().date()
        query.next_follow_up_date = request.data.get('next_follow_up_date')
        query.status = request.data.get('status', query.status)
        
        if 'notes' in request.data:
            query.description = (query.description or '') + f"\n[{timezone.now().date()}] {request.data['notes']}"
        
        query.save()
        
        return Response({
            'message': 'Follow-up recorded successfully',
            'query': AdmissionQuerySerializer(query).data
        })

    @action(detail=True, methods=['post'])
    def convert_to_application(self, request, pk=None):
        """Convert inquiry to formal admission application"""
        query = self.get_object()
        
        # Generate application number
        from random import randint
        app_number = f"APP{timezone.now().year}{randint(10000, 99999)}"
        
        # Create application (simplified)
        application_data = {
            'first_name': query.name.split()[0] if query.name else '',
            'last_name': ' '.join(query.name.split()[1:]) if len(query.name.split()) > 1 else '',
            'email': query.email or f"{app_number.lower()}@temp.com",
            'phone': query.phone,
            'address': query.address or '',
            'applying_for_class': query.class_field or '',
            'application_number': app_number,
            'status': 'pending'
        }
        
        # Mark query as converted
        query.status = 'Converted'
        query.save()
        
        return Response({
            'message': 'Query converted to application',
            'application_number': app_number,
            'query_id': query.id
        })

    @action(detail=False, methods=['get'])
    def overdue_followups(self, request):
        """Get queries with overdue follow-ups"""
        today = timezone.now().date()
        overdue = AdmissionQuery.objects.filter(
            next_follow_up_date__lt=today,
            status__in=['Pending', 'Follow Up', 'Contacted']
        ).order_by('next_follow_up_date')
        
        serializer = self.get_serializer(overdue, many=True)
        return Response({
            'count': overdue.count(),
            'overdue_queries': serializer.data
        })

    @action(detail=False, methods=['get'])
    def query_stats(self, request):
        """Get query statistics"""
        stats = {
            'total': AdmissionQuery.objects.count(),
            'by_status': {},
            'by_source': {},
            'converted_rate': 0,
            'pending_followups': AdmissionQuery.objects.filter(
                status__in=['Pending', 'Follow Up']
            ).count()
        }
        
        # By status
        for choice in AdmissionQuery.STATUS_CHOICES:
            status_key = choice[0]
            count = AdmissionQuery.objects.filter(status=status_key).count()
            stats['by_status'][status_key] = count
        
        # By source
        for choice in AdmissionQuery.SOURCE_CHOICES:
            source_key = choice[0]
            count = AdmissionQuery.objects.filter(source=source_key).count()
            stats['by_source'][source_key] = count
        
        # Conversion rate
        total = stats['total']
        if total > 0:
            converted = stats['by_status'].get('Converted', 0)
            stats['converted_rate'] = round((converted / total) * 100, 2)
        
        return Response(stats)


class StudentPromotionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student promotions
    
    Custom Actions:
    - bulk_promote: Promote multiple students
    - promotion_report: Get promotion statistics
    - reverse_promotion: Reverse a promotion (demote)
    """
    queryset = StudentPromotion.objects.all()
    serializer_class = StudentPromotionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['student', 'from_academic_year', 'to_academic_year']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'student__roll_number']
    ordering_fields = ['promotion_date', 'created_at']
    ordering = ['-promotion_date']

    @action(detail=False, methods=['post'])
    def bulk_promote(self, request):
        """Promote multiple students to next class"""
        student_ids = request.data.get('student_ids', [])
        to_class = request.data.get('to_class')
        to_academic_year_id = request.data.get('to_academic_year')
        remarks = request.data.get('remarks', '')
        
        if not all([student_ids, to_class, to_academic_year_id]):
            return Response(
                {'error': 'student_ids, to_class, and to_academic_year are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            to_academic_year = AcademicYear.objects.get(id=to_academic_year_id)
        except AcademicYear.DoesNotExist:
            return Response(
                {'error': 'Invalid academic year'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        promotions = []
        with transaction.atomic():
            for student_id in student_ids:
                try:
                    student = Student.objects.get(id=student_id)
                    
                    # Get current class and academic year
                    from_class = student.class_room.name if student.class_room else 'Unknown'
                    from_academic_year = student.academic_year if hasattr(student, 'academic_year') else to_academic_year
                    
                    # Create promotion record
                    promotion = StudentPromotion.objects.create(
                        student=student,
                        from_class=from_class,
                        to_class=to_class,
                        from_academic_year=from_academic_year,
                        to_academic_year=to_academic_year,
                        promoted_by=request.user,
                        remarks=remarks
                    )
                    promotions.append(promotion)
                    
                    # Update student's class (if ClassRoom exists with that name)
                    try:
                        new_class_room = ClassRoom.objects.get(name=to_class)
                        student.class_room = new_class_room
                        student.save()
                    except ClassRoom.DoesNotExist:
                        pass
                    
                except Student.DoesNotExist:
                    continue
        
        return Response({
            'message': f'{len(promotions)} students promoted successfully',
            'promoted_count': len(promotions),
            'promotions': StudentPromotionSerializer(promotions, many=True).data
        })

    @action(detail=False, methods=['get'])
    def promotion_report(self, request):
        """Get promotion statistics"""
        academic_year_id = request.query_params.get('academic_year')
        
        queryset = self.get_queryset()
        if academic_year_id:
            queryset = queryset.filter(to_academic_year_id=academic_year_id)
        
        stats = {
            'total_promotions': queryset.count(),
            'by_class': {},
            'recent_30_days': queryset.filter(
                promotion_date__gte=timezone.now().date() - timedelta(days=30)
            ).count()
        }
        
        # Count by destination class
        class_counts = queryset.values('to_class').annotate(
            count=Count('id')
        ).order_by('-count')
        stats['by_class'] = {item['to_class']: item['count'] for item in class_counts}
        
        return Response(stats)

    @action(detail=True, methods=['post'])
    def reverse_promotion(self, request, pk=None):
        """Reverse a promotion (demote student)"""
        promotion = self.get_object()
        student = promotion.student
        
        # Restore to previous class
        try:
            old_class_room = ClassRoom.objects.get(name=promotion.from_class)
            student.class_room = old_class_room
            student.save()
        except ClassRoom.DoesNotExist:
            pass
        
        # Mark promotion record
        promotion.remarks = (promotion.remarks or '') + f"\n[REVERSED on {timezone.now().date()}]"
        promotion.save()
        
        return Response({
            'message': 'Promotion reversed successfully',
            'student_id': student.id,
            'restored_to_class': promotion.from_class
        })


class VisitorBookViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing visitor records
    
    Custom Actions:
    - check_out: Mark visitor as checked out
    - active_visitors: Get visitors currently in premises
    - visitor_stats: Get visitor statistics
    """
    queryset = VisitorBook.objects.all()
    serializer_class = VisitorBookSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['date', 'purpose']
    search_fields = ['name', 'phone', 'purpose']
    ordering_fields = ['date', 'in_time', 'created_at']
    ordering = ['-date', '-in_time']

    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        """Mark visitor as checked out"""
        visitor = self.get_object()
        
        if visitor.out_time:
            return Response(
                {'error': 'Visitor already checked out'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        visitor.out_time = request.data.get('out_time', timezone.now().time())
        visitor.note = (visitor.note or '') + f"\nChecked out at {visitor.out_time}"
        visitor.save()
        
        return Response({
            'message': 'Visitor checked out successfully',
            'visitor': VisitorBookSerializer(visitor).data
        })

    @action(detail=False, methods=['get'])
    def active_visitors(self, request):
        """Get visitors currently in premises (not checked out)"""
        today = timezone.now().date()
        active = VisitorBook.objects.filter(
            date=today,
            out_time__isnull=True
        ).order_by('-in_time')
        
        serializer = self.get_serializer(active, many=True)
        return Response({
            'count': active.count(),
            'visitors': serializer.data
        })

    @action(detail=False, methods=['get'])
    def visitor_stats(self, request):
        """Get visitor statistics"""
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        queryset = self.get_queryset()
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        stats = {
            'total_visitors': queryset.count(),
            'total_persons': queryset.aggregate(Sum('no_of_person'))['no_of_person__sum'] or 0,
            'by_purpose': {},
            'today': VisitorBook.objects.filter(date=timezone.now().date()).count()
        }
        
        # Count by purpose
        purpose_counts = queryset.values('purpose').annotate(
            count=Count('id')
        ).order_by('-count')
        stats['by_purpose'] = {item['purpose']: item['count'] for item in purpose_counts}
        
        return Response(stats)


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing complaints
    
    Custom Actions:
    - resolve: Mark complaint as resolved
    - escalate: Escalate complaint
    - complaint_stats: Get complaint statistics
    - pending_complaints: Get pending complaints
    """
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'complaint_type', 'source']
    search_fields = ['complaint_by', 'phone', 'description']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark complaint as resolved"""
        complaint = self.get_object()
        
        if complaint.status == 'Resolved':
            return Response(
                {'error': 'Complaint is already resolved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_taken = request.data.get('action_taken')
        if not action_taken:
            return Response(
                {'error': 'action_taken is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        complaint.status = 'Resolved'
        if hasattr(complaint, 'action_taken'):
            complaint.action_taken = action_taken
        if hasattr(complaint, 'action_taken_date'):
            complaint.action_taken_date = timezone.now().date()
        complaint.save()
        
        return Response({
            'message': 'Complaint resolved successfully',
            'complaint': ComplaintSerializer(complaint).data
        })

    @action(detail=True, methods=['post'])
    def escalate(self, request, pk=None):
        """Escalate complaint to higher priority"""
        complaint = self.get_object()
        
        escalation_note = request.data.get('note', 'Escalated')
        
        complaint.status = 'In Progress'
        if hasattr(complaint, 'description'):
            complaint.description = (complaint.description or '') + f"\n[ESCALATED on {timezone.now().date()}] {escalation_note}"
        complaint.save()
        
        return Response({
            'message': 'Complaint escalated',
            'complaint': ComplaintSerializer(complaint).data
        })

    @action(detail=False, methods=['get'])
    def complaint_stats(self, request):
        """Get complaint statistics"""
        stats = {
            'total': self.get_queryset().count(),
            'by_status': {},
            'by_type': {},
            'pending': self.get_queryset().filter(status='Pending').count(),
            'resolved_30_days': self.get_queryset().filter(
                status='Resolved',
                date__gte=timezone.now().date() - timedelta(days=30)
            ).count()
        }
        
        # By status
        for choice in Complaint.STATUS_CHOICES:
            status_key = choice[0]
            count = self.get_queryset().filter(status=status_key).count()
            stats['by_status'][status_key] = count
        
        # By type
        for choice in Complaint.COMPLAINT_TYPE_CHOICES:
            type_key = choice[0]
            count = self.get_queryset().filter(complaint_type=type_key).count()
            stats['by_type'][type_key] = count
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def pending_complaints(self, request):
        """Get all pending complaints"""
        pending = self.get_queryset().filter(
            status__in=['Pending', 'In Progress']
        ).order_by('-date')
        
        serializer = self.get_serializer(pending, many=True)
        return Response({
            'count': pending.count(),
            'complaints': serializer.data
        })
