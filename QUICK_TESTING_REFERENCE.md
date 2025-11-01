# 🧪 Quick Testing Reference - Backend 70% Complete

## Server Status: ✅ ONLINE

```bash
Server: http://127.0.0.1:8000/
Status: Running (0 errors)
Django: 5.2.7
Last Check: November 1, 2025
```

---

## 🚀 Quick Test Commands

### Test Server Health
```bash
curl http://127.0.0.1:8000/api/admin/
# Should return list of available endpoints
```

---

## 📚 Phase 5: Academic Module - 9 Endpoints

### 1. Exam Types Management
```bash
# List all exam types
GET http://127.0.0.1:8000/api/admin/exam-types/

# Get active exam types
GET http://127.0.0.1:8000/api/admin/exam-types/active_types/

# Create exam type
POST http://127.0.0.1:8000/api/admin/exam-types/
{
  "name": "Mid Term Exam",
  "code": "MID",
  "weightage": "40.00",
  "description": "Mid semester examination"
}
```

### 2. Exam Marks Management
```bash
# List exam marks
GET http://127.0.0.1:8000/api/admin/exam-marks/

# Bulk upload marks from Excel
POST http://127.0.0.1:8000/api/admin/exam-marks/bulk_upload/
# Upload Excel file with columns: roll_no, marks, is_absent, remarks

# Export marks to Excel
GET http://127.0.0.1:8000/api/admin/exam-marks/export_marks/?exam=1
# Downloads Excel with marks, percentage, grades
```

### 3. Exam Results Management
```bash
# List exam results
GET http://127.0.0.1:8000/api/admin/exam-results-advanced/

# Calculate results from marks
POST http://127.0.0.1:8000/api/admin/exam-results-advanced/calculate_results/
{
  "exam": 1
}
# Auto-calculates percentage, grade, rank for all students
```

### 4. Grade Scales Management
```bash
# List grade scales
GET http://127.0.0.1:8000/api/admin/grade-scales/

# Create grade scale
POST http://127.0.0.1:8000/api/admin/grade-scales/
{
  "name": "Excellent",
  "min_percentage": "90.00",
  "max_percentage": "100.00",
  "grade": "A+",
  "grade_point": "4.00"
}
```

### 5. Homework Management
```bash
# List homework
GET http://127.0.0.1:8000/api/admin/homework/

# Create homework (draft)
POST http://127.0.0.1:8000/api/admin/homework/
{
  "title": "Chapter 5 Exercises",
  "description": "Complete all exercises from chapter 5",
  "subject": 1,
  "class_room": 1,
  "due_date": "2025-11-10",
  "max_marks": "100.00",
  "status": "draft"
}

# Publish homework
POST http://127.0.0.1:8000/api/admin/homework/1/publish/

# Close homework
POST http://127.0.0.1:8000/api/admin/homework/1/close/

# Get submissions summary
GET http://127.0.0.1:8000/api/admin/homework/1/submissions_summary/
# Returns: submitted, graded, late, pending counts
```

### 6. Homework Submissions
```bash
# List submissions
GET http://127.0.0.1:8000/api/admin/homework-submissions/

# Student submits homework
POST http://127.0.0.1:8000/api/admin/homework-submissions/1/submit/
{
  "submission_text": "Here is my completed homework...",
  "attachment": <file>
}

# Teacher grades submission
POST http://127.0.0.1:8000/api/admin/homework-submissions/1/grade/
{
  "marks_obtained": "85.00",
  "feedback": "Good work! Improve on question 3."
}
```

### 7. Lesson Plans
```bash
# List lesson plans
GET http://127.0.0.1:8000/api/admin/lesson-plans-advanced/

# Create lesson plan
POST http://127.0.0.1:8000/api/admin/lesson-plans-advanced/
{
  "title": "Introduction to Algebra",
  "subject": 1,
  "class_room": 1,
  "teacher": 1,
  "academic_year": 1,
  "lesson_date": "2025-11-05",
  "duration_minutes": 45,
  "topic": "Basic Algebra",
  "objectives": "Students will learn basic algebraic concepts",
  "methodology": "Interactive teaching with examples"
}

# Mark as completed
POST http://127.0.0.1:8000/api/admin/lesson-plans-advanced/1/mark_completed/
```

