from rest_framework import serializers
from ..models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(
        source='student.roll_no', read_only=True)
    classroom_name = serializers.CharField(
        source='classroom.name', read_only=True)
    classroom_grade = serializers.CharField(
        source='classroom.grade_level', read_only=True)
    classroom_section = serializers.CharField(
        source='classroom.section', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'classroom', 'enrollment_date', 'is_active',
            'student_name', 'student_roll_no', 'classroom_name',
            'classroom_grade', 'classroom_section'
        ]
        read_only_fields = ['enrollment_date']

    def validate(self, data):
        """Ensure student is not already enrolled in the same classroom"""
        student = data.get('student')
        classroom = data.get('classroom')

        if student and classroom:
            existing = Enrollment.objects.filter(
                student=student,
                classroom=classroom,
                is_active=True
            ).exclude(pk=self.instance.pk if self.instance else None)

            if existing.exists():
                raise serializers.ValidationError(
                    "Student is already enrolled in this classroom."
                )

        return data


class EnrollmentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing enrollments"""
    student_name = serializers.CharField(
        source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(
        source='classroom.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student_name',
            'classroom_name',
            'enrollment_date',
            'is_active']


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new enrollments"""

    class Meta:
        model = Enrollment
        fields = ['student', 'classroom', 'is_active']

    def validate(self, data):
        """Validate enrollment creation"""
        student = data.get('student')
        classroom = data.get('classroom')

        # Check if student is already enrolled in this classroom
        if Enrollment.objects.filter(
            student=student,
            classroom=classroom,
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                "Student is already enrolled in this classroom."
            )

        return data
