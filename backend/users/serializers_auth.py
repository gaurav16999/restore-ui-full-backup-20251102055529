"""
Enhanced User Serializers for Authentication Features
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile with all details"""
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'role',
            'phone', 'profile_picture', 'date_of_birth', 'address',
            'email_verified', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email_verified', 'created_at', 'updated_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Update user profile"""
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'profile_picture',
            'date_of_birth', 'address'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Change password with current password verification"""
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "New passwords do not match"
            })
        
        # Validate new password strength
        try:
            validate_password(data['new_password'], self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """Request password reset - sends email with token"""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address")
        return value


class PasswordResetVerifySerializer(serializers.Serializer):
    """Verify password reset token"""
    token = serializers.CharField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Reset password with token"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match"
            })
        
        # Validate password strength
        try:
            validate_password(data['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        
        return data


class EmailVerificationRequestSerializer(serializers.Serializer):
    """Request email verification code"""
    pass  # Uses authenticated user's email


class EmailVerificationConfirmSerializer(serializers.Serializer):
    """Verify email with code"""
    code = serializers.CharField(required=True, max_length=6, min_length=6)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Verification code must be 6 digits")
        return value


class ProfilePictureUploadSerializer(serializers.ModelSerializer):
    """Upload profile picture"""
    class Meta:
        model = User
        fields = ['profile_picture']