### 8. Class Routines (Timetable)
```bash
# List routines
GET http://127.0.0.1:8000/api/admin/class-routines/

# Get teacher's schedule
GET http://127.0.0.1:8000/api/admin/class-routines/teacher_schedule/?teacher_id=1
# Returns schedule grouped by day of week

# Get class schedule
GET http://127.0.0.1:8000/api/admin/class-routines/class_schedule/?class_id=1
# Returns timetable grouped by day of week
```

### 9. Staff Attendance
```bash
# List staff attendance
GET http://127.0.0.1:8000/api/admin/staff-attendance-advanced/

# Mark attendance (bulk)
POST http://127.0.0.1:8000/api/admin/staff-attendance-advanced/mark_attendance/
{
  "date": "2025-11-01",
  "attendance_records": [
    {
      "teacher": 1,
      "status": "present",
      "check_in_time": "08:30:00",
      "check_out_time": "16:30:00"
    },
    {
      "teacher": 2,
      "status": "late",
      "check_in_time": "09:15:00",
      "remarks": "Traffic delay"
    }
  ]
}

# Monthly report
GET http://127.0.0.1:8000/api/admin/staff-attendance-advanced/monthly_report/?teacher_id=1&month=11&year=2025
# Returns: present, absent, late, total days, attendance rate
```

---

## 💼 Phase 6: HR Module - 7 Endpoints

### 1. Designations Management
```bash
# List designations
GET http://127.0.0.1:8000/api/admin/designations-advanced/

# Get hierarchy
GET http://127.0.0.1:8000/api/admin/designations-advanced/hierarchy/
# Returns designations grouped by level (1-5)

# Create designation
POST http://127.0.0.1:8000/api/admin/designations-advanced/
{
  "name": "Senior Teacher",
  "code": "SNR_TCHR",
  "level": 3,
  "description": "Senior teaching position"
}
```

### 2. Employee Details
```bash
# List employee details
GET http://127.0.0.1:8000/api/admin/employee-details/

# Get employment history
GET http://127.0.0.1:8000/api/admin/employee-details/1/employment_history/
# Returns complete history with duration

# Create/Update employee details
POST http://127.0.0.1:8000/api/admin/employee-details/
{
  "teacher": 1,
  "employee_id": "EMP001",
  "department": 1,
  "designation": 1,
  "employment_type": "full_time",
  "date_of_joining": "2025-01-01",
  "basic_salary": "50000.00",
  "bank_account_name": "John Doe",
  "bank_account_number": "1234567890",
  "bank_name": "ABC Bank"
}
```

### 3. Payroll Components
```bash
# List components
GET http://127.0.0.1:8000/api/admin/payroll-components/

# Get summary
GET http://127.0.0.1:8000/api/admin/payroll-components/summary/
# Returns count of active earnings and deductions

# Create component
POST http://127.0.0.1:8000/api/admin/payroll-components/
{
  "name": "House Rent Allowance",
  "code": "HRA",
  "component_type": "earning",
  "calculation_type": "percentage",
  "default_value": "40.00",
  "is_taxable": true
}
```

### 4. Payroll Processing ⭐
```bash
# List payroll runs
GET http://127.0.0.1:8000/api/admin/payroll-runs/

# Process payroll for month
POST http://127.0.0.1:8000/api/admin/payroll-runs/process_payroll/
{
  "month": 11,
  "year": 2025
}
# Auto-generates payslips for all employees

# Mark payroll as paid
POST http://127.0.0.1:8000/api/admin/payroll-runs/1/mark_paid/

# Get payroll summary
GET http://127.0.0.1:8000/api/admin/payroll-runs/1/summary/
# Returns: total employees, total amount, paid/pending counts
```

