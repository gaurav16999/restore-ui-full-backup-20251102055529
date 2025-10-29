"""
Test script to verify dynamic notifications are working
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Notification, Student, Teacher
from users.models import User
from datetime import datetime

def test_notifications():
    print("\n" + "="*60)
    print("TESTING DYNAMIC NOTIFICATIONS")
    print("="*60)
    
    # 1. Check if students exist
    print("\n1. Checking Students:")
    students = Student.objects.all()[:3]
    print(f"   Total students: {Student.objects.count()}")
    
    if students:
        student = students[0]
        user = student.user
        print(f"\n   Testing notifications for: {user.first_name} {user.last_name}")
        print(f"   Username: {user.username}")
        print(f"   Class: {student.class_name}")
        
        # Create a test notification for this student
        notif = Notification.objects.create(
            user=user,
            title='Test Notification',
            message='This is a test notification to verify the system works.',
            notification_type='info',
            priority='medium',
            action_url='/student/courses'
        )
        print(f"\n   Created test notification ID: {notif.id}")
        print(f"   Title: {notif.title}")
        print(f"   Message: {notif.message}")
        print(f"   Read status: {notif.is_read}")
    
    # 2. Check teachers
    print("\n2. Checking Teachers:")
    teachers = Teacher.objects.all()[:2]
    print(f"   Total teachers: {Teacher.objects.count()}")
    
    if teachers:
        teacher = teachers[0]
        user = teacher.user
        print(f"\n   Testing notifications for: {user.first_name} {user.last_name}")
        print(f"   Username: {user.username}")
        
        # Create a test notification for this teacher
        notif = Notification.objects.create(
            user=user,
            title='Grading Reminder',
            message='You have assignments pending grading.',
            notification_type='warning',
            priority='high',
            action_url='/teacher/grades'
        )
        print(f"\n   Created test notification ID: {notif.id}")
    
    # 3. Check admin users
    print("\n3. Checking Admin Users:")
    admins = User.objects.filter(is_superuser=True)[:2]
    print(f"   Total admin users: {admins.count()}")
    
    if admins:
        admin = admins[0]
        print(f"\n   Testing notifications for: {admin.first_name or admin.username}")
        
        # Create a test notification for admin
        notif = Notification.objects.create(
            user=admin,
            title='System Update',
            message='New student registrations need approval.',
            notification_type='info',
            priority='high',
            action_url='/admin/students'
        )
        print(f"\n   Created test notification ID: {notif.id}")
    
    # 4. Show all notifications
    print("\n4. All Notifications in Database:")
    all_notifs = Notification.objects.all()[:10]
    print(f"   Total notifications: {Notification.objects.count()}")
    for notif in all_notifs:
        print(f"\n   - {notif.user.username}: {notif.title}")
        print(f"     Type: {notif.notification_type}, Priority: {notif.priority}")
        print(f"     Read: {notif.is_read}")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == '__main__':
    test_notifications()
