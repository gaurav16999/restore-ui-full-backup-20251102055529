"""
Assignment submission, grading, and feedback views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db import models
from admin_api.models import Homework, HomeworkSubmission, Student
from admin_api.serializers import HomeworkSubmissionSerializer
from django.core.files.storage import default_storage
from django.conf import settings
import os


class HomeworkSubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for homework submissions
    """
    serializer_class = HomeworkSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'admin':
            return HomeworkSubmission.objects.all()
        elif user.role == 'teacher':
            # Teacher can see submissions for their assigned classes
            return HomeworkSubmission.objects.filter(
                homework__class_assigned__teacher=user.teacher_profile
            )
        elif user.role == 'student':
            # Student can only see their own submissions
            return HomeworkSubmission.objects.filter(student__user=user)

        return HomeworkSubmission.objects.none()

    @action(detail=False, methods=['post'],
            parser_classes=[MultiPartParser, FormParser])
    def submit(self, request):
        """
        Submit homework with file upload
        """
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can submit homework'},
                status=status.HTTP_403_FORBIDDEN
            )

        homework_id = request.data.get('homework_id')
        submission_text = request.data.get('submission_text', '')
        file = request.FILES.get('file')

        if not homework_id:
            return Response(
                {'error': 'homework_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            homework = Homework.objects.get(id=homework_id)
            student = Student.objects.get(user=request.user)

            # Check if already submitted
            existing = HomeworkSubmission.objects.filter(
                homework=homework,
                student=student
            ).first()

            if existing and not homework.allow_resubmission:
                return Response(
                    {'error': 'You have already submitted this homework'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check deadline
            if homework.due_date and timezone.now().date() > homework.due_date:
                # Allow late submission but mark as late
                is_late = True
            else:
                is_late = False

            # Handle file upload
            file_path = None
            if file:
                # Validate file type
                file_ext = os.path.splitext(file.name)[1].lower()
                allowed_types = settings.ALLOWED_FILE_TYPES

                if file_ext.replace('.', '') not in allowed_types:
                    return Response(
                        {'error': f'File type {file_ext} not allowed'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Validate file size
                if file.size > settings.MAX_UPLOAD_SIZE:
                    return Response(
                        {'error': 'File size exceeds maximum allowed size'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Save file
                file_name = f'homework_submissions/{student.id}/{homework.id}/{file.name}'
                file_path = default_storage.save(file_name, file)

            # Create or update submission
            if existing:
                existing.submission_text = submission_text
                if file_path:
                    existing.file_path = file_path
                existing.submitted_at = timezone.now()
                existing.is_late = is_late
                existing.status = 'resubmitted'
                existing.save()
                submission = existing
            else:
                submission = HomeworkSubmission.objects.create(
                    homework=homework,
                    student=student,
                    submission_text=submission_text,
                    file_path=file_path,
                    is_late=is_late,
                    status='submitted'
                )

            serializer = self.get_serializer(submission)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Homework.DoesNotExist:
            return Response(
                {'error': 'Homework not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Submission failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """
        Grade a submission (teacher/admin only)
        """
        if request.user.role not in ['teacher', 'admin']:
            return Response(
                {'error': 'Only teachers and admins can grade submissions'},
                status=status.HTTP_403_FORBIDDEN
            )

        submission = self.get_object()
        marks_obtained = request.data.get('marks_obtained')
        feedback = request.data.get('feedback', '')

        if marks_obtained is None:
            return Response(
                {'error': 'marks_obtained is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            marks_obtained = float(marks_obtained)
            if marks_obtained < 0 or marks_obtained > submission.homework.total_marks:
                return Response(
                    {'error': f'Marks must be between 0 and {submission.homework.total_marks}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            submission.marks_obtained = marks_obtained
            submission.feedback = feedback
            submission.graded_by = request.user
            submission.graded_at = timezone.now()
            submission.status = 'graded'
            submission.save()

            serializer = self.get_serializer(submission)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ValueError:
            return Response(
                {'error': 'Invalid marks value'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def my_submissions(self, request):
        """
        Get current student's submissions
        """
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(user=request.user)
            submissions = HomeworkSubmission.objects.filter(student=student)
            serializer = self.get_serializer(submissions, many=True)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def pending_grading(self, request):
        """
        Get submissions pending grading (teacher/admin)
        """
        if request.user.role not in ['teacher', 'admin']:
            return Response(
                {'error': 'Only teachers and admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        submissions = self.get_queryset().filter(
            status__in=['submitted', 'resubmitted']
        )
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def homework_statistics(request, homework_id):
    """
    Get statistics for a specific homework assignment
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        homework = Homework.objects.get(id=homework_id)
        submissions = HomeworkSubmission.objects.filter(homework=homework)

        total_students = Student.objects.filter(
            grade=homework.class_assigned.grade,
            section=homework.class_assigned.section
        ).count()

        stats = {
            'total_students': total_students, 'submitted_count': submissions.filter(
                status__in=[
                    'submitted', 'resubmitted', 'graded']).count(), 'graded_count': submissions.filter(
                status='graded').count(), 'pending_count': submissions.filter(
                    status__in=[
                        'submitted', 'resubmitted']).count(), 'late_submissions': submissions.filter(
                            is_late=True).count(), 'average_marks': submissions.filter(
                                status='graded').aggregate(
                avg_marks=models.Avg('marks_obtained'))['avg_marks'] or 0, }

        return Response(stats)

    except Homework.DoesNotExist:
        return Response(
            {'error': 'Homework not found'},
            status=status.HTTP_404_NOT_FOUND
        )
