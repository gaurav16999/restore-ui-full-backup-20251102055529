from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Avg
from django.contrib.auth import get_user_model
from .models import Student, Teacher, Class, Subject, Activity, Event
from .serializers import (
    StudentSerializer, TeacherSerializer, ClassSerializer, 
    SubjectSerializer, ActivitySerializer, EventSerializer,
    DashboardStatsSerializer
)

User = get_user_model()


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
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
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
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            student = Student.objects.get(pk=pk)
            student.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)


class StudentStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total = Student.objects.count()
        active = Student.objects.filter(is_active=True).count()
        avg_attendance = Student.objects.aggregate(Avg('attendance_percentage'))['attendance_percentage__avg'] or 0
        
        # New students this month (simplified - counts last 30 records)
        new_this_month = Student.objects.order_by('-enrollment_date')[:54].count()
        
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
            return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
    
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
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            teacher = Teacher.objects.get(pk=pk)
            teacher.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)


class TeacherStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total = Teacher.objects.count()
        active = Teacher.objects.filter(is_active=True).count()
        total_classes = Class.objects.filter(is_active=True).count()
        total_students = Student.objects.filter(is_active=True).count()
        
        teacher_student_ratio = f"1:{int(total_students / total) if total > 0 else 0}"
        
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
            class_obj = Class.objects.select_related('teacher__user').get(pk=pk)
            serializer = ClassSerializer(class_obj)
            return Response(serializer.data)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        try:
            class_obj = Class.objects.get(pk=pk)
            serializer = ClassSerializer(class_obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            class_obj = Class.objects.get(pk=pk)
            class_obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)


class ClassStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total_classes = Class.objects.filter(is_active=True).count()
        total_subjects = Subject.objects.count()
        total_students = Student.objects.filter(is_active=True).count()
        avg_class_size = int(total_students / total_classes) if total_classes > 0 else 0
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
            return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        try:
            subject = Subject.objects.get(pk=pk)
            serializer = SubjectSerializer(subject, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            subject = Subject.objects.get(pk=pk)
            subject.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)


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
                action=f'New student enrolled: {user.get_full_name() or username}',
                user='Admin',
                activity_type='enrollment'
            )
            
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
                action=f'New teacher added: {user.get_full_name() or username}',
                user='Admin',
                activity_type='assignment'
            )
            
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
            name = request.data.get('name')
            
            # Validate required fields
            if not name:
                return Response({
                    'error': 'Missing required field: name'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if subject already exists
            if Subject.objects.filter(name=name).exists():
                return Response({
                    'error': 'Subject already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create subject
            subject = Subject.objects.create(
                name=name,
                classes_count=0,
                teachers_count=0,
                students_count=0
            )
            
            serializer = SubjectSerializer(subject)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
