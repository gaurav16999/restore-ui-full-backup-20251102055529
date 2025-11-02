from rest_framework import viewsets
from admin_api.models import EmailTemplate, SmsTemplate, EmailSmsLog
from admin_api.serializers.communicate import (
    EmailTemplateSerializer, SmsTemplateSerializer, EmailSmsLogSerializer
)


class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all().order_by('-created_at')
    serializer_class = EmailTemplateSerializer


class SmsTemplateViewSet(viewsets.ModelViewSet):
    queryset = SmsTemplate.objects.all().order_by('-created_at')
    serializer_class = SmsTemplateSerializer


class EmailSmsLogViewSet(viewsets.ModelViewSet):
    queryset = EmailSmsLog.objects.all().order_by('-created_at')
    serializer_class = EmailSmsLogSerializer
