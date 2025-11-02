from rest_framework import serializers
from admin_api.models import Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'name', 'room_type', 'capacity',
                  'floor', 'building', 'has_projector', 'has_computer',
                  'has_whiteboard', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
