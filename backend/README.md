# EduManage Backend - Django REST API

This is the backend API for the EduManage education management system, built with Django and Django REST Framework.

## 🏗️ Architecture

- **Framework**: Django 5.2.7
- **API**: Django REST Framework
- **Authentication**: JWT tokens with SimpleJWT
- **Database**: SQLite (development) / PostgreSQL (production)
- **CORS**: Configured for frontend at localhost:8080

## 📝 Project Variables & Configuration

### Environment Variables

#### Required Environment Variables (.env)
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DJANGO_SECRET_KEY` | String | `dev-secret` | Django secret key for cryptographic operations |
| `DEBUG` | Boolean | `1` | Enable/disable Django debug mode (1=True, 0=False) |
| `ALLOWED_HOSTS` | String | `*` | Comma-separated list of allowed hosts |
| `USE_SQLITE` | Boolean | `1` | Use SQLite database (1=True, 0=False) |

#### PostgreSQL Configuration (when USE_SQLITE=0)
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `POSTGRES_DB` | String | `edu_db` | PostgreSQL database name |
| `POSTGRES_USER` | String | `edu_user` | PostgreSQL username |
| `POSTGRES_PASSWORD` | String | `edu_pass` | PostgreSQL password |
| `POSTGRES_HOST` | String | `localhost` | PostgreSQL host address |
| `POSTGRES_PORT` | String | `5432` | PostgreSQL port number |

#### JWT Token Configuration
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ACCESS_TOKEN_MINUTES` | Integer | `60` | Access token lifetime in minutes |
| `REFRESH_TOKEN_DAYS` | Integer | `7` | Refresh token lifetime in days |

### Frontend Configuration Variables

#### Vite Environment Variables
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_BASE` | String | `http://localhost:8000` | Backend API base URL |

#### Frontend Server Configuration
| Variable | Type | Value | Description |
|----------|------|-------|-------------|
| `SERVER_HOST` | String | `::` | Vite development server host |
| `SERVER_PORT` | Number | `8080` | Vite development server port |

### Database Model Variables

#### User Model Variables
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `username` | CharField | max_length=150, unique | User's login username |
| `email` | EmailField | unique | User's email address |
| `first_name` | CharField | max_length=150 | User's first name |
| `last_name` | CharField | max_length=150 | User's last name |
| `role` | CharField | choices=['admin', 'teacher', 'student'] | User role in the system |
| `is_active` | BooleanField | default=True | User account status |
| `date_joined` | DateTimeField | auto_now_add | Account creation timestamp |

#### Student Model Variables
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `roll_no` | CharField | max_length=20, unique | Student's roll number |
| `class_name` | CharField | max_length=50 | Student's class/grade |
| `phone` | CharField | max_length=20 | Student's phone number |
| `attendance_percentage` | DecimalField | max_digits=5, decimal_places=2 | Student's attendance percentage |
| `is_active` | BooleanField | default=True | Student enrollment status |
| `enrollment_date` | DateField | auto_now_add | Date of enrollment |

#### Teacher Model Variables
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `subject` | CharField | max_length=100 | Teacher's subject specialization |
| `phone` | CharField | max_length=20 | Teacher's phone number |
| `classes_count` | IntegerField | default=0 | Number of classes assigned |
| `students_count` | IntegerField | default=0 | Number of students taught |
| `is_active` | BooleanField | default=True | Teacher employment status |
| `join_date` | DateField | auto_now_add | Date of joining |

#### Class Model Variables
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `name` | CharField | max_length=50 | Class name/identifier |
| `students_count` | IntegerField | default=0 | Number of students in class |
| `subjects_count` | IntegerField | default=0 | Number of subjects in class |
| `room` | CharField | max_length=50 | Classroom location |
| `schedule` | CharField | max_length=100 | General schedule text (legacy) |
| `date` | DateField | null=True, blank=True | Specific class date |
| `start_time` | TimeField | null=True, blank=True | Class start time |
| `end_time` | TimeField | null=True, blank=True | Class end time |
| `day_of_week` | CharField | choices=['monday', 'tuesday', ...] | Day of the week |
| `is_active` | BooleanField | default=True | Class status |

