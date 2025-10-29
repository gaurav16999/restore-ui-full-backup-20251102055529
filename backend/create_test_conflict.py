import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Class
from datetime import time

def create_test_conflict():
    """Create a test class that should definitely conflict"""
    
    # First, let's see what classes exist
    existing_classes = Class.objects.all()
    print("Existing classes:")
    for cls in existing_classes:
        print(f"- {cls.name} (ID: {cls.id}): Room {cls.room}, {cls.start_time}-{cls.end_time} on {cls.day_of_week}")
    
    # Create a new class that conflicts with existing Grade 10A classes
    test_class = Class.objects.create(
        name="Test Conflict Class",
        room="Room 201",  # Same room as Grade 10A
        start_time=time(9, 30),  # 9:30 AM - overlaps with 9:00-10:00
        end_time=time(10, 30),   # 10:30 AM
        day_of_week="monday",    # Same day
        schedule="Monday 9:30-10:30 AM",
        students_count=25,
        subjects_count=5
    )
    
    print(f"\nCreated test conflict class: {test_class.name} (ID: {test_class.id})")
    print(f"This should conflict with existing Grade 10A classes in Room 201 on Monday")

if __name__ == "__main__":
    create_test_conflict()