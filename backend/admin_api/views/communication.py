from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from admin_api.models import Announcement, Message, Notification
from admin_api.serializers import AnnouncementSerializer, MessageSerializer, NotificationSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'publish_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter published only
        published_only = self.request.query_params.get('published_only')
        if published_only and published_only.lower() == 'true':
            queryset = queryset.filter(is_published=True)
        
        # Filter by announcement type
        announcement_type = self.request.query_params.get('announcement_type')
        if announcement_type:
            queryset = queryset.filter(announcement_type=announcement_type)
        
        # Filter by target audience
        target_audience = self.request.query_params.get('target_audience')
        if target_audience:
            queryset = queryset.filter(target_audience=target_audience)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish an announcement"""
        announcement = self.get_object()
        announcement.is_published = True
        announcement.publish_date = timezone.now()
        announcement.save()
        
        serializer = self.get_serializer(announcement)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['subject', 'body', 'sender__username', 'receiver__username']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Get inbox or sent messages
        box_type = self.request.query_params.get('box')
        if box_type == 'inbox':
            queryset = queryset.filter(receiver=user)
        elif box_type == 'sent':
            queryset = queryset.filter(sender=user)
        else:
            # Default: show all messages for the user
            queryset = queryset.filter(sender=user) | queryset.filter(receiver=user)
        
        # Filter unread
        unread_only = self.request.query_params.get('unread')
        if unread_only and unread_only.lower() == 'true':
            queryset = queryset.filter(is_read=False, receiver=user)
        
        return queryset.distinct()
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        message = self.get_object()
        if message.receiver == request.user:
            message.is_read = True
            message.read_at = timezone.now()
            message.save()
            serializer = self.get_serializer(message)
            return Response(serializer.data)
        return Response(
            {'error': 'You can only mark your own messages as read'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Reply to a message"""
        parent_message = self.get_object()
        
        body = request.data.get('body')
        if not body:
            return Response(
                {'error': 'body is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reply_message = Message.objects.create(
            sender=request.user,
            receiver=parent_message.sender,
            subject=f"Re: {parent_message.subject}",
            body=body,
            parent_message=parent_message
        )
        
        serializer = self.get_serializer(reply_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Show only user's notifications
        queryset = queryset.filter(user=user)
        
        # Filter unread
        unread_only = self.request.query_params.get('unread')
        if unread_only and unread_only.lower() == 'true':
            queryset = queryset.filter(is_read=False)
        
        # Filter by type
        notification_type = self.request.query_params.get('notification_type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        if notification.user == request.user:
            notification.is_read = True
            notification.save()
            serializer = self.get_serializer(notification)
            return Response(serializer.data)
        return Response(
            {'error': 'You can only mark your own notifications as read'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})
