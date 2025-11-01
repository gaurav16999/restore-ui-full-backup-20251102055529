from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.http import JsonResponse
from django.db import connection
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, EmailTokenObtainPairView
import sys


def api_root(request):
    # Redirect to frontend application
    return redirect('http://localhost:8082/')


def health_check(request):
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")

        return JsonResponse({
            'status': 'healthy',
            'database': 'connected',
            'python_version': sys.version.split()[0],
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
        }, status=500)


urlpatterns = [
    path(
        '',
        api_root,
        name='api_root'),
    path(
        'health/',
        health_check,
        name='health_check'),
    path(
        'api/health/',
        health_check,
        name='api_health_check'),
    path(
        'admin/',
        admin.site.urls),
    path(
        'api/auth/token/',
        EmailTokenObtainPairView.as_view(),
        name='token_obtain_pair'),
    path(
        'api/auth/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'),
    path(
        'api/auth/register/',
        RegisterView.as_view(),
        name='auth_register'),
    path(
        'api/users/',
        include('users.urls')),
    path(
        'api/teacher/',
        include('teacher.urls')),
    path(
        'api/student/',
        include('student.urls')),
    path(
        'api/parent/',
        include('parent.urls')),
    path(
        'api/admin/',
        include('admin_api.urls')),
]
