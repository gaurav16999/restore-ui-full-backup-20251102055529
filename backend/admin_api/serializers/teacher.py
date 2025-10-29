from rest_framework import serializers
from admin_api.models import Teacher
from users.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class TeacherSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    status = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    toggle_status = serializers.BooleanField(write_only=True, required=False)
    
    # New fields from enhanced model
    employee_id = serializers.CharField(required=False, allow_blank=True)
    qualification = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False, default=0)
    
    # Related data
    assigned_classrooms_count = serializers.SerializerMethodField()
    assigned_classrooms = serializers.SerializerMethodField()

    # Spec-friendly alias
    subject_specialization = serializers.CharField(source='subject', required=False)

    class Meta:
        model = Teacher
        fields = [
            'id', 'subject', 'phone', 'classes_count', 'students_count', 
            'is_active', 'first_name', 'last_name', 'email', 'name', 'full_name',
            'status', 'user_username', 'toggle_status', 'join_date',
            'employee_id', 'qualification', 'experience_years', 'subject_specialization',
            'assigned_classrooms_count', 'assigned_classrooms'
        ]
        read_only_fields = [
            'id', 'name', 'full_name', 'status', 'user_username', 
            'classes_count', 'students_count', 'join_date'
        ]
        
    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"
    
    def get_assigned_classrooms_count(self, obj):
        """Get count of assigned classrooms"""
        return obj.assigned_classrooms.filter(is_active=True).count()
    
    def get_assigned_classrooms(self, obj):
        """Get list of assigned classrooms"""
        classrooms = obj.assigned_classrooms.filter(is_active=True)
        return [
            {
                'id': classroom.id,
                'name': classroom.name,
                'grade_level': classroom.grade_level,
                'section': classroom.section
            }
            for classroom in classrooms
        ]
    
    def validate_employee_id(self, value):
        """Ensure employee ID is unique if provided"""
        if value and Teacher.objects.filter(employee_id=value).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError("Employee ID must be unique.")
        return value
        
    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"
        
    def update(self, instance, validated_data):
        # Map alias for subject specialization if provided
        if 'subject' not in validated_data and 'subject_specialization' in validated_data:
            validated_data['subject'] = validated_data.pop('subject_specialization')
        # Handle status toggle
        if validated_data.pop('toggle_status', False):
            instance.is_active = not instance.is_active
            instance.save()
            return instance
        
        # Handle regular updates
        user_data = {}
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class TeacherCreateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    subject_specialization = serializers.CharField(write_only=True, required=False)
    employee_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    qualification = serializers.CharField(write_only=True, required=False, allow_blank=True)
    experience_years = serializers.IntegerField(write_only=True, required=False, default=0)

    class Meta:
        model = Teacher
        fields = ['subject', 'subject_specialization', 'phone', 'first_name', 'last_name', 'email', 'password', 'employee_id', 'qualification', 'experience_years']

    def validate_email(self, value):
        """Validate that email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(f"Email '{value}' is already registered. Please use a different email.")
        return value
    
    def validate_employee_id(self, value):
        """Validate that employee_id is unique if provided"""
        if value and Teacher.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError(f"Employee ID '{value}' is already in use. Please choose a different ID.")
        return value

    def create(self, validated_data):
        # Map alias if provided
        if 'subject_specialization' in validated_data:
            validated_data['subject'] = validated_data.pop('subject_specialization')
        
        # Extract user data
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        
        # Generate username from first_name (lowercase, remove spaces)
        base_username = first_name.lower().replace(' ', '')
        username = base_username
        counter = 1
        
        # Ensure username is unique
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'username': username,
            'password': password,
            'role': 'teacher',
        }

        user = User.objects.create_user(**user_data)
        teacher = Teacher.objects.create(user=user, **validated_data)
        return teacher