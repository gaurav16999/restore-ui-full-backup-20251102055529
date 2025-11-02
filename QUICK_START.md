# 🚀 QUICK START - Get Everything Running in 5 Minutes

## Prerequisites
- ✅ Python 3.14 installed
- ✅ Node.js installed
- ✅ All dependencies installed (see below)

---

## 📦 Step 1: Install Dependencies (1 minute)

```powershell
# Backend - Already done! ✅
cd backend
pip list | findstr "channels django-redis"
# If not installed:
# pip install -r requirements.txt

# Frontend
npm install
```

---

## 🐳 Step 2: Start Redis (30 seconds)

**Option A: Docker (Recommended)**
```powershell
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Option B: Windows Redis**
1. Download from: https://github.com/tporadowski/redis/releases
2. Extract and run `redis-server.exe`

**Verify Redis is running:**
```powershell
redis-cli ping
# Should return: PONG
```

---

## 🗄️ Step 3: Database is Ready (Already done!)

✅ Migrations created and applied:
- User model updated (parent role, email verification)
- Student model updated (parent_user field)
- HomeworkSubmission model created
- PaymentTransaction model created

---

## 🔧 Step 4: Start Backend (30 seconds)

**With WebSocket Support:**
```powershell
cd backend
daphne -b 0.0.0.0 -p 8000 edu_backend.asgi:application
```

**Or Without WebSocket:**
```powershell
python manage.py runserver
```

Backend will be available at: http://localhost:8000

---

## 💻 Step 5: Start Frontend (30 seconds)

```powershell
npm run dev
```

Frontend will be available at: http://localhost:8081 (or 5173)

---

## ✨ Step 6: Quick Integration (2 minutes)

### A. Add Theme Provider

Edit `src/main.tsx`:
```tsx
import { ThemeProvider } from '@/contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
```

### B. Add Theme Toggle to Navbar

Edit your header/navbar component (e.g., `src/components/layout/Header.tsx`):
```tsx
import { ThemeToggle } from '@/components/ThemeToggle'

// Add to navbar:
<div className="flex items-center gap-4">
  <ThemeToggle />
  {/* other nav items */}
</div>
```

### C. Add WebSocket Connection (Optional)

In your main layout component:
```tsx
import { useWebSocket } from '@/hooks/useWebSocket'

