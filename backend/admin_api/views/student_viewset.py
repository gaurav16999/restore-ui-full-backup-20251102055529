from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Student, Enrollment, ClassRoom
from ..serializers import StudentSerializer, StudentCreateSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().select_related('user')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentSerializer

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        role = getattr(user, 'role', None)

        # Admin: full access
        if role == 'admin':
            return qs

        # Teacher: students in teacher's assigned classrooms
        if role == 'teacher':
            try:
                teacher = user.teacher_profile
            except Exception:
                return qs.none()
            classroom_ids = ClassRoom.objects.filter(
                assigned_teacher=teacher).values_list(
                'id', flat=True)
            student_ids = Enrollment.objects.filter(
                classroom_id__in=classroom_ids,
                is_active=True).values_list(
                'student_id',
                flat=True)
            return qs.filter(id__in=student_ids)

        # Student: only self
        if role == 'student':
            try:
                return qs.filter(user=user)
            except Exception:
                return qs.none()

        return qs.none()

    def destroy(self, request, *args, **kwargs):
        # Restrict delete to admin only
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Forbidden'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
