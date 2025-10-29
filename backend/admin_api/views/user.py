from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer

User = get_user_model()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing users (for messaging, etc.)
    Read-only to prevent unauthorized user management
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter users based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by user type if provided
        user_type = self.request.query_params.get('user_type', None)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        return queryset.order_by('first_name', 'last_name')
