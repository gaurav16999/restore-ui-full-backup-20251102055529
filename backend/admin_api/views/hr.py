from rest_framework import viewsets
from ..models import Designation, Department, Employee, StaffAttendance, PayrollRecord
from ..serializers.hr import (
    DesignationSerializer, DepartmentSerializer, EmployeeSerializer,
    StaffAttendanceSerializer, PayrollRecordSerializer,
)


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all().order_by('title')
    serializer_class = DesignationSerializer
    filterset_fields = ['title']


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    filterset_fields = ['name']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('-created_at')
    serializer_class = EmployeeSerializer
    filterset_fields = ['department', 'designation', 'is_active']


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StaffAttendance.objects.all().order_by('-date')
    serializer_class = StaffAttendanceSerializer
    filterset_fields = ['employee', 'date', 'status']


class PayrollRecordViewSet(viewsets.ModelViewSet):
    queryset = PayrollRecord.objects.all().order_by('-year', '-month')
    serializer_class = PayrollRecordSerializer
    filterset_fields = ['employee', 'month', 'year']
