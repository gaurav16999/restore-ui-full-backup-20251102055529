"""
Test script to verify student courses are working with ClassSubject model
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Class, ClassSubject, Student, TeacherAssignment
from django.contrib.auth.models import User

def test_student_courses():
    print("\n" + "="*60)
    print("TESTING STUDENT COURSES FUNCTIONALITY")
    print("="*60)
    
    # 1. Check Grade 10 classes
    print("\n1. Checking Grade 10 Classes:")
    grade10_classes = Class.objects.filter(name__icontains='10')
    print(f"   Found {grade10_classes.count()} Grade 10 classes")
    for cls in grade10_classes[:3]:
        print(f"   - {cls.name}")
        subjects_count = ClassSubject.objects.filter(class_assigned=cls, is_active=True).count()
        print(f"     Subjects assigned: {subjects_count}")
    
    # 2. Check ClassSubject assignments
    print("\n2. Checking ClassSubject Assignments:")
    total_assignments = ClassSubject.objects.filter(is_active=True).count()
    print(f"   Total active class-subject assignments: {total_assignments}")
    
    # Show first Grade 10 class subjects
    if grade10_classes.exists():
        first_class = grade10_classes.first()
        print(f"\n   Subjects for '{first_class.name}':")
        subjects = ClassSubject.objects.filter(
            class_assigned=first_class,
            is_active=True
        ).select_related('subject')
        
        for cs in subjects:
            print(f"   - {cs.subject.title} ({cs.subject.code})")
            print(f"     Compulsory: {cs.is_compulsory}")
            
            # Check if there's a teacher assigned
            teacher = TeacherAssignment.objects.filter(
                class_assigned=first_class,
                subject=cs.subject,
                is_active=True
            ).select_related('teacher__user').first()
            
            if teacher:
                teacher_name = f"{teacher.teacher.user.first_name} {teacher.teacher.user.last_name}"
                print(f"     Teacher: {teacher_name}")
            else:
                print(f"     Teacher: Not Assigned")
    
    # 3. Check if any students exist
    print("\n3. Checking Students:")
    students = Student.objects.all()[:3]
    print(f"   Total students: {Student.objects.count()}")
    for student in students:
        print(f"   - {student.user.first_name} {student.user.last_name}")
        print(f"     Class: {student.class_name}")
        print(f"     Roll No: {student.roll_no}")
        
        # Find their class
        student_class = Class.objects.filter(name=student.class_name).first()
        if student_class:
            course_count = ClassSubject.objects.filter(
                class_assigned=student_class,
                is_active=True
            ).count()
            print(f"     Enrolled Courses: {course_count}")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == '__main__':
    test_student_courses()
