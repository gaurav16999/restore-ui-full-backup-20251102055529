#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer

# Simulate the data being sent from the frontend
test_data = {
    'first_name': 'Test',
    'last_name': 'Student',
    'email': 'teststudent999@example.com',
    'roll_no': 'STU999',
    'class_name': 'Grade 1 - A',
    'phone': '',
    'password': 'password123'
}

print("Testing student creation with data:")
print(json.dumps(test_data, indent=2))

serializer = StudentCreateSerializer(data=test_data)
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
    print("\n✗ Serializer errors:")
    print(json.dumps(serializer.errors, indent=2))
