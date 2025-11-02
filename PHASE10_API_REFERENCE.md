# 📚 Phase 10: API Reference
## Communication & Notifications Enhanced System

**Base URL:** `http://localhost:8000/api/admin`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## 📧 Email Template System

### Base Endpoint: `/email-template-enhanced/`

### 1. List Email Templates
```http
GET /email-template-enhanced/
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters:**
- `?search=homework` - Search templates
- `?is_active=true` - Filter by active status
- `?page=1` - Pagination

**Response:**
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/admin/email-template-enhanced/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Assignment Reminder",
      "subject": "Reminder: {{assignment_title}} Due Soon",
      "body": "Dear {{student_name}}, your assignment...",
      "is_active": true,
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Create Email Template
```http
POST /email-template-enhanced/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "Assignment Reminder",
  "subject": "Reminder: {{assignment_title}} Due Soon",
  "body": "Dear {{student_name}}, your assignment for {{subject_name}} is due on {{due_date}}.",
  "is_active": true
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Assignment Reminder",
  "subject": "Reminder: {{assignment_title}} Due Soon",
  "body": "Dear {{student_name}}, your assignment...",
  "is_active": true,
  "created_at": "2025-11-01T10:00:00Z"
}
```

---

### 3. Get Email Template Details
```http
GET /email-template-enhanced/{id}/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Assignment Reminder",
  "subject": "Reminder: {{assignment_title}} Due Soon",
  "body": "Dear {{student_name}}...",
  "is_active": true,
  "created_at": "2025-11-01T10:00:00Z"
}
```

---

### 4. Update Email Template
```http
PUT /email-template-enhanced/{id}/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "Assignment Reminder Updated",
  "subject": "Updated: {{assignment_title}}",
  "body": "Dear {{student_name}}...",
  "is_active": true
}
```

**Response:** `200 OK`

---

### 5. Delete Email Template
```http
DELETE /email-template-enhanced/{id}/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `204 No Content`

---

### 6. Preview Email Template (Custom Action)
```http
POST /email-template-enhanced/{id}/preview/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "sample_data": {
    "student_name": "John Doe",
    "assignment_title": "Math Homework",
    "subject_name": "Mathematics",
    "due_date": "2025-11-15"
  }
}
```

**Response:** `200 OK`
```json
{
  "original_template": {
    "subject": "Reminder: {{assignment_title}} Due Soon",
    "body": "Dear {{student_name}}, your assignment for {{subject_name}} is due on {{due_date}}."
  },
  "preview": {
    "subject": "Reminder: Math Homework Due Soon",
    "body": "Dear John Doe, your assignment for Mathematics is due on 2025-11-15."
  },
  "variables_found": [
    "student_name",
    "assignment_title",
    "subject_name",
    "due_date"
  ]
}
```

---

### 7. Send Email (Custom Action)
```http
POST /email-template-enhanced/{id}/send_email/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "recipients": [
    "user@example.com",
    "student:10",
    "teacher:5",
    "class:3"
  ],
  "variables": {
    "student_name": "John Doe",
    "assignment_title": "Math Homework",
    "subject_name": "Mathematics",
    "due_date": "2025-11-15"
  },
  "send_individually": false
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "sent_count": 45,
  "failed_count": 2,
  "errors": [
    "invalid@email.com: SMTP error"
  ],
  "message": "Emails sent successfully"
}
```

**Recipient Formats:**
- `"user@example.com"` - Direct email address
- `"user:5"` - User ID 5's email
- `"student:10"` - Student ID 10's email
- `"teacher:3"` - Teacher ID 3's email
- `"class:5"` - All students in Class ID 5

---

