from rest_framework import serializers
from ..models import StudentCategory, StudentGroup, SmsSendingTime


class StudentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCategory
        fields = '__all__'


class StudentGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGroup
        fields = '__all__'


class SmsSendingTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmsSendingTime
        fields = '__all__'
