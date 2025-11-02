from rest_framework import serializers
from admin_api.models import Lesson, Topic, LessonPlan


class LessonSerializer(serializers.ModelSerializer):
    subject_title = serializers.CharField(
        source='subject.title', read_only=True)
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True,
        allow_null=True)

    class Meta:
        model = Lesson
        fields = '__all__'


class TopicSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True,
        allow_null=True)

    class Meta:
        model = Topic
        fields = '__all__'


class LessonPlanSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    topic_title = serializers.CharField(
        source='topic.title', read_only=True, allow_null=True)
    teacher_name = serializers.CharField(
        source='teacher.user.get_full_name',
        read_only=True,
        allow_null=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True,
        allow_null=True)

    class Meta:
        model = LessonPlan
        fields = '__all__'
