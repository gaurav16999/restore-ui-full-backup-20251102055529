"""
Shared notifications view for all user roles
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_api.models import Notification, Student, Teacher, Grade, Attendance, ClassSubject, TeacherAssignment, Class
from datetime import datetime, timedelta
from django.utils import timezone


class NotificationsView(APIView):
    """
    Get dynamic notifications for the logged-in user based on their role and data
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Import here to avoid circular imports
        from student.notifications_view import NotificationsView as StudentNotificationsView
        
        # Reuse the student notification view logic
        student_view = StudentNotificationsView()
        student_view.request = request
        student_view.format_kwarg = None
        
        return student_view.get(request)
    
    def post(self, request):
        """Mark notification as read or create custom notification"""
        action = request.data.get('action')
        notification_id = request.data.get('id')
        
        if action == 'mark_read' and notification_id:
            # Check if this is a temporary ID (dynamically generated notification)
            if isinstance(notification_id, str) and notification_id.startswith('temp_'):
                # Temporary notifications don't exist in database, just return success
                return Response({'status': 'success', 'message': 'Temporary notification acknowledged'})
            
            try:
                notification = Notification.objects.get(id=notification_id, user=request.user)
                notification.is_read = True
                notification.save()
                return Response({'status': 'success', 'message': 'Notification marked as read'})
            except Notification.DoesNotExist:
                # If notification not found, still return success (might have been deleted)
                return Response({'status': 'success', 'message': 'Notification not found or already deleted'})
            except (ValueError, TypeError):
                # Invalid ID format, return success anyway
                return Response({'status': 'success', 'message': 'Invalid notification ID'})
        
        elif action == 'mark_all_read':
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({'status': 'success', 'message': 'All notifications marked as read'})
        
        elif action == 'create':
            # Create custom notification
            notification = Notification.objects.create(
                user=request.user,
                title=request.data.get('title'),
                message=request.data.get('message'),
                notification_type=request.data.get('type', 'info'),
                priority=request.data.get('priority', 'medium'),
                action_url=request.data.get('actionUrl', '')
            )
            return Response({
                'status': 'success',
                'notification': {
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'type': notification.notification_type,
                    'priority': notification.priority,
                    'actionUrl': notification.action_url,
                    'read': notification.is_read,
                    'timestamp': notification.created_at.isoformat()
                }
            })
        
        return Response({'status': 'error', 'message': 'Invalid action'}, status=400)
