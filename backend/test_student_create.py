import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.serializers.student import StudentCreateSerializer

# Test data
test_data = {
    'first_name': 'Test',
    'last_name': 'Student',
    'email': 'test@example.com',
    'class_name': 'Class 10',
    'phone': '1234567890',
    'password': 'testpass123'
}

print("Testing student creation with auto-generated Student ID...")
print(f"Input data: {test_data}")

try:
    serializer = StudentCreateSerializer(data=test_data)
    
    if serializer.is_valid():
        student = serializer.save()
        print(f"\n✅ SUCCESS!")
        print(f"Student created:")
        print(f"  - Name: {student.user.get_full_name()}")
        print(f"  - Student ID: {student.roll_no}")
        print(f"  - Username: {student.user.username}")
        print(f"  - Email: {student.user.email}")
        print(f"  - Class: {student.class_name}")
    else:
        print(f"\n❌ VALIDATION FAILED!")
        print(f"Errors: {serializer.errors}")
        
except Exception as e:
    print(f"\n❌ ERROR!")
    print(f"Exception: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
