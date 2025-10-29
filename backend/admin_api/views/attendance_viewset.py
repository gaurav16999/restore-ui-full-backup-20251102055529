from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from ..models import Attendance, Enrollment, ClassRoom
from ..serializers import AttendanceSerializer, AttendanceCreateSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('student__user', 'class_section', 'recorded_by__user')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AttendanceCreateSerializer
        return AttendanceSerializer

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)
        qs = self.queryset

        if role == 'admin':
            return qs
        if role == 'teacher':
            try:
                teacher = user.teacher_profile
            except Exception:
                return qs.none()
            classroom_ids = ClassRoom.objects.filter(assigned_teacher=teacher).values_list('id', flat=True)
            student_ids = Enrollment.objects.filter(classroom_id__in=classroom_ids, is_active=True).values_list('student_id', flat=True)
            return qs.filter(Q(recorded_by=teacher) | Q(student_id__in=student_ids))
        if role == 'student':
            try:
                return qs.filter(student__user=user)
            except Exception:
                return qs.none()
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role', None)
        if role == 'teacher':
            teacher = getattr(user, 'teacher_profile', None)
            serializer.save(recorded_by=teacher)
        else:
            serializer.save()
