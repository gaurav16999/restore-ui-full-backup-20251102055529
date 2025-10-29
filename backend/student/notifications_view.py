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
        
        # Generate notifications based on user role
        if hasattr(user, 'student_profile'):
            notifications = self._generate_student_notifications(user)
        elif hasattr(user, 'teacher_profile'):
            notifications = self._generate_teacher_notifications(user)
        elif user.is_superuser or user.is_staff:
            notifications = self._generate_admin_notifications(user)
        else:
            notifications = []
        
        # Get saved notifications from database
        saved_notifications = Notification.objects.filter(user=user)[:10]
        
        # Combine and format notifications
        all_notifications = list(saved_notifications.values(
            'id', 'title', 'message', 'notification_type', 'priority', 'action_url', 'is_read', 'created_at'
        ))
        
        # Add generated notifications
        all_notifications.extend(notifications)
        
        # Format for frontend
        formatted_notifications = []
        for notif in all_notifications:
            formatted_notifications.append({
                'id': str(notif.get('id', f"temp_{len(formatted_notifications)}")),
                'title': notif['title'],
                'message': notif['message'],
                'type': notif.get('notification_type', notif.get('type', 'info')),
                'priority': notif.get('priority', 'medium'),
                'actionUrl': notif.get('action_url', notif.get('actionUrl', '')),
                'read': notif.get('is_read', notif.get('read', False)),
                'timestamp': notif.get('created_at', notif.get('timestamp', datetime.now())).isoformat() if isinstance(notif.get('created_at', notif.get('timestamp')), datetime) else notif.get('created_at', notif.get('timestamp', datetime.now().isoformat()))
            })
        
        return Response(formatted_notifications)
    
    def _generate_student_notifications(self, user):
        """Generate dynamic notifications for students"""
        notifications = []
        student = user.student_profile
        
        # Get time of day for greeting
        hour = datetime.now().hour
        time_of_day = 'morning' if hour < 12 else 'afternoon' if hour < 17 else 'evening'
        
        # Get student's class and course count
        student_class = Class.objects.filter(name=student.class_name).first()
        course_count = 0
        if student_class:
            course_count = ClassSubject.objects.filter(class_assigned=student_class, is_active=True).count()
        
        # Count pending assignments (mock for now - you can add Assignment model later)
        pending_assignments = 0  # TODO: Get from Assignment model
        
        # Get recent grades
        recent_grades = Grade.objects.filter(student=student).order_by('-created_at')[:3]
        
        # Welcome notification
        notifications.append({
            'title': 'Welcome Back, Student!',
            'message': f"Good {time_of_day}, {user.first_name}! You have {course_count} enrolled courses.",
            'type': 'success',
            'priority': 'high',
            'actionUrl': '/student',
            'timestamp': datetime.now()
        })
        
        # New grades notification
        if recent_grades:
            latest_grade = recent_grades[0]
            # Check if grade is from today or yesterday
            days_ago = (datetime.now().date() - latest_grade.created_at.date()).days
            if days_ago <= 1:
                notifications.append({
                    'title': 'New Grade Posted',
                    'message': f'Your {latest_grade.subject.title if latest_grade.subject else "assignment"} grade has been posted: {latest_grade.score}%',
                    'type': 'success',
                    'priority': 'medium',
                    'actionUrl': '/student/grades',
                    'timestamp': latest_grade.created_at
                })
        
        # Attendance notification
        attendance_records = Attendance.objects.filter(student=student)
        if attendance_records.exists():
            total = attendance_records.count()
            present = attendance_records.filter(status='present').count()
            attendance_rate = (present / total * 100) if total > 0 else 0
            
            if attendance_rate < 75:
                notifications.append({
                    'title': 'Attendance Alert',
                    'message': f'Your attendance is {attendance_rate:.1f}%. Please maintain at least 75% attendance.',
                    'type': 'warning',
                    'priority': 'high',
                    'actionUrl': '/student/attendance',
                    'timestamp': datetime.now()
                })
        
        # Course-specific notifications
        if course_count > 0:
            notifications.append({
                'title': 'Course Updates',
                'message': f'You are enrolled in {course_count} courses. Check your course materials.',
                'type': 'info',
                'priority': 'low',
                'actionUrl': '/student/courses',
                'timestamp': datetime.now()
            })
        
        return notifications
    
    def _generate_teacher_notifications(self, user):
        """Generate dynamic notifications for teachers"""
        notifications = []
        teacher = user.teacher_profile
        
        # Get time of day
        hour = datetime.now().hour
        time_of_day = 'morning' if hour < 12 else 'afternoon' if hour < 17 else 'evening'
        
        # Get assigned classes count
        assigned_classes = TeacherAssignment.objects.filter(teacher=teacher, is_active=True)
        classes_count = assigned_classes.values('class_assigned').distinct().count()
        
        # Get total students across all classes
        student_count = 0
        for assignment in assigned_classes:
            student_count += Student.objects.filter(class_name=assignment.class_assigned.name, is_active=True).count()
        
        # Welcome notification
        notifications.append({
            'title': 'Welcome Back, Teacher!',
            'message': f"Good {time_of_day}, {user.first_name}! You have {classes_count} assigned classes with {student_count} students.",
            'type': 'success',
            'priority': 'high',
            'actionUrl': '/teacher',
            'timestamp': datetime.now()
        })
        
        # Attendance reminder
        today = datetime.now().date()
        attendance_today = Attendance.objects.filter(
            date=today,
            class_section__in=[a.class_assigned for a in assigned_classes]
        ).count()
        
        if hour >= 14 and attendance_today == 0:  # After 2 PM
            notifications.append({
                'title': 'Attendance Reminder',
                'message': "Don't forget to submit today's attendance records.",
                'type': 'warning',
                'priority': 'high',
                'actionUrl': '/teacher/attendance',
                'timestamp': datetime.now()
            })
        
        # Grading notification
        ungraded_count = Grade.objects.filter(
            subject__in=[a.subject for a in assigned_classes],
            score__isnull=True
        ).count()
        
        if ungraded_count > 0:
            notifications.append({
                'title': 'Grading Pending',
                'message': f'You have {ungraded_count} assignments pending grading.',
                'type': 'info',
                'priority': 'medium',
                'actionUrl': '/teacher/grades',
                'timestamp': datetime.now()
            })
        
        return notifications
    
    def _generate_admin_notifications(self, user):
        """Generate dynamic notifications for admins"""
        notifications = []
        
        # Get time of day
        hour = datetime.now().hour
        time_of_day = 'morning' if hour < 12 else 'afternoon' if hour < 17 else 'evening'
        
        # System stats
        total_students = Student.objects.filter(is_active=True).count()
        total_teachers = Teacher.objects.filter(is_active=True).count()
        total_classes = Class.objects.count()
        
        # Welcome notification
        notifications.append({
            'title': 'Welcome Back, Administrator!',
            'message': f"Good {time_of_day}, {user.first_name}! System overview: {total_students} students, {total_teachers} teachers, {total_classes} classes.",
            'type': 'success',
            'priority': 'high',
            'actionUrl': '/admin',
            'timestamp': datetime.now()
        })
        
        # Check for new students (enrolled in last 7 days)
        week_ago = datetime.now().date() - timedelta(days=7)
        new_students = Student.objects.filter(enrollment_date__gte=week_ago).count()
        
        if new_students > 0:
            notifications.append({
                'title': 'New Student Registrations',
                'message': f'{new_students} new student(s) enrolled in the past week.',
                'type': 'info',
                'priority': 'medium',
                'actionUrl': '/admin/students',
                'timestamp': datetime.now()
            })
        
        # Check for classes without teachers
        unassigned_subjects = ClassSubject.objects.filter(is_active=True).count()
        assigned_subjects = TeacherAssignment.objects.filter(is_active=True).count()
        
        if unassigned_subjects > assigned_subjects:
            diff = unassigned_subjects - assigned_subjects
            notifications.append({
                'title': 'Teacher Assignment Needed',
                'message': f'{diff} class-subject combinations need teacher assignments.',
                'type': 'warning',
                'priority': 'high',
                'actionUrl': '/admin/teacher-assignments',
                'timestamp': datetime.now()
            })
        
        # Monthly report available
        now = datetime.now()
        if now.day == 1 or now.day == 15:  # 1st and 15th of month
            notifications.append({
                'title': 'Performance Report Available',
                'message': f'{now.strftime("%B %Y")} performance report is ready for review.',
                'type': 'info',
                'priority': 'low',
                'actionUrl': '/admin/reports',
                'timestamp': datetime.now()
            })
        
        return notifications
    
    def post(self, request):
        """Mark notification as read or create custom notification"""
        action = request.data.get('action')
        notification_id = request.data.get('id')
        
        if action == 'mark_read' and notification_id:
            try:
                notification = Notification.objects.get(id=notification_id, user=request.user)
                notification.is_read = True
                notification.save()
                return Response({'status': 'success', 'message': 'Notification marked as read'})
            except Notification.DoesNotExist:
                return Response({'status': 'error', 'message': 'Notification not found'}, status=404)
        
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
