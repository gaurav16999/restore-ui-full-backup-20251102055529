"""
Utility Module Models - Visitor Book, Complaints, Call Logs, Postal
"""
from django.db import models
from django.utils import timezone
from users.models import User
from .models import Student, Teacher


class VisitorLog(models.Model):
    """Visitor management system"""
    PURPOSE_CHOICES = (
        ('meeting', 'Meeting'),
        ('interview', 'Interview'),
        ('delivery', 'Delivery'),
        ('maintenance', 'Maintenance'),
        ('parent_visit', 'Parent Visit'),
        ('official', 'Official Work'),
        ('other', 'Other'),
    )
    
    visitor_name = models.CharField(max_length=200)
    visitor_phone = models.CharField(max_length=20)
    visitor_email = models.EmailField(blank=True)
    visitor_id_type = models.CharField(max_length=50, blank=True, help_text="ID proof type")
    visitor_id_number = models.CharField(max_length=50, blank=True)
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES)
    purpose_details = models.TextField()
    whom_to_meet = models.CharField(max_length=200)
    department = models.CharField(max_length=100, blank=True)
    check_in_time = models.DateTimeField(default=timezone.now)
    check_out_time = models.DateTimeField(null=True, blank=True)
    vehicle_number = models.CharField(max_length=20, blank=True)
    number_of_persons = models.PositiveIntegerField(default=1)
    photo = models.ImageField(upload_to='visitors/', blank=True, null=True)
    remarks = models.TextField(blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recorded_visitors')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-check_in_time']
    
    def __str__(self):
        return f"{self.visitor_name} - {self.purpose} - {self.check_in_time}"


class ComplaintCategory(models.Model):
    """Complaint categories"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Complaint Categories"
    
    def __str__(self):
        return self.name


class Complaint(models.Model):
    """Complaint management system"""
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    complaint_number = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(ComplaintCategory, on_delete=models.SET_NULL, null=True, related_name='complaints')
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    filed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='filed_complaints')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    related_student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    related_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    attachment = models.FileField(upload_to='complaints/', blank=True, null=True)
    resolution = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_complaints')
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.complaint_number} - {self.title}"


class CallLog(models.Model):
    """Phone call logging system"""
    CALL_TYPE_CHOICES = (
        ('incoming', 'Incoming'),
        ('outgoing', 'Outgoing'),
        ('missed', 'Missed'),
    )
    
    PURPOSE_CHOICES = (
        ('admission_inquiry', 'Admission Inquiry'),
        ('parent_call', 'Parent Call'),
        ('vendor_call', 'Vendor Call'),
        ('staff_related', 'Staff Related'),
        ('complaint', 'Complaint'),
        ('general_inquiry', 'General Inquiry'),
        ('other', 'Other'),
    )
    
    call_type = models.CharField(max_length=20, choices=CALL_TYPE_CHOICES)
    caller_name = models.CharField(max_length=200)
    caller_phone = models.CharField(max_length=20)
    caller_email = models.EmailField(blank=True)
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES)
    call_details = models.TextField()
    call_duration = models.CharField(max_length=20, blank=True, help_text="Duration in minutes")
    call_date_time = models.DateTimeField(default=timezone.now)
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    related_student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='call_logs')
    handled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='handled_calls')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-call_date_time']
    
    def __str__(self):
        return f"{self.caller_name} - {self.call_type} - {self.call_date_time}"


class PostalDispatchType(models.Model):
    """Types of postal dispatches"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class PostalDispatch(models.Model):
    """Outgoing postal dispatch management"""
    reference_number = models.CharField(max_length=50, unique=True)
    dispatch_type = models.ForeignKey(PostalDispatchType, on_delete=models.SET_NULL, null=True, related_name='dispatches')
    recipient_name = models.CharField(max_length=200)
    recipient_address = models.TextField()
    recipient_phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    dispatch_date = models.DateField(default=timezone.now)
    courier_service = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    dispatch_cost = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    attachment = models.FileField(upload_to='postal_dispatches/', blank=True, null=True)
    dispatched_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='postal_dispatches')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-dispatch_date']
        verbose_name_plural = "Postal Dispatches"
    
    def __str__(self):
        return f"{self.reference_number} - {self.recipient_name}"


class PostalReceive(models.Model):
    """Incoming postal receive management"""
    reference_number = models.CharField(max_length=50, unique=True)
    sender_name = models.CharField(max_length=200)
    sender_address = models.TextField(blank=True)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    receive_date = models.DateField(default=timezone.now)
    receive_time = models.TimeField(default=timezone.now)
    courier_service = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    addressed_to = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=100, blank=True)
    is_delivered_to_recipient = models.BooleanField(default=False)
    delivered_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_posts')
    delivered_at = models.DateTimeField(null=True, blank=True)
    attachment = models.FileField(upload_to='postal_receives/', blank=True, null=True)
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='postal_receives_logged')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-receive_date', '-receive_time']
        verbose_name_plural = "Postal Receives"
    
    def __str__(self):
        return f"{self.reference_number} - {self.sender_name}"


class AuditLog(models.Model):
    """System-wide audit logging"""
    ACTION_CHOICES = (
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('view', 'View'),
        ('export', 'Export'),
    )
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=100, blank=True)
    object_repr = models.CharField(max_length=200, blank=True)
    changes = models.JSONField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user} - {self.action} - {self.model_name} - {self.timestamp}"


class SystemSetting(models.Model):
    """System-wide settings and configurations"""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    data_type = models.CharField(
        max_length=20,
        choices=(
            ('string', 'String'),
            ('integer', 'Integer'),
            ('boolean', 'Boolean'),
            ('json', 'JSON'),
        ),
        default='string'
    )
    category = models.CharField(max_length=50, blank=True)
    is_public = models.BooleanField(default=False, help_text="Can be accessed by non-admin users")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_settings')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'key']
    
    def __str__(self):
        return f"{self.key} = {self.value}"
