from rest_framework import serializers
from admin_api.models import Subject


class SubjectSerializer(serializers.ModelSerializer):
    """Enhanced subject serializer with new fields"""
    grades_count = serializers.SerializerMethodField()
    average_grade = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = [
            'id', 'code', 'title', 'description', 'classes_count', 
            'teachers_count', 'students_count', 'is_active', 
            'credit_hours', 'grades_count', 'average_grade'
        ]
        read_only_fields = ['id', 'classes_count', 'teachers_count', 'students_count']
    
    def get_grades_count(self, obj):
        """Get total number of grades recorded for this subject"""
        return obj.grades.count()
    
    def get_average_grade(self, obj):
        """Get average grade for this subject"""
        from django.db.models import Avg
        avg = obj.grades.aggregate(avg=Avg('score'))['avg']
        return round(avg, 2) if avg else 0
    
    def validate_code(self, value):
        """Ensure subject code is unique"""
        if Subject.objects.filter(code=value).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError("Subject code must be unique.")
        return value.upper()  # Convert to uppercase
    
    def validate_credit_hours(self, value):
        """Validate credit hours"""
        if value < 1 or value > 10:
            raise serializers.ValidationError("Credit hours must be between 1 and 10.")
        return value

    def validate(self, attrs):
        """Allow 'name' as an alias for 'title' for backward compatibility."""
        initial = getattr(self, 'initial_data', {}) or {}
        if not attrs.get('title') and initial.get('name'):
            attrs['title'] = initial.get('name')
        return attrs


class SubjectListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing subjects"""
    grades_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = ['id', 'code', 'title', 'credit_hours', 'is_active', 'grades_count']
    
    def get_grades_count(self, obj):
        return obj.grades.count()


class SubjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new subjects"""
    
    class Meta:
        model = Subject
        fields = ['code', 'title', 'description', 'credit_hours', 'is_active']
    
    def validate_code(self, value):
        """Ensure subject code is unique"""
        if Subject.objects.filter(code=value.upper()).exists():
            raise serializers.ValidationError("Subject code must be unique.")
        return value.upper()

    def validate(self, attrs):
        """Support alias 'name' for title and auto-generate code when missing."""
        initial = getattr(self, 'initial_data', {}) or {}
        if not attrs.get('title') and initial.get('name'):
            attrs['title'] = initial.get('name')

        # Autogenerate code from title if not provided
        if not attrs.get('code') and attrs.get('title'):
            base = ''.join(ch for ch in attrs['title'].upper() if ch.isalnum())[:6]
            base = base or 'SUBJ'
            candidate = base
            i = 1
            while Subject.objects.filter(code=candidate).exists():
                i += 1
                candidate = f"{base}{i}"
            attrs['code'] = candidate
        return attrs