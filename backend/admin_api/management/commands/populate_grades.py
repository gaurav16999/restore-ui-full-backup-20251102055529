from django.core.management.base import BaseCommand
from admin_api.models import Student, Subject, Grade
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Populate sample grade data'

    def handle(self, *args, **options):
        # Get existing students and subjects
        students = Student.objects.filter(is_active=True)
        subjects = Subject.objects.all()

        if not students.exists():
            self.stdout.write(self.style.ERROR(
                'No students found. Please create students first.'))
            return

        if not subjects.exists():
            self.stdout.write(self.style.ERROR(
                'No subjects found. Please create subjects first.'))
            return

        grade_types = [
            'Assignment',
            'Quiz',
            'Test',
            'Project',
            'Homework',
            'Midterm',
            'Final']

        # Clear existing grades
        Grade.objects.all().delete()

        grades_created = 0

        for student in students:
            for subject in subjects[:4]:  # Limit to 4 subjects per student
                # Create 3-5 grades per subject per student
                num_grades = random.randint(3, 5)

                for i in range(num_grades):
                    grade_type = random.choice(grade_types)

                    # Generate realistic scores
                    base_score = random.randint(60, 95)
                    variation = random.randint(-10, 10)
                    score = max(0, min(100, base_score + variation))

                    max_score = 100
                    if grade_type in ['Quiz', 'Assignment']:
                        max_score = random.choice([50, 100])
                        score = min(score, max_score)

                    # Random date within last 3 months
                    days_ago = random.randint(1, 90)
                    grade_date = date.today() - timedelta(days=days_ago)

                    # Notes for some grades
                    notes = ""
                    if random.random() < 0.3:  # 30% chance of having notes
                        notes_options = [
                            "Excellent work!",
                            "Good effort, needs improvement",
                            "Late submission",
                            "Exceptional performance",
                            "Meets expectations",
                            "Below average, needs attention"
                        ]
                        notes = random.choice(notes_options)

                    Grade.objects.create(
                        student=student,
                        subject=subject,
                        grade_type=grade_type,
                        score=score,
                        max_score=max_score,
                        notes=notes,
                        date_recorded=grade_date
                    )

                    grades_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {grades_created} sample grades for {
                    students.count()} students across {
                    subjects.count()} subjects'))
