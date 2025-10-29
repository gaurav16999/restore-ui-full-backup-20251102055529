from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_no = models.CharField(max_length=20, unique=True)
    class_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=20, blank=True)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    enrollment_date = models.DateField(auto_now_add=True)
    date_of_birth = models.DateField(null=True, blank=True)
    parent_contact = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.roll_no}"
    
    def get_full_name(self):
        return self.user.get_full_name()
    
    @property
    def age(self):
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    subject = models.CharField(max_length=100, help_text="Primary subject specialization")
    phone = models.CharField(max_length=20, blank=True)
    classes_count = models.IntegerField(default=0)
    students_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    join_date = models.DateField(auto_now_add=True)
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.subject}"
    
    def get_full_name(self):
        return self.user.get_full_name()


class ClassRoom(models.Model):
    """Represents a class/section with students"""
    name = models.CharField(max_length=50, unique=True)
    grade_level = models.CharField(max_length=20, help_text="e.g., Grade 1, Grade 2, etc.")
    section = models.CharField(max_length=10, help_text="e.g., A, B, C")
    room_code = models.CharField(max_length=20, unique=True)
    assigned_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_classrooms')
    students_count = models.IntegerField(default=0)
    subjects_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.grade_level} {self.section}"
    
    class Meta:
        unique_together = ['grade_level', 'section']


class Subject(models.Model):
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=100)  # Changed from 'name' to 'title'
    description = models.TextField(blank=True)
    classes_count = models.IntegerField(default=0)
    teachers_count = models.IntegerField(default=0)
    students_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    credit_hours = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.code} - {self.title}"


