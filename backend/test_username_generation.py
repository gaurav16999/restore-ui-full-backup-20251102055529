#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer

# Test with first_name "John"
test_data = {
    'email': 'john.test@example.com',
    'first_name': 'John',
    'last_name': 'Doe',
    'roll_no': 'STU3001',
    'class_name': 'Grade 1 - A',
    'phone': '1234567890',
    'password': 'password123'
}

print("Testing username generation from first_name 'John':")
print(json.dumps(test_data, indent=2))

serializer = StudentCreateSerializer(data=test_data)
if serializer.is_valid():
    print("\n✓ Serializer is valid")
    try:
        student = serializer.save()
        print(f"✓ Student created:")
        print(f"  Name: {student.user.get_full_name()}")
        print(f"  Username: {student.user.username}")
        print(f"  Roll No: {student.roll_no}")
        print(f"  Email: {student.user.email}")
    except Exception as e:
        print(f"✗ Error creating student: {e}")
        import traceback
        traceback.print_exc()
else:
    print("\n✗ Validation errors:")
    print(json.dumps(serializer.errors, indent=2))

# Test with duplicate first name
test_data2 = {
    'email': 'john2.test@example.com',
    'first_name': 'John',
    'last_name': 'Smith',
    'roll_no': 'STU3002',
    'class_name': 'Grade 1 - A',
    'phone': '1234567890',
    'password': 'password123'
}

print("\n\nTesting with another 'John' (should get username 'john1'):")
serializer2 = StudentCreateSerializer(data=test_data2)
if serializer2.is_valid():
    print("\n✓ Serializer is valid")
    try:
        student = serializer2.save()
        print(f"✓ Student created:")
        print(f"  Name: {student.user.get_full_name()}")
        print(f"  Username: {student.user.username}")
        print(f"  Roll No: {student.roll_no}")
    except Exception as e:
        print(f"✗ Error: {e}")
else:
    print("\n✗ Validation errors:")
    print(json.dumps(serializer2.errors, indent=2))
