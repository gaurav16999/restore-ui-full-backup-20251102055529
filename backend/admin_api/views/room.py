from rest_framework import generics, status
from rest_framework.response import Response
from django.db import models
from admin_api.models import Room
from admin_api.serializers.room import RoomSerializer


class RoomListView(generics.ListAPIView):
    queryset = Room.objects.filter(is_active=True).order_by('room_number')
    serializer_class = RoomSerializer


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomCreateView(generics.CreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomStatsView(generics.RetrieveAPIView):
    def get(self, request):
        total_rooms = Room.objects.filter(is_active=True).count()
        classrooms = Room.objects.filter(is_active=True, room_type='classroom').count()
        laboratories = Room.objects.filter(is_active=True, room_type='laboratory').count()
        total_capacity = Room.objects.filter(is_active=True).aggregate(
            total_capacity=models.Sum('capacity')
        )['total_capacity'] or 0
        avg_capacity = Room.objects.filter(is_active=True).aggregate(
            avg_capacity=models.Avg('capacity')
        )['avg_capacity'] or 0
        
        return Response({
            'total_rooms': total_rooms,
            'classrooms': classrooms,
            'laboratories': laboratories,
            'other_rooms': total_rooms - classrooms - laboratories,
            'total_capacity': total_capacity,
            'avg_capacity': round(avg_capacity, 1),
            'rooms_with_projector': Room.objects.filter(is_active=True, has_projector=True).count(),
            'rooms_with_computer': Room.objects.filter(is_active=True, has_computer=True).count(),
        })