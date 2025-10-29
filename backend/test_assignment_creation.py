import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Teacher, Class, Subject, TeacherAssignment

# Get first available teacher, class, and subject
teacher = Teacher.objects.first()
class_obj = Class.objects.first()
subject = Subject.objects.first()

if not teacher:
    print("❌ No teachers found in database")
    exit(1)
if not class_obj:
    print("❌ No classes found in database")
    exit(1)
if not subject:
    print("❌ No subjects found in database")
    exit(1)

print(f"Testing assignment creation:")
print(f"  Teacher: {teacher.user.get_full_name()} (ID: {teacher.id})")
print(f"  Class: {class_obj.name} (ID: {class_obj.id})")
print(f"  Subject: {subject.title} (ID: {subject.id})")

try:
    assignment = TeacherAssignment.objects.create(
        teacher=teacher,
        class_assigned=class_obj,
        subject=subject,
        is_active=True
    )
    print(f"\n✅ SUCCESS! Assignment created:")
    print(f"   ID: {assignment.id}")
    print(f"   {assignment}")
    print(f"   Date: {assignment.assigned_date}")
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
