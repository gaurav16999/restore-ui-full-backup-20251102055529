import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Class
from datetime import time, date

def update_existing_classes():
    """Update existing classes with structured schedule data for testing"""
    
    # Get all classes
    classes = Class.objects.all()
    print(f"Found {classes.count()} classes to update")
    
    for cls in classes:
        print(f"Updating class: {cls.name}")
        
        # Update based on existing data
        if cls.name == "Grade 10A":
            cls.start_time = time(9, 0)  # 9:00 AM
            cls.end_time = time(10, 0)   # 10:00 AM
            cls.day_of_week = "monday"
            cls.date = None  # For recurring weekly schedule
        
        # You can add more specific updates here for other classes
        cls.save()
        print(f"Updated {cls.name} with start_time: {cls.start_time}, end_time: {cls.end_time}, day: {cls.day_of_week}")

if __name__ == "__main__":
    update_existing_classes()
    print("Class schedule update completed!")