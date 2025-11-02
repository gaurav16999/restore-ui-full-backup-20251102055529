from rest_framework import serializers
from admin_api.models import TeacherAssignment


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source='teacher.user.get_full_name', read_only=True)
    teacher_employee_id = serializers.CharField(
        source='teacher.employee_id', read_only=True)
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    subject_title = serializers.CharField(
        source='subject.title', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = [
            'id',
            'teacher',
            'teacher_name',
            'teacher_employee_id',
            'class_assigned',
            'class_name',
            'subject',
            'subject_title',
            'subject_code',
            'assigned_date',
            'is_active'
        ]
        read_only_fields = ['assigned_date']

    def validate(self, data):
        """Validate that the assignment doesn't already exist"""
        teacher = data.get('teacher')
        class_assigned = data.get('class_assigned')
        subject = data.get('subject')

        # Check if assignment already exists (excluding current instance for
        # updates)
        existing = TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=class_assigned,
            subject=subject
        )

        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError(
                f"{
                    teacher.get_full_name()} is already assigned to teach {
                    subject.title} in {
                    class_assigned.name}")

        return data


class TeacherAssignmentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating assignments"""

    class Meta:
        model = TeacherAssignment
        fields = ['teacher', 'class_assigned', 'subject', 'is_active']

    def validate(self, data):
        """Validate that the assignment doesn't already exist"""
        teacher = data.get('teacher')
        class_assigned = data.get('class_assigned')
        subject = data.get('subject')

        if TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=class_assigned,
            subject=subject
        ).exists():
            raise serializers.ValidationError(
                f"This teacher is already assigned to teach this subject in this class")

        return data


class TeacherAssignmentListSerializer(serializers.ModelSerializer):
    """Serializer for listing assignments with detailed information"""
    teacher_id = serializers.IntegerField(source='teacher.id', read_only=True)
    teacher_name = serializers.CharField(
        source='teacher.user.get_full_name', read_only=True)
    teacher_email = serializers.EmailField(
        source='teacher.user.email', read_only=True)
    teacher_employee_id = serializers.CharField(
        source='teacher.employee_id', read_only=True)
    teacher_subject = serializers.CharField(
        source='teacher.subject', read_only=True)

    class_id = serializers.IntegerField(
        source='class_assigned.id', read_only=True)
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    class_section = serializers.CharField(
        source='class_assigned.section', read_only=True)

    subject_id = serializers.IntegerField(source='subject.id', read_only=True)
    subject_title = serializers.CharField(
        source='subject.title', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = [
            'id',
            'teacher_id',
            'teacher_name',
            'teacher_email',
            'teacher_employee_id',
            'teacher_subject',
            'class_id',
            'class_name',
            'class_section',
            'subject_id',
            'subject_title',
            'subject_code',
            'assigned_date',
            'is_active'
        ]