### 8. List Available Variables (Custom Action)
```http
GET /email-template-enhanced/list_variables/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "student": [
    "student_name",
    "student_email",
    "student_roll",
    "student_class",
    "student_section"
  ],
  "teacher": [
    "teacher_name",
    "teacher_email",
    "teacher_subject"
  ],
  "parent": [
    "parent_name",
    "parent_email",
    "parent_phone"
  ],
  "school": [
    "school_name",
    "school_address",
    "school_phone",
    "school_email",
    "school_website"
  ],
  "assignment": [
    "assignment_title",
    "assignment_description",
    "due_date",
    "subject_name"
  ],
  "grade": [
    "grade_marks",
    "grade_total_marks",
    "grade_percentage",
    "grade_comments"
  ],
  "general": [
    "current_date",
    "academic_year",
    "semester"
  ]
}
```

---

## 📱 SMS Template System

### Base Endpoint: `/sms-template-enhanced/`

### 1. List SMS Templates
```http
GET /sms-template-enhanced/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** Similar to email templates

---

### 2. Create SMS Template
```http
POST /sms-template-enhanced/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "Assignment Reminder SMS",
  "body": "Hi {{student_name}}, assignment {{assignment_title}} due on {{due_date}}",
  "is_active": true
}
```

**Response:** `201 Created`

---

### 3. Send SMS (Custom Action)
```http
POST /sms-template-enhanced/{id}/send_sms/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "recipients": [
    "+1234567890",
    "student:10",
    "parent:5"
  ],
  "variables": {
    "student_name": "John Doe",
    "assignment_title": "Math Homework",
    "due_date": "2025-11-15"
  }
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "sent_count": 3,
  "failed_count": 0,
  "errors": [],
  "message": "SMS sent successfully"
}
```

---

## 📊 Communication Logs

### Base Endpoint: `/communication-log-enhanced/`

### 1. List Communication Logs
```http
GET /communication-log-enhanced/
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters:**
- `?channel=email` - Filter by email
- `?channel=sms` - Filter by SMS
- `?status=sent` - Filter by sent
- `?status=failed` - Filter by failed
- `?start_date=2025-10-01` - Start date
- `?end_date=2025-11-01` - End date
- `?search=john@example.com` - Search recipient

**Response:** `200 OK`
```json
{
  "count": 150,
  "results": [
    {
      "id": 1,
      "channel": "email",
      "to": "john@example.com",
      "subject": "Assignment Reminder",
      "body": "Dear John...",
      "status": "sent",
      "response": {},
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Communication Statistics (Custom Action)
```http
GET /communication-log-enhanced/statistics/
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters:**
- `?start_date=2025-10-01` - Start date
- `?end_date=2025-11-01` - End date

**Response:** `200 OK`
```json
{
  "overall": {
    "total_sent": 1250,
    "total_failed": 15,
    "success_rate": 98.80
  },
  "by_channel": {
    "email": {
      "sent": 800,
      "failed": 10,
      "success_rate": 98.75
    },
    "sms": {
      "sent": 450,
      "failed": 5,
      "success_rate": 98.89
    }
  },
  "daily_stats": [
    {
      "date": "2025-11-01",
      "count": 45
    },
    {
      "date": "2025-10-31",
      "count": 52
    }
  ]
}
```

---

## 💬 Chat System

### Base Endpoint: `/chat-system-enhanced/`

### 1. Send Chat Invitation (Custom Action)
```http
POST /chat-system-enhanced/send_invitation/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "receiver_id": 25,
  "message": "Hi, can we discuss the assignment?"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "invitation_id": 15,
  "message": "Invitation sent successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "User has blocked you"
}
```

---

### 2. Accept Chat Invitation (Custom Action)
```http
POST /chat-system-enhanced/accept_invitation/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "invitation_id": 15
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Invitation accepted",
  "chat_partner": {
    "id": 10,
    "name": "John Teacher",
    "email": "john.teacher@school.com"
  }
}
```

---

### 3. Reject Chat Invitation (Custom Action)
```http
POST /chat-system-enhanced/reject_invitation/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "invitation_id": 15
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Invitation rejected"
}
```

---

### 4. Get Chat List (Custom Action)
```http
GET /chat-system-enhanced/chat_list/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "chats": [
    {
      "partner_id": 25,
      "partner_name": "Student John",
      "partner_email": "john.student@school.com",
      "last_message": "Thanks for the help!",
      "last_message_time": "2025-11-01T10:30:00Z",
      "unread_count": 2
    }
  ]
}
```

