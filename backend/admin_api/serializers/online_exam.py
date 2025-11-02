from rest_framework import serializers
from ..models import OnlineExam


class OnlineExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineExam
        fields = '__all__'
