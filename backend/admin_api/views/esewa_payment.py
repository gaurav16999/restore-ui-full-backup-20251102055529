"""
eSewa Payment Integration Views
Handles payment verification and recording from eSewa payment gateway
"""
import requests
import hmac
import hashlib
import base64
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from admin_api.models import FeePayment, FeeStructure, Student
from decimal import Decimal


# eSewa Configuration
# NOTE: eSewa UAT environment may not be publicly accessible
# For testing: You can use production with small amounts or implement mock verification
# For production: Use live merchant credentials
ESEWA_CONFIG = {
    'merchant_id': 'EPAYTEST',  # Replace with actual merchant ID
    'verification_url': 'https://esewa.com.np/epay/transrec',  # Production URL
    'use_mock_verification': True,  # Set to False in production with real credentials
}


def mock_verify_payment(oid, ref_id, amount):
    """
    Mock payment verification for development/testing
    In production, this should call actual eSewa verification API
    """
    # Simulate successful verification
    # In real implementation, this would make HTTP request to eSewa
    return True


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_esewa_payment(request):
    """
    Verify eSewa payment and record it in the database
    
    Expected payload:
    {
        "oid": "Product ID sent to eSewa",
        "refId": "eSewa reference ID",
        "amt": "Amount paid",
        "fee_structure_id": "ID of the fee structure"
    }
    """
    try:
        # Get payment details from request
        oid = request.data.get('oid')  # Product/Order ID
        ref_id = request.data.get('refId')  # eSewa reference ID
        amount = request.data.get('amt')  # Amount
        fee_structure_id = request.data.get('fee_structure_id')
        
        if not all([oid, ref_id, amount, fee_structure_id]):
            return Response(
                {'error': 'Missing required payment parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify payment with eSewa or use mock for testing
        verification_success = False
        
        if ESEWA_CONFIG['use_mock_verification']:
            # Mock verification for development
            verification_success = mock_verify_payment(oid, ref_id, amount)
        else:
            # Real eSewa verification
            try:
                verification_params = {
                    'amt': amount,
                    'rid': ref_id,
                    'pid': oid,
                    'scd': ESEWA_CONFIG['merchant_id']
                }
                
                # Make verification request to eSewa
                verification_response = requests.get(
                    ESEWA_CONFIG['verification_url'],
                    params=verification_params,
                    timeout=10
                )
                
                # eSewa returns XML response with "Success" or "Failure"
                response_text = verification_response.text.strip()
                verification_success = 'Success' in response_text
            except requests.exceptions.RequestException as e:
                return Response(
                    {'error': f'Failed to verify payment with eSewa: {str(e)}'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        
        if not verification_success:
            return Response(
                {'error': 'Payment verification failed with eSewa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get student from authenticated user
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get fee structure
        try:
            fee_structure = FeeStructure.objects.get(id=fee_structure_id)
        except FeeStructure.DoesNotExist:
            return Response(
                {'error': 'Fee structure not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if payment already exists for this transaction
        existing_payment = FeePayment.objects.filter(
            transaction_id=ref_id,
            student=student
        ).first()
        
        if existing_payment:
            return Response(
                {
                    'message': 'Payment already recorded',
                    'payment_id': existing_payment.id
                },
                status=status.HTTP_200_OK
            )
        
        # Generate unique invoice number
        import random
        invoice_number = f"INV-{student.id}-{random.randint(100000, 999999)}"
        
        # Create or update payment record
        payment = FeePayment.objects.create(
            student=student,
            fee_structure=fee_structure,
            invoice_number=invoice_number,
            amount_due=fee_structure.amount,
            amount_paid=Decimal(amount),
            payment_method='online',
            transaction_id=ref_id,
            status='paid',
            payment_date=request.data.get('payment_date') or None,
            due_date=fee_structure.due_date,
            remarks=f'eSewa payment - Order ID: {oid}'
        )
        
        return Response(
            {
                'message': 'Payment verified and recorded successfully',
                'payment_id': payment.id,
                'invoice_number': payment.invoice_number,
                'amount_paid': str(payment.amount_paid),
                'transaction_id': payment.transaction_id,
                'status': payment.status
            },
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {'error': f'Payment verification failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_status(request, transaction_id):
    """
    Get the status of a payment by transaction ID
    """
    try:
        # Get student from authenticated user
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Find payment
        try:
            payment = FeePayment.objects.get(
                transaction_id=transaction_id,
                student=student
            )
            
            return Response(
                {
                    'payment_id': payment.id,
                    'invoice_number': payment.invoice_number,
                    'amount_paid': str(payment.amount_paid),
                    'payment_date': payment.payment_date,
                    'status': payment.status,
                    'transaction_id': payment.transaction_id,
                    'fee_type': payment.fee_structure.fee_type
                },
                status=status.HTTP_200_OK
            )
        except FeePayment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve payment status: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
