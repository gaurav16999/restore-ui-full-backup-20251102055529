# Phase 4 Module 1 - Quick Testing Guide

## 🚀 Start Everything

### Terminal 1: Start Backend
```bash
cd "C:\Users\Gauravkc\Desktop\New folder (7)\gleam-education-main\backend"
.\.venv\Scripts\Activate.ps1
python manage.py runserver 8000
```

### Terminal 2: Start Frontend
```bash
cd "C:\Users\Gauravkc\Desktop\New folder (7)\gleam-education-main"
npm run dev
```

## 📍 Access the Pages

Once both servers are running, open your browser:

### Main Advanced Reports Dashboard
**URL:** http://localhost:5173/admin/reports/advanced

**What to test:**
1. Student Performance Tab:
   - Select a student
   - Choose period (month/semester/year)
   - Click "Generate Report"
   - Verify summary cards display correctly
   - Check subject performance table
   - Review exam results
   - Check assignment completion

2. Class Analytics Tab:
   - Select a class
   - Click "Analyze Class"
   - Verify class statistics
   - Check grade distribution
   - Review top performers list
   - Check subject-wise breakdown

### Attendance Reports
**URL:** http://localhost:5173/admin/reports/advanced/attendance

**What to test:**
1. Select "Student Attendance"
   - Choose date range
   - Select a student (optional)
   - Generate report
   - Verify attendance summary

2. Select "Class Attendance"
   - Choose date range
   - Select a class (optional)
   - Generate report
   - Check daily breakdown table

3. Select "Staff Attendance"
   - Choose date range
   - Select a teacher
   - Generate report
   - Verify attendance data

### Fee Collection Reports
**URL:** http://localhost:5173/admin/reports/advanced/fees

**What to test:**
1. Select "Today" (daily)
   - Generate report
   - Check summary cards
   - Review payment methods

2. Select "This Month" (monthly)
   - Generate report
   - Check collection progress
   - Review daily collection table

3. Select "This Year" (yearly)
   - Generate report
   - Verify annual statistics

## ✅ What Should Work

### All Pages
- ✅ Page loads without errors
- ✅ Navigation works
- ✅ Dropdowns populate with data
- ✅ Date pickers work (calendar popup)
- ✅ Generate/Analyze buttons work
- ✅ Loading states show during API calls
- ✅ Toast notifications appear (success/error)
- ✅ Tables display data correctly
- ✅ Cards show statistics
- ✅ Color coding applies correctly
- ✅ Print button opens print dialog

### API Integration
- ✅ Student list loads from `/api/admin/students/`
- ✅ Class list loads from `/api/admin/classrooms/`
- ✅ Reports fetch from advanced-reports endpoints
- ✅ Error messages display for failed requests

### UI/UX
- ✅ Responsive layout (works on mobile)
- ✅ Icons display correctly
- ✅ Badges show with proper colors
- ✅ Progress bars animate
- ✅ Tables are scrollable if needed
- ✅ Date formatting is correct (dd/mm/yyyy)
- ✅ Currency formatting is correct (₹)

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors
**Solution:** Restart VS Code or TypeScript server
```bash
# In VS Code: Press Ctrl+Shift+P
# Type: "TypeScript: Restart TS Server"
```

### Issue: API returns 404 or 500
**Solution:** Ensure Django backend is running on port 8000
```bash
# Check if server is running
curl http://localhost:8000/api/admin/advanced-reports/student_performance/
```

### Issue: No data in dropdowns
**Solution:** 
1. Check if you're logged in
2. Verify you have students/classes in database
3. Check browser console for errors

### Issue: Date pickers not working
**Solution:** Dependencies should be installed
```bash
npm install date-fns react-day-picker @radix-ui/react-popover
```

### Issue: Charts not showing
**Solution:** Charts are not implemented yet (optional future enhancement)
- Tables and statistics work fine without charts

## 📊 Expected Data

### For Student Performance Report
You need:
- At least 1 student enrolled
- At least 1 grade/exam result
- At least 1 attendance record
- At least 1 assignment

### For Class Analytics
You need:
- At least 1 class with students
- At least 1 grade/exam result for the class
- Multiple students for meaningful analytics

