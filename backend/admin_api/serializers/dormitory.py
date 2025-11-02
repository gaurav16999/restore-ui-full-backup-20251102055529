from rest_framework import serializers
from ..models import DormRoomType, DormRoom, DormitoryAssignment


class DormRoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DormRoomType
        fields = '__all__'


class DormRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = DormRoom
        fields = '__all__'


class DormitoryAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DormitoryAssignment
        fields = '__all__'
