# ⚡ Quick Testing Guide - Communication & Notifications System

## 🚀 Setup (5 minutes)

### 1. Install Dependencies
```powershell
cd backend
pip install channels channels-redis
pip install redis
```

### 2. Start Redis
```powershell
# Option 1: Docker (Recommended)
docker run -d -p 6379:6379 redis:latest

# Option 2: Install Redis for Windows
# Download from: https://github.com/microsoftarchive/redis/releases
```

### 3. Verify Redis is Running
```powershell
redis-cli ping
# Should output: PONG
```

### 4. Run Django Server
```powershell
cd backend
python manage.py runserver
```

---

## 📧 Test 1: Email Template System (2 minutes)

### Step 1: Create Email Template
```powershell
# Replace YOUR_TOKEN with actual JWT token
$token = "YOUR_JWT_TOKEN_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    title = "Assignment Reminder"
    subject = "Due Soon: {{assignment_title}}"
    body = "Dear {{student_name}}, your assignment for {{subject_name}} is due on {{due_date}}."
    is_active = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/email-template-enhanced/" -Method POST -Headers $headers -Body $body
```

### Step 2: Preview Template
```powershell
$body = @{
    sample_data = @{
        student_name = "John Doe"
        assignment_title = "Math Homework"
        subject_name = "Mathematics"
        due_date = "2025-11-15"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/email-template-enhanced/1/preview/" -Method POST -Headers $headers -Body $body
```

**Expected Output:**
```json
{
  "original_template": "Dear {{student_name}}, your assignment...",
  "preview": "Dear John Doe, your assignment for Mathematics is due on 2025-11-15.",
  "variables_found": ["student_name", "assignment_title", "subject_name", "due_date"]
}
```

