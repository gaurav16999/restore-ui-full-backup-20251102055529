"""
Test with actual email field
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from django.test import Client
import json

client = Client()

print("Testing with 'email' field directly:")
data = {
    'email': 'admin@example.com',
    'password': 'admin123'
}
print(f"Request: {json.dumps(data, indent=2)}")

response = client.post(
    '/api/auth/token/',
    data=json.dumps(data),
    content_type='application/json'
)

print(f"Status: {response.status_code}")
print(f"Response: {response.content.decode()}")
