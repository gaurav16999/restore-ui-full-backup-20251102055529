from django.db import models
from users.models import User


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_no = models.CharField(max_length=20, unique=True)
    class_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    enrollment_date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.roll_no}"


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    subject = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    classes_count = models.IntegerField(default=0)
    students_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    join_date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.subject}"


class Class(models.Model):
    name = models.CharField(max_length=50)
    students_count = models.IntegerField(default=0)
    subjects_count = models.IntegerField(default=0)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='assigned_classes')
    room = models.CharField(max_length=50)
    schedule = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=100)
    classes_count = models.IntegerField(default=0)
    teachers_count = models.IntegerField(default=0)
    students_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name


class Activity(models.Model):
    ACTIVITY_TYPES = [
        ('enrollment', 'Enrollment'),
        ('assignment', 'Assignment'),
        ('payment', 'Payment'),
        ('class', 'Class'),
        ('other', 'Other'),
    ]
    
    action = models.CharField(max_length=200)
    time = models.DateTimeField(auto_now_add=True)
    user = models.CharField(max_length=100)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES, default='other')
    amount = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return f"{self.action} - {self.user}"
    
    class Meta:
        verbose_name_plural = "Activities"
        ordering = ['-time']


class Event(models.Model):
    title = models.CharField(max_length=200)
    date = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    
    def __str__(self):
        return self.title
