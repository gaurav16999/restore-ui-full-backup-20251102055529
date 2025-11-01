# 🧪 Phase 5 Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend server running: `python manage.py runserver 8000`
2. User authenticated (JWT token)
3. Test data: Students, Teachers, Subjects, ClassRooms exist

---

## 🎯 Test Scenarios

### Scenario 1: Complete Exam Management Workflow ⭐

**Step 1: Create Exam Type**
```bash
POST http://localhost:8000/api/admin/exam-types/
Headers:
  Authorization: Bearer <your_token>
  Content-Type: application/json
Body:
{
  "name": "Mid-term Exam",
  "code": "MT",
  "weightage": 30.0,
  "description": "Mid-term examination",
  "is_active": true
}
```
**Expected:** 201 Created with exam type details

**Step 2: Create Exam (existing endpoint)**
```bash
POST http://localhost:8000/api/admin/exams/
Body:
{
  "name": "Math Mid-term",
  "subject": 1,
  "class_room": 1,
  "exam_date": "2025-02-15",
  "start_time": "09:00",
  "end_time": "11:00",
  "total_marks": 100,
  "passing_marks": 40
}
```

**Step 3: Create Excel file for bulk upload**
Create `marks.xlsx` with:
| roll_no | marks_obtained | is_absent | remarks |
|---------|----------------|-----------|---------|
| 001     | 85             | FALSE     | Good    |
| 002     | 0              | TRUE      | Absent  |
| 003     | 72             | FALSE     | Average |
| 004     | 91             | FALSE     | Excellent |

**Step 4: Bulk Upload Marks**
```bash
POST http://localhost:8000/api/admin/exam-marks/bulk_upload/
Headers:
  Authorization: Bearer <your_token>
Body (form-data):
  exam_id: <exam_id_from_step2>
  file: marks.xlsx
```
**Expected:** 200 OK with `created_count: 4`

**Step 5: Calculate Results**
```bash
POST http://localhost:8000/api/admin/exam-results-advanced/calculate_results/
Body:
{
  "exam_id": <exam_id_from_step2>
}
```
**Expected:** Results calculated with ranks assigned

**Step 6: Export Marks**
```bash
GET http://localhost:8000/api/admin/exam-marks/export_marks/?exam=<exam_id>
```
**Expected:** Excel file download with all marks, percentages, grades

**✅ Success Criteria:**
- [ ] Exam type created
- [ ] Marks uploaded in bulk
- [ ] Results calculated with correct ranks
- [ ] Grades assigned correctly (A+, A, B, etc.)
- [ ] Excel export works with all data

---

### Scenario 2: Homework Assignment Workflow ⭐

**Step 1: Create Homework (Teacher)**
```bash
POST http://localhost:8000/api/admin/homework/
Body:
{
  "title": "Algebra Practice",
  "description": "Solve exercises 1-20 from chapter 3",
  "subject": 1,
  "class_room": 1,
  "assigned_date": "2025-01-15",
  "due_date": "2025-01-22",
  "max_marks": 20,
  "status": "draft"
}
```
**Expected:** 201 Created with homework_id

**Step 2: Publish Homework**
```bash
POST http://localhost:8000/api/admin/homework/<homework_id>/publish/
```
**Expected:** 200 OK, status changed to "published"

**Step 3: Submit Homework (Student)**
```bash
POST http://localhost:8000/api/admin/homework-submissions/submit/
Body (form-data):
  homework_id: <homework_id>
  submission_text: "I have completed all 20 exercises"
  attachment: solutions.pdf
```
**Expected:** 201 Created with submission details

**Step 4: Check Submission Statistics**
```bash
GET http://localhost:8000/api/admin/homework/<homework_id>/submissions_summary/
```
**Expected:**
```json
{
  "total_students": 40,
  "submitted_count": 1,
  "graded_count": 0,
  "late_count": 0,
  "pending_count": 39,
  "submission_rate": 2.5
}
```

**Step 5: Grade Submission (Teacher)**
```bash
POST http://localhost:8000/api/admin/homework-submissions/<submission_id>/grade/
Body:
{
  "marks_obtained": 18,
  "feedback": "Excellent work! Minor error in Q15."
}
```
**Expected:** 200 OK, status changed to "graded"

**Step 6: Test Late Submission**
Create homework with past due_date, then submit.
**Expected:** Submission marked with `status: "late"`

**Step 7: Close Homework**
```bash
POST http://localhost:8000/api/admin/homework/<homework_id>/close/
```
**Expected:** No new submissions allowed

