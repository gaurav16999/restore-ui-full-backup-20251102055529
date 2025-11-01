"""
HR & Payroll Module Models
NOTE: Department and LeaveType already exist in models.py
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
from users.models import User
from .models import Teacher, Department, LeaveType, Designation, LeaveApplication, Payslip


# Department already exists in models.py
# class Department(models.Model):
#     """Organization departments"""
#     name = models.CharField(max_length=100, unique=True)
#     code = models.CharField(max_length=20, unique=True)
#     description = models.TextField(blank=True)
#     head = models.ForeignKey(
#         Teacher,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='headed_department'
#     )
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     
#     def __str__(self):
#         return self.name


# Designation already exists in models.py - DO NOT DUPLICATE
# class Designation(models.Model):
#     """Employee designations/positions"""
#     name = models.CharField(max_length=100, unique=True)
#     code = models.CharField(max_length=20, unique=True)
#     description = models.TextField(blank=True)
#     level = models.PositiveIntegerField(default=1, help_text="Hierarchy level")
#     is_active = models.BooleanField(default=True)
#     
#     class Meta:
#         ordering = ['level', 'name']
#     
#     def __str__(self):
#         return self.name


class EmployeeDetails(models.Model):
    """Extended employee information"""
    EMPLOYMENT_TYPE_CHOICES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary'),
    )
    
    teacher = models.OneToOneField(Teacher, on_delete=models.CASCADE, related_name='employee_details')
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, related_name='employees')
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    date_of_joining = models.DateField()
    date_of_leaving = models.DateField(null=True, blank=True)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    bank_account_name = models.CharField(max_length=200, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_branch = models.CharField(max_length=100, blank=True)
    bank_ifsc = models.CharField(max_length=20, blank=True)
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    tax_id = models.CharField(max_length=50, blank=True, help_text="Tax ID/SSN/PAN")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Employee Details"
        verbose_name_plural = "Employee Details"
    
    def __str__(self):
        return f"{self.teacher.user.get_full_name()} - {self.employee_id}"


# LeaveType already exists in models.py
# class LeaveType(models.Model):
#     """Types of leave available"""
#     name = models.CharField(max_length=100, unique=True)
#     code = models.CharField(max_length=20, unique=True)
#     description = models.TextField(blank=True)
#     days_allowed_per_year = models.PositiveIntegerField(default=0)
#     is_paid = models.BooleanField(default=True)
#     requires_approval = models.BooleanField(default=True)
#     is_active = models.BooleanField(default=True)
#     
#     def __str__(self):
#         return self.name


# LeaveApplication already exists in models.py - DO NOT DUPLICATE
# class LeaveApplication(models.Model):
#     """Leave application requests"""
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('approved', 'Approved'),
#         ('rejected', 'Rejected'),
#         ('cancelled', 'Cancelled'),
#     )
#     
#     employee = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='leave_applications')
#     leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name='applications')
#     start_date = models.DateField()
#     end_date = models.DateField()
#     total_days = models.PositiveIntegerField()
#     reason = models.TextField()
#     attachment = models.FileField(upload_to='leave_applications/', blank=True, null=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     applied_date = models.DateTimeField(auto_now_add=True)
#     reviewed_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='reviewed_leave_applications'
#     )
#     reviewed_date = models.DateTimeField(null=True, blank=True)
#     review_remarks = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     
#     class Meta:
#         ordering = ['-applied_date']
#     
#     def __str__(self):
#         return f"{self.employee.user.get_full_name()} - {self.leave_type.name} ({self.start_date} to {self.end_date})"
#     
#     def save(self, *args, **kwargs):
#         # Calculate total days
#         if self.start_date and self.end_date:
#             self.total_days = (self.end_date - self.start_date).days + 1
#         super().save(*args, **kwargs)


class PayrollComponent(models.Model):
    """Salary components (allowances, deductions)"""
    COMPONENT_TYPE_CHOICES = (
        ('earning', 'Earning'),
        ('deduction', 'Deduction'),
    )
    
    CALCULATION_TYPE_CHOICES = (
        ('fixed', 'Fixed Amount'),
        ('percentage', 'Percentage of Basic'),
    )
    
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    component_type = models.CharField(max_length=20, choices=COMPONENT_TYPE_CHOICES)
    calculation_type = models.CharField(max_length=20, choices=CALCULATION_TYPE_CHOICES, default='fixed')
    default_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    is_taxable = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.component_type})"


class PayrollRun(models.Model):
    """Monthly payroll processing"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('processed', 'Processed'),
        ('paid', 'Paid'),
    )
    
    month = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    year = models.PositiveIntegerField()
    run_date = models.DateField(default=timezone.now)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='processed_payrolls')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    total_employees = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['month', 'year']
        ordering = ['-year', '-month']
    
    def __str__(self):
        return f"Payroll {self.month}/{self.year} - {self.status}"


# Payslip already exists in models.py - DO NOT DUPLICATE
# class Payslip(models.Model):
#     """Individual employee payslips"""
#     payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='payslips')
#     employee = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='payslips')
#     basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
#     total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
#     total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
#     net_salary = models.DecimalField(max_digits=10, decimal_places=2)
#     payment_date = models.DateField(null=True, blank=True)
#     payment_method = models.CharField(max_length=50, blank=True)
#     payment_reference = models.CharField(max_length=100, blank=True)
#     remarks = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     
#     class Meta:
#         unique_together = ['payroll_run', 'employee']
#         ordering = ['-payroll_run__year', '-payroll_run__month']
#     
#     def __str__(self):
#         return f"{self.employee.user.get_full_name()} - {self.payroll_run.month}/{self.payroll_run.year}"


class PayslipComponent(models.Model):
    """Individual components in payslip"""
    payslip = models.ForeignKey(Payslip, on_delete=models.CASCADE, related_name='components')
    component = models.ForeignKey(PayrollComponent, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.payslip.employee.user.get_full_name()} - {self.component.name}: {self.amount}"


class Holiday(models.Model):
    """Holiday calendar"""
    name = models.CharField(max_length=200)
    date = models.DateField()
    is_optional = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['date']
    
    def __str__(self):
        return f"{self.name} - {self.date}"
