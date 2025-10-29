# eSewa Payment Integration Guide

## Overview
This system integrates eSewa payment gateway for online fee payments. Students can pay their school fees securely through eSewa's digital wallet.

## Configuration

### Backend Configuration

#### 1. eSewa Credentials
Update the credentials in `backend/admin_api/views/esewa_payment.py`:

```python
ESEWA_CONFIG = {
    'merchant_id': 'EPAYTEST',  # Replace with your actual eSewa Merchant ID
    'verification_url': 'https://uat.esewa.com.np/epay/transrec',  # UAT for testing
}
```

**For Production:**
- Change `merchant_id` to your live merchant ID
- Change `verification_url` to `https://esewa.com.np/epay/transrec`

#### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Configuration

Update the eSewa configuration in `src/pages/student/FeeManagement.tsx`:

```typescript
const ESEWA_CONFIG = {
  merchantId: "EPAYTEST",  // Replace with your actual eSewa Merchant ID
  successUrl: `${window.location.origin}/student/fees?payment=success`,
  failureUrl: `${window.location.origin}/student/fees?payment=failed`,
};
```

**For Production:**
- Change payment URL in `initiateEsewaPayment` function:
  - From: `https://uat.esewa.com.np/epay/main`
  - To: `https://esewa.com.np/epay/main`

## How It Works

### Payment Flow

1. **Student Initiates Payment:**
   - Student clicks "Pay with eSewa" button on any unpaid fee
   - Frontend generates unique transaction ID: `FEE-{fee_id}-{timestamp}`

2. **Redirect to eSewa:**
   - System creates HTML form with payment parameters
   - User is redirected to eSewa payment page
   - User completes payment using eSewa wallet or cards

3. **eSewa Callback:**
   - On success: Redirects to `successUrl` with payment parameters
   - On failure: Redirects to `failureUrl`

4. **Payment Verification:**
   - Frontend calls backend API: `/api/student/payment/esewa/verify/`
   - Backend verifies payment with eSewa server
   - Backend creates payment record in database
   - Student sees success message with invoice number

### API Endpoints

#### 1. Verify eSewa Payment
```
POST /api/student/payment/esewa/verify/
```

**Request Body:**
```json
{
  "oid": "FEE-123-1698765432000",
  "refId": "000AE01",
  "amt": "50000",
  "fee_structure_id": "123",
  "payment_date": "2025-10-29"
}
```

**Response (Success):**
```json
{
  "message": "Payment verified and recorded successfully",
  "payment_id": 45,
  "invoice_number": "INV-12-654321",
  "amount_paid": "50000.00",
  "transaction_id": "000AE01",
  "status": "paid"
}
```

**Response (Error):**
```json
{
  "error": "Payment verification failed with eSewa"
}
```

#### 2. Get Payment Status
```
GET /api/student/payment/status/{transaction_id}/
```

**Response:**
```json
{
  "payment_id": 45,
  "invoice_number": "INV-12-654321",
  "amount_paid": "50000.00",
  "payment_date": "2025-10-29",
  "status": "paid",
  "transaction_id": "000AE01",
  "fee_type": "tuition"
}
```

## eSewa Payment Parameters

### Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| amt | Total amount (excluding charges) | 50000 |
| psc | Service charge | 0 |
| pdc | Delivery charge | 0 |
| txAmt | Tax amount | 0 |
| tAmt | Total amount (including all charges) | 50000 |
| pid | Unique product/transaction ID | FEE-123-1698765432000 |
| scd | Merchant code/ID | EPAYTEST |
| su | Success URL | https://yourdomain.com/student/fees?payment=success |
| fu | Failure URL | https://yourdomain.com/student/fees?payment=failed |

### Success Callback Parameters

When payment is successful, eSewa redirects to success URL with these parameters:

| Parameter | Description |
|-----------|-------------|
| oid | Product ID (same as pid sent) |
| refId | eSewa reference/transaction ID |
| amt | Amount paid |

## Testing

### Test eSewa Account
For UAT (testing) environment:
- **URL:** https://uat.esewa.com.np
- **Test Merchant ID:** EPAYTEST
- **Test Account:** Create account on UAT environment

### Test Payment Flow

1. Start backend server:
```bash
cd backend
python manage.py runserver
```

2. Start frontend:
```bash
npm run dev
```

3. Login as student
4. Navigate to Fees & Payments
5. Click "Pay with eSewa" on any unpaid fee
6. Complete payment on eSewa UAT
7. Verify payment is recorded in database

### Verify Payment in Database

```sql
SELECT * FROM admin_api_feepayment 
WHERE payment_method = 'online' 
ORDER BY created_at DESC;
```

## Security Considerations

### 1. Payment Verification
- Always verify payments with eSewa server before recording
- Never trust client-side data alone
- Check payment amount matches fee amount

### 2. Duplicate Prevention
- System checks for existing transaction_id before creating payment
- Returns existing payment if already recorded

### 3. Student Validation
- Only authenticated students can verify payments
- Backend validates student belongs to the user making request

## Troubleshooting

### Payment Verification Failed

**Issue:** "Payment verification failed with eSewa"

**Solutions:**
- Check merchant ID is correct
- Verify transaction ID (refId) is valid
- Ensure eSewa verification URL is correct
- Check network connectivity to eSewa servers

### Payment Recorded but Shows as Pending

**Issue:** Payment status is 'pending' instead of 'paid'

**Solutions:**
- Check payment verification response
- Verify amount_paid equals amount_due
- Check payment_date is set correctly

### Duplicate Payment Records

**Issue:** Multiple payment records for same transaction

**Solutions:**
- Transaction ID uniqueness is enforced
- Check for race conditions in verification call
- Verify frontend doesn't call verification multiple times

## Production Checklist

- [ ] Update merchant ID in backend (`esewa_payment.py`)
- [ ] Update merchant ID in frontend (`FeeManagement.tsx`)
- [ ] Change eSewa URLs from UAT to production
- [ ] Test with real eSewa account
- [ ] Verify payment verification works
- [ ] Check success/failure redirects
- [ ] Test duplicate payment prevention
- [ ] Ensure HTTPS is enabled on production
- [ ] Configure proper CORS settings
- [ ] Set up payment monitoring/logging
- [ ] Create backup/recovery procedures

## Support

### eSewa Support
- **Website:** https://esewa.com.np
- **Merchant Support:** merchant@esewa.com.np
- **Phone:** +977-1-4001122

### Integration Documentation
- **eSewa API Docs:** https://developer.esewa.com.np/pages/Epay.html

## Future Enhancements

1. **Admin Panel Integration:**
   - View all eSewa transactions
   - Reconciliation reports
   - Refund processing

2. **Email Notifications:**
   - Send receipt on successful payment
   - Payment failure notifications

3. **Payment History:**
   - Detailed transaction logs
   - Download receipts as PDF

4. **Multiple Payment Methods:**
   - Add Khalti integration
   - IME Pay integration
   - Bank transfer options
