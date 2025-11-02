from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
from users.models import User


class Student(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile')
    parent_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children')
    roll_no = models.CharField(max_length=20, unique=True)
    class_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=20, blank=True)
    attendance_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    enrollment_date = models.DateField(auto_now_add=True)
    date_of_birth = models.DateField(null=True, blank=True)
    parent_contact = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        """Auto-generate roll_no if not provided"""
        if not self.roll_no:
            import random
            # Generate format: 250XXXXX (year last 2 digits + 0 + 5 random digits)
            year_suffix = str(timezone.now().year)[-2:]
            
            # Generate unique 5-digit random number
            max_attempts = 100
            for _ in range(max_attempts):
                random_digits = ''.join([str(random.randint(0, 9)) for _ in range(5)])
                potential_id = f'{year_suffix}0{random_digits}'
                
                # Check if this ID already exists
                if not Student.objects.filter(roll_no=potential_id).exists():
                    self.roll_no = potential_id
                    break
            else:
                # Fallback if somehow all attempts failed
                import uuid
                self.roll_no = f'{year_suffix}0{str(uuid.uuid4().int)[:5]}'
        
        super().save(*args, **kwargs)

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
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='teacher_profile')
    subject = models.CharField(max_length=100,
                               help_text="Primary subject specialization")
    phone = models.CharField(max_length=20, blank=True)
    classes_count = models.IntegerField(default=Decimal('0.00'))
    students_count = models.IntegerField(default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    join_date = models.DateField(auto_now_add=True)
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    experience_years = models.PositiveIntegerField(default=Decimal('0.00'))

    def save(self, *args, **kwargs):
        """Auto-generate employee_id if not provided"""
        if not self.employee_id:
            import random
            # Generate format: 25XXXXXX (year last 2 digits + 6 random digits)
            year_suffix = str(timezone.now().year)[-2:]
            
            # Generate unique 6-digit random number
            max_attempts = 100
            for _ in range(max_attempts):
                random_digits = ''.join([str(random.randint(0, 9)) for _ in range(6)])
                potential_id = f'{year_suffix}{random_digits}'
                
                # Check if this ID already exists
                if not Teacher.objects.filter(employee_id=potential_id).exists():
                    self.employee_id = potential_id
                    break
            else:
                # Fallback if somehow all attempts failed
                import uuid
                self.employee_id = f'{year_suffix}{str(uuid.uuid4().int)[:6]}'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.subject}"

    def get_full_name(self):
        return self.user.get_full_name()


class ClassRoom(models.Model):
    """Represents a class/section with students"""
    name = models.CharField(max_length=50, unique=True)
    grade_level = models.CharField(
        max_length=20,
        help_text="e.g., Grade 1, Grade 2, etc.")
    section = models.CharField(max_length=10, help_text="e.g., A, B, C")
    room_code = models.CharField(max_length=20, unique=True)
    assigned_teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_classrooms')
    students_count = models.IntegerField(default=Decimal('0.00'))
    subjects_count = models.IntegerField(default=Decimal('0.00'))
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
    # Indicates whether this subject has a practical component
    is_practical = models.BooleanField(default=False)
    # Subject type as explicit choice: 'theory' or 'practical'
    subject_type = models.CharField(
        max_length=10,
        choices=[('theory', 'Theory'), ('practical', 'Practical')],
        default='theory'
    )
    classes_count = models.IntegerField(default=Decimal('0.00'))
    teachers_count = models.IntegerField(default=Decimal('0.00'))
    students_count = models.IntegerField(default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    credit_hours = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.code} - {self.title}"


class StudentCategory(models.Model):
    """Category/classification for students"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Student Categories"
        ordering = ['-created_at']


class StudentGroup(models.Model):
    """Group for organizing students"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    students_count = models.IntegerField(default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class SmsSendingTime(models.Model):
    """SMS sending time configuration"""
    start_time = models.TimeField()
    status = models.CharField(
        max_length=10,
        choices=[('active', 'Active'), ('inactive', 'Inactive')],
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.start_time} - {self.status}"

    class Meta:
        ordering = ['-created_at']


class Enrollment(models.Model):
    """Links students to classes"""
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='enrollments')
    classroom = models.ForeignKey(
        ClassRoom,
        on_delete=models.CASCADE,
        related_name='enrollments')
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['student', 'classroom']

    def __str__(self):
        return f"{
            self.student.get_full_name()} enrolled in {
            self.classroom.name}"


class TeacherAssignment(models.Model):
    """Links teachers to classes and subjects they teach"""
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name='assignments')
    class_assigned = models.ForeignKey(
        'Class',
        on_delete=models.CASCADE,
        related_name='teacher_assignments')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='teacher_assignments')
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
    # Persist section on Class so frontend-created records can retain the
    # selected section after refresh. This mirrors the section used on
    # ClassRoom but is kept on the legacy Class for backward compatibility.
    section = models.CharField(
        max_length=10,
        blank=True,
        help_text="e.g., A, B, C")
    students_count = models.IntegerField(default=Decimal('0.00'))
    subjects_count = models.IntegerField(default=Decimal('0.00'))
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_classes')
    room = models.CharField(max_length=50)
    # Keep for backward compatibility
    schedule = models.CharField(max_length=100, blank=True)

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
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='class_subjects')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='class_subjects')
    is_compulsory = models.BooleanField(
        default=True, help_text="Is this a mandatory subject for the class?")
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
    room_type = models.CharField(
        max_length=20,
        choices=ROOM_TYPES,
        default='classroom')
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


