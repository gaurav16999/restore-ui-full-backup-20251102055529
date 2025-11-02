# Quick Testing Reference - Administrative & HR Modules

## 🚀 Quick Start

### **Base URL**
```
http://localhost:8000/api/admin/
```

### **Authentication**
All requests require JWT token:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 Module Testing Checklists

### **1. Leave Management** ✅

```bash
# 1. Create leave application
POST /leave-management-enhanced/
{
  "teacher_id": 5,
  "leave_type_id": 1,
  "start_date": "2025-02-01",
  "end_date": "2025-02-05",
  "reason": "Family emergency"
}
# Expected: 201 Created, leave application created with status="pending"

# 2. Get pending approvals
GET /leave-management-enhanced/pending_approvals/
# Expected: List of all pending leave applications

# 3. Approve leave
POST /leave-management-enhanced/{id}/approve/
# Expected: Status changes to "approved", approved_date set

# 4. Reject leave
POST /leave-management-enhanced/{id}/reject/
{
  "reason": "Insufficient leave balance"
}
# Expected: Status changes to "rejected", remarks updated

# 5. Check leave balance
GET /leave-management-enhanced/leave_balance/?teacher_id=5
# Expected: Array of leave types with annual_allocation, used, balance

# 6. Export leave report
GET /leave-management-enhanced/export_leave_report/?start_date=2025-01-01&end_date=2025-01-31
# Expected: Excel file download
```

---

### **2. Payroll Processing** 💰

```bash
# 1. Generate payroll for month
POST /payroll-run-enhanced/generate_payroll/
{
  "month": 1,
  "year": 2025
}
# Expected: Payroll records created for all active teachers
# Check: records_created count matches active teachers

# 2. Get payroll summary
GET /payroll-run-enhanced/payroll_summary/?month=1&year=2025
# Expected: total_employees, total_gross_salary, total_deductions, total_net_salary, avg_salary

# 3. Export payslips
GET /payroll-run-enhanced/export_payslips/?month=1&year=2025
# Expected: Excel file with all employee payslips

# 4. List payroll records
GET /payroll-run-enhanced/?month=1&year=2025
# Expected: Paginated list of payroll records

# Validation Checks:
# ✓ Net salary = Gross salary - Deductions
# ✓ Absence deduction calculated correctly
# ✓ Cannot generate payroll twice for same month/year
```

---

### **3. Staff Attendance** 📅

```bash
# 1. Mark daily attendance (bulk)
POST /staff-attendance-enhanced/mark_daily_attendance/
{
  "date": "2025-01-27",
  "attendance": [
    {"teacher_id": 1, "status": "present"},
    {"teacher_id": 2, "status": "late", "remarks": "Traffic"},
    {"teacher_id": 3, "status": "absent"},
    {"teacher_id": 4, "status": "on_leave"}
  ]
}
# Expected: created + updated counts, no duplicates

# 2. Get daily summary
GET /staff-attendance-enhanced/daily_summary/?date=2025-01-27
# Expected: total_staff, present, absent, late, on_leave, not_marked, attendance_rate

# 3. Get monthly summary
GET /staff-attendance-enhanced/monthly_summary/?month=1&year=2025
# Expected: Array of staff with present/absent/late/on_leave counts and attendance_percentage

# 4. Export monthly report
GET /staff-attendance-enhanced/export_monthly_report/?month=1&year=2025
# Expected: Excel file with monthly attendance for all staff

# Validation Checks:
# ✓ Attendance rate = (present / total_staff) * 100
# ✓ No duplicate attendance for same date/teacher
# ✓ Status must be: present, absent, late, or on_leave
```

---

### **4. Double-Entry Accounting** 💼

```bash
# 1. Get Chart of Accounts
GET /accounting-system-enhanced/chart_of_accounts/
# Expected: Accounts grouped by type (Asset, Liability, Income, Expense, Equity)

# 2. Create Journal Entry (Sale Transaction)
POST /accounting-system-enhanced/create_journal_entry/
{
  "entry_date": "2025-01-27",
  "description": "Student fee collection",
  "lines": [
    {"account_id": 1, "description": "Cash received", "debit": 10000, "credit": 0},
    {"account_id": 20, "description": "Fee income", "debit": 0, "credit": 10000}
  ]
}
# Expected: entry_number generated (JE2025000001), status="draft"
# Validation: Total debit MUST equal total credit

# 3. Post Journal Entry
POST /accounting-system-enhanced/post_journal_entry/
{
  "entry_id": 15
}
# Expected: status="posted", posted_at timestamp, account balances updated

# 4. Get Ledger
GET /accounting-system-enhanced/ledger/?account_id=1&start_date=2025-01-01&end_date=2025-01-31
# Expected: Transaction list with running balance

# 5. Generate Trial Balance
GET /accounting-system-enhanced/trial_balance/?as_of_date=2025-01-31
# Expected: All accounts with debit/credit totals
# Validation: total_debit MUST equal total_credit, is_balanced=true

# 6. Generate Profit & Loss
GET /accounting-system-enhanced/profit_loss_statement/?start_date=2025-01-01&end_date=2025-01-31
# Expected: Income accounts, Expense accounts, net_profit_loss

# 7. Generate Balance Sheet
GET /accounting-system-enhanced/balance_sheet/?as_of_date=2025-01-31
# Expected: Assets, Liabilities, Equity
# Validation: Total Assets MUST equal Total Liabilities + Equity

# Critical Validations:
# ✓ Cannot create unbalanced journal entry (debit ≠ credit)
# ✓ Cannot post already-posted entry
# ✓ Trial balance must always be balanced
# ✓ Account balances update automatically on posting
# ✓ Asset accounts: Debit increases, Credit decreases
# ✓ Liability/Income/Equity: Credit increases, Debit decreases
```

