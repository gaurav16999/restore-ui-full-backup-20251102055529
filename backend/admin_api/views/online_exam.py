from rest_framework import viewsets
from ..models import OnlineExam
from ..serializers.online_exam import OnlineExamSerializer


class OnlineExamViewSet(viewsets.ModelViewSet):
    queryset = OnlineExam.objects.all().order_by('-start_datetime')
    serializer_class = OnlineExamSerializer
    filterset_fields = ['class_assigned', 'subject', 'is_active']
