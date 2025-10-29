from rest_framework import serializers
from admin_api.models import Grade


class GradeSerializer(serializers.ModelSerializer):
    letter_grade = serializers.ReadOnlyField()
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.title', read_only=True)
    percentage = serializers.ReadOnlyField()

    class Meta:
        model = Grade
        fields = ['id', 'student', 'subject', 'grade_type', 'score', 'max_score', 
                 'letter_grade', 'percentage', 'notes', 'date_recorded', 'student_name', 'subject_name']
        read_only_fields = ['id', 'letter_grade', 'percentage', 'student_name', 'subject_name']