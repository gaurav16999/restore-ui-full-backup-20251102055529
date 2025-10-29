# eSewa Payment Testing Guide

## Issue: eSewa UAT Environment Not Accessible

The eSewa UAT (User Acceptance Testing) environment at `https://uat.esewa.com.np` may not be publicly accessible or might be restricted to registered merchants only.

## Solution: Mock Payment Mode

We've implemented a **mock payment mode** that simulates the eSewa payment flow for testing purposes. This allows you to test the entire payment integration without needing access to the actual eSewa platform.

---

## Current Configuration (Mock Mode)

### Backend Configuration
File: `backend/admin_api/views/esewa_payment.py`

```python
ESEWA_CONFIG = {
    'merchant_id': 'EPAYTEST',
    'verification_url': 'https://esewa.com.np/epay/transrec',
    'use_mock_verification': True,  # ✅ ENABLED for testing
}
```

### Frontend Configuration
File: `src/pages/student/FeeManagement.tsx`

```typescript
const ESEWA_CONFIG = {
    merchantId: "EPAYTEST",
    paymentUrl: "https://esewa.com.np/epay/main",
    successUrl: `${window.location.origin}/student/fees?payment=success`,
    failureUrl: `${window.location.origin}/student/fees?payment=failed`,
    useMockPayment: true, // ✅ ENABLED for testing
};
```

---

## How to Test (Mock Mode)

### 1. Start the Backend Server
```bash
cd backend
python manage.py runserver
```

### 2. Start the Frontend Server
```bash
npm run dev
# or
bun run dev
```

### 3. Test Payment Flow

1. **Login as a Student**
   - Go to http://localhost:8081
   - Login with student credentials
   - Example: `student1@example.com` / `password123`

2. **Navigate to Fees & Payments**
   - Go to Student Dashboard → Fees & Payments
   - Or directly: http://localhost:8081/student/fees

3. **View Unpaid Fees**
   - You should see a list of fee structures
   - Example: "Annual Tuition Fee - Rs.50,000"

4. **Click "Pay with eSewa"**
   - Click the green "Pay with eSewa" button
   - You should see a toast: "Mock Payment Mode - Simulating eSewa payment for testing..."

5. **Automatic Redirect**
   - After 1 second, you'll be redirected back to the fees page
   - A success message will appear

6. **Payment Verification**
   - The backend will automatically verify the mock payment
   - The payment will be recorded in the database
   - The fee status will update to "Paid"

7. **Confirm Payment**
   - Check that the fee now shows as "Paid"
   - The payment amount should be recorded
   - A success toast should appear

### 4. Verify in Database

Check the database to confirm payment was recorded:

```sql
-- View all payments
SELECT * FROM admin_api_feepayment ORDER BY created_at DESC;

-- View payments for a specific student
SELECT 
    fp.invoice_number,
    fp.amount_paid,
    fp.transaction_id,
    fp.status,
    fp.payment_method,
    fp.remarks,
    fs.fee_type,
    s.user_id
FROM admin_api_feepayment fp
JOIN admin_api_feestructure fs ON fp.fee_structure_id = fs.id
JOIN admin_api_student s ON fp.student_id = s.id
WHERE fp.payment_method = 'online'
ORDER BY fp.created_at DESC;
```

---

## Mock Payment Flow Details

### What Happens in Mock Mode

1. **Frontend (Student Clicks "Pay with eSewa")**
   ```typescript
   // Generates mock payment data
   const mockOid = `FEE-${feeStructure.id}-${Date.now()}`;
   const mockRefId = `MOCK-${randomString}`;
   const mockAmt = feeStructure.amount;
   
   // Simulates redirect to eSewa and back
   window.location.href = `/student/fees?payment=success&oid=${mockOid}&refId=${mockRefId}&amt=${mockAmt}`;
   ```

2. **Backend (Receives Verification Request)**
   ```python
   # Skips actual eSewa API call
   if ESEWA_CONFIG['use_mock_verification']:
       verification_success = True  # Always returns success
   
   # Creates payment record
   payment = FeePayment.objects.create(
       student=student,
       fee_structure=fee_structure,
       amount_paid=Decimal(amount),
       payment_method='online',
       transaction_id=ref_id,  # MOCK-XXXXX
       status='paid',
       remarks=f'eSewa payment - Order ID: {oid}'
   )
   ```

3. **Database Record**
   ```
   Invoice: INV-1-456789
   Amount: Rs.50,000
   Transaction ID: MOCK-A1B2C3D4E
   Status: paid
   Payment Method: online
   Remarks: eSewa payment - Order ID: FEE-1-1730206800000
   ```

---

## Switching to Real eSewa (Production)

When you have actual eSewa merchant credentials:

### 1. Get eSewa Merchant Account
- Contact eSewa: merchant@esewa.com.np
- Phone: +977-1-5970017
- Website: https://esewa.com.np/merchant

### 2. Update Backend Configuration
File: `backend/admin_api/views/esewa_payment.py`

