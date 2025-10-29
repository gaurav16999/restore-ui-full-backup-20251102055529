#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Grade
from django.db import connection

print("Testing Grade model...")
print(f"Total grades: {Grade.objects.count()}")

# Check what columns exist in the grade table
with connection.cursor() as cursor:
    cursor.execute("PRAGMA table_info(admin_api_grade);")
    columns = cursor.fetchall()
    print("\nGrade table columns:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")

# Try to fetch a few grades
print("\nTrying to fetch grades:")
try:
    grades = Grade.objects.all()[:3]
    for grade in grades:
        print(f"  Grade ID {grade.id}: {grade.student} - {grade.subject}")
except Exception as e:
    print(f"  Error fetching grades: {e}")
    import traceback
    traceback.print_exc()
