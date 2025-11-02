from rest_framework import serializers
from django.utils import timezone
from admin_api.models import (
    AcademicYear, AdmissionApplication, StudentPromotion,
    ExamSession, QuestionAnswer, ProgressCard, ProgressCardSubject,
    MeritList, MeritListEntry, Student, User
)


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class AdmissionApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = AdmissionApplication
        fields = '__all__'
        read_only_fields = [
            'application_number',
            'applied_date',
            'updated_at',
            'reviewed_by',
            'reviewed_at',
            'student'
        ]
    
    def get_applicant_name(self, obj):
        return obj.get_full_name()
    
    def create(self, validated_data):
        # Auto-generate application number
        import random
        import string
        year = timezone.now().year
        random_part = ''.join(random.choices(string.digits, k=6))
        validated_data['application_number'] = f"APP{year}{random_part}"
        return super().create(validated_data)


class AdmissionApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    applicant_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    
    class Meta:
        model = AdmissionApplication
        fields = [
            'id', 'application_number', 'applicant_name', 'email', 'phone',
            'applying_for_class', 'status', 'status_display', 'academic_year_name',
            'applied_date', 'priority'
        ]
    
    def get_applicant_name(self, obj):
        return obj.get_full_name()


class StudentPromotionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(source='student.roll_no', read_only=True)
    from_year_name = serializers.CharField(source='from_academic_year.name', read_only=True)
    to_year_name = serializers.CharField(source='to_academic_year.name', read_only=True)
    promoted_by_name = serializers.CharField(source='promoted_by.get_full_name', read_only=True)
    
    class Meta:
        model = StudentPromotion
        fields = '__all__'
        read_only_fields = ['promotion_date', 'created_at', 'promoted_by']


class BulkPromotionSerializer(serializers.Serializer):
    """Serializer for bulk student promotion"""
    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    from_class = serializers.CharField(max_length=50, required=True)
    to_class = serializers.CharField(max_length=50, required=True)
    to_academic_year_id = serializers.IntegerField(required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)


class ExamSessionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamSession
        fields = '__all__'
        read_only_fields = ['started_at', 'ended_at', 'duration_seconds', 'auto_graded_marks']
    
    def get_duration_minutes(self, obj):
        return round(obj.duration_seconds / 60, 2) if obj.duration_seconds else 0


class QuestionAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_marks = serializers.DecimalField(
        source='question.marks',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = QuestionAnswer
        fields = '__all__'
        read_only_fields = ['is_correct', 'marks_awarded', 'answered_at']


class ProgressCardSubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.title', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    
    class Meta:
        model = ProgressCardSubject
        fields = '__all__'


class ProgressCardSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(source='student.roll_no', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    term_display = serializers.CharField(source='get_term_display', read_only=True)
    subject_marks = ProgressCardSubjectSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProgressCard
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ProgressCardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating progress cards with subject marks"""
    subjects = ProgressCardSubjectSerializer(many=True, write_only=True)
    
    class Meta:
        model = ProgressCard
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'gpa']
    
    def create(self, validated_data):
        subjects_data = validated_data.pop('subjects', [])
        progress_card = ProgressCard.objects.create(**validated_data)
        
        # Calculate GPA
        progress_card.gpa = progress_card.calculate_gpa()
        progress_card.save()
        
        # Create subject marks
        for subject_data in subjects_data:
            ProgressCardSubject.objects.create(
                progress_card=progress_card,
                **subject_data
            )
        
        return progress_card


class MeritListEntrySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(source='student.roll_no', read_only=True)
    
    class Meta:
        model = MeritListEntry
        fields = '__all__'


class MeritListSerializer(serializers.ModelSerializer):
    entries = MeritListEntrySerializer(many=True, read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    term_display = serializers.CharField(source='get_term_display', read_only=True)
    generated_by_name = serializers.CharField(
        source='generated_by.get_full_name',
        read_only=True
    )
    entries_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MeritList
        fields = '__all__'
        read_only_fields = ['generated_date', 'generated_by']
    
    def get_entries_count(self, obj):
        return obj.entries.count()


class MeritListGenerateSerializer(serializers.Serializer):
    """Serializer for generating merit list"""
    academic_year_id = serializers.IntegerField(required=True)
    class_name = serializers.CharField(max_length=50, required=True)
    term = serializers.ChoiceField(choices=ProgressCard.TERM_CHOICES, required=True)