```python
ESEWA_CONFIG = {
    'merchant_id': 'YOUR_ACTUAL_MERCHANT_ID',  # ⚠️ Replace this
    'verification_url': 'https://esewa.com.np/epay/transrec',
    'use_mock_verification': False,  # ⚠️ Set to False
}
```

### 3. Update Frontend Configuration
File: `src/pages/student/FeeManagement.tsx`

```typescript
const ESEWA_CONFIG = {
    merchantId: "YOUR_ACTUAL_MERCHANT_ID",  // ⚠️ Replace this
    paymentUrl: "https://esewa.com.np/epay/main",
    successUrl: `${window.location.origin}/student/fees?payment=success`,
    failureUrl: `${window.location.origin}/student/fees?payment=failed`,
    useMockPayment: false,  // ⚠️ Set to false
};
```

### 4. Test with Small Amounts
- Start with small amounts (Rs.10-50) to test
- Verify payments are actually processed
- Check eSewa merchant dashboard for transactions

---

## Alternative Testing Options

If you have eSewa merchant credentials but UAT is not accessible:

### Option 1: Direct Production Testing
- Use production URL: https://esewa.com.np/epay/main
- Test with small amounts (Rs.10)
- Set `use_mock_verification: False`
- Set `useMockPayment: false`

### Option 2: Contact eSewa Support
- Email: merchant@esewa.com.np
- Request UAT environment access
- Ask for test credentials
- Get UAT documentation

### Option 3: Use Mock Mode (Current)
- Continue using mock mode for development
- Test all UI/UX flows
- Validate database operations
- Deploy to production only when ready

---

## Troubleshooting Mock Mode

### Payment Not Recording
**Issue**: Payment shows success but not in database

**Check**:
1. Backend server is running
2. Check browser console for errors
3. Verify authentication (student logged in)
4. Check backend logs for errors

**Solution**:
```bash
# Check backend logs
python manage.py runserver

# Check database
sqlite3 db.sqlite3
SELECT * FROM admin_api_feepayment ORDER BY id DESC LIMIT 5;
```

### Mock Transaction IDs
**Issue**: All payments have MOCK- prefix

**This is expected**: In mock mode, transaction IDs are prefixed with "MOCK-" to distinguish them from real eSewa transactions.

**Example**:
- Mock: `MOCK-A1B2C3D4E`
- Real: `0006X8A` (actual eSewa format)

### Duplicate Payment Prevention
**Issue**: Can't pay the same fee twice

**This is working correctly**: The system prevents duplicate payments by checking transaction_id.

**To test again**:
1. Delete payment from database:
   ```sql
   DELETE FROM admin_api_feepayment WHERE transaction_id LIKE 'MOCK-%';
   ```
2. Refresh the fees page
3. Try payment again

---

## Security Considerations

### Mock Mode Security
⚠️ **WARNING**: Mock mode bypasses actual payment verification and should **NEVER** be used in production.

**What mock mode does**:
- ✅ Tests UI flow
- ✅ Tests database operations
- ✅ Tests error handling
- ❌ Does NOT verify real payments
- ❌ Does NOT process actual money
- ❌ Does NOT communicate with eSewa

**Production Checklist**:
- [ ] Obtain real eSewa merchant ID
- [ ] Set `use_mock_verification: False` in backend
- [ ] Set `useMockPayment: false` in frontend
- [ ] Test with real eSewa account
- [ ] Verify payments in eSewa merchant dashboard
- [ ] Enable HTTPS on production server
- [ ] Set up payment monitoring
- [ ] Configure proper error handling

---

## Payment Verification Flow

### Mock Mode
```
Student Click → Mock Payment → Auto Success → Backend Records → Done
```

### Real Mode
```
Student Click → eSewa Platform → User Pays → eSewa Callback → 
Backend Verifies with eSewa API → eSewa Confirms → Backend Records → Done
```

---

## Next Steps

1. **Test Mock Mode** (Current)
   - Test all payment scenarios
   - Verify database recording
   - Check error handling
   - Validate UI updates

2. **Get eSewa Merchant Account** (When Ready)
   - Contact eSewa sales team
   - Provide business documentation
   - Get merchant ID and credentials
   - Get API documentation

3. **Switch to Production** (When Ready)
   - Update merchant IDs
   - Disable mock mode
   - Test with small amounts
   - Monitor transactions
   - Go live

---

## Support

### For Mock Mode Issues
- Check browser console
- Check backend logs
- Verify database state
- Review this guide

### For Real eSewa Integration
- eSewa Merchant Support: merchant@esewa.com.np
- eSewa Help: +977-1-5970017
- Documentation: https://developer.esewa.com.np

### For Application Issues
- Check backend logs: `python manage.py runserver`
- Check frontend console: F12 in browser
- Review database: `sqlite3 db.sqlite3`
- Check network requests: Browser Developer Tools → Network tab

---

## Summary

✅ **Current Setup**: Mock payment mode enabled for testing  
✅ **Status**: Fully functional for development and UI testing  
⚠️ **Production**: Requires real eSewa merchant credentials  
📝 **Next**: Test mock mode, then get eSewa merchant account when ready
