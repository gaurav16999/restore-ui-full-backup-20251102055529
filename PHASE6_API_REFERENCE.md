# Phase 6: HR Module - Quick API Reference

## 🚀 New HR Endpoints

### Base URL: `http://localhost:8000/api/admin/`

---

## 👔 Designation Management

```bash
# List all designations
GET /designations-advanced/

# Get designation hierarchy by level
GET /designations-advanced/hierarchy/
# Returns: {
#   "Level 1": [...],
#   "Level 2": [...],
#   ...
# }

# Create designation
POST /designations-advanced/
{
  "name": "Senior Manager",
  "code": "SM",
  "description": "Senior Management Position",
  "level": 2,
  "is_active": true
}
```

---

## 👨‍💼 Employee Details Management

```bash
# List employees
GET /employee-details/?employment_type=full_time&designation=5

# Search employees
GET /employee-details/?search=john

# Create employee details
POST /employee-details/
{
  "teacher_id": 10,
  "designation_id": 5,
  "employment_type": "full_time",
  "date_of_joining": "2024-01-15",
  "bank_account_number": "1234567890",
  "bank_name": "ABC Bank",
  "tax_id_number": "TAX123456",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1234567890"
}

# Get employment history
GET /employee-details/10/employment_history/
```

---

## 💰 Payroll Components

```bash
# List components
GET /payroll-components/?type=earning&is_active=true

# Get summary
GET /payroll-components/summary/
# Returns: {
#   "total_earnings_components": 5,
#   "total_deductions_components": 3,
#   "total_components": 8
# }

# Create earning component (fixed amount)
POST /payroll-components/
{
  "name": "Transport Allowance",
  "type": "earning",
  "calculation_method": "fixed",
  "amount": 500.00,
  "description": "Monthly transport allowance",
  "is_active": true
}

# Create earning component (percentage)
POST /payroll-components/
{
  "name": "House Rent Allowance",
  "type": "earning",
  "calculation_method": "percentage",
  "amount": 20.00,  # 20% of basic salary
  "is_active": true
}

# Create deduction component
POST /payroll-components/
{
  "name": "Tax Deduction",
  "type": "deduction",
  "calculation_method": "percentage",
  "amount": 10.00,  # 10% of basic salary
  "is_active": true
}
```

---

## 📊 Payroll Processing

```bash
# List payroll runs
GET /payroll-runs/?status=processed&month=11&year=2025

# Process monthly payroll (generates all payslips)
POST /payroll-runs/process_payroll/
{
  "month": 11,
  "year": 2025
}
# Returns: {
#   "message": "Payroll processed successfully for 11/2025",
#   "payroll_run_id": 123,
#   "total_employees": 50,
#   "payslips_created": 50,
#   "total_amount": 250000.00
# }

# Get payroll summary
GET /payroll-runs/123/summary/
# Returns: {
#   "month": 11,
#   "year": 2025,
#   "status": "processed",
#   "total_employees": 50,
#   "total_amount": 250000.00,
#   "paid_count": 0,
#   "pending_count": 50,
#   "processed_at": "2025-11-01T10:00:00Z",
#   "processed_by": "Admin Name"
# }

# Mark payroll as paid
POST /payroll-runs/123/mark_paid/
```

---

## 💵 Payslip Management

```bash
# List payslips
GET /payslips-advanced/?payroll_run=123&status=pending

# Filter by employee and date
GET /payslips-advanced/?employee=10&month=11&year=2025

# Download payslip PDF
GET /payslips-advanced/456/download_pdf/
# Returns: PDF file (payslip_EMP001_11_2025.pdf)

# Employee views their own payslips
GET /payslips-advanced/my_payslips/
# (Authenticated as teacher/employee)
# Returns: List of all payslips for logged-in employee
```

---

## 🏖️ Leave Management

