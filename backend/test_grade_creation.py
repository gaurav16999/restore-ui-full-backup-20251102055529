import requests
import json

# Test creating a grade with correct data structure

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
    
    # Get a student and subject
    students_url = "http://127.0.0.1:8000/api/admin/students/"
    subjects_url = "http://127.0.0.1:8000/api/admin/subjects/"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    students_response = requests.get(students_url, headers=headers)
    subjects_response = requests.get(subjects_url, headers=headers)
    
    if students_response.status_code == 200 and subjects_response.status_code == 200:
        students_data = students_response.json()
        subjects_data = subjects_response.json()
        
        students = students_data.get('results', []) if isinstance(students_data, dict) else students_data
        subjects = subjects_data.get('results', []) if isinstance(subjects_data, dict) else subjects_data
        
        if len(students) > 0 and len(subjects) > 0:
            student_id = students[0]['id']
            subject_id = subjects[0]['id']
            
            print(f"\nUsing student ID: {student_id}")
            print(f"Using subject ID: {subject_id}")
            
            # Create grade data matching backend expectations
            from datetime import date
            
            grade_data = {
                "student": student_id,
                "subject": subject_id,
                "grade_type": "assignment",  # lowercase
                "score": 85.5,
                "max_score": 100.0,
                "notes": "Great work on the assignment!",
                "date_recorded": date.today().isoformat()  # YYYY-MM-DD format
            }
            
            print(f"\nCreating grade with data:")
            print(json.dumps(grade_data, indent=2))
            
            # Test POST to grades endpoint
            grades_url = "http://127.0.0.1:8000/api/admin/grades/"
            response = requests.post(grades_url, headers=headers, json=grade_data)
            
            print(f"\nResponse status: {response.status_code}")
            
            if response.status_code == 201:
                print("✓ Grade created successfully!")
                print(json.dumps(response.json(), indent=2))
            else:
                print("✗ Failed to create grade")
                print(f"Error: {response.text}")
        else:
            print("No students or subjects found in database")
    else:
        print(f"Failed to fetch students or subjects")
else:
    print(f"✗ Login failed: {response.status_code}")
    print(response.text)
