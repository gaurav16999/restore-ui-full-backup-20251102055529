from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from admin_api.models import FeeStructure, FeePayment
from admin_api.serializers import FeeStructureSerializer, FeePaymentSerializer, FeePaymentCreateSerializer


class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'fee_type', 'grade_level']
    ordering_fields = ['name', 'amount', 'due_date']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by class
        class_id = self.request.query_params.get('class_id')
        if class_id:
            queryset = queryset.filter(class_assigned_id=class_id)

        # Filter by fee type
        fee_type = self.request.query_params.get('fee_type')
        if fee_type:
            queryset = queryset.filter(fee_type=fee_type)

        # Filter active/inactive
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get fee statistics"""
        total_structures = FeeStructure.objects.filter(is_active=True).count()
        mandatory_fees = FeeStructure.objects.filter(
            is_active=True, is_mandatory=True).count()
        total_amount = FeeStructure.objects.filter(is_active=True).aggregate(
            total=Sum('amount')
        )['total'] or 0

        return Response({
            'total_structures': total_structures,
            'mandatory_fees': mandatory_fees,
            'optional_fees': total_structures - mandatory_fees,
            'total_amount': float(total_amount)
        })


class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'invoice_number',
        'student__user__first_name',
        'student__user__last_name',
        'student__roll_no']
    ordering_fields = ['created_at', 'due_date', 'payment_date', 'amount_due']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FeePaymentCreateSerializer
        return FeePaymentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by student
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by payment date range
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        if from_date:
            queryset = queryset.filter(payment_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(payment_date__lte=to_date)

        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get payment statistics"""
        total_due = FeePayment.objects.aggregate(
            total=Sum('amount_due'))['total'] or 0
        total_paid = FeePayment.objects.aggregate(
            total=Sum('amount_paid'))['total'] or 0
        total_pending = FeePayment.objects.filter(
            status__in=['pending', 'partial']).count()
        total_overdue = FeePayment.objects.filter(
            status__in=['pending', 'partial'],
            due_date__lt=timezone.now().date()
        ).count()

        # This month's collection
        today = timezone.now()
        this_month_paid = FeePayment.objects.filter(
            payment_date__month=today.month,
            payment_date__year=today.year
        ).aggregate(total=Sum('amount_paid'))['total'] or 0

        return Response({
            'total_due': float(total_due),
            'total_paid': float(total_paid),
            'total_balance': float(total_due - total_paid),
            'total_pending': total_pending,
            'total_overdue': total_overdue,
            'this_month_collection': float(this_month_paid)
        })

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a payment for an existing fee"""
        payment = self.get_object()
        amount = request.data.get('amount', 0)

        try:
            amount = float(amount)
            if amount <= 0:
                return Response(
                    {'error': 'Payment amount must be greater than 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            payment.amount_paid += amount
            if payment.amount_paid >= payment.amount_due:
                payment.status = 'paid'
                payment.payment_date = timezone.now().date()
            elif payment.amount_paid > 0:
                payment.status = 'partial'

            payment.payment_method = request.data.get(
                'payment_method', payment.payment_method)
            payment.transaction_id = request.data.get(
                'transaction_id', payment.transaction_id)
            payment.collected_by = request.user
            payment.save()

            serializer = self.get_serializer(payment)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
