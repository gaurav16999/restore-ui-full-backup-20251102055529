#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer
from django.db import IntegrityError

# Test with duplicate roll_no
duplicate_data = {
    'email': 'another@example.com',
    'first_name': 'Another',
    'last_name': 'Student',
    'roll_no': 'STU002',  # This already exists
    'class_name': 'Grade 1',
    'phone': '1234567890',
    'password': 'password123'
}

print("Testing with duplicate roll_no:")
print(json.dumps(duplicate_data, indent=2))

serializer = StudentCreateSerializer(data=duplicate_data)
if serializer.is_valid():
    print("\n✓ Serializer is valid")
    try:
        student = serializer.save()
        print(f"✓ Student created: {student.user.get_full_name()}")
    except IntegrityError as e:
        print(f"✗ IntegrityError (expected): {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("\n✗ Serializer errors:")
    print(json.dumps(serializer.errors, indent=2))
