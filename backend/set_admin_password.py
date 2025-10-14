import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'admin'
new_password = 'admin'

try:
    user = User.objects.get(username=username)
    user.set_password(new_password)
    user.save()
    print(f"Set password for user '{username}' to '{new_password}'")
except User.DoesNotExist:
    print(f"User '{username}' does not exist")
