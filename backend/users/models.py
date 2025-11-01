from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
import random
import string


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
        ('parent', 'Parent'),
        ('staff', 'Staff'),
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student')
    email = models.EmailField(unique=True)  # Make email unique and required

    # Email verification fields
    email_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, null=True, blank=True)
    verification_code_expires = models.DateTimeField(null=True, blank=True)

    # Password reset fields
    password_reset_token = models.CharField(max_length=100, null=True, blank=True)
    password_reset_expires = models.DateTimeField(null=True, blank=True)

    # Additional profile fields
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    
    # Security
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'  # Use email for authentication
    # Username is still required but not for login
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"
    
    def generate_verification_code(self):
        """Generate 6-digit verification code"""
        self.verification_code = ''.join(random.choices(string.digits, k=6))
        self.verification_code_expires = timezone.now() + timedelta(hours=24)
        self.save()
        return self.verification_code
    
    def verify_email_code(self, code):
        """Verify email with code"""
        if not self.verification_code or not self.verification_code_expires:
            return False
        if timezone.now() > self.verification_code_expires:
            return False
        if self.verification_code == code:
            self.email_verified = True
            self.verification_code = None
            self.verification_code_expires = None
            self.save()
            return True
        return False
    
    def generate_password_reset_token(self):
        """Generate password reset token"""
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
        self.password_reset_token = token
        self.password_reset_expires = timezone.now() + timedelta(hours=1)
        self.save()
        return token
    
    def verify_password_reset_token(self, token):
        """Verify password reset token"""
        if not self.password_reset_token or not self.password_reset_expires:
            return False
        if timezone.now() > self.password_reset_expires:
            return False
        return self.password_reset_token == token
    
    def is_account_locked(self):
        """Check if account is locked"""
        if self.account_locked_until:
            if timezone.now() < self.account_locked_until:
                return True
            else:
                # Unlock account if lock period has expired
                self.account_locked_until = None
                self.failed_login_attempts = 0
                self.save()
        return False


class RefreshTokenBlacklist(models.Model):
    """Blacklisted refresh tokens for logout"""
    token = models.TextField(unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blacklisted_tokens')
    blacklisted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-blacklisted_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.blacklisted_at}"
