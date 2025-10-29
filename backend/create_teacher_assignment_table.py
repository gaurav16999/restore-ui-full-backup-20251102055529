import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from django.db import connection
from admin_api.models import TeacherAssignment

print("Creating TeacherAssignment table...")

with connection.schema_editor() as schema_editor:
    try:
        schema_editor.create_model(TeacherAssignment)
        print("✓ TeacherAssignment table created successfully")
    except Exception as e:
        print(f"Error: {e}")

# Verify table exists
cursor = connection.cursor()
cursor.execute("SELECT sql FROM sqlite_master WHERE name='admin_api_teacherassignment'")
result = cursor.fetchone()
if result:
    print("\n✓ Table verified in database")
    print("\nTable schema:")
    print(result[0])
else:
    print("\n✗ Table was not created")