```bash
# List leave applications
GET /leave-applications-advanced/?status=pending&employee=10

# Apply for leave
POST /leave-applications-advanced/
{
  "employee_id": 10,
  "leave_type_id": 1,
  "start_date": "2025-11-15",
  "end_date": "2025-11-17",
  "reason": "Family vacation",
  "attachment": <file>  # Optional
}
# Total days calculated automatically

# Get pending approvals (admin)
GET /leave-applications-advanced/pending_approvals/

# Approve leave
POST /leave-applications-advanced/789/approve/
{
  "admin_remarks": "Approved. Have a great trip!"
}

# Reject leave
POST /leave-applications-advanced/789/reject/
{
  "admin_remarks": "Peak season. Cannot approve at this time."
}

# Bulk approve leaves
POST /leave-applications-advanced/bulk_approve/
{
  "leave_ids": [789, 790, 791, 792]
}
# Returns: {
#   "message": "Approved 4 leave applications",
#   "approved_count": 4
# }

# Check leave balance
GET /leave-applications-advanced/leave_balance/?employee_id=10&year=2025
# Returns: {
#   "year": 2025,
#   "employee_id": 10,
#   "leave_balance": [
#     {
#       "leave_type": "Casual Leave",
#       "total_days": 12,
#       "used_days": 3,
#       "remaining_days": 9
#     },
#     {
#       "leave_type": "Sick Leave",
#       "total_days": 10,
#       "used_days": 2,
#       "remaining_days": 8
#     }
#   ]
# }

# Employee checks own leave balance
GET /leave-applications-advanced/leave_balance/
# (Uses authenticated employee's ID)
```

---

## 📅 Holiday Calendar

```bash
# List holidays
GET /holidays/?year=2025

# Filter optional holidays
GET /holidays/?is_optional=true

# Create holiday
POST /holidays/
{
  "name": "New Year",
  "date": "2025-01-01",
  "description": "New Year's Day celebration",
  "is_optional": false
}

# Get upcoming holidays
GET /holidays/upcoming/
# Returns: Next 10 upcoming holidays

# Get yearly calendar
GET /holidays/yearly_calendar/?year=2025
# Returns: {
#   "year": 2025,
#   "total_holidays": 15,
#   "calendar": {
#     "January": [
#       {
#         "id": 1,
#         "name": "New Year",
#         "date": "2025-01-01",
#         "is_optional": false
#       }
#     ],
#     "February": [...],
#     ...
#   }
# }
```

---

## 🎯 Complete Workflows

### Workflow 1: Monthly Payroll Processing

```bash
# Step 1: Setup payroll components (one-time)
POST /payroll-components/
[
  {"name": "HRA", "type": "earning", "calculation_method": "percentage", "amount": 20},
  {"name": "Tax", "type": "deduction", "calculation_method": "percentage", "amount": 10}
]

# Step 2: Process payroll
POST /payroll-runs/process_payroll/
{"month": 11, "year": 2025}

# Step 3: Review summary
GET /payroll-runs/123/summary/

# Step 4: Download payslips
GET /payslips-advanced/456/download_pdf/

# Step 5: Mark as paid
POST /payroll-runs/123/mark_paid/
```

### Workflow 2: Leave Application & Approval

```bash
# Step 1: Employee applies
POST /leave-applications-advanced/
{
  "employee_id": 10,
  "leave_type_id": 1,
  "start_date": "2025-11-15",
  "end_date": "2025-11-17",
  "reason": "Family vacation"
}

# Step 2: Admin checks pending
GET /leave-applications-advanced/pending_approvals/

# Step 3: Admin approves
POST /leave-applications-advanced/789/approve/
{"admin_remarks": "Approved"}

# Step 4: Employee checks balance
GET /leave-applications-advanced/leave_balance/
```

### Workflow 3: Employee Self-Service

```bash
# Employee views payslips
GET /payslips-advanced/my_payslips/

# Employee downloads specific payslip
GET /payslips-advanced/456/download_pdf/

# Employee checks leave balance
GET /leave-applications-advanced/leave_balance/

# Employee applies for leave
POST /leave-applications-advanced/
{
  "employee_id": <auto-detected>,
  "leave_type_id": 1,
  "start_date": "2025-11-20",
  "end_date": "2025-11-22",
  "reason": "Personal work"
}
```

