from rest_framework import viewsets
from admin_api.models import WalletAccount, WalletTransaction, WalletDepositRequest, WalletRefundRequest
from admin_api.serializers.wallet import (
    WalletAccountSerializer, WalletTransactionSerializer,
    WalletDepositRequestSerializer, WalletRefundRequestSerializer
)


class WalletAccountViewSet(viewsets.ModelViewSet):
    queryset = WalletAccount.objects.all().order_by('-created_at')
    serializer_class = WalletAccountSerializer


class WalletTransactionViewSet(viewsets.ModelViewSet):
    queryset = WalletTransaction.objects.all().order_by('-created_at')
    serializer_class = WalletTransactionSerializer


class WalletDepositRequestViewSet(viewsets.ModelViewSet):
    queryset = WalletDepositRequest.objects.all().order_by('-created_at')
    serializer_class = WalletDepositRequestSerializer


class WalletRefundRequestViewSet(viewsets.ModelViewSet):
    queryset = WalletRefundRequest.objects.all().order_by('-created_at')
    serializer_class = WalletRefundRequestSerializer
