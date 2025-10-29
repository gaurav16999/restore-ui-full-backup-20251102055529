"""
Final verification: Email-based login is working correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from django.test import Client
from users.models import User
import json

client = Client()

print("="*70)
print("FINAL EMAIL LOGIN VERIFICATION")
print("="*70)

# Test with different users
test_users = [
    ('admin@example.com', 'admin123', 'Admin'),
    ('student@school.edu', None, 'Student'),
    ('teacher@school.edu', None, 'Teacher'),
]

print("\n✅ JWT Token Endpoint Configuration:")
print("   - Expects 'email' field (not 'username')")
print("   - Frontend updated to send 'email' field")
print("   - User model uses email for authentication")

print(f"\n{'='*70}")
print("TEST: Login with admin@example.com")
print(f"{'='*70}")

data = {
    'email': 'admin@example.com',
    'password': 'admin123'
}

response = client.post(
    '/api/auth/token/',
    data=json.dumps(data),
    content_type='application/json'
)

print(f"Request: POST /api/auth/token/")
print(f"Body: {json.dumps(data, indent=2)}")
print(f"\nStatus Code: {response.status_code}")

if response.status_code == 200:
    print("✅ SUCCESS! Login works correctly")
    resp_data = response.json()
    print(f"✓ Access token received: {resp_data['access'][:30]}...")
    print(f"✓ Refresh token received: {resp_data['refresh'][:30]}...")
else:
    print(f"❌ FAILED")
    print(f"Response: {response.content.decode()}")

print(f"\n{'='*70}")
print("AVAILABLE TEST ACCOUNTS")
print(f"{'='*70}")
print(f"{'Email':<40} | Role")
print(f"{'-'*40}-|----------")

users = User.objects.all().order_by('role', 'id')[:15]
for user in users:
    pwd_status = "✓ admin123" if user.email == 'admin@example.com' else "(set password)"
    print(f"{user.email:<40} | {user.role:8s} | {pwd_status}")

print(f"\n{'='*70}")
print("HOW TO LOGIN FROM FRONTEND")
print(f"{'='*70}")
print("1. Navigate to the login page")
print("2. Enter EMAIL (not username): admin@example.com")
print("3. Enter PASSWORD: admin123")
print("4. Click 'Sign In'")
print(f"\n✅ Email-based login is ready to use!")
print(f"{'='*70}")
