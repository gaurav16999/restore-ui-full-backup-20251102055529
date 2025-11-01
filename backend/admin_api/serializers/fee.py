from rest_framework import serializers
from admin_api.models import FeeStructure, FeePayment


class FeeStructureSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    fee_type_display = serializers.CharField(
        source='get_fee_type_display', read_only=True)
    frequency_display = serializers.CharField(
        source='get_frequency_display', read_only=True)

    class Meta:
        model = FeeStructure
        fields = '__all__'


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.user.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(
        source='student.roll_no', read_only=True)
    fee_name = serializers.CharField(
        source='fee_structure.name', read_only=True)
    payment_method_display = serializers.CharField(
        source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    balance = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    collected_by_name = serializers.CharField(
        source='collected_by.get_full_name',
        read_only=True,
        allow_null=True)

    class Meta:
        model = FeePayment
        fields = '__all__'


class FeePaymentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating/updating fee payments"""

    class Meta:
        model = FeePayment
        fields = [
            'student',
            'fee_structure',
            'amount_due',
            'amount_paid',
            'payment_method',
            'transaction_id',
            'status',
            'payment_date',
            'due_date',
            'late_fee',
            'discount',
            'remarks',
            'collected_by']

    def create(self, validated_data):
        # Auto-generate invoice number
        import datetime
        prefix = f"INV{datetime.datetime.now().strftime('%Y%m%d')}"
        last_payment = FeePayment.objects.filter(
            invoice_number__startswith=prefix).order_by('-invoice_number').first()
        if last_payment:
            last_num = int(last_payment.invoice_number[-4:])
            new_num = last_num + 1
        else:
            new_num = 1
        validated_data['invoice_number'] = f"{prefix}{str(new_num).zfill(4)}"

        return super().create(validated_data)
