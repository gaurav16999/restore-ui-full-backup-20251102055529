"""
Create multiple test students to verify username sequence
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer

def create_multiple_students():
    print("\n" + "="*60)
    print("CREATING MULTIPLE STUDENTS TO TEST SEQUENCE")
    print("="*60)
    
    students_data = [
        {
            'first_name': 'Alice',
            'last_name': 'Johnson',
            'email': 'alice.johnson@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10A'
        },
        {
            'first_name': 'Bob',
            'last_name': 'Smith',
            'email': 'bob.smith@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10B'
        },
        {
            'first_name': 'Charlie',
            'last_name': 'Brown',
            'email': 'charlie.brown@example.com',
            'password': 'pass123',
            'class_name': 'Grade 10cv'
        }
    ]
    
    created_students = []
    
    for data in students_data:
        serializer = StudentCreateSerializer(data=data)
        if serializer.is_valid():
            student = serializer.save()
            created_students.append(student)
            print(f"\n✓ Created: {student.user.username} | {student.user.get_full_name()}")
        else:
            print(f"\n✗ Failed to create {data['first_name']}: {serializer.errors}")
    
    print("\n" + "="*60)
    print("CREATED STUDENTS SUMMARY")
    print("="*60)
    
    for student in created_students:
        print(f"\nUsername: {student.user.username}")
        print(f"Name: {student.user.get_full_name()}")
        print(f"Email: {student.user.email}")
        print(f"Roll No: {student.roll_no}")
        print(f"Class: {student.class_name}")
    
    print("\n" + "="*60)
    print("Sequence verification:")
    usernames = [s.user.username for s in created_students]
    for i, username in enumerate(usernames, 1):
        expected_seq = i + 1  # +1 because we already created 2500001
        print(f"  Student {i}: {username} (Expected: 25{expected_seq:05d})")
    
    print("="*60 + "\n")

if __name__ == '__main__':
    create_multiple_students()
