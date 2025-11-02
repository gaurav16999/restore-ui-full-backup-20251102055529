from rest_framework import serializers
from ..models import TransportRoute, TransportVehicle, VehicleAssignment


class TransportRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportRoute
        fields = '__all__'


class TransportVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportVehicle
        fields = '__all__'


class VehicleAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleAssignment
        fields = '__all__'
