import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import TeacherAssignment
from admin_api.serializers.teacher_assignment import TeacherAssignmentListSerializer

print("Testing TeacherAssignment API serialization...")
print()

assignments = TeacherAssignment.objects.select_related(
    'teacher__user',
    'class_assigned',
    'subject'
).all()

print(f"Found {assignments.count()} assignments")
print()

if assignments.exists():
    for assignment in assignments:
        print(f"Assignment ID: {assignment.id}")
        print(f"  Teacher: {assignment.teacher.user.get_full_name()}")
        print(f"  Class: {assignment.class_assigned.name}")
        print(f"  Subject: {assignment.subject.title}")
        print()
    
    # Test serializer
    print("Testing serializer...")
    serializer = TeacherAssignmentListSerializer(assignments, many=True)
    print("Serialized data:")
    for item in serializer.data:
        print(f"  - {item.get('teacher_name')} → {item.get('class_name')} → {item.get('subject_title')}")
    print()
    print("✅ Serialization successful!")
else:
    print("No assignments to test")