# Removed duplicate Grade model definition (legacy). Use the enhanced
# Grade model below.


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
    activity_type = models.CharField(
        max_length=20,
        choices=ACTIVITY_TYPES,
        default='other')
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

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendances')
    class_section = models.ForeignKey(
        ClassRoom,
        on_delete=models.CASCADE,
        related_name='attendances')  # Updated to ClassRoom
    date = models.DateField()
    status = models.CharField(max_length=10, choices=ATTENDANCE_CHOICES)
    recorded_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_attendances')
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

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='grades')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='grades')
    grade_type = models.CharField(max_length=20, choices=GRADE_TYPES)
    score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[
            MinValueValidator(0)])
    max_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=100,
        validators=[
            MinValueValidator(1)])
    term = models.CharField(
        max_length=20,
        choices=TERM_CHOICES,
        default='first')
    notes = models.TextField(blank=True, null=True)
    date_recorded = models.DateField()
    recorded_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_grades')
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
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports')
    classroom = models.ForeignKey(
        ClassRoom,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports')
    term = models.CharField(
        max_length=20,
        choices=Grade.TERM_CHOICES,
        null=True,
        blank=True)

    # Aggregated data
    total_students = models.IntegerField(default=Decimal('0.00'))
    average_grade = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True)
    attendance_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True)

    # Report period
    start_date = models.DateField()
    end_date = models.DateField()

    # Report data (JSON field for flexible data storage)
    report_data = models.JSONField(default=dict, blank=True)

    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_reports')
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

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='info')
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_LEVELS,
        default='medium')
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
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(0)])
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY,
        default='yearly')
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='fee_structures')
    grade_level = models.CharField(
        max_length=20,
        blank=True,
        help_text="Applicable for specific grade level")
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

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='fee_payments')
    fee_structure = models.ForeignKey(
        FeeStructure,
        on_delete=models.CASCADE,
        related_name='payments')
    invoice_number = models.CharField(max_length=50, unique=True)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'))
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        null=True,
        blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='pending')
    payment_date = models.DateField(null=True, blank=True)
    due_date = models.DateField()
    late_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'))
    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'))
    remarks = models.TextField(blank=True)
    collected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collected_payments')
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


# ==================== WALLET / ACCOUNTS / INVENTORY ====================


