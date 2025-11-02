# 🧪 Parent Portal Testing Guide

## Quick Test Checklist

### Prerequisites
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:5173
- ✅ Database migrated and populated with test data
- ✅ Parent user created with linked children

---

## 1. Create Test Data (5 minutes)

### Step 1: Login to Django Admin
1. Navigate to http://localhost:8000/admin
2. Login with superuser credentials
3. Go to "Users" section

### Step 2: Create Parent User
1. Click "Add User"
2. Fill in:
   - Username: `parent_test`
   - Password: `TestParent123!`
   - Role: **Parent**
   - Email: `parent@test.com`
   - Email verified: ✅ Checked
3. Save

### Step 3: Create Student (Child)
1. Go to "Students" section
2. Click "Add Student"
3. Fill in:
   - Name: `John Doe`
   - Roll No: `2024001`
   - Class: Select any class
   - Parent User: Select `parent_test`
   - Is Active: ✅ Checked
4. Save
5. Repeat for second child if desired

### Step 4: Add Sample Data

**Attendance Records:**
1. Go to "Attendances"
2. Add 10-15 records for the student
3. Vary status: Present, Absent, Late, Excused
4. Use different dates in current month

**Grades:**
1. Go to "Grades"
2. Add 5-10 grades for different subjects
3. Vary percentages: 60%, 75%, 85%, 92%, etc.
4. Use different dates

**Fees:**
1. Go to "Fee Structures"
2. Add fee types: Tuition, Books, Lab, Transport
3. Set amounts and due dates
4. Link to student's class

**Messages:**
1. Go to "Messages"
2. Create teacher-to-parent messages
3. Create parent-to-teacher messages
4. Some read, some unread

---

## 2. Parent Portal Pages Testing

### 🏠 Dashboard (http://localhost:5173/parent)

**Test Cases:**
- [ ] Page loads without errors
- [ ] Shows correct number of children
- [ ] Displays child cards with stats
- [ ] View Details buttons work
- [ ] Quick actions navigate correctly
- [ ] Notifications display
- [ ] Announcements display
- [ ] Recent activities show

**Expected Results:**
- Children cards show:
  - Name and class
  - Attendance percentage with progress bar
  - Recent grades count
  - Pending fees count
  - View Details button
- Statistics cards display totals
- All navigation links work

---

### 📅 Attendance Page (http://localhost:5173/parent/attendance/:childId)

**Test Cases:**
- [ ] Calendar renders with correct month
- [ ] Month selector works
- [ ] Year selector works
- [ ] Dates are color-coded correctly
- [ ] Hover shows tooltip with details
- [ ] Statistics cards show correct data
- [ ] Recent list displays last 10 records
- [ ] Legend is visible
- [ ] Back button works
- [ ] Export button appears (placeholder)

**Color Verification:**
- Green dates = Present
- Red dates = Absent
- Yellow dates = Late
- Blue dates = Excused
- Gray dates = No data

**Statistics Check:**
- Total Days matches calendar
- Present/Absent/Late counts are correct
- Attendance rate calculation is accurate

---

### 📊 Grades Page (http://localhost:5173/parent/grades/:childId)

**Test Cases:**
- [ ] Page loads with grades
- [ ] Subject filter works
- [ ] Semester filter works
- [ ] Chart displays correctly
- [ ] Chart data points are accurate
- [ ] Grade cards display in grid
- [ ] Progress bars show correct percentage
- [ ] Color coding matches percentage
- [ ] Recent highlights show top 5
- [ ] Back button works
- [ ] Export button appears

**Chart Verification:**
- X-axis shows dates
- Y-axis shows 0-100
- Line connects all data points
- Tooltip shows grade details

**Color Verification:**
- >= 90% = Green
- >= 80% = Blue
- >= 70% = Yellow
- >= 60% = Orange
- < 60% = Red

---

### 💬 Messages Page (http://localhost:5173/parent/messages)

