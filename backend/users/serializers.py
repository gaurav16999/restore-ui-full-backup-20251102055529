from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that accepts email in the 'username' field.
    This maintains API compatibility while using email for authentication.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace the username field to accept email
        self.fields[self.username_field] = serializers.EmailField()
        
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'role')

    def create(self, validated_data):
        # Use create_user to hash password and apply validators
        user = User.objects.create_user(**validated_data)
        return user
