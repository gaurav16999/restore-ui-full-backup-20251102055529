"""
Test script to verify username and roll_no are the same
Format: YYSSSSS (both username and roll_no)
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

def test_same_username_rollno():
    print("\n" + "="*60)
    print("TEST: Username and Roll Number Should Be The Same")
    print("="*60)
    
    current_year = datetime.now().year
    year_prefix = str(current_year)[-2:]
    
    print(f"\nCurrent Year: {current_year}")
    print(f"Year Prefix: {year_prefix}")
    print(f"Format: {year_prefix}XXXXX (same for both username and roll_no)")
    
    # Create test students
    test_students = [
        {
            'first_name': 'SameID1',
            'last_name': 'Test',
            'email': 'sameid1@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10A'
        },
        {
            'first_name': 'SameID2',
            'last_name': 'Test',
            'email': 'sameid2@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10B'
        },
        {
            'first_name': 'SameID3',
            'last_name': 'Test',
            'email': 'sameid3@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10cv'
        }
    ]
    
    print("\n" + "="*60)
    print("CREATING TEST STUDENTS")
    print("="*60)
    
    results = []
    
    for data in test_students:
        serializer = StudentCreateSerializer(data=data)
        if serializer.is_valid():
            student = serializer.save()
            username = student.user.username
            roll_no = student.roll_no
            
            match = "✓ MATCH" if username == roll_no else "✗ MISMATCH"
            
            print(f"\n{match}")
            print(f"  Name: {student.user.get_full_name()}")
            print(f"  Username: {username}")
            print(f"  Roll No:  {roll_no}")
            print(f"  Email: {student.user.email}")
            
            results.append({
                'name': student.user.get_full_name(),
                'username': username,
                'roll_no': roll_no,
                'match': username == roll_no
            })
        else:
            print(f"\n✗ Failed to create {data['first_name']}: {serializer.errors}")
    
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)
    
    print(f"\nTotal students created: {len(results)}")
    
    all_match = all(r['match'] for r in results)
    
    if all_match:
        print("✓ ALL usernames and roll numbers MATCH!")
    else:
        print("✗ Some usernames and roll numbers DON'T MATCH!")
    
    print("\nDetails:")
    for r in results:
        status = "✓" if r['match'] else "✗"
        print(f"  {status} {r['name']:20s} | Username: {r['username']} | Roll No: {r['roll_no']}")
    
    # Verify format
    all_valid_format = all(
        len(r['username']) == 7 and 
        r['username'][:2] == year_prefix and 
        r['username'][2:].isdigit()
        for r in results
    )
    
    if all_valid_format:
        print(f"\n✓ All IDs follow {year_prefix}XXXXX format")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == '__main__':
    test_same_username_rollno()