### Step 3: List Available Variables
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/email-template-enhanced/list_variables/" -Method GET -Headers $headers
```

### Step 4: Send Email (Test Mode)
```powershell
$body = @{
    recipients = @("student:1", "teacher:1")
    variables = @{
        student_name = "John Doe"
        assignment_title = "Math Homework"
        subject_name = "Mathematics"
        due_date = "2025-11-15"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/email-template-enhanced/1/send_email/" -Method POST -Headers $headers -Body $body
```

**Expected Output:**
```json
{
  "sent_count": 2,
  "failed_count": 0,
  "errors": []
}
```

---

## 💬 Test 2: Chat System (3 minutes)

### Step 1: Send Chat Invitation
```powershell
$body = @{
    receiver_id = 2
    message = "Hi, can we discuss the assignment?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/chat-system-enhanced/send_invitation/" -Method POST -Headers $headers -Body $body
```

**Expected Output:**
```json
{
  "status": "success",
  "invitation_id": 1,
  "message": "Invitation sent successfully"
}
```

### Step 2: Get Pending Invitations (Login as receiver)
```powershell
# Switch to receiver's token
$receiverToken = "RECEIVER_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $receiverToken"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/chat-system-enhanced/pending_invitations/" -Method GET -Headers $headers
```

### Step 3: Accept Invitation
```powershell
$body = @{
    invitation_id = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/chat-system-enhanced/accept_invitation/" -Method POST -Headers $headers -Body $body
```

**Expected Output:**
```json
{
  "status": "success",
  "message": "Invitation accepted",
  "chat_partner": {
    "id": 1,
    "name": "Teacher John",
    "email": "john.teacher@school.com"
  }
}
```

### Step 4: Get Chat List
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/chat-system-enhanced/chat_list/" -Method GET -Headers $headers
```

### Step 5: Connect to WebSocket (Use wscat or browser console)

**Install wscat:**
```powershell
npm install -g wscat
```

**Connect:**
```powershell
wscat -c "ws://localhost:8000/ws/chat/room123/?token=YOUR_JWT_TOKEN"
```

**Send Message:**
```json
{"type": "message", "message": "Hello from WebSocket!"}
```

**Send Typing Indicator:**
```json
{"type": "typing", "is_typing": true}
```

---

## 📢 Test 3: Announcements (2 minutes)

### Step 1: Create Announcement
```powershell
$body = @{
    title = "School Closed Tomorrow"
    content = "Due to heavy rain, school will remain closed tomorrow."
    announcement_type = "urgent"
    target_audience = "all"
    priority = "high"
    is_published = $false
} | ConvertTo-Json

$announcement = Invoke-RestMethod -Uri "http://localhost:8000/api/admin/announcement-enhanced/" -Method POST -Headers $headers -Body $body
$announcementId = $announcement.id
```

### Step 2: Publish Announcement (Auto-sends notifications)
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/announcement-enhanced/$announcementId/publish/" -Method POST -Headers $headers
```

**Expected Output:**
```json
{
  "status": "success",
  "message": "Announcement published",
  "notifications_sent": 250
}
```

### Step 3: Get My Announcements
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/announcement-enhanced/my_announcements/" -Method GET -Headers $headers
```

### Step 4: Get Announcement Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/announcement-enhanced/statistics/" -Method GET -Headers $headers
```

---

## 🔔 Test 4: Notifications (2 minutes)

### Step 1: Get Unread Count
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/notification-enhanced/unread_count/" -Method GET -Headers $headers
```

**Expected Output:**
```json
{
  "unread_count": 5
}
```

### Step 2: List Notifications
```powershell
# Get all notifications
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/notification-enhanced/" -Method GET -Headers $headers

# Get only unread
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/notification-enhanced/?is_read=false" -Method GET -Headers $headers
```

### Step 3: Mark Notification as Read
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/notification-enhanced/1/mark_as_read/" -Method POST -Headers $headers
```

### Step 4: Mark All as Read
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/notification-enhanced/mark_all_as_read/" -Method POST -Headers $headers
```

**Expected Output:**
```json
{
  "status": "success",
  "updated_count": 5,
  "message": "All notifications marked as read"
}
```

### Step 5: Connect to Notification WebSocket

```powershell
wscat -c "ws://localhost:8000/ws/notifications/?token=YOUR_JWT_TOKEN"
```

**Upon connection, you'll receive:**
```json
{
  "type": "connection_established",
  "message": "Connected to notifications",
  "unread_count": 5
}
```

**Mark as read via WebSocket:**
```json
{"action": "mark_as_read", "notification_id": 1}
```

**Get unread count via WebSocket:**
```json
{"action": "get_unread_count"}
```

---

## 📊 Test 5: Communication Logs (1 minute)

### Step 1: Get Communication Logs
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/communication-log-enhanced/" -Method GET -Headers $headers
```

### Step 2: Filter by Channel
```powershell
# Email logs only
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/communication-log-enhanced/?channel=email" -Method GET -Headers $headers

# SMS logs only
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/communication-log-enhanced/?channel=sms" -Method GET -Headers $headers
```

### Step 3: Get Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/communication-log-enhanced/statistics/" -Method GET -Headers $headers
```

**Expected Output:**
```json
{
  "overall": {
    "total_sent": 150,
    "total_failed": 3,
    "success_rate": 98.0
  },
  "by_channel": {
    "email": {
      "sent": 100,
      "failed": 2,
      "success_rate": 98.04
    },
    "sms": {
      "sent": 50,
      "failed": 1,
      "success_rate": 98.04
    }
  },
  "daily_stats": [
    {"date": "2025-11-01", "count": 25},
    {"date": "2025-10-31", "count": 32}
  ]
}
```

---

## 🧪 Test 6: Automated Notifications (1 minute)

### Test Auto-Notify on Assignment Creation

**In Django Shell:**
```powershell
python manage.py shell
```

```python
from admin_api.models import Assignment, ClassRoom, Subject, Teacher
from admin_api.views.communication_notifications_enhanced import AutomatedNotificationService

# Create test assignment
classroom = ClassRoom.objects.first()
subject = Subject.objects.first()
teacher = Teacher.objects.first()

assignment = Assignment.objects.create(
    title="Math Homework",
    description="Solve exercises 1-10",
    classroom=classroom,
    subject=subject,
    teacher=teacher,
    due_date="2025-11-15"
)

# Auto-notify students
count = AutomatedNotificationService.notify_new_assignment(assignment)
print(f"Notifications sent to {count} students")
```

### Test Auto-Notify on Grade Posted

```python
from admin_api.models import Grade, Student

# Create test grade
student = Student.objects.first()
grade = Grade.objects.create(
    student=student,
    subject=subject,
    marks=85,
    total_marks=100,
    comments="Excellent work!"
)

# Auto-notify student and parent
student_notif, parent_notif = AutomatedNotificationService.notify_grade_posted(grade)
print(f"Notification sent to student: {student_notif.id}")
print(f"Notification sent to parent: {parent_notif.id if parent_notif else 'No parent'}")
```

---

## 🎯 Complete Workflow Test (5 minutes)

### Scenario: Teacher assigns homework and notifies students

**Step 1: Teacher creates email template**
```powershell
$body = @{
    title = "Homework Notification"
    subject = "New Homework: {{assignment_title}}"
    body = "Dear {{student_name}}, you have a new assignment for {{subject_name}}. Due date: {{due_date}}"
    is_active = $true
} | ConvertTo-Json

$template = Invoke-RestMethod -Uri "http://localhost:8000/api/admin/email-template-enhanced/" -Method POST -Headers $headers -Body $body
```

**Step 2: Teacher creates assignment (triggers auto-notification)**
```python
# In Django shell
assignment = Assignment.objects.create(
    title="Math Homework - Chapter 5",
    classroom=ClassRoom.objects.get(id=1),
    subject=Subject.objects.get(name="Mathematics"),
    due_date="2025-11-15"
)

# Auto-notifications sent to all students in class
count = AutomatedNotificationService.notify_new_assignment(assignment)
```

**Step 3: Teacher sends email to class using template**
```powershell
$body = @{
    recipients = @("class:1")
    variables = @{
        assignment_title = "Math Homework - Chapter 5"
        subject_name = "Mathematics"
        due_date = "2025-11-15"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/email-template-enhanced/$($template.id)/send_email/" -Method POST -Headers $headers -Body $body
```

**Step 4: Student receives notification (WebSocket)**
```javascript
// Student connects to notification WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/notifications/?token=STUDENT_TOKEN');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'new_notification') {
    console.log('New notification:', data.notification);
    // Show toast: "📝 New Assignment: Math Homework - Chapter 5"
  }
};
```

**Step 5: Student checks notifications**
```powershell
$studentHeaders = @{
    "Authorization" = "Bearer STUDENT_TOKEN"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/notification-enhanced/?is_read=false" -Method GET -Headers $studentHeaders
```

**Step 6: Student sends chat invitation to teacher**
```powershell
$body = @{
    receiver_id = 1  # Teacher ID
    message = "Can you help me with question 5?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/chat-system-enhanced/send_invitation/" -Method POST -Headers $studentHeaders -Body $body
```

**Step 7: Teacher receives and accepts invitation**
```powershell
# Teacher checks pending invitations
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/chat-system-enhanced/pending_invitations/" -Method GET -Headers $headers

# Teacher accepts
$body = @{
    invitation_id = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/chat-system-enhanced/accept_invitation/" -Method POST -Headers $headers -Body $body
```

**Step 8: Real-time chat**
```powershell
# Both connect to WebSocket
# Teacher:
wscat -c "ws://localhost:8000/ws/chat/room123/?token=TEACHER_TOKEN"

# Student:
wscat -c "ws://localhost:8000/ws/chat/room123/?token=STUDENT_TOKEN"

# Both can send messages
{"type": "message", "message": "Hello!"}
```

---

## ✅ Verification Checklist

After completing all tests, verify:

- [ ] Email templates can be created
- [ ] Email templates support variable substitution
- [ ] Emails can be sent to individuals and classes
- [ ] Chat invitations can be sent and accepted
- [ ] Block/unblock mechanism works
- [ ] WebSocket chat messages are delivered in real-time
- [ ] Typing indicators work
- [ ] Announcements can be published
- [ ] Announcements auto-send notifications
- [ ] Notifications appear in real-time via WebSocket
- [ ] Notifications can be marked as read
- [ ] Communication logs show all sent emails/SMS
- [ ] Statistics API returns correct data
- [ ] Automated notifications fire on assignment/grade creation

---

## 🐛 Troubleshooting

### Redis Not Running
```powershell
# Check if Redis is running
redis-cli ping

# If not, start Redis
docker start redis
# OR
redis-server
```

### WebSocket Connection Failed
```powershell
# Check Django server logs
# Make sure you're using the correct port
# Verify JWT token is valid
```

### JWT Token Expired
```powershell
# Get new token
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/token/" -Method POST -Body $body -ContentType "application/json"
$token = $response.access
```

### No Notifications Received
```powershell
# Check notification consumer is running
# Verify WebSocket connection is established
# Check Redis is running (required for channel layers)
```

---

## 📝 Quick Reference

### Base URLs
- **Email Templates:** `/api/admin/email-template-enhanced/`
- **SMS Templates:** `/api/admin/sms-template-enhanced/`
- **Communication Logs:** `/api/admin/communication-log-enhanced/`
- **Chat System:** `/api/admin/chat-system-enhanced/`
- **Announcements:** `/api/admin/announcement-enhanced/`
- **Notifications:** `/api/admin/notification-enhanced/`

### WebSocket URLs
- **Chat:** `ws://localhost:8000/ws/chat/{room_id}/?token={JWT_TOKEN}`
- **Notifications:** `ws://localhost:8000/ws/notifications/?token={JWT_TOKEN}`

### Authentication Header
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "Content-Type" = "application/json"
}
```

---

## 🎉 Success!

If all tests pass, your Communication & Notifications system is working perfectly!

**Next Steps:**
1. Integrate with frontend
2. Configure production email gateway
3. Configure production SMS gateway
4. Set up monitoring and logging
5. Deploy to production

**Estimated Testing Time:** 15 minutes  
**Status:** ✅ All tests passing = System ready for production!
