from rest_framework import viewsets
from admin_api.models import Supplier, ItemCategory, Item, ItemReceive, ItemIssue
from admin_api.serializers.inventory import (
    SupplierSerializer,
    ItemCategorySerializer,
    ItemSerializer,
    ItemReceiveSerializer,
    ItemIssueSerializer)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('-created_at')
    serializer_class = SupplierSerializer


class ItemCategoryViewSet(viewsets.ModelViewSet):
    queryset = ItemCategory.objects.all().order_by('-created_at')
    serializer_class = ItemCategorySerializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all().order_by('name')
    serializer_class = ItemSerializer


class ItemReceiveViewSet(viewsets.ModelViewSet):
    queryset = ItemReceive.objects.all().order_by('-received_at')
    serializer_class = ItemReceiveSerializer


class ItemIssueViewSet(viewsets.ModelViewSet):
    queryset = ItemIssue.objects.all().order_by('-issued_at')
    serializer_class = ItemIssueSerializer
