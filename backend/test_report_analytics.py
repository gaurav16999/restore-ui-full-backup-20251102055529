import requests
import json

# Test the report analytics endpoint

# First, login to get token
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
    print(f"✓ Login successful! Got access token")
    
    # Test the analytics endpoint
    analytics_url = "http://127.0.0.1:8000/api/admin/reports/analytics/"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    print("\nFetching report analytics...")
    response = requests.get(analytics_url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Analytics fetched successfully!")
        print(f"\n--- Analytics Summary ---")
        analytics = data.get('analytics', {})
        print(f"Class Average: {analytics.get('class_average', 0)}%")
        print(f"Top Performers: {analytics.get('top_performers', 0)}")
        print(f"At Risk: {analytics.get('at_risk', 0)}")
        print(f"Improvement Rate: {analytics.get('improvement_rate', 0)}%")
        print(f"Total Students: {analytics.get('total_students', 0)}")
        print(f"Total Grades: {analytics.get('total_grades', 0)}")
        
        print(f"\n--- Student Reports ---")
        student_reports = data.get('student_reports', [])
        print(f"Total Reports: {len(student_reports)}")
        for i, report in enumerate(student_reports[:5], 1):
            print(f"{i}. {report.get('student')} - {report.get('overall_average')}% ({report.get('grade')})")
        
        print(f"\n--- Grade Distribution ---")
        grade_dist = data.get('grade_distribution', [])
        for dist in grade_dist:
            print(f"{dist.get('grade')}: {dist.get('count')} students")
        
        print(f"\n--- Progress Tracking ---")
        progress = data.get('progress_tracking', [])
        print(f"Students tracked: {len(progress)}")
        for p in progress[:3]:
            print(f"{p.get('student')}: {p.get('change'):+.1f}% ({p.get('trend')})")
    else:
        print(f"✗ Failed to fetch analytics: {response.status_code}")
        print(response.text)
else:
    print(f"✗ Login failed: {response.status_code}")
    print(response.text)
