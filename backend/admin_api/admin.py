from django.contrib import admin
from .models import (
    Student, Teacher, Class, Subject, Activity, Event, Grade, Room, 
    ClassRoom, Enrollment, Attendance, Report
)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'roll_no', 'class_name', 'phone', 'is_active', 'enrollment_date']
    list_filter = ['is_active', 'class_name', 'enrollment_date']
    search_fields = ['user__username', 'user__email', 'roll_no', 'class_name']
    readonly_fields = ['enrollment_date']
    
    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Name'


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'subject', 'employee_id', 'classes_count', 'students_count', 'is_active', 'join_date']
    list_filter = ['is_active', 'subject', 'join_date', 'experience_years']
    search_fields = ['user__username', 'user__email', 'subject', 'employee_id']
    readonly_fields = ['join_date']
    
    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Name'


@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'grade_level', 'section', 'room_code', 'assigned_teacher', 'students_count', 'is_active']
    list_filter = ['is_active', 'grade_level', 'assigned_teacher']
    search_fields = ['name', 'room_code', 'grade_level', 'section']
    readonly_fields = ['created_at']


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'students_count', 'subjects_count', 'teacher', 'room', 'is_active']
    list_filter = ['is_active', 'calendar_type', 'day_of_week']
    search_fields = ['name', 'room']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'title', 'credit_hours', 'classes_count', 'teachers_count', 'students_count', 'is_active']
    list_filter = ['is_active', 'credit_hours']
    search_fields = ['code', 'title', 'description']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['get_student_name', 'classroom', 'enrollment_date', 'is_active']
    list_filter = ['is_active', 'enrollment_date', 'classroom']
    search_fields = ['student__user__username', 'student__roll_no', 'classroom__name']
    readonly_fields = ['enrollment_date']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()
    get_student_name.short_description = 'Student Name'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['get_student_name', 'class_section', 'date', 'status', 'recorded_by']
    list_filter = ['status', 'date', 'class_section', 'recorded_by']
    search_fields = ['student__user__username', 'student__roll_no', 'class_section__name']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()
    get_student_name.short_description = 'Student Name'


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['get_student_name', 'subject', 'grade_type', 'score', 'max_score', 'percentage', 'letter_grade', 'term', 'date_recorded']
    list_filter = ['grade_type', 'term', 'date_recorded', 'subject', 'recorded_by']
    search_fields = ['student__user__username', 'student__roll_no', 'subject__title']
    readonly_fields = ['percentage', 'letter_grade', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()
    get_student_name.short_description = 'Student Name'


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'report_type', 'student', 'classroom', 'subject', 'term', 'start_date', 'end_date']
    list_filter = ['report_type', 'term', 'start_date', 'end_date']
    search_fields = ['title', 'student__user__username', 'classroom__name', 'subject__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'name', 'room_type', 'capacity', 'floor', 'building', 'is_active']
    list_filter = ['room_type', 'is_active', 'has_projector', 'has_computer', 'has_whiteboard', 'floor', 'building']
    search_fields = ['room_number', 'name', 'building']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['action', 'user', 'activity_type', 'time']
    list_filter = ['activity_type', 'time']
    search_fields = ['action', 'user']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'location']
    search_fields = ['title', 'location']
