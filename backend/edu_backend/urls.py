from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, EmailTokenObtainPairView

def api_root(request):
    # Redirect to frontend application
    return redirect('http://localhost:8082/')

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/users/', include('users.urls')),
    path('api/teacher/', include('teacher.urls')),
    path('api/student/', include('student.urls')),
    path('api/admin/', include('admin_api.urls')),
]