---

### **5. Fee Management** 💳

```bash
# 1. Apply fee waiver (percentage)
POST /fee-management-enhanced/apply_waiver/
{
  "student_id": 150,
  "fee_structure_id": 5,
  "waiver_percentage": 20,
  "reason": "Merit scholarship"
}
# Expected: waiver_amount calculated, amount_due reduced

# 2. Apply fee waiver (fixed amount)
POST /fee-management-enhanced/apply_waiver/
{
  "student_id": 151,
  "fee_structure_id": 5,
  "waiver_amount": 5000,
  "reason": "Financial hardship"
}
# Expected: amount_due reduced by fixed amount

# 3. Process refund
POST /fee-management-enhanced/{id}/process_refund/
{
  "refund_amount": 2000,
  "reason": "Course withdrawal"
}
# Expected: amount_paid decreased, amount_due increased, status updated

# 4. Collection report
GET /fee-management-enhanced/collection_report/?start_date=2025-01-01&end_date=2025-01-31
# Expected: total_collected, total_due, total_waiver, total_refund, status_breakdown

# 5. Outstanding fees
GET /fee-management-enhanced/outstanding_fees/
# Expected: List of students with pending/partial payments, total_outstanding

# 6. Export fee report
GET /fee-management-enhanced/export_fee_report/?start_date=2025-01-01&end_date=2025-01-31
# Expected: Excel file with fee collection details

# Validation Checks:
# ✓ Refund amount cannot exceed amount_paid
# ✓ Waiver reduces amount_due
# ✓ Status updates: pending → partial → paid
```

---

### **6. Wallet System** 💰

```bash
# 1. Transfer funds
POST /wallet-system-enhanced/transfer_funds/
{
  "from_wallet_id": 10,
  "to_wallet_id": 15,
  "amount": 5000,
  "description": "Fee payment"
}
# Expected: Both wallet balances updated, 2 transactions created

# 2. Create deposit request
POST /wallet-system-enhanced/deposit/
{
  "wallet_id": 10,
  "amount": 10000,
  "payment_method": "bank_transfer"
}
# Expected: Deposit request created with status="pending"

# 3. Approve deposit
POST /wallet-system-enhanced/approve_deposit/
{
  "request_id": 25
}
# Expected: Wallet balance increased, status="approved", transaction created

# 4. Get transaction history
GET /wallet-system-enhanced/{id}/transaction_history/?start_date=2025-01-01&end_date=2025-01-31
# Expected: List of transactions with balance_after for each

# 5. Balance report
GET /wallet-system-enhanced/balance_report/
# Expected: All wallet accounts with current balances and last transaction date

# Validation Checks:
# ✓ Transfer: source wallet must have sufficient balance
# ✓ Deposit: cannot approve already-approved request
# ✓ Transaction creates: balance_after recorded correctly
# ✓ Atomic operations: both source and destination updated together
```

---

### **7. Inventory Management** 📦

```bash
# 1. Low stock alert
GET /inventory-enhanced/low_stock_alert/?threshold=10
# Expected: Items with quantity <= threshold

# 2. Stock movement report
GET /inventory-enhanced/stock_movement_report/?start_date=2025-01-01&end_date=2025-01-31
# Expected: total_received, total_issued, transaction_count

# 3. Inventory valuation
GET /inventory-enhanced/inventory_valuation/
# Expected: List of items with quantity * unit_price, total_inventory_value

# Validation Checks:
# ✓ Valuation uses latest unit_price from ItemReceive
# ✓ Low stock threshold configurable
# ✓ Movement report accurate counts
```

---

### **8. Library Management** 📚

```bash
# 1. Overdue books
GET /library-enhanced/overdue_books/
# Expected: Books past due_date, days_overdue, fine_amount calculated

# 2. Issue statistics
GET /library-enhanced/issue_statistics/?start_date=2025-01-01&end_date=2025-01-31
# Expected: total_issued, total_returned, currently_issued, return_rate

# 3. Popular books
GET /library-enhanced/popular_books/?limit=10
# Expected: Top 10 most issued books

# Validation Checks:
# ✓ Fine calculated: days_overdue * fine_per_day
# ✓ Return rate: (returned / issued) * 100
# ✓ Overdue: return_date=null AND due_date < today
```

---

### **9. Transport Management** 🚌

