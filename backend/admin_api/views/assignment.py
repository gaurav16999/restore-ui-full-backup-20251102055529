from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from admin_api.models import Assignment, AssignmentSubmission
from admin_api.serializers import AssignmentSerializer, AssignmentSubmissionSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'subject__title', 'class_assigned__name']
    ordering_fields = ['due_date', 'assigned_date', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by class
        class_id = self.request.query_params.get('class_id')
        if class_id:
            queryset = queryset.filter(class_assigned_id=class_id)

        # Filter by subject
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        # Filter by teacher
        teacher_id = self.request.query_params.get('teacher_id')
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Get all submissions for this assignment"""
        assignment = self.get_object()
        submissions = assignment.submissions.all()
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'student__user__first_name',
        'student__user__last_name',
        'student__roll_no']
    ordering_fields = ['submission_date', 'marks_obtained']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by student
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # Filter by assignment
        assignment_id = self.request.query_params.get('assignment_id')
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)

        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Grade a submission"""
        submission = self.get_object()

        marks = request.data.get('marks_obtained')
        feedback = request.data.get('feedback', '')

        if marks is None:
            return Response(
                {'error': 'marks_obtained is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            marks = float(marks)
            if marks < 0 or marks > submission.assignment.max_marks:
                return Response(
                    {'error': f'Marks must be between 0 and {submission.assignment.max_marks}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            submission.marks_obtained = marks
            submission.feedback = feedback
            submission.status = 'graded'
            submission.graded_by = request.user.teacher_profile
            submission.graded_at = timezone.now()
            submission.save()

            serializer = self.get_serializer(submission)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