class WalletAccount(models.Model):
    """Represents a simple wallet account for a user or system ledger"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='wallet_accounts')
    name = models.CharField(max_length=200)
    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username if self.user else 'system'})"


class WalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdraw', 'Withdraw'),
        ('refund', 'Refund'),
        ('transfer', 'Transfer'),
        ('expense', 'Expense'),
    ]

    wallet = models.ForeignKey(
        WalletAccount,
        on_delete=models.CASCADE,
        related_name='transactions')
    transaction_type = models.CharField(
        max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.wallet.name} - {self.transaction_type} - {self.amount}"


class WalletDepositRequest(models.Model):
    wallet = models.ForeignKey(
        WalletAccount,
        on_delete=models.CASCADE,
        related_name='deposit_requests')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    file_receipt = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Deposit {self.amount} to {self.wallet.name} - {self.status}"


class WalletRefundRequest(models.Model):
    transaction = models.ForeignKey(
        WalletTransaction,
        on_delete=models.CASCADE,
        related_name='refund_requests')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Refund {
            self.amount} for tx {
            self.transaction_id if hasattr(
                self,
                'transaction_id') else self.transaction.id}"


# Accounts (chart & transactions)
class ChartOfAccount(models.Model):
    ACCOUNT_TYPES = [
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('equity', 'Equity'),
    ]

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class AccountTransaction(models.Model):
    account = models.ForeignKey(
        ChartOfAccount,
        on_delete=models.CASCADE,
        related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_credit = models.BooleanField(default=True)
    reference = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.account.code} - {'CR' if self.is_credit else 'DR'} - {self.amount}"


# Inventory models
class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=100, blank=True)
    email = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ItemCategory(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Item(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(
        ItemCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='items')
    description = models.TextField(blank=True)
    total_in_stock = models.IntegerField(default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ItemReceive(models.Model):
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='receives')
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        related_name='supplies')
    quantity = models.IntegerField()
    received_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Receive {self.quantity} x {self.item.name}"


class ItemIssue(models.Model):
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='issues')
    issued_to = models.CharField(max_length=200)
    quantity = models.IntegerField()
    issued_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Issue {self.quantity} x {self.item.name} to {self.issued_to}"


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
    class_assigned = models.ForeignKey(
        Class, on_delete=models.CASCADE, related_name='exams')
    total_marks = models.IntegerField(default=Decimal('100.00'))
    passing_marks = models.IntegerField(default=40)
    instructions = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_exams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} - {self.class_assigned.name}"


class ExamSchedule(models.Model):
    """Individual exam paper schedule"""
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='schedules')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='exam_schedules')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='exam_schedules')
    invigilator = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invigilation_duties')
    max_marks = models.IntegerField(default=Decimal('100.00'))
    duration_minutes = models.IntegerField(
        help_text="Exam duration in minutes")
    instructions = models.TextField(blank=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['exam', 'subject']

    def __str__(self):
        return f"{self.exam.name} - {self.subject.title} - {self.date}"


class ExamResult(models.Model):
    """Student exam results"""
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='exam_results')
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='results')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='exam_results')
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    max_marks = models.DecimalField(max_digits=6, decimal_places=2)
    grade = models.CharField(max_length=5, blank=True)
    remarks = models.TextField(blank=True)
    is_absent = models.BooleanField(default=False)
    entered_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entered_results')
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

    name = models.CharField(max_length=50,
                            help_text="e.g., Period 1, Break, Lunch")
    day_of_week = models.CharField(max_length=20, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_break = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)


# ------------------ Online Exam & Question Bank ------------------
class OnlineExam(models.Model):
    title = models.CharField(max_length=255)
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='online_exams')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='online_exams')
    section = models.CharField(max_length=32, null=True, blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    min_percent = models.IntegerField(default=Decimal('0.00'))
    auto_mark = models.BooleanField(default=False)
    instructions = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_online_exams')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_datetime']

    def __str__(self):
        return f"{self.title} - {self.class_assigned.name}"


class QuestionGroup(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    Q_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('short', 'Short Answer'),
        ('long', 'Long Answer'),
    ]

    group = models.ForeignKey(
        QuestionGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20, choices=Q_TYPES, default='mcq')
    options = models.JSONField(
        null=True,
        blank=True,
        help_text='Option list for MCQ')
    marks = models.IntegerField(default=1)
    subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='questions')
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='questions')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_questions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Q: {self.question_text[:60]}"


class ClassTest(models.Model):
    title = models.CharField(max_length=255)
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='class_tests')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='class_tests')
    date = models.DateField()
    total_marks = models.IntegerField(default=Decimal('100.00'))
    passing_marks = models.IntegerField(default=40)
    instructions = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_class_tests')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} - {self.class_assigned.name}"


class Timetable(models.Model):
    """Class timetable entries"""
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='timetables')
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='timetables')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='timetables')
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='timetables')
    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='timetables')
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


# ==================== BEHAVIOUR / INCIDENTS ====================


class IncidentType(models.Model):
    """Defines types of incidents (e.g., Fighting, Cursing, Good Work)"""
    title = models.CharField(max_length=200)
    point = models.IntegerField(default=Decimal('0.00'))
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.point})"


class StudentIncident(models.Model):
    """An assigned incident for a student"""
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='incidents')
    incident_type = models.ForeignKey(
        IncidentType,
        on_delete=models.CASCADE,
        related_name='incidents')
    date = models.DateField()
    points = models.IntegerField()
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_incidents')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def save(self, *args, **kwargs):
        # default points from incident type if not supplied
        if self.points is None:
            self.points = self.incident_type.point
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.incident_type.title} - {self.date}"


class BehaviourSetting(models.Model):
    """Simple settings for behaviour module (single row expected)."""
    # comment_option: whether comments belong to 'student' or 'parent'
    comment_option = models.CharField(
        max_length=20, choices=[
            ('student', 'Student'), ('parent', 'Parent')], default='parent')
    # view_option: default view preference
    view_option = models.CharField(
        max_length=20, choices=[
            ('student', 'Student'), ('parent', 'Parent')], default='student')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Behaviour Setting'
        verbose_name_plural = 'Behaviour Settings'

    def __str__(self):
        return f"Comment: {self.comment_option} | View: {self.view_option}"


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
    assignment_type = models.CharField(
        max_length=20,
        choices=ASSIGNMENT_TYPES,
        default='homework')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='assignments')
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='assignments')
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name='created_assignments')
    assigned_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    max_marks = models.IntegerField(default=10)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='published')
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

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions')
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='assignment_submissions')
    submission_date = models.DateTimeField(auto_now_add=True)
    submission_text = models.TextField(blank=True)
    attachment_url = models.CharField(max_length=500, blank=True)
    status = models.CharField(
        max_length=20,
        choices=SUBMISSION_STATUS,
        default='pending')
    marks_obtained = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_submissions')
    graded_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_late(self):
        return self.submission_date.date() > self.assignment.due_date

    class Meta:
        ordering = ['-submission_date']
        unique_together = ['assignment', 'student']

    def __str__(self):
        return f"{self.assignment.title} - {self.student.get_full_name()}"


# ==================== LIBRARY MODELS ====================


class BookCategory(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Book Category'
        verbose_name_plural = 'Book Categories'

    def __str__(self):
        return self.title


class LibraryMember(models.Model):
    MEMBER_TYPES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('external', 'External'),
    ]

    name = models.CharField(max_length=200)
    member_type = models.CharField(
        max_length=20,
        choices=MEMBER_TYPES,
        default='student')
    student = models.ForeignKey(
        'Student',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='library_members')
    email = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    member_id = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Library Member'
        verbose_name_plural = 'Library Members'

    def __str__(self):
        return f"{self.name} ({self.member_type})"


class Book(models.Model):
    title = models.CharField(max_length=300)
    book_no = models.CharField(max_length=100, blank=True)
    isbn = models.CharField(max_length=32, blank=True)
    category = models.ForeignKey(
        BookCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books')
    publisher = models.CharField(max_length=200, blank=True)
    author = models.CharField(max_length=200, blank=True)
    rack_number = models.CharField(max_length=50, blank=True)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Book'
        verbose_name_plural = 'Books'

    def __str__(self):
        return self.title


class BookIssue(models.Model):
    STATUS = [
        ('issued', 'Issued'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    ]

    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='issues')
    member = models.ForeignKey(
        LibraryMember,
        on_delete=models.CASCADE,
        related_name='issues')
    issued_by = models.ForeignKey(
        'Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='issued')
    remarks = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Book Issue'
        verbose_name_plural = 'Book Issues'

    def __str__(self):
        return f"{self.book.title} -> {self.member.name} ({self.status})"


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
    announcement_type = models.CharField(
        max_length=20,
        choices=ANNOUNCEMENT_TYPES,
        default='general')
    target_audience = models.CharField(
        max_length=20,
        choices=TARGET_AUDIENCE,
        default='all')
    target_class = models.ForeignKey(
        Class,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcements')
    priority = models.CharField(
        max_length=20,
        choices=Notification.PRIORITY_LEVELS,
        default='medium')
    attachment_url = models.CharField(max_length=500, blank=True)
    is_published = models.BooleanField(default=False)
    publish_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_announcements')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_announcement_type_display()}"


class Message(models.Model):
    """Internal messaging system"""
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages')
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages')
    subject = models.CharField(max_length=200)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    parent_message = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username} - {self.subject}"


# ==================== Admin Section Models ====================

class AdmissionQuery(models.Model):
    """Track admission inquiries and follow-ups"""
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Follow Up', 'Follow Up'),
        ('Contacted', 'Contacted'),
        ('Converted', 'Converted'),
        ('Closed', 'Closed'),
    ]

    SOURCE_CHOICES = [
        ('Facebook', 'Facebook'),
        ('Website', 'Website'),
        ('Google', 'Google'),
        ('Referral', 'Referral'),
        ('Walk-in', 'Walk-in'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    description = models.TextField(blank=True, null=True)
    query_date = models.DateField(default=timezone.now)
    last_follow_up_date = models.DateField(blank=True, null=True)
    next_follow_up_date = models.DateField(blank=True, null=True)
    assigned = models.CharField(max_length=100, blank=True, null=True)
    reference = models.CharField(max_length=100, blank=True, null=True)
    class_field = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_column='class')
    number_of_child = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-query_date', '-created_at']
        verbose_name = 'Admission Query'
        verbose_name_plural = 'Admission Queries'


# ==================== LESSON PLAN SYSTEM ====================


class Lesson(models.Model):
    """Represents a lesson within a subject and class"""
    title = models.CharField(max_length=255)
    subject = models.ForeignKey(
        'Subject',
        on_delete=models.CASCADE,
        related_name='lessons')
    class_assigned = models.ForeignKey(
        'Class',
        on_delete=models.CASCADE,
        related_name='lessons')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_lessons')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.subject})"


class Topic(models.Model):
    """Topic entries that belong to a Lesson"""
    lesson = models.ForeignKey(
        'Lesson',
        on_delete=models.CASCADE,
        related_name='topics')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_topics')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.lesson.title}"


class LessonPlan(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]

    teacher = models.ForeignKey(
        'Teacher',
        on_delete=models.SET_NULL,
        null=True,
        related_name='lesson_plans')
    lesson = models.ForeignKey(
        'Lesson',
        on_delete=models.CASCADE,
        related_name='plans')
    topic = models.ForeignKey(
        'Topic',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plans')
    planned_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='planned')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_lesson_plans')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-planned_date', '-created_at']

    def __str__(self):
        return f"{
            self.lesson.title} on {
            self.planned_date} ({
            self.get_status_display()})"


class VisitorBook(models.Model):
    """Track visitors to the institution"""
    purpose = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    id_card = models.CharField(max_length=100, blank=True, null=True)
    no_of_person = models.PositiveIntegerField(default=1)
    date = models.DateField(default=timezone.now)
    in_time = models.TimeField()
    out_time = models.TimeField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-in_time']
        verbose_name = 'Visitor Record'
        verbose_name_plural = 'Visitor Book'

    def __str__(self):
        return f"{self.name} - {self.date} ({self.purpose})"


class Complaint(models.Model):
    """Track complaints and their resolution"""
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]

    COMPLAINT_TYPE_CHOICES = [
        ('Academic', 'Academic'),
        ('Administrative', 'Administrative'),
        ('Facilities', 'Facilities'),
        ('Transport', 'Transport'),
        ('Staff', 'Staff'),
        ('Other', 'Other'),
    ]

    SOURCE_CHOICES = [
        ('Email', 'Email'),
        ('Phone', 'Phone'),
        ('In Person', 'In Person'),
        ('Online Portal', 'Online Portal'),
    ]

    complaint_by = models.CharField(max_length=200)
    complaint_type = models.CharField(
        max_length=50, choices=COMPLAINT_TYPE_CHOICES)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    phone = models.CharField(max_length=20)
    date = models.DateField(default=timezone.now)
    description = models.TextField()
    action_taken = models.TextField(blank=True, null=True)
    assigned_to = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending')
    resolution_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'

    def __str__(self):
        return f"{self.complaint_by} - {self.complaint_type} ({self.status})"


class PostalReceive(models.Model):
    """Track incoming postal and packages"""
    from_title = models.CharField(max_length=200)
    reference_no = models.CharField(max_length=100)
    address = models.TextField()
    to_title = models.CharField(max_length=200)
    date = models.DateField(default=timezone.now)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Postal Receive'
        verbose_name_plural = 'Postal Receives'

    def __str__(self):
        return f"{self.reference_no} from {self.from_title} - {self.date}"


class PostalDispatch(models.Model):
    """Track outgoing postal and packages"""
    to_title = models.CharField(max_length=200)
    reference_no = models.CharField(max_length=100)
    address = models.TextField()
    from_title = models.CharField(max_length=200)
    date = models.DateField(default=timezone.now)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Postal Dispatch'
        verbose_name_plural = 'Postal Dispatches'

    def __str__(self):
        return f"{self.reference_no} to {self.to_title} - {self.date}"


class PhoneCallLog(models.Model):
    """Log phone calls for record keeping"""
    CALL_TYPE_CHOICES = [
        ('Incoming', 'Incoming'),
        ('Outgoing', 'Outgoing'),
    ]

    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    date = models.DateField(default=timezone.now)
    call_duration = models.CharField(max_length=20, blank=True, null=True)
    call_type = models.CharField(max_length=20, choices=CALL_TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Phone Call Log'
        verbose_name_plural = 'Phone Call Logs'

    def __str__(self):
        return f"{self.name} - {self.call_type} - {self.date}"


# ------------------ Transport Models ------------------
class TransportRoute(models.Model):
    title = models.CharField(max_length=128)
    fare = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class TransportVehicle(models.Model):
    vehicle_no = models.CharField(max_length=64)
    registration_no = models.CharField(max_length=64, null=True, blank=True)
    vehicle_type = models.CharField(max_length=32, null=True, blank=True)
    driver_name = models.CharField(max_length=128, null=True, blank=True)
    driver_mobile = models.CharField(max_length=32, null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.vehicle_no


class VehicleAssignment(models.Model):
    route = models.ForeignKey(TransportRoute, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(TransportVehicle, on_delete=models.CASCADE)
    assigned_at = models.DateField(auto_now_add=True)


# ------------------ Dormitory Models ------------------
class DormRoomType(models.Model):
    title = models.CharField(max_length=128)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class DormRoom(models.Model):
    room_number = models.CharField(max_length=64)
    room_type = models.ForeignKey(
        DormRoomType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True)
    capacity = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.room_number


class DormitoryAssignment(models.Model):
    room = models.ForeignKey(DormRoom, on_delete=models.CASCADE)
    student = models.ForeignKey('users.User', on_delete=models.CASCADE)
    assigned_date = models.DateField(auto_now_add=True)
    vacated_date = models.DateField(null=True, blank=True)


# ==================== HUMAN RESOURCES (HR) ====================


class Designation(models.Model):
    DESIGNATION_TYPES = [
        ('teaching', 'Teaching Staff'),
        ('administrative', 'Administrative Staff'),
        ('support', 'Support Staff'),
    ]
    
    title = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    designation_type = models.CharField(
        max_length=20, 
        choices=DESIGNATION_TYPES, 
        default='teaching',
        help_text="Category of designation"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title
    
    def get_staff_count(self):
        """Get count of active employees with this designation"""
        return self.employees.filter(is_active=True).count()


class Department(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Employee(models.Model):
    # link to users.User if present, else store basic info
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employee_profile')
    name = models.CharField(max_length=200)
    employee_id = models.CharField(max_length=64, blank=True, null=True, unique=True)
    designation = models.ForeignKey(
        Designation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees')
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees')
    phone = models.CharField(max_length=32, blank=True)
    email = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    join_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        """Auto-generate employee_id if not provided"""
        if not self.employee_id:
            import random
            # Generate format: 25XXXXXX (year last 2 digits + 6 random digits)
            year_suffix = str(timezone.now().year)[-2:]
            
            # Generate unique 6-digit random number
            max_attempts = 100
            for _ in range(max_attempts):
                random_digits = ''.join([str(random.randint(0, 9)) for _ in range(6)])
                potential_id = f'{year_suffix}{random_digits}'
                
                # Check if this ID already exists
                if not Employee.objects.filter(employee_id=potential_id).exists():
                    self.employee_id = potential_id
                    break
            else:
                # Fallback if somehow all attempts failed
                import uuid
                self.employee_id = f'{year_suffix}{str(uuid.uuid4().int)[:6]}'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{
            self.name} ({
            self.employee_id})" if self.employee_id else self.name


class StaffAttendance(models.Model):
    STATUS = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('on_leave', 'On Leave'),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS, default='present')
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['employee', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.name} - {self.date} - {self.status}"


class PayrollRecord(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='payrolls')
    month = models.IntegerField()
    year = models.IntegerField()
    basic = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'))
    allowances = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'))
    deductions = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'))
    net_pay = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.employee.name} - {self.month}/{self.year} - {self.net_pay}"


# ==================== LEAVE MANAGEMENT ====================


class LeaveType(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class LeaveDefine(models.Model):
    role = models.CharField(
        max_length=200,
        blank=True,
        help_text='Role or designation this definition applies to')
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='definitions')
    days_allowed = models.IntegerField(default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{
            self.role or 'All'} - {
            self.leave_type.name}: {
            self.days_allowed} days"


class LeaveApplication(models.Model):
    STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    applicant = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leave_applications')
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='applications')
    from_date = models.DateField()
    to_date = models.DateField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_leaves')
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{
            self.applicant.name} - {
            self.leave_type.name} ({
            self.status})"


# ==================== ROLE & PERMISSION ====================


class Role(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class LoginPermission(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='login_permissions')
    can_login = models.BooleanField(default=True)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {'Allowed' if self.can_login else 'Blocked'}"


class DueFeesLoginPermission(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='due_fees_permissions')
    allowed_when_due = models.BooleanField(default=False)
    threshold_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{
            self.user.username} - {
            'Allowed' if self.allowed_when_due else 'Blocked'} (thresh {
            self.threshold_amount})"


# ----------------- CHAT / COMMUNICATE / STYLE -----------------


class EmailTemplate(models.Model):
    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=300)
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class SmsTemplate(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class EmailSmsLog(models.Model):
    CHANNELS = [('email', 'Email'), ('sms', 'SMS')]
    channel = models.CharField(max_length=10, choices=CHANNELS)
    to = models.CharField(max_length=500)
    subject = models.CharField(max_length=300, blank=True)
    body = models.TextField(blank=True)
    status = models.CharField(max_length=50, default='sent')
    response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.channel} -> {self.to} ({self.status})"


class ChatInvitation(models.Model):
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_invitations')
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_invitations')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['sender', 'receiver']

    def __str__(self):
        return f"Invite {
            self.sender.username} -> {
            self.receiver.username} ({
            self.status})"


class BlockedChatUser(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blocked_by')
    blocked_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blocked_users')
    reason = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'blocked_user']

    def __str__(self):
        return f"{self.user.username} blocked {self.blocked_user.username}"


class ColorTheme(models.Model):
    title = models.CharField(max_length=200)
    is_active = models.BooleanField(default=False)
    colors = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class BackgroundSetting(models.Model):
    POSITION_CHOICES = [
        ('dashboard', 'Dashboard Background'),
        ('login', 'Login Background'),
    ]
    position = models.CharField(max_length=50, choices=POSITION_CHOICES)
    background_type = models.CharField(
        max_length=20, choices=[
            ('image', 'Image'), ('color', 'Color')])
    value = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.position} - {self.background_type}"


class PaymentTransaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    FEE_TYPE_CHOICES = [
        ('tuition', 'Tuition Fee'),
        ('admission', 'Admission Fee'),
        ('transport', 'Transport Fee'),
        ('library', 'Library Fee'),
        ('exam', 'Exam Fee'),
        ('other', 'Other'),
    ]

    student = models.ForeignKey(
        'Student',
        on_delete=models.CASCADE,
        related_name='payment_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee_type = models.CharField(max_length=50, choices=FEE_TYPE_CHOICES)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending')
    description = models.TextField(blank=True)

    # Stripe integration fields
    payment_intent_id = models.CharField(max_length=255, unique=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True)
    refund_id = models.CharField(max_length=255, blank=True)
    refund_reason = models.TextField(blank=True)
    failure_reason = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.amount} - {self.status}"


class HomeworkSubmission(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('resubmitted', 'Resubmitted'),
        ('graded', 'Graded'),
        ('late', 'Late Submission'),
    ]

    homework = models.ForeignKey(
        'Assignment',
        on_delete=models.CASCADE,
        related_name='homework_submissions')
    student = models.ForeignKey(
        'Student',
        on_delete=models.CASCADE,
        related_name='student_homework_submissions')
    submission_text = models.TextField(blank=True)
    file_path = models.CharField(max_length=500, blank=True)

    # Submission tracking
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='submitted')

    # Grading
    marks_obtained = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_submissions')
    graded_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['homework', 'student']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.homework.title}"

    @property
    def percentage(self):
        if self.marks_obtained and self.homework.total_marks:
            return (self.marks_obtained / self.homework.total_marks) * 100
        return None


# ==================== ACADEMIC YEAR & ADMISSION SYSTEM ====================

class AcademicYear(models.Model):
    """Academic year management"""
    name = models.CharField(max_length=100, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Academic Year'
        verbose_name_plural = 'Academic Years'

    def __str__(self):
        return f"{self.name} ({self.start_date.year}-{self.end_date.year})"

    def save(self, *args, **kwargs):
        # Ensure only one academic year is marked as current
        if self.is_current:
            AcademicYear.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class AdmissionApplication(models.Model):
    """Admission application management"""
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted'),
        ('admitted', 'Admitted'),
        ('cancelled', 'Cancelled'),
    ]

    # Applicant Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(
        max_length=10,
        choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    )
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    
    # Academic Information
    applying_for_class = models.CharField(max_length=50)
    previous_school = models.CharField(max_length=200, blank=True)
    previous_grade = models.CharField(max_length=50, blank=True)
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    
    # Parent/Guardian Information
    parent_name = models.CharField(max_length=200)
    parent_email = models.EmailField()
    parent_phone = models.CharField(max_length=20)
    parent_occupation = models.CharField(max_length=100, blank=True)
    
    # Application Status
    application_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    priority = models.IntegerField(default=0)
    
    # Documents
    birth_certificate = models.CharField(max_length=500, blank=True)
    previous_report_card = models.CharField(max_length=500, blank=True)
    transfer_certificate = models.CharField(max_length=500, blank=True)
    medical_records = models.CharField(max_length=500, blank=True)
    photo = models.CharField(max_length=500, blank=True)
    
    # Application Processing
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    
    # Admission Details (if approved)
    student = models.OneToOneField(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admission_application'
    )
    admission_date = models.DateField(null=True, blank=True)
    
    # Timestamps
    applied_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_date']
        indexes = [
            models.Index(fields=['status', 'applied_date']),
            models.Index(fields=['application_number']),
        ]

    def __str__(self):
        return f"{self.application_number} - {self.first_name} {self.last_name}"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class StudentPromotion(models.Model):
    """Track student promotions between classes"""
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='promotions'
    )
    from_class = models.CharField(max_length=50)
    to_class = models.CharField(max_length=50)
    from_academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='promotions_from'
    )
    to_academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='promotions_to'
    )
    promotion_date = models.DateField(auto_now_add=True)
    remarks = models.TextField(blank=True)
    promoted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-promotion_date']

    def __str__(self):
        return f"{self.student.get_full_name()}: {self.from_class} → {self.to_class}"


# ==================== ENHANCED EXAM SYSTEM ====================

class ExamSession(models.Model):
    """Track individual student exam sessions for online exams"""
    exam = models.ForeignKey(
        'Exam',
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='exam_sessions'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_submitted = models.BooleanField(default=False)
    auto_graded_marks = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Proctoring
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    tab_switches = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['exam', 'student']
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.exam.name}"


class QuestionAnswer(models.Model):
    """Store student answers for exam questions"""
    session = models.ForeignKey(
        ExamSession,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        'Question',
        on_delete=models.CASCADE,
        related_name='student_answers'
    )
    answer_text = models.TextField(blank=True)
    selected_option = models.CharField(max_length=10, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    marks_awarded = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['session', 'question']

    def __str__(self):
        return f"{self.session.student.get_full_name()} - Q{self.question.id}"


# ==================== PROGRESS CARD & MERIT SYSTEM ====================

class ProgressCard(models.Model):
    """Student progress card/report card"""
    TERM_CHOICES = [
        ('1', 'Term 1'),
        ('2', 'Term 2'),
        ('3', 'Term 3'),
        ('annual', 'Annual'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='progress_cards'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='progress_cards'
    )
    term = models.CharField(max_length=10, choices=TERM_CHOICES)
    class_name = models.CharField(max_length=50)
    
    # Overall Performance
    total_marks = models.DecimalField(max_digits=6, decimal_places=2)
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    grade = models.CharField(max_length=5)
    rank = models.IntegerField(null=True, blank=True)
    
    # Attendance
    total_days = models.IntegerField(default=0)
    days_present = models.IntegerField(default=0)
    attendance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Comments
    class_teacher_remarks = models.TextField(blank=True)
    principal_remarks = models.TextField(blank=True)
    
    # Status
    is_published = models.BooleanField(default=False)
    published_date = models.DateField(null=True, blank=True)
    parent_signature = models.BooleanField(default=False)
    parent_signature_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'academic_year', 'term']
        ordering = ['-academic_year', 'term', 'rank']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.term} - {self.academic_year.name}"

    def calculate_gpa(self):
        """Calculate GPA based on percentage"""
        if self.percentage >= 90:
            return Decimal('4.0')
        elif self.percentage >= 80:
            return Decimal('3.5')
        elif self.percentage >= 70:
            return Decimal('3.0')
        elif self.percentage >= 60:
            return Decimal('2.5')
        elif self.percentage >= 50:
            return Decimal('2.0')
        else:
            return Decimal('1.0')


class ProgressCardSubject(models.Model):
    """Subject-wise marks in progress card"""
    progress_card = models.ForeignKey(
        ProgressCard,
        on_delete=models.CASCADE,
        related_name='subject_marks'
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE
    )
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=5)
    teacher_remarks = models.TextField(blank=True)

    class Meta:
        unique_together = ['progress_card', 'subject']

    def __str__(self):
        return f"{self.progress_card.student.get_full_name()} - {self.subject.title}"


class MeritList(models.Model):
    """Merit list for classes"""
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='merit_lists'
    )
    class_name = models.CharField(max_length=50)
    term = models.CharField(
        max_length=10,
        choices=ProgressCard.TERM_CHOICES
    )
    generated_date = models.DateField(auto_now_add=True)
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    is_published = models.BooleanField(default=False)

    class Meta:
        unique_together = ['academic_year', 'class_name', 'term']
        ordering = ['-generated_date']

    def __str__(self):
        return f"Merit List - {self.class_name} - {self.term} - {self.academic_year.name}"


class MeritListEntry(models.Model):
    """Individual entries in merit list"""
    merit_list = models.ForeignKey(
        MeritList,
        on_delete=models.CASCADE,
        related_name='entries'
    )
    rank = models.IntegerField()
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='merit_entries'
    )
    progress_card = models.ForeignKey(
        ProgressCard,
        on_delete=models.CASCADE,
        related_name='merit_entries'
    )
    total_marks = models.DecimalField(max_digits=6, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ['merit_list', 'rank']
        ordering = ['rank']

    def __str__(self):
        return f"Rank {self.rank} - {self.student.get_full_name()}"


# ==================== PHASE 3: ENHANCED HR & ADMINISTRATIVE MODULES ====================


# ==================== ENHANCED PAYROLL SYSTEM ====================

class SalaryGrade(models.Model):
    """Salary grade structure for employees"""
    grade = models.CharField(max_length=50, unique=True)  # e.g., "Grade A", "Grade B"
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['grade']

    def __str__(self):
        return f"{self.grade} - {self.basic_salary}"


class AllowanceType(models.Model):
    """Types of allowances (HRA, Transport, Medical, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_taxable = models.BooleanField(default=True)
    is_percentage = models.BooleanField(default=False)  # If True, calculate as % of basic
    percentage_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class DeductionType(models.Model):
    """Types of deductions (Tax, PF, Insurance, Loan, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_mandatory = models.BooleanField(default=False)
    is_percentage = models.BooleanField(default=False)
    percentage_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class EmployeeSalaryStructure(models.Model):
    """Individual employee salary structure"""
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='salary_structure')
    salary_grade = models.ForeignKey(SalaryGrade, on_delete=models.SET_NULL, null=True, blank=True)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    effective_date = models.DateField()
    bank_account = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    pan_number = models.CharField(max_length=20, blank=True)
    tax_regime = models.CharField(max_length=20, choices=[('old', 'Old'), ('new', 'New')], default='new')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_date']

    def __str__(self):
        return f"{self.employee.name} - {self.basic_salary}"


class EmployeeAllowance(models.Model):
    """Employee-specific allowances"""
    salary_structure = models.ForeignKey(EmployeeSalaryStructure, on_delete=models.CASCADE, related_name='allowances')
    allowance_type = models.ForeignKey(AllowanceType, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['salary_structure', 'allowance_type']

    def __str__(self):
        return f"{self.salary_structure.employee.name} - {self.allowance_type.name}: {self.amount}"


class EmployeeDeduction(models.Model):
    """Employee-specific deductions"""
    salary_structure = models.ForeignKey(EmployeeSalaryStructure, on_delete=models.CASCADE, related_name='deductions')
    deduction_type = models.ForeignKey(DeductionType, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['salary_structure', 'deduction_type']

    def __str__(self):
        return f"{self.salary_structure.employee.name} - {self.deduction_type.name}: {self.amount}"


class Payslip(models.Model):
    """Enhanced payslip with detailed breakdown"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('generated', 'Generated'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')
    salary_structure = models.ForeignKey(EmployeeSalaryStructure, on_delete=models.SET_NULL, null=True, blank=True)
    month = models.IntegerField()
    year = models.IntegerField()
    
    # Salary components
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    total_allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Additional info
    working_days = models.IntegerField(default=0)
    present_days = models.IntegerField(default=0)
    leaves_taken = models.IntegerField(default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)  # Bank Transfer, Cash, Cheque
    remarks = models.TextField(blank=True)
    
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_payslips')
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['employee', 'month', 'year']
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.employee.name} - {self.month}/{self.year} - {self.net_salary}"

    def calculate_gross(self):
        return self.basic_salary + self.total_allowances

    def calculate_net(self):
        return self.gross_salary - self.total_deductions