**✅ Success Criteria:**
- [ ] Homework created as draft
- [ ] Published successfully
- [ ] Student can submit with file
- [ ] Statistics accurate
- [ ] Late submission detected
- [ ] Grading works
- [ ] Close prevents new submissions

---

### Scenario 3: Lesson Planning 📖

**Step 1: Create Lesson Plan**
```bash
POST http://localhost:8000/api/admin/lesson-plans-advanced/
Body:
{
  "title": "Introduction to Quadratic Equations",
  "subject": 1,
  "class_room": 1,
  "teacher": 1,
  "academic_year": 1,
  "lesson_date": "2025-01-20",
  "duration_minutes": 45,
  "topic": "Quadratic Equations",
  "sub_topic": "Standard Form",
  "objectives": "Students will identify and write quadratic equations in standard form",
  "methodology": "Lecture with examples, group practice",
  "resources": "Textbook, whiteboard, worksheet",
  "homework": "Exercise 5.1, problems 1-10",
  "notes": "Focus on ax^2 + bx + c = 0 format"
}
```
**Expected:** 201 Created

**Step 2: List Lesson Plans with Filters**
```bash
GET http://localhost:8000/api/admin/lesson-plans-advanced/?teacher=1&start_date=2025-01-01&end_date=2025-01-31&is_completed=false
```
**Expected:** List of incomplete lesson plans for date range

**Step 3: Mark as Completed**
```bash
POST http://localhost:8000/api/admin/lesson-plans-advanced/<lesson_id>/mark_completed/
```
**Expected:** `is_completed: true`

**✅ Success Criteria:**
- [ ] Lesson plan created with all fields
- [ ] Filters work (teacher, date range, completion status)
- [ ] Mark completed works
- [ ] File attachment works (if added)

---

### Scenario 4: Class Timetable Generation 📅

**Step 1: Create Monday Schedule**
```bash
POST http://localhost:8000/api/admin/class-routines/
Body:
[
  {
    "class_room": 1,
    "subject": 1,  # Math
    "teacher": 1,
    "day_of_week": 0,  # Monday
    "start_time": "09:00",
    "end_time": "10:00",
    "room": "A-101",
    "academic_year": 1,
    "is_active": true
  },
  {
    "class_room": 1,
    "subject": 2,  # Science
    "teacher": 2,
    "day_of_week": 0,
    "start_time": "10:00",
    "end_time": "11:00",
    "room": "A-101",
    "academic_year": 1,
    "is_active": true
  }
]
```

**Step 2: Get Teacher's Schedule**
```bash
GET http://localhost:8000/api/admin/class-routines/teacher_schedule/?teacher_id=1
```
**Expected:**
```json
{
  "Monday": [
    {
      "id": 1,
      "class_name": "Class 10-A",
      "subject_name": "Mathematics",
      "start_time": "09:00",
      "end_time": "10:00",
      "room": "A-101"
    }
  ],
  "Tuesday": [...],
  ...
}
```

**Step 3: Get Class Timetable**
```bash
GET http://localhost:8000/api/admin/class-routines/class_schedule/?class_id=1
```
**Expected:** Weekly timetable grouped by day

**✅ Success Criteria:**
- [ ] Routine entries created
- [ ] Teacher schedule displays correctly
- [ ] Class timetable displays correctly
- [ ] Time conflicts detected (if implemented)

---

### Scenario 5: Staff Attendance Management 👨‍🏫

**Step 1: Mark Individual Attendance**
```bash
POST http://localhost:8000/api/admin/staff-attendance-advanced/
Body:
{
  "teacher": 1,
  "date": "2025-01-15",
  "status": "present",
  "check_in_time": "08:30",
  "check_out_time": "16:00",
  "remarks": "On time"
}
```
**Expected:** 201 Created with duration calculated (7.5 hours)

**Step 2: Bulk Mark Attendance**
```bash
POST http://localhost:8000/api/admin/staff-attendance-advanced/mark_attendance/
Body:
{
  "date": "2025-01-16",
  "attendance": [
    {
      "teacher_id": 1,
      "status": "present",
      "check_in_time": "08:30",
      "check_out_time": "16:00"
    },
    {
      "teacher_id": 2,
      "status": "late",
      "check_in_time": "09:15",
      "check_out_time": "16:00",
      "remarks": "Traffic delay"
    },
    {
      "teacher_id": 3,
      "status": "on_leave",
      "remarks": "Sick leave"
    }
  ]
}
```
**Expected:** 200 OK with created_count

