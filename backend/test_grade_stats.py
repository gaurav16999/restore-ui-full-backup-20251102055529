#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import Grade
from django.db.models import Avg

print("Testing Grade Stats calculation...")

# Calculate grade distribution
grades = Grade.objects.all()
grade_counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}

print(f"\nTotal grades: {grades.count()}")

for grade in grades:
    letter = grade.letter_grade
    base_letter = letter[0] if letter else 'F'
    print(f"  Grade ID {grade.id}: {grade.percentage}% = {letter} -> {base_letter}")
    if base_letter in grade_counts:
        grade_counts[base_letter] += 1

avg_score = Grade.objects.aggregate(Avg('score'))['score__avg']

print(f"\nGrade Distribution: {grade_counts}")
print(f"Average Score: {avg_score}")
print(f"Total Grades: {Grade.objects.count()}")
