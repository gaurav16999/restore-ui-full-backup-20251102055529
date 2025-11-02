from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from ..models import Designation, Department, Employee, StaffAttendance, PayrollRecord
from ..serializers.hr import (
    DesignationSerializer, DepartmentSerializer, EmployeeSerializer,
    StaffAttendanceSerializer, PayrollRecordSerializer,
)


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all().order_by('title')
    serializer_class = DesignationSerializer
    filterset_fields = ['title', 'designation_type', 'is_active']
    
    def get_queryset(self):
        """Annotate with staff count"""
        from django.db.models import Q
        return Designation.objects.annotate(
            staff_count=Count('employees', filter=Q(employees__is_active=True))
        ).order_by('designation_type', 'title')
    
    @action(detail=True, methods=['get'])
    def employees(self, request, pk=None):
        """Get all employees with this designation"""
        designation = self.get_object()
        employees = Employee.objects.filter(designation=designation, is_active=True)
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get designation statistics"""
        stats = {
            'total': Designation.objects.count(),
            'teaching': Designation.objects.filter(designation_type='teaching').count(),
            'administrative': Designation.objects.filter(designation_type='administrative').count(),
            'support': Designation.objects.filter(designation_type='support').count(),
            'active': Designation.objects.filter(is_active=True).count(),
        }
        return Response(stats)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    filterset_fields = ['name']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('-created_at')
    serializer_class = EmployeeSerializer
    filterset_fields = ['department', 'designation', 'is_active']
    search_fields = ['name', 'employee_id', 'email', 'phone']
    
    @action(detail=False, methods=['get'])
    def by_designation(self, request):
        """Get employees grouped by designation"""
        designation_id = request.query_params.get('designation_id')
        if designation_id:
            employees = Employee.objects.filter(designation_id=designation_id, is_active=True)
        else:
            employees = Employee.objects.filter(is_active=True)
        
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def generate_id(self, request):
        """Generate next available employee ID in format: 25XXXXXX (year last 2 digits + 6 random digits)"""
        from django.utils import timezone
        import random
        
        year_suffix = str(timezone.now().year)[-2:]
        
        # Generate unique 6-digit random number
        max_attempts = 100
        for _ in range(max_attempts):
            random_digits = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            potential_id = f'{year_suffix}{random_digits}'
            
            # Check if this ID already exists
            if not Employee.objects.filter(employee_id=potential_id).exists():
                return Response({'employee_id': potential_id})
        
        # Fallback if somehow all attempts failed
        import uuid
        fallback_id = f'{year_suffix}{str(uuid.uuid4().int)[:6]}'
        return Response({'employee_id': fallback_id})


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StaffAttendance.objects.all().order_by('-date')
    serializer_class = StaffAttendanceSerializer
    filterset_fields = ['employee', 'date', 'status']


class PayrollRecordViewSet(viewsets.ModelViewSet):
    queryset = PayrollRecord.objects.all().order_by('-year', '-month')
    serializer_class = PayrollRecordSerializer
    filterset_fields = ['employee', 'month', 'year']
