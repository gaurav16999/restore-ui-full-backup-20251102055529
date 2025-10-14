import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv('DEV_SUPERUSER', 'admin')
password = os.getenv('DEV_SUPERPASS', 'admin123')
email = os.getenv('DEV_SUPEREMAIL', 'admin@example.com')

user, created = User.objects.get_or_create(username=username, defaults={'email': email})
# Always ensure dev password and flags are set for local development
user.set_password(password)
user.is_superuser = True
user.is_staff = True
user.role = 'admin'
user.email = email
user.save()
if created:
    print('Created default superuser with admin role')
else:
    print('Updated existing superuser to have admin role and reset password')
