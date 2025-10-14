from django.contrib import admin
from .models import Student, Teacher, Class, Subject, Activity, Event


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'roll_no', 'class_name', 'phone', 'is_active', 'enrollment_date']
    list_filter = ['is_active', 'class_name', 'enrollment_date']
    search_fields = ['user__username', 'user__email', 'roll_no', 'class_name']
    
    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Name'


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'subject', 'classes_count', 'students_count', 'is_active', 'join_date']
    list_filter = ['is_active', 'subject', 'join_date']
    search_fields = ['user__username', 'user__email', 'subject']
    
    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Name'


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'students_count', 'subjects_count', 'teacher', 'room', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'room']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'classes_count', 'teachers_count', 'students_count']
    search_fields = ['name']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['action', 'user', 'activity_type', 'time']
    list_filter = ['activity_type', 'time']
    search_fields = ['action', 'user']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'location']
    search_fields = ['title', 'location']
