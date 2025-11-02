from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from ..models import IncidentType, StudentIncident, BehaviourSetting
from ..serializers.behaviour import IncidentTypeSerializer, StudentIncidentSerializer, BehaviourSettingSerializer


class IncidentTypeViewSet(viewsets.ModelViewSet):
    queryset = IncidentType.objects.all().order_by('-created_at')
    serializer_class = IncidentTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'point']


class StudentIncidentViewSet(viewsets.ModelViewSet):
    queryset = StudentIncident.objects.all().order_by('-date', '-created_at')
    serializer_class = StudentIncidentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'student__user__first_name',
        'student__user__last_name',
        'incident_type__title',
        'notes']
    ordering_fields = ['date', 'points', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # Optional filters via query params
        student_id = self.request.query_params.get('student')
        class_name = self.request.query_params.get('class_name')
        date = self.request.query_params.get('date')
        if student_id:
            qs = qs.filter(student__id=student_id)
        if class_name:
            qs = qs.filter(student__class_name__icontains=class_name)
        if date:
            qs = qs.filter(date=date)
        return qs


class BehaviourSettingViewSet(viewsets.ModelViewSet):
    queryset = BehaviourSetting.objects.all().order_by('-updated_at')
    serializer_class = BehaviourSettingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['updated_at']
