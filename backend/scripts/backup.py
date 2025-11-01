#!/usr/bin/env python
"""
Database backup script for EduManage
Supports both SQLite and PostgreSQL databases
"""
import os
import sys
import subprocess
import shutil
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
import django
django.setup()

from django.conf import settings
from django.core.management import call_command


def create_backup_directory():
    """Create backup directory if it doesn't exist"""
    backup_dir = Path(__file__).parent.parent / 'backups'
    backup_dir.mkdir(exist_ok=True)
    return backup_dir


def backup_sqlite():
    """Backup SQLite database"""
    print("Starting SQLite backup...")
    
    db_path = settings.DATABASES['default']['NAME']
    if not os.path.exists(db_path):
        print(f"Error: Database file not found: {db_path}")
        return False
    
    backup_dir = create_backup_directory()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = backup_dir / f'db_backup_{timestamp}.sqlite3'
    
    try:
        shutil.copy2(db_path, backup_file)
        print(f"✓ SQLite backup created: {backup_file}")
        
        # Create a JSON dump as well
        json_file = backup_dir / f'data_backup_{timestamp}.json'
        with open(json_file, 'w') as f:
            call_command('dumpdata', '--natural-foreign', '--natural-primary', 
                        '--indent', '2', stdout=f, exclude=['contenttypes', 'auth.permission'])
        print(f"✓ JSON data dump created: {json_file}")
        
        return True
    except Exception as e:
        print(f"✗ Backup failed: {e}")
        return False


def backup_postgresql():
    """Backup PostgreSQL database"""
    print("Starting PostgreSQL backup...")
    
    db_config = settings.DATABASES['default']
    backup_dir = create_backup_directory()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = backup_dir / f'db_backup_{timestamp}.sql'
    
    # Set environment variables for pg_dump
    env = os.environ.copy()
    env['PGPASSWORD'] = db_config['PASSWORD']
    
    cmd = [
        'pg_dump',
        '-h', db_config['HOST'],
        '-p', str(db_config['PORT']),
        '-U', db_config['USER'],
        '-d', db_config['NAME'],
        '-F', 'c',  # Custom format (compressed)
        '-f', str(backup_file)
    ]
    
    try:
        subprocess.run(cmd, check=True, env=env, capture_output=True)
        print(f"✓ PostgreSQL backup created: {backup_file}")
        
        # Create a JSON dump as well
        json_file = backup_dir / f'data_backup_{timestamp}.json'
        with open(json_file, 'w') as f:
            call_command('dumpdata', '--natural-foreign', '--natural-primary', 
                        '--indent', '2', stdout=f, exclude=['contenttypes', 'auth.permission'])
        print(f"✓ JSON data dump created: {json_file}")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Backup failed: {e}")
        print(f"Error output: {e.stderr.decode() if e.stderr else 'No error output'}")
        return False
    except FileNotFoundError:
        print("✗ pg_dump not found. Please install PostgreSQL client tools.")
        return False


def backup_media_files():
    """Backup media files (uploads)"""
    print("Backing up media files...")
    
    media_root = settings.MEDIA_ROOT if hasattr(settings, 'MEDIA_ROOT') else None
    if not media_root or not os.path.exists(media_root):
        print("No media directory found, skipping...")
        return True
    
    backup_dir = create_backup_directory()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    media_backup = backup_dir / f'media_backup_{timestamp}'
    
    try:
        shutil.copytree(media_root, media_backup)
        
        # Create tar.gz archive
        shutil.make_archive(str(media_backup), 'gztar', media_root)
        shutil.rmtree(media_backup)  # Remove uncompressed copy
        
        print(f"✓ Media files backup created: {media_backup}.tar.gz")
        return True
    except Exception as e:
        print(f"✗ Media backup failed: {e}")
        return False


def cleanup_old_backups(keep_days=30):
    """Remove backups older than specified days"""
    print(f"\nCleaning up backups older than {keep_days} days...")
    
    backup_dir = create_backup_directory()
    cutoff_time = datetime.now().timestamp() - (keep_days * 24 * 60 * 60)
    
    removed_count = 0
    for file in backup_dir.iterdir():
        if file.is_file() and file.stat().st_mtime < cutoff_time:
            file.unlink()
            removed_count += 1
            print(f"  Removed: {file.name}")
    
    print(f"✓ Cleaned up {removed_count} old backup(s)")


def main():
    """Main backup function"""
    print("=" * 60)
    print("EduManage Database Backup Utility")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Database Engine: {settings.DATABASES['default']['ENGINE']}")
    print("=" * 60)
    print()
    
    # Determine database type
    engine = settings.DATABASES['default']['ENGINE']
    
    if 'sqlite' in engine:
        success = backup_sqlite()
    elif 'postgresql' in engine:
        success = backup_postgresql()
    else:
        print(f"✗ Unsupported database engine: {engine}")
        return 1
    
    if not success:
        return 1
    
    # Backup media files
    backup_media_files()
    
    # Cleanup old backups
    cleanup_old_backups()
    
    print("\n" + "=" * 60)
    print("✓ Backup completed successfully!")
    print("=" * 60)
    return 0


if __name__ == '__main__':
    sys.exit(main())
