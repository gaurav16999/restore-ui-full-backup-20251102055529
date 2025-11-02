from rest_framework import serializers
from admin_api.models import Class


class ClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source='teacher.user.get_full_name', read_only=True)
    # Section is now persisted on the legacy Class model. Include it so
    # frontend-created classes keep their selected section.
    section = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Class
        fields = [
            'id',
            'name',
            'students_count',
            'subjects_count',
            'teacher',
            'teacher_name',
            'room',
            'schedule',
            'is_active',
            'date',
            'start_time',
            'end_time',
            'day_of_week',
            'calendar_type',
            'section']
        read_only_fields = [
            'id',
            'students_count',
            'subjects_count',
            'teacher_name']
    # Default create/update from ModelSerializer will handle 'section' now
