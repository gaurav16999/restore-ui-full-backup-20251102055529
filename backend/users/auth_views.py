"""
Password reset and email verification views
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from datetime import datetime, timedelta
import random
import string

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request password reset by email
    """
    email = request.data.get('email')

    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

        # Generate token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        # Send email
        subject = 'Password Reset Request'
        message = f'''
        Hello {user.first_name},

        You requested to reset your password. Click the link below to reset it:

        {reset_link}

        This link will expire in 24 hours.

        If you didn't request this, please ignore this email.

        Best regards,
        Education Management Team
        '''

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response(
            {'message': 'Password reset email sent successfully'},
            status=status.HTTP_200_OK
        )

    except User.DoesNotExist:
        # Don't reveal if email exists or not (security best practice)
        return Response(
            {'message': 'If an account exists with this email, a password reset link has been sent'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to send password reset email'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, uidb64, token):
    """
    Reset password with token
    """
    new_password = request.data.get('password')

    if not new_password:
        return Response(
            {'error': 'Password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Decode user ID
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Invalid or expired reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        # Send confirmation email
        send_mail(
            'Password Changed Successfully',
            f'Hello {user.first_name},\n\nYour password has been changed successfully.\n\nIf you did not make this change, please contact support immediately.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )

        return Response(
            {'message': 'Password reset successfully'},
            status=status.HTTP_200_OK
        )

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'error': 'Invalid reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_email(request):
    """
    Send email verification code
    """
    email = request.data.get('email')

    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

        # Generate 6-digit verification code
        verification_code = ''.join(random.choices(string.digits, k=6))

        # Store in session or cache (for simplicity, we'll use a model field)
        # In production, use Redis cache with expiry
        user.verification_code = verification_code
        user.verification_code_expires = datetime.now() + timedelta(minutes=15)
        user.save()

        # Send email
        subject = 'Email Verification Code'
        message = f'''
        Hello {user.first_name},

        Your verification code is: {verification_code}

        This code will expire in 15 minutes.

        If you didn't request this, please ignore this email.

        Best regards,
        Education Management Team
        '''

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response(
            {'message': 'Verification code sent successfully'},
            status=status.HTTP_200_OK
        )

    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to send verification email'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verify email with code
    """
    email = request.data.get('email')
    code = request.data.get('code')

    if not email or not code:
        return Response(
            {'error': 'Email and code are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

        # Check if code matches and hasn't expired
        if user.verification_code != code:
            return Response(
                {'error': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if hasattr(
                user,
                'verification_code_expires') and user.verification_code_expires < datetime.now():
            return Response(
                {'error': 'Verification code has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark email as verified
        user.email_verified = True
        user.verification_code = None
        user.verification_code_expires = None
        user.save()

        return Response(
            {'message': 'Email verified successfully'},
            status=status.HTTP_200_OK
        )

    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