#### Room Model Variables
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `room_number` | CharField | max_length=20, unique | Room number/identifier |
| `name` | CharField | max_length=100 | Room name/description |
| `room_type` | CharField | choices=['classroom', 'laboratory', ...] | Type of room |
| `capacity` | IntegerField | default=30 | Room seating capacity |
| `floor` | CharField | max_length=10 | Floor location |
| `building` | CharField | max_length=50 | Building name |
| `has_projector` | BooleanField | default=False | Projector availability |
| `has_computer` | BooleanField | default=False | Computer availability |
| `has_whiteboard` | BooleanField | default=True | Whiteboard availability |
| `is_active` | BooleanField | default=True | Room availability status |

#### Grade Model Variables
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `grade_type` | CharField | choices=['Assignment', 'Quiz', 'Test', ...] | Type of grade/assessment |
| `score` | DecimalField | max_digits=6, decimal_places=2 | Student's score |
| `max_score` | DecimalField | max_digits=6, decimal_places=2, default=100 | Maximum possible score |
| `notes` | TextField | blank=True, null=True | Additional notes |
| `date_recorded` | DateField | - | Date when grade was recorded |
| `percentage` | Property | calculated | Score percentage (score/max_score * 100) |
| `letter_grade` | Property | calculated | Letter grade (A, B, C, D, F) |

#### Attendance Model Variables
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `status` | CharField | choices=['present', 'absent'] | Attendance status |
| `date` | DateField | - | Attendance date |
| `created_at` | DateTimeField | auto_now_add | Record creation timestamp |
| `updated_at` | DateTimeField | auto_now | Record update timestamp |

### API Configuration Variables

#### Django REST Framework Settings
| Variable | Type | Value | Description |
|----------|------|-------|-------------|
| `DEFAULT_AUTHENTICATION_CLASSES` | Tuple | `JWTAuthentication` | Authentication method |
| `ACCESS_TOKEN_LIFETIME` | timedelta | 60 minutes | JWT access token lifetime |
| `REFRESH_TOKEN_LIFETIME` | timedelta | 7 days | JWT refresh token lifetime |

#### CORS Configuration
| Variable | Type | Value | Description |
|----------|------|-------|-------------|
| `CORS_ALLOW_ALL_ORIGINS` | Boolean | `True` | Allow all origins (development only) |
| `CORS_ALLOWED_ORIGINS` | List | - | Specific allowed origins (production) |

### Application Variables

#### Django Apps Configuration
| App Name | Purpose | Description |
|----------|---------|-------------|
| `users` | User Management | Custom user model and authentication |
| `admin_api` | Admin Operations | Student, teacher, class, grade management |
| `teacher` | Teacher Portal | Teacher-specific views and operations |
| `student` | Student Portal | Student-specific views and operations |

#### Middleware Configuration
| Middleware | Purpose | Description |
|------------|---------|-------------|
| `CorsMiddleware` | CORS Handling | Enable cross-origin requests |
| `SecurityMiddleware` | Security | Django security features |
| `SessionMiddleware` | Sessions | Session management |
| `AuthenticationMiddleware` | Authentication | User authentication |

### Constant Values & Choices

#### User Role Choices
```python
ROLE_CHOICES = [
    ('admin', 'Administrator'),
    ('teacher', 'Teacher'), 
    ('student', 'Student'),
]
```

#### Room Type Choices
```python
ROOM_TYPES = [
    ('classroom', 'Classroom'),
    ('laboratory', 'Laboratory'),
    ('library', 'Library'),
    ('auditorium', 'Auditorium'),
    ('gymnasium', 'Gymnasium'),
    ('office', 'Office'),
    ('other', 'Other'),
]
```

#### Grade Type Choices
```python
GRADE_TYPES = [
    ('Assignment', 'Assignment'),
    ('Quiz', 'Quiz'),
    ('Test', 'Test'),
    ('Project', 'Project'),
    ('Homework', 'Homework'),
    ('Midterm', 'Midterm'),
    ('Final', 'Final'),
    ('Participation', 'Participation'),
]
```

