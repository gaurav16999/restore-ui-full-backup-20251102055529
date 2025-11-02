from rest_framework import serializers
from admin_api.models import EmailTemplate, SmsTemplate, EmailSmsLog


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = '__all__'


class SmsTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmsTemplate
        fields = '__all__'


class EmailSmsLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailSmsLog
        fields = '__all__'
