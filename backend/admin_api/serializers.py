from rest_framework import serializers
from .models import Student, Teacher, Class, Subject, Activity, Event
from users.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class StudentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = ['id', 'name', 'roll_no', 'class_name', 'phone', 'email', 
                  'attendance_percentage', 'status', 'enrollment_date']
    
    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"


class TeacherSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Teacher
        fields = ['id', 'name', 'subject', 'classes_count', 'students_count', 
                  'phone', 'email', 'status', 'join_date']
    
    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_status(self, obj):
        return "Active" if obj.is_active else "On Leave"


class ClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'students_count', 'subjects_count', 'teacher_name', 
                  'room', 'schedule', 'is_active']
    
    def get_teacher_name(self, obj):
        if obj.teacher:
            return obj.teacher.user.get_full_name() or obj.teacher.user.username
        return "Not Assigned"


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'classes_count', 'teachers_count', 'students_count']


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'action', 'time', 'user', 'activity_type', 'amount']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'date', 'location']


class DashboardStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    active_classes = serializers.IntegerField()
    monthly_revenue = serializers.CharField()
    students_change = serializers.CharField()
    teachers_change = serializers.CharField()
    classes_change = serializers.CharField()
    revenue_change = serializers.CharField()
