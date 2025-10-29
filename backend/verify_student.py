#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Student

student = Student.objects.get(roll_no='STU999')
print(f'✓ Student: {student.user.get_full_name()}')
print(f'  Roll: {student.roll_no}')
print(f'  Class: {student.class_name}')
print(f'  Phone: "{student.phone}"')
print(f'  Email: {student.user.email}')
print(f'  Active: {student.is_active}')
