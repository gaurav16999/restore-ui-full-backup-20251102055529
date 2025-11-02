from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from ..models import Lesson, Topic, LessonPlan
from ..serializers.lesson_plan import LessonSerializer, TopicSerializer, LessonPlanSerializer


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = LessonSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'subject__title']
    ordering_fields = ['created_at']


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = TopicSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'lesson__title']
    ordering_fields = ['created_at']


class LessonPlanViewSet(viewsets.ModelViewSet):
    queryset = LessonPlan.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = LessonPlanSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'lesson__title',
        'topic__title',
        'teacher__user__first_name',
        'teacher__user__last_name']
    ordering_fields = ['planned_date', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # optional filters: teacher, class, subject, date range
        teacher = self.request.query_params.get('teacher')
        lesson = self.request.query_params.get('lesson')
        planned_date = self.request.query_params.get('planned_date')
        if teacher:
            qs = qs.filter(teacher_id=teacher)
        if lesson:
            qs = qs.filter(lesson_id=lesson)
        if planned_date:
            qs = qs.filter(planned_date=planned_date)
        return qs.order_by('-planned_date')