#### Day of Week Choices
```python
DAY_CHOICES = [
    ('monday', 'Monday'),
    ('tuesday', 'Tuesday'),
    ('wednesday', 'Wednesday'), 
    ('thursday', 'Thursday'),
    ('friday', 'Friday'),
    ('saturday', 'Saturday'),
    ('sunday', 'Sunday'),
]
```

#### Attendance Status Choices
```python
ATTENDANCE_CHOICES = [
    ('present', 'Present'),
    ('absent', 'Absent'),
]
```

### Frontend State Variables

#### Authentication Variables
| Variable | Type | Storage | Description |
|----------|------|---------|-------------|
| `accessToken` | String | localStorage | JWT access token |
| `refreshToken` | String | localStorage | JWT refresh token |
| `userRole` | String | State | Current user's role |
| `isAuthenticated` | Boolean | State | Authentication status |

#### API Communication Variables
| Variable | Type | Value | Description |
|----------|------|-------|-------------|
| `API_BASE` | String | `http://localhost:8000` | Backend API base URL |
| `REQUEST_TIMEOUT` | Number | `10000` | API request timeout (ms) |

### Performance & Optimization Variables

#### Database Configuration
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DEFAULT_AUTO_FIELD` | String | `BigAutoField` | Default primary key field type |
| `TIME_ZONE` | String | `UTC` | Database timezone |
| `USE_I18N` | Boolean | `True` | Internationalization support |
| `USE_TZ` | Boolean | `True` | Timezone support |

#### Static Files Configuration
| Variable | Type | Value | Description |
|----------|------|-------|-------------|
| `STATIC_URL` | String | `/static/` | Static files URL prefix |
| `LANGUAGE_CODE` | String | `en-us` | Default language code |

## 🚀 Quick Setup

### 1. Environment Configuration
Create a `.env` file in the backend directory with the following variables:
```env
# Required Variables
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
USE_SQLITE=1

# PostgreSQL (when USE_SQLITE=0)
POSTGRES_DB=edu_db
POSTGRES_USER=edu_user
POSTGRES_PASSWORD=edu_pass
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT Token Configuration
ACCESS_TOKEN_MINUTES=60
REFRESH_TOKEN_DAYS=7
```

### 2. Create Virtual Environment
```powershell
python -m venv .venv
.\.venv\Scripts\Activate  # Windows
# source .venv/bin/activate  # macOS/Linux
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Database Setup
```powershell
python manage.py migrate
python manage.py createsuperuser
```

### 5. Load Sample Data (Optional)
```powershell
python create_sample_data.py
python create_subjects.py
```

### 6. Run Development Server
```powershell
python manage.py runserver
```

The API will be available at http://127.0.0.1:8000/

## 🔧 Frontend Configuration

### Environment Variables for Frontend
Create environment variables for Vite (if needed):
```env
VITE_API_BASE=http://localhost:8000
```

### Development Server Configuration
- **Host**: `::` (all interfaces)
- **Port**: `8080`
- **Frontend URL**: http://localhost:8080/
- **API Base**: http://localhost:8000/

## 📋 API Endpoints

### Authentication
- `POST /api/auth/token/` - Login (get access & refresh tokens)
- `POST /api/auth/token/refresh/` - Refresh access token

### User Management
- `GET /api/users/profile/` - Get authenticated user profile

### Admin - Students
- `GET /api/admin/students/` - List all students
- `GET /api/admin/students/stats/` - Student statistics
- `POST /api/admin/students/create/` - Create new student
- `GET /api/admin/students/{id}/` - Get student details
- `PUT /api/admin/students/{id}/` - Update student
- `PATCH /api/admin/students/{id}/` - Partial update (including status toggle)
- `DELETE /api/admin/students/{id}/` - Delete student

### Admin - Teachers
- `GET /api/admin/teachers/` - List all teachers
- `GET /api/admin/teachers/stats/` - Teacher statistics
- `POST /api/admin/teachers/create/` - Create new teacher
- `GET /api/admin/teachers/{id}/` - Get teacher details
- `PUT /api/admin/teachers/{id}/` - Update teacher
- `PATCH /api/admin/teachers/{id}/` - Partial update (including status toggle)
- `DELETE /api/admin/teachers/{id}/` - Delete teacher

