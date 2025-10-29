#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Teacher
from users.models import User
from django.db import connection

print("Testing Teacher model and creation...")

# Check Teacher table structure
with connection.cursor() as cursor:
    cursor.execute("PRAGMA table_info(admin_api_teacher);")
    columns = cursor.fetchall()
    print("\nTeacher table columns:")
    for col in columns:
        print(f"  {col[1]} ({col[2]}) - Null: {col[3] == 0}")

# Check existing teachers
print(f"\nTotal teachers: {Teacher.objects.count()}")
if Teacher.objects.exists():
    teacher = Teacher.objects.first()
    print(f"\nSample teacher:")
    print(f"  ID: {teacher.id}")
    print(f"  User: {teacher.user}")
    print(f"  Subject: {teacher.subject}")
    print(f"  Phone: {teacher.phone}")
    print(f"  Employee ID: {teacher.employee_id}")
    print(f"  Is Active: {teacher.is_active}")
