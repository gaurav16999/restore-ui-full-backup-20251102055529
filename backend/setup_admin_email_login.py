"""
Helper script to create/update admin user for email-based login testing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from users.models import User

# Update admin user with known password for testing
try:
    admin = User.objects.get(username='admin')
    admin.set_password('admin123')
    admin.save()
    print("✓ Admin user password updated!")
    print(f"\nLogin credentials:")
    print(f"  Email: {admin.email}")
    print(f"  Password: admin123")
    print(f"\nYou can now login using email: {admin.email}")
except User.DoesNotExist:
    # Create new admin if doesn't exist
    admin = User.objects.create_user(
        username='admin',
        email='admin@school.edu',
        password='admin123',
        role='admin',
        first_name='Admin',
        last_name='User'
    )
    print("✓ Admin user created!")
    print(f"\nLogin credentials:")
    print(f"  Email: {admin.email}")
    print(f"  Password: admin123")
