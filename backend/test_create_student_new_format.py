"""
Create a test student to verify the new username format
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer

def create_test_student():
    print("\n" + "="*60)
    print("CREATING TEST STUDENT WITH NEW USERNAME FORMAT")
    print("="*60)
    
    # Test data
    student_data = {
        'first_name': 'Test',
        'last_name': 'Student',
        'email': 'test.student.2025@example.com',
        'password': 'testpass123',
        'class_name': 'Grade 10cv',
        'phone': '9876543210',
        'date_of_birth': '2010-01-15'
    }
    
    print("\nCreating student with data:")
    print(f"  Name: {student_data['first_name']} {student_data['last_name']}")
    print(f"  Email: {student_data['email']}")
    print(f"  Class: {student_data['class_name']}")
    
    # Create student using serializer
    serializer = StudentCreateSerializer(data=student_data)
    
    if serializer.is_valid():
        student = serializer.save()
        print("\n✓ Student created successfully!")
        print(f"\n  Username: {student.user.username}")
        print(f"  Roll No: {student.roll_no}")
        print(f"  Full Name: {student.user.get_full_name()}")
        print(f"  Email: {student.user.email}")
        print(f"  Class: {student.class_name}")
        print(f"  Phone: {student.phone}")
        
        # Verify format
        username = student.user.username
        if len(username) == 7 and username[:2] == '25' and username[2:].isdigit():
            print(f"\n✓ Username format is correct: {username}")
            print(f"  Year prefix: {username[:2]}")
            print(f"  Sequence: {username[2:]}")
        else:
            print(f"\n✗ Username format is incorrect: {username}")
    else:
        print("\n✗ Failed to create student:")
        print(f"  Errors: {serializer.errors}")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == '__main__':
    create_test_student()