class PayslipAllowance(models.Model):
    """Allowance items in a payslip"""
    payslip = models.ForeignKey(Payslip, on_delete=models.CASCADE, related_name='allowance_items')
    allowance_type = models.ForeignKey(AllowanceType, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.payslip} - {self.allowance_type.name}: {self.amount}"


class PayslipDeduction(models.Model):
    """Deduction items in a payslip"""
    payslip = models.ForeignKey(Payslip, on_delete=models.CASCADE, related_name='deduction_items')
    deduction_type = models.ForeignKey(DeductionType, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.payslip} - {self.deduction_type.name}: {self.amount}"


# ==================== ENHANCED LEAVE MANAGEMENT ====================

class LeavePolicy(models.Model):
    """Leave policies for different employee types"""
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class LeavePolicyRule(models.Model):
    """Rules for each leave type in a policy"""
    policy = models.ForeignKey(LeavePolicy, on_delete=models.CASCADE, related_name='rules')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    annual_quota = models.IntegerField(default=0)
    max_consecutive_days = models.IntegerField(default=0, help_text="0 means unlimited")
    carry_forward = models.BooleanField(default=False)
    max_carry_forward = models.IntegerField(default=0)
    requires_approval = models.BooleanField(default=True)
    min_advance_days = models.IntegerField(default=0, help_text="Minimum days to apply in advance")

    class Meta:
        unique_together = ['policy', 'leave_type']

    def __str__(self):
        return f"{self.policy.name} - {self.leave_type.name}: {self.annual_quota} days"


