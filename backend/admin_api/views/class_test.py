from rest_framework import viewsets
from ..models import ClassTest
from ..serializers.class_test import ClassTestSerializer


class ClassTestViewSet(viewsets.ModelViewSet):
    queryset = ClassTest.objects.all().order_by('-date')
    serializer_class = ClassTestSerializer
    filterset_fields = ['class_assigned', 'subject', 'is_published']
