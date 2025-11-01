from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Teacher
from ..serializers import TeacherSerializer, TeacherCreateSerializer


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all().select_related('user')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherCreateSerializer
        return TeacherSerializer

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)

        if role == 'admin':
            return self.queryset
        if role == 'teacher':
            try:
                return self.queryset.filter(user=user)
            except Exception:
                return self.queryset.none()
        # students have no access to teachers list
        return self.queryset.none()

    def destroy(self, request, *args, **kwargs):
        # Admin only
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Forbidden'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
