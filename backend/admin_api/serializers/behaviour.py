from rest_framework import serializers
from ..models import IncidentType, StudentIncident, BehaviourSetting


class IncidentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentType
        fields = '__all__'


class StudentIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentIncident
        fields = '__all__'

    def create(self, validated_data):
        # Ensure points default to incident type if not provided
        if 'points' not in validated_data or validated_data.get(
                'points') is None:
            incident_type = validated_data.get('incident_type')
            if incident_type:
                validated_data['points'] = incident_type.point
        return super().create(validated_data)


class BehaviourSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehaviourSetting
        fields = '__all__'
