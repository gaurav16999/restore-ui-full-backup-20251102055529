from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter

from ..models import StudentCategory, StudentGroup, SmsSendingTime
from ..serializers.student_category import StudentCategorySerializer, StudentGroupSerializer, SmsSendingTimeSerializer


class StudentCategoryViewSet(viewsets.ModelViewSet):
    queryset = StudentCategory.objects.all()
    serializer_class = StudentCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']


class StudentGroupViewSet(viewsets.ModelViewSet):
    queryset = StudentGroup.objects.all()
    serializer_class = StudentGroupSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'students_count']
    ordering = ['-created_at']


class SmsSendingTimeViewSet(viewsets.ModelViewSet):
    queryset = SmsSendingTime.objects.all()
    serializer_class = SmsSendingTimeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ['start_time', 'created_at']
    ordering = ['-created_at']
