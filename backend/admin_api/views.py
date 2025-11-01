from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets
from rest_framework.decorators import action
import logging
from django.db.models import Avg, Sum
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from .models import (
    Student,
    Teacher,
    Class,
    Subject,
    Activity,
    Event,
    Grade,
    Exam,
    ExamSchedule,
    ExamResult,
    FeeStructure,
    FeePayment,
    Assignment,
    AssignmentSubmission,
    AdmissionQuery,
    VisitorBook,
    Complaint,
    PostalReceive,
    PostalDispatch,
    PhoneCallLog)
from .serializers import (
    StudentSerializer, TeacherSerializer, ClassSerializer,
    SubjectSerializer, ActivitySerializer, EventSerializer,
    GradeSerializer, GradeStatsSerializer,
    DashboardStatsSerializer,
    ExamSerializer, ExamScheduleSerializer, ExamResultSerializer,
    StudentExamPerformanceSerializer,
    FeeStructureSerializer, FeePaymentSerializer, StudentFeeStatusSerializer,
    AssignmentSerializer, AssignmentSubmissionSerializer,
    AdmissionQuerySerializer, VisitorBookSerializer, ComplaintSerializer,
    PostalReceiveSerializer, PostalDispatchSerializer, PhoneCallLogSerializer
)

User = get_user_model()

logger = logging.getLogger(__name__)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calculate statistics
        total_students = Student.objects.filter(is_active=True).count()
        total_teachers = Teacher.objects.filter(is_active=True).count()
        active_classes = Class.objects.filter(is_active=True).count()

        stats = {
            'total_students': total_students,
            'total_teachers': total_teachers,
            'active_classes': active_classes,
            'monthly_revenue': '$45.2K',
            'students_change': '+12%',
            'teachers_change': '+3%',
            'classes_change': '+5%',
            'revenue_change': '+8%',
        }

        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)


class RecentActivitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        activities = Activity.objects.all()[:10]
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)


class UpcomingEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        events = Event.objects.all()[:10]
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)


class StudentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        students = Student.objects.all().select_related('user')
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            student = Student.objects.select_related('user').get(pk=pk)
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            student = Student.objects.select_related('user').get(pk=pk)
            data = request.data.copy()

            # Update user fields if provided
            if student.user:
                user = student.user
                if 'username' in data:
                    user.username = data.pop('username')
                if 'email' in data:
                    user.email = data.pop('email')
                if 'first_name' in data:
                    user.first_name = data.pop('first_name')
                if 'last_name' in data:
                    user.last_name = data.pop('last_name')
                if 'password' in data and data['password']:
                    user.set_password(data.pop('password'))
                user.save()

            # Update student fields
            serializer = StudentSerializer(student, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            student = Student.objects.select_related('user').get(pk=pk)

            # Handle status toggle
            if 'toggle_status' in request.data:
                student.is_active = not student.is_active
                student.save()
                serializer = StudentSerializer(student)
                return Response(serializer.data)

            # Regular patch update
            data = request.data.copy()

            # Update user fields if provided
            if student.user:
                user = student.user
                if 'username' in data:
                    user.username = data.pop('username')
                if 'email' in data:
                    user.email = data.pop('email')
                if 'first_name' in data:
                    user.first_name = data.pop('first_name')
                if 'last_name' in data:
                    user.last_name = data.pop('last_name')
                if 'password' in data and data['password']:
                    user.set_password(data.pop('password'))
                user.save()

            # Update student fields
            serializer = StudentSerializer(student, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            student = Student.objects.get(pk=pk)
            student.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'},
                            status=status.HTTP_404_NOT_FOUND)


class StudentStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = Student.objects.count()
        active = Student.objects.filter(is_active=True).count()
        avg_attendance = Student.objects.aggregate(Avg('attendance_percentage'))[
            'attendance_percentage__avg'] or 0

        # New students this month (simplified - counts last 30 records)
        new_this_month = Student.objects.order_by(
            '-enrollment_date')[:54].count()

        return Response({
            'total': total,
            'active': active,
            'new_this_month': new_this_month,
            'avg_attendance': f"{avg_attendance:.1f}%"
        })


class TeacherListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teachers = Teacher.objects.all().select_related('user')
        serializer = TeacherSerializer(teachers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TeacherSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            teacher = Teacher.objects.select_related('user').get(pk=pk)
            serializer = TeacherSerializer(teacher)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            teacher = Teacher.objects.select_related('user').get(pk=pk)
            data = request.data.copy()

            # Update user fields if provided
            if teacher.user:
                user = teacher.user
                if 'username' in data:
                    user.username = data.pop('username')
                if 'email' in data:
                    user.email = data.pop('email')
                if 'first_name' in data:
                    user.first_name = data.pop('first_name')
                if 'last_name' in data:
                    user.last_name = data.pop('last_name')
                if 'password' in data and data['password']:
                    user.set_password(data.pop('password'))
                user.save()

            # Update teacher fields
            serializer = TeacherSerializer(teacher, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            teacher = Teacher.objects.select_related('user').get(pk=pk)

            # Handle status toggle
            if 'toggle_status' in request.data:
                teacher.is_active = not teacher.is_active
                teacher.save()
                serializer = TeacherSerializer(teacher)
                return Response(serializer.data)

            # Regular patch update
            data = request.data.copy()

            # Update user fields if provided
            if teacher.user:
                user = teacher.user
                if 'username' in data:
                    user.username = data.pop('username')
                if 'email' in data:
                    user.email = data.pop('email')
                if 'first_name' in data:
                    user.first_name = data.pop('first_name')
                if 'last_name' in data:
                    user.last_name = data.pop('last_name')
                if 'password' in data and data['password']:
                    user.set_password(data.pop('password'))
                user.save()

            # Update teacher fields
            serializer = TeacherSerializer(teacher, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            teacher = Teacher.objects.get(pk=pk)
            teacher.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'},
                            status=status.HTTP_404_NOT_FOUND)


class TeacherStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = Teacher.objects.count()
        active = Teacher.objects.filter(is_active=True).count()
        total_classes = Class.objects.filter(is_active=True).count()
        total_students = Student.objects.filter(is_active=True).count()

        teacher_student_ratio = f"1:{int(total_students /
                                         total) if total > 0 else 0}"

        return Response({
            'total': total,
            'active': active,
            'total_classes': total_classes,
            'teacher_student_ratio': teacher_student_ratio
        })


class ClassListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        classes = Class.objects.all().select_related('teacher__user')
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ClassSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClassDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            class_obj = Class.objects.select_related(
                'teacher__user').get(pk=pk)
            serializer = ClassSerializer(class_obj)
            return Response(serializer.data)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            class_obj = Class.objects.get(pk=pk)
            serializer = ClassSerializer(
                class_obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            class_obj = Class.objects.get(pk=pk)
            class_obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'},
                            status=status.HTTP_404_NOT_FOUND)


class ClassStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_classes = Class.objects.filter(is_active=True).count()
        total_subjects = Subject.objects.count()
        total_students = Student.objects.filter(is_active=True).count()
        avg_class_size = int(total_students /
                             total_classes) if total_classes > 0 else 0
        active_sessions = Class.objects.filter(is_active=True)[:12].count()

        return Response({
            'total_classes': total_classes,
            'total_subjects': total_subjects,
            'avg_class_size': avg_class_size,
            'active_sessions': active_sessions
        })


class SubjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subjects = Subject.objects.all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            subject = Subject.objects.get(pk=pk)
            serializer = SubjectSerializer(subject)
            return Response(serializer.data)
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            subject = Subject.objects.get(pk=pk)
            serializer = SubjectSerializer(
                subject, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            subject = Subject.objects.get(pk=pk)
            subject.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'},
                            status=status.HTTP_404_NOT_FOUND)


class StudentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Extract user data
            username = request.data.get('username')
            email = request.data.get('email')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            password = request.data.get('password', 'student123')

            # Student specific data
            roll_no = request.data.get('roll_no')
            class_name = request.data.get('class_name')
            phone = request.data.get('phone')

            # Validate required fields
            if not username or not email or not roll_no or not class_name:
                return Response({
                    'error': 'Missing required fields: username, email, roll_no, class_name'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if username already exists
            if User.objects.filter(username=username).exists():
                return Response({
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if roll number already exists
            if Student.objects.filter(roll_no=roll_no).exists():
                return Response({
                    'error': 'Roll number already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create user account
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=password,
                role='student'
            )

            # Create student profile
            student = Student.objects.create(
                user=user,
                roll_no=roll_no,
                class_name=class_name,
                phone=phone,
                attendance_percentage=0,
                is_active=True
            )

            # Log activity
            Activity.objects.create(
                action=f'New student enrolled: {
                    user.get_full_name() or username}',
                user='Admin',
                activity_type='enrollment')

            serializer = StudentSerializer(student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class TeacherCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Extract user data
            username = request.data.get('username')
            email = request.data.get('email')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            password = request.data.get('password', 'teacher123')

            # Teacher specific data
            subject = request.data.get('subject')
            phone = request.data.get('phone')

            # Validate required fields
            if not username or not email or not subject:
                return Response({
                    'error': 'Missing required fields: username, email, subject'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if username already exists
            if User.objects.filter(username=username).exists():
                return Response({
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create user account
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=password,
                role='teacher'
            )

            # Create teacher profile
            teacher = Teacher.objects.create(
                user=user,
                subject=subject,
                phone=phone,
                classes_count=0,
                students_count=0,
                is_active=True
            )

            # Log activity
            Activity.objects.create(
                action=f'New teacher added: {
                    user.get_full_name() or username}',
                user='Admin',
                activity_type='assignment')

            serializer = TeacherSerializer(teacher)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ClassCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            name = request.data.get('name')
            room = request.data.get('room')
            schedule = request.data.get('schedule')
            teacher_id = request.data.get('teacher_id')

            # Validate required fields
            if not name or not room:
                return Response({
                    'error': 'Missing required fields: name, room'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if class name already exists
            if Class.objects.filter(name=name).exists():
                return Response({
                    'error': 'Class name already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            teacher = None
            if teacher_id:
                try:
                    teacher = Teacher.objects.get(pk=teacher_id)
                except Teacher.DoesNotExist:
                    pass

            # Create class
            class_obj = Class.objects.create(
                name=name,
                room=room,
                schedule=schedule or '',
                teacher=teacher,
                students_count=0,
                subjects_count=0,
                is_active=True
            )

            # Log activity
            Activity.objects.create(
                action=f'New class created: {name}',
                user='Admin',
                activity_type='class'
            )

            serializer = ClassSerializer(class_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class SubjectCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Debug: print incoming payload for troubleshooting is_practical
            try:
                print('SubjectCreateView received payload:', request.data)
            except Exception:
                pass
            # Support both 'title' (current) and legacy 'name' field from older
            # clients
            title = request.data.get('title') or request.data.get('name')
            code = request.data.get('code')
            description = request.data.get('description', '')
            credit_hours = request.data.get('credit_hours', 1)
            # Accept either `subject_type` (preferred) or legacy `is_practical`
            # boolean
            subject_type = request.data.get('subject_type')
            is_practical = request.data.get('is_practical', False)
            if not subject_type:
                # derive subject_type from boolean if provided
                subject_type = 'practical' if bool(is_practical) else 'theory'

            # Validate required fields
            if not title:
                return Response(
                    {'error': 'Missing required field: title'}, status=status.HTTP_400_BAD_REQUEST)

            # Auto-generate code if missing (basic fallback)
            if not code:
                base = ''.join(
                    ch for ch in title.upper() if ch.isalnum())[
                    :6] or 'SUBJ'
                candidate = base
                i = 1
                while Subject.objects.filter(code=candidate).exists():
                    i += 1
                    candidate = f"{base}{i}"
                code = candidate

            # Check if subject already exists by code or title
            if Subject.objects.filter(
                    code=code).exists() or Subject.objects.filter(
                    title=title).exists():
                return Response(
                    {
                        'error': 'Subject with same code or title already exists'},
                    status=status.HTTP_400_BAD_REQUEST)

            # Create subject using current model field names
            subject = Subject.objects.create(
                code=code,
                title=title,
                description=description,
                credit_hours=credit_hours,
                is_practical=bool(is_practical),
                subject_type=subject_type,
                classes_count=0,
                teachers_count=0,
                students_count=0,
                is_active=True
            )

            # Debug: print created object's is_practical
            try:
                print(
                    f'Subject created: id={
                        subject.id} is_practical={
                        subject.is_practical} code={
                        subject.code} title={
                        subject.title}')
            except Exception:
                pass

            serializer = SubjectSerializer(subject)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Return error message for debugging; clients should see 400 for
            # validation issues
            return Response({'error': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


# Grade Management Views
class GradeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        grades = Grade.objects.all().select_related('student__user', 'subject')
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GradeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            # Log activity
            Activity.objects.create(
                action=f'New grade added for {
                    serializer.instance.student.user.get_full_name()}',
                user='Admin',
                activity_type='assignment')

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GradeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            grade = Grade.objects.select_related(
                'student__user', 'subject').get(pk=pk)
            serializer = GradeSerializer(grade)
            return Response(serializer.data)
        except Grade.DoesNotExist:
            return Response({'error': 'Grade not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            grade = Grade.objects.get(pk=pk)
            serializer = GradeSerializer(
                grade, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
        except Grade.DoesNotExist:
            return Response({'error': 'Grade not found'},
                            status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            grade = Grade.objects.get(pk=pk)
            grade.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Grade.DoesNotExist:
            return Response({'error': 'Grade not found'},
                            status=status.HTTP_404_NOT_FOUND)


class GradeStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calculate grade statistics
        total_grades = Grade.objects.count()

        # Grades added this week
        week_ago = datetime.now() - timedelta(days=7)
        grades_this_week = Grade.objects.filter(
            created_at__gte=week_ago).count()

        # Class average
        all_grades = Grade.objects.all()
        if all_grades.exists():
            total_percentage = sum([grade.percentage for grade in all_grades])
            class_average = round(total_percentage / total_grades, 1)
        else:
            class_average = 0

        # Top performers (A grade - 90% and above)
        top_performers = sum(
            [1 for grade in all_grades if grade.percentage >= 90])

        # Pending grades (mock data - could be assignments without grades)
        pending_grades = 12  # This could be calculated based on assignments without grades

        stats = {
            'total_grades': total_grades,
            'grades_this_week': grades_this_week,
            'class_average': class_average,
            'top_performers': top_performers,
            'pending_grades': pending_grades
        }

        serializer = GradeStatsSerializer(stats)
        return Response(serializer.data)


# Reports and Analytics Views
class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Generate student report cards
        students = Student.objects.filter(
            is_active=True).select_related('user')
        reports = []

        for student in students:
            grades = Grade.objects.filter(student=student)
            if grades.exists():
                total_percentage = sum([grade.percentage for grade in grades])
                overall_average = round(total_percentage / grades.count(), 1)
            else:
                overall_average = 0

            # Calculate rank (simplified)
            all_students = Student.objects.filter(is_active=True)
            rank = 1
            for other_student in all_students:
                other_grades = Grade.objects.filter(student=other_student)
                if other_grades.exists():
                    other_avg = sum(
                        [g.percentage for g in other_grades]) / other_grades.count()
                    if other_avg > overall_average:
                        rank += 1

            # Mock subject-wise data
            subjects_data = [
                {'name': 'Mathematics', 'average': overall_average + 5},
                {'name': 'Science', 'average': overall_average - 3},
                {'name': 'English', 'average': overall_average + 2},
                {'name': 'History', 'average': overall_average - 1},
            ]

            reports.append({
                'id': student.id,
                'student_name': student.user.get_full_name() or student.user.username,
                'roll_no': student.roll_no,
                'class_name': student.class_name,
                'overall_average': overall_average,
                'rank': rank,
                'attendance': float(student.attendance_percentage),
                'subjects': subjects_data
            })

        return Response(reports)


class ClassAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calculate class analytics
        all_grades = Grade.objects.all()

        if all_grades.exists():
            total_percentage = sum([grade.percentage for grade in all_grades])
            class_average = round(total_percentage / all_grades.count(), 1)

            # Top performers (A grade - 90% and above)
            top_performers = sum(
                [1 for grade in all_grades if grade.percentage >= 90])

            # At risk students (below 60%)
            at_risk = sum([1 for grade in all_grades if grade.percentage < 60])
        else:
            class_average = 0
            top_performers = 0
            at_risk = 0

        # Mock improvement rate
        improvement_rate = 78
        trend = 2.5

        analytics = {
            'class_average': class_average,
            'top_performers': top_performers,
            'at_risk': at_risk,
            'improvement_rate': improvement_rate,
            'trend': trend
        }

        return Response(analytics)


class StudentProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Generate student progress data
        students = Student.objects.filter(
            is_active=True).select_related('user')[:10]
        progress_data = []

        for student in students:
            grades = Grade.objects.filter(student=student)
            if grades.exists():
                current_average = round(
                    sum([grade.percentage for grade in grades]) / grades.count(), 1)
            else:
                current_average = 75

            # Mock trend data
            import random
            trend = random.randint(-10, 15)

            progress_data.append({
                'name': student.user.get_full_name() or student.user.username,
                'roll_no': student.roll_no,
                'class': student.class_name,
                'current_average': current_average,
                'trend': trend
            })

        return Response(progress_data)


class GradeDistributionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calculate grade distribution
        all_grades = Grade.objects.all()
        distribution = {
            'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
        }

        for grade in all_grades:
            letter_grade = grade.letter_grade
            if letter_grade in distribution:
                distribution[letter_grade] += 1

        # Convert to list format for frontend
        distribution_list = [{'grade': grade,
                              'count': count,
                              'percentage': round((count / len(all_grades)) * 100,
                                                  1) if all_grades.exists() else 0} for grade,
                             count in distribution.items()]

        return Response(distribution_list)


# ==================== EXAM MANAGEMENT VIEWS ====================

class ExamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exams
    """
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get all results for a specific exam"""
        exam = self.get_object()
        results = ExamResult.objects.filter(exam=exam)
        serializer = ExamResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def schedules(self, request, pk=None):
        """Get all schedules for a specific exam"""
        exam = self.get_object()
        schedules = ExamSchedule.objects.filter(exam=exam)
        serializer = ExamScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish exam to make it visible to students"""
        exam = self.get_object()
        exam.is_published = True
        exam.save()
        return Response({'status': 'Exam published successfully'})

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Unpublish exam"""
        exam = self.get_object()
        exam.is_published = False
        exam.save()
        return Response({'status': 'Exam unpublished successfully'})


class ExamScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exam schedules
    """
    queryset = ExamSchedule.objects.all()
    serializer_class = ExamScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ExamSchedule.objects.all()
        exam_id = self.request.query_params.get('exam', None)
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        return queryset


class ExamResultViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exam results
    """
    queryset = ExamResult.objects.all()
    serializer_class = ExamResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            entered_by=self.request.user.teacher_profile if hasattr(
                self.request.user,
                'teacher_profile') else None)

    def get_queryset(self):
        queryset = ExamResult.objects.all()
        exam_id = self.request.query_params.get('exam', None)
        student_id = self.request.query_params.get('student', None)

        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        return queryset

    @action(detail=False, methods=['get'])
    def student_performance(self, request):
        """Get performance summary for all students"""
        students = Student.objects.filter(is_active=True)
        performance_data = []

        for student in students:
            results = ExamResult.objects.filter(student=student)
            total_exams = results.count()

            if total_exams > 0:
                avg_percentage = results.aggregate(
                    avg=Avg('marks_obtained') * 100 / Avg('max_marks')
                )['avg'] or 0
                passed_count = results.filter(marks_obtained__gte=40).count()
                failed_count = results.filter(
                    marks_obtained__lt=40, is_absent=False).count()
                absent_count = results.filter(is_absent=True).count()

                # Determine overall grade
                if avg_percentage >= 90:
                    overall_grade = 'A+'
                elif avg_percentage >= 80:
                    overall_grade = 'A'
                elif avg_percentage >= 70:
                    overall_grade = 'B'
                elif avg_percentage >= 60:
                    overall_grade = 'C'
                elif avg_percentage >= 50:
                    overall_grade = 'D'
                else:
                    overall_grade = 'F'

                performance_data.append({
                    'student_id': student.id,
                    'student_name': student.get_full_name(),
                    'roll_no': student.roll_no,
                    'total_exams': total_exams,
                    'average_percentage': round(avg_percentage, 2),
                    'passed_count': passed_count,
                    'failed_count': failed_count,
                    'absent_count': absent_count,
                    'overall_grade': overall_grade
                })

        serializer = StudentExamPerformanceSerializer(
            performance_data, many=True)
        return Response(serializer.data)


# ==================== FEE MANAGEMENT VIEWS ====================

class FeeStructureViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing fee structures
    """
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FeeStructure.objects.all()
        class_id = self.request.query_params.get('class', None)
        is_active = self.request.query_params.get('active', None)

        if class_id:
            queryset = queryset.filter(class_assigned_id=class_id)
        if is_active:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset


class FeePaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing fee payments
    """
    queryset = FeePayment.objects.all()
    serializer_class = FeePaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Generate receipt number
        last_payment = FeePayment.objects.order_by('-id').first()
        if last_payment and last_payment.receipt_number:
            last_number = int(last_payment.receipt_number.split('-')[1])
            new_number = f"RCP-{str(last_number + 1).zfill(6)}"
        else:
            new_number = "RCP-000001"

        serializer.save(
            collected_by=self.request.user,
            receipt_number=new_number
        )

    def get_queryset(self):
        queryset = FeePayment.objects.all()
        student_id = self.request.query_params.get('student', None)
        status_filter = self.request.query_params.get('status', None)

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    @action(detail=False, methods=['get'])
    def student_fee_status(self, request):
        """Get fee status for all students"""
        students = Student.objects.filter(is_active=True)
        fee_status_data = []

        for student in students:
            total_fees = FeeStructure.objects.filter(
                class_assigned__enrollments__student=student,
                is_active=True
            ).aggregate(total=Sum('amount'))['total'] or 0

            paid_amount = FeePayment.objects.filter(
                student=student,
                status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0

            pending_amount = total_fees - paid_amount

            overdue = FeePayment.objects.filter(
                student=student,
                status='pending',
                due_date__lt=timezone.now().date()
            ).aggregate(total=Sum('amount'))['total'] or 0

            last_payment = FeePayment.objects.filter(
                student=student,
                status='paid'
            ).order_by('-payment_date').first()

            fee_status_data.append({
                'student_id': student.id,
                'student_name': student.get_full_name(),
                'roll_no': student.roll_no,
                'total_fees': total_fees,
                'paid_amount': paid_amount,
                'pending_amount': pending_amount,
                'overdue_amount': overdue,
                'last_payment_date': last_payment.payment_date if last_payment else None
            })

        serializer = StudentFeeStatusSerializer(fee_status_data, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a fee payment as paid"""
        payment = self.get_object()
        payment.status = 'paid'
        payment.payment_date = timezone.now().date()
        payment.save()
        return Response({'status': 'Payment marked as paid'})


# ==================== ASSIGNMENT MANAGEMENT VIEWS ====================

class AssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assignments
    """
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user.teacher_profile if hasattr(
                self.request.user,
                'teacher_profile') else None)

    def get_queryset(self):
        queryset = Assignment.objects.all()
        class_id = self.request.query_params.get('class', None)
        subject_id = self.request.query_params.get('subject', None)
        status_filter = self.request.query_params.get('status', None)

        if class_id:
            queryset = queryset.filter(class_assigned_id=class_id)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Get all submissions for an assignment"""
        assignment = self.get_object()
        submissions = AssignmentSubmission.objects.filter(
            assignment=assignment)
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish assignment"""
        assignment = self.get_object()
        assignment.status = 'published'
        assignment.save()
        return Response({'status': 'Assignment published successfully'})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close assignment for submissions"""
        assignment = self.get_object()
        assignment.status = 'closed'
        assignment.save()
        return Response({'status': 'Assignment closed successfully'})


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assignment submissions
    """
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AssignmentSubmission.objects.all()
        assignment_id = self.request.query_params.get('assignment', None)
        student_id = self.request.query_params.get('student', None)
        status_filter = self.request.query_params.get('status', None)

        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if status_filter:
            queryset = queryset.filter(submission_status=status_filter)

        return queryset

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Grade an assignment submission"""
        submission = self.get_object()
        marks = request.data.get('marks_obtained')
        feedback = request.data.get('feedback', '')

        if marks is None:
            return Response(
                {'error': 'Marks are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        submission.marks_obtained = marks
        submission.feedback = feedback
        submission.submission_status = 'graded'
        submission.graded_by = self.request.user.teacher_profile if hasattr(
            self.request.user, 'teacher_profile') else None
        submission.graded_at = timezone.now()
        submission.save()

        return Response({'status': 'Assignment graded successfully'})


# ==================== Admin Section ViewSets ====================

class AdmissionQueryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing admission queries"""
    queryset = AdmissionQuery.objects.all()
    serializer_class = AdmissionQuerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        # Filter by source if provided
        source_param = self.request.query_params.get('source', None)
        if source_param:
            queryset = queryset.filter(source=source_param)
        return queryset


class VisitorBookViewSet(viewsets.ModelViewSet):
    """ViewSet for managing visitor records"""
    queryset = VisitorBook.objects.all()
    serializer_class = VisitorBookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by date if provided
        date_param = self.request.query_params.get('date', None)
        if date_param:
            queryset = queryset.filter(date=date_param)
        return queryset


class ComplaintViewSet(viewsets.ModelViewSet):
    """ViewSet for managing complaints"""
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        # Filter by type if provided
        type_param = self.request.query_params.get('complaint_type', None)
        if type_param:
            queryset = queryset.filter(complaint_type=type_param)
        return queryset


class PostalReceiveViewSet(viewsets.ModelViewSet):
    """ViewSet for managing incoming postal"""
    queryset = PostalReceive.objects.all()
    serializer_class = PostalReceiveSerializer
    permission_classes = [IsAuthenticated]


class PostalDispatchViewSet(viewsets.ModelViewSet):
    """ViewSet for managing outgoing postal"""
    queryset = PostalDispatch.objects.all()
    serializer_class = PostalDispatchSerializer
    permission_classes = [IsAuthenticated]


class PhoneCallLogViewSet(viewsets.ModelViewSet):
    """ViewSet for managing phone call logs"""
    queryset = PhoneCallLog.objects.all()
    serializer_class = PhoneCallLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by call type if provided
        call_type_param = self.request.query_params.get('call_type', None)
        if call_type_param:
            queryset = queryset.filter(call_type=call_type_param)
        return queryset
