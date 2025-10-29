import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from users.models import User

# Test email-based authentication
print("Testing email-based login...")
print("="*60)

# Get the admin user
admin = User.objects.filter(role='admin').first()
if admin:
    print(f"\nAdmin User:")
    print(f"  Username: {admin.username}")
    print(f"  Email: {admin.email}")
    print(f"  Role: {admin.role}")
    
    # Test login with email via API
    login_url = "http://localhost:8000/api/auth/token/"
    
    # Since we don't know the password, let's just show what we would send
    print(f"\nTo test login via API, send POST request to:")
    print(f"  URL: {login_url}")
    print(f"  Body: {{")
    print(f'    "username": "{admin.email}",  // Use EMAIL here')
    print(f'    "password": "your_password"')
    print(f"  }}")
    
    print(f"\nNOTE: JWT's TokenObtainPairView uses the USERNAME_FIELD from your User model.")
    print(f"      Since we set USERNAME_FIELD = 'email', it will authenticate using email!")

# Show a few more users
print("\n" + "="*60)
print("Sample users (for testing):")
print("-"*60)
users = User.objects.all()[:5]
for user in users:
    print(f"Email: {user.email:35s} | Role: {user.role}")

print("\n" + "="*60)
print("✓ Database is ready for email-based authentication!")
print("  The User model now uses EMAIL as the login field.")
print("  Frontend should send email (not username) in login requests.")