---

## 📤 File Operations

### Leave attachment upload:
```bash
POST /leave-applications-advanced/
Content-Type: multipart/form-data

Form fields:
  employee_id: 10
  leave_type_id: 1
  start_date: "2025-11-15"
  end_date: "2025-11-17"
  reason: "Medical appointment"
  attachment: <medical_certificate.pdf>
```

### PDF payslip download:
```bash
GET /payslips-advanced/456/download_pdf/

Response Headers:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename=payslip_EMP001_11_2025.pdf
```

---

## 🔐 Authentication & Permissions

### Admin endpoints (require admin role):
- Process payroll
- Mark payroll as paid
- Approve/reject leaves
- Bulk approve leaves
- View all employee data

### Employee endpoints (self-service):
- `my_payslips/` - View own payslips
- `download_pdf/` - Download own payslip
- `leave_balance/` - Check own balance (without employee_id)
- Apply for leave (employee_id auto-detected)

### Authentication header:
```bash
Authorization: Bearer <your_jwt_token>
```

---

## 💡 Tips & Best Practices

1. **Payroll Processing:**
   - Setup components before first payroll run
   - Always review summary before marking as paid
   - Use draft status to review before processing

2. **Leave Management:**
   - Encourage attachment uploads for documentation
   - Use bulk approve during peak times
   - Check leave balance before approval

3. **Employee Self-Service:**
   - Direct employees to `my_payslips/` endpoint
   - No need to pass employee_id (auto-detected)
   - Employees can download their own PDFs

4. **Holiday Calendar:**
   - Update calendar at start of year
   - Use `upcoming/` for dashboard widgets
   - Mark optional holidays correctly

5. **Performance:**
   - Use filters to reduce data transfer
   - Cache holiday calendar
   - Index frequently queried fields

---

## 🧪 Testing Examples with cURL

### Process payroll:
```bash
curl -X POST http://localhost:8000/api/admin/payroll-runs/process_payroll/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"month": 11, "year": 2025}'
```

### Approve leave:
```bash
curl -X POST http://localhost:8000/api/admin/leave-applications-advanced/789/approve/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"admin_remarks": "Approved"}'
```

### Download payslip:
```bash
curl -X GET http://localhost:8000/api/admin/payslips-advanced/456/download_pdf/ \
  -H "Authorization: Bearer <token>" \
  --output payslip.pdf
```

---

## 📊 Response Examples

### Payroll summary:
```json
{
  "month": 11,
  "year": 2025,
  "status": "processed",
  "total_employees": 50,
  "total_amount": 250000.00,
  "paid_count": 0,
  "pending_count": 50,
  "processed_at": "2025-11-01T10:00:00Z",
  "processed_by": "Admin Name"
}
```

### Leave balance:
```json
{
  "year": 2025,
  "employee_id": 10,
  "leave_balance": [
    {
      "leave_type": "Casual Leave",
      "total_days": 12,
      "used_days": 3,
      "remaining_days": 9
    },
    {
      "leave_type": "Sick Leave",
      "total_days": 10,
      "used_days": 2,
      "remaining_days": 8
    },
    {
      "leave_type": "Annual Leave",
      "total_days": 20,
      "used_days": 5,
      "remaining_days": 15
    }
  ]
}
```

### Designation hierarchy:
```json
{
  "Level 1": [
    {
      "id": 1,
      "name": "CEO",
      "code": "CEO",
      "level": 1,
      "is_active": true
    }
  ],
  "Level 2": [
    {
      "id": 2,
      "name": "Senior Manager",
      "code": "SM",
      "level": 2,
      "is_active": true
    }
  ],
  ...
}
```

---

## 🛠️ Required Dependencies

```bash
# Install reportlab for PDF generation
pip install reportlab

# Or add to requirements.txt:
reportlab>=4.0.0
```

---

*Last updated: November 2025*  
*For detailed documentation, see: PHASE6_HR_MODULE_COMPLETE.md*
