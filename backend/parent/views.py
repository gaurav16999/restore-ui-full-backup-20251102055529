from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from users.models import User
from admin_api.models import (
    Student, Attendance, Grade, FeePayment, FeeStructure,
    Assignment, AssignmentSubmission, Exam, ExamResult,
    Message, Announcement, Teacher, Subject, ClassRoom
)
from admin_api.serializers import (
    StudentSerializer, AttendanceSerializer, GradeSerializer,
    FeePaymentSerializer, FeeStructureSerializer,
    AssignmentSerializer, AssignmentSubmissionSerializer,
    MessageSerializer, AnnouncementSerializer, ExamResultSerializer
)


class ParentDashboardView(APIView):
    """Parent dashboard with overview of all children"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all children linked to this parent
        children = Student.objects.filter(
            parent_user=request.user
        ).select_related('user')

        dashboard_data = {
            'children_count': children.count(),
            'children': [],
            'notifications': [],
            'announcements': []
        }

        for child in children:
            # Get child's recent stats
            recent_attendance = Attendance.objects.filter(
                student=child
            ).order_by('-date')[:10]

            recent_grades = Grade.objects.filter(
                student=child
            ).order_by('-created_at')[:5]

            pending_fees = FeePayment.objects.filter(
                student=child,
                status='pending'
            ).count()

            child_data = {
                'id': child.id,
                'name': child.get_full_name(),
                'roll_no': child.roll_no,
                'class': child.class_name,
                'attendance_percentage': float(child.attendance_percentage),
                'recent_grades_count': recent_grades.count(),
                'pending_fees_count': pending_fees,
                'is_active': child.is_active
            }
            dashboard_data['children'].append(child_data)

        # Get recent announcements
        announcements = Announcement.objects.filter(
            is_active=True
        ).order_by('-created_at')[:5]
        dashboard_data['announcements'] = AnnouncementSerializer(
            announcements, many=True
        ).data

        return Response(dashboard_data)


class ChildDetailView(APIView):
    """Detailed information about a specific child"""
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            child = Student.objects.get(
                id=child_id,
                parent_user=request.user
            )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Child not found or not linked to this parent.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get comprehensive child data
        child_data = StudentSerializer(child).data

        # Add attendance summary
        attendance_records = Attendance.objects.filter(student=child)
        total_days = attendance_records.count()
        present_days = attendance_records.filter(status='present').count()
        attendance_percentage = (
            (present_days / total_days * 100) if total_days > 0 else 0
        )

        child_data['attendance_summary'] = {
            'total_days': total_days,
            'present_days': present_days,
            'absent_days': total_days - present_days,
            'percentage': round(attendance_percentage, 2)
        }

        # Add grades summary
        grades = Grade.objects.filter(student=child)
        child_data['grades_summary'] = {
            'total_grades': grades.count(),
            'average_grade': grades.aggregate(
                Avg('grade_percentage')
            )['grade_percentage__avg'] or 0
        }

        return Response(child_data)


class ChildAttendanceView(APIView):
    """View child's attendance records"""
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            child = Student.objects.get(
                id=child_id,
                parent_user=request.user
            )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Child not found or not linked to this parent.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get attendance with filters
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        attendance = Attendance.objects.filter(student=child)

        if month:
            attendance = attendance.filter(date__month=month)
        if year:
            attendance = attendance.filter(date__year=year)

        attendance = attendance.order_by('-date')

        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)


class ChildGradesView(APIView):
    """View child's grades and performance"""
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            child = Student.objects.get(
                id=child_id,
                parent_user=request.user
            )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Child not found or not linked to this parent.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get grades with filters
        subject = request.query_params.get('subject')
        semester = request.query_params.get('semester')

        grades = Grade.objects.filter(student=child).select_related('subject')

        if subject:
            grades = grades.filter(subject__code=subject)
        if semester:
            grades = grades.filter(semester=semester)

        grades = grades.order_by('-created_at')

        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)


class ChildFeesView(APIView):
    """View child's fee structure and payment history"""
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            child = Student.objects.get(
                id=child_id,
                parent_user=request.user
            )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Child not found or not linked to this parent.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get fee structure
        fee_structures = FeeStructure.objects.filter(
            Q(class_name=child.class_name) | Q(is_general=True)
        )

        # Get payment history
        payments = FeePayment.objects.filter(
            student=child
        ).order_by('-payment_date')

        # Calculate totals
        total_fees = sum(fs.amount for fs in fee_structures)
        paid_amount = sum(
            p.amount for p in payments if p.status == 'paid'
        )
        pending_amount = total_fees - paid_amount

        response_data = {
            'fee_structures': FeeStructureSerializer(
                fee_structures, many=True
            ).data,
            'payments': FeePaymentSerializer(payments, many=True).data,
            'summary': {
                'total_fees': float(total_fees),
                'paid_amount': float(paid_amount),
                'pending_amount': float(pending_amount)
            }
        }

        return Response(response_data)


