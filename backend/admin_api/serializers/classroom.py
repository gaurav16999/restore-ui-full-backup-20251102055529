from rest_framework import serializers
from ..models import ClassRoom


class ClassRoomSerializer(serializers.ModelSerializer):
    assigned_teacher_name = serializers.CharField(
        source='assigned_teacher.get_full_name', read_only=True)
    enrolled_students_count = serializers.SerializerMethodField()
    active_enrollments = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'name', 'grade_level', 'section', 'room_code',
            'assigned_teacher', 'assigned_teacher_name', 'students_count',
            'subjects_count', 'is_active', 'created_at',
            'enrolled_students_count', 'active_enrollments'
        ]
        read_only_fields = ['created_at', 'students_count', 'subjects_count']

    def get_enrolled_students_count(self, obj):
        """Get count of actively enrolled students"""
        return obj.enrollments.filter(is_active=True).count()

    def get_active_enrollments(self, obj):
        """Get list of active enrollments with student details"""
        from .enrollment import EnrollmentListSerializer
        enrollments = obj.enrollments.filter(
            is_active=True).select_related('student__user')
        return EnrollmentListSerializer(enrollments, many=True).data

    def validate_room_code(self, value):
        """Ensure room code is unique"""
        if ClassRoom.objects.filter(room_code=value).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError("Room code must be unique.")
        return value

    def validate(self, data):
        """Validate classroom data"""
        grade_level = data.get('grade_level')
        section = data.get('section')

        # Check for duplicate grade_level + section combination
        if grade_level and section:
            existing = ClassRoom.objects.filter(
                grade_level=grade_level,
                section=section
            ).exclude(pk=self.instance.pk if self.instance else None)

            if existing.exists():
                raise serializers.ValidationError(
                    f"Classroom for {grade_level} Section {section} already exists.")

        return data


class ClassRoomListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing classrooms"""
    assigned_teacher_name = serializers.CharField(
        source='assigned_teacher.get_full_name', read_only=True)
    enrolled_students_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'name', 'grade_level', 'section', 'room_code',
            'assigned_teacher_name', 'enrolled_students_count', 'is_active'
        ]

    def get_enrolled_students_count(self, obj):
        return obj.enrollments.filter(is_active=True).count()


class ClassRoomCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new classrooms"""

    class Meta:
        model = ClassRoom
        fields = [
            'name', 'grade_level', 'section', 'room_code',
            'assigned_teacher', 'is_active'
        ]

    def create(self, validated_data):
        """Create new classroom and update teacher's class count"""
        classroom = ClassRoom.objects.create(**validated_data)

        # Update assigned teacher's class count
        if classroom.assigned_teacher:
            teacher = classroom.assigned_teacher
            teacher.classes_count = teacher.assigned_classrooms.filter(
                is_active=True).count()
            teacher.save()

        return classroom
