from rest_framework import serializers
from admin_api.models import Grade


class GradeSerializer(serializers.ModelSerializer):
    letter_grade = serializers.ReadOnlyField()
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(source='student.roll_no', read_only=True)
    subject_name = serializers.CharField(source='subject.title', read_only=True)
    percentage = serializers.ReadOnlyField()
    date_created = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'student', 'subject', 'grade_type', 'score', 'max_score', 
                 'letter_grade', 'percentage', 'notes', 'date_recorded', 'student_name', 
                 'student_roll_no', 'subject_name', 'date_created']
        read_only_fields = ['id', 'letter_grade', 'percentage', 'student_name', 
                           'student_roll_no', 'subject_name', 'date_created']