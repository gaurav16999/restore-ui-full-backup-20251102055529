#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Student
from users.models import User

print("=" * 60)
print("DELETING ALL STUDENTS FROM DATABASE")
print("=" * 60)

# Count students before deletion
student_count = Student.objects.count()
print(f"\nTotal students before deletion: {student_count}")

if student_count == 0:
    print("\nNo students to delete!")
else:
    # Get all student user IDs before deleting students
    student_user_ids = list(Student.objects.values_list('user_id', flat=True))
    
    # Delete all students (this will also delete their user accounts due to CASCADE)
    deleted_count = Student.objects.all().delete()
    print(f"\n✓ Deleted {deleted_count[0]} student records")
    
    # Verify deletion
    remaining_students = Student.objects.count()
    remaining_users = User.objects.filter(id__in=student_user_ids).count()
    
    print(f"\nVerification:")
    print(f"  Students remaining: {remaining_students}")
    print(f"  Associated user accounts remaining: {remaining_users}")
    
    if remaining_students == 0:
        print("\n✓ All students successfully deleted!")
    else:
        print(f"\n⚠ Warning: {remaining_students} students still remain!")

print("\n" + "=" * 60)