### Admin - Classes & Subjects
- `GET /api/admin/classes/` - List all classes
- `GET /api/admin/classes/stats/` - Class statistics
- `GET /api/admin/subjects/` - List all subjects
- `POST /api/admin/classes/create/` - Create new class
- `POST /api/admin/subjects/create/` - Create new subject
- `PUT /api/admin/classes/{id}/` - Update class
- `PUT /api/admin/subjects/{id}/` - Update subject
- `DELETE /api/admin/classes/{id}/` - Delete class
- `DELETE /api/admin/subjects/{id}/` - Delete subject

### Admin - Rooms
- `GET /api/admin/rooms/` - List all rooms
- `POST /api/admin/rooms/create/` - Create new room
- `GET /api/admin/rooms/{id}/` - Get room details
- `PUT /api/admin/rooms/{id}/` - Update room
- `DELETE /api/admin/rooms/{id}/` - Delete room

### Admin - Grades
- `GET /api/admin/grades/` - List all grades
- `GET /api/admin/grades/stats/` - Grade statistics

### Admin - Attendance
- `GET /api/admin/attendance/` - List all attendance records
- `POST /api/admin/attendance/create/` - Create attendance record
- `PUT /api/admin/attendance/{id}/` - Update attendance record
- `DELETE /api/admin/attendance/{id}/` - Delete attendance record

### Admin - Dashboard
- `GET /api/admin/dashboard/stats/` - Dashboard statistics
- `GET /api/admin/dashboard/activities/` - Recent activities
- `GET /api/admin/dashboard/events/` - Upcoming events

### Student Portal
- `GET /api/student/dashboard/` - Student dashboard data

### Teacher Portal
- `GET /api/teacher/dashboard/` - Teacher dashboard data

## 🔧 Advanced Features

### Scheduling Conflict Detection
The system includes sophisticated scheduling conflict detection for classes:

#### Time Overlap Detection
```python
# Conflict detection algorithm checks:
# 1. Same room and same date
# 2. Overlapping time ranges (start_time, end_time)
# 3. Visual indicators (red/green) in admin interface
```

#### Frontend Integration
- **Real-time validation**: Conflicts detected during class creation
- **Visual warnings**: Red indicators for conflicts, green for clear schedules
- **User-friendly alerts**: Detailed conflict information displayed

#### Room Management Integration
- **Room dropdown**: Select from actual room database
- **Capacity awareness**: Room capacity displayed during selection
- **Facility information**: Projector, computer, whiteboard availability

### Status Toggle System
Enhanced PATCH endpoints for quick status changes:

```bash
# Toggle student/teacher active status
PATCH /api/admin/students/1/
Content-Type: application/json
Authorization: Bearer <token>

{"toggle_status": true}
```

### Dynamic Field Mapping
API returns user-friendly field names:
- `name` → User's full name
- `status` → "Active"/"Inactive" (from is_active boolean)
- `user_username` → User's username

### Comprehensive Room System
- **Room types**: 7 different room categories
- **Facility tracking**: Multiple boolean flags for equipment
- **Location management**: Floor and building organization
- **Capacity planning**: Seating capacity management

### Grade Calculation System
- **Automatic percentage**: Calculated from score/max_score
- **Letter grade mapping**: A (90+), B (80+), C (70+), D (60+), F (<60)
- **Multiple assessment types**: 8 different grade categories
- **Comprehensive tracking**: Notes and date recording

## 🗄️ Database Models

### Core Models
- **User**: Django's built-in user model (extended with role field)
- **Student**: Student profile linked to User
- **Teacher**: Teacher profile linked to User
- **Class**: Academic class/grade information with scheduling
- **Subject**: Academic subjects
- **Room**: Physical classroom/facility management
- **Grade**: Student grades for subjects
- **Attendance**: Student attendance records
- **Activity**: System activity tracking
- **Event**: Campus events and announcements

