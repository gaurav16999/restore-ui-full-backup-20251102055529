"""
Enhanced Authentication Views
"""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from .serializers_auth import (
    UserProfileSerializer, UserProfileUpdateSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, PasswordResetVerifySerializer, PasswordResetConfirmSerializer,
    EmailVerificationRequestSerializer, EmailVerificationConfirmSerializer, ProfilePictureUploadSerializer
)

User = get_user_model()


class UserProfileViewSet(viewsets.GenericViewSet):
    """
    User profile management with authentication enhancements
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """Update user profile"""
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return full profile
        profile_serializer = UserProfileSerializer(request.user)
        return Response(profile_serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change password"""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Set new password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({
            'message': 'Password changed successfully',
            'success': True
        })

    @action(detail=False, methods=['post'])
    def upload_profile_picture(self, request):
        """Upload profile picture"""
        serializer = ProfilePictureUploadSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Profile picture uploaded successfully',
            'profile_picture': request.user.profile_picture.url if request.user.profile_picture else None
        })


class PasswordResetViewSet(viewsets.GenericViewSet):
    """
    Password reset workflow
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def request_reset(self, request):
        """Request password reset - sends email with token"""
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate reset token
        token = user.generate_password_reset_token()
        
        # Send email
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        try:
            send_mail(
                subject='Password Reset Request',
                message=f'''
Hello {user.first_name or user.username},

You requested to reset your password. Click the link below to reset:

{reset_url}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
EduManage Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Password reset email sent successfully',
                'success': True
            })
        except Exception as e:
            return Response({
                'message': 'Failed to send email. Please try again.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def verify_token(self, request):
        """Verify password reset token validity"""
        serializer = PasswordResetVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        
        try:
            user = User.objects.get(
                password_reset_token=token,
                password_reset_expires__gte=timezone.now()
            )
            return Response({
                'valid': True,
                'email': user.email,
                'message': 'Token is valid'
            })
        except User.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        """Reset password with token"""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(password_reset_token=token)
            
            # Verify token
            if not user.verify_password_reset_token(token):
                return Response({
                    'message': 'Invalid or expired token'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(new_password)
            user.password_reset_token = None
            user.password_reset_expires = None
            user.failed_login_attempts = 0
            user.account_locked_until = None
            user.save()
            
            return Response({
                'message': 'Password reset successfully',
                'success': True
            })
        except User.DoesNotExist:
            return Response({
                'message': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationViewSet(viewsets.GenericViewSet):
    """
    Email verification workflow
    """
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_code(self, request):
        """Send verification code to user's email"""
        user = request.user
        
        if user.email_verified:
            return Response({
                'message': 'Email is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate verification code
        code = user.generate_verification_code()
        
        # Send email
        try:
            send_mail(
                subject='Email Verification Code',
                message=f'''
Hello {user.first_name or user.username},

Your email verification code is: {code}

This code will expire in 24 hours.

Best regards,
EduManage Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Verification code sent successfully',
                'success': True
            })
        except Exception as e:
            return Response({
                'message': 'Failed to send email. Please try again.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_code(self, request):
        """Verify email with code"""
        serializer = EmailVerificationConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        user = request.user
        
        if user.verify_email_code(code):
            return Response({
                'message': 'Email verified successfully',
                'success': True,
                'email_verified': True
            })
        else:
            return Response({
                'message': 'Invalid or expired verification code',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def resend_code(self, request):
        """Resend verification code"""
        email = request.data.get('email')
        
        if not email:
            return Response({
                'message': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            if user.email_verified:
                return Response({
                    'message': 'Email is already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new code
            code = user.generate_verification_code()
            
            # Send email
            send_mail(
                subject='Email Verification Code',
                message=f'''
Hello {user.first_name or user.username},

Your new email verification code is: {code}

This code will expire in 24 hours.

Best regards,
EduManage Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Verification code resent successfully',
                'success': True
            })
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'message': 'Failed to send email',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
