import requests
import json

# Test creating a grade

# Login first
login_url = "http://127.0.0.1:8000/api/auth/token/"
login_data = {
    "email": "admin@example.com",
    "password": "admin123"
}

print("Logging in...")
response = requests.post(login_url, json=login_data)
if response.status_code == 200:
    tokens = response.json()
    access_token = tokens.get('access')
    print(f"✓ Login successful!")
    
    # Test POST to grades endpoint
    grades_url = "http://127.0.0.1:8000/api/admin/grades/"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # First, let's check what students exist
    students_url = "http://127.0.0.1:8000/api/admin/students/"
    print("\nChecking available students...")
    students_response = requests.get(students_url, headers=headers)
    if students_response.status_code == 200:
        students_data = students_response.json()
        if isinstance(students_data, dict):
            students = students_data.get('results', [])
        else:
            students = students_data
        print(f"Found {len(students)} students")
        if len(students) > 0:
            print(f"First student ID: {students[0].get('id', 'N/A')}")
    
    # Check subjects
    subjects_url = "http://127.0.0.1:8000/api/admin/subjects/"
    print("\nChecking available subjects...")
    subjects_response = requests.get(subjects_url, headers=headers)
    if subjects_response.status_code == 200:
        subjects_data = subjects_response.json()
        if isinstance(subjects_data, dict):
            subjects = subjects_data.get('results', [])
        else:
            subjects = subjects_data
        print(f"Found {len(subjects)} subjects")
        if len(subjects) > 0:
            print(f"First subject ID: {subjects[0].get('id', 'N/A')}")
    
    # Test OPTIONS request to see allowed methods
    print("\nChecking allowed methods for /api/admin/grades/...")
    options_response = requests.options(grades_url, headers=headers)
    print(f"Status: {options_response.status_code}")
    print(f"Allow header: {options_response.headers.get('Allow', 'Not specified')}")
    
else:
    print(f"✗ Login failed: {response.status_code}")
    print(response.text)
