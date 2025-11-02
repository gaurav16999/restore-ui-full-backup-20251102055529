from rest_framework import serializers
from ..models import LeaveType, LeaveDefine, LeaveApplication


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'


class LeaveDefineSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveDefine
        fields = '__all__'


class LeaveApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveApplication
        fields = '__all__'
