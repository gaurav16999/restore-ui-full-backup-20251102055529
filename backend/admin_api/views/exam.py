from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg
from admin_api.models import Exam, ExamSchedule, ExamResult, Student
from admin_api.serializers import ExamSerializer, ExamScheduleSerializer, ExamResultSerializer, ExamResultCreateSerializer


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'exam_type', 'academic_year']
    ordering_fields = ['start_date', 'end_date', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by class
        class_id = self.request.query_params.get('class_id')
        if class_id:
            queryset = queryset.filter(class_assigned_id=class_id)

        # Filter by exam type
        exam_type = self.request.query_params.get('exam_type')
        if exam_type:
            queryset = queryset.filter(exam_type=exam_type)

        # Filter by academic year
        academic_year = self.request.query_params.get('academic_year')
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)

        return queryset

    @action(detail=True, methods=['get'])
    def results_summary(self, request, pk=None):
        """Get summary of exam results"""
        exam = self.get_object()
        results = ExamResult.objects.filter(exam=exam)

        total_students = Student.objects.filter(
            class_name=exam.class_assigned.name
        ).count()

        appeared = results.filter(is_absent=False).count()
        absent = results.filter(is_absent=True).count()
        passed = results.filter(is_absent=False,
                                marks_obtained__gte=exam.passing_marks).count()
        failed = appeared - passed

        avg_marks = results.filter(is_absent=False).aggregate(
            avg=Avg('marks_obtained')
        )['avg'] or 0

        return Response({
            'total_students': total_students,
            'appeared': appeared,
            'absent': absent,
            'passed': passed,
            'failed': failed,
            'pass_percentage': round((passed / appeared * 100), 2) if appeared > 0 else 0,
            'average_marks': round(float(avg_marks), 2)
        })


class ExamScheduleViewSet(viewsets.ModelViewSet):
    queryset = ExamSchedule.objects.all()
    serializer_class = ExamScheduleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['exam__name', 'subject__title']
    ordering_fields = ['date', 'start_time']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by exam
        exam_id = self.request.query_params.get('exam_id')
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)

        # Filter by subject
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        # Filter by date range
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset


class ExamResultViewSet(viewsets.ModelViewSet):
    queryset = ExamResult.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'student__user__first_name',
        'student__user__last_name',
        'student__roll_no']
    ordering_fields = ['created_at', 'marks_obtained']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExamResultCreateSerializer
        return ExamResultSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by student
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # Filter by exam
        exam_id = self.request.query_params.get('exam_id')
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)

        # Filter by subject
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        return queryset

    @action(detail=False, methods=['get'])
    def student_report(self, request):
        """Get detailed exam report for a student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        results = ExamResult.objects.filter(student_id=student_id)

        # Group by exam
        exams = {}
        for result in results:
            exam_name = result.exam.name
            if exam_name not in exams:
                exams[exam_name] = {
                    'exam_id': result.exam.id,
                    'exam_name': exam_name,
                    'subjects': [],
                    'total_marks': 0,
                    'marks_obtained': 0,
                    'percentage': 0
                }

            exams[exam_name]['subjects'].append({
                'subject': result.subject.title,
                'marks_obtained': float(result.marks_obtained),
                'max_marks': float(result.max_marks),
                'percentage': float(result.percentage),
                'grade': result.grade,
                'is_absent': result.is_absent
            })

            if not result.is_absent:
                exams[exam_name]['total_marks'] += float(result.max_marks)
                exams[exam_name]['marks_obtained'] += float(
                    result.marks_obtained)

        # Calculate percentages
        for exam_data in exams.values():
            if exam_data['total_marks'] > 0:
                exam_data['percentage'] = round(
                    (exam_data['marks_obtained'] / exam_data['total_marks']) * 100, 2)

        return Response(list(exams.values()))