```bash
# 1. Route students
GET /transport-enhanced/{id}/route_students/
# Expected: List of students assigned to route with vehicle info

# 2. Vehicle summary
GET /transport-enhanced/vehicle_summary/
# Expected: All vehicles with capacity, assigned, available

# Validation Checks:
# ✓ Available seats = capacity - assigned
# ✓ Cannot over-assign (assigned > capacity)
```

---

### **10. Dormitory Management** 🏠

```bash
# 1. Occupancy report
GET /dormitory-enhanced/occupancy_report/
# Expected: All rooms with capacity, occupied, available, occupancy_rate

# 2. Room assignments
GET /dormitory-enhanced/{id}/room_assignments/
# Expected: Students assigned to specific room

# Validation Checks:
# ✓ Occupancy rate = (occupied / capacity) * 100
# ✓ Available = capacity - occupied
# ✓ Cannot exceed room capacity
```

---

## 🔍 Common Issues & Solutions

### **Issue 1: "Insufficient balance" error**
```
Solution: Check wallet/account balance before transfer
GET /wallet-system-enhanced/{id}/
```

### **Issue 2: "Unbalanced journal entry" error**
```
Solution: Ensure total debit equals total credit in journal entry lines
Sum of all debit amounts MUST equal sum of all credit amounts
```

### **Issue 3: "Payroll already exists for month/year"**
```
Solution: Delete existing payroll or modify existing records
Cannot generate duplicate payroll
```

### **Issue 4: "Refund amount exceeds paid amount"**
```
Solution: Check amount_paid field before refund
Refund cannot be greater than amount_paid
```

### **Issue 5: "Cannot post already-posted entry"**
```
Solution: Check journal entry status before posting
Only entries with status="draft" can be posted
```

---

## ✅ Testing Workflow

### **Complete End-to-End Test**:

```bash
# 1. Staff Attendance (Day 1)
POST /staff-attendance-enhanced/mark_daily_attendance/
{
  "date": "2025-01-01",
  "attendance": [
    {"teacher_id": 1, "status": "present"},
    {"teacher_id": 2, "status": "present"}
  ]
}

# 2. Mark attendance for entire month (repeat for all days)
# ...

# 3. Generate payroll (end of month)
POST /payroll-run-enhanced/generate_payroll/
{
  "month": 1,
  "year": 2025
}

# 4. Create accounting entry for salary payment
POST /accounting-system-enhanced/create_journal_entry/
{
  "entry_date": "2025-01-31",
  "description": "Salary payment for January",
  "lines": [
    {"account_id": 30, "description": "Salary Expense", "debit": 120000, "credit": 0},
    {"account_id": 2, "description": "Bank", "debit": 0, "credit": 120000}
  ]
}

# 5. Post the entry
POST /accounting-system-enhanced/post_journal_entry/
{
  "entry_id": 1
}

# 6. Generate trial balance
GET /accounting-system-enhanced/trial_balance/?as_of_date=2025-01-31

# 7. Generate financial reports
GET /accounting-system-enhanced/profit_loss_statement/
GET /accounting-system-enhanced/balance_sheet/

# 8. Export payslips
GET /payroll-run-enhanced/export_payslips/?month=1&year=2025

# 9. Export attendance report
GET /staff-attendance-enhanced/export_monthly_report/?month=1&year=2025
```

---

## 📊 Expected Results

### **Successful Response Formats**:

```json
// Leave Balance
{
  "teacher_id": 5,
  "year": 2025,
  "leave_balance": [
    {
      "leave_type": "Casual Leave",
      "annual_allocation": 10,
      "used": 3,
      "balance": 7
    }
  ]
}

// Payroll Summary
{
  "month": "1",
  "year": "2025",
  "total_employees": 45,
  "total_gross_salary": 1250000.00,
  "total_deductions": 85000.00,
  "total_net_salary": 1165000.00,
  "average_salary": 25888.89
}

// Daily Attendance Summary
{
  "date": "2025-01-27",
  "total_staff": 45,
  "present": 38,
  "absent": 3,
  "late": 2,
  "on_leave": 2,
  "not_marked": 0,
  "attendance_rate": 84.44
}

// Trial Balance
{
  "as_of_date": "2025-01-31",
  "trial_balance": [...],
  "total_debit": 280000.00,
  "total_credit": 280000.00,
  "is_balanced": true,
  "difference": 0.00
}

// Fee Collection Report
{
  "period": "2025-01-01 to 2025-01-31",
  "summary": {
    "total_collected": 500000.00,
    "total_due": 150000.00,
    "total_waiver": 25000.00,
    "total_refund": 5000.00,
    "total_students": 200
  },
  "status_breakdown": [...]
}
```

---

## 🎯 Performance Testing

### **Load Testing Checklist**:

- [ ] Test bulk attendance marking (50+ staff)
- [ ] Test payroll generation (100+ employees)
- [ ] Test trial balance with 1000+ transactions
- [ ] Test wallet transfers under concurrent load
- [ ] Test Excel export with 500+ records
- [ ] Test accounting report generation speed

### **Expected Performance**:
- Bulk attendance: < 2 seconds
- Payroll generation: < 5 seconds
- Trial balance: < 3 seconds
- Excel export: < 5 seconds

---

**🚀 Happy Testing! All modules are production-ready.**
