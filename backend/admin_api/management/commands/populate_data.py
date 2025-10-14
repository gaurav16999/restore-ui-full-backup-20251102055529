from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from admin_api.models import Student, Teacher, Class, Subject, Activity, Event

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with sample data for admin panel'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # Create sample students
        student_data = [
            {'username': 'emma.wilson', 'first_name': 'Emma', 'last_name': 'Wilson', 'email': 'emma@school.edu', 'roll_no': '101', 'class_name': '10A', 'phone': '+1 234-567-8901', 'attendance': 94},
            {'username': 'james.chen', 'first_name': 'James', 'last_name': 'Chen', 'email': 'james@school.edu', 'roll_no': '102', 'class_name': '11B', 'phone': '+1 234-567-8902', 'attendance': 96},
            {'username': 'sofia.rodriguez', 'first_name': 'Sofia', 'last_name': 'Rodriguez', 'email': 'sofia@school.edu', 'roll_no': '103', 'class_name': '10B', 'phone': '+1 234-567-8903', 'attendance': 89},
            {'username': 'michael.brown', 'first_name': 'Michael', 'last_name': 'Brown', 'email': 'michael@school.edu', 'roll_no': '104', 'class_name': '10A', 'phone': '+1 234-567-8904', 'attendance': 92},
            {'username': 'olivia.davis', 'first_name': 'Olivia', 'last_name': 'Davis', 'email': 'olivia@school.edu', 'roll_no': '105', 'class_name': '11A', 'phone': '+1 234-567-8905', 'attendance': 97},
            {'username': 'ethan.martinez', 'first_name': 'Ethan', 'last_name': 'Martinez', 'email': 'ethan@school.edu', 'roll_no': '106', 'class_name': '10B', 'phone': '+1 234-567-8906', 'attendance': 88, 'is_active': False},
        ]
        
        for data in student_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'email': data['email'],
                    'role': 'student'
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            
            student, created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'roll_no': data['roll_no'],
                    'class_name': data['class_name'],
                    'phone': data['phone'],
                    'attendance_percentage': data['attendance'],
                    'is_active': data.get('is_active', True)
                }
            )
            if created:
                self.stdout.write(f'Created student: {user.get_full_name()}')
        
        # Create sample teachers
        teacher_data = [
            {'username': 'prof.anderson', 'first_name': 'Michael', 'last_name': 'Anderson', 'email': 'anderson@school.edu', 'subject': 'Mathematics & Physics', 'phone': '+1 234-567-9001', 'classes': 6, 'students': 156},
            {'username': 'dr.johnson', 'first_name': 'Sarah', 'last_name': 'Johnson', 'email': 'johnson@school.edu', 'subject': 'Chemistry', 'phone': '+1 234-567-9002', 'classes': 4, 'students': 98},
            {'username': 'mr.wilson', 'first_name': 'David', 'last_name': 'Wilson', 'email': 'wilson@school.edu', 'subject': 'English Literature', 'phone': '+1 234-567-9003', 'classes': 5, 'students': 132},
            {'username': 'ms.chen', 'first_name': 'Emily', 'last_name': 'Chen', 'email': 'chen@school.edu', 'subject': 'Biology', 'phone': '+1 234-567-9004', 'classes': 4, 'students': 104},
            {'username': 'dr.davis', 'first_name': 'Robert', 'last_name': 'Davis', 'email': 'davis@school.edu', 'subject': 'Computer Science', 'phone': '+1 234-567-9005', 'classes': 3, 'students': 87, 'is_active': False},
        ]
        
        teachers = []
        for data in teacher_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'email': data['email'],
                    'role': 'teacher'
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            
            teacher, created = Teacher.objects.get_or_create(
                user=user,
                defaults={
                    'subject': data['subject'],
                    'phone': data['phone'],
                    'classes_count': data['classes'],
                    'students_count': data['students'],
                    'is_active': data.get('is_active', True)
                }
            )
            teachers.append(teacher)
            if created:
                self.stdout.write(f'Created teacher: {user.get_full_name()}')
        
        # Create sample classes
        class_data = [
            {'name': 'Grade 10A', 'students': 32, 'subjects': 8, 'teacher_idx': 0, 'room': 'Room 201', 'schedule': 'Mon-Fri, 9:00 AM'},
            {'name': 'Grade 10B', 'students': 30, 'subjects': 8, 'teacher_idx': 1, 'room': 'Room 202', 'schedule': 'Mon-Fri, 10:00 AM'},
            {'name': 'Grade 11A', 'students': 28, 'subjects': 9, 'teacher_idx': 2, 'room': 'Room 301', 'schedule': 'Mon-Fri, 11:00 AM'},
            {'name': 'Grade 11B', 'students': 26, 'subjects': 9, 'teacher_idx': 3, 'room': 'Room 302', 'schedule': 'Mon-Fri, 2:00 PM'},
        ]
        
        for data in class_data:
            class_obj, created = Class.objects.get_or_create(
                name=data['name'],
                defaults={
                    'students_count': data['students'],
                    'subjects_count': data['subjects'],
                    'teacher': teachers[data['teacher_idx']] if data['teacher_idx'] < len(teachers) else None,
                    'room': data['room'],
                    'schedule': data['schedule']
                }
            )
            if created:
                self.stdout.write(f'Created class: {data["name"]}')
        
        # Create sample subjects
        subject_data = [
            {'name': 'Mathematics', 'classes': 4, 'teachers': 2, 'students': 116},
            {'name': 'Physics', 'classes': 3, 'teachers': 2, 'students': 84},
            {'name': 'Chemistry', 'classes': 3, 'teachers': 1, 'students': 90},
            {'name': 'Biology', 'classes': 3, 'teachers': 2, 'students': 88},
            {'name': 'English', 'classes': 4, 'teachers': 2, 'students': 116},
            {'name': 'Computer Science', 'classes': 2, 'teachers': 1, 'students': 58},
        ]
        
        for data in subject_data:
            subject, created = Subject.objects.get_or_create(
                name=data['name'],
                defaults={
                    'classes_count': data['classes'],
                    'teachers_count': data['teachers'],
                    'students_count': data['students']
                }
            )
            if created:
                self.stdout.write(f'Created subject: {data["name"]}')
        
        # Create sample activities
        activity_data = [
            {'action': 'New student enrolled', 'user': 'John Doe', 'activity_type': 'enrollment'},
            {'action': 'Teacher assigned to Class 10A', 'user': 'Jane Smith', 'activity_type': 'assignment'},
            {'action': 'Fee payment received', 'user': 'Mike Johnson', 'activity_type': 'payment', 'amount': '$2,500'},
            {'action': 'New class created', 'user': 'Admin', 'activity_type': 'class'},
        ]
        
        for data in activity_data:
            Activity.objects.get_or_create(
                action=data['action'],
                defaults={
                    'user': data['user'],
                    'activity_type': data['activity_type'],
                    'amount': data.get('amount')
                }
            )
        
        # Create sample events
        event_data = [
            {'title': 'Parent-Teacher Meeting', 'date': 'Tomorrow, 10:00 AM', 'location': 'Main Hall'},
            {'title': 'Annual Sports Day', 'date': '15th Dec 2025', 'location': 'Sports Complex'},
            {'title': 'Mid-term Examinations', 'date': '20-25 Dec 2025', 'location': 'All Classrooms'},
        ]
        
        for data in event_data:
            Event.objects.get_or_create(
                title=data['title'],
                defaults={
                    'date': data['date'],
                    'location': data['location']
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully created sample data!'))
