from rest_framework import serializers
from ..models import Role, LoginPermission, DueFeesLoginPermission


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class LoginPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginPermission
        fields = '__all__'


class DueFeesLoginPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DueFeesLoginPermission
        fields = '__all__'
