from rest_framework import serializers
from admin_api.models import ClassSubject


class ClassSubjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSubject
        fields = ['class_assigned', 'subject', 'is_compulsory', 'is_active']

    def validate(self, data):
        # Check if this class-subject combination already exists
        if ClassSubject.objects.filter(
            class_assigned=data['class_assigned'],
            subject=data['subject']
        ).exists():
            raise serializers.ValidationError(
                "This subject is already assigned to this class."
            )
        return data


class ClassSubjectListSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    subject_title = serializers.CharField(
        source='subject.title', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = ClassSubject
        fields = [
            'id',
            'class_assigned',
            'class_name',
            'subject',
            'subject_title',
            'subject_code',
            'is_compulsory',
            'is_active',
            'created_at'
        ]


class ClassSubjectDetailSerializer(serializers.ModelSerializer):
    class_info = serializers.SerializerMethodField()
    subject_info = serializers.SerializerMethodField()

    class Meta:
        model = ClassSubject
        fields = '__all__'

    def get_class_info(self, obj):
        return {
            'id': obj.class_assigned.id,
            'name': obj.class_assigned.name,
            'room': obj.class_assigned.room,
        }

    def get_subject_info(self, obj):
        return {
            'id': obj.subject.id,
            'code': obj.subject.code,
            'title': obj.subject.title,
            'description': obj.subject.description,
            'credit_hours': obj.subject.credit_hours,
        }
