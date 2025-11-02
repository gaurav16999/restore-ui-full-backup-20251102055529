from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_api.models import Student, Class, Grade, Attendance


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from admin_api.models import ClassSubject

            # Get student profile
            student = Student.objects.get(user=request.user)
            student_name = f"{
                request.user.first_name} {
                request.user.last_name}"

            # Find student's class and count enrolled courses
            student_class = Class.objects.filter(
                name=student.class_name).first()
            enrolled_courses = 0
            if student_class:
                enrolled_courses = ClassSubject.objects.filter(
                    class_assigned=student_class,
                    is_active=True
                ).count()

            # Calculate attendance percentage
            total_attendance = Attendance.objects.filter(
                student=student).count()
            present_count = Attendance.objects.filter(
                student=student, status='present').count()
            attendance_rate = round(
                (present_count / total_attendance * 100),
                1) if total_attendance > 0 else 0

            # Calculate average grade
            grades = Grade.objects.filter(student=student)
            avg_grade = round(
                sum([float(g.score) for g in grades]) / len(grades), 1) if grades else 0

            # Return structured student dashboard data
            data = {
                'user': request.user.username,
                'student_name': student_name,
                'class_name': student.class_name,
                'roll_no': student.roll_no,
                'stats': [
                    {'title': 'Enrolled Courses', 'value': str(enrolled_courses), 'color': 'primary'},
                    {'title': 'Attendance Rate', 'value': f'{attendance_rate}%', 'color': 'secondary'},
                    {'title': 'Average Grade', 'value': f'{avg_grade}%', 'color': 'accent'},
                    {'title': 'Achievements', 'value': '12', 'color': 'primary'},
                ],
                'upcoming_assignments': [
                    {'title': 'Math Assignment: Calculus', 'subject': 'Mathematics', 'due': 'Tomorrow, 11:59 PM', 'progress': 60, 'urgent': True},
                    {'title': 'Physics Lab Report', 'subject': 'Physics', 'due': 'In 3 days', 'progress': 30, 'urgent': False},
                    {'title': 'Chemistry Quiz Preparation', 'subject': 'Chemistry', 'due': 'In 5 days', 'progress': 0, 'urgent': False},
                    {'title': 'English Essay: Shakespeare', 'subject': 'English', 'due': 'Next week', 'progress': 45, 'urgent': False},
                ],
                'today_schedule': [
                    {'subject': 'Mathematics', 'time': '9:00 AM - 10:00 AM', 'room': 'Room 201', 'teacher': 'Mr. Smith'},
                    {'subject': 'Physics', 'time': '10:30 AM - 11:30 AM', 'room': 'Lab 3', 'teacher': 'Dr. Johnson'},
                    {'subject': 'Chemistry', 'time': '2:00 PM - 3:00 PM', 'room': 'Lab 2', 'teacher': 'Ms. Davis'},
                ],
                'recent_grades': [
                    {'subject': 'Mathematics', 'assessment': 'Midterm Exam', 'grade': 'A', 'score': '92/100', 'date': '2 days ago'},
                    {'subject': 'Physics', 'assessment': 'Lab Report 3', 'grade': 'B+', 'score': '87/100', 'date': '5 days ago'},
                    {'subject': 'Chemistry', 'assessment': 'Quiz 5', 'grade': 'A-', 'score': '89/100', 'date': '1 week ago'},
                    {'subject': 'English', 'assessment': 'Essay 2', 'grade': 'A', 'score': '94/100', 'date': '1 week ago'},
                ],
            }
            return Response(data)
        except Student.DoesNotExist:
            # Return default data if student profile doesn't exist
            data = {
                'user': request.user.username,
                'student_name': f"{request.user.first_name} {request.user.last_name}",
                'class_name': 'Not Assigned',
                'roll_no': 'N/A',
                'stats': [
                    {'title': 'Enrolled Courses', 'value': '8', 'color': 'primary'},
                    {'title': 'Attendance Rate', 'value': '92%', 'color': 'secondary'},
                    {'title': 'Average Grade', 'value': '85%', 'color': 'accent'},
                    {'title': 'Achievements', 'value': '12', 'color': 'primary'},
                ],
                'upcoming_assignments': [
                    {'title': 'Math Assignment: Calculus', 'subject': 'Mathematics', 'due': 'Tomorrow, 11:59 PM', 'progress': 60, 'urgent': True},
                    {'title': 'Physics Lab Report', 'subject': 'Physics', 'due': 'In 3 days', 'progress': 30, 'urgent': False},
                    {'title': 'Chemistry Quiz Preparation', 'subject': 'Chemistry', 'due': 'In 5 days', 'progress': 0, 'urgent': False},
                    {'title': 'English Essay: Shakespeare', 'subject': 'English', 'due': 'Next week', 'progress': 45, 'urgent': False},
                ],
                'today_schedule': [
                    {'subject': 'Mathematics', 'time': '9:00 AM - 10:00 AM', 'room': 'Room 201', 'teacher': 'Mr. Smith'},
                    {'subject': 'Physics', 'time': '10:30 AM - 11:30 AM', 'room': 'Lab 3', 'teacher': 'Dr. Johnson'},
                    {'subject': 'Chemistry', 'time': '2:00 PM - 3:00 PM', 'room': 'Lab 2', 'teacher': 'Ms. Davis'},
                ],
                'recent_grades': [
                    {'subject': 'Mathematics', 'assessment': 'Midterm Exam', 'grade': 'A', 'score': '92/100', 'date': '2 days ago'},
                    {'subject': 'Physics', 'assessment': 'Lab Report 3', 'grade': 'B+', 'score': '87/100', 'date': '5 days ago'},
                    {'subject': 'Chemistry', 'assessment': 'Quiz 5', 'grade': 'A-', 'score': '89/100', 'date': '1 week ago'},
                    {'subject': 'English', 'assessment': 'Essay 2', 'grade': 'A', 'score': '94/100', 'date': '1 week ago'},
                ],
            }
            return Response(data)


class CoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from admin_api.models import ClassSubject, TeacherAssignment

            student = Student.objects.get(user=request.user)

            # Find the student's class
            student_class = Class.objects.filter(
                name=student.class_name).first()

            if not student_class:
                return Response([])

            # Get all subjects assigned to this class
            class_subjects = ClassSubject.objects.filter(
                class_assigned=student_class,
                is_active=True
            ).select_related('subject')

            courses_data = []
            for cs in class_subjects:
                subject = cs.subject

                # Try to find teacher for this subject in this class
                teacher_assignment = TeacherAssignment.objects.filter(
                    class_assigned=student_class,
                    subject=subject,
                    is_active=True
                ).select_related('teacher__user').first()

                teacher_name = 'Not Assigned'
                if teacher_assignment:
                    teacher_user = teacher_assignment.teacher.user
                    teacher_name = f"{
                        teacher_user.first_name} {
                        teacher_user.last_name}"

                courses_data.append({
                    'id': subject.id,
                    'name': subject.title,
                    'code': subject.code,
                    'teacher': teacher_name,
                    'credits': subject.credit_hours,
                    'schedule': student_class.schedule or 'TBD',
                    'room': student_class.room,
                    'progress': 0,  # Can be calculated based on assignments
                    'status': 'enrolled' if cs.is_compulsory else 'optional',
                    'next_class': ''
                })

            return Response(courses_data)
        except Student.DoesNotExist:
            return Response([])
        except Exception as e:
            print(f"Error in CoursesView: {str(e)}")
            return Response({'error': str(e)}, status=500)


class AssignmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock assignments data
        assignments_data = [{'id': 1,
                             'title': 'Quadratic Equations Worksheet',
                             'subject': 'Mathematics',
                             'teacher': 'Prof. Anderson',
                             'due_date': '2025-10-20',
                             'submitted': False,
                             'grade': None,
                             'max_points': 100,
                             'description': 'Solve various quadratic equations using different methods',
                             'type': 'homework',
                             'priority': 'high'},
                            {'id': 2,
                             'title': 'Physics Lab Report',
                             'subject': 'Physics',
                             'teacher': 'Dr. Johnson',
                             'due_date': '2025-10-22',
                             'submitted': True,
                             'grade': 87,
                             'max_points': 100,
                             'description': 'Analysis of pendulum motion experiment',
                             'type': 'lab_report',
                             'priority': 'medium'},
                            {'id': 3,
                             'title': 'Chemistry Quiz Preparation',
                             'subject': 'Chemistry',
                             'teacher': 'Ms. Davis',
                             'due_date': '2025-10-25',
                             'submitted': False,
                             'grade': None,
                             'max_points': 50,
                             'description': 'Study chapter 5-7 for upcoming quiz',
                             'type': 'quiz',
                             'priority': 'medium'}]

        return Response(assignments_data)


class ScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock schedule data
        schedule_data = {'weekly_schedule': [{'day': 'Monday',
                                              'classes': [{'subject': 'Mathematics',
                                                           'time': '9:00 AM - 10:00 AM',
                                                           'room': 'Room 201',
                                                           'teacher': 'Prof. Anderson'},
                                                          {'subject': 'Chemistry',
                                                           'time': '2:00 PM - 3:00 PM',
                                                           'room': 'Lab 2',
                                                           'teacher': 'Ms. Davis'}]},
                                             {'day': 'Tuesday',
                                              'classes': [{'subject': 'Physics',
                                                           'time': '10:30 AM - 11:30 AM',
                                                           'room': 'Lab 3',
                                                           'teacher': 'Dr. Johnson'},
                                                          {'subject': 'English',
                                                           'time': '1:00 PM - 2:00 PM',
                                                           'room': 'Room 105',
                                                           'teacher': 'Ms. Wilson'}]},
                                             {'day': 'Wednesday',
                                              'classes': [{'subject': 'Mathematics',
                                                           'time': '9:00 AM - 10:00 AM',
                                                           'room': 'Room 201',
                                                           'teacher': 'Prof. Anderson'},
                                                          {'subject': 'Chemistry',
                                                           'time': '2:00 PM - 3:00 PM',
                                                           'room': 'Lab 2',
                                                           'teacher': 'Ms. Davis'}]},
                                             {'day': 'Thursday',
                                              'classes': [{'subject': 'Physics',
                                                           'time': '10:30 AM - 11:30 AM',
                                                           'room': 'Lab 3',
                                                           'teacher': 'Dr. Johnson'},
                                                          {'subject': 'History',
                                                           'time': '3:00 PM - 4:00 PM',
                                                           'room': 'Room 203',
                                                           'teacher': 'Mr. Brown'}]},
                                             {'day': 'Friday',
                                              'classes': [{'subject': 'Mathematics',
                                                           'time': '9:00 AM - 10:00 AM',
                                                           'room': 'Room 201',
                                                           'teacher': 'Prof. Anderson'},
                                                          {'subject': 'Biology',
                                                           'time': '11:00 AM - 12:00 PM',
                                                           'room': 'Lab 1',
                                                           'teacher': 'Dr. Green'}]}]}

        return Response(schedule_data)


class GradesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock grades data
        grades_data = [
            {
                'id': 1,
                'subject': 'Mathematics',
                'assessment': 'Midterm Exam',
                'grade': 'A',
                'score': 92,
                'max_score': 100,
                'percentage': 92,
                'date': '2025-10-14',
                'teacher': 'Prof. Anderson',
                'feedback': 'Excellent work on algebraic concepts!'
            },
            {
                'id': 2,
                'subject': 'Physics',
                'assessment': 'Lab Report 3',
                'grade': 'B+',
                'score': 87,
                'max_score': 100,
                'percentage': 87,
                'date': '2025-10-11',
                'teacher': 'Dr. Johnson',
                'feedback': 'Good analysis, but needs better conclusion.'
            },
            {
                'id': 3,
                'subject': 'Chemistry',
                'assessment': 'Quiz 5',
                'grade': 'A-',
                'score': 89,
                'max_score': 100,
                'percentage': 89,
                'date': '2025-10-09',
                'teacher': 'Ms. Davis',
                'feedback': 'Strong understanding of chemical reactions.'
            },
            {
                'id': 4,
                'subject': 'English',
                'assessment': 'Essay 2',
                'grade': 'A',
                'score': 94,
                'max_score': 100,
                'percentage': 94,
                'date': '2025-10-08',
                'teacher': 'Ms. Wilson',
                'feedback': 'Outstanding literary analysis!'
            }
        ]

        return Response(grades_data)


class AttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get student profile
            student = Student.objects.get(user=request.user)

            # Calculate overall attendance statistics
            total_attendance = Attendance.objects.filter(
                student=student).count()
            present_count = Attendance.objects.filter(
                student=student, status='present').count()
            absent_count = Attendance.objects.filter(
                student=student, status='absent').count()
            late_count = Attendance.objects.filter(
                student=student, status='late').count()

            overall_percentage = round(
                (present_count / total_attendance * 100),
                1) if total_attendance > 0 else 0

            # Get recent attendance records (last 10)
            recent_records = Attendance.objects.filter(
                student=student).order_by('-date')[:10]
            recent_attendance = []
            for record in recent_records:
                recent_attendance.append({
                    'date': record.date.isoformat(),
                    'subject': record.class_section.name if record.class_section else 'Unknown',
                    'status': record.status
                })

            attendance_data = {
                'overall_percentage': overall_percentage,
                'total_classes': total_attendance,
                'attended_classes': present_count,
                'absent_classes': absent_count,
                'late_classes': late_count,
                'subjects': [],  # Can be enhanced later with subject-wise breakdown
                'recent_attendance': recent_attendance
            }

            return Response(attendance_data)
        except Student.DoesNotExist:
            # Return empty data if student profile doesn't exist
            return Response({
                'overall_percentage': 0,
                'total_classes': 0,
                'attended_classes': 0,
                'absent_classes': 0,
                'late_classes': 0,
                'subjects': [],
                'recent_attendance': []
            })


class MessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock messages data
        messages_data = {'inbox': [{'id': 1,
                                    'sender': 'Prof. Anderson',
                                    'subject': 'Assignment Extension',
                                    'preview': 'Your request for extension has been approved...',
                                    'date': '2025-10-16',
                                    'read': False,
                                    'type': 'teacher'},
                                   {'id': 2,
                                    'sender': 'Academic Office',
                                    'subject': 'Exam Schedule Released',
                                    'preview': 'The final exam schedule has been posted...',
                                    'date': '2025-10-15',
                                    'read': True,
                                    'type': 'admin'}],
                         'sent': [{'id': 3,
                                   'recipient': 'Prof. Anderson',
                                   'subject': 'Question about Assignment',
                                   'preview': 'I have a question about problem 3 in the homework...',
                                   'date': '2025-10-14',
                                   'type': 'teacher'}],
                         'unread_count': 1}

        return Response(messages_data)


class AchievementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock achievements data
        achievements_data = [
            {
                'id': 1,
                'title': 'Honor Roll',
                'description': 'Achieved 90%+ average grade',
                'icon': 'trophy',
                'date_earned': '2025-10-15',
                'category': 'academic',
                'points': 100
            },
            {
                'id': 2,
                'title': 'Perfect Attendance',
                'description': 'No absences for 30 days',
                'icon': 'calendar',
                'date_earned': '2025-10-10',
                'category': 'attendance',
                'points': 50
            },
            {
                'id': 3,
                'title': 'Math Whiz',
                'description': 'Scored 95%+ on 5 consecutive math tests',
                'icon': 'calculator',
                'date_earned': '2025-10-05',
                'category': 'subject',
                'points': 75
            },
            {
                'id': 4,
                'title': 'Early Bird',
                'description': 'Never late to class for 2 weeks',
                'icon': 'clock',
                'date_earned': '2025-09-28',
                'category': 'behavior',
                'points': 25
            }
        ]

        return Response(achievements_data)