---

### 5. Get Pending Invitations (Custom Action)
```http
GET /chat-system-enhanced/pending_invitations/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "invitations": [
    {
      "invitation_id": 15,
      "sender_id": 10,
      "sender_name": "Teacher Mary",
      "sender_email": "mary.teacher@school.com",
      "message": "Can we discuss your grades?",
      "created_at": "2025-11-01T09:00:00Z"
    }
  ]
}
```

---

### 6. Block User (Custom Action)
```http
POST /chat-system-enhanced/block_user/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "blocked_user_id": 15,
  "reason": "Inappropriate messages"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "User blocked successfully"
}
```

---

### 7. Unblock User (Custom Action)
```http
POST /chat-system-enhanced/unblock_user/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "blocked_user_id": 15
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "User unblocked successfully"
}
```

---

### 8. Get Blocked Users List (Custom Action)
```http
GET /chat-system-enhanced/blocked_users_list/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "blocked_users": [
    {
      "user_id": 15,
      "user_name": "Spam User",
      "user_email": "spam@example.com",
      "reason": "Inappropriate messages",
      "blocked_at": "2025-10-15T14:20:00Z"
    }
  ]
}
```

---

## 📢 Announcements

### Base Endpoint: `/announcement-enhanced/`

### 1. List Announcements
```http
GET /announcement-enhanced/
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters:**
- `?announcement_type=urgent` - Filter by type
- `?target_audience=students` - Filter by audience
- `?is_published=true` - Filter by published status

**Response:** `200 OK`
```json
{
  "count": 25,
  "results": [
    {
      "id": 10,
      "title": "School Closed Tomorrow",
      "content": "Due to heavy rain...",
      "announcement_type": "urgent",
      "target_audience": "all",
      "priority": "high",
      "is_published": true,
      "created_at": "2025-11-01T08:00:00Z"
    }
  ]
}
```

---

### 2. Create Announcement
```http
POST /announcement-enhanced/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "School Closed Tomorrow",
  "content": "Due to heavy rain, school will remain closed tomorrow.",
  "announcement_type": "urgent",
  "target_audience": "all",
  "priority": "high",
  "is_published": false
}
```

**Response:** `201 Created`

**Announcement Types:**
- `general`, `urgent`, `event`, `holiday`, `exam`, `fee`

**Target Audiences:**
- `all`, `students`, `teachers`, `parents`, `staff`, `class_specific`

**Priority Levels:**
- `low`, `medium`, `high`

---

### 3. Publish Announcement (Custom Action)
```http
POST /announcement-enhanced/{id}/publish/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Announcement published",
  "notifications_sent": 250
}
```

**Note:** Publishing automatically sends notifications to all users in the target audience.

---

### 4. Unpublish Announcement (Custom Action)
```http
POST /announcement-enhanced/{id}/unpublish/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Announcement unpublished"
}
```

---

### 5. Get My Announcements (Custom Action)
```http
GET /announcement-enhanced/my_announcements/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "announcements": [
    {
      "id": 10,
      "title": "School Closed Tomorrow",
      "content": "Due to heavy rain...",
      "announcement_type": "urgent",
      "priority": "high",
      "created_at": "2025-11-01T08:00:00Z"
    }
  ]
}
```

**Note:** Returns only announcements relevant to the current user's role.

---

### 6. Get Announcement Statistics (Custom Action)
```http
GET /announcement-enhanced/statistics/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "total": 150,
  "published": 120,
  "draft": 30,
  "by_type": {
    "general": 50,
    "urgent": 20,
    "event": 30,
    "holiday": 15,
    "exam": 25,
    "fee": 10
  },
  "by_target": {
    "all": 40,
    "students": 35,
    "teachers": 20,
    "parents": 30,
    "staff": 15,
    "class_specific": 10
  },
  "recent_count": 12
}
```

---

## 🔔 Notifications

### Base Endpoint: `/notification-enhanced/`

### 1. List Notifications
```http
GET /notification-enhanced/
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters:**
- `?is_read=false` - Unread only
- `?priority=high` - High priority only
- `?notification_type=warning` - Warnings only

