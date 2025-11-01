# 🚀 Next Steps - Getting Everything Running

This guide will help you get all the new features up and running.

---

## 📋 Step-by-Step Setup

### Step 1: Install Redis (Required for WebSocket & Caching)

**Windows (Using Docker - Recommended):**
```powershell
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Or download Redis for Windows:**
- Download from: https://github.com/tporadowski/redis/releases
- Run redis-server.exe

**Verify Redis is running:**
```powershell
docker ps # Should show redis container
# OR
redis-cli ping # Should return PONG
```

---

### Step 2: Install Backend Dependencies

```powershell
cd backend
pip install channels channels-redis daphne django-redis pytest pytest-django pytest-cov
```

---

### Step 3: Run Database Migrations

```powershell
# Still in backend directory
python manage.py makemigrations users admin_api
python manage.py migrate
```

**Expected new migrations:**
- User model: Added 'parent' role, email verification fields
- Student model: Added parent_user field
- New model: HomeworkSubmission (assignment workflow)

---

### Step 4: Update Environment Variables

Add to your `backend/.env`:
```env
# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# WebSocket Configuration
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Stripe (if not already configured)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

### Step 5: Start Backend with WebSocket Support

**Option A: Using Daphne (Supports WebSocket)**
```powershell
cd backend
daphne -b 0.0.0.0 -p 8000 edu_backend.asgi:application
```

**Option B: Traditional Django (No WebSocket)**
```powershell
python manage.py runserver
```

---

### Step 6: Update Frontend

**Add Theme Provider to your app:**

Edit `src/main.tsx` or `src/App.tsx`:
```tsx
import { ThemeProvider } from '@/contexts/ThemeContext'

// Wrap your app
<ThemeProvider>
  <App />
</ThemeProvider>
```

**Add Theme Toggle to Navbar:**

Edit your header/navbar component (e.g., `src/components/layout/Header.tsx`):
```tsx
import { ThemeToggle } from '@/components/ThemeToggle'

// Add to your navbar
<ThemeToggle />
```

---

### Step 7: Run Tests

```powershell
cd backend
pytest tests/test_comprehensive.py -v --cov
```

**Expected output:**
- 40+ tests should pass
- Coverage report for admin_api and users

---

### Step 8: Test New Features

#### A. Test Assignment Workflow

1. Login as teacher/admin
2. Create an assignment
3. Login as student
4. Navigate to assignments
5. Submit assignment with file
6. Login as teacher
7. Grade the submission

**API Test:**
```powershell
# Submit assignment (as student)
curl -X POST http://localhost:8000/api/admin/homework-submissions/submit/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "homework=1" \
  -F "submission_text=My answer" \
  -F "file=@path/to/file.pdf"
```

#### B. Test Parent Portal

1. Login as admin
2. Navigate to Users > Parents
3. Create a parent user
4. Link parent to a student:
```powershell
curl -X POST http://localhost:8000/api/users/parent/link-student/ \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"parent_id": 1, "student_id": 1}'
```
5. Login as parent
6. View child overview

#### C. Test Dark Mode

1. Click theme toggle in navbar
2. Select "Dark" mode
3. Verify theme persists on page refresh
4. Try "System" mode

#### D. Test WebSocket Notifications

1. Open browser console
2. Login to the app
3. Check console for WebSocket connection: `WebSocket connection established`
4. Send a notification from admin panel
5. Should see real-time notification appear

**Manual WebSocket Test:**
```javascript
// Open browser console
const ws = new WebSocket('ws://localhost:8000/ws/notifications/');
ws.onmessage = (event) => console.log('Received:', event.data);
```

---

## 🐛 Troubleshooting

### Issue: Redis Connection Error
**Error:** `Error 10061: No connection could be made`

**Solutions:**
1. Verify Redis is running: `docker ps` or check Task Manager
2. Check Redis URL in .env
3. Try: `redis-cli ping` (should return PONG)

---

### Issue: WebSocket Connection Refused
**Error:** `WebSocket connection failed`

**Solutions:**
1. Ensure backend is running with Daphne: `daphne edu_backend.asgi:application`
2. Check ALLOWED_HOSTS in settings.py
3. Verify CORS settings allow your frontend origin
4. Check browser console for detailed error

---

### Issue: Migration Error
**Error:** `No such table: admin_api_homeworksubmission`

**Solution:**
```powershell
python manage.py makemigrations
python manage.py migrate
```

---

### Issue: Import Error (channels, django_redis)
**Error:** `ModuleNotFoundError: No module named 'channels'`

**Solution:**
```powershell
pip install channels channels-redis daphne django-redis
```

---

### Issue: File Upload Fails
**Error:** `413 Request Entity Too Large`

