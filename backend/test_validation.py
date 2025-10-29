#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer

# Test with "student5" which conflicts with existing username
test_data = {
    'email': 'newstudent5@example.com',
    'first_name': 'New',
    'last_name': 'Student5',
    'roll_no': 'student5',  # This already exists as username
    'class_name': 'Grade 1 - A',
    'phone': '1234567890',
    'password': 'password123'
}

print("Testing with roll_no='student5' (conflicts with existing username):")
print(json.dumps(test_data, indent=2))

serializer = StudentCreateSerializer(data=test_data)
if serializer.is_valid():
    print("\n✓ Serializer is valid (unexpected!)")
    try:
        student = serializer.save()
        print(f"✓ Student created: {student.user.get_full_name()}")
    except Exception as e:
        print(f"✗ Error creating student: {e}")
else:
    print("\n✗ Validation errors (expected):")
    print(json.dumps(serializer.errors, indent=2))

# Test with unique roll_no
test_data2 = {
    'email': 'newstudent9999@example.com',
    'first_name': 'New',
    'last_name': 'Student9999',
    'roll_no': 'STU9999',  # Unique
    'class_name': 'Grade 1 - A',
    'phone': '1234567890',
    'password': 'password123'
}

print("\n\nTesting with roll_no='STU9999' (unique):")
print(json.dumps(test_data2, indent=2))

serializer2 = StudentCreateSerializer(data=test_data2)
if serializer2.is_valid():
    print("\n✓ Serializer is valid")
    try:
        student = serializer2.save()
        print(f"✓ Student created: {student.user.get_full_name()} - {student.roll_no}")
    except Exception as e:
        print(f"✗ Error creating student: {e}")
else:
    print("\n✗ Validation errors:")
    print(json.dumps(serializer2.errors, indent=2))