**Response:** `200 OK`
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "title": "📝 New Assignment",
      "message": "Math homework due Nov 15",
      "notification_type": "info",
      "priority": "high",
      "is_read": false,
      "reference_type": "assignment",
      "reference_id": 123,
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

**Notification Types:**
- `info`, `success`, `warning`, `error`

**Priority Levels:**
- `low`, `medium`, `high`

**Reference Types:**
- `assignment`, `grade`, `event`, `announcement`, `message`

---

### 2. Mark Notification as Read (Custom Action)
```http
POST /notification-enhanced/{id}/mark_as_read/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

---

### 3. Mark All as Read (Custom Action)
```http
POST /notification-enhanced/mark_all_as_read/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "updated_count": 15,
  "message": "All notifications marked as read"
}
```

---

### 4. Get Unread Count (Custom Action)
```http
GET /notification-enhanced/unread_count/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "unread_count": 8
}
```

---

### 5. Clear All Notifications (Custom Action)
```http
DELETE /notification-enhanced/clear_all/
Authorization: Bearer {JWT_TOKEN}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "deleted_count": 25,
  "message": "All notifications cleared"
}
```

---

### 6. Send Custom Notification (Admin Only) (Custom Action)
```http
POST /notification-enhanced/send_notification/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "user_ids": [10, 15, 20],
  "title": "System Maintenance",
  "message": "The system will be down for maintenance tonight",
  "notification_type": "warning",
  "priority": "high"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "notifications_sent": 3,
  "message": "Notifications sent successfully"
}
```

**Note:** Only admins can use this endpoint.

---

## 🔌 WebSocket API

### 1. Chat WebSocket

**Endpoint:** `ws://localhost:8000/ws/chat/{room_id}/?token={JWT_TOKEN}`

**Connect:**
```javascript
const chatWs = new WebSocket(
  'ws://localhost:8000/ws/chat/room123/?token=YOUR_JWT_TOKEN'
);
```

**Connection Established:**
```json
{
  "type": "connection_established",
  "message": "Connected to chat",
  "room": "chat_1_5"
}
```

**Send Message:**
```javascript
chatWs.send(JSON.stringify({
  type: 'message',
  message: 'Hello!'
}));
```

**Receive Message:**
```json
{
  "type": "message",
  "message": "Hello!",
  "message_id": 123,
  "user_id": 10,
  "username": "John Teacher",
  "timestamp": "2025-11-01T10:00:00Z"
}
```

**Send Typing Indicator:**
```javascript
chatWs.send(JSON.stringify({
  type: 'typing',
  is_typing: true
}));
```

**Receive Typing Indicator:**
```json
{
  "type": "typing",
  "user_id": 10,
  "username": "John Teacher",
  "is_typing": true
}
```

**User Joined:**
```json
{
  "type": "user_joined",
  "user_id": 10,
  "username": "John Teacher"
}
```

**User Left:**
```json
{
  "type": "user_left",
  "user_id": 10,
  "username": "John Teacher"
}
```

---

### 2. Notification WebSocket

**Endpoint:** `ws://localhost:8000/ws/notifications/?token={JWT_TOKEN}`

**Connect:**
```javascript
const notificationWs = new WebSocket(
  'ws://localhost:8000/ws/notifications/?token=YOUR_JWT_TOKEN'
);
```

**Connection Established:**
```json
{
  "type": "connection_established",
  "message": "Connected to notifications",
  "unread_count": 5
}
```

**Receive Notification:**
```json
{
  "type": "new_notification",
  "notification": {
    "id": 123,
    "title": "📝 New Assignment",
    "message": "Math homework due Nov 15",
    "notification_type": "info",
    "priority": "high",
    "created_at": "2025-11-01T10:00:00Z"
  }
}
```

**Mark as Read via WebSocket:**
```javascript
notificationWs.send(JSON.stringify({
  action: 'mark_as_read',
  notification_id: 123
}));
```

