from rest_framework import viewsets
from ..models import Role, LoginPermission, DueFeesLoginPermission
from ..serializers.role_permission import RoleSerializer, LoginPermissionSerializer, DueFeesLoginPermissionSerializer


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by('name')
    serializer_class = RoleSerializer
    filterset_fields = ['name']


class LoginPermissionViewSet(viewsets.ModelViewSet):
    queryset = LoginPermission.objects.all().order_by('-created_at')
    serializer_class = LoginPermissionSerializer
    filterset_fields = ['user', 'can_login']


class DueFeesLoginPermissionViewSet(viewsets.ModelViewSet):
    queryset = DueFeesLoginPermission.objects.all().order_by('-created_at')
    serializer_class = DueFeesLoginPermissionSerializer
    filterset_fields = ['user', 'allowed_when_due']
