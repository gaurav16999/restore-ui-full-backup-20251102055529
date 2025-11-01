from rest_framework import viewsets
from ..models import LeaveType, LeaveDefine, LeaveApplication
from ..serializers.leave import LeaveTypeSerializer, LeaveDefineSerializer, LeaveApplicationSerializer


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all().order_by('name')
    serializer_class = LeaveTypeSerializer
    filterset_fields = ['name']


class LeaveDefineViewSet(viewsets.ModelViewSet):
    queryset = LeaveDefine.objects.all().order_by('-created_at')
    serializer_class = LeaveDefineSerializer
    filterset_fields = ['role', 'leave_type']


class LeaveApplicationViewSet(viewsets.ModelViewSet):
    queryset = LeaveApplication.objects.all().order_by('-applied_at')
    serializer_class = LeaveApplicationSerializer
    filterset_fields = ['applicant', 'leave_type', 'status']
