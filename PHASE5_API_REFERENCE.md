# Phase 5: Quick API Reference

## 🚀 New Academic Endpoints

### Base URL: `http://localhost:8000/api/admin/`

---

## 📝 Exam Management

### Exam Types
```bash
# List all exam types
GET /exam-types/

# Get active exam types only
GET /exam-types/active_types/

# Create exam type
POST /exam-types/
{
  "name": "Mid-term",
  "code": "MT",
  "weightage": 30.0,
  "description": "Mid-term examination",
  "is_active": true
}
```

### Exam Marks
```bash
# List marks
GET /exam-marks/?exam=<exam_id>&student=<student_id>

# Enter mark
POST /exam-marks/
{
  "exam_id": 123,
  "student_id": 456,
  "marks_obtained": 85,
  "is_absent": false,
  "remarks": "Good performance"
}

# Bulk upload from Excel
POST /exam-marks/bulk_upload/
Form-data:
  exam_id: 123
  file: marks.xlsx

# Export marks to Excel
GET /exam-marks/export_marks/?exam=123
```

### Exam Results
```bash
# List results
GET /exam-results-advanced/?exam=<exam_id>&is_passed=true

# Calculate results (auto-rank, grade assignment)
POST /exam-results-advanced/calculate_results/
{
  "exam_id": 123
}
```

### Grade Scales
```bash
# List grading scales
GET /grade-scales/?is_active=true

# Create grade scale
POST /grade-scales/
{
  "name": "Standard Grading",
  "min_percentage": 90,
  "max_percentage": 100,
  "grade": "A+",
  "grade_point": 4.0,
  "is_active": true
}
```

---

## 📚 Homework Management

### Homework/Assignments
```bash
# List homework
GET /homework/?subject=<id>&class_room=<id>&status=published

# Create homework
POST /homework/
{
  "title": "Math Assignment 1",
  "description": "Solve problems 1-20",
  "subject_id": 5,
  "class_room_id": 3,
  "due_date": "2025-02-20",
  "max_marks": 20,
  "status": "draft"
}

# Publish homework
POST /homework/{id}/publish/

# Close submissions
POST /homework/{id}/close/

# Get submission statistics
GET /homework/{id}/submissions_summary/
# Returns: {total_students, submitted_count, graded_count, late_count, pending_count, submission_rate}
```

### Homework Submissions
```bash
# List submissions
GET /homework-submissions/?homework=<id>&student=<id>&status=submitted

# Submit homework (student)
POST /homework-submissions/submit/
Form-data:
  homework_id: 123
  submission_text: "Solutions attached"
  attachment: <file>

# Grade submission (teacher)
POST /homework-submissions/{id}/grade/
{
  "marks_obtained": 18,
  "feedback": "Excellent work!"
}
```

---

## 📖 Lesson Planning

```bash
# List lesson plans
GET /lesson-plans-advanced/?teacher=<id>&subject=<id>&class_room=<id>&start_date=2025-01-01&end_date=2025-01-31&is_completed=false

# Create lesson plan
POST /lesson-plans-advanced/
{
  "title": "Introduction to Algebra",
  "subject_id": 5,
  "class_room_id": 3,
  "teacher_id": 10,
  "academic_year_id": 1,
  "lesson_date": "2025-02-15",
  "duration_minutes": 45,
  "topic": "Linear Equations",
  "sub_topic": "Solving for x",
  "objectives": "Students will solve linear equations",
  "methodology": "Lecture and practice",
  "resources": "Textbook, whiteboard",
  "homework": "Exercise 3.1",
  "notes": "Focus on word problems"
}

# Mark lesson as completed
POST /lesson-plans-advanced/{id}/mark_completed/
```

---

## 📅 Class Timetable/Routine

```bash
# List routines
GET /class-routines/?class_room=<id>&teacher=<id>&day_of_week=0&is_active=true

# Create routine entry
POST /class-routines/
{
  "class_room_id": 3,
  "subject_id": 5,
  "teacher_id": 10,
  "day_of_week": 0,  # 0=Monday, 1=Tuesday, ... 6=Sunday
  "start_time": "09:00",
  "end_time": "10:00",
  "room": "A-101",
  "academic_year_id": 1,
  "is_active": true
}

# Get teacher's weekly schedule
GET /class-routines/teacher_schedule/?teacher_id=10
# Returns: { "Monday": [...], "Tuesday": [...], ... }

# Get class timetable
GET /class-routines/class_schedule/?class_id=3
# Returns: { "Monday": [...], "Tuesday": [...], ... }
```

---

## 👨‍🏫 Staff Attendance

```bash
# List staff attendance
GET /staff-attendance-advanced/?teacher=<id>&start_date=2025-01-01&end_date=2025-01-31&status=present

# Mark single attendance
POST /staff-attendance-advanced/
{
  "teacher_id": 10,
  "date": "2025-01-15",
  "status": "present",  # present, absent, late, half_day, on_leave
  "check_in_time": "08:30",
  "check_out_time": "16:00",
  "remarks": "On time"
}

# Bulk mark attendance
POST /staff-attendance-advanced/mark_attendance/
{
  "date": "2025-01-15",
  "attendance": [
    {
      "teacher_id": 10,
      "status": "present",
      "check_in_time": "08:30",
      "check_out_time": "16:00"
    },
    {
      "teacher_id": 11,
      "status": "late",
      "check_in_time": "09:15",
      "check_out_time": "16:00",
      "remarks": "Traffic"
    }
  ]
}

# Get monthly report
GET /staff-attendance-advanced/monthly_report/?month=2025-01&teacher_id=10
# Returns: {total_days, present_days, absent_days, late_days, half_days, on_leave, attendance_rate}
```

