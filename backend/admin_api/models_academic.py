"""
Academic Module Models: Exams, Homework, Lesson Plans, etc.
NOTE: AcademicYear and Exam already exist in models.py, so they are commented out here
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
from users.models import User
from .models import Student, Teacher, Subject, ClassRoom, AcademicYear, Exam


# AcademicYear already exists in models.py
# class AcademicYear(models.Model):
#     """Academic Year configuration"""
#     name = models.CharField(max_length=50, unique=True, help_text="e.g., 2024-2025")
#     start_date = models.DateField()
#     end_date = models.DateField()
#     is_current = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     
#     class Meta:
#         ordering = ['-start_date']
#     
#     def __str__(self):
#         return self.name
#     
#     def save(self, *args, **kwargs):
#         if self.is_current:
#             # Ensure only one academic year is current
#             AcademicYear.objects.filter(is_current=True).update(is_current=False)
#         super().save(*args, **kwargs)


class ExamType(models.Model):
    """Types of exams: Mid-term, Final, Quiz, etc."""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    weightage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('100.00'),
        help_text="Percentage weightage in final grade"
    )
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


# Exam already exists in models.py
# class Exam(models.Model):
#     """Exam Schedule"""
#     STATUS_CHOICES = (
#         ('scheduled', 'Scheduled'),
#         ('ongoing', 'Ongoing'),
#         ('completed', 'Completed'),
#         ('cancelled', 'Cancelled'),
#     )
#     
#     name = models.CharField(max_length=200)
#     exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE, related_name='exams')
#     academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='exams')
#     class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='exams')
#     subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exams')
#     exam_date = models.DateField()
#     start_time = models.TimeField()
#     end_time = models.TimeField()
#     duration_minutes = models.PositiveIntegerField()
#     total_marks = models.DecimalField(max_digits=6, decimal_places=2)
#     passing_marks = models.DecimalField(max_digits=6, decimal_places=2)
#     room = models.CharField(max_length=100, blank=True)
#     instructions = models.TextField(blank=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
#     created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_exams')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     
#     class Meta:
#         ordering = ['exam_date', 'start_time']
#         unique_together = ['class_room', 'subject', 'exam_date', 'start_time']
#     
#     def __str__(self):
#         return f"{self.name} - {self.class_room.name} - {self.subject.name}"


class ExamMark(models.Model):
    """Individual student marks for exams"""
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='marks')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_marks')
    marks_obtained = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    is_absent = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)
    graded_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='graded_marks')
    graded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['exam', 'student']
        ordering = ['-marks_obtained']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.exam.name}: {self.marks_obtained}/{self.exam.total_marks}"
    
    @property
    def percentage(self):
        if self.is_absent:
            return 0
        return (self.marks_obtained / self.exam.total_marks) * 100
    
    @property
    def is_passed(self):
        return self.marks_obtained >= self.exam.passing_marks and not self.is_absent


class GradeScale(models.Model):
    """Grading scale configuration"""
    name = models.CharField(max_length=100)
    min_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    max_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=5, help_text="A+, A, B+, etc.")
    grade_point = models.DecimalField(max_digits=3, decimal_places=2)
    description = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-min_percentage']
    
    def __str__(self):
        return f"{self.grade} ({self.min_percentage}% - {self.max_percentage}%)"


# ExamResult already exists in models.py - DO NOT DUPLICATE
# class ExamResult(models.Model):
#     """Consolidated exam results for students"""
#     student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_results')
#     exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
#     total_marks_obtained = models.DecimalField(max_digits=8, decimal_places=2)
#     total_marks = models.DecimalField(max_digits=8, decimal_places=2)
#     percentage = models.DecimalField(max_digits=5, decimal_places=2)
#     grade = models.CharField(max_length=5, blank=True)
#     rank = models.PositiveIntegerField(null=True, blank=True)
#     is_passed = models.BooleanField(default=False)
#     remarks = models.TextField(blank=True)
#     published_at = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     
#     class Meta:
#         unique_together = ['student', 'exam']
#         ordering = ['-percentage']
#     
#     def __str__(self):
#         return f"{self.student.user.get_full_name()} - {self.exam.name}: {self.percentage}%"


class Homework(models.Model):
    """Homework/Assignment management"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='homework')
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='homework')
    assigned_by = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='assigned_homework')
    assigned_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    max_marks = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('100.00'))
    attachment = models.FileField(upload_to='homework/assignments/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-assigned_date']
    
    def __str__(self):
        return f"{self.title} - {self.class_room.name} - {self.subject.name}"


