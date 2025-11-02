from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from django.utils import timezone

from ..models import Report, Student, ClassRoom, Subject, Grade, Attendance, Teacher
from ..serializers import (
    ReportSerializer, StudentReportSerializer
)


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing and generating reports
    """
    queryset = Report.objects.all().select_related(
        'student__user', 'classroom', 'subject', 'generated_by'
    )
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer

    def get_queryset(self):
        queryset = self.queryset

        # Filter by report type
        report_type = self.request.query_params.get('report_type')
        if report_type:
            queryset = queryset.filter(report_type=report_type)

        # Filter by student
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # Filter by classroom
        classroom_id = self.request.query_params.get('classroom')
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)

        # Filter by term
        term = self.request.query_params.get('term')
        if term:
            queryset = queryset.filter(term=term)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Create report with current user as generator"""
        serializer.save(generated_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate_student_report(self, request):
        """Generate a comprehensive student performance report"""
        serializer = StudentReportSerializer(data=request.data)
        if serializer.is_valid():
            try:
                report = serializer.generate_report(
                    serializer.validated_data, request.user)
                return Response(
                    ReportSerializer(report).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': f'Failed to generate report: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get report statistics for dashboard"""
        total_reports = Report.objects.count()
        reports_this_month = Report.objects.filter(
            created_at__month=timezone.now().month,
            created_at__year=timezone.now().year
        ).count()

        # Reports by type
        report_types = Report.objects.values('report_type').annotate(
            count=Count('id')
        )

        # Recent reports
        recent_reports = Report.objects.order_by('-created_at')[:5]

        return Response({
            'total_reports': total_reports,
            'reports_this_month': reports_this_month,
            'report_types': list(report_types),
            'recent_reports': ReportSerializer(recent_reports, many=True).data
        })


class ReportsView(generics.RetrieveAPIView):
    """Legacy reports view - enhanced with new functionality"""

    def get(self, request, *args, **kwargs):
        try:
            # Get query parameters
            report_type = request.query_params.get('type', 'overview')
            student_id = request.query_params.get('student_id')
            classroom_id = request.query_params.get('classroom_id')

            if report_type == 'student' and student_id:
                return self._get_student_report(student_id)
            elif report_type == 'classroom' and classroom_id:
                return self._get_classroom_report(classroom_id)
            else:
                return self._get_overview_report()

        except Exception as e:
            return Response({
                'error': f'Failed to generate report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_student_report(self, student_id):
        """Generate individual student report"""
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'},
                            status=status.HTTP_404_NOT_FOUND)

        # Calculate student's average grade
        student_grades = Grade.objects.filter(student=student)
        avg_score = student_grades.aggregate(Avg('score'))['score__avg'] or 0

        # Calculate attendance rate
        student_attendance = Attendance.objects.filter(student=student)
        total_attendance = student_attendance.count()
        present_count = student_attendance.filter(status='present').count()
        attendance_rate = (
            present_count /
            total_attendance *
            100) if total_attendance > 0 else 0

        # Get subjects and their averages
        subjects = []
        for subject in Subject.objects.all():
            subject_grades = student_grades.filter(subject=subject)
            if subject_grades.exists():
                subject_avg = subject_grades.aggregate(
                    Avg('score'))['score__avg'] or 0
                subjects.append({
                    'name': subject.title,
                    'code': subject.code,
                    'average': round(subject_avg, 2),
                    'grades_count': subject_grades.count()
                })

        return Response({
            'type': 'student',
            'student': {
                'id': student.id,
                'name': student.get_full_name(),
                'roll_no': student.roll_no,
                'class': student.class_name,
                'email': student.user.email
            },
            'performance': {
                'overall_average': round(avg_score, 2),
                'attendance_rate': round(attendance_rate, 2),
                'total_grades': student_grades.count(),
                'total_attendance_records': total_attendance
            },
            'subjects': subjects,
            'generated_at': timezone.now()
        })

    def _get_classroom_report(self, classroom_id):
        """Generate classroom performance report"""
        try:
            classroom = ClassRoom.objects.get(id=classroom_id)
        except ClassRoom.DoesNotExist:
            return Response({'error': 'Classroom not found'},
                            status=status.HTTP_404_NOT_FOUND)

        # Get all students in the classroom
        students = Student.objects.filter(
            enrollments__classroom=classroom,
            enrollments__is_active=True
        ).distinct()

        classroom_data = {
            'id': classroom.id,
            'name': classroom.name,
            'grade_level': classroom.grade_level,
            'section': classroom.section,
            'teacher': classroom.assigned_teacher.get_full_name() if classroom.assigned_teacher else None,
            'total_students': students.count()}

        # Calculate classroom statistics
        all_grades = Grade.objects.filter(student__in=students)
        class_avg = all_grades.aggregate(Avg('score'))['score__avg'] or 0

        all_attendance = Attendance.objects.filter(student__in=students)
        total_attendance_records = all_attendance.count()
        present_records = all_attendance.filter(status='present').count()
        class_attendance = (
            present_records /
            total_attendance_records *
            100) if total_attendance_records > 0 else 0

        # Student performance in this classroom
        student_performance = []
        for student in students:
            student_grades = all_grades.filter(student=student)
            student_attendance = all_attendance.filter(student=student)

            student_avg = student_grades.aggregate(
                Avg('score'))['score__avg'] or 0
            student_present = student_attendance.filter(
                status='present').count()
            student_total = student_attendance.count()
            student_attendance_rate = (
                student_present /
                student_total *
                100) if student_total > 0 else 0

            student_performance.append({
                'id': student.id,
                'name': student.get_full_name(),
                'roll_no': student.roll_no,
                'average_grade': round(student_avg, 2),
                'attendance_rate': round(student_attendance_rate, 2),
                'grades_count': student_grades.count()
            })

        return Response({
            'type': 'classroom',
            'classroom': classroom_data,
            'performance': {
                'class_average': round(class_avg, 2),
                'class_attendance_rate': round(class_attendance, 2),
                'total_grades_recorded': all_grades.count(),
                'total_attendance_records': total_attendance_records
            },
            'students': student_performance,
            'generated_at': timezone.now()
        })

    def _get_overview_report(self):
        """Generate overview report with system statistics"""
        # Basic statistics
        total_students = Student.objects.filter(is_active=True).count()
        total_teachers = Teacher.objects.filter(is_active=True).count()
        total_classrooms = ClassRoom.objects.filter(is_active=True).count()
        total_subjects = Subject.objects.filter(is_active=True).count()

        # Grade statistics
        all_grades = Grade.objects.all()
        overall_avg = all_grades.aggregate(Avg('score'))['score__avg'] or 0
        total_grades = all_grades.count()

        # Attendance statistics
        all_attendance = Attendance.objects.all()
        total_attendance_records = all_attendance.count()
        present_records = all_attendance.filter(status='present').count()
        overall_attendance = (
            present_records /
            total_attendance_records *
            100) if total_attendance_records > 0 else 0

        # Grade distribution
        grade_distribution = []
        for letter in ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']:
            if letter == 'A+':
                count = all_grades.filter(score__gte=90).count()
            elif letter == 'A':
                count = all_grades.filter(score__gte=85, score__lt=90).count()
            elif letter == 'B+':
                count = all_grades.filter(score__gte=80, score__lt=85).count()
            elif letter == 'B':
                count = all_grades.filter(score__gte=75, score__lt=80).count()
            elif letter == 'C+':
                count = all_grades.filter(score__gte=70, score__lt=75).count()
            elif letter == 'C':
                count = all_grades.filter(score__gte=65, score__lt=70).count()
            elif letter == 'D':
                count = all_grades.filter(score__gte=60, score__lt=65).count()
            else:  # F
                count = all_grades.filter(score__lt=60).count()

            grade_distribution.append({'grade': letter, 'count': count, 'percentage': round(
                (count / total_grades * 100), 2) if total_grades > 0 else 0})

        return Response({
            'type': 'overview',
            'summary': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_classrooms': total_classrooms,
                'total_subjects': total_subjects,
                'overall_average_grade': round(overall_avg, 2),
                'overall_attendance_rate': round(overall_attendance, 2),
                'total_grades_recorded': total_grades,
                'total_attendance_records': total_attendance_records
            },
            'grade_distribution': grade_distribution,
            'generated_at': timezone.now()
        })