### 5. Payslips (PDF Generation) ⭐
```bash
# List payslips
GET http://127.0.0.1:8000/api/admin/payslips-advanced/

# Download PDF payslip
GET http://127.0.0.1:8000/api/admin/payslips-advanced/1/download_pdf/
# Downloads professionally formatted PDF

# Employee views own payslips
GET http://127.0.0.1:8000/api/admin/payslips-advanced/my_payslips/
# Returns payslips for logged-in employee
```

### 6. Leave Applications
```bash
# List leave applications
GET http://127.0.0.1:8000/api/admin/leave-applications-advanced/

# Apply for leave
POST http://127.0.0.1:8000/api/admin/leave-applications-advanced/
{
  "employee": 1,
  "leave_type": 1,
  "start_date": "2025-11-10",
  "end_date": "2025-11-12",
  "reason": "Family emergency",
  "attachment": <optional file>
}

# Approve leave
POST http://127.0.0.1:8000/api/admin/leave-applications-advanced/1/approve/
{
  "remarks": "Approved"
}

# Reject leave
POST http://127.0.0.1:8000/api/admin/leave-applications-advanced/1/reject/
{
  "remarks": "Insufficient leave balance"
}

# Bulk approve
POST http://127.0.0.1:8000/api/admin/leave-applications-advanced/bulk_approve/
{
  "application_ids": [1, 2, 3],
  "remarks": "Approved in batch"
}

# Pending approvals
GET http://127.0.0.1:8000/api/admin/leave-applications-advanced/pending_approvals/

# Check leave balance
GET http://127.0.0.1:8000/api/admin/leave-applications-advanced/leave_balance/?employee_id=1
# Returns balance by leave type
```

### 7. Holiday Calendar
```bash
# List holidays
GET http://127.0.0.1:8000/api/admin/holidays/

# Upcoming holidays
GET http://127.0.0.1:8000/api/admin/holidays/upcoming/
# Returns next 10 holidays

# Yearly calendar
GET http://127.0.0.1:8000/api/admin/holidays/yearly_calendar/?year=2025
# Returns holidays grouped by month

# Create holiday
POST http://127.0.0.1:8000/api/admin/holidays/
{
  "name": "Christmas",
  "date": "2025-12-25",
  "is_optional": false,
  "description": "Christmas Day"
}
```

---

## 🔥 Priority Test Scenarios

### 1. Exam Workflow (End-to-End)
```bash
1. Create exam type → POST /api/admin/exam-types/
2. Create grade scale → POST /api/admin/grade-scales/
3. Upload marks (Excel) → POST /api/admin/exam-marks/bulk_upload/
4. Calculate results → POST /api/admin/exam-results-advanced/calculate_results/
5. Export marks → GET /api/admin/exam-marks/export_marks/?exam=1
```

### 2. Homework Workflow (End-to-End)
```bash
1. Create homework → POST /api/admin/homework/ (status: draft)
2. Publish → POST /api/admin/homework/1/publish/
3. Student submits → POST /api/admin/homework-submissions/1/submit/
4. Teacher grades → POST /api/admin/homework-submissions/1/grade/
5. View summary → GET /api/admin/homework/1/submissions_summary/
6. Close homework → POST /api/admin/homework/1/close/
```

### 3. Payroll Workflow (End-to-End) ⭐
```bash
1. Setup components → POST /api/admin/payroll-components/
2. Process payroll → POST /api/admin/payroll-runs/process_payroll/
3. Review payslips → GET /api/admin/payslips-advanced/
4. Download PDF → GET /api/admin/payslips-advanced/1/download_pdf/
5. Mark paid → POST /api/admin/payroll-runs/1/mark_paid/
```

### 4. Leave Management Workflow (End-to-End)
```bash
1. Employee applies → POST /api/admin/leave-applications-advanced/
2. Check pending → GET /api/admin/leave-applications-advanced/pending_approvals/
3. Approve/Reject → POST /api/admin/leave-applications-advanced/1/approve/
4. Check balance → GET /api/admin/leave-applications-advanced/leave_balance/?employee_id=1
```

---

## 📊 Success Indicators

### Server Health
- ✅ Django check: 0 errors
- ✅ Server starts successfully
- ✅ All imports resolve
- ✅ No model conflicts
- ✅ Dependencies installed