class ChildAssignmentsView(APIView):
    """View child's assignments and submissions"""
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            child = Student.objects.get(
                id=child_id,
                parent_user=request.user
            )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Child not found or not linked to this parent.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get assignments for child's class
        assignments = Assignment.objects.filter(
            class_assigned__name=child.class_name
        ).order_by('-due_date')

        # Get submissions
        submissions = AssignmentSubmission.objects.filter(
            student=child
        )

        # Create assignment data with submission status
        assignment_data = []
        for assignment in assignments:
            submission = submissions.filter(assignment=assignment).first()
            data = AssignmentSerializer(assignment).data
            data['submission_status'] = None
            data['submission_grade'] = None

            if submission:
                data['submission_status'] = submission.status
                data['submission_grade'] = submission.grade
                data['submitted_at'] = submission.submitted_at

            assignment_data.append(data)

        return Response(assignment_data)


class ParentMessagesView(APIView):
    """View and send messages to teachers/admin"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get messages where parent is sender or recipient
        messages = Message.objects.filter(
            Q(sender=request.user) | Q(recipient=request.user)
        ).order_by('-created_at')

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChildExamResultsView(APIView):
    """View child's exam results"""
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            child = Student.objects.get(
                id=child_id,
                parent_user=request.user
            )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Child not found or not linked to this parent.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get exam results
        results = ExamResult.objects.filter(
            student=child
        ).select_related('exam', 'subject').order_by('-exam__date')

        results_data = []
        for result in results:
            results_data.append({
                'exam_name': result.exam.name,
                'exam_date': result.exam.date,
                'subject': result.subject.title if result.subject else None,
                'marks_obtained': result.marks_obtained,
                'total_marks': result.total_marks,
                'percentage': (
                    (result.marks_obtained / result.total_marks * 100)
                    if result.total_marks > 0 else 0
                ),
                'grade': result.grade,
                'remarks': result.remarks
            })

        return Response(results_data)


class ChildAcademicSummaryView(APIView):
    """Comprehensive academic summary for a child"""
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            child = Student.objects.get(
                id=child_id,
                parent_user=request.user
            )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Child not found or not linked to this parent.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Attendance Summary
        attendance_records = Attendance.objects.filter(student=child)
        total_days = attendance_records.count()
        present_days = attendance_records.filter(status='present').count()
        absent_days = attendance_records.filter(status='absent').count()
        late_days = attendance_records.filter(status='late').count()

        # Grades Summary
        grades = Grade.objects.filter(student=child)
        avg_grade = grades.aggregate(Avg('grade_percentage'))['grade_percentage__avg'] or 0

        # Recent Grades
        recent_grades = Grade.objects.filter(
            student=child
        ).select_related('subject').order_by('-created_at')[:10]

        # Exam Results Summary
        exam_results = ExamResult.objects.filter(student=child)
        total_exams = exam_results.count()
        avg_exam_score = exam_results.aggregate(
            Avg('marks_obtained')
        )['marks_obtained__avg'] or 0

        # Assignments Summary
        assignments = Assignment.objects.filter(
            class_assigned__name=child.class_name
        )
        submissions = AssignmentSubmission.objects.filter(student=child)
        submitted_count = submissions.filter(status='submitted').count()
        graded_count = submissions.filter(status='graded').count()
        
        # Fee Summary
        fee_structures = FeeStructure.objects.filter(
            Q(class_name=child.class_name) | Q(is_general=True)
        )
        total_fees = sum(fs.amount for fs in fee_structures)
        
        payments = FeePayment.objects.filter(student=child, status='paid')
        paid_amount = payments.aggregate(Sum('amount'))['amount__sum'] or 0
        pending_amount = total_fees - paid_amount

        summary = {
            'student_info': {
                'id': child.id,
                'name': child.get_full_name(),
                'roll_no': child.roll_no,
                'class': child.class_name,
                'is_active': child.is_active
            },
            'attendance': {
                'total_days': total_days,
                'present': present_days,
                'absent': absent_days,
                'late': late_days,
                'percentage': round((present_days / total_days * 100) if total_days > 0 else 0, 2)
            },
            'grades': {
                'average_percentage': round(avg_grade, 2),
                'total_grades': grades.count(),
                'recent_grades': [
                    {
                        'subject': g.subject.title if g.subject else 'N/A',
                        'grade_letter': g.grade_letter,
                        'percentage': float(g.grade_percentage),
                        'date': g.created_at
                    } for g in recent_grades
                ]
            },
            'exams': {
                'total_exams': total_exams,
                'average_score': round(avg_exam_score, 2)
            },
            'assignments': {
                'total_assigned': assignments.count(),
                'submitted': submitted_count,
                'graded': graded_count,
                'pending': assignments.count() - submitted_count
            },
            'fees': {
                'total_fees': float(total_fees),
                'paid': float(paid_amount),
                'pending': float(pending_amount),
                'status': 'Paid' if pending_amount <= 0 else 'Pending'
            }
        }

        return Response(summary)


