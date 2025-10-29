"""
Test login API endpoint directly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from django.test import Client
from users.models import User
import json

# Test the JWT token endpoint
client = Client()

print("="*70)
print("TESTING JWT TOKEN ENDPOINT")
print("="*70)

# Get admin user
admin = User.objects.filter(username='admin').first()
print(f"\nAdmin user:")
print(f"  Username: {admin.username}")
print(f"  Email: {admin.email}")
print(f"  Role: {admin.role}")

# Test 1: Login with email (correct way)
print(f"\n{'='*70}")
print("TEST 1: POST /api/auth/token/ with EMAIL")
print(f"{'='*70}")

data = {
    'username': admin.email,  # Send email as 'username' field
    'password': 'admin123'
}
print(f"Request body: {json.dumps(data, indent=2)}")

response = client.post(
    '/api/auth/token/',
    data=json.dumps(data),
    content_type='application/json'
)

print(f"\nResponse status: {response.status_code}")
if response.status_code == 200:
    print("✅ SUCCESS!")
    resp_data = response.json()
    print(f"Response keys: {list(resp_data.keys())}")
    if 'access' in resp_data:
        print(f"Access token (first 50 chars): {resp_data['access'][:50]}...")
else:
    print(f"❌ FAILED")
    print(f"Response content: {response.content.decode()}")

# Test 2: Check what happens with wrong password
print(f"\n{'='*70}")
print("TEST 2: POST /api/auth/token/ with WRONG PASSWORD")
print(f"{'='*70}")

data2 = {
    'username': admin.email,
    'password': 'wrongpassword'
}
print(f"Request body: {json.dumps(data2, indent=2)}")

response2 = client.post(
    '/api/auth/token/',
    data=json.dumps(data2),
    content_type='application/json'
)

print(f"\nResponse status: {response2.status_code}")
print(f"Response content: {response2.content.decode()}")

print(f"\n{'='*70}")
print("CONCLUSION")
print(f"{'='*70}")
if response.status_code == 200:
    print("✅ JWT token endpoint is working correctly with email!")
    print(f"   Use email '{admin.email}' with password 'admin123'")
else:
    print("❌ There's an issue with the JWT token endpoint")
    print("   Check the error message above")
