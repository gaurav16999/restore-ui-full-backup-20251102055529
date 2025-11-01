# Database Migration Instructions

## Overview
This document provides instructions for migrating the database to support new production features.

---

## New Features Requiring Migrations

1. **User Model Changes** (Email Verification)
   - `email_verified` field
   - `verification_code` field
   - `verification_code_expires` field

2. **PaymentTransaction Model** (Stripe Integration)
   - Complete new model for payment tracking

---

## Migration Steps

### Step 1: Create Migrations

Run the following command to generate migrations:

```bash
cd backend
python manage.py makemigrations users admin_api
```

This will create migration files for:
- `users/migrations/xxxx_add_email_verification_fields.py`
- `admin_api/migrations/xxxx_add_paymenttransaction_model.py`

### Step 2: Review Migrations

Check the generated migration files to ensure they include:

**Users Migration:**
```python
operations = [
    migrations.AddField(
        model_name='user',
        name='email_verified',
        field=models.BooleanField(default=False),
    ),
    migrations.AddField(
        model_name='user',
        name='verification_code',
        field=models.CharField(blank=True, max_length=6, null=True),
    ),
    migrations.AddField(
        model_name='user',
        name='verification_code_expires',
        field=models.DateTimeField(blank=True, null=True),
    ),
]
```

**Admin API Migration:**
```python
operations = [
    migrations.CreateModel(
        name='PaymentTransaction',
        fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
            ('fee_type', models.CharField(choices=[...], max_length=50)),
            ('status', models.CharField(choices=[...], default='pending', max_length=20)),
            # ... other fields
        ],
    ),
]
```

### Step 3: Apply Migrations

#### For Development (SQLite):
```bash
python manage.py migrate
```

#### For Production (PostgreSQL):
```bash
# Make sure USE_SQLITE=0 in your .env
python manage.py migrate
```

#### Using Docker:
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Step 4: Verify Migrations

```bash
# Check migration status
python manage.py showmigrations

# You should see:
# users
#  [X] 0001_initial
#  [X] 0002_add_email_verification_fields  (NEW)
# admin_api
#  [X] 0001_initial
#  [X] 0002_grade
#  ...
#  [X] 0011_add_paymenttransaction_model  (NEW)
```

---

## Troubleshooting

### Issue: Migration conflicts

If you see conflicts:
```bash
python manage.py makemigrations --merge
python manage.py migrate
```

### Issue: Table already exists

If a table already exists (rare case):
```bash
python manage.py migrate --fake admin_api 0011_add_paymenttransaction_model
```

### Issue: Need to rollback

To rollback a specific migration:
```bash
# Rollback users to previous migration
python manage.py migrate users 0001_initial

# Rollback admin_api
python manage.py migrate admin_api 0010_previous_migration
```

---

## Post-Migration Steps

### 1. Install New Python Packages

```bash
pip install -r requirements.txt
```

This installs:
- stripe
- pandas
- openpyxl
- redis
- gunicorn
- and other new dependencies

### 2. Seed Demo Data (Optional)

```bash
python manage.py seed_demo_data
```

This creates:
- Admin, teacher, and student users
- Academic structure (grades, subjects, sections)
- Sample attendance and exam data

### 3. Create Superuser (if not using seed)

```bash
python manage.py createsuperuser
# Email: admin@example.com
# Password: (your secure password)
```

### 4. Collect Static Files (Production)

```bash
python manage.py collectstatic --noinput
```

---

## Data Safety

### Backup Before Migration

Always backup your database before running migrations:

```bash
# SQLite backup
cp db.sqlite3 db.sqlite3.backup

# PostgreSQL backup
pg_dump -U edu_user edu_db > backup_before_migration.sql

# Or use Docker
docker-compose -f docker-compose.prod.yml exec db_backup sh /backup.sh
```

### Restore if Needed

```bash
# SQLite restore
cp db.sqlite3.backup db.sqlite3

# PostgreSQL restore
psql -U edu_user edu_db < backup_before_migration.sql

# Or use Docker
docker-compose -f docker-compose.prod.yml exec db_backup sh /restore.sh /backups/backup_file.sql.gz
```

---

## Testing After Migration

### 1. Check Database Schema

```bash
python manage.py dbshell

# SQLite
.schema users_user
.schema admin_api_paymenttransaction

# PostgreSQL
\d users_user
\d admin_api_paymenttransaction
```

### 2. Test New Features

```bash
# Test email verification
python manage.py shell
>>> from users.models import User
>>> user = User.objects.first()
>>> user.email_verified
>>> user.verification_code

# Test payment model
>>> from admin_api.models import PaymentTransaction
>>> PaymentTransaction.objects.count()
```

### 3. Run Tests (if available)

```bash
python manage.py test
# or
pytest
```

---

## Production Migration Checklist

- [ ] Backup database
- [ ] Notify users about maintenance window
- [ ] Stop application services
- [ ] Install new dependencies (`pip install -r requirements.txt`)
- [ ] Create migrations (`python manage.py makemigrations`)
- [ ] Review migration files
- [ ] Apply migrations (`python manage.py migrate`)
- [ ] Collect static files (`python manage.py collectstatic`)
- [ ] Test database schema
- [ ] Test new features
- [ ] Restart application services
- [ ] Monitor logs for errors
- [ ] Verify all features working
- [ ] Notify users about completion

---

## Quick Reference

### Common Commands

```bash
# Create migrations
python manage.py makemigrations

# Show SQL for migration
python manage.py sqlmigrate users 0002

# List all migrations
python manage.py showmigrations

# Apply all migrations
python manage.py migrate

# Apply specific app migrations
python manage.py migrate users

# Fake a migration (mark as applied without running)
python manage.py migrate --fake users 0002

# Rollback to specific migration
python manage.py migrate users 0001

# Reset all migrations (DANGER!)
python manage.py migrate users zero
```

---

## Support

If you encounter issues:

1. Check Django documentation: https://docs.djangoproject.com/en/5.0/topics/migrations/
2. Review migration files in `users/migrations/` and `admin_api/migrations/`
3. Check logs: `docker-compose logs -f backend`
4. Verify database connection settings in `.env`

---

**Last Updated**: January 2025
