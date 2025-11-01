from rest_framework import serializers
from admin_api.models import TimeSlot, Timetable


class TimeSlotSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(
        source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TimeSlot
        fields = '__all__'


class TimetableSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(
        source='class_assigned.name', read_only=True)
    time_slot_name = serializers.CharField(
        source='time_slot.name', read_only=True)
    time_slot_day = serializers.CharField(
        source='time_slot.get_day_of_week_display', read_only=True)
    time_slot_start = serializers.TimeField(
        source='time_slot.start_time', read_only=True)
    time_slot_end = serializers.TimeField(
        source='time_slot.end_time', read_only=True)
    subject_name = serializers.CharField(
        source='subject.title', read_only=True)
    teacher_name = serializers.CharField(
        source='teacher.user.get_full_name',
        read_only=True,
        allow_null=True)
    room_number = serializers.CharField(
        source='room.room_number',
        read_only=True,
        allow_null=True)

    class Meta:
        model = Timetable
        fields = '__all__'
