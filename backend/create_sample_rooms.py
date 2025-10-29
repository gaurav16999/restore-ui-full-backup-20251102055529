import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Room

def create_sample_rooms():
    """Create sample room data"""
    
    sample_rooms = [
        {
            'room_number': '101',
            'name': 'Science Lab A',
            'room_type': 'laboratory',
            'capacity': 25,
            'floor': 'Ground',
            'building': 'Science Block',
            'has_projector': True,
            'has_computer': True,
            'has_whiteboard': True
        },
        {
            'room_number': '201',
            'name': 'Mathematics Classroom',
            'room_type': 'classroom',
            'capacity': 35,
            'floor': '2nd',
            'building': 'Main Building',
            'has_projector': True,
            'has_computer': False,
            'has_whiteboard': True
        },
        {
            'room_number': '202',
            'name': 'English Classroom',
            'room_type': 'classroom',
            'capacity': 30,
            'floor': '2nd',
            'building': 'Main Building',
            'has_projector': False,
            'has_computer': False,
            'has_whiteboard': True
        },
        {
            'room_number': '301',
            'name': 'Computer Lab',
            'room_type': 'laboratory',
            'capacity': 20,
            'floor': '3rd',
            'building': 'IT Block',
            'has_projector': True,
            'has_computer': True,
            'has_whiteboard': True
        },
        {
            'room_number': 'AUD-001',
            'name': 'Main Auditorium',
            'room_type': 'auditorium',
            'capacity': 200,
            'floor': 'Ground',
            'building': 'Main Building',
            'has_projector': True,
            'has_computer': True,
            'has_whiteboard': False
        },
        {
            'room_number': 'LIB-001',
            'name': 'Central Library',
            'room_type': 'library',
            'capacity': 50,
            'floor': '1st',
            'building': 'Library Building',
            'has_projector': False,
            'has_computer': True,
            'has_whiteboard': False
        },
        {
            'room_number': 'GYM-001',
            'name': 'Main Gymnasium',
            'room_type': 'gymnasium',
            'capacity': 100,
            'floor': 'Ground',
            'building': 'Sports Complex',
            'has_projector': False,
            'has_computer': False,
            'has_whiteboard': False
        }
    ]
    
    for room_data in sample_rooms:
        room, created = Room.objects.get_or_create(
            room_number=room_data['room_number'],
            defaults=room_data
        )
        if created:
            print(f"Created room: {room.room_number} - {room.name}")
        else:
            print(f"Room already exists: {room.room_number} - {room.name}")

if __name__ == "__main__":
    create_sample_rooms()
    print("Sample room data creation completed!")