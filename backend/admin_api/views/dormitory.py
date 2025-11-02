from rest_framework import viewsets, filters
from ..models import DormRoomType, DormRoom, DormitoryAssignment
from ..serializers.dormitory import DormRoomTypeSerializer, DormRoomSerializer, DormitoryAssignmentSerializer


class DormRoomTypeViewSet(viewsets.ModelViewSet):
    queryset = DormRoomType.objects.all().order_by('-id')
    serializer_class = DormRoomTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title']
    ordering = ['-id']


class DormRoomViewSet(viewsets.ModelViewSet):
    queryset = DormRoom.objects.all().order_by('-id')
    serializer_class = DormRoomSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['room_number']
    ordering = ['-id']


class DormitoryAssignmentViewSet(viewsets.ModelViewSet):
    queryset = DormitoryAssignment.objects.all().order_by('-id')
    serializer_class = DormitoryAssignmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['room__room_number', 'student__username']
    ordering = ['-id']