# HomeworkSubmission already exists in models.py - DO NOT DUPLICATE
# class HomeworkSubmission(models.Model):
#     """Student homework submissions"""
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('submitted', 'Submitted'),
#         ('graded', 'Graded'),
#         ('late', 'Late Submission'),
#     )
#     
#     homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name='submissions')
#     student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='homework_submissions')
#     submission_text = models.TextField(blank=True)
#     attachment = models.FileField(upload_to='homework/submissions/', blank=True, null=True)
#     submitted_at = models.DateTimeField(null=True, blank=True)
#     marks_obtained = models.DecimalField(
#         max_digits=6,
#         decimal_places=2,
#         null=True,
#         blank=True,
#         validators=[MinValueValidator(Decimal('0.00'))]
#     )
#     feedback = models.TextField(blank=True)
#     graded_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')
#     graded_at = models.DateTimeField(null=True, blank=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     
#     class Meta:
#         unique_together = ['homework', 'student']
#         ordering = ['-submitted_at']
#     
#     def __str__(self):
#         return f"{self.student.user.get_full_name()} - {self.homework.title}"
#     
#     @property
#     def is_late(self):
#         if self.submitted_at:
#             return self.submitted_at.date() > self.homework.due_date
#         return timezone.now().date() > self.homework.due_date


# LessonPlan already exists in models.py - DO NOT DUPLICATE
# class LessonPlan(models.Model):
#     """Lesson planning and curriculum mapping"""
#     title = models.CharField(max_length=200)
#     subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='lesson_plans')
#     class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='lesson_plans')
#     teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='lesson_plans')
#     academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='lesson_plans')
#     lesson_date = models.DateField()
#     duration_minutes = models.PositiveIntegerField(default=45)
#     topic = models.CharField(max_length=200)
#     sub_topic = models.CharField(max_length=200, blank=True)
#     objectives = models.TextField(help_text="Learning objectives")
#     methodology = models.TextField(help_text="Teaching methodology")
#     resources = models.TextField(blank=True, help_text="Required resources/materials")
#     homework = models.TextField(blank=True)
#     notes = models.TextField(blank=True)
#     attachment = models.FileField(upload_to='lesson_plans/', blank=True, null=True)
#     is_completed = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     
#     class Meta:
#         ordering = ['lesson_date']
#     
#     def __str__(self):
#         return f"{self.title} - {self.subject.name} - {self.lesson_date}"


class ClassRoutine(models.Model):
    """Class schedule/timetable"""
    DAY_CHOICES = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )
    
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='routines')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='routines')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='routines')
    day_of_week = models.CharField(max_length=20, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=100, blank=True)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='routines')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['day_of_week', 'start_time']
        unique_together = ['class_room', 'day_of_week', 'start_time', 'academic_year']
    
    def __str__(self):
        return f"{self.class_room.name} - {self.day_of_week} - {self.start_time}"


# StaffAttendance already exists in models.py - DO NOT DUPLICATE
# class StaffAttendance(models.Model):
#     """Staff attendance tracking"""
#     STATUS_CHOICES = (
#         ('present', 'Present'),
#         ('absent', 'Absent'),
#         ('late', 'Late'),
#         ('half_day', 'Half Day'),
#         ('on_leave', 'On Leave'),
#     )
#     
#     teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='attendance_records')
#     date = models.DateField(default=timezone.now)
#     check_in_time = models.TimeField(null=True, blank=True)
#     check_out_time = models.TimeField(null=True, blank=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
#     remarks = models.TextField(blank=True)
#     marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='marked_staff_attendance')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     
#     class Meta:
#         unique_together = ['teacher', 'date']
#         ordering = ['-date']
#     
#     def __str__(self):
#         return f"{self.teacher.user.get_full_name()} - {self.date} - {self.status}"