### Model Relationships
- User ↔ Student/Teacher (One-to-One)
- Student ↔ Grade (One-to-Many)
- Student ↔ Attendance (One-to-Many)
- Class ↔ Student (One-to-Many)
- Class ↔ Attendance (One-to-Many)
- Class ↔ Teacher (Many-to-One)
- Subject ↔ Grade (One-to-Many)
- Room (referenced by Class.room field)

### Key Model Features

#### User Model Extensions
- **Role-based access**: admin, teacher, student roles
- **Profile integration**: Linked to specific role profiles
- **Authentication**: JWT token-based authentication

#### Advanced Scheduling (Class Model)
- **Time-based scheduling**: date, start_time, end_time fields
- **Day-of-week scheduling**: Recurring weekly schedules
- **Conflict detection**: Prevents double-booking of rooms
- **Legacy support**: Maintains backward compatibility

#### Room Management System
- **Room types**: classroom, laboratory, library, etc.
- **Capacity management**: Student seating capacity
- **Facility tracking**: projector, computer, whiteboard availability
- **Location details**: floor, building information

#### Grade Tracking System
- **Multiple assessment types**: Assignment, Quiz, Test, Project, etc.
- **Percentage calculation**: Automatic score percentage
- **Letter grades**: A-F grading system
- **Comprehensive notes**: Additional assessment information

#### Attendance Management
- **Daily tracking**: Present/Absent status per day
- **Class-specific**: Attendance per class section
- **Unique constraints**: Prevents duplicate entries
- **Percentage calculation**: Automatic attendance percentage

## 🛠️ Development Commands

### Backend Development
```powershell
# Start Django development server
python manage.py runserver

# Start with specific host/port
python manage.py runserver 0.0.0.0:8000

# Database operations
python manage.py makemigrations        # Create new migrations
python manage.py migrate              # Apply migrations
python manage.py showmigrations       # Show migration status

# User management
python manage.py createsuperuser      # Create admin user
python manage.py changepassword <username>  # Change user password

# Data management
python create_sample_data.py          # Create sample students/teachers
python create_subjects.py             # Create sample subjects
python create_default_superuser.py    # Create default admin user
python set_admin_password.py          # Set admin password

# Development tools
python manage.py shell                # Django shell
python manage.py dbshell              # Database shell
python manage.py collectstatic        # Collect static files
python manage.py check                # Check for issues
```

### Frontend Development
```powershell
# Start Vite development server
npm run dev                           # Start on port 8080
npm run build                         # Build for production
npm run build:dev                     # Build for development
npm run preview                       # Preview production build
npm run lint                          # Run ESLint

# Dependencies
npm install                           # Install dependencies
npm update                            # Update dependencies
```

### Testing Commands
```powershell
# Backend testing
python manage.py test                 # Run all tests
python manage.py test admin_api       # Test specific app
python manage.py test admin_api.tests.test_models  # Test specific module

# API testing scripts
python test_api.py                    # Basic API connectivity
python test_grades_api.py             # Grade system testing
python simple_test.py                 # Simple connection test
run_test.bat                          # Windows batch test runner

# Coverage testing (if installed)
coverage run --source='.' manage.py test
coverage report                       # Show coverage report
coverage html                         # Generate HTML coverage report
```

### Database Management
```powershell
# Backup database
python manage.py dumpdata > backup.json

# Restore from backup
python manage.py loaddata backup.json

# Reset database (SQLite)
del db.sqlite3
python manage.py migrate

# Database inspection
python manage.py inspectdb            # Generate models from existing DB
python manage.py sqlmigrate app_name migration_name  # Show SQL for migration
```

## 🧪 Testing

### Run All Tests
```powershell
python manage.py test
```

### Test Specific App
```powershell
python manage.py test admin_api
```

### Test API Endpoints
Use the included test files:
- `test_api.py` - Basic API testing
- `test_grades_api.py` - Grade-specific testing
- `simple_test.py` - Simple connectivity test

## 📦 Dependencies

### Backend Dependencies (requirements.txt)
```python
# Core Framework
Django>=5.2.7                        # Web framework
djangorestframework>=3.14             # REST API framework

# Authentication & Security
djangorestframework-simplejwt>=5.2    # JWT authentication
django-cors-headers>=4.0              # CORS handling

# Environment & Configuration
python-dotenv>=1.0                    # Environment variable management

# Database (Optional)
psycopg2-binary>=2.9                  # PostgreSQL adapter (production)
```

