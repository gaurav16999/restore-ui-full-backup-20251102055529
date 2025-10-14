EduManage backend (Django + DRF)
================================

This folder contains a minimal Django + Django REST Framework scaffold intended to provide a JSON API for the frontend.

Quick start (local):

1. Create virtualenv and install dependencies:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate; pip install -r requirements.txt
```

2. Configure `.env` (see `.env.example`) and ensure PostgreSQL is available.

3. Apply migrations and create a superuser:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Endpoints:
- POST `/api/auth/token/` -> obtain JWT tokens (username/password)
- POST `/api/auth/token/refresh/` -> refresh token
- GET `/api/users/profile/` -> authenticated user's profile
- GET `/api/teacher/dashboard/` -> teacher dashboard (placeholder)
- GET `/api/student/dashboard/` -> student dashboard (placeholder)

Docker (optional): create a `docker-compose.yml` with Postgres and the Django app and wire environment variables.
