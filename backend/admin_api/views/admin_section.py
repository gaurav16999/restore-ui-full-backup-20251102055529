from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import (
    AdmissionQuery, VisitorBook, Complaint,
    PostalReceive, PostalDispatch, PhoneCallLog
)
from ..serializers.admin_section import (
    AdmissionQuerySerializer, VisitorBookSerializer, ComplaintSerializer,
    PostalReceiveSerializer, PostalDispatchSerializer, PhoneCallLogSerializer
)


class AdmissionQueryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing admission queries"""
    queryset = AdmissionQuery.objects.all()
    serializer_class = AdmissionQuerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        # Filter by source if provided
        source_param = self.request.query_params.get('source', None)
        if source_param:
            queryset = queryset.filter(source=source_param)
        return queryset


class VisitorBookViewSet(viewsets.ModelViewSet):
    """ViewSet for managing visitor records"""
    queryset = VisitorBook.objects.all()
    serializer_class = VisitorBookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by date if provided
        date_param = self.request.query_params.get('date', None)
        if date_param:
            queryset = queryset.filter(date=date_param)
        return queryset


class ComplaintViewSet(viewsets.ModelViewSet):
    """ViewSet for managing complaints"""
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        # Filter by type if provided
        type_param = self.request.query_params.get('complaint_type', None)
        if type_param:
            queryset = queryset.filter(complaint_type=type_param)
        return queryset


class PostalReceiveViewSet(viewsets.ModelViewSet):
    """ViewSet for managing incoming postal"""
    queryset = PostalReceive.objects.all()
    serializer_class = PostalReceiveSerializer
    permission_classes = [IsAuthenticated]


class PostalDispatchViewSet(viewsets.ModelViewSet):
    """ViewSet for managing outgoing postal"""
    queryset = PostalDispatch.objects.all()
    serializer_class = PostalDispatchSerializer
    permission_classes = [IsAuthenticated]


class PhoneCallLogViewSet(viewsets.ModelViewSet):
    """ViewSet for managing phone call logs"""
    queryset = PhoneCallLog.objects.all()
    serializer_class = PhoneCallLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by call type if provided
        call_type_param = self.request.query_params.get('call_type', None)
        if call_type_param:
            queryset = queryset.filter(call_type=call_type_param)
        return queryset
