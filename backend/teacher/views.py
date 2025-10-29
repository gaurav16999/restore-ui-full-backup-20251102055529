from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from admin_api.models import Teacher, Student, Class, Subject, Grade, Attendance, TeacherAssignment
from users.models import User as CustomUser
from datetime import datetime, date
import json


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get teacher instance
            teacher = Teacher.objects.get(user=request.user)
            
            # Calculate stats using TeacherAssignment
            teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher, is_active=True).select_related('class_assigned')
            teacher_classes = [assignment.class_assigned for assignment in teacher_assignments]
            total_students = Student.objects.filter(class_name__in=[cls.name for cls in teacher_classes]).count()
            all_students = Student.objects.filter(class_name__in=[cls.name for cls in teacher_classes])
            pending_grades = Grade.objects.filter(student__in=all_students).count()
            
            # Return structured teacher dashboard data
            data = {
                'user': request.user.username,
                'teacher_name': f"{request.user.first_name} {request.user.last_name}",
                'stats': [
                    { 'title': 'My Classes', 'value': str(teacher_classes.count()), 'color': 'primary' },
                    { 'title': 'Total Students', 'value': str(total_students), 'color': 'secondary' },
                    { 'title': 'Pending Grades', 'value': str(pending_grades), 'color': 'accent' },
                    { 'title': 'Subject', 'value': teacher.subject, 'color': 'primary' },
                ],
                'today_classes': [
                    {
                        'subject': teacher.subject,
                        'class': cls.name,
                        'time': f"{cls.schedule}" if cls.schedule else "TBD",
                        'room': cls.room,
                        'students': Student.objects.filter(class_name=cls.name).count()
                    } for cls in teacher_classes[:3]
                ],
                'pending_tasks': [
                    { 'task': 'Grade Assignments', 'class': cls.name, 'count': f"{Grade.objects.filter(student__class_name=cls.name).count()} assignments", 'priority': 'high' }
                    for cls in teacher_classes[:3]
                ],
                'top_students': []
            }
            return Response(data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClassesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            # Get all active assignments for this teacher
            assignments = TeacherAssignment.objects.filter(
                teacher=teacher, 
                is_active=True
            ).select_related('class_assigned', 'subject')
            
            classes_data = []
            for assignment in assignments:
                cls = assignment.class_assigned
                student_count = Student.objects.filter(class_name=cls.name).count()
                classes_data.append({
                    'id': cls.id,
                    'subject': assignment.subject.title,  # Subject from assignment
                    'name': cls.name,
                    'room': cls.room,
                    'schedule': cls.schedule,
                    'student_count': student_count,
                    'grade_level': cls.name.split()[0] if cls.name else '',
                    'section': cls.name.split()[-1] if len(cls.name.split()) > 1 else '',
                })
            
            return Response(classes_data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            # Get classes from teacher assignments
            teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher, is_active=True).select_related('class_assigned')
            teacher_classes = [assignment.class_assigned for assignment in teacher_assignments]
            
            class_id = request.GET.get('class_id')
            if class_id:
                teacher_classes = [cls for cls in teacher_classes if cls.id == int(class_id)]
            
            students = Student.objects.filter(class_name__in=[cls.name for cls in teacher_classes])
            
            students_data = []
            for student in students:
                # Calculate average grade
                grades = Grade.objects.filter(student=student)
                avg_score = sum([float(g.score) for g in grades]) / len(grades) if grades else 0
                
                # Calculate attendance percentage from actual attendance records
                total_attendance = Attendance.objects.filter(student=student).count()
                present_count = Attendance.objects.filter(student=student, status='present').count()
                attendance_percent = (present_count / total_attendance * 100) if total_attendance > 0 else 0
                
                students_data.append({
                    'id': student.id,
                    'name': f"{student.user.first_name} {student.user.last_name}",
                    'email': student.user.email,
                    'roll_no': student.roll_no,
                    'class_name': student.class_name,
                    'phone': student.phone,
                    'average_grade': round(avg_score, 2),
                    'attendance_percent': round(attendance_percent, 1),
                    'status': 'active' if student.user.is_active else 'inactive',
                    'performance': 'excellent' if avg_score >= 90 else 'good' if avg_score >= 75 else 'needs_attention'
                })
            
            return Response(students_data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GradesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            # Get classes from teacher assignments
            teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher, is_active=True).select_related('class_assigned')
            teacher_classes = [assignment.class_assigned for assignment in teacher_assignments]
            
            class_id = request.GET.get('class_id')
            if class_id:
                teacher_classes = [cls for cls in teacher_classes if cls.id == int(class_id)]
            
            students = Student.objects.filter(class_name__in=[cls.name for cls in teacher_classes])
            
            grades_data = []
            for student in students:
                student_grades = Grade.objects.filter(student=student)
                for grade in student_grades:
                    grades_data.append({
                        'id': grade.id,
                        'student_name': f"{student.user.first_name} {student.user.last_name}",
                        'student_id': student.id,
                        'class_name': student.class_name,
                        'subject': grade.subject.title if grade.subject else '',
                        'assessment': grade.grade_type,
                        'score': float(grade.score),
                        'max_score': float(grade.max_score),
                        'percentage': grade.percentage,
                        'grade': grade.letter_grade,
                        'submitted_date': grade.date_recorded.strftime('%Y-%m-%d'),
                        'graded_date': grade.created_at.strftime('%Y-%m-%d'),
                        'status': 'Graded',
                        'feedback': grade.notes or ''
                    })
            
            return Response(grades_data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            data = request.data
            
            student = Student.objects.get(id=data['student_id'])
            subject = Subject.objects.get(id=data['subject_id'])
            
            grade = Grade.objects.create(
                student=student,
                subject=subject,
                grade_type=data.get('grade_type', 'Assignment'),
                score=data['score'],
                max_score=data.get('max_score', 100),
                date_recorded=data.get('date', date.today()),
                notes=data.get('notes', '')
            )
            
            return Response({'id': grade.id, 'message': 'Grade created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AssignmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            # Get assignments for this teacher
            teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher, is_active=True).select_related('class_assigned', 'subject')
            
            # Mock assignments data (can be replaced with actual Assignment model)
            assignments_data = []
            for assignment in teacher_assignments:
                cls = assignment.class_assigned
                students_in_class = Student.objects.filter(class_name=cls.name)
                assignments_data.extend([
                    {
                        'id': f"{cls.id}_1",
                        'title': f"{assignment.subject.title} Assignment 1",
                        'class_name': cls.name,
                        'subject': assignment.subject.title,
                        'description': f'Practice problems for {assignment.subject.title}',
                        'due_date': '2025-10-20',
                        'status': 'active',
                        'max_marks': 100,
                        'submission_count': students_in_class.count(),
                        'total_students': students_in_class.count(),
                        'created_date': '2025-10-10',
                        'submissions': [
                            {
                                'id': f"{student.id}_sub_1",
                                'student_name': f"{student.user.first_name} {student.user.last_name}",
                                'student_id': student.id,
                                'submitted_at': '2025-10-18',
                                'grade': 85 if student.id % 2 == 0 else None,
                                'graded': student.id % 2 == 0,
                                'status': 'graded' if student.id % 2 == 0 else 'submitted'
                            } for student in students_in_class
                        ]
                    },
                    {
                        'id': f"{cls.id}_2",
                        'title': f"{teacher.subject} Quiz 1",
                        'class_name': cls.name,
                        'subject': teacher.subject,
                        'description': f'Weekly quiz for {teacher.subject}',
                        'due_date': '2025-10-25',
                        'status': 'active',
                        'max_marks': 50,
                        'submission_count': max(0, students_in_class.count() - 2),
                        'total_students': students_in_class.count(),
                        'created_date': '2025-10-12',
                        'submissions': [
                            {
                                'id': f"{student.id}_sub_2",
                                'student_name': f"{student.user.first_name} {student.user.last_name}",
                                'student_id': student.id,
                                'submitted_at': '2025-10-19',
                                'grade': None,
                                'graded': False,
                                'status': 'submitted'
                            } for student in students_in_class[:max(0, students_in_class.count() - 2)]
                        ]
                    }
                ])
            
            return Response(assignments_data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AssignmentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            data = request.data
            
            # Mock assignment creation (implement with actual Assignment model)
            assignment_data = {
                'id': f"new_{datetime.now().timestamp()}",
                'title': data['title'],
                'description': data.get('description', ''),
                'class_id': data['class_id'],
                'due_date': data['due_date'],
                'status': 'active',
                'created_date': date.today().isoformat()
            }
            
            return Response(assignment_data, status=status.HTTP_201_CREATED)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            # Mock messages data (implement with actual Message model)
            messages_data = {
                'inbox': [
                    {
                        'id': 1,
                        'sender': 'Parent - John Smith',
                        'subject': 'Question about homework',
                        'preview': 'I wanted to ask about the math homework assigned yesterday...',
                        'date': '2025-10-16',
                        'read': False,
                        'type': 'parent'
                    },
                    {
                        'id': 2,
                        'sender': 'Admin Office',
                        'subject': 'Staff Meeting Reminder',
                        'preview': 'Reminder about the staff meeting scheduled for tomorrow...',
                        'date': '2025-10-15',
                        'read': True,
                        'type': 'admin'
                    }
                ],
                'sent': [
                    {
                        'id': 3,
                        'recipient': 'Parent - Emma Wilson',
                        'subject': 'Great progress in class',
                        'preview': 'I wanted to let you know that Emma has been doing excellent work...',
                        'date': '2025-10-14',
                        'type': 'parent'
                    }
                ],
                'unread_count': 1
            }
            
            return Response(messages_data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            data = request.data
            
            # Mock message sending (implement with actual Message model)
            message_data = {
                'id': f"msg_{datetime.now().timestamp()}",
                'recipient': data['recipient'],
                'subject': data['subject'],
                'message': data['message'],
                'sent_date': datetime.now().isoformat(),
                'status': 'sent'
            }
            
            return Response(message_data, status=status.HTTP_201_CREATED)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ResourcesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            # Get assignments for this teacher
            teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher, is_active=True).select_related('class_assigned', 'subject')
            
            # Mock resources data (implement with actual Resource model)
            resources_data = []
            for assignment in teacher_assignments:
                cls = assignment.class_assigned
                resources_data.extend([
                    {
                        'id': f"{cls.id}_res_1",
                        'title': f"{assignment.subject.title} Lesson Plan 1",
                        'type': 'document',
                        'subject': assignment.subject.title,
                        'class_name': cls.name,
                        'file_size': '2.5 MB',
                        'upload_date': '2025-10-10',
                        'downloads': 15,
                        'shared': True
                    },
                    {
                        'id': f"{cls.id}_res_2",
                        'title': f"{cls.subject.name} Practice Questions" if cls.subject else "Practice Questions",
                        'type': 'worksheet',
                        'subject': cls.subject.name if cls.subject else 'Unknown',
                        'class_name': cls.name,
                        'file_size': '1.8 MB',
                        'upload_date': '2025-10-12',
                        'downloads': 8,
                        'shared': False
                    }
                ])
            
            return Response(resources_data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UploadResourceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            # Mock file upload (implement with actual file handling)
            resource_data = {
                'id': f"res_{datetime.now().timestamp()}",
                'title': request.data.get('title', 'Untitled Resource'),
                'type': request.data.get('type', 'document'),
                'subject': request.data.get('subject', ''),
                'upload_date': date.today().isoformat(),
                'status': 'uploaded'
            }
            
            return Response(resource_data, status=status.HTTP_201_CREATED)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            class_id = request.GET.get('class_id')
            date_param = request.GET.get('date', date.today().isoformat())
            
            if class_id:
                # Check if teacher is assigned to this class via TeacherAssignment
                assignment = TeacherAssignment.objects.filter(
                    teacher=teacher, 
                    class_assigned_id=class_id,
                    is_active=True
                ).select_related('class_assigned').first()
                
                if not assignment:
                    return Response({'error': 'Class not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)
                
                cls = assignment.class_assigned
                # Filter students by the class name string, not the Class instance
                students = Student.objects.filter(class_name=cls.name)
                
                attendance_data = []
                for student in students:
                    attendance_record = Attendance.objects.filter(
                        student=student, 
                        date=date_param
                    ).first()
                    
                    attendance_data.append({
                        'student_id': student.id,
                        'student_name': f"{student.user.first_name} {student.user.last_name}",
                        'roll_no': student.roll_no,
                        'status': attendance_record.status if attendance_record else 'not_marked'
                    })
                
                return Response({
                    'class_name': cls.name,
                    'date': date_param,
                    'attendance': attendance_data
                })
            else:
                # Get classes from teacher assignments
                teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher, is_active=True).select_related('class_assigned')
                teacher_classes = [assignment.class_assigned for assignment in teacher_assignments]
                return Response([{
                    'id': cls.id,
                    'name': cls.name,
                    'student_count': Student.objects.filter(class_name=cls.name).count()
                } for cls in teacher_classes])
                
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AttendanceSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            data = request.data
            
            class_id = data.get('class_id')
            attendance_date = data.get('date')
            attendance_records = data.get('attendance')
            
            # Validate required fields
            if not class_id or not attendance_date or not attendance_records:
                return Response({
                    'error': 'Missing required fields: class_id, date, or attendance'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if teacher is assigned to this class via TeacherAssignment
            assignment = TeacherAssignment.objects.filter(
                teacher=teacher, 
                class_assigned_id=class_id,
                is_active=True
            ).select_related('class_assigned').first()
            
            if not assignment:
                return Response({'error': 'Class not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)
            
            cls = assignment.class_assigned
            
            # We need to find or create a ClassRoom for this class
            # Check if there's a ClassRoom that matches this class
            from admin_api.models import ClassRoom
            
            # Try to find a matching ClassRoom
            class_room = ClassRoom.objects.filter(name=cls.name).first()
            if not class_room:
                # If no ClassRoom exists, we can't record attendance
                return Response({
                    'error': 'No classroom found for this class. Please contact admin.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            for record in attendance_records:
                student = Student.objects.get(id=record['student_id'])
                attendance, created = Attendance.objects.get_or_create(
                    student=student,
                    date=attendance_date,
                    class_section=class_room,
                    defaults={
                        'status': record['status'],
                        'recorded_by': teacher
                    }
                )
                if not created:
                    attendance.status = record['status']
                    attendance.recorded_by = teacher
                    attendance.save()
            
            return Response({'message': 'Attendance submitted successfully'}, status=status.HTTP_200_OK)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except KeyError as e:
            return Response({'error': f'Missing required field: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(f"Attendance submit error: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
