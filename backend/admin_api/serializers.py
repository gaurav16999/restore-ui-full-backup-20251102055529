from rest_framework import serializers
from .models import Student, Teacher, Class, Subject, Activity, Event, Grade
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


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll_no = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    percentage = serializers.ReadOnlyField()
    letter_grade = serializers.ReadOnlyField()
    
    class Meta:
        model = Grade
        fields = ['id', 'student', 'subject', 'student_name', 'student_roll_no', 
                  'subject_name', 'grade_type', 'score', 'max_score', 'percentage', 
                  'letter_grade', 'notes', 'date_recorded', 'created_at']
    
    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username
    
    def get_student_roll_no(self, obj):
        return obj.student.roll_no
    
    def get_subject_name(self, obj):
        return obj.subject.name


class GradeStatsSerializer(serializers.Serializer):
    total_grades = serializers.IntegerField()
    grades_this_week = serializers.IntegerField()
    class_average = serializers.FloatField()
    top_performers = serializers.IntegerField()
    pending_grades = serializers.IntegerField()


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
