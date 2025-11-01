#!/bin/bash
# PostgreSQL Backup Script for Education Management System

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Database credentials from environment
PGHOST="${POSTGRES_HOST:-postgres}"
PGPORT="${POSTGRES_PORT:-5432}"
PGDATABASE="${POSTGRES_DB:-edu_db}"
PGUSER="${POSTGRES_USER:-edu_user}"
PGPASSWORD="${POSTGRES_PASSWORD}"

export PGPASSWORD

echo "Starting backup at $(date)"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/edu_db_backup_$DATE.sql.gz"

# Create backup
echo "Creating backup: $BACKUP_FILE"
pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
    --no-owner --no-privileges --clean --if-exists \
    | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo "ERROR: Backup failed!"
    exit 1
fi

# Remove old backups (keep only last 30 days)
echo "Cleaning up old backups (older than $RETENTION_DAYS days)"
find "$BACKUP_DIR" -name "edu_db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# List remaining backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"/edu_db_backup_*.sql.gz 2>/dev/null || echo "No backups found"

# Send notification (optional - configure with your notification service)
# curl -X POST "https://your-notification-service.com/api/notify" \
#     -H "Content-Type: application/json" \
#     -d "{\"message\": \"Database backup completed: $BACKUP_FILE\", \"size\": \"$BACKUP_SIZE\"}"

echo "Backup process completed at $(date)"