**Test Cases:**
- [ ] Page loads with message list
- [ ] Inbox tab shows received messages
- [ ] Sent tab shows sent messages
- [ ] Message counts in tabs are correct
- [ ] Search filters messages
- [ ] "New" badge shows on unread
- [ ] Click message opens detail dialog
- [ ] Compose button opens dialog
- [ ] Teacher dropdown populates
- [ ] Subject and content fields work
- [ ] Send button works
- [ ] Success toast appears
- [ ] Message list refreshes after send

**Compose Message Test:**
1. Click "Compose Message"
2. Select a teacher
3. Enter subject: "Test Message"
4. Enter content: "This is a test message"
5. Click "Send Message"
6. Verify success toast
7. Check message appears in "Sent" tab

---

### 💰 Fee Management Page (http://localhost:5173/parent/fees/:childId)

**Test Cases:**
- [ ] Page loads with fee data
- [ ] Summary cards show correct totals
- [ ] Fee breakdown table displays all fees
- [ ] Status badges are color-coded
- [ ] Pay Now button appears for pending
- [ ] Receipt button appears for paid
- [ ] Payment history shows paid fees
- [ ] Dates are formatted correctly
- [ ] Currency is formatted correctly
- [ ] Back button works

**Payment Flow Test (Simulated):**
1. Find a pending fee
2. Click "Pay Now"
3. Verify processing spinner appears
4. Wait for success toast
5. Verify fee status changes to "Paid"
6. Check receipt button appears
7. Verify payment history updates

**Status Verification:**
- Paid = Green with checkmark
- Pending = Red with clock
- Overdue = Red with alert
- Partial = Gray with clock

---

## 3. Mobile Responsiveness Testing

**Test on Different Screen Sizes:**

**Desktop (1920x1080):**
- [ ] 3-column grid for cards
- [ ] Full sidebar visible
- [ ] All buttons accessible
- [ ] Charts render full width

**Tablet (768x1024):**
- [ ] 2-column grid for cards
- [ ] Sidebar collapses to icon
- [ ] Touch-friendly buttons
- [ ] Tables scroll horizontally

**Mobile (375x667):**
- [ ] 1-column layout
- [ ] Cards stack vertically
- [ ] Calendar fits screen
- [ ] No horizontal scroll
- [ ] Bottom navigation visible

---

## 4. Error Handling Testing

### Backend Offline Test:
1. Stop Django backend
2. Navigate to any parent page
3. **Expected:** Error toast appears
4. **Expected:** Loading spinner disappears
5. **Expected:** Error message shows

### Empty Data Test:
1. Create parent with no children
2. Navigate to dashboard
3. **Expected:** "No children found" message
4. Remove all attendance records
5. Navigate to attendance page
6. **Expected:** "No data available" message

### Invalid Child ID Test:
1. Navigate to `/parent/attendance/99999`
2. **Expected:** 404 error or "Not found" message

---

## 5. Performance Testing

### Page Load Times (should be < 1 second):
- [ ] Dashboard: ______ ms
- [ ] Attendance: ______ ms
- [ ] Grades: ______ ms
- [ ] Messages: ______ ms
- [ ] Fees: ______ ms

### API Response Times (should be < 500ms):
- [ ] GET /parent/dashboard/
- [ ] GET /parent/children/{id}/attendance/
- [ ] GET /parent/children/{id}/grades/
- [ ] GET /parent/messages/
- [ ] GET /parent/children/{id}/fees/

### Chart Rendering:
- [ ] Grade chart renders < 200ms
- [ ] Calendar renders < 100ms
- [ ] No flickering or lag

---

## 6. Browser Compatibility

**Test on Multiple Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if on Mac)

**Features to Verify:**
- [ ] All pages load correctly
- [ ] Charts render properly
- [ ] Dialogs open and close
- [ ] Forms submit successfully
- [ ] Colors display correctly
- [ ] Icons display correctly

---

## 7. Security Testing

### Authentication Test:
1. Logout
2. Try to access `/parent` directly
3. **Expected:** Redirected to login

