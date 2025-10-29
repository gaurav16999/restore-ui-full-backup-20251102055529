from rest_framework import serializers
from admin_api.models import Announcement, Message, Notification


class AnnouncementSerializer(serializers.ModelSerializer):
    announcement_type_display = serializers.CharField(source='get_announcement_type_display', read_only=True)
    target_audience_display = serializers.CharField(source='get_target_audience_display', read_only=True)
    target_class_name = serializers.CharField(source='target_class.name', read_only=True, allow_null=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = Announcement
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.get_full_name', read_only=True)
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = '__all__'
    
    def get_reply_count(self, obj):
        return obj.replies.count() if not obj.parent_message else 0


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
