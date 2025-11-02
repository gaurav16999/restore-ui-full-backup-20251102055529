"""
Stripe payment integration service
"""
import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from admin_api.models import Student, PaymentTransaction
from decimal import Decimal
from django.db import transaction

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Create a Stripe Payment Intent for fee payment
    """
    try:
        student_id = request.data.get('student_id')
        amount = request.data.get('amount')
        fee_type = request.data.get('fee_type')
        description = request.data.get('description', 'School Fee Payment')

        if not all([student_id, amount, fee_type]):
            return Response(
                {'error': 'student_id, amount, and fee_type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify student exists
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=int(Decimal(amount) * 100),  # Convert to cents
            currency='usd',
            metadata={
                'student_id': student_id,
                'student_name': f"{student.user.first_name} {student.user.last_name}",
                'fee_type': fee_type,
                'user_id': request.user.id,
            },
            description=description,
        )

        # Create pending transaction record
        PaymentTransaction.objects.create(
            student=student,
            amount=amount,
            fee_type=fee_type,
            payment_intent_id=intent.id,
            status='pending',
            description=description,
        )

        return Response({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
        }, status=status.HTTP_200_OK)

    except stripe.error.StripeError as e:
        return Response(
            {'error': f'Stripe error: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Payment initialization failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """
    Confirm payment after successful Stripe payment
    """
    try:
        payment_intent_id = request.data.get('payment_intent_id')

        if not payment_intent_id:
            return Response(
                {'error': 'payment_intent_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve Payment Intent from Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if intent.status != 'succeeded':
            return Response(
                {'error': 'Payment not completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update transaction record
        with transaction.atomic():
            payment_transaction = PaymentTransaction.objects.get(
                payment_intent_id=payment_intent_id
            )
            payment_transaction.status = 'completed'
            payment_transaction.stripe_charge_id = intent.charges.data[
                0].id if intent.charges.data else None
            payment_transaction.save()

        return Response({
            'message': 'Payment confirmed successfully',
            'transaction_id': payment_transaction.id,
            'amount': str(payment_transaction.amount),
        }, status=status.HTTP_200_OK)

    except PaymentTransaction.DoesNotExist:
        return Response(
            {'error': 'Transaction not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except stripe.error.StripeError as e:
        return Response(
            {'error': f'Stripe error: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Payment confirmation failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def stripe_webhook(request):
    """
    Handle Stripe webhook events
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        return Response({'error': 'Invalid payload'},
                        status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid signature'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Handle the event
    if event.type == 'payment_intent.succeeded':
        payment_intent = event.data.object
        handle_payment_success(payment_intent)

    elif event.type == 'payment_intent.payment_failed':
        payment_intent = event.data.object
        handle_payment_failure(payment_intent)

    return Response({'status': 'success'}, status=status.HTTP_200_OK)


def handle_payment_success(payment_intent):
    """Handle successful payment"""
    try:
        with transaction.atomic():
            payment_transaction = PaymentTransaction.objects.get(
                payment_intent_id=payment_intent.id
            )
            payment_transaction.status = 'completed'
            payment_transaction.stripe_charge_id = payment_intent.charges.data[
                0].id if payment_intent.charges.data else None
            payment_transaction.save()

            # Additional logic: Update student balance, send notification, etc.

    except PaymentTransaction.DoesNotExist:
        print(f"Transaction not found for payment_intent: {payment_intent.id}")


def handle_payment_failure(payment_intent):
    """Handle failed payment"""
    try:
        with transaction.atomic():
            payment_transaction = PaymentTransaction.objects.get(
                payment_intent_id=payment_intent.id
            )
            payment_transaction.status = 'failed'
            payment_transaction.failure_reason = payment_intent.last_payment_error.message if payment_intent.last_payment_error else 'Unknown error'
            payment_transaction.save()

            # Additional logic: Send notification to user

    except PaymentTransaction.DoesNotExist:
        print(f"Transaction not found for payment_intent: {payment_intent.id}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_history(request, student_id):
    """
    Get payment history for a student
    """
    try:
        student = Student.objects.get(id=student_id)

        # Check permission (only admin, teacher, or the student themselves)
        if request.user.role not in ['admin', 'teacher']:
            if not hasattr(
                    request.user,
                    'student') or request.user.student.id != student.id:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )

        transactions = PaymentTransaction.objects.filter(
            student=student).order_by('-created_at')

        data = [{
            'id': t.id,
            'amount': str(t.amount),
            'fee_type': t.fee_type,
            'status': t.status,
            'description': t.description,
            'created_at': t.created_at.isoformat(),
            'payment_intent_id': t.payment_intent_id,
        } for t in transactions]

        return Response(data, status=status.HTTP_200_OK)

    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_refund(request):
    """
    Create a refund for a payment
    """
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only administrators can process refunds'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        transaction_id = request.data.get('transaction_id')
        amount = request.data.get('amount')  # Optional partial refund
        reason = request.data.get('reason', 'Requested by administrator')

        if not transaction_id:
            return Response(
                {'error': 'transaction_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment_transaction = PaymentTransaction.objects.get(id=transaction_id)

        if payment_transaction.status != 'completed':
            return Response(
                {'error': 'Can only refund completed payments'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create refund in Stripe
        refund_params = {
            'payment_intent': payment_transaction.payment_intent_id,
            'reason': 'requested_by_customer',
        }

        if amount:
            refund_params['amount'] = int(Decimal(amount) * 100)

        refund = stripe.Refund.create(**refund_params)

        # Update transaction
        with transaction.atomic():
            payment_transaction.status = 'refunded'
            payment_transaction.refund_id = refund.id
            payment_transaction.refund_reason = reason
            payment_transaction.save()

        return Response({
            'message': 'Refund processed successfully',
            'refund_id': refund.id,
            'amount_refunded': refund.amount / 100,
        }, status=status.HTTP_200_OK)

    except PaymentTransaction.DoesNotExist:
        return Response(
            {'error': 'Transaction not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except stripe.error.StripeError as e:
        return Response(
            {'error': f'Refund failed: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Refund processing failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
