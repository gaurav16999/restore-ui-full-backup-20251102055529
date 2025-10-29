from rest_framework import serializers
from admin_api.models import Class


class ClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)

    class Meta:
        model = Class
        fields = ['id', 'name', 'students_count', 'subjects_count', 'teacher', 
                 'teacher_name', 'room', 'schedule', 'is_active', 'date', 
                 'start_time', 'end_time', 'day_of_week', 'calendar_type']
        read_only_fields = ['id', 'students_count', 'subjects_count', 'teacher_name']