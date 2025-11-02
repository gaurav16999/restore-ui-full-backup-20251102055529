"""
Parent portal views and APIs
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from admin_api.models import (
    Student, Attendance, AssignmentSubmission,
    ExamResult, FeePayment, Announcement, Teacher
)
from users.models import User


class ParentPortalViewSet(viewsets.ViewSet):
    """
    ViewSet for parent portal functionality
    """
    permission_classes = [IsAuthenticated]

    def get_children(self, request):
        """Get list of children for the parent"""
        if request.user.role != 'parent':
            return Response(
                {'error': 'Only parents can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get children linked to this parent
        children = Student.objects.filter(parent_user=request.user)

        data = []
        for child in children:
            data.append(
                {
                    'id': child.id,
                    'name': child.user.get_full_name(),
                    'student_id': child.student_id,
                    'grade': child.grade.name if child.grade else None,
                    'section': child.section.name if child.section else None,
                    'profile_picture': child.user.profile_picture.url if hasattr(
                        child.user,
                        'profile_picture') and child.user.profile_picture else None,
                })

        return Response(data)

    @action(detail=True, methods=['get'])
    def child_overview(self, request, pk=None):
        """Get comprehensive overview of a child"""
        if request.user.role != 'parent':
            return Response(
                {'error': 'Only parents can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(id=pk, parent_user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found or not linked to your account'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get attendance statistics
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        attendance = Attendance.objects.filter(
            student=student,
            date__gte=thirty_days_ago
        )
        attendance_stats = {
            'total_days': attendance.count(),
            'present_days': attendance.filter(status='present').count(),
            'absent_days': attendance.filter(status='absent').count(),
            'late_days': attendance.filter(status='late').count(),
            'percentage': 0
        }
        if attendance_stats['total_days'] > 0:
            attendance_stats['percentage'] = round(
                (attendance_stats['present_days'] / attendance_stats['total_days']) * 100, 2)

        # Get recent assignments
        recent_assignments = AssignmentSubmission.objects.filter(
            student=student
        ).order_by('-submission_date')[:5]

        assignment_data = []
        for sub in recent_assignments:
            assignment_data.append({
                'title': sub.assignment.title,
                'subject': sub.assignment.subject.name,
                'due_date': sub.assignment.due_date,
                'submitted_date': sub.submission_date,
                'status': sub.status,
                'marks_obtained': sub.marks_obtained,
                'max_marks': sub.assignment.max_marks,
                'feedback': sub.feedback,
            })

        # Get recent exam results
        recent_exams = ExamResult.objects.filter(
            student=student
        ).order_by('-exam__exam_date')[:5]

        exam_data = []
        for result in recent_exams:
            exam_data.append({
                'exam_name': result.exam.name,
                'subject': result.subject.name,
                'marks_obtained': result.marks_obtained,
                'total_marks': result.exam.total_marks,
                'percentage': result.percentage,
                'grade': result.grade,
                'exam_date': result.exam.exam_date,
            })

        # Get fee status
        fee_payments = FeePayment.objects.filter(student=student)
        total_paid = sum(
            payment.amount for payment in fee_payments if payment.status == 'completed')
        pending_fees = FeePayment.objects.filter(
            student=student,
            status='pending'
        ).count()

        data = {
            'student': {
                'id': student.id,
                'name': student.user.get_full_name(),
                'student_id': student.student_id,
                'grade': student.grade.name if student.grade else None,
                'section': student.section.name if student.section else None,
                'date_of_birth': student.date_of_birth,
                'enrollment_date': student.enrollment_date,
            },
            'attendance': attendance_stats,
            'recent_assignments': assignment_data,
            'recent_exams': exam_data,
            'fees': {
                'total_paid': total_paid,
                'pending_count': pending_fees,
            }
        }

        return Response(data)

    @action(detail=True, methods=['get'])
    def attendance_history(self, request, pk=None):
        """Get detailed attendance history"""
        if request.user.role != 'parent':
            return Response(
                {'error': 'Only parents can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(id=pk, parent_user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get month from query params (default to current month)
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)

        attendance = Attendance.objects.filter(
            student=student,
            date__month=month,
            date__year=year
        ).order_by('-date')

        data = []
        for record in attendance:
            data.append({
                'date': record.date,
                'status': record.status,
                'remarks': record.remarks,
            })

        return Response(data)

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        """Get all assignments for a student"""
        if request.user.role != 'parent':
            return Response(
                {'error': 'Only parents can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(id=pk, parent_user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        submissions = AssignmentSubmission.objects.filter(student=student)

        data = []
        for sub in submissions:
            data.append({
                'id': sub.id,
                'title': sub.assignment.title,
                'description': sub.assignment.description,
                'subject': sub.assignment.subject.name,
                'assigned_date': sub.assignment.assigned_date,
                'due_date': sub.assignment.due_date,
                'submitted_date': sub.submission_date if sub.status != 'pending' else None,
                'status': sub.status,
                'marks_obtained': sub.marks_obtained,
                'max_marks': sub.assignment.max_marks,
                'feedback': sub.feedback,
                'is_late': sub.is_late,
            })

        return Response(data)

    @action(detail=True, methods=['get'])
    def exam_results(self, request, pk=None):
        """Get exam results for a student"""
        if request.user.role != 'parent':
            return Response(
                {'error': 'Only parents can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(id=pk, parent_user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        results = ExamResult.objects.filter(
            student=student).order_by('-exam__exam_date')

        data = []
        for result in results:
            data.append({
                'id': result.id,
                'exam_name': result.exam.name,
                'exam_type': result.exam.exam_type,
                'subject': result.subject.name,
                'marks_obtained': result.marks_obtained,
                'total_marks': result.exam.total_marks,
                'percentage': result.percentage,
                'grade': result.grade,
                'rank': result.rank,
                'exam_date': result.exam.exam_date,
            })

        return Response(data)

    @action(detail=True, methods=['get'])
    def teachers(self, request, pk=None):
        """Get list of teachers for student's classes"""
        if request.user.role != 'parent':
            return Response(
                {'error': 'Only parents can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(id=pk, parent_user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get teachers for student's grade and section
        teachers = Teacher.objects.filter(
            created_assignments__class_assigned__grade=student.grade,
            created_assignments__class_assigned__section=student.section
        ).distinct()

        data = []
        for teacher in teachers:
            data.append({
                'id': teacher.id,
                'name': teacher.user.get_full_name(),
                'subject': teacher.subject.name if teacher.subject else None,
                'email': teacher.user.email,
                'phone': teacher.phone,
            })

        return Response(data)

    @action(detail=True, methods=['get'])
    def announcements(self, request, pk=None):
        """Get announcements relevant to student"""
        if request.user.role != 'parent':
            return Response(
                {'error': 'Only parents can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(id=pk, parent_user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get general and class-specific announcements
        announcements = Announcement.objects.filter(
            Q(target_audience='all') |
            Q(target_audience='parents') |
            Q(target_grade=student.grade)
        ).order_by('-created_at')[:20]

        data = []
        for ann in announcements:
            data.append({
                'id': ann.id,
                'title': ann.title,
                'content': ann.content,
                'created_at': ann.created_at,
                'is_important': getattr(ann, 'is_important', False),
            })

        return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def link_parent_to_student(request):
    """
    Link a parent account to a student account
    Admin only
    """
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only administrators can link parent accounts'},
            status=status.HTTP_403_FORBIDDEN
        )

    parent_email = request.data.get('parent_email')
    student_id = request.data.get('student_id')

    if not parent_email or not student_id:
        return Response(
            {'error': 'parent_email and student_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Get or create parent user
        parent_user, created = User.objects.get_or_create(
            email=parent_email,
            defaults={
                'username': parent_email.split('@')[0],
                'role': 'parent',
                'first_name': request.data.get('first_name', 'Parent'),
                'last_name': request.data.get('last_name', ''),
            }
        )

        if created:
            parent_user.set_password(request.data.get('password', 'parent123'))
            parent_user.save()

        # Link to student
        student = Student.objects.get(id=student_id)
        student.parent_user = parent_user
        student.save()

        return Response({
            'message': 'Parent linked successfully',
            'parent_email': parent_user.email,
            'student_name': student.user.get_full_name(),
        }, status=status.HTTP_200_OK)

    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to link parent: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