### For Attendance Reports
You need:
- Attendance records in the date range
- For student: student_id parameter
- For class: class_id parameter
- For staff: teacher_id parameter

### For Fee Reports
You need:
- Fee payment records
- Fee structure configured
- At least one transaction in the period

## 🎯 Quick Feature Demo

### Demo Scenario 1: Student Report Card
1. Go to http://localhost:5173/admin/reports/advanced
2. Student Performance tab should be active
3. Select "John Doe" (or first student)
4. Select period "This Year"
5. Click "Generate Report"
6. **Expected:** 
   - See overall average (e.g., 78.5%)
   - See class rank (e.g., #5 of 30)
   - See subject table with grades
   - See attendance 90%+

### Demo Scenario 2: Class Analysis
1. Go to http://localhost:5173/admin/reports/advanced
2. Click "Class Analytics" tab
3. Select "Class 10-A" (or first class)
4. Click "Analyze Class"
5. **Expected:**
   - See class average (e.g., 72%)
   - See grade distribution (excellent: 5, good: 15, etc.)
   - See top 10 students list
   - See subject-wise performance

### Demo Scenario 3: Monthly Attendance
1. Go to http://localhost:5173/admin/reports/advanced/attendance
2. Select "Class Attendance"
3. Pick date range: Start = 1st of month, End = today
4. Select a class
5. Click "Generate Report"
6. **Expected:**
   - See daily breakdown table
   - See attendance percentages by day
   - See overall class attendance rate

### Demo Scenario 4: Fee Collection
1. Go to http://localhost:5173/admin/reports/advanced/fees
2. Select "This Month"
3. Click "Generate Report"
4. **Expected:**
   - See total collected amount (₹)
   - See pending amount
   - See collection rate %
   - See payment methods (Cash, Card, Online)
   - See daily collection table

## 🎨 Visual Guide

### Color Meanings
- 🟢 **Green**: Excellent (90%+), Collected amounts
- 🔵 **Blue**: Good (75-89%), General info
- 🟡 **Yellow**: Average (60-74%), Warnings
- 🔴 **Red**: Poor (<60%), Pending amounts, Alerts

### Icons Used
- 📊 **BarChart**: Analytics, Reports
- 📈 **TrendingUp**: Performance, Growth
- 👥 **Users**: Students, Classes
- 💰 **DollarSign**: Fees, Payments
- 📅 **Calendar**: Dates, Attendance
- 🏆 **Award**: Top performers, Achievements
- ⚠️ **AlertCircle**: Warnings, Alerts
- 🔄 **RefreshCw**: Loading, Refresh
- 💳 **CreditCard**: Payment methods

## ✨ Pro Tips

1. **Use keyboard shortcuts:**
   - Tab to navigate between fields
   - Enter to submit forms

2. **Print reports:**
   - Click "Print Report" button
   - Or press Ctrl+P

3. **Export (coming soon):**
   - Export buttons are placeholders
   - PDF/Excel export to be implemented

4. **Responsive testing:**
   - Resize browser window
   - Test on mobile device
   - All layouts are responsive

5. **Data filtering:**
   - Use period selector for different timeframes
   - Combine filters for specific reports
   - Date ranges can be customized

## 📞 Need Help?

### Check These First
1. ✅ Backend running on port 8000?
2. ✅ Frontend running on port 5173?
3. ✅ Logged in as admin?
4. ✅ Database has test data?
5. ✅ Browser console shows no errors?

### Common Solutions
- **White screen:** Check browser console for errors
- **No data:** Add test data to database
- **API errors:** Check Django server logs
- **Styling issues:** Clear browser cache
- **TypeScript errors:** Restart VS Code

## 🎉 Success Indicators

When everything works, you should see:
- ✅ Pages load in <2 seconds
- ✅ No console errors
- ✅ Data displays correctly
- ✅ Filters work smoothly
- ✅ Colors and badges show properly
- ✅ Tables are sortable/scrollable
- ✅ Toast notifications appear
- ✅ Loading indicators show briefly

---

**Ready to test? Start both servers and navigate to the pages!** 🚀
