"""
Verify existing students - check if username and roll_no match
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Student
from users.models import User

def verify_students():
    print("\n" + "="*60)
    print("VERIFICATION: Username vs Roll Number")
    print("="*60)
    
    # Get all students
    all_students = Student.objects.select_related('user').all()
    total = all_students.count()
    
    print(f"\nTotal students in database: {total}")
    
    # Check for matches
    matching = []
    not_matching = []
    
    for student in all_students:
        if student.user.username == student.roll_no:
            matching.append(student)
        else:
            not_matching.append(student)
    
    print(f"\n✓ Matching (username = roll_no): {len(matching)}")
    print(f"✗ Not matching (username ≠ roll_no): {len(not_matching)}")
    
    # Show recent students (last 10)
    print("\n" + "="*60)
    print("RECENT STUDENTS (Last 10)")
    print("="*60)
    
    recent_students = Student.objects.select_related('user').order_by('-id')[:10]
    
    for student in recent_students:
        username = student.user.username
        roll_no = student.roll_no
        match_symbol = "✓" if username == roll_no else "✗"
        
        print(f"\n{match_symbol} {student.user.get_full_name()}")
        print(f"  Username: {username}")
        print(f"  Roll No:  {roll_no}")
        if username != roll_no:
            print(f"  ⚠ MISMATCH!")
    
    # Show students with new format (25XXXXX)
    print("\n" + "="*60)
    print("STUDENTS WITH NEW FORMAT (25XXXXX)")
    print("="*60)
    
    new_format_students = Student.objects.select_related('user').filter(
        user__username__regex='^25[0-9]{5}$'
    ).order_by('user__username')
    
    print(f"\nTotal: {new_format_students.count()}")
    
    for student in new_format_students:
        username = student.user.username
        roll_no = student.roll_no
        match_symbol = "✓" if username == roll_no else "✗"
        print(f"{match_symbol} {username} | {roll_no} | {student.user.get_full_name()}")
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    print(f"\n✓ New format students with matching IDs: {len([s for s in new_format_students if s.user.username == s.roll_no])}")
    print(f"✗ New format students with mismatched IDs: {len([s for s in new_format_students if s.user.username != s.roll_no])}")
    
    print("\n" + "="*60 + "\n")

if __name__ == '__main__':
    verify_students()
