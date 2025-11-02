from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileView, RegisterView
from .auth_views import (
    request_password_reset,
    reset_password,
    send_verification_email,
    verify_email
)
from .parent_views import ParentPortalViewSet, link_parent_to_student
from .views_auth import UserProfileViewSet, PasswordResetViewSet, EmailVerificationViewSet

router = DefaultRouter()
router.register(
    r'parent-portal',
    ParentPortalViewSet,
    basename='parent-portal')

# Enhanced authentication ViewSets
router.register(r'profile', UserProfileViewSet, basename='user-profile')
router.register(r'password-reset', PasswordResetViewSet, basename='password-reset')
router.register(r'email-verification', EmailVerificationViewSet, basename='email-verification')

urlpatterns = [
    # Legacy endpoints (kept for backward compatibility)
    path('profile/', ProfileView.as_view(), name='profile-legacy'),
    path('register/', RegisterView.as_view(), name='register'),

    # Password reset (legacy)
    path(
        'password-reset/request/',
        request_password_reset,
        name='password_reset_request'),
    path('password-reset/<str:uidb64>/<str:token>/',
         reset_password, name='password_reset'),

    # Email verification (legacy)
    path(
        'email/send-verification/',
        send_verification_email,
        name='send_verification'),
    path('email/verify/', verify_email, name='verify_email'),

    # Parent portal
    path(
        'parent/link-student/',
        link_parent_to_student,
        name='link_parent_student'),
    
    # Include router URLs
    path('', include(router.urls)),
]
