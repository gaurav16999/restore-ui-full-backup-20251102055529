#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.teacher import TeacherCreateSerializer

# Simulate what the frontend sends
frontend_data = {
    'email': 'newteacher@example.com',
    'first_name': 'New',
    'last_name': 'Teacher',
    'subject': 'Mathematics',
    'phone': '',
    'password': 'teacher123'
}

print("Testing teacher creation with frontend data:")
print(json.dumps(frontend_data, indent=2))

serializer = TeacherCreateSerializer(data=frontend_data)
if serializer.is_valid():
    print("\n✓ Serializer is valid")
    try:
        teacher = serializer.save()
        print(f"✓ Teacher created: {teacher.user.get_full_name()} - {teacher.subject}")
    except Exception as e:
        print(f"✗ Error creating teacher: {e}")
        import traceback
        traceback.print_exc()
else:
    print("\n✗ Serializer validation errors:")
    print(json.dumps(serializer.errors, indent=2))
