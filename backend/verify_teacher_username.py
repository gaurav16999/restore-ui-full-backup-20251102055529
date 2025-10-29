#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Teacher
from admin_api.serializers.teacher import TeacherSerializer

# Get a teacher and check serialized output
teacher = Teacher.objects.last()
if teacher:
    serializer = TeacherSerializer(teacher)
    data = serializer.data
    
    print("Sample teacher data from API:")
    print(f"  Name: {data['name']}")
    print(f"  Username: {data['user_username']}")
    print(f"  Email: {data['email']}")
    print(f"  Subject: {data['subject']}")
    print(f"  Status: {data['status']}")
    print("\nUsername is included in API response: ✓")
else:
    print("No teachers found")
