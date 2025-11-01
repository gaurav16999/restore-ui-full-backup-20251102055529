from rest_framework import generics
from rest_framework.response import Response
from django.db.models import Avg
from admin_api.models import Grade
from admin_api.serializers.grade import GradeSerializer


class GradeListView(generics.ListAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer


class GradeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer


class GradeStatsView(generics.RetrieveAPIView):
    def get(self, request, *args, **kwargs):
        # Calculate grade distribution by computing letter grades from
        # percentages
        grades = Grade.objects.all()
        grade_counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}

        for grade in grades:
            letter = grade.letter_grade
            # Map A+, A to A, B+, B to B, etc.
            base_letter = letter[0] if letter else 'F'
            if base_letter in grade_counts:
                grade_counts[base_letter] += 1

        return Response({
            "total_grades": Grade.objects.count(),
            "average_score": float(Grade.objects.aggregate(Avg('score'))['score__avg'] or 0),
            "distribution": grade_counts
        })