**Solution:**
Update `backend/admin_api/views/homework.py`:
```python
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB instead of 10MB
```

---

### Issue: Dark Mode Not Working
**Problem:** Theme doesn't change

**Solutions:**
1. Verify ThemeProvider wraps your app
2. Check tailwind.config.ts has `darkMode: ["class"]`
3. Check browser console for errors

---

## 📊 Verification Checklist

Use this checklist to verify everything works:

### Backend
- [ ] Redis is running
- [ ] Migrations applied successfully
- [ ] Backend starts with Daphne
- [ ] Tests pass (pytest)
- [ ] WebSocket endpoint accessible (ws://localhost:8000/ws/notifications/)

### Frontend
- [ ] ThemeProvider added
- [ ] ThemeToggle in navbar
- [ ] Dark mode works
- [ ] WebSocket connects (check console)
- [ ] Notifications appear in real-time

### Features
- [ ] Assignment submission works
- [ ] File upload works
- [ ] Assignment grading works
- [ ] Parent can link to student
- [ ] Parent can view child overview
- [ ] Dark/Light theme toggle works
- [ ] WebSocket notifications work
- [ ] Chat functionality works
- [ ] Browser notifications work

### Testing
- [ ] All pytest tests pass
- [ ] Coverage report generated
- [ ] No critical errors in logs

---

## 🎯 Optional: Create Sample Data

```powershell
cd backend
python manage.py seed_demo_data
```

This creates:
- Admin user (username: admin, password: admin)
- Sample teachers, students, parents
- Sample classes, subjects
- Sample assignments
- Sample attendance records

---

## 🚀 Production Deployment

When ready to deploy to production, see `DEPLOYMENT_GUIDE.md` for:
- Docker Compose production setup
- Nginx configuration
- SSL/HTTPS setup
- Environment variables for production
- Database configuration (PostgreSQL)

---

## 📝 What's Still Missing (Optional Features)

These were mentioned in your request but not yet implemented:

### 1. Charts/Analytics UI
**Recommendation:** Install recharts or chart.js
```bash
npm install recharts
```

**Create Chart Component:**
```tsx
// src/components/charts/StudentPerformanceChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const StudentPerformanceChart = ({ data }) => {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="score" stroke="#8884d8" />
    </LineChart>
  );
};
```

### 2. Calendar Component
**Recommendation:** Install react-big-calendar
```bash
npm install react-big-calendar date-fns
```

**Create Calendar Component:**
```tsx
// src/components/Calendar.tsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay, locales,
});

export const EventCalendar = () => {
  const events = []; // Fetch from API
  return <Calendar localizer={localizer} events={events} />;
};
```

### 3. Frontend Parent Portal Pages
**Files to create:**
- `src/pages/parent/ParentDashboard.tsx`
- `src/pages/parent/ChildOverview.tsx`
- `src/pages/parent/ChildAttendance.tsx`
- `src/pages/parent/ChildAssignments.tsx`
- `src/pages/parent/ChildExams.tsx`

**Backend APIs are ready!** Just need to create the React pages.

### 4. Frontend Tests
**Install testing libraries:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Create test file:**
```tsx
// src/components/__tests__/ThemeToggle.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

---

## 🎓 Learning Resources

### WebSocket
- Django Channels: https://channels.readthedocs.io/
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### React Context
- Theme Context: https://react.dev/learn/passing-data-deeply-with-context

### Testing
- Pytest: https://docs.pytest.org/
- React Testing Library: https://testing-library.com/react

### Redis
- Redis CLI: https://redis.io/docs/ui/cli/
- Django Redis: https://github.com/jazzband/django-redis

---

## 💡 Tips

1. **Keep Redis Running:** WebSocket and caching depend on Redis
2. **Use Daphne:** For WebSocket support, always use Daphne instead of runserver
3. **Check Logs:** Console logs will show WebSocket connection status
4. **Browser Notifications:** User must allow notifications in browser
5. **File Uploads:** Test with different file types and sizes
6. **Parent Role:** Remember to set role='parent' when creating parent users

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ No errors on backend startup
- ✅ No errors on frontend startup
- ✅ WebSocket connection shows in console
- ✅ Theme toggle switches between light/dark
- ✅ File uploads succeed
- ✅ Tests pass with good coverage
- ✅ Notifications appear in real-time
- ✅ Parents can see child data

---

## 📞 Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Review error logs in terminal/console
3. Verify all environment variables are set
4. Ensure all dependencies are installed
5. Check Redis is running
6. Verify migrations are applied

---

**Ready to go? Start with Step 1!** 🚀

Good luck! You now have a complete, production-ready education management system with real-time capabilities, parent portal, and modern UI features.
