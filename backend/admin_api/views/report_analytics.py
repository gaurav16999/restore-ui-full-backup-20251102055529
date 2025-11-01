from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from admin_api.models import Student, Grade, Class, Subject, Attendance
from decimal import Decimal


class ReportAnalyticsView(APIView):
    """
    Get comprehensive report analytics data
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get filter parameters
            class_filter = request.query_params.get('class', None)
            subject_filter = request.query_params.get('subject', None)
            period = request.query_params.get(
                'period', 'current')  # current, previous, all

            # Base querysets
            students_query = Student.objects.filter(is_active=True)
            if class_filter and class_filter != 'all':
                students_query = students_query.filter(class_name=class_filter)

            grades_query = Grade.objects.all()
            if subject_filter and subject_filter != 'all':
                grades_query = grades_query.filter(
                    subject__title=subject_filter)

            # Calculate analytics
            analytics = self._calculate_analytics(students_query, grades_query)

            # Get student reports
            student_reports = self._get_student_reports(
                students_query, grades_query)

            # Get class analytics
            class_analytics_data = self._get_class_analytics(grades_query)

            # Get grade distribution
            grade_distribution = self._get_grade_distribution(grades_query)

            # Get progress tracking
            progress_tracking = self._get_progress_tracking(students_query)

            return Response({
                'analytics': analytics,
                'student_reports': student_reports,
                'class_analytics': class_analytics_data,
                'grade_distribution': grade_distribution,
                'progress_tracking': progress_tracking,
                'filters': {
                    'classes': list(Class.objects.values_list('name', flat=True)),
                    'subjects': list(Subject.objects.values_list('title', flat=True)),
                }
            })
        except Exception as e:
            return Response({
                'error': str(e),
                'analytics': {},
                'student_reports': [],
                'class_analytics': [],
                'grade_distribution': [],
                'progress_tracking': []
            }, status=500)

    def _calculate_analytics(self, students_query, grades_query):
        """Calculate overall analytics"""
        # Class average
        avg_score = grades_query.aggregate(Avg('score'))['score__avg']
        if avg_score is None:
            avg_score = Decimal('0')

        # Get unique students with grades
        students_with_grades = students_query.filter(
            id__in=grades_query.values_list('student_id', flat=True)
        )

        # Top performers (90% and above average)
        top_performers = 0
        at_risk = 0
        improving = 0

        for student in students_with_grades:
            student_avg = grades_query.filter(
                student=student).aggregate(
                Avg('score'))['score__avg']
            if student_avg is None:
                student_avg = Decimal('0')

            if student_avg >= 90:
                top_performers += 1
            elif student_avg < 60:
                at_risk += 1

            # Check improvement (compare recent vs older grades)
            recent_grades = grades_query.filter(
                student=student).order_by('-created_at')[:3]
            older_grades = grades_query.filter(
                student=student).order_by('-created_at')[3:6]

            if recent_grades.exists() and older_grades.exists():
                recent_avg = recent_grades.aggregate(
                    Avg('score'))['score__avg'] or Decimal('0')
                older_avg = older_grades.aggregate(
                    Avg('score'))['score__avg'] or Decimal('0')
                if recent_avg > older_avg:
                    improving += 1

        total_students = students_with_grades.count()
        improvement_rate = (
            improving /
            total_students *
            100) if total_students > 0 else 0

        # Convert Decimal to float for JSON serialization
        avg_score_float = float(avg_score)
        trend_value = (avg_score_float - 75) * 0.1

        return {
            'class_average': round(avg_score_float, 1),
            'top_performers': top_performers,
            'at_risk': at_risk,
            'improvement_rate': round(improvement_rate, 1),
            'trend': round(trend_value, 1),
            'total_students': total_students,
            'total_grades': grades_query.count()
        }

    def _get_student_reports(self, students_query, grades_query):
        """Get individual student reports"""
        reports = []

        for student in students_query[:50]:  # Limit to 50 for performance
            student_grades = grades_query.filter(student=student)

            if not student_grades.exists():
                continue

            # Calculate averages
            overall_avg = student_grades.aggregate(Avg('score'))['score__avg']
            if overall_avg is None:
                overall_avg = Decimal('0')

            # Get attendance
            attendance_records = Attendance.objects.filter(student=student)
            total_attendance = attendance_records.count()
            present_count = attendance_records.filter(status='present').count()
            attendance_rate = (
                present_count /
                total_attendance *
                100) if total_attendance > 0 else 0

            # Determine grade letter
            grade_letter = self._get_letter_grade(float(overall_avg))

            # Calculate rank (simple version)
            rank = students_query.filter(
                id__in=grades_query.values('student').annotate(
                    avg_score=Avg('score')).filter(
                    avg_score__gt=overall_avg).values_list(
                    'student_id',
                    flat=True)).count() + 1

            reports.append({
                'id': student.id,
                'student': student.get_full_name(),
                'roll_no': student.roll_no,
                'class': student.class_name,
                'email': student.user.email if hasattr(student.user, 'email') else '',
                'overall_average': round(float(overall_avg), 1),
                'grade': grade_letter,
                'rank': rank,
                'attendance': round(attendance_rate, 1),
                'total_grades': student_grades.count(),
                'subjects_count': student_grades.values('subject').distinct().count()
            })

        # Sort by average descending
        reports.sort(key=lambda x: x['overall_average'], reverse=True)

        return reports

    def _get_class_analytics(self, grades_query):
        """Get class-wise analytics"""
        analytics = []

        for class_obj in Class.objects.all():
            class_students = Student.objects.filter(
                class_name=class_obj.name, is_active=True)
            class_grades = grades_query.filter(student__in=class_students)

            if not class_grades.exists():
                continue

            avg_score = class_grades.aggregate(Avg('score'))['score__avg']
            if avg_score is None:
                avg_score = Decimal('0')

            total_students = class_students.count()
            students_with_grades = class_students.filter(
                id__in=class_grades.values_list('student_id', flat=True)
            ).count()

            analytics.append({
                'class_name': class_obj.name,
                'average': round(float(avg_score), 1),
                'total_students': total_students,
                'active_students': students_with_grades,
                'total_grades': class_grades.count()
            })

        return analytics

    def _get_grade_distribution(self, grades_query):
        """Get grade distribution data"""
        distribution = {
            'A (90-100)': 0,
            'B (80-89)': 0,
            'C (70-79)': 0,
            'D (60-69)': 0,
            'F (<60)': 0
        }

        for grade in grades_query:
            score = grade.score
            if score >= 90:
                distribution['A (90-100)'] += 1
            elif score >= 80:
                distribution['B (80-89)'] += 1
            elif score >= 70:
                distribution['C (70-79)'] += 1
            elif score >= 60:
                distribution['D (60-69)'] += 1
            else:
                distribution['F (<60)'] += 1

        return [{'grade': k, 'count': v} for k, v in distribution.items()]

    def _get_progress_tracking(self, students_query):
        """Get student progress over time"""
        progress = []

        for student in students_query[:20]:  # Limit to 20 for performance
            student_grades = Grade.objects.filter(
                student=student).order_by('created_at')

            if student_grades.count() < 2:
                continue

            first_avg = student_grades[:3].aggregate(Avg('score'))[
                'score__avg']
            latest_avg = student_grades.reverse()[:3].aggregate(Avg('score'))[
                'score__avg']

            if first_avg is None:
                first_avg = Decimal('0')
            if latest_avg is None:
                latest_avg = Decimal('0')

            change = float(latest_avg) - float(first_avg)

            progress.append({
                'student': student.get_full_name(),
                'class': student.class_name,
                'initial_average': round(float(first_avg), 1),
                'current_average': round(float(latest_avg), 1),
                'change': round(change, 1),
                'trend': 'improving' if change > 0 else 'declining' if change < 0 else 'stable'
            })

        return progress

    def _get_letter_grade(self, score):
        """Convert numeric score to letter grade"""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
