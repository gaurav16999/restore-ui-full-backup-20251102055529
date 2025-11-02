# Deployment Guide - Education Management System

This guide provides step-by-step instructions for deploying the application to production.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Software
- Docker 20.10+ and Docker Compose 2.0+
- OR Python 3.11+, Node.js 18+, PostgreSQL 15+
- Git
- SSL certificates (for HTTPS)
- Domain name (optional but recommended)

### Cloud Provider Accounts (Choose One)
- AWS (EC2, RDS, S3)
- Google Cloud Platform (Compute Engine, Cloud SQL)
- DigitalOcean (Droplets, Managed Databases)
- Azure (Virtual Machines, Database)
- Heroku (simplest option)

### External Services
- SMTP server (Gmail, SendGrid, AWS SES)
- Stripe account (if using payments)
- Sentry account (optional, for error tracking)

---

## Environment Setup

### 1. Server Preparation

#### For Ubuntu/Debian Server:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y
```

### 2. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/gleam-education.git
cd gleam-education
```

### 3. Configure Environment Variables

```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env

# Edit backend environment
nano backend/.env
```

**Critical Settings to Update:**

```env
# Django Core
DJANGO_SECRET_KEY=your-super-secret-key-here-generate-new-one
DEBUG=0
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
USE_SQLITE=0
POSTGRES_DB=edu_production
POSTGRES_USER=edu_admin
POSTGRES_PASSWORD=your-strong-password-here
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Security
SECURE_SSL_REDIRECT=1
SESSION_COOKIE_SECURE=1
CSRF_COOKIE_SECURE=1
SECURE_HSTS_SECONDS=31536000

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=1
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Frontend Environment (.env):**

```bash
nano .env
```

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=Education Management System
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
```

---

## Database Setup

### Option 1: Using Docker (Recommended)

Database is automatically set up with Docker Compose. Skip to [Application Deployment](#application-deployment).

### Option 2: External PostgreSQL

If using a managed database service (AWS RDS, etc.):

```bash
# Update backend/.env with your database credentials
POSTGRES_HOST=your-db-instance.region.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=edu_production
POSTGRES_USER=admin
POSTGRES_PASSWORD=your-password

# Test connection
psql -h your-db-instance.region.rds.amazonaws.com -U admin -d edu_production
```

---

## Application Deployment

### Method 1: Docker Compose (Recommended)

#### 1. Build and Start Services

```bash
cd /opt/gleam-education

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. Run Migrations

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

#### 3. Create Superuser

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

Or seed demo data:
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py seed_demo_data
```

#### 4. Collect Static Files

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

#### 5. Check Services

```bash
# Check running containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Method 2: Manual Deployment

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Start with Gunicorn
gunicorn --bind 0.0.0.0:8000 --workers 4 --threads 2 edu_backend.wsgi:application
```

#### Frontend Setup

```bash
# Build frontend
npm ci
npm run build

# Serve with nginx or another web server
# Copy dist/ folder to /var/www/html or serve with nginx
```

---

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### Update Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /var/www/static/;
    }

    # Media files
    location /media/ {
        alias /var/www/media/;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Post-Deployment

### 1. Verify Application

```bash
# Check backend health
curl https://api.yourdomain.com/api/health/

# Check frontend
curl https://yourdomain.com

# Test login
# Visit: https://yourdomain.com/login
# Use superuser credentials
```

### 2. Configure Stripe Webhook

If using payments:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.yourdomain.com/api/admin/payments/webhook/`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in `.env`
5. Restart backend:
   ```bash
   docker-compose -f docker-compose.prod.yml restart backend
   ```

### 3. Set Up Automated Backups

```bash
# Test backup
docker-compose -f docker-compose.prod.yml exec db_backup sh /backup.sh

# Verify backup
ls -lh backups/

# Schedule backups (already automated in docker-compose.prod.yml)
# Backups run daily at 2 AM server time
```

### 4. Configure Email

Test email sending:

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

>>> from django.core.mail import send_mail
>>> send_mail(
...     'Test Email',
...     'This is a test email from your Education Management System.',
...     'noreply@yourdomain.com',
...     ['your-email@example.com'],
... )
```

---

## Monitoring & Maintenance

### 1. Set Up Monitoring

#### Using Docker Stats
```bash
docker stats
```

#### Using Sentry (Error Tracking)

Add to `backend/.env`:
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 2. Log Management

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Save logs to file
docker-compose -f docker-compose.prod.yml logs > logs-$(date +%Y%m%d).txt
```

### 3. Regular Maintenance

```bash
# Weekly: Check disk space
df -h

# Weekly: Check logs
docker-compose -f docker-compose.prod.yml logs --tail=100

# Weekly: Check backups
ls -lh backups/

# Monthly: Update dependencies
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Monthly: Clean old Docker images
docker system prune -a
```

### 4. Updating the Application

```bash
cd /opt/gleam-education

# Backup database first!
docker-compose -f docker-compose.prod.yml exec db_backup sh /backup.sh

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run new migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect new static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env | grep DJANGO

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U edu_user -d edu_db

# Check connection from backend
docker-compose -f docker-compose.prod.yml exec backend python manage.py dbshell
```

### Static Files Not Loading

```bash
# Collect static files again
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Reduce worker count in docker-compose.prod.yml
# Change: --workers 4 to --workers 2
```

---

## Scaling (Optional)

### Horizontal Scaling

Use Docker Swarm or Kubernetes:

```bash
# Docker Swarm example
docker swarm init
docker stack deploy -c docker-compose.prod.yml edu-system

# Scale backend
docker service scale edu-system_backend=3
```

### Load Balancer

Set up nginx load balancer for multiple backend instances.

---

## Backup & Recovery

### Manual Backup

```bash
docker-compose -f docker-compose.prod.yml exec db_backup sh /backup.sh
```

### Restore from Backup

```bash
# List backups
ls -lh backups/

# Restore specific backup
docker-compose -f docker-compose.prod.yml exec db_backup sh /restore.sh /backups/edu_db_backup_20240115_020000.sql.gz
```

### Backup to Cloud Storage

```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure AWS
aws configure

# Upload backup to S3
aws s3 cp backups/edu_db_backup_20240115_020000.sql.gz s3://your-bucket/backups/
```

---

## Security Checklist

- [ ] Strong database passwords
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH key authentication (disable password auth)
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Django SECRET_KEY is strong and unique
- [ ] DEBUG=0 in production
- [ ] Sentry or error monitoring enabled

---

## Performance Optimization

1. **Enable Redis Caching**
   - Already configured in docker-compose.prod.yml

2. **Database Connection Pooling**
   - Already configured in settings.py

3. **CDN for Static Files**
   - Use AWS CloudFront or Cloudflare

4. **Optimize Images**
   - Use compressed formats
   - Implement lazy loading

5. **Database Indexing**
   - Review slow queries
   - Add indexes as needed

---

## Support & Resources

- **Documentation**: See README.md and PRODUCTION_UPGRADE_SUMMARY.md
- **Logs**: `docker-compose -f docker-compose.prod.yml logs -f`
- **Admin Panel**: `https://yourdomain.com/admin/`
- **Database**: PostgreSQL on port 5432

---

**Last Updated**: January 2025
**Deployment Version**: 2.0.0