class ParentTeacherCommunicationView(APIView):
    """Get teachers for messaging"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all children of this parent
        children = Student.objects.filter(parent_user=request.user)
        
        # Get unique teachers from children's classes
        teachers = Teacher.objects.filter(
            assigned_classrooms__name__in=[c.class_name for c in children]
        ).select_related('user').distinct()

        teachers_data = [
            {
                'id': t.user.id,
                'name': t.get_full_name(),
                'subject': t.subject,
                'email': t.user.email,
                'phone': t.phone
            } for t in teachers
        ]

        return Response(teachers_data)


class ParentNotificationsView(APIView):
    """Get parent-specific notifications"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'parent':
            return Response(
                {'error': 'Access denied. Parent role required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        children = Student.objects.filter(parent_user=request.user)
        
        notifications = []
        
        # Check for pending fees
        for child in children:
            fee_structures = FeeStructure.objects.filter(
                Q(class_name=child.class_name) | Q(is_general=True)
            )
            total_fees = sum(fs.amount for fs in fee_structures)
            
            payments = FeePayment.objects.filter(child=child, status='paid')
            paid_amount = payments.aggregate(Sum('amount'))['amount__sum'] or 0
            
            if total_fees > paid_amount:
                notifications.append({
                    'type': 'fee_pending',
                    'child': child.get_full_name(),
                    'message': f'Pending fee: ${total_fees - paid_amount}',
                    'priority': 'high'
                })
        
        # Check for upcoming exams
        upcoming_exams = Exam.objects.filter(
            date__gte=timezone.now().date(),
            date__lte=(timezone.now() + timedelta(days=7)).date()
        )
        
        for exam in upcoming_exams:
            notifications.append({
                'type': 'exam_upcoming',
                'message': f'Exam "{exam.name}" on {exam.date}',
                'priority': 'medium'
            })
        
        # Check for unsubmitted assignments
        for child in children:
            assignments = Assignment.objects.filter(
                class_assigned__name=child.class_name,
                due_date__gte=timezone.now().date()
            )
            
            submissions = AssignmentSubmission.objects.filter(
                student=child,
                assignment__in=assignments
            )
            
            submitted_ids = submissions.values_list('assignment_id', flat=True)
            unsubmitted = assignments.exclude(id__in=submitted_ids)
            
            for assignment in unsubmitted:
                notifications.append({
                    'type': 'assignment_pending',
                    'child': child.get_full_name(),
                    'message': f'Assignment "{assignment.title}" due on {assignment.due_date}',
                    'priority': 'medium'
                })
        
        # Get recent announcements
        announcements = Announcement.objects.filter(
            is_active=True
        ).order_by('-created_at')[:5]
        
        for announcement in announcements:
            notifications.append({
                'type': 'announcement',
                'message': announcement.title,
                'content': announcement.content,
                'priority': 'low',
                'date': announcement.created_at
            })
        
        return Response({
            'notifications': notifications,
            'total_count': len(notifications)
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_children_list(request):
    """Get list of all children for the parent"""
    if request.user.role != 'parent':
        return Response(
            {'error': 'Access denied. Parent role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    children = Student.objects.filter(
        parent_user=request.user
    ).select_related('user')
    
    children_data = [
        {
            'id': child.id,
            'name': child.get_full_name(),
            'roll_no': child.roll_no,
            'class': child.class_name,
            'is_active': child.is_active,
            'attendance_percentage': float(child.attendance_percentage)
        } for child in children
    ]
    
    return Response(children_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_to_teacher(request):
    """Send message to teacher"""
    if request.user.role != 'parent':
        return Response(
            {'error': 'Access denied. Parent role required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    teacher_id = request.data.get('teacher_id')
    subject = request.data.get('subject')
    content = request.data.get('content')
    child_id = request.data.get('child_id')
    
    if not all([teacher_id, subject, content]):
        return Response(
            {'error': 'teacher_id, subject, and content are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        teacher_user = User.objects.get(id=teacher_id, role='teacher')
    except User.DoesNotExist:
        return Response(
            {'error': 'Teacher not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create message
    message = Message.objects.create(
        sender=request.user,
        recipient=teacher_user,
        subject=subject,
        content=content
    )
    
    return Response(
        MessageSerializer(message).data,
        status=status.HTTP_201_CREATED
    )
