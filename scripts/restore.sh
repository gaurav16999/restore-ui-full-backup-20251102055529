#!/bin/bash
# PostgreSQL Restore Script for Education Management System

set -e

# Configuration
BACKUP_DIR="/backups"

# Database credentials from environment
PGHOST="${POSTGRES_HOST:-postgres}"
PGPORT="${POSTGRES_PORT:-5432}"
PGDATABASE="${POSTGRES_DB:-edu_db}"
PGUSER="${POSTGRES_USER:-edu_user}"
PGPASSWORD="${POSTGRES_PASSWORD}"

export PGPASSWORD

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/edu_db_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Starting restore from: $BACKUP_FILE"
echo "WARNING: This will replace all data in database: $PGDATABASE"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "Restoring database at $(date)"

# Drop existing connections
echo "Terminating existing connections..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$PGDATABASE' AND pid <> pg_backend_pid();"

# Restore backup
echo "Restoring from backup..."
gunzip -c "$BACKUP_FILE" | psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE"

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo "Restore completed successfully at $(date)"
else
    echo "ERROR: Restore failed!"
    exit 1
fi

echo "Running migrations to ensure database is up to date..."
cd /app
python manage.py migrate --noinput

echo "Restore process completed successfully"
