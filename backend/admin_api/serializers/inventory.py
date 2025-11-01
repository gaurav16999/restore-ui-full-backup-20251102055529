from rest_framework import serializers
from admin_api.models import Supplier, ItemCategory, Item, ItemReceive, ItemIssue


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class ItemCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCategory
        fields = '__all__'


class ItemSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(
        source='category.title', read_only=True)

    class Meta:
        model = Item
        fields = '__all__'


class ItemReceiveSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    supplier_name = serializers.CharField(
        source='supplier.name', read_only=True)

    class Meta:
        model = ItemReceive
        fields = '__all__'


class ItemIssueSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = ItemIssue
        fields = '__all__'
