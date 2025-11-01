from rest_framework import serializers
from admin_api.models import ChartOfAccount, AccountTransaction


class ChartOfAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccount
        fields = '__all__'


class AccountTransactionSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)

    class Meta:
        model = AccountTransaction
        fields = '__all__'
