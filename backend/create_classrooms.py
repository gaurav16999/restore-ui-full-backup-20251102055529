import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import ClassRoom

# Sample classroom data
classrooms = [
    {'name': 'Grade 1A', 'grade_level': 'Grade 1', 'section': 'A', 'room_code': 'G1A'},
    {'name': 'Grade 1B', 'grade_level': 'Grade 1', 'section': 'B', 'room_code': 'G1B'},
    {'name': 'Grade 2A', 'grade_level': 'Grade 2', 'section': 'A', 'room_code': 'G2A'},
    {'name': 'Grade 2B', 'grade_level': 'Grade 2', 'section': 'B', 'room_code': 'G2B'},
    {'name': 'Grade 3A', 'grade_level': 'Grade 3', 'section': 'A', 'room_code': 'G3A'},
    {'name': 'Grade 4A', 'grade_level': 'Grade 4', 'section': 'A', 'room_code': 'G4A'},
    {'name': 'Grade 5A', 'grade_level': 'Grade 5', 'section': 'A', 'room_code': 'G5A'},
    {'name': 'Grade 6A', 'grade_level': 'Grade 6', 'section': 'A', 'room_code': 'G6A'},
    {'name': 'Grade 7A', 'grade_level': 'Grade 7', 'section': 'A', 'room_code': 'G7A'},
    {'name': 'Grade 8A', 'grade_level': 'Grade 8', 'section': 'A', 'room_code': 'G8A'},
    {'name': 'Grade 9A', 'grade_level': 'Grade 9', 'section': 'A', 'room_code': 'G9A'},
    {'name': 'Grade 10A', 'grade_level': 'Grade 10', 'section': 'A', 'room_code': 'G10A'},
]

print("Creating ClassRooms...")

created_count = 0
for classroom_data in classrooms:
    classroom, created = ClassRoom.objects.get_or_create(
        room_code=classroom_data['room_code'],
        defaults={
            'name': classroom_data['name'],
            'grade_level': classroom_data['grade_level'],
            'section': classroom_data['section'],
            'is_active': True
        }
    )
    if created:
        created_count += 1
        print(f"✓ Created: {classroom.name}")
    else:
        print(f"- Already exists: {classroom.name}")

print(f"\n✅ Created {created_count} new classrooms")
print(f"Total classrooms: {ClassRoom.objects.count()}")
