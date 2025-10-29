#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.teacher import TeacherCreateSerializer

# Test teacher creation with first_name
test_data = {
    'email': 'sarah.jones@school.edu',
    'first_name': 'Sarah',
    'last_name': 'Jones',
    'subject': 'English',
    'phone': '1234567890',
    'password': 'teacher123'
}

print("Testing teacher username generation from first_name 'Sarah':")
print(json.dumps(test_data, indent=2))

serializer = TeacherCreateSerializer(data=test_data)
if serializer.is_valid():
    print("\n✓ Serializer is valid")
    try:
        teacher = serializer.save()
        print(f"✓ Teacher created:")
        print(f"  Name: {teacher.user.get_full_name()}")
        print(f"  Username: {teacher.user.username}")
        print(f"  Email: {teacher.user.email}")
        print(f"  Subject: {teacher.subject}")
    except Exception as e:
        print(f"✗ Error creating teacher: {e}")
        import traceback
        traceback.print_exc()
else:
    print("\n✗ Validation errors:")
    print(json.dumps(serializer.errors, indent=2))
