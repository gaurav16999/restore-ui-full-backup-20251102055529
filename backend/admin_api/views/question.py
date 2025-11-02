from rest_framework import viewsets
from ..models import QuestionGroup, Question
from ..serializers.question import QuestionGroupSerializer, QuestionSerializer


class QuestionGroupViewSet(viewsets.ModelViewSet):
    queryset = QuestionGroup.objects.all().order_by('-created_at')
    serializer_class = QuestionGroupSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
    filterset_fields = ['group', 'subject', 'class_assigned']