class Enrollment(models.Model):
    """Links students to classes"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['student', 'classroom']
    
    def __str__(self):
        return f"{self.student.get_full_name()} enrolled in {self.classroom.name}"


class TeacherAssignment(models.Model):
    """Links teachers to classes and subjects they teach"""
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='assignments')
    class_assigned = models.ForeignKey('Class', on_delete=models.CASCADE, related_name='teacher_assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    assigned_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['teacher', 'class_assigned', 'subject']
        ordering = ['-assigned_date']
    
    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.class_assigned.name} - {self.subject.title}"


class Class(models.Model):
    """Legacy Class model - kept for backward compatibility"""
    name = models.CharField(max_length=50)
    students_count = models.IntegerField(default=0)
    subjects_count = models.IntegerField(default=0)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='assigned_classes')
    room = models.CharField(max_length=50)
    schedule = models.CharField(max_length=100, blank=True)  # Keep for backward compatibility
    
    # New detailed scheduling fields
    date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    day_of_week = models.CharField(max_length=20, blank=True, choices=[
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'), 
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ])
    
    # Calendar type field for AD/BS support
    calendar_type = models.CharField(max_length=2, choices=[
        ('AD', 'AD (Gregorian)'),
        ('BS', 'BS (Bikram Sambat)'),
    ], default='AD')
    
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Class (Legacy)"
        verbose_name_plural = "Classes (Legacy)"


class ClassSubject(models.Model):
    """Links subjects to classes - defines which subjects are taught in which classes"""
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='class_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='class_subjects')
    is_compulsory = models.BooleanField(default=True, help_text="Is this a mandatory subject for the class?")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['class_assigned', 'subject']
        verbose_name = "Class Subject"
        verbose_name_plural = "Class Subjects"
    
    def __str__(self):
        return f"{self.class_assigned.name} - {self.subject.title}"


class Room(models.Model):
    ROOM_TYPES = [
        ('classroom', 'Classroom'),
        ('laboratory', 'Laboratory'),
        ('library', 'Library'),
        ('auditorium', 'Auditorium'),
        ('gymnasium', 'Gymnasium'),
        ('office', 'Office'),
        ('other', 'Other'),
    ]
    
    room_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100, blank=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='classroom')
    capacity = models.IntegerField(default=30)
    floor = models.CharField(max_length=10, blank=True)
    building = models.CharField(max_length=50, blank=True)
    has_projector = models.BooleanField(default=False)
    has_computer = models.BooleanField(default=False)
    has_whiteboard = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['room_number']
    
    def __str__(self):
        return f"{self.room_number} - {self.name}" if self.name else self.room_number


# Removed duplicate Grade model definition (legacy). Use the enhanced Grade model below.


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


class Attendance(models.Model):
    ATTENDANCE_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    class_section = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='attendances')  # Updated to ClassRoom
    date = models.DateField()
    status = models.CharField(max_length=10, choices=ATTENDANCE_CHOICES)
    recorded_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='recorded_attendances')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'date', 'class_section')
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.date} - {self.status}"


class Grade(models.Model):
    GRADE_TYPES = [
        ('assignment', 'Assignment'),
        ('quiz', 'Quiz'),
        ('test', 'Test'),
        ('project', 'Project'),
        ('homework', 'Homework'),
        ('midterm', 'Midterm'),
        ('final', 'Final'),
        ('participation', 'Participation'),
    ]
    
    TERM_CHOICES = [
        ('first', 'First Term'),
        ('second', 'Second Term'),
        ('third', 'Third Term'),
        ('annual', 'Annual'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='grades')
    grade_type = models.CharField(max_length=20, choices=GRADE_TYPES)
    score = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0)])
    max_score = models.DecimalField(max_digits=6, decimal_places=2, default=100, validators=[MinValueValidator(1)])
    term = models.CharField(max_length=20, choices=TERM_CHOICES, default='first')
    notes = models.TextField(blank=True, null=True)
    date_recorded = models.DateField()
    recorded_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='recorded_grades')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def percentage(self):
        return round((self.score / self.max_score) * 100, 2)
    
    @property
    def letter_grade(self):
        percentage = self.percentage
        if percentage >= 90:
            return 'A+'
        elif percentage >= 85:
            return 'A'
        elif percentage >= 80:
            return 'B+'
        elif percentage >= 75:
            return 'B'
        elif percentage >= 70:
            return 'C+'
        elif percentage >= 65:
            return 'C'
        elif percentage >= 60:
            return 'D'
        else:
            return 'F'
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.subject.title} - {self.grade_type}"
    
    class Meta:
        ordering = ['-date_recorded', '-created_at']


class Report(models.Model):
    """Aggregated performance reports"""
    REPORT_TYPES = [
        ('student', 'Student Report'),
        ('class', 'Class Report'),
        ('subject', 'Subject Report'),
        ('term', 'Term Report'),
    ]
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    title = models.CharField(max_length=200)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    term = models.CharField(max_length=20, choices=Grade.TERM_CHOICES, null=True, blank=True)
    
    # Aggregated data
    total_students = models.IntegerField(default=0)
    average_grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Report period
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Report data (JSON field for flexible data storage)
    report_data = models.JSONField(default=dict, blank=True)
    
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.report_type}"
    
    class Meta:
        ordering = ['-created_at']


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info')
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, default='medium')
    action_url = models.CharField(max_length=500, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.title}"


# ==================== FEE MANAGEMENT ====================

class FeeStructure(models.Model):
    """Defines fee types and amounts for different classes/categories"""
    FEE_TYPES = [
        ('tuition', 'Tuition Fee'),
        ('admission', 'Admission Fee'),
        ('exam', 'Examination Fee'),
        ('library', 'Library Fee'),
        ('lab', 'Laboratory Fee'),
        ('sports', 'Sports Fee'),
        ('transport', 'Transport Fee'),
        ('hostel', 'Hostel Fee'),
        ('computer', 'Computer Fee'),
        ('development', 'Development Fee'),
        ('other', 'Other'),
    ]
    
    FREQUENCY = [
        ('onetime', 'One Time'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('half_yearly', 'Half Yearly'),
        ('yearly', 'Yearly'),
    ]
    
    name = models.CharField(max_length=100)
    fee_type = models.CharField(max_length=20, choices=FEE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    frequency = models.CharField(max_length=20, choices=FREQUENCY, default='yearly')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, null=True, blank=True, related_name='fee_structures')
    grade_level = models.CharField(max_length=20, blank=True, help_text="Applicable for specific grade level")
    is_mandatory = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    due_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = "Fee Structures"
    
    def __str__(self):
        return f"{self.name} - {self.get_fee_type_display()} - {self.amount}"


class FeePayment(models.Model):
    """Records individual fee payments"""
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
        ('online', 'Online Payment'),
        ('upi', 'UPI'),
        ('card', 'Credit/Debit Card'),
    ]
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('partial', 'Partially Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_payments')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='payments')
    invoice_number = models.CharField(max_length=50, unique=True)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_date = models.DateField(null=True, blank=True)
    due_date = models.DateField()
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remarks = models.TextField(blank=True)
    collected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='collected_payments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def balance(self):
        return self.amount_due - self.amount_paid
    
    @property
    def is_overdue(self):
        if self.status != 'paid' and self.due_date:
            return timezone.now().date() > self.due_date
        return False
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.invoice_number} - {self.student.get_full_name()} - {self.status}"


# ==================== EXAM MANAGEMENT ====================

class Exam(models.Model):
    """Defines examination details"""
    EXAM_TYPES = [
        ('unit_test', 'Unit Test'),
        ('monthly', 'Monthly Test'),
        ('quarterly', 'Quarterly Exam'),
        ('half_yearly', 'Half Yearly'),
        ('annual', 'Annual Exam'),
        ('board', 'Board Exam'),
    ]
    
    name = models.CharField(max_length=200)
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPES)
    academic_year = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField()
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='exams')
    total_marks = models.IntegerField(default=100)
    passing_marks = models.IntegerField(default=40)
    instructions = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_exams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.name} - {self.class_assigned.name}"


class ExamSchedule(models.Model):
    """Individual exam paper schedule"""
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='schedules')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exam_schedules')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='exam_schedules')
    invigilator = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='invigilation_duties')
    max_marks = models.IntegerField(default=100)
    duration_minutes = models.IntegerField(help_text="Exam duration in minutes")
    instructions = models.TextField(blank=True)
    
    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['exam', 'subject']
    
    def __str__(self):
        return f"{self.exam.name} - {self.subject.title} - {self.date}"


class ExamResult(models.Model):
    """Student exam results"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exam_results')
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    max_marks = models.DecimalField(max_digits=6, decimal_places=2)
    grade = models.CharField(max_length=5, blank=True)
    remarks = models.TextField(blank=True)
    is_absent = models.BooleanField(default=False)
    entered_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='entered_results')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def percentage(self):
        if self.is_absent:
            return 0
        return round((self.marks_obtained / self.max_marks) * 100, 2)
    
    @property
    def passed(self):
        return self.marks_obtained >= self.exam.passing_marks
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['student', 'exam', 'subject']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.exam.name} - {self.subject.title}"


