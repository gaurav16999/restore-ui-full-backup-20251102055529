from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from ..models import Subject
from ..serializers import SubjectSerializer, SubjectListSerializer, SubjectCreateSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return SubjectListSerializer
        if self.action == 'create':
            return SubjectCreateSerializer
        return SubjectSerializer

    def get_queryset(self):
        qs = self.queryset
        # Optional filters
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        code = self.request.query_params.get('code')
        if code:
            qs = qs.filter(code__iexact=code)
        return qs.order_by('code')
