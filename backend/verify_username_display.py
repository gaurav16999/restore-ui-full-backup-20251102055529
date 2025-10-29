#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Student
from admin_api.serializers.student import StudentSerializer

# Get a student and check serialized output
student = Student.objects.first()
if student:
    serializer = StudentSerializer(student)
    data = serializer.data
    
    print("Sample student data from API:")
    print(f"  Name: {data['name']}")
    print(f"  Roll No: {data['roll_no']}")
    print(f"  Username: {data['user_username']}")
    print(f"  Email: {data['email']}")
    print(f"  Class: {data['class_name']}")
    print(f"  Status: {data['status']}")
    print("\nFull serialized data:")
    print(json.dumps(data, indent=2, default=str))
else:
    print("No students found")
