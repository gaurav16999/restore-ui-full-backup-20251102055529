#!/usr/bin/env python
"""
Database restore script for EduManage
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


def list_available_backups():
    """List all available backup files"""
    backup_dir = Path(__file__).parent.parent / 'backups'
    
    if not backup_dir.exists():
        print("No backup directory found.")
        return []
    
    backups = list(backup_dir.glob('db_backup_*.sqlite3')) + \
              list(backup_dir.glob('db_backup_*.sql')) + \
              list(backup_dir.glob('data_backup_*.json'))
    
    return sorted(backups, key=lambda x: x.stat().st_mtime, reverse=True)


def restore_sqlite(backup_file):
    """Restore SQLite database"""
    print(f"Restoring SQLite from: {backup_file}")
    
    db_path = settings.DATABASES['default']['NAME']
    
    # Create backup of current database
    if os.path.exists(db_path):
        current_backup = Path(db_path).parent / f'{Path(db_path).stem}_before_restore.sqlite3'
        shutil.copy2(db_path, current_backup)
        print(f"✓ Current database backed up to: {current_backup}")
    
    try:
        if backup_file.suffix == '.sqlite3':
            # Direct SQLite file restore
            shutil.copy2(backup_file, db_path)
            print(f"✓ Database restored from SQLite file")
        elif backup_file.suffix == '.json':
            # JSON data restore
            print("Flushing current database...")
            call_command('flush', '--no-input')
            print("Loading data from JSON...")
            with open(backup_file, 'r') as f:
                call_command('loaddata', '-', stdin=f)
            print(f"✓ Database restored from JSON file")
        else:
            print(f"✗ Unsupported backup file format: {backup_file.suffix}")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Restore failed: {e}")
        return False


def restore_postgresql(backup_file):
    """Restore PostgreSQL database"""
    print(f"Restoring PostgreSQL from: {backup_file}")
    
    db_config = settings.DATABASES['default']
    
    # Set environment variables for pg_restore
    env = os.environ.copy()
    env['PGPASSWORD'] = db_config['PASSWORD']
    
    try:
        if backup_file.suffix == '.sql':
            # PostgreSQL custom format restore
            print("Dropping existing database objects...")
            cmd_drop = [
                'psql',
                '-h', db_config['HOST'],
                '-p', str(db_config['PORT']),
                '-U', db_config['USER'],
                '-d', db_config['NAME'],
                '-c', 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
            ]
            subprocess.run(cmd_drop, check=True, env=env, capture_output=True)
            
            print("Restoring database...")
            cmd_restore = [
                'pg_restore',
                '-h', db_config['HOST'],
                '-p', str(db_config['PORT']),
                '-U', db_config['USER'],
                '-d', db_config['NAME'],
                '-F', 'c',  # Custom format
                str(backup_file)
            ]
            subprocess.run(cmd_restore, check=True, env=env, capture_output=True)
            print(f"✓ Database restored from PostgreSQL backup")
            
        elif backup_file.suffix == '.json':
            # JSON data restore
            print("Flushing current database...")
            call_command('flush', '--no-input')
            print("Loading data from JSON...")
            with open(backup_file, 'r') as f:
                call_command('loaddata', '-', stdin=f)
            print(f"✓ Database restored from JSON file")
        else:
            print(f"✗ Unsupported backup file format: {backup_file.suffix}")
            return False
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Restore failed: {e}")
        print(f"Error output: {e.stderr.decode() if e.stderr else 'No error output'}")
        return False
    except FileNotFoundError:
        print("✗ PostgreSQL client tools not found.")
        return False


def restore_media_files(backup_file):
    """Restore media files from tar.gz archive"""
    print(f"Restoring media files from: {backup_file}")
    
    media_root = settings.MEDIA_ROOT if hasattr(settings, 'MEDIA_ROOT') else None
    if not media_root:
        print("No media directory configured, skipping...")
        return True
    
    try:
        # Create backup of current media
        if os.path.exists(media_root):
            current_backup = f"{media_root}_before_restore"
            shutil.copytree(media_root, current_backup)
            print(f"✓ Current media backed up to: {current_backup}")
        
        # Extract archive
        shutil.unpack_archive(backup_file, media_root)
        print(f"✓ Media files restored")
        return True
    except Exception as e:
        print(f"✗ Media restore failed: {e}")
        return False


def main():
    """Main restore function"""
    print("=" * 60)
    print("EduManage Database Restore Utility")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Database Engine: {settings.DATABASES['default']['ENGINE']}")
    print("=" * 60)
    print()
    
    # List available backups
    backups = list_available_backups()
    
    if not backups:
        print("✗ No backup files found.")
        return 1
    
    print("Available backups:")
    for i, backup in enumerate(backups, 1):
        mod_time = datetime.fromtimestamp(backup.stat().st_mtime)
        size = backup.stat().st_size / (1024 * 1024)  # MB
        print(f"  {i}. {backup.name}")
        print(f"     Date: {mod_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"     Size: {size:.2f} MB")
        print()
    
    # Get user selection
    try:
        selection = input("Enter backup number to restore (or 'q' to quit): ")
        if selection.lower() == 'q':
            print("Restore cancelled.")
            return 0
        
        backup_index = int(selection) - 1
        if backup_index < 0 or backup_index >= len(backups):
            print("✗ Invalid selection.")
            return 1
        
        selected_backup = backups[backup_index]
    except (ValueError, KeyboardInterrupt):
        print("\n✗ Restore cancelled.")
        return 1
    
    # Confirm restoration
    confirm = input(f"\n⚠ This will REPLACE your current database with: {selected_backup.name}\n"
                   f"   Are you sure? Type 'yes' to continue: ")
    
    if confirm.lower() != 'yes':
        print("Restore cancelled.")
        return 0
    
    print("\nStarting restoration...")
    print("=" * 60)
    
    # Determine database type
    engine = settings.DATABASES['default']['ENGINE']
    
    if 'sqlite' in engine:
        success = restore_sqlite(selected_backup)
    elif 'postgresql' in engine:
        success = restore_postgresql(selected_backup)
    else:
        print(f"✗ Unsupported database engine: {engine}")
        return 1
    
    if not success:
        return 1
    
    # Look for corresponding media backup
    media_backup = selected_backup.parent / f"media_backup_{selected_backup.stem.split('_')[-1]}.tar.gz"
    if media_backup.exists():
        restore_media_files(media_backup)
    
    print("\n" + "=" * 60)
    print("✓ Restore completed successfully!")
    print("=" * 60)
    return 0


if __name__ == '__main__':
    sys.exit(main())
