import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from users.models import User

# Check admin users
admins = User.objects.filter(is_superuser=True)
print(f"Found {admins.count()} admin users:")
for admin in admins:
    print(f"  - Email: {admin.email}, Username: {admin.username}, Role: {admin.role}")

# Try to find any admin role user
admin_role_users = User.objects.filter(role='admin')
print(f"\nFound {admin_role_users.count()} users with admin role:")
for user in admin_role_users:
    print(f"  - Email: {user.email}, Username: {user.username}, Is Superuser: {user.is_superuser}")
