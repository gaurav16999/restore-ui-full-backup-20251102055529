from rest_framework import serializers
from admin_api.models import WalletAccount, WalletTransaction, WalletDepositRequest, WalletRefundRequest


class WalletAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletAccount
        fields = '__all__'


class WalletTransactionSerializer(serializers.ModelSerializer):
    wallet_name = serializers.CharField(source='wallet.name', read_only=True)

    class Meta:
        model = WalletTransaction
        fields = '__all__'


class WalletDepositRequestSerializer(serializers.ModelSerializer):
    wallet_name = serializers.CharField(source='wallet.name', read_only=True)

    class Meta:
        model = WalletDepositRequest
        fields = '__all__'


class WalletRefundRequestSerializer(serializers.ModelSerializer):
    transaction_ref = serializers.CharField(
        source='transaction.reference', read_only=True)

    class Meta:
        model = WalletRefundRequest
        fields = '__all__'
