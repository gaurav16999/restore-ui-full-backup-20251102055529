from rest_framework import serializers
from django.db.models import Avg
from ..models import Report, Student, ClassRoom, Grade, Attendance


class ReportSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(
        source='classroom.name', read_only=True)
    subject_title = serializers.CharField(
        source='subject.title', read_only=True)
    generated_by_name = serializers.CharField(
        source='generated_by.get_full_name', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'report_type',
            'title',
            'student',
            'classroom',
            'subject',
            'term',
            'total_students',
            'average_grade',
            'attendance_percentage',
            'start_date',
            'end_date',
            'report_data',
            'generated_by',
            'student_name',
            'classroom_name',
            'subject_title',
            'generated_by_name',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'generated_by']


class StudentReportSerializer(serializers.Serializer):
    """Serializer for generating student performance reports"""
    student_id = serializers.IntegerField()
    term = serializers.ChoiceField(choices=Grade.TERM_CHOICES, required=False)
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    def validate(self, data):
        """Validate report parameters"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                "Start date must be before end date.")

        # Validate student exists
        try:
            Student.objects.get(id=data['student_id'])
        except Student.DoesNotExist:
            raise serializers.ValidationError("Student not found.")

        return data

    def generate_report(self, validated_data, user):
        """Generate comprehensive student report"""
        student = Student.objects.get(id=validated_data['student_id'])
        start_date = validated_data['start_date']
        end_date = validated_data['end_date']
        term = validated_data.get('term')

        # Get grades data
        grades_queryset = Grade.objects.filter(
            student=student,
            date_recorded__range=[start_date, end_date]
        )
        if term:
            grades_queryset = grades_queryset.filter(term=term)

        grades = grades_queryset.select_related('subject')

        # Get attendance data
        attendance = Attendance.objects.filter(
            student=student,
            date__range=[start_date, end_date]
        ).select_related('class_section')

        # Calculate statistics
        total_grades = grades.count()
        average_grade = grades.aggregate(
            avg=Avg('score')
        )['avg'] or 0

        total_attendance = attendance.count()
        present_count = attendance.filter(status='present').count()
        attendance_percentage = (
            present_count /
            total_attendance *
            100) if total_attendance > 0 else 0

        # Subject-wise performance
        subject_performance = {}
        for grade in grades:
            subject_name = grade.subject.title
            if subject_name not in subject_performance:
                subject_performance[subject_name] = {
                    'grades': [],
                    'average': 0,
                    'letter_grade': 'N/A'
                }
            subject_performance[subject_name]['grades'].append({
                'score': float(grade.score),
                'max_score': float(grade.max_score),
                'percentage': grade.percentage,
                'grade_type': grade.grade_type,
                'date': grade.date_recorded.isoformat()
            })

        # Calculate subject averages
        for subject, data in subject_performance.items():
            if data['grades']:
                avg_percentage = sum(g['percentage']
                                     for g in data['grades']) / len(data['grades'])
                data['average'] = round(avg_percentage, 2)
                data['letter_grade'] = self._get_letter_grade(avg_percentage)

        # Create report data
        report_data = {
            'student_info': {
                'name': student.get_full_name(),
                'roll_no': student.roll_no,
                'class': student.class_name
            },
            'summary': {
                'total_grades': total_grades,
                'average_grade': round(average_grade, 2),
                'attendance_percentage': round(attendance_percentage, 2),
                'total_classes': total_attendance,
                'present_days': present_count,
                'absent_days': total_attendance - present_count
            },
            'subject_performance': subject_performance,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'term': term or 'All Terms'
            }
        }

        # Create and save report
        report = Report.objects.create(
            report_type='student',
            title=f"Student Report - {student.get_full_name()} ({start_date} to {end_date})",
            student=student,
            term=term,
            total_students=1,
            average_grade=average_grade,
            attendance_percentage=attendance_percentage,
            start_date=start_date,
            end_date=end_date,
            report_data=report_data,
            generated_by=user
        )

        return report

    def _get_letter_grade(self, percentage):
        """Convert percentage to letter grade"""
        if percentage >= 90:
            return 'A+'
        elif percentage >= 85:
            return 'A'
        elif percentage >= 80:
            return 'B+'
        elif percentage >= 75:
            return 'B'
        elif percentage >= 70:
            return 'C+'
        elif percentage >= 65:
            return 'C'
        elif percentage >= 60:
            return 'D'
        else:
            return 'F'


class ClassReportSerializer(serializers.Serializer):
    """Serializer for generating class performance reports"""
    classroom_id = serializers.IntegerField()
    term = serializers.ChoiceField(choices=Grade.TERM_CHOICES, required=False)
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    def validate(self, data):
        """Validate report parameters"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                "Start date must be before end date.")

        # Validate classroom exists
        try:
            ClassRoom.objects.get(id=data['classroom_id'])
        except ClassRoom.DoesNotExist:
            raise serializers.ValidationError("Classroom not found.")

        return data
