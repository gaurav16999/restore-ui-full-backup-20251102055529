from rest_framework import serializers
from admin_api.models import Student
from users.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class StudentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    status = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    toggle_status = serializers.BooleanField(write_only=True, required=False)
    age = serializers.ReadOnlyField()
    
    # New fields from enhanced model
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    dob = serializers.DateField(required=False, allow_null=True, write_only=True, help_text="Alias for date_of_birth")
    parent_contact = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    # Related data
    enrollments_count = serializers.SerializerMethodField()
    current_grades_average = serializers.SerializerMethodField()

    # Spec-friendly aliases
    roll_number = serializers.CharField(source='roll_no', required=False)
    class_assigned = serializers.CharField(source='class_name', required=False)

    class Meta:
        model = Student
        fields = [
            'id', 'roll_no', 'class_name', 'phone', 'attendance_percentage', 
            'is_active', 'first_name', 'last_name', 'email', 'name', 'full_name',
            'status', 'user_username', 'toggle_status', 'enrollment_date',
            'date_of_birth', 'dob', 'parent_contact', 'address', 'age',
            'enrollments_count', 'current_grades_average',
            'roll_number', 'class_assigned'
        ]
        read_only_fields = ['id', 'name', 'full_name', 'status', 'user_username', 'enrollment_date', 'age']
        
    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"
    
    def get_enrollments_count(self, obj):
        """Get count of active enrollments"""
        return obj.enrollments.filter(is_active=True).count()
    
    def get_current_grades_average(self, obj):
        """Get current average grade"""
        from django.db.models import Avg
        grades = obj.grades.all()
        if grades:
            avg = grades.aggregate(avg=Avg('score'))['avg']
            return round(avg, 2) if avg else 0
        return 0
        
    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"
        
    def update(self, instance, validated_data):
        # Map alias 'dob' to 'date_of_birth'
        if 'dob' in validated_data and validated_data.get('dob') is not None:
            validated_data['date_of_birth'] = validated_data.pop('dob')

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


class StudentCreateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    roll_no = serializers.CharField(required=False)  # Make optional for auto-generation
    dob = serializers.DateField(write_only=True, required=False, allow_null=True, help_text="Alias for date_of_birth")
    roll_number = serializers.CharField(write_only=True, required=False)
    class_assigned = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Student
        fields = ['roll_no', 'roll_number', 'class_name', 'class_assigned', 'phone', 'first_name', 'last_name', 'email', 'password', 'date_of_birth', 'dob']

    def validate_email(self, value):
        """Validate that email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(f"Email '{value}' is already registered. Please use a different email.")
        return value
    
    def generate_student_id(self):
        """Generate unique student ID with format STU-XXXXX"""
        import random
        import string
        
        while True:
            # Generate 5 random digits
            random_digits = ''.join(random.choices(string.digits, k=5))
            student_id = f"STU-{random_digits}"
            
            # Check if this ID already exists
            if not Student.objects.filter(roll_no=student_id).exists():
                return student_id

    def create(self, validated_data):
        # Map alias field 'dob' to model's 'date_of_birth' if provided
        if 'dob' in validated_data and validated_data.get('dob'):
            validated_data['date_of_birth'] = validated_data.pop('dob')

        # Map aliases for roll_no and class_name first
        if 'roll_number' in validated_data and validated_data.get('roll_number'):
            validated_data['roll_no'] = validated_data.pop('roll_number')
        if 'class_assigned' in validated_data and validated_data.get('class_assigned'):
            validated_data['class_name'] = validated_data.pop('class_assigned')
        
        # Auto-generate roll_no if not provided (after alias mapping)
        if 'roll_no' not in validated_data or not validated_data.get('roll_no'):
            validated_data['roll_no'] = self.generate_student_id()

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
            'role': 'student',
        }

        user = User.objects.create_user(**user_data)
        student = Student.objects.create(user=user, **validated_data)
        return student


class StudentImportSerializer(serializers.Serializer):
    """
    Serializer for Excel file upload
    """
    file = serializers.FileField()
    
    def validate_file(self, value):
        """Validate uploaded file"""
        if not value.name.endswith(('.xlsx', '.xls')):
            raise serializers.ValidationError("File must be an Excel file (.xlsx or .xls)")
        
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 10MB")
        
        return value