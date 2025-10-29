# Email-Based Login Implementation

## Overview
The authentication system has been updated to use **email addresses** instead of usernames for login.

## Changes Made

### 1. Backend Changes

#### User Model (`backend/users/models.py`)
- Added `USERNAME_FIELD = 'email'` to use email for authentication
- Made email field unique and required
- Updated REQUIRED_FIELDS to include 'username' (still stored but not used for login)

#### Database Migration
- Created migration `users/0002_alter_user_email.py`
- Updated all existing users with empty emails to have unique email addresses
- Migration applied successfully ✓

### 2. Frontend Changes

#### Login Page (`src/pages/Login.tsx`)
- Changed input field label from "Username" to "Email"
- Changed input type to "email" for better validation
- Updated placeholder text to "Enter your email"

#### Auth Library (`src/lib/auth.tsx`)
- Updated `login` function parameter from `username` to `email`
- Updated demo mode to check email instead of username
- Updated AuthContextValue interface

### 3. How It Works

Django REST Framework's `SimpleJWT` automatically uses the `USERNAME_FIELD` from your User model. Since we set `USERNAME_FIELD = 'email'`, the JWT token endpoint expects the email field.

**Login Request Format:**
```json
POST /api/auth/token/
{
  "email": "admin@example.com",  // Send email in 'email' field
  "password": "your_password"
}
```

**Important Changes:**
- Created custom `EmailTokenObtainPairSerializer` that uses email field
- Frontend `postToken()` function now sends `email` field (not `username`)
- Backend validates email and returns JWT tokens

## Testing

### Test Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### To test email-based login:

1. Start the backend server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Navigate to the login page and use email to login

### API Test (using curl or Postman):
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

Expected response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## User Creation

When creating new users (students, teachers, etc.), ensure they have unique email addresses:

### Creating a Student:
```python
from users.models import User
from admin_api.models import Student

# Create user with email
user = User.objects.create_user(
    username='2525485',  # Still needed but not for login
    email='student@school.edu',  # THIS is used for login
    password='password123',
    role='student'
)

# Create student record
student = Student.objects.create(
    user=user,
    roll_no='2525485',
    class_name='10A'
)
```

### Creating via API:
```json
POST /api/admin/students/
{
  "email": "newstudent@school.edu",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "class_name": "10A"
}
```

## Important Notes

1. **Email Uniqueness:** All emails must be unique across the system
2. **Username Still Exists:** Usernames are still stored (e.g., student roll numbers) but aren't used for login
3. **Backward Compatibility:** All existing users were updated with unique emails
4. **Password Reset:** Password reset flows should use email (not username)

## Sample Users for Testing

| Email | Role | Password (if set) |
|-------|------|-------------------|
| admin@example.com | Admin | admin123 |
| admin@123@school.edu | Admin | (set if needed) |
| student@school.edu | Student | (set if needed) |
| teacher@school.edu | Teacher | (set if needed) |
| emma@school.edu | Student | (set if needed) |

## Troubleshooting

### "Email already exists" error
- Check if the email is already registered
- Use a different email address

### Migration failed with UNIQUE constraint
- Run the fix script: `python update_empty_emails.py`
- Then run: `python manage.py migrate`

### Frontend shows "Invalid credentials"
- Ensure you're entering the email (not username)
- Check that the backend is running
- Verify the email exists in the database
- Confirm the password is correct

## Scripts

Several helper scripts are available:

1. **setup_admin_email_login.py** - Set admin password to 'admin123'
2. **test_email_login.py** - Verify email authentication is configured
3. **update_empty_emails.py** - Fix users with empty emails
4. **fix_duplicate_emails.py** - Check for duplicate emails

## Summary

✅ **Backend:** Email-based authentication configured  
✅ **Frontend:** Login form updated to use email  
✅ **Database:** Migration applied, all users have unique emails  
✅ **Testing:** Admin account ready with email: admin@example.com  

Users can now login using their email addresses instead of usernames!
