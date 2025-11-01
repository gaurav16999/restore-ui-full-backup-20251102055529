from rest_framework import serializers
from ..models import (
    AdmissionQuery, VisitorBook, Complaint,
    PostalReceive, PostalDispatch, PhoneCallLog
)


class AdmissionQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionQuery
        fields = [
            'id',
            'name',
            'phone',
            'email',
            'address',
            'source',
            'description',
            'query_date',
            'last_follow_up_date',
            'next_follow_up_date',
            'assigned',
            'reference',
            'class_field',
            'number_of_child',
            'status',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Rename class_field to class for frontend compatibility
        data['class'] = data.pop('class_field')
        return data

    def to_internal_value(self, data):
        # Rename class to class_field for backend
        if 'class' in data:
            data['class_field'] = data.pop('class')
        return super().to_internal_value(data)


class VisitorBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorBook
        fields = [
            'id',
            'purpose',
            'name',
            'phone',
            'id_card',
            'no_of_person',
            'date',
            'in_time',
            'out_time',
            'note',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_by',
            'complaint_type',
            'source',
            'phone',
            'date',
            'description',
            'action_taken',
            'assigned_to',
            'status',
            'resolution_date',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PostalReceiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostalReceive
        fields = [
            'id',
            'from_title',
            'reference_no',
            'address',
            'to_title',
            'date',
            'note',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PostalDispatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostalDispatch
        fields = [
            'id',
            'to_title',
            'reference_no',
            'address',
            'from_title',
            'date',
            'note',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PhoneCallLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneCallLog
        fields = ['id', 'name', 'phone', 'date', 'call_duration', 'call_type',
                  'description', 'follow_up_required', 'follow_up_date',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
