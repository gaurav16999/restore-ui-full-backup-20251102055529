from rest_framework import serializers
from admin_api.models import ChatInvitation, BlockedChatUser


class ChatInvitationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(
        source='sender.username', read_only=True)
    receiver_username = serializers.CharField(
        source='receiver.username', read_only=True)

    class Meta:
        model = ChatInvitation
        fields = '__all__'


class BlockedChatUserSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(
        source='user.username', read_only=True)
    blocked_username = serializers.CharField(
        source='blocked_user.username', read_only=True)

    class Meta:
        model = BlockedChatUser
        fields = '__all__'
