import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from django.db.migrations.recorder import MigrationRecorder
from django.db import connection

recorder = MigrationRecorder(connection)
recorder.record_applied('admin_api', '0011_teacherassignment')
print('✓ Migration 0011_teacherassignment recorded as applied')
