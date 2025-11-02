"""
Management command to seed demo data for testing and development.
Usage: python manage.py seed_demo_data [--clear]
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from admin_api.models import (
    Subject, Grade, Class, Room, Teacher, Student,
    TeacherAttendance, StudentAttendance, Exam, MarkDistribution,
    Holiday, Homework, Section
)
from datetime import timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with demo data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self.clear_data()

        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))

        # Create users
        self.stdout.write('Creating users...')
        self.create_admin()
        teacher_users = self.create_teachers()
        student_users = self.create_students()

        # Create academic data
        self.stdout.write('Creating academic structure...')
        subjects = self.create_subjects()
        grades = self.create_grades()
        sections = self.create_sections()
        rooms = self.create_rooms()
        classes = self.create_classes(subjects, grades, sections, rooms)

        # Create teachers and assign to classes
        self.stdout.write('Creating teacher records...')
        teachers = self.create_teacher_records(teacher_users, subjects)

        # Create students and enroll
        self.stdout.write('Creating student records...')
        students = self.create_student_records(student_users, grades, sections)

        # Create attendance records
        self.stdout.write('Creating attendance records...')
        self.create_attendance_records(teachers, students)

        # Create exams and marks
        self.stdout.write('Creating exams and marks...')
        self.create_exams(grades, subjects)

        # Create homework
        self.stdout.write('Creating homework assignments...')
        self.create_homework(classes, subjects)

        # Create holidays
        self.stdout.write('Creating holidays...')
        self.create_holidays()

        self.stdout.write(self.style.SUCCESS(
            '✅ Demo data seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('\nLogin Credentials:'))
        self.stdout.write(f'Admin: admin@example.com / admin123')
        self.stdout.write(f'Teacher: teacher1@example.com / teacher123')
        self.stdout.write(f'Student: student1@example.com / student123')

    def clear_data(self):
        """Clear all demo data"""
        models_to_clear = [
            Homework, Holiday, MarkDistribution, Exam,
            StudentAttendance, TeacherAttendance,
            Student, Teacher, Class, Room, Section, Grade, Subject
        ]
        for model in models_to_clear:
            count = model.objects.count()
            model.objects.all().delete()
            self.stdout.write(f'  Deleted {count} {model.__name__} records')

        # Delete demo users (keep admin if it exists)
        User.objects.filter(
            email__contains='@example.com').exclude(email='admin@example.com').delete()

    def create_admin(self):
        """Create admin user"""
        admin, created = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'  ✓ Admin user created'))
        return admin

    def create_teachers(self, count=10):
        """Create teacher users"""
        teachers = []
        for i in range(1, count + 1):
            teacher, created = User.objects.get_or_create(
                email=f'teacher{i}@example.com',
                defaults={
                    'first_name': f'Teacher{i}',
                    'last_name': f'Name{i}',
                    'role': 'teacher',
                }
            )
            if created:
                teacher.set_password('teacher123')
                teacher.save()
            teachers.append(teacher)
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {count} teacher users'))
        return teachers

    def create_students(self, count=50):
        """Create student users"""
        students = []
        for i in range(1, count + 1):
            student, created = User.objects.get_or_create(
                email=f'student{i}@example.com',
                defaults={
                    'first_name': f'Student{i}',
                    'last_name': f'Name{i}',
                    'role': 'student',
                }
            )
            if created:
                student.set_password('student123')
                student.save()
            students.append(student)
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {count} student users'))
        return students

    def create_subjects(self):
        """Create subjects"""
        subject_names = [
            'Mathematics', 'Physics', 'Chemistry', 'Biology',
            'English', 'History', 'Geography', 'Computer Science',
            'Physical Education', 'Art'
        ]
        subjects = []
        for name in subject_names:
            subject, created = Subject.objects.get_or_create(
                name=name,
                defaults={'code': name[:3].upper()}
            )
            subjects.append(subject)
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(subjects)} subjects'))
        return subjects

    def create_grades(self):
        """Create grades"""
        grade_names = [
            ('Grade 1', 1), ('Grade 2', 2), ('Grade 3', 3),
            ('Grade 4', 4), ('Grade 5', 5), ('Grade 6', 6),
            ('Grade 7', 7), ('Grade 8', 8), ('Grade 9', 9),
            ('Grade 10', 10)
        ]
        grades = []
        for name, level in grade_names:
            grade, created = Grade.objects.get_or_create(
                name=name,
                defaults={'level': level}
            )
            grades.append(grade)
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(grades)} grades'))
        return grades

    def create_sections(self):
        """Create sections"""
        section_names = ['A', 'B', 'C', 'D']
        sections = []
        for name in section_names:
            section, created = Section.objects.get_or_create(
                name=f'Section {name}',
                defaults={'code': name}
            )
            sections.append(section)
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(sections)} sections'))
        return sections

    def create_rooms(self):
        """Create rooms"""
        rooms = []
        for i in range(1, 21):
            room, created = Room.objects.get_or_create(
                room_number=f'R{i:03d}',
                defaults={
                    'name': f'Room {i}',
                    'capacity': random.choice([30, 40, 50, 60])
                }
            )
            rooms.append(room)
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(rooms)} rooms'))
        return rooms

    def create_classes(self, subjects, grades, sections, rooms):
        """Create classes"""
        classes = []
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        time_slots = [
            ('09:00', '10:00'), ('10:00', '11:00'), ('11:00', '12:00'),
            ('13:00', '14:00'), ('14:00', '15:00')
        ]

        for grade in grades[:5]:  # First 5 grades
            for section in sections[:2]:  # First 2 sections
                for subject in subjects[:5]:  # First 5 subjects
                    day = random.choice(days)
                    start_time, end_time = random.choice(time_slots)
                    room = random.choice(rooms)

                    class_obj, created = Class.objects.get_or_create(
                        name=f'{grade.name} - {section.name} - {subject.name}',
                        defaults={
                            'subject': subject,
                            'grade': grade,
                            'section': section,
                            'room': room,
                            'day_of_week': day,
                            'start_time': start_time,
                            'end_time': end_time,
                        }
                    )
                    classes.append(class_obj)

        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(classes)} classes'))
        return classes

    def create_teacher_records(self, teacher_users, subjects):
        """Create teacher records"""
        teachers = []
        for i, user in enumerate(teacher_users):
            subject = subjects[i % len(subjects)]
            teacher, created = Teacher.objects.get_or_create(
                user=user,
                defaults={
                    'employee_id': f'T{1000 + i}',
                    'subject': subject,
                    'phone': f'+1234567{i:04d}',
                    'hire_date': timezone.now().date() - timedelta(days=random.randint(30, 365))
                }
            )
            teachers.append(teacher)
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(teachers)} teacher records'))
        return teachers

    def create_student_records(self, student_users, grades, sections):
        """Create student records"""
        students = []
        for i, user in enumerate(student_users):
            grade = grades[i % len(grades)]
            section = sections[i % len(sections)]
            student, created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'student_id': f'S{2000 + i}',
                    'grade': grade,
                    'section': section,
                    'date_of_birth': timezone.now().date() - timedelta(days=random.randint(3650, 5475)),
                    'enrollment_date': timezone.now().date() - timedelta(days=random.randint(30, 365)),
                    'guardian_name': f'Guardian {i}',
                    'guardian_phone': f'+1234567{i:04d}',
                }
            )
            students.append(student)
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(students)} student records'))
        return students

    def create_attendance_records(self, teachers, students):
        """Create attendance records for the past 30 days"""
        today = timezone.now().date()
        for day in range(30):
            date = today - timedelta(days=day)

            # Teacher attendance
            for teacher in teachers:
                if random.random() > 0.1:  # 90% attendance
                    TeacherAttendance.objects.get_or_create(
                        teacher=teacher,
                        date=date,
                        defaults={
                            'status': random.choice(['present', 'present', 'present', 'late']),
                            'check_in_time': '09:00',
                        }
                    )

            # Student attendance
            for student in students:
                if random.random() > 0.05:  # 95% attendance
                    StudentAttendance.objects.get_or_create(
                        student=student,
                        date=date,
                        defaults={
                            'status': random.choice(['present', 'present', 'present', 'absent']),
                        }
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created attendance records for 30 days'))

    def create_exams(self, grades, subjects):
        """Create exams"""
        exams = []
        exam_types = ['Mid-Term', 'Final', 'Quiz']

        for grade in grades[:5]:
            for exam_type in exam_types:
                for subject in subjects[:5]:
                    exam, created = Exam.objects.get_or_create(
                        name=f'{grade.name} - {subject.name} - {exam_type}',
                        defaults={
                            'exam_type': exam_type.lower(),
                            'grade': grade,
                            'subject': subject,
                            'exam_date': timezone.now().date() + timedelta(days=random.randint(1, 90)),
                            'total_marks': random.choice([50, 75, 100]),
                            'passing_marks': 40,
                        }
                    )
                    exams.append(exam)

        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(exams)} exams'))
        return exams

    def create_homework(self, classes, subjects):
        """Create homework assignments"""
        homework_list = []
        for class_obj in classes[:20]:  # First 20 classes
            for i in range(3):  # 3 assignments per class
                homework, created = Homework.objects.get_or_create(
                    title=f'{class_obj.subject.name} Assignment {i + 1}',
                    class_assigned=class_obj,
                    defaults={
                        'description': f'Complete exercises from chapter {i + 1}',
                        'due_date': timezone.now().date() + timedelta(days=random.randint(1, 14)),
                        'assigned_date': timezone.now().date(),
                    }
                )
                homework_list.append(homework)

        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(homework_list)} homework assignments'))
        return homework_list

    def create_holidays(self):
        """Create holidays"""
        holidays = [
            ('New Year', '2024-01-01'),
            ('Independence Day', '2024-07-04'),
            ('Thanksgiving', '2024-11-28'),
            ('Christmas', '2024-12-25'),
            ('Spring Break Start', '2024-03-15'),
            ('Spring Break End', '2024-03-22'),
        ]

        holiday_objs = []
        for name, date in holidays:
            holiday, created = Holiday.objects.get_or_create(
                name=name,
                date=date,
                defaults={'description': f'{name} holiday'}
            )
            holiday_objs.append(holiday)

        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Created {
                    len(holiday_objs)} holidays'))
        return holiday_objs
