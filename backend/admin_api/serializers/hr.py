from rest_framework import serializers
from ..models import Designation, Department, Employee, StaffAttendance, PayrollRecord


class DesignationSerializer(serializers.ModelSerializer):
    staff_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Designation
        fields = ['id', 'title', 'description', 'designation_type', 'is_active', 'staff_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_staff_count(self, obj):
        """Get count of active employees with this designation"""
        # If already annotated from queryset, use it
        if hasattr(obj, 'staff_count') and isinstance(obj.staff_count, int):
            return obj.staff_count
        # Otherwise calculate it
        return obj.get_staff_count()


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    designation_name = serializers.CharField(source='designation.title', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'user', 'name', 'employee_id', 'designation', 'designation_name', 
                  'department', 'department_name', 'phone', 'email', 'is_active', 
                  'join_date', 'created_at']
        read_only_fields = ['employee_id', 'created_at']


class StaffAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffAttendance
        fields = '__all__'


class PayrollRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollRecord
        fields = '__all__'
