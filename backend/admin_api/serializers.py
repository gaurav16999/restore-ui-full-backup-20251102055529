from rest_framework import serializers
from .models import (
    Student,
    Teacher,
    Class,
    Subject,
    Activity,
    Event,
    Grade,
    Exam,
    ExamSchedule,
    ExamResult,
    FeeStructure,
    FeePayment,
    Assignment,
    AssignmentSubmission,
    AdmissionQuery,
    VisitorBook,
    Complaint,
    PostalReceive,
    PostalDispatch,
    PhoneCallLog)
from users.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class StudentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    status = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'name', 'roll_no', 'class_name', 'phone', 'email',
                  'attendance_percentage', 'status', 'enrollment_date']

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"


class TeacherSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    status = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = ['id', 'name', 'subject', 'classes_count', 'students_count',
                  'phone', 'email', 'status', 'join_date']

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_status(self, obj):
        return "Active" if obj.is_active else "On Leave"


class ClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            'id',
            'name',
            'students_count',
            'subjects_count',
            'teacher_name',
            'room',
            'schedule',
            'is_active']

    def get_teacher_name(self, obj):
        if obj.teacher:
            return obj.teacher.user.get_full_name() or obj.teacher.user.username
        return "Not Assigned"


class SubjectSerializer(serializers.ModelSerializer):
    # Keep `name` for compatibility but expose `title` and `code` which the
    # frontend expects
    name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Subject
        fields = [
            'id',
            'code',
            'title',
            'name',
            'description',
            'classes_count',
            'teachers_count',
            'students_count',
            'is_active',
            'credit_hours',
            'is_practical',
            'subject_type']

    def get_name(self, obj):
        # backward-compatible alias
        return getattr(obj, 'title', None)


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_roll_no = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    percentage = serializers.ReadOnlyField()
    letter_grade = serializers.ReadOnlyField()

    class Meta:
        model = Grade
        fields = [
            'id',
            'student',
            'subject',
            'student_name',
            'student_roll_no',
            'subject_name',
            'grade_type',
            'score',
            'max_score',
            'percentage',
            'letter_grade',
            'notes',
            'date_recorded',
            'created_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username

    def get_student_roll_no(self, obj):
        return obj.student.roll_no

    def get_subject_name(self, obj):
        return obj.subject.name


class GradeStatsSerializer(serializers.Serializer):
    total_grades = serializers.IntegerField()
    grades_this_week = serializers.IntegerField()
    class_average = serializers.FloatField()
    top_performers = serializers.IntegerField()
    pending_grades = serializers.IntegerField()


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'action', 'time', 'user', 'activity_type', 'amount']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'date', 'location']


class DashboardStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    active_classes = serializers.IntegerField()
    monthly_revenue = serializers.CharField()
    students_change = serializers.CharField()
    teachers_change = serializers.CharField()
    classes_change = serializers.CharField()
    revenue_change = serializers.CharField()


# ==================== EXAM MANAGEMENT SERIALIZERS ====================

class ExamSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    creator_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True)
    schedules_count = serializers.SerializerMethodField()
    results_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            'id',
            'name',
            'exam_type',
            'academic_year',
            'start_date',
            'end_date',
            'class_assigned',
            'class_name',
            'total_marks',
            'passing_marks',
            'instructions',
            'is_published',
            'created_by',
            'creator_name',
            'schedules_count',
            'results_count',
            'created_at',
            'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_schedules_count(self, obj):
        return obj.schedules.count()

    def get_results_count(self, obj):
        return obj.results.count()

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError(
                    "End date cannot be before start date")
        if data.get('passing_marks', 0) > data.get('total_marks', 0):
            raise serializers.ValidationError(
                "Passing marks cannot be greater than total marks")
        return data


class ExamScheduleSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    subject_name = serializers.CharField(
        source='subject.title', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    invigilator_name = serializers.CharField(
        source='invigilator.user.get_full_name', read_only=True)

    class Meta:
        model = ExamSchedule
        fields = [
            'id',
            'exam',
            'exam_name',
            'subject',
            'subject_name',
            'subject_code',
            'date',
            'start_time',
            'end_time',
            'room',
            'room_name',
            'invigilator',
            'invigilator_name',
            'max_marks',
            'duration_minutes',
            'instructions']

    def validate(self, data):
        if data.get('end_time') and data.get('start_time'):
            if data['end_time'] <= data['start_time']:
                raise serializers.ValidationError(
                    "End time must be after start time")
        return data


class ExamResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.user.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(
        source='student.roll_no', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    subject_name = serializers.CharField(
        source='subject.title', read_only=True)
    entered_by_name = serializers.CharField(
        source='entered_by.user.get_full_name', read_only=True)
    percentage = serializers.ReadOnlyField()
    passed = serializers.ReadOnlyField()

    class Meta:
        model = ExamResult
        fields = [
            'id',
            'student',
            'student_name',
            'student_roll_no',
            'exam',
            'exam_name',
            'subject',
            'subject_name',
            'marks_obtained',
            'max_marks',
            'grade',
            'remarks',
            'is_absent',
            'percentage',
            'passed',
            'entered_by',
            'entered_by_name',
            'created_at',
            'updated_at']
        read_only_fields = ['entered_by', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('is_absent'):
            if data.get('marks_obtained', 0) > data.get('max_marks', 0):
                raise serializers.ValidationError(
                    "Marks obtained cannot be greater than maximum marks")
            if data.get('marks_obtained', 0) < 0:
                raise serializers.ValidationError(
                    "Marks obtained cannot be negative")
        return data


class StudentExamPerformanceSerializer(serializers.Serializer):
    """Serializer for student's overall exam performance"""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    roll_no = serializers.CharField()
    total_exams = serializers.IntegerField()
    average_percentage = serializers.FloatField()
    passed_count = serializers.IntegerField()
    failed_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    overall_grade = serializers.CharField()


# ==================== FEE MANAGEMENT SERIALIZERS ====================

class FeeStructureSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    category_display = serializers.CharField(
        source='get_category_display', read_only=True)
    frequency_display = serializers.CharField(
        source='get_frequency_display', read_only=True)

    class Meta:
        model = FeeStructure
        fields = [
            'id',
            'class_assigned',
            'class_name',
            'category',
            'category_display',
            'amount',
            'frequency',
            'frequency_display',
            'description',
            'is_mandatory',
            'is_active',
            'due_day',
            'academic_year',
            'created_at']
        read_only_fields = ['created_at']


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.user.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(
        source='student.roll_no', read_only=True)
    fee_category_name = serializers.CharField(
        source='fee_structure.get_category_display', read_only=True)
    collected_by_name = serializers.CharField(
        source='collected_by.get_full_name', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(
        source='get_payment_method_display', read_only=True)

    class Meta:
        model = FeePayment
        fields = [
            'id',
            'student',
            'student_name',
            'student_roll_no',
            'fee_structure',
            'fee_category_name',
            'amount',
            'payment_date',
            'due_date',
            'status',
            'status_display',
            'payment_method',
            'payment_method_display',
            'transaction_id',
            'receipt_number',
            'late_fee',
            'discount',
            'remarks',
            'collected_by',
            'collected_by_name',
            'created_at',
            'updated_at']
        read_only_fields = [
            'collected_by',
            'receipt_number',
            'created_at',
            'updated_at']

    def validate(self, data):
        if data.get('payment_date') and data.get('due_date'):
            if data['payment_date'] < data['due_date']:
                # Payment before due date - no late fee
                data['late_fee'] = 0
        return data


class StudentFeeStatusSerializer(serializers.Serializer):
    """Serializer for student's fee status"""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    roll_no = serializers.CharField()
    total_fees = serializers.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    overdue_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    last_payment_date = serializers.DateField()


# ==================== ASSIGNMENT MANAGEMENT SERIALIZERS ====================

class AssignmentSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    subject_name = serializers.CharField(
        source='subject.title', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.user.get_full_name', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    submissions_count = serializers.SerializerMethodField()
    pending_submissions = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'class_assigned',
            'class_name',
            'subject',
            'subject_name',
            'assigned_date',
            'due_date',
            'total_marks',
            'attachment_url',
            'status',
            'status_display',
            'instructions',
            'created_by',
            'created_by_name',
            'submissions_count',
            'pending_submissions',
            'created_at',
            'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_submissions_count(self, obj):
        return obj.submissions.count()

    def get_pending_submissions(self, obj):
        return obj.submissions.filter(submission_status='pending').count()

    def validate(self, data):
        if data.get('due_date') and data.get('assigned_date'):
            if data['due_date'] < data['assigned_date']:
                raise serializers.ValidationError(
                    "Due date cannot be before assigned date")
        return data


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(
        source='assignment.title', read_only=True)
    student_name = serializers.CharField(
        source='student.user.get_full_name', read_only=True)
    student_roll_no = serializers.CharField(
        source='student.roll_no', read_only=True)
    graded_by_name = serializers.CharField(
        source='graded_by.user.get_full_name', read_only=True)
    status_display = serializers.CharField(
        source='get_submission_status_display', read_only=True)
    is_late = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = [
            'id',
            'assignment',
            'assignment_title',
            'student',
            'student_name',
            'student_roll_no',
            'submission_date',
            'submission_text',
            'attachment_url',
            'submission_status',
            'status_display',
            'marks_obtained',
            'feedback',
            'graded_by',
            'graded_by_name',
            'graded_at',
            'is_late',
            'created_at',
            'updated_at']
        read_only_fields = [
            'graded_by',
            'graded_at',
            'created_at',
            'updated_at']

    def get_is_late(self, obj):
        if obj.submission_date and obj.assignment.due_date:
            return obj.submission_date > obj.assignment.due_date
        return False

    def validate(self, data):
        if data.get('marks_obtained') is not None:
            assignment = data.get('assignment')
            if assignment and data['marks_obtained'] > assignment.total_marks:
                raise serializers.ValidationError(
                    "Marks obtained cannot be greater than total marks")
        return data


# ==================== Admin Section Serializers ====================

class AdmissionQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionQuery
        fields = [
            'id',
            'name',
            'phone',
            'email',
            'address',
            'source',
            'description',
            'query_date',
            'last_follow_up_date',
            'next_follow_up_date',
            'assigned',
            'reference',
            'class_field',
            'number_of_child',
            'status',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Rename class_field to class for frontend compatibility
        data['class'] = data.pop('class_field')
        return data

    def to_internal_value(self, data):
        # Rename class to class_field for backend
        if 'class' in data:
            data['class_field'] = data.pop('class')
        return super().to_internal_value(data)


class VisitorBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorBook
        fields = [
            'id',
            'purpose',
            'name',
            'phone',
            'id_card',
            'no_of_person',
            'date',
            'in_time',
            'out_time',
            'note',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_by',
            'complaint_type',
            'source',
            'phone',
            'date',
            'description',
            'action_taken',
            'assigned_to',
            'status',
            'resolution_date',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PostalReceiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostalReceive
        fields = [
            'id',
            'from_title',
            'reference_no',
            'address',
            'to_title',
            'date',
            'note',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PostalDispatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostalDispatch
        fields = [
            'id',
            'to_title',
            'reference_no',
            'address',
            'from_title',
            'date',
            'note',
            'created_at',
            'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PhoneCallLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneCallLog
        fields = ['id', 'name', 'phone', 'date', 'call_duration', 'call_type',
                  'description', 'follow_up_required', 'follow_up_date',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