**Response:**
```json
{
  "type": "notification_marked_read",
  "notification_id": 123
}
```

**Mark All as Read via WebSocket:**
```javascript
notificationWs.send(JSON.stringify({
  action: 'mark_all_as_read'
}));
```

**Response:**
```json
{
  "type": "all_notifications_marked_read",
  "count": 5
}
```

**Get Unread Count via WebSocket:**
```javascript
notificationWs.send(JSON.stringify({
  action: 'get_unread_count'
}));
```

**Response:**
```json
{
  "type": "unread_count",
  "count": 5
}
```

---

## 🔒 Authentication

### Get JWT Token
```http
POST /api/token/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
```http
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Use Token in Requests
```http
GET /api/admin/notification-enhanced/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "details": {
    "recipients": ["This field is required."]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## 📊 Rate Limiting

**Email Sending:** 10 emails/hour per user  
**SMS Sending:** 5 SMS/hour per user  
**API Requests:** 1000 requests/hour per user

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1635724800
```

---

## 🎯 Quick Reference

### All Endpoints Summary

**Email Templates (8 endpoints):**
- `GET /email-template-enhanced/` - List
- `POST /email-template-enhanced/` - Create
- `GET /email-template-enhanced/{id}/` - Details
- `PUT /email-template-enhanced/{id}/` - Update
- `DELETE /email-template-enhanced/{id}/` - Delete
- `POST /email-template-enhanced/{id}/preview/` - Preview
- `POST /email-template-enhanced/{id}/send_email/` - Send
- `GET /email-template-enhanced/list_variables/` - Variables

**SMS Templates (4 endpoints):**
- `GET /sms-template-enhanced/` - List
- `POST /sms-template-enhanced/` - Create
- `GET /sms-template-enhanced/{id}/` - Details
- `POST /sms-template-enhanced/{id}/send_sms/` - Send

**Communication Logs (2 endpoints):**
- `GET /communication-log-enhanced/` - List
- `GET /communication-log-enhanced/statistics/` - Statistics

**Chat System (8 endpoints):**
- `POST /chat-system-enhanced/send_invitation/` - Send invitation
- `POST /chat-system-enhanced/accept_invitation/` - Accept
- `POST /chat-system-enhanced/reject_invitation/` - Reject
- `GET /chat-system-enhanced/chat_list/` - Chat list
- `GET /chat-system-enhanced/pending_invitations/` - Pending
- `POST /chat-system-enhanced/block_user/` - Block
- `POST /chat-system-enhanced/unblock_user/` - Unblock
- `GET /chat-system-enhanced/blocked_users_list/` - Blocked list

**Announcements (9 endpoints):**
- `GET /announcement-enhanced/` - List
- `POST /announcement-enhanced/` - Create
- `GET /announcement-enhanced/{id}/` - Details
- `PUT /announcement-enhanced/{id}/` - Update
- `DELETE /announcement-enhanced/{id}/` - Delete
- `POST /announcement-enhanced/{id}/publish/` - Publish
- `POST /announcement-enhanced/{id}/unpublish/` - Unpublish
- `GET /announcement-enhanced/my_announcements/` - My announcements
- `GET /announcement-enhanced/statistics/` - Statistics

**Notifications (7 endpoints):**
- `GET /notification-enhanced/` - List
- `GET /notification-enhanced/{id}/` - Details
- `POST /notification-enhanced/{id}/mark_as_read/` - Mark read
- `POST /notification-enhanced/mark_all_as_read/` - Mark all read
- `GET /notification-enhanced/unread_count/` - Unread count
- `DELETE /notification-enhanced/clear_all/` - Clear all
- `POST /notification-enhanced/send_notification/` - Send (admin)

**WebSocket (2 connections):**
- `ws://localhost:8000/ws/chat/{room_id}/?token={JWT}` - Chat
- `ws://localhost:8000/ws/notifications/?token={JWT}` - Notifications

**Total:** 38 endpoints

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Status:** ✅ Complete