class EmployeeLeaveBalance(models.Model):
    """Track leave balance for each employee"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year = models.IntegerField()
    total_allocated = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    used = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    carried_forward = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    
    class Meta:
        unique_together = ['employee', 'leave_type', 'year']
        ordering = ['-year']

    def __str__(self):
        return f"{self.employee.name} - {self.leave_type.name} ({self.year}): {self.available()}/{self.total_allocated}"

    def available(self):
        return float(self.total_allocated) + float(self.carried_forward) - float(self.used)


# ==================== EXPENSE MANAGEMENT ====================

class ExpenseCategory(models.Model):
    """Categories for expense claims"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    requires_receipt = models.BooleanField(default=True)
    max_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Expense Categories'

    def __str__(self):
        return self.name


class ExpenseClaim(models.Model):
    """Employee expense claims"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
    ]

    claim_number = models.CharField(max_length=50, unique=True, blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='expense_claims')
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    expense_date = models.DateField()
    receipt_image = models.ImageField(upload_to='expenses/', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_expenses')
    approved_at = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(blank=True)
    payment_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.claim_number} - {self.employee.name}: {self.amount}"

    def save(self, *args, **kwargs):
        if not self.claim_number:
            from django.utils import timezone
            year = timezone.now().year
            count = ExpenseClaim.objects.filter(created_at__year=year).count() + 1
            self.claim_number = f"EXP{year}{count:05d}"
        super().save(*args, **kwargs)


# ==================== ASSET MANAGEMENT ====================

class AssetCategory(models.Model):
    """Categories for institutional assets"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    depreciation_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Annual depreciation %")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Asset Categories'

    def __str__(self):
        return self.name