### Role-Based Access Test:
1. Login as Teacher
2. Try to access `/parent/dashboard`
3. **Expected:** 403 Forbidden or redirect

### Child Access Control:
1. Login as parent1
2. Get child_id of parent2's child
3. Try to access `/parent/attendance/{parent2_child_id}`
4. **Expected:** 403 or "Access denied"

---

## 8. Integration Testing

### End-to-End User Flow:
1. **Login** as parent
2. **Dashboard** - View children overview
3. **Attendance** - Check first child's attendance
4. **Grades** - Review second child's grades
5. **Messages** - Send message to teacher
6. **Fees** - Pay pending fee
7. **Dashboard** - Verify updates reflected

**All steps should complete without errors**

---

## 9. Data Validation

### Attendance Statistics Accuracy:
```
Manual Calculation:
- Total records: Count from database
- Present count: Filter status='present'
- Attendance % = (Present / Total) * 100
Compare with displayed percentage
```

### Grade Average Calculation:
```
Manual Calculation:
- Sum all grade percentages
- Divide by number of grades
Compare with displayed average
```

### Fee Summary Calculation:
```
Manual Calculation:
- Total Fees: Sum all fee amounts
- Paid: Sum where status='paid'
- Pending: Total - Paid
Compare with summary cards
```

---

## 10. Accessibility Testing

**Keyboard Navigation:**
- [ ] Tab key navigates through elements
- [ ] Enter key activates buttons
- [ ] Escape key closes dialogs
- [ ] Arrow keys work in dropdowns

**Screen Reader Compatibility:**
- [ ] All images have alt text
- [ ] Buttons have aria-labels
- [ ] Form fields have labels
- [ ] Status messages are announced

**Color Contrast:**
- [ ] Text readable on all backgrounds
- [ ] Icons clearly visible
- [ ] Hover states obvious
- [ ] Focus indicators visible

---

## Common Issues & Solutions

### Issue: "Failed to fetch" error
**Solution:** Ensure backend is running on http://localhost:8000

### Issue: 403 Forbidden
**Solution:** Verify user role is 'parent' in database

### Issue: Calendar not showing data
**Solution:** Check attendance records exist for selected month/year

### Issue: Charts not rendering
**Solution:** Verify Recharts is installed: `npm list recharts`

### Issue: Messages not sending
**Solution:** Check teacher exists and message payload is correct

---

## Success Criteria ✅

**Phase 1 is successful when:**
- [ ] All 4 pages load without errors
- [ ] All API calls return correct data
- [ ] All interactive elements work
- [ ] Mobile layout is functional
- [ ] Error handling works properly
- [ ] No console errors or warnings
- [ ] Navigation between pages is smooth
- [ ] Data displays accurately

---

## Next Phase Preview

**Phase 2 will add:**
1. Teacher Directory Page
2. Notifications Page
3. Assignments Page
4. Exam Results Page
5. Reports Page

**Phase 3 will add:**
1. Real-time chat (WebSocket)
2. Stripe payment integration
3. Dashboard visualizations
4. Mobile optimization

**Phase 4 will add:**
1. Dark mode
2. Accessibility enhancements
3. Caching with TanStack Query
4. PWA features

---

## Bug Reporting Template

If you find issues, report them with:

```
**Page:** (e.g., Attendance Page)
**Issue:** (Brief description)
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
**Actual Behavior:**
**Browser:** (Chrome/Firefox/etc.)
**Screenshot:** (if applicable)
```

---

## Test Results Summary

**Date:** _______________  
**Tester:** _______________

**Results:**
- Total Test Cases: _______
- Passed: _______
- Failed: _______
- Skipped: _______

**Overall Status:** ⭕ Pass / ⭕ Fail

**Notes:**
___________________________________
___________________________________
___________________________________

---

🎉 **Happy Testing!**

For questions or issues, refer to:
- PHASE11_PART1_COMPLETE.md
- PROJECT_README.md
- Backend API documentation at http://localhost:8000/api/docs/
