from rest_framework import generics
from rest_framework.response import Response
from django.db import models
from admin_api.models import Class
from admin_api.serializers.class_serializer import ClassSerializer


class ClassListView(generics.ListAPIView):
    queryset = Class.objects.all().select_related('teacher__user')
    serializer_class = ClassSerializer


class ClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Class.objects.all().select_related('teacher__user')
    serializer_class = ClassSerializer


class ClassCreateView(generics.CreateAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer


class ClassStatsView(generics.RetrieveAPIView):
    def get(self, request):
        total_classes = Class.objects.count()
        active_classes = Class.objects.filter(is_active=True).count()
        return Response({
            'total_classes': total_classes,
            'active_classes': active_classes,
            'inactive_classes': total_classes - active_classes,
            'average_students': Class.objects.filter(is_active=True).aggregate(
                avg_students=models.Avg('students_count')
            )['avg_students'] or 0
        })
