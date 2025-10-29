from rest_framework import serializers
from admin_api.models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_no = serializers.CharField(source='student.roll_no', read_only=True)
    class_name = serializers.CharField(source='class_section.name', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'student', 'class_section', 'date', 'status', 'student_name', 'roll_no', 'class_name']
        read_only_fields = ['id', 'student_name', 'roll_no', 'class_name']


class AttendanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['student', 'class_section', 'date', 'status']
        
    def validate(self, data):
        """
        Check if an attendance record already exists for the given student, class, and date.
        """
        student = data.get('student')
        class_section = data.get('class_section')
        date = data.get('date')

        if student and class_section and date:
            exists = Attendance.objects.filter(
                student=student,
                class_section=class_section,
                date=date
            ).exists()

            if exists:
                raise serializers.ValidationError({
                    'detail': 'Attendance record already exists for this student on this date.'
                })

        return data