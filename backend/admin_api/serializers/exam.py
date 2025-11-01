from rest_framework import serializers
from admin_api.models import Exam, ExamSchedule, ExamResult


class ExamSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    exam_type_display = serializers.CharField(
        source='get_exam_type_display', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True,
        allow_null=True)
    total_schedules = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = '__all__'

    def get_total_schedules(self, obj):
        return obj.schedules.count()


class ExamScheduleSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    subject_name = serializers.CharField(
        source='subject.title', read_only=True)
    room_number = serializers.CharField(
        source='room.room_number',
        read_only=True,
        allow_null=True)
    invigilator_name = serializers.CharField(
        source='invigilator.user.get_full_name',
        read_only=True,
        allow_null=True)

    class Meta:
        model = ExamSchedule
        fields = '__all__'


class ExamResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.user.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(
        source='student.roll_no', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    subject_name = serializers.CharField(
        source='subject.title', read_only=True)
    percentage = serializers.DecimalField(
        max_digits=5, decimal_places=2, read_only=True)
    passed = serializers.BooleanField(read_only=True)
    entered_by_name = serializers.CharField(
        source='entered_by.user.get_full_name',
        read_only=True,
        allow_null=True)

    class Meta:
        model = ExamResult
        fields = '__all__'


class ExamResultCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating exam results"""

    class Meta:
        model = ExamResult
        fields = [
            'student',
            'exam',
            'subject',
            'marks_obtained',
            'max_marks',
            'grade',
            'remarks',
            'is_absent',
            'entered_by']

    def validate(self, data):
        if not data.get('is_absent', False):
            if data['marks_obtained'] > data['max_marks']:
                raise serializers.ValidationError(
                    "Marks obtained cannot exceed max marks")
        return data
