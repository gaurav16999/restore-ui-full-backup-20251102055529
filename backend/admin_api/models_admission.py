"""
Admission & Student Management Module Models
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
from users.models import User
from .models import Student, ClassRoom
from .models_academic import AcademicYear


class AdmissionSession(models.Model):
    """Admission session/cycle management"""
    name = models.CharField(max_length=100, unique=True)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='admission_sessions')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    max_applications = models.PositiveIntegerField(null=True, blank=True)
    application_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return self.name


class AdmissionApplication(models.Model):
    """Student admission applications"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('admitted', 'Admitted'),
        ('cancelled', 'Cancelled'),
    )
    
    application_number = models.CharField(max_length=50, unique=True)
    session = models.ForeignKey(AdmissionSession, on_delete=models.CASCADE, related_name='applications')
    
    # Student Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=(('male', 'Male'), ('female', 'Female'), ('other', 'Other')))
    blood_group = models.CharField(max_length=10, blank=True)
    nationality = models.CharField(max_length=100, default='Indian')
    religion = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=50, blank=True, help_text="General, OBC, SC, ST, etc.")
    
    # Contact Information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20)
    
    # Parent/Guardian Information
    father_name = models.CharField(max_length=200)
    father_phone = models.CharField(max_length=20, blank=True)
    father_email = models.EmailField(blank=True)
    father_occupation = models.CharField(max_length=100, blank=True)
    father_annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    mother_name = models.CharField(max_length=200)
    mother_phone = models.CharField(max_length=20, blank=True)
    mother_email = models.EmailField(blank=True)
    mother_occupation = models.CharField(max_length=100, blank=True)
    mother_annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    guardian_name = models.CharField(max_length=200, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)
    guardian_email = models.EmailField(blank=True)
    guardian_relation = models.CharField(max_length=50, blank=True)
    
    # Academic Information
    applying_for_class = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='applications')
    previous_school = models.CharField(max_length=200, blank=True)
    previous_class = models.CharField(max_length=50, blank=True)
    previous_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Documents
    student_photo = models.ImageField(upload_to='admissions/photos/', blank=True, null=True)
    birth_certificate = models.FileField(upload_to='admissions/documents/', blank=True, null=True)
    previous_marksheet = models.FileField(upload_to='admissions/documents/', blank=True, null=True)
    transfer_certificate = models.FileField(upload_to='admissions/documents/', blank=True, null=True)
    address_proof = models.FileField(upload_to='admissions/documents/', blank=True, null=True)
    
    # Application Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    application_fee_paid = models.BooleanField(default=False)
    payment_reference = models.CharField(max_length=100, blank=True)
    interview_date = models.DateField(null=True, blank=True)
    interview_time = models.TimeField(null=True, blank=True)
    interview_remarks = models.TextField(blank=True)
    
    # Review
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_remarks = models.TextField(blank=True)
    
    # Admission
    admitted_student = models.OneToOneField(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='admission_application')
    admission_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.application_number} - {self.first_name} {self.last_name}"


class StudentPromotion(models.Model):
    """Student promotion/demotion tracking"""
    ACTION_CHOICES = (
        ('promoted', 'Promoted'),
        ('demoted', 'Demoted'),
        ('retained', 'Retained'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='promotions')
    from_class = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='promoted_from')
    to_class = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='promoted_to')
    from_academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='promotion_from_year')
    to_academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='promotion_to_year')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default='promoted')
    promotion_date = models.DateField(default=timezone.now)
    remarks = models.TextField(blank=True)
    promoted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='student_promotions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-promotion_date']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.action} from {self.from_class.name} to {self.to_class.name}"


class BulkImportLog(models.Model):
    """Track bulk import operations"""
    IMPORT_TYPE_CHOICES = (
        ('students', 'Students'),
        ('teachers', 'Teachers'),
        ('fees', 'Fees'),
        ('marks', 'Marks'),
        ('attendance', 'Attendance'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('partial', 'Partial Success'),
    )
    
    import_type = models.CharField(max_length=20, choices=IMPORT_TYPE_CHOICES)
    file = models.FileField(upload_to='bulk_imports/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_records = models.PositiveIntegerField(default=0)
    successful_records = models.PositiveIntegerField(default=0)
    failed_records = models.PositiveIntegerField(default=0)
    errors = models.JSONField(blank=True, null=True)
    imported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='bulk_imports')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.import_type} - {self.status} - {self.created_at}"


class StudentTransfer(models.Model):
    """Student transfer/withdrawal tracking"""
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='transfers')
    transfer_date = models.DateField(default=timezone.now)
    reason = models.TextField()
    transfer_to_school = models.CharField(max_length=200, blank=True)
    transfer_to_city = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    remarks = models.TextField(blank=True)
    request_date = models.DateField(auto_now_add=True)
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='student_transfer_requests')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_transfers')
    approved_at = models.DateTimeField(null=True, blank=True)
    transfer_certificate_issued = models.BooleanField(default=False)
    transfer_certificate_number = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-transfer_date']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - Transfer - {self.transfer_date}"