**Step 3: Get Monthly Report**
```bash
GET http://localhost:8000/api/admin/staff-attendance-advanced/monthly_report/?month=2025-01&teacher_id=1
```
**Expected:**
```json
{
  "month": "2025-01",
  "total_days": 20,
  "present_days": 18,
  "absent_days": 0,
  "late_days": 2,
  "half_days": 0,
  "on_leave": 0,
  "attendance_rate": 90.00
}
```

**✅ Success Criteria:**
- [ ] Individual attendance marked
- [ ] Duration calculated correctly
- [ ] Bulk attendance works
- [ ] Monthly report accurate
- [ ] Attendance rate calculated correctly

---

## 🔍 Edge Cases to Test

### Exam Management:
1. **Invalid marks:** Try marks > total_marks
2. **Duplicate entry:** Upload same student marks twice
3. **Non-existent roll number:** In bulk upload
4. **Calculate results without marks:** Should handle gracefully
5. **Export empty exam:** Should return empty Excel

### Homework:
1. **Submit to closed homework:** Should fail
2. **Submit twice:** Should update existing submission
3. **Grade without submission:** Should fail
4. **Late submission detection:** Submit after due_date
5. **Publish already published:** Should fail

### Lesson Plans:
1. **Past lesson date:** Should allow
2. **Future date filter:** Should work
3. **Mark completed twice:** Should be idempotent

### Timetable:
1. **Overlapping times:** (Same teacher, same time, different class)
2. **Invalid day_of_week:** Should validate (0-6)
3. **Start time > End time:** Should validate

### Staff Attendance:
1. **Duplicate date:** Should update existing
2. **Future date:** Should allow
3. **Check-in after check-out:** Should validate
4. **Monthly report with no data:** Should return zeros

---

## 🐛 Common Issues & Solutions

### Issue 1: "Authentication credentials not provided"
**Solution:** Include JWT token in Authorization header

### Issue 2: "Teacher object has no attribute 'teacher'"
**Solution:** User must have teacher role and related Teacher model

### Issue 3: "File not found" on bulk upload
**Solution:** Use form-data, not JSON for file uploads

### Issue 4: Excel export returns empty file
**Solution:** Ensure exam has marks entered

### Issue 5: Late submission not detected
**Solution:** Check server timezone settings, use timezone-aware dates

---

## 📊 Performance Testing

### Load Testing:
```bash
# Bulk upload 100 marks
POST /exam-marks/bulk_upload/
Excel with 100 rows

# Expected: < 5 seconds

# Calculate results for 100 students
POST /exam-results-advanced/calculate_results/
# Expected: < 3 seconds

# Export 100 marks
GET /exam-marks/export_marks/?exam=<id>
# Expected: < 2 seconds
```

---

## ✅ Complete Test Checklist

### Exam Management:
- [ ] Create exam type
- [ ] Get active types
- [ ] Enter individual mark
- [ ] Bulk upload marks (valid file)
- [ ] Bulk upload with errors (invalid roll_no)
- [ ] Calculate results
- [ ] Verify ranks are correct
- [ ] Export marks to Excel
- [ ] Filter marks by exam, student
- [ ] Test absent student handling

### Homework:
- [ ] Create draft homework
- [ ] Publish homework
- [ ] Submit homework (on time)
- [ ] Submit homework (late)
- [ ] Submit with file attachment
- [ ] Grade submission
- [ ] Get submission summary
- [ ] Close homework
- [ ] Test submit to closed homework (should fail)
- [ ] Filter by subject, class, status

### Lesson Plans:
- [ ] Create lesson plan
- [ ] Upload attachment
- [ ] Mark completed
- [ ] Filter by teacher
- [ ] Filter by date range
- [ ] Filter by completion status

### Timetable:
- [ ] Create routine entries
- [ ] Get teacher schedule
- [ ] Get class timetable
- [ ] Filter by day
- [ ] Test with multiple classes

### Staff Attendance:
- [ ] Mark single attendance
- [ ] Bulk mark attendance
- [ ] Calculate duration
- [ ] Get monthly report
- [ ] Test different statuses (present, late, absent)
- [ ] Filter by date range

---

## 🎯 Success Metrics

**All tests pass if:**
- ✅ All CRUD operations work
- ✅ Custom actions return expected responses
- ✅ Filters work correctly
- ✅ File uploads/downloads work
- ✅ Calculations are accurate
- ✅ Workflows complete successfully
- ✅ Edge cases handled gracefully
- ✅ Performance is acceptable

---

## 📝 Reporting Issues

When reporting issues, include:
1. Endpoint URL
2. Request method (GET, POST, etc.)
3. Request body/params
4. Expected response
5. Actual response
6. Error message (if any)

---

*Happy Testing! 🧪*
