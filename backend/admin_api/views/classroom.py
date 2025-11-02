from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import Count, Avg

from ..models import ClassRoom, Teacher
from ..serializers import (
    ClassRoomSerializer, ClassRoomListSerializer, ClassRoomCreateSerializer
)


class ClassRoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing classrooms
    """
    queryset = ClassRoom.objects.all().select_related('assigned_teacher__user')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ClassRoomCreateSerializer
        elif self.action == 'list':
            return ClassRoomListSerializer
        return ClassRoomSerializer

    def get_queryset(self):
        queryset = self.queryset

        # Filter by grade level
        grade_level = self.request.query_params.get('grade_level')
        if grade_level:
            queryset = queryset.filter(grade_level__icontains=grade_level)

        # Filter by assigned teacher
        teacher_id = self.request.query_params.get('teacher')
        if teacher_id:
            queryset = queryset.filter(assigned_teacher_id=teacher_id)

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset.order_by('grade_level', 'section')

    def perform_create(self, serializer):
        """Create classroom and update teacher's class count"""
        classroom = serializer.save()

        # Update assigned teacher's class count
        if classroom.assigned_teacher:
            teacher = classroom.assigned_teacher
            teacher.classes_count = teacher.assigned_classrooms.filter(
                is_active=True).count()
            teacher.save()

    def perform_update(self, serializer):
        """Update classroom and maintain teacher counts"""
        old_teacher = self.get_object().assigned_teacher
        new_classroom = serializer.save()
        new_teacher = new_classroom.assigned_teacher

        # Update teacher counts
        if old_teacher and old_teacher != new_teacher:
            old_teacher.classes_count = old_teacher.assigned_classrooms.filter(
                is_active=True).count()
            old_teacher.save()

        if new_teacher:
            new_teacher.classes_count = new_teacher.assigned_classrooms.filter(
                is_active=True).count()
            new_teacher.save()

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get all students enrolled in this classroom"""
        classroom = self.get_object()
        enrollments = classroom.enrollments.filter(
            is_active=True).select_related('student__user')

        students_data = []
        for enrollment in enrollments:
            student = enrollment.student
            students_data.append({
                'id': student.id,
                'name': student.get_full_name(),
                'roll_no': student.roll_no,
                'email': student.user.email,
                'phone': student.phone,
                'attendance_percentage': student.attendance_percentage,
                'enrollment_date': enrollment.enrollment_date,
                'is_active': student.is_active
            })

        return Response({
            'classroom': ClassRoomListSerializer(classroom).data,
            'students_count': len(students_data),
            'students': students_data
        })

    @action(detail=True, methods=['post'])
    def assign_teacher(self, request, pk=None):
        """Assign or change teacher for a classroom"""
        classroom = self.get_object()
        teacher_id = request.data.get('teacher_id')

        if not teacher_id:
            return Response(
                {'error': 'teacher_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_teacher = Teacher.objects.get(id=teacher_id, is_active=True)
        except Teacher.DoesNotExist:
            return Response(
                {'error': 'Teacher not found or inactive'},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            old_teacher = classroom.assigned_teacher
            classroom.assigned_teacher = new_teacher
            classroom.save()

            # Update teacher counts
            if old_teacher:
                old_teacher.classes_count = old_teacher.assigned_classrooms.filter(
                    is_active=True).count()
                old_teacher.save()

            new_teacher.classes_count = new_teacher.assigned_classrooms.filter(
                is_active=True).count()
            new_teacher.save()

        return Response({
            'message': f'{new_teacher.get_full_name()} assigned to {classroom.name}',
            'classroom': ClassRoomSerializer(classroom).data
        })

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle classroom active status"""
        classroom = self.get_object()
        classroom.is_active = not classroom.is_active
        classroom.save()

        # If deactivating, also deactivate enrollments
        if not classroom.is_active:
            classroom.enrollments.filter(
                is_active=True).update(
                is_active=False)

        serializer = self.get_serializer(classroom)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get classroom statistics"""
        total_classrooms = ClassRoom.objects.count()
        active_classrooms = ClassRoom.objects.filter(is_active=True).count()

        # Classrooms by grade level
        grade_stats = ClassRoom.objects.filter(
            is_active=True).values('grade_level').annotate(
            count=Count('id')).order_by('grade_level')

        # Average students per classroom
        avg_students = ClassRoom.objects.filter(is_active=True).aggregate(
            avg=Avg('students_count')
        )['avg'] or 0

        # Classrooms without teachers
        unassigned_classrooms = ClassRoom.objects.filter(
            is_active=True, assigned_teacher__isnull=True
        ).count()

        return Response({
            'total_classrooms': total_classrooms,
            'active_classrooms': active_classrooms,
            'inactive_classrooms': total_classrooms - active_classrooms,
            'grade_level_distribution': list(grade_stats),
            'average_students_per_classroom': round(avg_students, 2),
            'unassigned_classrooms': unassigned_classrooms
        })

    @action(detail=False, methods=['get'])
    def by_grade(self, request):
        """Get classrooms grouped by grade level"""
        grade_level = request.query_params.get('grade_level')

        if grade_level:
            classrooms = ClassRoom.objects.filter(
                grade_level=grade_level, is_active=True
            ).order_by('section')
        else:
            # Group all classrooms by grade level
            classrooms = ClassRoom.objects.filter(
                is_active=True).order_by(
                'grade_level', 'section')

        if grade_level:
            return Response({
                'grade_level': grade_level,
                'classrooms': ClassRoomListSerializer(classrooms, many=True).data
            })
        else:
            # Group by grade level
            from itertools import groupby
            grouped_data = []
            for grade, group in groupby(
                    classrooms, key=lambda x: x.grade_level):
                classroom_list = list(group)
                grouped_data.append({
                    'grade_level': grade,
                    'classrooms_count': len(classroom_list),
                    'classrooms': ClassRoomListSerializer(classroom_list, many=True).data
                })

            return Response(grouped_data)