function Layout() {
  const { isConnected, notifications, unreadCount, markAsRead } = useWebSocket();
  
  return (
    <div>
      {/* Connection status */}
      {isConnected ? (
        <span className="text-green-500">🟢 Live</span>
      ) : (
        <span className="text-gray-500">⚪ Connecting...</span>
      )}
      
      {/* Notification badge */}
      {unreadCount > 0 && (
        <Badge>{unreadCount}</Badge>
      )}
      
      {/* Notification list */}
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Step 7: Test Features (1 minute)

### Test Dark Mode
1. Open app in browser
2. Click theme toggle (sun/moon icon)
3. Select "Dark" - page should go dark
4. Refresh - theme should persist

### Test WebSocket (if you started with Daphne)
1. Open browser console (F12)
2. Should see: `WebSocket connection established`
3. Check connection status indicator

### Test Backend API
```powershell
# Health check
curl http://localhost:8000/api/

# Should return: {"message": "API is running"}
```

---

## 📊 Verify Everything is Working

Run this checklist:

- [ ] Redis is running (`redis-cli ping` returns PONG)
- [ ] Backend is running (http://localhost:8000 loads)
- [ ] Frontend is running (http://localhost:8081 loads)
- [ ] Theme toggle works (can switch between light/dark)
- [ ] WebSocket connects (check browser console)
- [ ] No errors in terminal/console

---

## 🎯 What You Can Do Now

### For Students:
1. Login as student
2. View assignments
3. Submit assignment with file upload
4. Check grades and feedback
5. View attendance records

### For Teachers:
1. Login as teacher
2. Create assignments
3. View pending submissions
4. Grade submissions with feedback
5. View student progress

### For Parents:
1. Login as parent
2. View children's overview
3. Check attendance history
4. Monitor assignment submissions
5. View exam results
6. See announcements

### For Admins:
1. Login as admin
2. Manage all users
3. Link parents to students
4. View system statistics
5. Manage payments
6. Bulk import/export data

---

## 🔥 Advanced Features to Try

### 1. Assignment Workflow
```bash
# Submit assignment (as student)
POST /api/admin/homework-submissions/submit/
# Requires: homework (ID), submission_text, file (optional)

# Grade submission (as teacher)
POST /api/admin/homework-submissions/{id}/grade/
# Requires: marks_obtained, feedback
```

### 2. Parent Portal
```bash
# Get child overview (as parent)
GET /api/users/parent-portal/{student_id}/child_overview/
# Returns: grades, attendance, recent assignments, upcoming exams

# Link parent to student (as admin)
POST /api/users/parent/link-student/
# Requires: parent_id, student_id
```

### 3. Real-time Notifications
```javascript
// Send notification via WebSocket
ws.send(JSON.stringify({
  type: 'notification',
  message: 'New assignment posted!',
  notification_type: 'announcement'
}));
```

### 4. Caching Performance
```bash
# First request (slow - hits database)
GET /api/admin/students/

# Second request (fast - uses cache)
GET /api/admin/students/

# Check cache in Redis
redis-cli KEYS "edu:*"
```

---

## 🐛 Troubleshooting

### Redis Not Starting
```powershell
# Check if port 6379 is in use
netstat -ano | findstr :6379

# Kill process using the port
taskkill /PID <PID> /F

# Start Redis again
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### WebSocket Connection Fails
```powershell
# Make sure you're using Daphne, not runserver
cd backend
daphne -b 0.0.0.0 -p 8000 edu_backend.asgi:application

# Check ALLOWED_HOSTS in settings.py includes 'localhost'
```

### Theme Not Working
```tsx
// Make sure ThemeProvider wraps your entire app
// In main.tsx:
<ThemeProvider>
  <App />
</ThemeProvider>

// Check tailwind.config.ts has:
darkMode: ["class"]
```

### Import Errors
```powershell
cd backend
pip install -r requirements.txt

# Verify installations
pip list | findstr "channels django-redis stripe pytest"
```

---

## 📈 Performance Tips

1. **Keep Redis Running:** WebSocket and caching depend on it
2. **Use Daphne:** For WebSocket support
3. **Enable Caching:** Set REDIS_URL in .env
4. **Monitor Performance:** Use `redis-cli INFO` to check Redis stats
5. **Test Load:** Use pytest for automated testing

---

## 📚 Documentation

- **FINAL_IMPLEMENTATION_SUMMARY.md** - Complete feature overview
- **IMPLEMENTATION_STATUS.md** - Detailed status and testing
- **NEXT_STEPS.md** - Detailed setup instructions
- **DEPLOYMENT_GUIDE.md** - Production deployment guide

---

## ✅ Success Checklist

When everything is working, you should see:

- [✅] Redis: `PONG` response
- [✅] Backend: No errors in terminal
- [✅] Frontend: No errors in console
- [✅] WebSocket: `WebSocket connection established` in console
- [✅] Theme: Toggle switches between light and dark
- [✅] Tests: `pytest` passes all tests
- [✅] API: `curl http://localhost:8000/api/` returns response

---

## 🎉 You're Done!

Your system is now running with:
- ✅ Assignment submission and grading
- ✅ Parent portal with monitoring
- ✅ Dark mode theme system
- ✅ Real-time WebSocket notifications
- ✅ Comprehensive testing suite
- ✅ Redis caching for performance

**Enjoy your production-ready Education Management System!** 🚀

---

**Total Setup Time: ~5 minutes**  
**Status: ✅ READY TO USE**
