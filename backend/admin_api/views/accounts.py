from rest_framework import viewsets
from admin_api.models import ChartOfAccount, AccountTransaction
from admin_api.serializers.accounts import ChartOfAccountSerializer, AccountTransactionSerializer


class ChartOfAccountViewSet(viewsets.ModelViewSet):
    queryset = ChartOfAccount.objects.all().order_by('code')
    serializer_class = ChartOfAccountSerializer


class AccountTransactionViewSet(viewsets.ModelViewSet):
    queryset = AccountTransaction.objects.all().order_by('-created_at')
    serializer_class = AccountTransactionSerializer
