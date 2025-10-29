import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from users.models import User
from django.db.models import Count

# Find users with duplicate emails
print("Checking for duplicate emails...")
duplicates = User.objects.values('email').annotate(count=Count('email')).filter(count__gt=1)

if duplicates:
    print(f"\nFound {len(duplicates)} duplicate email(s):")
    for dup in duplicates:
        users = User.objects.filter(email=dup['email'])
        print(f"\nEmail: {dup['email']} (appears {dup['count']} times)")
        for user in users:
            print(f"  - ID: {user.id}, Username: {user.username}, Role: {user.role}")
else:
    print("No duplicate emails found.")

# Also check for empty/null emails
print("\n" + "="*50)
print("Checking for empty/null emails...")
empty_emails = User.objects.filter(email__in=['', None])
if empty_emails.exists():
    print(f"\nFound {empty_emails.count()} user(s) with empty/null email:")
    for user in empty_emails:
        print(f"  - ID: {user.id}, Username: {user.username}, Role: {user.role}, Email: '{user.email}'")
else:
    print("No users with empty/null emails.")

# Show all users
print("\n" + "="*50)
print("All users in database:")
all_users = User.objects.all().order_by('id')
for user in all_users:
    print(f"ID: {user.id:3d} | Username: {user.username:15s} | Email: {user.email:30s} | Role: {user.role}")
