"""
Communication & Notifications Enhanced Module
==============================================
Comprehensive communication system with:
1. Email + SMS Template System with logs
2. Internal Chat System (teacher ↔ student ↔ parent) with WebSockets
3. Announcements / Circulars with targeting
4. Real-time WebSocket notifications for assignments, grades, events
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg, Sum, F
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.http import HttpResponse
from datetime import datetime, timedelta
from decimal import Decimal
import openpyxl
from openpyxl.styles import Font, PatternFill
from io import BytesIO
import json
import re

from admin_api.models import (
    EmailTemplate, SmsTemplate, EmailSmsLog,
    ChatInvitation, BlockedChatUser,
    Announcement, Notification,
    User, Student, Teacher,
    Assignment, Grade, ClassRoom, Subject
)


# ==================== EMAIL & SMS TEMPLATES ====================

class EmailTemplateEnhancedViewSet(viewsets.ModelViewSet):
    """
    Enhanced email template management with variable substitution
    """
    queryset = EmailTemplate.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.communicate import EmailTemplateSerializer
        return EmailTemplateSerializer
    
    def get_queryset(self):
        queryset = EmailTemplate.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search by title or subject
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(subject__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        """
        Preview email template with sample variables
        """
        template = self.get_object()
        sample_data = request.data.get('sample_data', {})
        
        # Replace variables in subject and body
        subject = self._replace_variables(template.subject, sample_data)
        body = self._replace_variables(template.body, sample_data)
        
        return Response({
            'template_id': template.id,
            'title': template.title,
            'preview': {
                'subject': subject,
                'body': body
            },
            'original': {
                'subject': template.subject,
                'body': template.body
            },
            'variables_found': self._extract_variables(template.body)
        })
    
    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        """
        Send email using template with variable substitution
        """
        template = self.get_object()
        recipients = request.data.get('recipients', [])  # List of email addresses or user IDs
        variables = request.data.get('variables', {})
        send_individually = request.data.get('send_individually', False)
        
        if not recipients:
            return Response(
                {'error': 'recipients list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sent_count = 0
        failed_count = 0
        errors = []
        
        # Resolve recipients to email addresses
        email_list = self._resolve_recipients(recipients)
        
        for email_data in email_list:
            email = email_data['email']
            custom_vars = {**variables, **email_data.get('custom_vars', {})}
            
            try:
                # Replace variables
                subject = self._replace_variables(template.subject, custom_vars)
                body = self._replace_variables(template.body, custom_vars)
                
                # Send email
                self._send_email_message(email, subject, body)
                
                # Log success
                EmailSmsLog.objects.create(
                    channel='email',
                    to=email,
                    subject=subject,
                    body=body,
                    status='sent',
                    response={'success': True}
                )
                
                sent_count += 1
            
            except Exception as e:
                failed_count += 1
                errors.append({'email': email, 'error': str(e)})
                
                # Log failure
                EmailSmsLog.objects.create(
                    channel='email',
                    to=email,
                    subject=template.subject,
                    body=template.body,
                    status='failed',
                    response={'error': str(e)}
                )
        
        return Response({
            'message': f'Email sending completed',
            'sent_count': sent_count,
            'failed_count': failed_count,
            'total_recipients': len(email_list),
            'errors': errors if errors else None
        })
    
    @action(detail=False, methods=['get'])
    def list_variables(self, request):
        """
        Get list of available variables for templates
        """
        return Response({
            'available_variables': {
                'student': [
                    '{{student_name}}',
                    '{{student_id}}',
                    '{{student_email}}',
                    '{{student_class}}',
                    '{{student_roll_number}}'
                ],
                'teacher': [
                    '{{teacher_name}}',
                    '{{teacher_email}}',
                    '{{teacher_subject}}'
                ],
                'parent': [
                    '{{parent_name}}',
                    '{{parent_email}}',
                    '{{parent_phone}}'
                ],
                'school': [
                    '{{school_name}}',
                    '{{school_address}}',
                    '{{school_phone}}',
                    '{{school_email}}'
                ],
                'assignment': [
                    '{{assignment_title}}',
                    '{{assignment_subject}}',
                    '{{assignment_due_date}}',
                    '{{assignment_marks}}'
                ],
                'grade': [
                    '{{grade_subject}}',
                    '{{grade_marks}}',
                    '{{grade_total_marks}}',
                    '{{grade_percentage}}'
                ],
                'general': [
                    '{{date}}',
                    '{{time}}',
                    '{{year}}'
                ]
            },
            'usage': 'Use {{variable_name}} in your template'
        })
    
    def _extract_variables(self, text):
        """Extract all {{variable}} patterns from text"""
        pattern = r'\{\{([^}]+)\}\}'
        return list(set(re.findall(pattern, text)))
    
    def _replace_variables(self, text, variables):
        """Replace {{variable}} with actual values"""
        for key, value in variables.items():
            text = text.replace(f'{{{{{key}}}}}', str(value))
        return text
    
    def _resolve_recipients(self, recipients):
        """
        Convert recipient list to email addresses
        Recipients can be:
        - Email addresses directly
        - User IDs with 'user:' prefix
        - Student IDs with 'student:' prefix
        - Teacher IDs with 'teacher:' prefix
        - Parent IDs with 'parent:' prefix
        - Class IDs with 'class:' prefix
        """
        email_list = []
        
        for recipient in recipients:
            if isinstance(recipient, str):
                if '@' in recipient:
                    # Direct email address
                    email_list.append({'email': recipient})
                elif recipient.startswith('user:'):
                    user_id = int(recipient.split(':')[1])
                    user = User.objects.get(id=user_id)
                    email_list.append({
                        'email': user.email,
                        'custom_vars': {
                            'user_name': user.get_full_name(),
                            'user_email': user.email
                        }
                    })
                elif recipient.startswith('student:'):
                    student_id = int(recipient.split(':')[1])
                    student = Student.objects.select_related('user').get(id=student_id)
                    email_list.append({
                        'email': student.user.email,
                        'custom_vars': {
                            'student_name': student.user.get_full_name(),
                            'student_email': student.user.email,
                            'student_class': student.current_class.name if student.current_class else ''
                        }
                    })
                elif recipient.startswith('teacher:'):
                    teacher_id = int(recipient.split(':')[1])
                    teacher = Teacher.objects.select_related('user').get(id=teacher_id)
                    email_list.append({
                        'email': teacher.user.email,
                        'custom_vars': {
                            'teacher_name': teacher.user.get_full_name(),
                            'teacher_email': teacher.user.email
                        }
                    })
                elif recipient.startswith('class:'):
                    class_id = int(recipient.split(':')[1])
                    students = Student.objects.filter(current_class_id=class_id).select_related('user')
                    for student in students:
                        email_list.append({
                            'email': student.user.email,
                            'custom_vars': {
                                'student_name': student.user.get_full_name(),
                                'student_class': student.current_class.name if student.current_class else ''
                            }
                        })
        
        return email_list
    
    def _send_email_message(self, to_email, subject, body):
        """Send actual email using Django's email backend"""
        try:
            # Try to send HTML email
            msg = EmailMultiAlternatives(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[to_email]
            )
            msg.attach_alternative(body, "text/html")
            msg.send()
        except Exception as e:
            # Fallback to simple email
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False
            )