---

## 🔐 Authentication Headers

All requests require authentication. Include JWT token in header:

```bash
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Query Parameter Examples

### Filtering:
```bash
# Multiple filters
GET /exam-marks/?exam=123&is_absent=false

# Date range
GET /lesson-plans-advanced/?start_date=2025-01-01&end_date=2025-01-31

# Status filter
GET /homework/?status=published

# Boolean filters
GET /grade-scales/?is_active=true
```

### Pagination (default DRF pagination):
```bash
GET /exam-marks/?page=2&page_size=50
```

---

## 📤 File Upload Examples

### Homework attachment:
```bash
POST /homework/
Content-Type: multipart/form-data

Form fields:
  title: "Math Assignment"
  description: "Solve problems"
  subject_id: 5
  class_room_id: 3
  due_date: "2025-02-20"
  max_marks: 20
  attachment: <file>
```

### Bulk mark upload:
```bash
POST /exam-marks/bulk_upload/
Content-Type: multipart/form-data

Form fields:
  exam_id: 123
  file: marks.xlsx

Excel format:
| roll_no | marks_obtained | is_absent | remarks |
|---------|----------------|-----------|---------|
| 001     | 85             | FALSE     | Good    |
| 002     | 0              | TRUE      | Absent  |
```

---

## 🎯 Common Workflows

### 1. Complete Exam Workflow:
```bash
# 1. Create exam (existing endpoint)
POST /exams/

# 2. Upload marks
POST /exam-marks/bulk_upload/

# 3. Calculate results
POST /exam-results-advanced/calculate_results/

# 4. Export results
GET /exam-marks/export_marks/?exam=123
```

### 2. Homework Assignment Workflow:
```bash
# 1. Teacher creates homework
POST /homework/ (status: "draft")

# 2. Teacher publishes
POST /homework/{id}/publish/

# 3. Student submits
POST /homework-submissions/submit/

# 4. Teacher grades
POST /homework-submissions/{id}/grade/

# 5. Check statistics
GET /homework/{id}/submissions_summary/
```

### 3. Weekly Timetable Setup:
```bash
# 1. Create multiple routine entries
POST /class-routines/ (for each period)

# 2. Get teacher's schedule
GET /class-routines/teacher_schedule/?teacher_id=10

# 3. Get class timetable
GET /class-routines/class_schedule/?class_id=3
```

---

## 🧪 Testing with cURL

### Create exam type:
```bash
curl -X POST http://localhost:8000/api/admin/exam-types/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Final Exam",
    "code": "FE",
    "weightage": 70.0,
    "is_active": true
  }'
```

### Submit homework:
```bash
curl -X POST http://localhost:8000/api/admin/homework-submissions/submit/ \
  -H "Authorization: Bearer <token>" \
  -F "homework_id=123" \
  -F "submission_text=Completed all problems" \
  -F "attachment=@/path/to/file.pdf"
```

### Get monthly attendance report:
```bash
curl -X GET "http://localhost:8000/api/admin/staff-attendance-advanced/monthly_report/?month=2025-01&teacher_id=10" \
  -H "Authorization: Bearer <token>"
```

---

## 🛠️ Error Responses

### Common errors:
```json
// 400 Bad Request
{
  "error": "exam_id is required"
}

// 404 Not Found
{
  "error": "Exam not found"
}

// 401 Unauthorized
{
  "detail": "Authentication credentials were not provided."
}
```

---

## 📊 Response Examples

### Exam mark with calculated fields:
```json
{
  "id": 123,
  "exam": 456,
  "exam_name": "Mid-term Math",
  "student": 789,
  "student_name": "John Doe",
  "student_roll_no": "001",
  "marks_obtained": 85.00,
  "total_marks": 100.00,
  "passing_marks": 40.00,
  "is_absent": false,
  "percentage": 85.00,
  "is_passed": true,
  "grade": "A",
  "remarks": "Excellent",
  "graded_by": 10,
  "graded_by_name": "Teacher Name",
  "graded_at": "2025-01-15T10:30:00Z"
}
```

### Homework submission statistics:
```json
{
  "total_students": 40,
  "submitted_count": 35,
  "graded_count": 30,
  "late_count": 5,
  "pending_count": 5,
  "submission_rate": 87.50
}
```

### Monthly attendance report:
```json
{
  "month": "2025-01",
  "total_days": 22,
  "present_days": 20,
  "absent_days": 0,
  "late_days": 2,
  "half_days": 0,
  "on_leave": 0,
  "attendance_rate": 90.91
}
```

---

## 🎓 Tips & Best Practices

1. **Always authenticate** - Include JWT token in headers
2. **Use bulk operations** - Prefer bulk_upload over individual creates for efficiency
3. **Filter wisely** - Use query parameters to reduce data transfer
4. **Handle file uploads** - Use multipart/form-data for attachments
5. **Check statistics** - Use summary endpoints before displaying lists
6. **Export for reporting** - Use export endpoints for Excel reports
7. **Validate dates** - Ensure due_date is future date for homework
8. **Check status** - Verify homework status before submission/grading

---

## 📱 Frontend Integration Tips

```typescript
// Example: Submit homework
const submitHomework = async (homeworkId: number, data: FormData) => {
  const response = await authClient.post(
    '/api/admin/homework-submissions/submit/',
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

// Example: Get submission summary
const getSubmissionSummary = async (homeworkId: number) => {
  const response = await authClient.get(
    `/api/admin/homework/${homeworkId}/submissions_summary/`
  );
  return response.data;
};
```

---

*Last updated: January 2025*  
*For detailed documentation, see: PHASE5_COMPLETE_SUMMARY.md*
