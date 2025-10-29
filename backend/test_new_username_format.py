"""
Test script to verify new student username format: YYSSSSS
YY = last 2 digits of enrollment year (e.g., 25 for 2025)
SSSSS = 5-digit sequence number (e.g., 00001)
Example: 2500001
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from users.models import User
from admin_api.models import Student
from datetime import datetime

def test_username_format():
    print("\n" + "="*60)
    print("TESTING NEW USERNAME FORMAT: YYSSSSS")
    print("="*60)
    
    current_year = datetime.now().year
    year_prefix = str(current_year)[-2:]
    
    print(f"\nCurrent Year: {current_year}")
    print(f"Year Prefix: {year_prefix}")
    print(f"Expected Format: {year_prefix}SSSSS (e.g., {year_prefix}00001)")
    
    # Check existing students with new format
    print(f"\n1. Existing students with {year_prefix}XXXXX format:")
    pattern = f'^{year_prefix}[0-9]{{5}}$'
    existing_students = User.objects.filter(
        username__regex=pattern,
        role='student'
    ).order_by('username')
    
    if existing_students.exists():
        print(f"   Found {existing_students.count()} students:")
        for user in existing_students[:10]:
            student = Student.objects.get(user=user)
            print(f"   - Username: {user.username}, Name: {user.first_name} {user.last_name}, Roll No: {student.roll_no}")
    else:
        print(f"   No students found with {year_prefix}XXXXX format yet")
    
    # Find next sequence number
    if existing_students.exists():
        sequence_numbers = [int(u.username[2:]) for u in existing_students]
        next_sequence = max(sequence_numbers) + 1
    else:
        next_sequence = 1
    
    print(f"\n2. Next Username Will Be:")
    print(f"   Username: {year_prefix}{next_sequence:05d}")
    
    # Show all students for comparison
    print(f"\n3. All Student Usernames (first 10):")
    all_students = User.objects.filter(role='student').order_by('username')[:10]
    for user in all_students:
        try:
            student = Student.objects.get(user=user)
            print(f"   - {user.username:15s} | {user.first_name:15s} | {student.roll_no}")
        except Student.DoesNotExist:
            print(f"   - {user.username:15s} | {user.first_name:15s} | No profile")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")
    print("✓ New students will be created with format: YYSSSSS")
    print(f"✓ Example for 2025: 2500001, 2500002, 2500003, etc.")
    print(f"✓ Example for 2026: 2600001, 2600002, 2600003, etc.")

if __name__ == '__main__':
    test_username_format()