### Frontend Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^18.x",                 // React framework
    "react-dom": "^18.x",             // React DOM renderer
    "typescript": "^5.x",             // TypeScript support
    "@vitejs/plugin-react-swc": "^3.x", // Vite React plugin
    
    // UI Components
    "@radix-ui/react-*": "^1.x",      // Radix UI primitives
    "@fortawesome/react-fontawesome": "^3.x", // FontAwesome icons
    "tailwindcss": "^3.x",            // Tailwind CSS
    
    // State Management & API
    "@tanstack/react-query": "^5.x",  // Data fetching
    "react-router-dom": "^6.x"        // Routing
  },
  "devDependencies": {
    "vite": "^5.x",                   // Build tool
    "eslint": "^8.x",                 // Linting
    "@types/react": "^18.x"           // TypeScript types
  }
}
```

## 🔐 Security

### Authentication System
- **JWT-based authentication** with access and refresh tokens
- **Token expiration** and automatic refresh
- **Role-based access control** (Admin, Teacher, Student)
- **Protected API endpoints** with authentication middleware

### Token Configuration
```python
# JWT Settings (configurable via environment variables)
ACCESS_TOKEN_LIFETIME = timedelta(minutes=60)  # Default: 1 hour
REFRESH_TOKEN_LIFETIME = timedelta(days=7)     # Default: 7 days
```

### CORS Configuration
- **Development**: Allow all origins (`CORS_ALLOW_ALL_ORIGINS = True`)
- **Production**: Restrict to specific domains
- **Customizable** via environment variables

### Environment Variables Security
- **Sensitive data** stored in environment variables
- **Secret key** management for Django cryptographic operations
- **Database credentials** protection
- **Debug mode** control for production safety

### Password Security
- **Django's built-in** password validation and hashing
- **Secure password storage** using PBKDF2 algorithm
- **Password strength** requirements (customizable)

## 🚀 Production Deployment

### Environment Configuration
```env
# Production Settings
DEBUG=0
DJANGO_SECRET_KEY=your-super-secure-production-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (PostgreSQL recommended)
USE_SQLITE=0
POSTGRES_DB=edu_production
POSTGRES_USER=edu_prod_user
POSTGRES_PASSWORD=secure-database-password
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432

# Security
CORS_ALLOW_ALL_ORIGINS=0
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT Configuration (Production)
ACCESS_TOKEN_MINUTES=30               # Shorter for security
REFRESH_TOKEN_DAYS=1                  # Shorter refresh cycle
```

### Database Migration (SQLite to PostgreSQL)
```powershell
# 1. Backup existing data
python manage.py dumpdata > data_backup.json

# 2. Update environment variables for PostgreSQL
# Edit .env file with PostgreSQL settings

# 3. Create new database
python manage.py migrate

# 4. Load backed up data
python manage.py loaddata data_backup.json
```

### Production Security Checklist
- [ ] `DEBUG = False` in production
- [ ] Strong `DJANGO_SECRET_KEY` (50+ characters)
- [ ] Restrict `ALLOWED_HOSTS` to your domain
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure proper CORS origins
- [ ] Use HTTPS for all connections
- [ ] Set up proper logging
- [ ] Configure static files serving
- [ ] Set up regular database backups
- [ ] Configure monitoring and alerting

### Static Files & Media
```python
# Production settings for static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Collect static files
python manage.py collectstatic --noinput
```

### WSGI/ASGI Deployment
The application includes `wsgi.py` for deployment with:
- **Gunicorn**: `gunicorn edu_backend.wsgi:application`
- **uWSGI**: Compatible with uWSGI configuration
- **Apache mod_wsgi**: Standard Django deployment
- **Nginx**: Reverse proxy configuration supported

### Docker Deployment (Optional)
```dockerfile
# Example Dockerfile structure
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "edu_backend.wsgi:application"]
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [SimpleJWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)

---

**Backend API for EduManage Education Management System**