# ==================== TIMETABLE MANAGEMENT ====================

class TimeSlot(models.Model):
    """Defines time periods for the school day"""
    DAYS_OF_WEEK = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    name = models.CharField(max_length=50, help_text="e.g., Period 1, Break, Lunch")
    day_of_week = models.CharField(max_length=20, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_break = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.get_day_of_week_display()} - {self.name} ({self.start_time} - {self.end_time})"


class Timetable(models.Model):
    """Class timetable entries"""
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='timetables')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='timetables')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='timetables')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='timetables')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='timetables')
    academic_year = models.CharField(max_length=20)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['class_assigned', 'time_slot']
        unique_together = ['class_assigned', 'time_slot', 'academic_year']
    
    def __str__(self):
        return f"{self.class_assigned.name} - {self.time_slot.name} - {self.subject.title}"


# ==================== ASSIGNMENT & HOMEWORK ====================

class Assignment(models.Model):
    """Homework and assignments"""
    ASSIGNMENT_TYPES = [
        ('homework', 'Homework'),
        ('project', 'Project'),
        ('presentation', 'Presentation'),
        ('practical', 'Practical Work'),
        ('essay', 'Essay'),
        ('research', 'Research'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, default='homework')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assignments')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='created_assignments')
    assigned_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    max_marks = models.IntegerField(default=10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')
    attachment_url = models.CharField(max_length=500, blank=True)
    instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-due_date']
    
    def __str__(self):
        return f"{self.title} - {self.subject.title} - {self.class_assigned.name}"


class AssignmentSubmission(models.Model):
    """Student assignment submissions"""
    SUBMISSION_STATUS = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('late', 'Late Submission'),
        ('graded', 'Graded'),
    ]
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assignment_submissions')
    submission_date = models.DateTimeField(auto_now_add=True)
    submission_text = models.TextField(blank=True)
    attachment_url = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=SUBMISSION_STATUS, default='pending')
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')
    graded_at = models.DateTimeField(null=True, blank=True)
    
    @property
    def is_late(self):
        return self.submission_date.date() > self.assignment.due_date
    
    class Meta:
        ordering = ['-submission_date']
        unique_together = ['assignment', 'student']
    
    def __str__(self):
        return f"{self.assignment.title} - {self.student.get_full_name()}"


# ==================== COMMUNICATION SYSTEM ====================

class Announcement(models.Model):
    """School announcements and circulars"""
    ANNOUNCEMENT_TYPES = [
        ('general', 'General'),
        ('urgent', 'Urgent'),
        ('event', 'Event'),
        ('holiday', 'Holiday'),
        ('exam', 'Exam Related'),
        ('fee', 'Fee Related'),
    ]
    
    TARGET_AUDIENCE = [
        ('all', 'All'),
        ('students', 'Students'),
        ('teachers', 'Teachers'),
        ('parents', 'Parents'),
        ('staff', 'Staff'),
        ('class_specific', 'Specific Class'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    announcement_type = models.CharField(max_length=20, choices=ANNOUNCEMENT_TYPES, default='general')
    target_audience = models.CharField(max_length=20, choices=TARGET_AUDIENCE, default='all')
    target_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, blank=True, related_name='announcements')
    priority = models.CharField(max_length=20, choices=Notification.PRIORITY_LEVELS, default='medium')
    attachment_url = models.CharField(max_length=500, blank=True)
    is_published = models.BooleanField(default=False)
    publish_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_announcements')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_announcement_type_display()}"


class Message(models.Model):
    """Internal messaging system"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    parent_message = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username} - {self.subject}"
