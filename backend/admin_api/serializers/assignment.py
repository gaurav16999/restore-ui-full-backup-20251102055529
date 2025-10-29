from rest_framework import serializers
from admin_api.models import Assignment, AssignmentSubmission


class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.title', read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    assignment_type_display = serializers.CharField(source='get_assignment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_submissions = serializers.SerializerMethodField()
    pending_submissions = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = '__all__'
    
    def get_total_submissions(self, obj):
        return obj.submissions.count()
    
    def get_pending_submissions(self, obj):
        return obj.submissions.filter(status='pending').count()


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(source='student.roll_no', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_late = serializers.BooleanField(read_only=True)
    graded_by_name = serializers.CharField(source='graded_by.user.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
