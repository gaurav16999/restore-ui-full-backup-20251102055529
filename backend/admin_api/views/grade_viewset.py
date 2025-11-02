from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from ..models import Grade, Enrollment, ClassRoom
from ..serializers import GradeSerializer


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all().select_related(
        'student__user', 'subject', 'recorded_by__user')
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

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
            # Grades recorded by this teacher or for students in their
            # classrooms
            classroom_ids = ClassRoom.objects.filter(
                assigned_teacher=teacher).values_list(
                'id', flat=True)
            student_ids = Enrollment.objects.filter(
                classroom_id__in=classroom_ids,
                is_active=True).values_list(
                'student_id',
                flat=True)
            return qs.filter(Q(recorded_by=teacher) |
                             Q(student_id__in=student_ids))
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
