from rest_framework import viewsets
from admin_api.models import ChatInvitation, BlockedChatUser
from admin_api.serializers.chat import ChatInvitationSerializer, BlockedChatUserSerializer


class ChatInvitationViewSet(viewsets.ModelViewSet):
    queryset = ChatInvitation.objects.all().order_by('-created_at')
    serializer_class = ChatInvitationSerializer


class BlockedChatUserViewSet(viewsets.ModelViewSet):
    queryset = BlockedChatUser.objects.all().order_by('-created_at')
    serializer_class = BlockedChatUserSerializer