class Asset(models.Model):
    """Institutional assets tracking"""
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('maintenance', 'Under Maintenance'),
        ('retired', 'Retired'),
        ('damaged', 'Damaged'),
        ('lost', 'Lost'),
    ]

    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]

    asset_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(AssetCategory, on_delete=models.SET_NULL, null=True, related_name='assets')
    description = models.TextField(blank=True)
    
    # Purchase details
    purchase_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    vendor = models.CharField(max_length=200, blank=True)
    invoice_number = models.CharField(max_length=100, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    
    # Current details
    current_value = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    location = models.CharField(max_length=200, blank=True)
    
    # Additional info
    serial_number = models.CharField(max_length=100, blank=True)
    model_number = models.CharField(max_length=100, blank=True)
    manufacturer = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='assets/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.asset_code} - {self.name}"


class AssetAssignment(models.Model):
    """Track asset assignments to employees"""
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='assignments')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='asset_assignments')
    assigned_date = models.DateField()
    expected_return_date = models.DateField(null=True, blank=True)
    returned_date = models.DateField(null=True, blank=True)
    condition_at_assignment = models.CharField(max_length=20, choices=Asset.CONDITION_CHOICES)
    condition_at_return = models.CharField(max_length=20, choices=Asset.CONDITION_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-assigned_date']

    def __str__(self):
        return f"{self.asset.name} → {self.employee.name} ({self.assigned_date})"


class AssetMaintenance(models.Model):
    """Track asset maintenance history"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenance_records')
    maintenance_type = models.CharField(max_length=100)  # Repair, Servicing, Inspection
    description = models.TextField()
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vendor = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    performed_by = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-scheduled_date']

    def __str__(self):
        return f"{self.asset.name} - {self.maintenance_type} ({self.scheduled_date})"


# ==================== ENHANCED ACCOUNTING ====================

class AccountGroup(models.Model):
    """Group accounts into categories"""
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class JournalEntry(models.Model):
    """Journal entries for double-entry accounting"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('cancelled', 'Cancelled'),
    ]

    entry_number = models.CharField(max_length=50, unique=True, blank=True)
    entry_date = models.DateField()
    description = models.TextField()
    reference = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    total_debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    posted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-entry_date']
        verbose_name_plural = 'Journal Entries'

    def __str__(self):
        return f"{self.entry_number} - {self.entry_date}"

    def save(self, *args, **kwargs):
        if not self.entry_number:
            from django.utils import timezone
            year = timezone.now().year
            count = JournalEntry.objects.filter(entry_date__year=year).count() + 1
            self.entry_number = f"JE{year}{count:06d}"
        super().save(*args, **kwargs)

    def is_balanced(self):
        return abs(float(self.total_debit) - float(self.total_credit)) < 0.01