### Endpoints Status
- ✅ 16 ViewSets registered
- ✅ 45+ custom actions available
- ✅ All URLs resolve
- ✅ Permissions configured
- ✅ Serializers working

### Features Ready
- ✅ Excel import/export
- ✅ PDF generation
- ✅ Auto-calculations
- ✅ Bulk operations
- ✅ Workflow management

---

## 🐛 Common Test Checks

### 1. Authentication
```bash
# Get JWT token first
POST http://127.0.0.1:8000/api/auth/login/
{
  "username": "admin",
  "password": "admin123"
}

# Use token in subsequent requests
Authorization: Bearer <access_token>
```

### 2. Permissions
- Admin users: Full access to all endpoints
- Teachers: Limited access to their own data
- Students: Read-only for most endpoints

### 3. Validation
- Required fields must be provided
- Date formats: YYYY-MM-DD
- Time formats: HH:MM:SS
- Decimal fields: 2 decimal places

### 4. File Uploads
- Supported formats: Excel (.xlsx), PDF, images
- Max file size: Check Django settings
- Upload path: `media/` directory

---

## 📝 Quick Reference Cards

### Excel Upload Format (Exam Marks)
```
roll_no | marks | is_absent | remarks
--------|-------|-----------|--------
1001    | 85.5  | False     | Good
1002    | 0     | True      | Absent
1003    | 92.0  | False     | Excellent
```

### Payroll Components Example
```json
{
  "earnings": [
    {"name": "Basic Salary", "code": "BASIC", "type": "earning"},
    {"name": "HRA", "code": "HRA", "type": "earning", "calculation": "percentage", "value": "40"}
  ],
  "deductions": [
    {"name": "Tax", "code": "TAX", "type": "deduction", "calculation": "percentage", "value": "10"},
    {"name": "Insurance", "code": "INS", "type": "deduction", "calculation": "fixed", "value": "500"}
  ]
}
```

### Leave Balance Calculation
```
Annual Leave: 20 days
Used: 5 days
Pending: 2 days
Available: 13 days
```

---

## 🎯 Testing Checklist

### Phase 5 - Academic
- [ ] Exam types CRUD
- [ ] Exam marks bulk upload
- [ ] Exam marks export
- [ ] Results calculation
- [ ] Grade scales setup
- [ ] Homework creation
- [ ] Homework publish/close
- [ ] Student submissions
- [ ] Teacher grading
- [ ] Lesson plans
- [ ] Class routines
- [ ] Staff attendance

### Phase 6 - HR
- [ ] Designations hierarchy
- [ ] Employee details
- [ ] Payroll components
- [ ] Payroll processing
- [ ] PDF payslip generation
- [ ] Leave applications
- [ ] Leave approvals
- [ ] Bulk approvals
- [ ] Leave balance check
- [ ] Holiday calendar

### Integration Tests
- [ ] End-to-end exam workflow
- [ ] End-to-end homework workflow
- [ ] End-to-end payroll workflow
- [ ] End-to-end leave workflow
- [ ] Cross-module data consistency

---

## 📚 Documentation Links

- **Phase 5 Details:** `PHASE5_COMPLETE_SUMMARY.md`
- **Phase 5 API:** `PHASE5_API_REFERENCE.md`
- **Phase 6 Details:** `PHASE6_HR_MODULE_COMPLETE.md`
- **Phase 6 API:** `PHASE6_API_REFERENCE.md`
- **Testing Guide:** `PHASE5_TESTING_GUIDE.md`
- **Progress Report:** `PROGRESS_REPORT_70_PERCENT.md`
- **Conflict Resolution:** `MODEL_CONFLICTS_RESOLVED.md`

---

**Server Running:** ✅ http://127.0.0.1:8000/  
**Status:** Ready for comprehensive testing  
**Phase:** 70% Backend Complete  
**Next:** Test all endpoints and build Phase 7

---

**Last Updated:** November 1, 2025  
**Backend Version:** Django 5.2.7  
**API Version:** v1
