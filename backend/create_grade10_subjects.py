import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Subject, Class, ClassSubject

# Create common subjects for Grade 10
grade_10_subjects = [
    {'code': 'MATH10', 'title': 'Mathematics', 'credit_hours': 5},
    {'code': 'SCI10', 'title': 'Science', 'credit_hours': 4},
    {'code': 'ENG10', 'title': 'English', 'credit_hours': 4},
    {'code': 'NEP10', 'title': 'Nepali', 'credit_hours': 4},
    {'code': 'SOC10', 'title': 'Social Studies', 'credit_hours': 3},
    {'code': 'OPTMATH10', 'title': 'Optional Mathematics', 'credit_hours': 3},
]

print("Creating subjects...")
for subject_data in grade_10_subjects:
    subject, created = Subject.objects.get_or_create(
        code=subject_data['code'],
        defaults={
            'title': subject_data['title'],
            'credit_hours': subject_data['credit_hours'],
            'is_active': True
        }
    )
    if created:
        print(f"✓ Created subject: {subject.code} - {subject.title}")
    else:
        print(f"  Subject already exists: {subject.code} - {subject.title}")

# Get all Grade 10 classes
print("\nAssigning subjects to Grade 10 classes...")
grade_10_classes = Class.objects.filter(name__icontains='Grade 10')

if not grade_10_classes.exists():
    print("No Grade 10 classes found!")
else:
    for cls in grade_10_classes:
        print(f"\nClass: {cls.name}")
        
        # Assign all subjects to this class
        for subject_data in grade_10_subjects:
            subject = Subject.objects.get(code=subject_data['code'])
            
            # Optional Math is optional, others are compulsory
            is_compulsory = subject_data['code'] != 'OPTMATH10'
            
            class_subject, created = ClassSubject.objects.get_or_create(
                class_assigned=cls,
                subject=subject,
                defaults={
                    'is_compulsory': is_compulsory,
                    'is_active': True
                }
            )
            
            if created:
                status = "Compulsory" if is_compulsory else "Optional"
                print(f"  ✓ Assigned: {subject.title} ({status})")
            else:
                print(f"    Already assigned: {subject.title}")

print("\n✅ Done! Subjects have been created and assigned to Grade 10 classes.")
print("\nYou can now:")
print("1. View class subjects at: /admin/class-subjects")
print("2. Add more subjects via the admin panel")
print("3. Assign subjects to other classes")
