from rest_framework import viewsets, filters
from ..models import TransportRoute, TransportVehicle, VehicleAssignment
from ..serializers.transport import TransportRouteSerializer, TransportVehicleSerializer, VehicleAssignmentSerializer


class TransportRouteViewSet(viewsets.ModelViewSet):
    queryset = TransportRoute.objects.all().order_by('-id')
    serializer_class = TransportRouteSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title']
    ordering = ['-id']


class TransportVehicleViewSet(viewsets.ModelViewSet):
    queryset = TransportVehicle.objects.all().order_by('-id')
    serializer_class = TransportVehicleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['vehicle_no', 'driver_name']
    ordering = ['-id']


class VehicleAssignmentViewSet(viewsets.ModelViewSet):
    queryset = VehicleAssignment.objects.all().order_by('-id')
    serializer_class = VehicleAssignmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['route__title', 'vehicle__vehicle_no']
    ordering = ['-id']