class SmsTemplateEnhancedViewSet(viewsets.ModelViewSet):
    """
    Enhanced SMS template management with sending capabilities
    """
    queryset = SmsTemplate.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.communicate import SmsTemplateSerializer
        return SmsTemplateSerializer
    
    def get_queryset(self):
        queryset = SmsTemplate.objects.all()
        
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def send_sms(self, request, pk=None):
        """
        Send SMS using template
        """
        template = self.get_object()
        recipients = request.data.get('recipients', [])  # Phone numbers or user IDs
        variables = request.data.get('variables', {})
        
        if not recipients:
            return Response(
                {'error': 'recipients list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sent_count = 0
        failed_count = 0
        errors = []
        
        # Resolve recipients to phone numbers
        phone_list = self._resolve_phone_recipients(recipients)
        
        for phone_data in phone_list:
            phone = phone_data['phone']
            custom_vars = {**variables, **phone_data.get('custom_vars', {})}
            
            try:
                # Replace variables
                body = self._replace_variables(template.body, custom_vars)
                
                # Send SMS (integration with SMS gateway needed)
                # For now, we'll just log it
                self._send_sms_message(phone, body)
                
                # Log success
                EmailSmsLog.objects.create(
                    channel='sms',
                    to=phone,
                    body=body,
                    status='sent',
                    response={'success': True}
                )
                
                sent_count += 1
            
            except Exception as e:
                failed_count += 1
                errors.append({'phone': phone, 'error': str(e)})
                
                # Log failure
                EmailSmsLog.objects.create(
                    channel='sms',
                    to=phone,
                    body=template.body,
                    status='failed',
                    response={'error': str(e)}
                )
        
        return Response({
            'message': f'SMS sending completed',
            'sent_count': sent_count,
            'failed_count': failed_count,
            'total_recipients': len(phone_list),
            'errors': errors if errors else None
        })
    
    def _replace_variables(self, text, variables):
        """Replace {{variable}} with actual values"""
        for key, value in variables.items():
            text = text.replace(f'{{{{{key}}}}}', str(value))
        return text
    
    def _resolve_phone_recipients(self, recipients):
        """Convert recipient list to phone numbers"""
        phone_list = []
        
        for recipient in recipients:
            if isinstance(recipient, str):
                if recipient.startswith('+') or recipient.isdigit():
                    # Direct phone number
                    phone_list.append({'phone': recipient})
                elif recipient.startswith('student:'):
                    student_id = int(recipient.split(':')[1])
                    student = Student.objects.select_related('user').get(id=student_id)
                    if hasattr(student, 'phone') and student.phone:
                        phone_list.append({
                            'phone': student.phone,
                            'custom_vars': {
                                'student_name': student.user.get_full_name()
                            }
                        })
        
        return phone_list
    
    def _send_sms_message(self, phone, message):
        """
        Send actual SMS using SMS gateway
        TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
        """
        # Placeholder for SMS gateway integration
        print(f"SMS to {phone}: {message}")
        # In production, integrate with:
        # - Twilio
        # - AWS SNS
        # - Firebase Cloud Messaging
        # - Local SMS gateway
        pass


class CommunicationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View communication logs (Email & SMS)
    """
    queryset = EmailSmsLog.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.communicate import EmailSmsLogSerializer
        return EmailSmsLogSerializer
    
    def get_queryset(self):
        queryset = EmailSmsLog.objects.all()
        
        # Filter by channel
        channel = self.request.query_params.get('channel')
        if channel:
            queryset = queryset.filter(channel=channel)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Search by recipient
        recipient = self.request.query_params.get('recipient')
        if recipient:
            queryset = queryset.filter(to__icontains=recipient)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get communication statistics
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date', timezone.now().date())
        
        queryset = EmailSmsLog.objects.all()
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Overall stats
        total_sent = queryset.filter(status='sent').count()
        total_failed = queryset.filter(status='failed').count()
        
        # By channel
        email_sent = queryset.filter(channel='email', status='sent').count()
        email_failed = queryset.filter(channel='email', status='failed').count()
        sms_sent = queryset.filter(channel='sms', status='sent').count()
        sms_failed = queryset.filter(channel='sms', status='failed').count()
        
        # Daily stats (last 7 days)
        today = timezone.now().date()
        daily_stats = []
        for i in range(7):
            date = today - timedelta(days=i)
            daily_count = queryset.filter(
                created_at__date=date,
                status='sent'
            ).count()
            daily_stats.append({
                'date': date,
                'count': daily_count
            })
        
        return Response({
            'period': f'{start_date} to {end_date}',
            'overall': {
                'total_sent': total_sent,
                'total_failed': total_failed,
                'success_rate': round((total_sent / (total_sent + total_failed) * 100), 2) if (total_sent + total_failed) > 0 else 0
            },
            'by_channel': {
                'email': {
                    'sent': email_sent,
                    'failed': email_failed
                },
                'sms': {
                    'sent': sms_sent,
                    'failed': sms_failed
                }
            },
            'daily_stats': daily_stats
        })


# ==================== INTERNAL CHAT SYSTEM ====================

class ChatSystemEnhancedViewSet(viewsets.ViewSet):
    """
    Enhanced internal chat system for teacher ↔ student ↔ parent
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def send_invitation(self, request):
        """
        Send chat invitation to another user
        """
        receiver_id = request.data.get('receiver_id')
        message = request.data.get('message', '')
        
        if not receiver_id:
            return Response(
                {'error': 'receiver_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            receiver = User.objects.get(id=receiver_id)
            
            # Check if blocked
            if BlockedChatUser.objects.filter(
                user=receiver,
                blocked_user=request.user
            ).exists():
                return Response(
                    {'error': 'You are blocked by this user'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create or update invitation
            invitation, created = ChatInvitation.objects.update_or_create(
                sender=request.user,
                receiver=receiver,
                defaults={
                    'message': message,
                    'status': 'pending'
                }
            )
            
            # Create notification for receiver
            Notification.objects.create(
                user=receiver,
                title='New Chat Invitation',
                message=f'{request.user.get_full_name()} wants to chat with you',
                notification_type='info',
                priority='medium'
            )
            
            return Response({
                'message': 'Invitation sent successfully',
                'invitation_id': invitation.id,
                'created': created
            })
        
        except User.DoesNotExist:
            return Response(
                {'error': 'Receiver not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def accept_invitation(self, request):
        """
        Accept a chat invitation
        """
        invitation_id = request.data.get('invitation_id')
        
        if not invitation_id:
            return Response(
                {'error': 'invitation_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            invitation = ChatInvitation.objects.get(
                id=invitation_id,
                receiver=request.user
            )
            
            invitation.status = 'accepted'
            invitation.save()
            
            # Create notification for sender
            Notification.objects.create(
                user=invitation.sender,
                title='Chat Invitation Accepted',
                message=f'{request.user.get_full_name()} accepted your chat invitation',
                notification_type='success',
                priority='medium'
            )
            
            return Response({
                'message': 'Invitation accepted',
                'chat_partner': {
                    'id': invitation.sender.id,
                    'name': invitation.sender.get_full_name(),
                    'role': invitation.sender.role
                }
            })
        
        except ChatInvitation.DoesNotExist:
            return Response(
                {'error': 'Invitation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def reject_invitation(self, request):
        """
        Reject a chat invitation
        """
        invitation_id = request.data.get('invitation_id')
        
        if not invitation_id:
            return Response(
                {'error': 'invitation_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            invitation = ChatInvitation.objects.get(
                id=invitation_id,
                receiver=request.user
            )
            
            invitation.status = 'rejected'
            invitation.save()
            
            return Response({
                'message': 'Invitation rejected'
            })
        
        except ChatInvitation.DoesNotExist:
            return Response(
                {'error': 'Invitation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def chat_list(self, request):
        """
        Get list of active chats
        """
        # Get accepted invitations where user is sender or receiver
        sent_invitations = ChatInvitation.objects.filter(
            sender=request.user,
            status='accepted'
        ).select_related('receiver')
        
        received_invitations = ChatInvitation.objects.filter(
            receiver=request.user,
            status='accepted'
        ).select_related('sender')
        
        chat_partners = []
        
        for invitation in sent_invitations:
            chat_partners.append({
                'user_id': invitation.receiver.id,
                'name': invitation.receiver.get_full_name(),
                'role': invitation.receiver.role,
                'invitation_id': invitation.id
            })
        
        for invitation in received_invitations:
            chat_partners.append({
                'user_id': invitation.sender.id,
                'name': invitation.sender.get_full_name(),
                'role': invitation.sender.role,
                'invitation_id': invitation.id
            })
        
        return Response({
            'chat_partners': chat_partners,
            'total_chats': len(chat_partners)
        })
    
    @action(detail=False, methods=['get'])
    def pending_invitations(self, request):
        """
        Get pending chat invitations (received)
        """
        invitations = ChatInvitation.objects.filter(
            receiver=request.user,
            status='pending'
        ).select_related('sender')
        
        data = []
        for invitation in invitations:
            data.append({
                'invitation_id': invitation.id,
                'sender': {
                    'id': invitation.sender.id,
                    'name': invitation.sender.get_full_name(),
                    'role': invitation.sender.role
                },
                'message': invitation.message,
                'created_at': invitation.created_at
            })
        
        return Response({
            'pending_invitations': data,
            'count': len(data)
        })
    
    @action(detail=False, methods=['post'])
    def block_user(self, request):
        """
        Block a user from chatting
        """
        blocked_user_id = request.data.get('blocked_user_id')
        reason = request.data.get('reason', '')
        
        if not blocked_user_id:
            return Response(
                {'error': 'blocked_user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            blocked_user = User.objects.get(id=blocked_user_id)
            
            BlockedChatUser.objects.get_or_create(
                user=request.user,
                blocked_user=blocked_user,
                defaults={'reason': reason}
            )
            
            return Response({
                'message': f'{blocked_user.get_full_name()} has been blocked'
            })
        
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def unblock_user(self, request):
        """
        Unblock a user
        """
        blocked_user_id = request.data.get('blocked_user_id')
        
        if not blocked_user_id:
            return Response(
                {'error': 'blocked_user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count = BlockedChatUser.objects.filter(
            user=request.user,
            blocked_user_id=blocked_user_id
        ).delete()[0]
        
        if deleted_count > 0:
            return Response({
                'message': 'User has been unblocked'
            })
        else:
            return Response(
                {'error': 'User was not blocked'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def blocked_users_list(self, request):
        """
        Get list of blocked users
        """
        blocked = BlockedChatUser.objects.filter(
            user=request.user
        ).select_related('blocked_user')
        
        data = []
        for block in blocked:
            data.append({
                'user_id': block.blocked_user.id,
                'name': block.blocked_user.get_full_name(),
                'role': block.blocked_user.role,
                'reason': block.reason,
                'blocked_at': block.created_at
            })
        
        return Response({
            'blocked_users': data,
            'count': len(data)
        })


# ==================== ANNOUNCEMENTS / CIRCULARS ====================

class AnnouncementEnhancedViewSet(viewsets.ModelViewSet):
    """
    Enhanced announcements with targeting and scheduling
    """
    queryset = Announcement.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.announcement import AnnouncementSerializer
        return AnnouncementSerializer
    
    def get_queryset(self):
        queryset = Announcement.objects.all()
        
        # Filter by announcement type
        announcement_type = self.request.query_params.get('type')
        if announcement_type:
            queryset = queryset.filter(announcement_type=announcement_type)
        
        # Filter by target audience
        target_audience = self.request.query_params.get('target')
        if target_audience:
            queryset = queryset.filter(target_audience=target_audience)
        
        # Filter by published status
        is_published = self.request.query_params.get('is_published')
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published.lower() == 'true')
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """
        Publish an announcement and send notifications
        """
        announcement = self.get_object()
        
        if announcement.is_published:
            return Response(
                {'error': 'Announcement is already published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        announcement.is_published = True
        announcement.published_at = timezone.now()
        announcement.save()
        
        # Send notifications to target audience
        notification_count = self._send_announcement_notifications(announcement)
        
        return Response({
            'message': 'Announcement published successfully',
            'notifications_sent': notification_count,
            'published_at': announcement.published_at
        })
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """
        Unpublish an announcement
        """
        announcement = self.get_object()
        
        announcement.is_published = False
        announcement.save()
        
        return Response({
            'message': 'Announcement unpublished'
        })
    
    @action(detail=False, methods=['get'])
    def my_announcements(self, request):
        """
        Get announcements relevant to current user
        """
        user = request.user
        
        # Determine user's role and get relevant announcements
        queryset = Announcement.objects.filter(is_published=True)
        
        # Filter by target audience
        if user.role == 'student':
            queryset = queryset.filter(
                Q(target_audience='all') |
                Q(target_audience='students')
            )
            # Also get class-specific announcements
            try:
                student = Student.objects.get(user=user)
                if student.current_class:
                    queryset = queryset | Announcement.objects.filter(
                        target_audience='class_specific',
                        target_class=student.current_class
                    )
            except Student.DoesNotExist:
                pass
        
        elif user.role == 'teacher':
            queryset = queryset.filter(
                Q(target_audience='all') |
                Q(target_audience='teachers') |
                Q(target_audience='staff')
            )
        
        elif user.role == 'parent':
            queryset = queryset.filter(
                Q(target_audience='all') |
                Q(target_audience='parents')
            )
        
        # Order by priority and date
        queryset = queryset.order_by('-announcement_type', '-created_at')
        
        # Serialize
        from admin_api.serializers.announcement import AnnouncementSerializer
        serializer = AnnouncementSerializer(queryset, many=True)
        
        return Response({
            'announcements': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get announcement statistics
        """
        total_announcements = Announcement.objects.count()
        published = Announcement.objects.filter(is_published=True).count()
        draft = Announcement.objects.filter(is_published=False).count()
        
        # By type
        by_type = Announcement.objects.values('announcement_type').annotate(
            count=Count('id')
        )
        
        # By target
        by_target = Announcement.objects.values('target_audience').annotate(
            count=Count('id')
        )
        
        # Recent (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_count = Announcement.objects.filter(
            created_at__gte=seven_days_ago
        ).count()
        
        return Response({
            'total_announcements': total_announcements,
            'published': published,
            'draft': draft,
            'by_type': list(by_type),
            'by_target': list(by_target),
            'recent_count': recent_count
        })
    
    def _send_announcement_notifications(self, announcement):
        """
        Send notifications to all users in target audience
        """
        target_users = []
        
        if announcement.target_audience == 'all':
            target_users = User.objects.all()
        elif announcement.target_audience == 'students':
            target_users = User.objects.filter(role='student')
        elif announcement.target_audience == 'teachers':
            target_users = User.objects.filter(role='teacher')
        elif announcement.target_audience == 'parents':
            target_users = User.objects.filter(role='parent')
        elif announcement.target_audience == 'staff':
            target_users = User.objects.filter(Q(role='teacher') | Q(role='admin'))
        elif announcement.target_audience == 'class_specific' and announcement.target_class:
            students = Student.objects.filter(current_class=announcement.target_class)
            target_users = [s.user for s in students]
        
        # Create notifications
        notifications = []
        for user in target_users:
            notifications.append(
                Notification(
                    user=user,
                    title=f'📢 {announcement.title}',
                    message=announcement.content[:200],  # First 200 chars
                    notification_type='info' if announcement.announcement_type != 'urgent' else 'warning',
                    priority='high' if announcement.announcement_type == 'urgent' else 'medium',
                    reference_type='announcement',
                    reference_id=announcement.id
                )
            )
        
        # Bulk create notifications
        Notification.objects.bulk_create(notifications)
        
        return len(notifications)


# ==================== REAL-TIME NOTIFICATIONS ====================

class NotificationEnhancedViewSet(viewsets.ModelViewSet):
    """
    Enhanced notifications with real-time capabilities
    """
    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.notification import NotificationSerializer
        return NotificationSerializer
    
    def get_queryset(self):
        # Only return notifications for current user
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark notification as read
        """
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return Response({
            'message': 'Notification marked as read'
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Mark all notifications as read for current user
        """
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'{updated_count} notifications marked as read',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Get count of unread notifications
        """
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({
            'unread_count': count
        })
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """
        Delete all notifications for current user
        """
        deleted_count = Notification.objects.filter(
            user=request.user
        ).delete()[0]
        
        return Response({
            'message': f'{deleted_count} notifications cleared',
            'deleted_count': deleted_count
        })
    
    @action(detail=False, methods=['post'])
    def send_notification(self, request):
        """
        Send custom notification (admin only)
        """
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can send custom notifications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_ids = request.data.get('user_ids', [])
        title = request.data.get('title')
        message = request.data.get('message')
        notification_type = request.data.get('notification_type', 'info')
        priority = request.data.get('priority', 'medium')
        
        if not user_ids or not title or not message:
            return Response(
                {'error': 'user_ids, title, and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create notifications
        notifications = []
        for user_id in user_ids:
            notifications.append(
                Notification(
                    user_id=user_id,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                    priority=priority
                )
            )
        
        Notification.objects.bulk_create(notifications)
        
        return Response({
            'message': 'Notifications sent successfully',
            'count': len(notifications)
        })


# ==================== AUTOMATED NOTIFICATIONS ====================

class AutomatedNotificationService:
    """
    Service for sending automated notifications for various events
    """
    
    @staticmethod
    def notify_new_assignment(assignment):
        """Send notification when new assignment is created"""
        # Get all students in the class
        students = Student.objects.filter(current_class=assignment.classroom)
        
        notifications = []
        for student in students:
            notifications.append(
                Notification(
                    user=student.user,
                    title='📝 New Assignment',
                    message=f'New assignment "{assignment.title}" for {assignment.subject.name}. Due: {assignment.due_date}',
                    notification_type='info',
                    priority='high',
                    reference_type='assignment',
                    reference_id=assignment.id
                )
            )
        
        Notification.objects.bulk_create(notifications)
        return len(notifications)
    
    @staticmethod
    def notify_grade_posted(grade):
        """Send notification when grade is posted"""
        Notification.objects.create(
            user=grade.student.user,
            title='📊 New Grade Posted',
            message=f'Grade for {grade.subject.name}: {grade.marks}/{grade.total_marks}',
            notification_type='success',
            priority='medium',
            reference_type='grade',
            reference_id=grade.id
        )
        
        # Also notify parent if exists
        if grade.student.parent_user:
            Notification.objects.create(
                user=grade.student.parent_user,
                title='📊 Student Grade Update',
                message=f'{grade.student.user.get_full_name()} received grade for {grade.subject.name}: {grade.marks}/{grade.total_marks}',
                notification_type='info',
                priority='medium',
                reference_type='grade',
                reference_id=grade.id
            )
    
    @staticmethod
    def notify_upcoming_event(event):
        """Send notification for upcoming event"""
        # Determine target audience
        if event.event_type == 'exam':
            # Notify students and teachers
            users = User.objects.filter(Q(role='student') | Q(role='teacher'))
        else:
            # Notify all
            users = User.objects.all()
        
        notifications = []
        for user in users:
            notifications.append(
                Notification(
                    user=user,
                    title=f'📅 {event.title}',
                    message=f'Event on {event.event_date}: {event.description}',
                    notification_type='info',
                    priority='medium',
                    reference_type='event',
                    reference_id=event.id
                )
            )
        
        Notification.objects.bulk_create(notifications)
        return len(notifications)
