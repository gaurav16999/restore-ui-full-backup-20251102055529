from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from admin_api.models import TimeSlot, Timetable
from admin_api.serializers import TimeSlotSerializer, TimetableSerializer


class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'day_of_week']
    ordering_fields = ['day_of_week', 'start_time']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by day
        day = self.request.query_params.get('day')
        if day:
            queryset = queryset.filter(day_of_week=day)

        # Filter active/inactive
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset


class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'class_assigned__name',
        'subject__title',
        'teacher__user__first_name']
    ordering_fields = ['class_assigned', 'time_slot']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by class
        class_id = self.request.query_params.get('class_id')
        if class_id:
            queryset = queryset.filter(class_assigned_id=class_id)

        # Filter by teacher
        teacher_id = self.request.query_params.get('teacher_id')
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        # Filter by subject
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        # Filter by day
        day = self.request.query_params.get('day')
        if day:
            queryset = queryset.filter(time_slot__day_of_week=day)

        # Filter by academic year
        academic_year = self.request.query_params.get('academic_year')
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)

        return queryset

    @action(detail=False, methods=['get'])
    def class_schedule(self, request):
        """Get weekly schedule for a class"""
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response({'error': 'class_id is required'}, status=400)

        academic_year = request.query_params.get('academic_year', '2024-2025')

        timetables = Timetable.objects.filter(
            class_assigned_id=class_id,
            academic_year=academic_year,
            is_active=True
        ).select_related('time_slot', 'subject', 'teacher', 'room')

        # Organize by day
        schedule = {
            'monday': [],
            'tuesday': [],
            'wednesday': [],
            'thursday': [],
            'friday': [],
            'saturday': [],
            'sunday': []
        }

        for tt in timetables:
            day = tt.time_slot.day_of_week
            schedule[day].append({
                'id': tt.id,
                'period': tt.time_slot.name,
                'start_time': str(tt.time_slot.start_time),
                'end_time': str(tt.time_slot.end_time),
                'subject': tt.subject.title,
                'teacher': tt.teacher.user.get_full_name() if tt.teacher else None,
                'room': tt.room.room_number if tt.room else None
            })

        # Sort each day by time
        for day in schedule:
            schedule[day].sort(key=lambda x: x['start_time'])

        return Response(schedule)

    @action(detail=False, methods=['get'])
    def teacher_schedule(self, request):
        """Get weekly schedule for a teacher"""
        teacher_id = request.query_params.get('teacher_id')
        if not teacher_id:
            return Response({'error': 'teacher_id is required'}, status=400)

        academic_year = request.query_params.get('academic_year', '2024-2025')

        timetables = Timetable.objects.filter(
            teacher_id=teacher_id,
            academic_year=academic_year,
            is_active=True
        ).select_related('time_slot', 'subject', 'class_assigned', 'room')

        # Organize by day
        schedule = {
            'monday': [],
            'tuesday': [],
            'wednesday': [],
            'thursday': [],
            'friday': [],
            'saturday': [],
            'sunday': []
        }

        for tt in timetables:
            day = tt.time_slot.day_of_week
            schedule[day].append({
                'id': tt.id,
                'period': tt.time_slot.name,
                'start_time': str(tt.time_slot.start_time),
                'end_time': str(tt.time_slot.end_time),
                'subject': tt.subject.title,
                'class': tt.class_assigned.name,
                'room': tt.room.room_number if tt.room else None
            })

        # Sort each day by time
        for day in schedule:
            schedule[day].sort(key=lambda x: x['start_time'])

        return Response(schedule)
