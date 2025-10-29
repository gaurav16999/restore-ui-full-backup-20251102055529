#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Class

print("Checking class data for conflicts...")
print("-" * 50)

classes = Class.objects.all()
for cls in classes:
    print(f"Class: {cls.name}")
    print(f"  Room: {cls.room}")
    print(f"  Date: {cls.date}")
    print(f"  Start Time: {cls.start_time}")
    print(f"  End Time: {cls.end_time}")
    print(f"  Day of Week: {cls.day_of_week}")
    print(f"  ID: {cls.id}")
    print("-" * 30)

# Check for conflicts manually
print("\nChecking for conflicts:")
classes_list = list(classes)
for i, cls1 in enumerate(classes_list):
    for j, cls2 in enumerate(classes_list):
        if i >= j:  # Skip same class and duplicates
            continue
            
        if cls1.room == cls2.room and cls1.date == cls2.date:
            if cls1.start_time and cls1.end_time and cls2.start_time and cls2.end_time:
                from datetime import datetime
                
                # Parse times
                start1 = datetime.strptime(str(cls1.start_time), "%H:%M:%S")
                end1 = datetime.strptime(str(cls1.end_time), "%H:%M:%S")
                start2 = datetime.strptime(str(cls2.start_time), "%H:%M:%S")
                end2 = datetime.strptime(str(cls2.end_time), "%H:%M:%S")
                
                # Check overlap
                if start1 < end2 and end1 > start2:
                    print(f"CONFLICT FOUND:")
                    print(f"  Class 1: {cls1.name} ({start1.strftime('%H:%M')} - {end1.strftime('%H:%M')})")
                    print(f"  Class 2: {cls2.name} ({start2.strftime('%H:%M')} - {end2.strftime('%H:%M')})")
                    print(f"  Room: {cls1.room}, Date: {cls1.date}")
                    print()