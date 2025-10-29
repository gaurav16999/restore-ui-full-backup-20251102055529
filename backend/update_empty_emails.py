import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from users.models import User

# Fix users with empty emails
print("Fixing users with empty emails...")

users_to_fix = User.objects.filter(email__in=['', None])

for user in users_to_fix:
    # Generate email based on username and role
    if user.email in ['', None]:
        new_email = f"{user.username}@school.edu"
        user.email = new_email
        user.save()
        print(f"✓ Updated user {user.username} (ID: {user.id}) with email: {new_email}")

print("\nEmail update complete!")

# Verify no more empty emails
empty_count = User.objects.filter(email__in=['', None]).count()
print(f"\nUsers with empty emails remaining: {empty_count}")

# Check for duplicates again
from django.db.models import Count
duplicates = User.objects.values('email').annotate(count=Count('email')).filter(count__gt=1)
if duplicates:
    print(f"\nWARNING: Found {len(duplicates)} duplicate email(s):")
    for dup in duplicates:
        print(f"  - {dup['email']} (appears {dup['count']} times)")
else:
    print("\n✓ No duplicate emails found. Ready to migrate!")
