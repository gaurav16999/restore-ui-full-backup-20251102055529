from rest_framework import serializers
from ..models import ClassTest


class ClassTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassTest
        fields = '__all__'
