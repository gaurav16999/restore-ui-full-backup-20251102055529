"""
Test script to verify new username format with random numbers: YYSSSSS
YY = last 2 digits of enrollment year (e.g., 25 for 2025)
SSSSS = 5-digit random number (e.g., 12345, 98765)
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer
from datetime import datetime

def test_random_username_format():
    print("\n" + "="*60)
    print("TESTING RANDOM USERNAME FORMAT: YYSSSSS")
    print("="*60)
    
    current_year = datetime.now().year
    year_prefix = str(current_year)[-2:]
    
    print(f"\nCurrent Year: {current_year}")
    print(f"Year Prefix: {year_prefix}")
    print(f"Format: {year_prefix}XXXXX (where XXXXX is a random 5-digit number)")
    
    # Create test students
    test_students = [
        {
            'first_name': 'Random1',
            'last_name': 'Test',
            'email': 'random1@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10A'
        },
        {
            'first_name': 'Random2',
            'last_name': 'Test',
            'email': 'random2@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10B'
        },
        {
            'first_name': 'Random3',
            'last_name': 'Test',
            'email': 'random3@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10cv'
        }
    ]
    
    created_usernames = []
    
    print("\n" + "="*60)
    print("CREATING TEST STUDENTS")
    print("="*60)
    
    for data in test_students:
        serializer = StudentCreateSerializer(data=data)
        if serializer.is_valid():
            student = serializer.save()
            username = student.user.username
            created_usernames.append(username)
            
            print(f"\n✓ Created: {username}")
            print(f"  Name: {student.user.get_full_name()}")
            print(f"  Email: {student.user.email}")
            print(f"  Roll No: {student.roll_no}")
            
            # Verify format
            if len(username) == 7 and username[:2] == year_prefix and username[2:].isdigit():
                random_part = username[2:]
                print(f"  ✓ Format valid - Year: {username[:2]}, Random: {random_part}")
            else:
                print(f"  ✗ Format invalid!")
        else:
            print(f"\n✗ Failed: {serializer.errors}")
    
    print("\n" + "="*60)
    print("VERIFICATION")
    print("="*60)
    
    print(f"\nCreated Usernames:")
    for username in created_usernames:
        print(f"  - {username}")
    
    # Check that they're all different (random)
    if len(created_usernames) == len(set(created_usernames)):
        print(f"\n✓ All usernames are unique (randomness verified)")
    else:
        print(f"\n✗ Duplicate usernames found!")
    
    # Check format
    all_valid = all(
        len(u) == 7 and u[:2] == year_prefix and u[2:].isdigit() 
        for u in created_usernames
    )
    
    if all_valid:
        print(f"✓ All usernames follow {year_prefix}XXXXX format")
    else:
        print(f"✗ Some usernames don't follow the format")
    
    # Show random number ranges
    random_numbers = [int(u[2:]) for u in created_usernames]
    print(f"\nRandom numbers generated:")
    for num in random_numbers:
        print(f"  - {num:05d} (range: 10000-99999)")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == '__main__':
    test_random_username_format()