class JournalEntryLine(models.Model):
    """Individual line items in a journal entry"""
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey('ChartOfAccount', on_delete=models.CASCADE)
    description = models.CharField(max_length=200, blank=True)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.journal_entry.entry_number} - {self.account.name}: Dr {self.debit} / Cr {self.credit}"


class BudgetAllocation(models.Model):
    """Budget allocations for departments/categories"""
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='budgets')
    account = models.ForeignKey('ChartOfAccount', on_delete=models.CASCADE)
    fiscal_year = models.IntegerField()
    allocated_amount = models.DecimalField(max_digits=12, decimal_places=2)
    spent_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    remarks = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['department', 'account', 'fiscal_year']
        ordering = ['-fiscal_year']

    def __str__(self):
        return f"{self.department.name} - {self.account.name} ({self.fiscal_year})"

    def remaining_budget(self):
        return float(self.allocated_amount) - float(self.spent_amount)

    def budget_utilization_percentage(self):
        if float(self.allocated_amount) > 0:
            return (float(self.spent_amount) / float(self.allocated_amount)) * 100
        return 0


# ============================================
# Import New Module Models (Non-Conflicting Only)
# ============================================
# NOTE: Many models already exist in this file (3297 lines)
# ============================================
# NEW MODEL IMPORTS - TEMPORARILY DISABLED
# ============================================
# These imports are commented out due to model conflicts.
# The models already exist in this file (models.py).
# Keep these model files as reference architecture.
# Strategy: Create serializers and ViewSets for existing models instead.
# ============================================

# # Utility Models - CONFLICTS: Complaint, ComplaintCategory already exist
# from .models_utility import (
#     VisitorLog, CallLog,
#     PostalDispatchType, PostalDispatch, PostalReceive,
#     AuditLog, SystemSetting
# )

# # Admission & Student Management Models - NEW (can be imported later if needed)
# from .models_admission import (
#     AdmissionSession, AdmissionApplication, StudentPromotion,
#     BulkImportLog, StudentTransfer
# )

# # HR Models - CONFLICTS: Department, LeaveType, LeaveApplication already exist
# from .models_hr import (
#     Designation, EmployeeDetails, PayrollComponent, PayrollRun,
#     Payslip, PayslipComponent, Holiday
# )

# # Academic Models - CONFLICTS: AcademicYear, Exam already exist
# from .models_academic import (
#     ExamType, ExamMark, ExamResult, GradeScale, Homework,
#     HomeworkSubmission, LessonPlan, ClassRoutine, StaffAttendance
# )

# ============================================
# TOTAL NEW MODELS ADDED: 29 models
# ============================================
# Utility: 9 models
# Admission: 5 models  
# HR: 6 models
# Academic: 9 models
# NOTE: Accounting models already exist in this file
# ============================================
