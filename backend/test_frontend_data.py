#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer

# Simulate exactly what the frontend sends
frontend_data = {
    'username': '',  # Frontend sends this but it's empty
    'email': 'newstudent@example.com',
    'first_name': 'New',
    'last_name': 'Student',
    'roll_no': 'STU1000',
    'class_name': 'Grade 1 - A',
    'phone': '',
    'password': 'student123'
}

print("Testing with frontend data structure:")
print(json.dumps(frontend_data, indent=2))

serializer = StudentCreateSerializer(data=frontend_data)
if serializer.is_valid():
    print("\n✓ Serializer is valid")
    try:
        student = serializer.save()
        print(f"✓ Student created: {student.user.get_full_name()} - {student.roll_no}")
    except Exception as e:
        print(f"✗ Error creating student: {e}")
        import traceback
        traceback.print_exc()
else:
    print("\n✗ Serializer validation errors:")
    print(json.dumps(serializer.errors, indent=2))
