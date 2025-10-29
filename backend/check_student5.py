#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Student
from users.models import User

# Check if student5 exists as roll_no
print("Checking for 'student5' as roll_no:")
if Student.objects.filter(roll_no='student5').exists():
    student = Student.objects.get(roll_no='student5')
    print(f"  ✗ FOUND - Student exists: {student.user.get_full_name()} (ID: {student.id})")
else:
    print("  ✓ Not found - 'student5' is available")

# Check if student5 exists as username
print("\nChecking for 'student5' as username:")
if User.objects.filter(username='student5').exists():
    user = User.objects.get(username='student5')
    print(f"  ✗ FOUND - User exists: {user.get_full_name()} ({user.role})")
    if hasattr(user, 'student_profile'):
        print(f"    Associated student: {user.student_profile.roll_no}")
else:
    print("  ✓ Not found - 'student5' username is available")

# List all existing students with 'student' in roll_no
print("\nAll students with 'student' in roll_no:")
students = Student.objects.filter(roll_no__icontains='student')[:10]
for s in students:
    print(f"  - {s.roll_no}: {s.user.get_full_name()}")
