from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta

from admin_api.models import (
    AcademicYear, AdmissionApplication, StudentPromotion,
    ExamSession, QuestionAnswer, ProgressCard, ProgressCardSubject,
    MeritList, MeritListEntry, Student, User, Exam, Question
)
from admin_api.serializers.academic import (
    AcademicYearSerializer, AdmissionApplicationSerializer,
    AdmissionApplicationListSerializer, StudentPromotionSerializer,
    BulkPromotionSerializer, ExamSessionSerializer,
    QuestionAnswerSerializer, ProgressCardSerializer,
    ProgressCardCreateSerializer, MeritListSerializer,
    MeritListGenerateSerializer, MeritListEntrySerializer
)


class AcademicYearViewSet(viewsets.ModelViewSet):
    """Academic year management"""
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-start_date']
    
    @action(detail=True, methods=['post'])
    def set_current(self, request, pk=None):
        """Set an academic year as current"""
        academic_year = self.get_object()
        
        # Deactivate all other academic years
        AcademicYear.objects.filter(is_current=True).update(is_current=False)
        
        # Set this as current
        academic_year.is_current = True
        academic_year.is_active = True
        academic_year.save()
        
        return Response({
            'message': f'{academic_year.name} is now the current academic year',
            'data': self.get_serializer(academic_year).data
        })
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current academic year"""
        try:
            current_year = AcademicYear.objects.get(is_current=True)
            serializer = self.get_serializer(current_year)
            return Response(serializer.data)
        except AcademicYear.DoesNotExist:
            return Response(
                {'error': 'No current academic year set'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    """Admission application management"""
    queryset = AdmissionApplication.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['application_number', 'first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['applied_date', 'status', 'priority']
    ordering = ['-applied_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AdmissionApplicationListSerializer
        return AdmissionApplicationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by academic year
        academic_year_id = self.request.query_params.get('academic_year')
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)
        
        # Filter by class
        class_name = self.request.query_params.get('class')
        if class_name:
            queryset = queryset.filter(applying_for_class=class_name)
        
        return queryset.select_related('academic_year', 'reviewed_by', 'student')
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Review an application (approve/reject)"""
        application = self.get_object()
        new_status = request.data.get('status')
        review_notes = request.data.get('review_notes', '')
        
        valid_statuses = ['under_review', 'approved', 'rejected', 'waitlisted']
        if new_status not in valid_statuses:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application.status = new_status
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.review_notes = review_notes
        application.save()
        
        return Response({
            'message': f'Application {new_status}',
            'data': self.get_serializer(application).data
        })
    
    @action(detail=True, methods=['post'])
    def admit(self, request, pk=None):
        """Admit an approved application and create student record"""
        application = self.get_object()
        
        if application.status != 'approved':
            return Response(
                {'error': 'Only approved applications can be admitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if application.student:
            return Response(
                {'error': 'Student already created for this application'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Create user account
                username = f"{application.first_name.lower()}.{application.last_name.lower()}"
                # Add number if username exists
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=application.email,
                    first_name=application.first_name,
                    last_name=application.last_name,
                    role='student'
                )
                user.set_password('student123')  # Default password
                user.save()
                
                # Create student record
                student = Student.objects.create(
                    user=user,
                    roll_no=f"STU{timezone.now().year}{Student.objects.count() + 1:04d}",
                    class_name=application.applying_for_class,
                    phone=application.phone,
                    date_of_birth=application.date_of_birth,
                    parent_contact=application.parent_phone,
                    address=application.address
                )
                
                # Update application
                application.status = 'admitted'
                application.student = student
                application.admission_date = timezone.now().date()
                application.save()
                
                return Response({
                    'message': 'Student admitted successfully',
                    'student_id': student.id,
                    'roll_no': student.roll_no,
                    'username': username,
                    'default_password': 'student123'
                })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get admission statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'pending': queryset.filter(status='pending').count(),
            'under_review': queryset.filter(status='under_review').count(),
            'approved': queryset.filter(status='approved').count(),
            'rejected': queryset.filter(status='rejected').count(),
            'waitlisted': queryset.filter(status='waitlisted').count(),
            'admitted': queryset.filter(status='admitted').count(),
            'by_class': {}
        }
        
        # Group by class
        by_class = queryset.values('applying_for_class').annotate(
            count=Count('id')
        ).order_by('applying_for_class')
        
        for item in by_class:
            stats['by_class'][item['applying_for_class']] = item['count']
        
        return Response(stats)


class StudentPromotionViewSet(viewsets.ModelViewSet):
    """Student promotion management"""
    queryset = StudentPromotion.objects.all()
    serializer_class = StudentPromotionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__user__first_name', 'student__user__last_name', 'student__roll_no']
    ordering_fields = ['promotion_date']
    ordering = ['-promotion_date']
    
    def perform_create(self, serializer):
        serializer.save(promoted_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def bulk_promote(self, request):
        """Promote multiple students at once"""
        serializer = BulkPromotionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        student_ids = data['student_ids']
        from_class = data['from_class']
        to_class = data['to_class']
        to_academic_year_id = data['to_academic_year_id']
        remarks = data.get('remarks', '')
        
        try:
            # Get current academic year
            from_academic_year = AcademicYear.objects.get(is_current=True)
            to_academic_year = AcademicYear.objects.get(id=to_academic_year_id)
        except AcademicYear.DoesNotExist:
            return Response(
                {'error': 'Academic year not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        promoted_count = 0
        errors = []
        
        with transaction.atomic():
            for student_id in student_ids:
                try:
                    student = Student.objects.get(id=student_id)
                    
                    # Update student class
                    student.class_name = to_class
                    student.save()
                    
                    # Create promotion record
                    StudentPromotion.objects.create(
                        student=student,
                        from_class=from_class,
                        to_class=to_class,
                        from_academic_year=from_academic_year,
                        to_academic_year=to_academic_year,
                        remarks=remarks,
                        promoted_by=request.user
                    )
                    
                    promoted_count += 1
                    
                except Student.DoesNotExist:
                    errors.append(f"Student {student_id} not found")
                except Exception as e:
                    errors.append(f"Error promoting student {student_id}: {str(e)}")
        
        return Response({
            'message': f'Successfully promoted {promoted_count} student(s)',
            'promoted_count': promoted_count,
            'errors': errors
        })


class ExamSessionViewSet(viewsets.ModelViewSet):
    """Exam session management for online exams"""
    queryset = ExamSession.objects.all()
    serializer_class = ExamSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__user__first_name', 'student__user__last_name', 'exam__name']
    ordering_fields = ['started_at', 'ended_at']
    ordering = ['-started_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by student
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filter by exam
        exam_id = self.request.query_params.get('exam')
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.select_related('exam', 'student__user')
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit an exam session"""
        session = self.get_object()
        
        if session.is_submitted:
            return Response(
                {'error': 'Exam already submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate duration
        session.ended_at = timezone.now()
        session.duration_seconds = int((session.ended_at - session.started_at).total_seconds())
        session.is_active = False
        session.is_submitted = True
        
        # Auto-grade MCQ questions
        total_marks = 0
        answers = session.answers.all()
        
        for answer in answers:
            question = answer.question
            if question.question_type == 'mcq' and question.correct_option:
                if answer.selected_option == question.correct_option:
                    answer.is_correct = True
                    answer.marks_awarded = question.marks
                else:
                    answer.is_correct = False
                    answer.marks_awarded = 0
                answer.save()
                total_marks += answer.marks_awarded
        
        session.auto_graded_marks = total_marks
        session.save()
        
        return Response({
            'message': 'Exam submitted successfully',
            'duration_seconds': session.duration_seconds,
            'auto_graded_marks': float(session.auto_graded_marks) if session.auto_graded_marks else 0,
            'data': self.get_serializer(session).data
        })
    
    @action(detail=True, methods=['post'])
    def track_tab_switch(self, request, pk=None):
        """Track tab switch during exam (proctoring)"""
        session = self.get_object()
        session.tab_switches += 1
        session.save()
        
        return Response({
            'tab_switches': session.tab_switches
        })


class ProgressCardViewSet(viewsets.ModelViewSet):
    """Progress card/report card management"""
    queryset = ProgressCard.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__user__first_name', 'student__user__last_name', 'student__roll_no']
    ordering_fields = ['created_at', 'rank', 'percentage']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProgressCardCreateSerializer
        return ProgressCardSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by student
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filter by academic year
        academic_year_id = self.request.query_params.get('academic_year')
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)
        
        # Filter by term
        term = self.request.query_params.get('term')
        if term:
            queryset = queryset.filter(term=term)
        
        # Filter by class
        class_name = self.request.query_params.get('class')
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        
        # Filter by published status
        is_published = self.request.query_params.get('is_published')
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published.lower() == 'true')
        
        return queryset.select_related('student__user', 'academic_year').prefetch_related('subject_marks__subject')
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a progress card"""
        progress_card = self.get_object()
        progress_card.is_published = True
        progress_card.published_date = timezone.now().date()
        progress_card.save()
        
        return Response({
            'message': 'Progress card published successfully',
            'data': self.get_serializer(progress_card).data
        })
    
    @action(detail=True, methods=['post'])
    def parent_signature(self, request, pk=None):
        """Mark parent signature as received"""
        progress_card = self.get_object()
        progress_card.parent_signature = True
        progress_card.parent_signature_date = timezone.now().date()
        progress_card.save()
        
        return Response({
            'message': 'Parent signature recorded',
            'data': self.get_serializer(progress_card).data
        })
    
    @action(detail=False, methods=['post'])
    def calculate_ranks(self, request):
        """Calculate and update ranks for a class and term"""
        academic_year_id = request.data.get('academic_year_id')
        class_name = request.data.get('class_name')
        term = request.data.get('term')
        
        if not all([academic_year_id, class_name, term]):
            return Response(
                {'error': 'academic_year_id, class_name, and term are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all progress cards for this class and term
        progress_cards = ProgressCard.objects.filter(
            academic_year_id=academic_year_id,
            class_name=class_name,
            term=term
        ).order_by('-percentage')
        
        # Update ranks
        for rank, card in enumerate(progress_cards, start=1):
            card.rank = rank
            card.save()
        
        return Response({
            'message': f'Ranks calculated for {progress_cards.count()} students',
            'count': progress_cards.count()
        })


class MeritListViewSet(viewsets.ModelViewSet):
    """Merit list management"""
    queryset = MeritList.objects.all()
    serializer_class = MeritListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['generated_date']
    ordering = ['-generated_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by academic year
        academic_year_id = self.request.query_params.get('academic_year')
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)
        
        # Filter by class
        class_name = self.request.query_params.get('class')
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        
        # Filter by term
        term = self.request.query_params.get('term')
        if term:
            queryset = queryset.filter(term=term)
        
        return queryset.select_related('academic_year', 'generated_by').prefetch_related('entries__student__user')
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate merit list from progress cards"""
        serializer = MeritListGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        academic_year_id = data['academic_year_id']
        class_name = data['class_name']
        term = data['term']
        
        try:
            academic_year = AcademicYear.objects.get(id=academic_year_id)
        except AcademicYear.DoesNotExist:
            return Response(
                {'error': 'Academic year not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get progress cards
        progress_cards = ProgressCard.objects.filter(
            academic_year=academic_year,
            class_name=class_name,
            term=term,
            is_published=True
        ).order_by('-percentage')
        
        if not progress_cards.exists():
            return Response(
                {'error': 'No published progress cards found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            # Delete existing merit list if any
            MeritList.objects.filter(
                academic_year=academic_year,
                class_name=class_name,
                term=term
            ).delete()
            
            # Create new merit list
            merit_list = MeritList.objects.create(
                academic_year=academic_year,
                class_name=class_name,
                term=term,
                generated_by=request.user
            )
            
            # Create entries
            for rank, progress_card in enumerate(progress_cards, start=1):
                MeritListEntry.objects.create(
                    merit_list=merit_list,
                    rank=rank,
                    student=progress_card.student,
                    progress_card=progress_card,
                    total_marks=progress_card.total_marks,
                    percentage=progress_card.percentage,
                    gpa=progress_card.gpa
                )
        
        return Response({
            'message': 'Merit list generated successfully',
            'entries_count': progress_cards.count(),
            'data': self.get_serializer(merit_list).data
        })
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a merit list"""
        merit_list = self.get_object()
        merit_list.is_published = True
        merit_list.save()
        
        return Response({
            'message': 'Merit list published successfully',
            'data': self.get_serializer(merit_list).data
        })
