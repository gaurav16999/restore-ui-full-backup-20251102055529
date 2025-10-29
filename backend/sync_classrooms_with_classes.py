import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Class, ClassRoom

# Get all Classes and create corresponding ClassRooms if they don't exist
classes = Class.objects.all()

for cls in classes:
    # Extract grade level and section from class name
    # E.g., "Grade 10cv" -> grade_level="Grade 10", section="cv"
    parts = cls.name.split()
    if len(parts) >= 2:
        grade_level = ' '.join(parts[:-1])  # Everything except last part
        section = parts[-1]  # Last part is the section
    else:
        grade_level = cls.name
        section = 'A'
    
    # Create a unique room_code
    room_code = f"RM-{cls.name.replace(' ', '-')}"
    
    classroom, created = ClassRoom.objects.get_or_create(
        name=cls.name,
        defaults={
            'grade_level': grade_level,
            'section': section,
            'room_code': room_code,
            'assigned_teacher': cls.teacher if hasattr(cls, 'teacher') and cls.teacher else None,
            'students_count': 0,
            'is_active': True
        }
    )
    if created:
        print(f"Created ClassRoom: {classroom.name}")
    else:
        print(f"ClassRoom already exists: {classroom.name}")

print("\nDone! All classes now have corresponding ClassRooms.")
