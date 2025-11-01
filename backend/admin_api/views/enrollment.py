from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from ..models import Enrollment, Student, ClassRoom
from ..serializers import (
    EnrollmentSerializer, EnrollmentListSerializer, EnrollmentCreateSerializer
)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student enrollments in classrooms
    """
    queryset = Enrollment.objects.all().select_related(
        'student__user', 'classroom__assigned_teacher__user'
    )
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return EnrollmentCreateSerializer
        elif self.action == 'list':
            return EnrollmentListSerializer
        return EnrollmentSerializer

    def get_queryset(self):
        queryset = self.queryset

        # Filter by classroom
        classroom_id = self.request.query_params.get('classroom')
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)

        # Filter by student
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset.order_by('-enrollment_date')

    @action(detail=False, methods=['post'])
    def bulk_enroll(self, request):
        """
        Bulk enroll multiple students into a classroom
        Expected data: {
            "classroom_id": 1,
            "student_ids": [1, 2, 3, 4]
        }
        """
        classroom_id = request.data.get('classroom_id')
        student_ids = request.data.get('student_ids', [])

        if not classroom_id or not student_ids:
            return Response(
                {'error': 'classroom_id and student_ids are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            classroom = ClassRoom.objects.get(id=classroom_id)
        except ClassRoom.DoesNotExist:
            return Response(
                {'error': 'Classroom not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        results = {'success': [], 'errors': []}

        with transaction.atomic():
            for student_id in student_ids:
                try:
                    student = Student.objects.get(id=student_id)

                    # Check if already enrolled
                    if Enrollment.objects.filter(
                        student=student, classroom=classroom, is_active=True
                    ).exists():
                        results['errors'].append({
                            'student_id': student_id,
                            'error': f'{student.get_full_name()} is already enrolled in this classroom'
                        })
                        continue

                    # Create enrollment
                    enrollment = Enrollment.objects.create(
                        student=student,
                        classroom=classroom,
                        is_active=True
                    )

                    results['success'].append({
                        'student_id': student_id,
                        'student_name': student.get_full_name(),
                        'enrollment_id': enrollment.id
                    })

                except Student.DoesNotExist:
                    results['errors'].append({
                        'student_id': student_id,
                        'error': 'Student not found'
                    })

        # Update classroom students count
        classroom.students_count = classroom.enrollments.filter(
            is_active=True).count()
        classroom.save()

        return Response(results, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def transfer_student(self, request):
        """
        Transfer a student from one classroom to another
        Expected data: {
            "student_id": 1,
            "from_classroom_id": 1,
            "to_classroom_id": 2
        }
        """
        student_id = request.data.get('student_id')
        from_classroom_id = request.data.get('from_classroom_id')
        to_classroom_id = request.data.get('to_classroom_id')

        if not all([student_id, from_classroom_id, to_classroom_id]):
            return Response(
                {'error': 'student_id, from_classroom_id, and to_classroom_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                # Get objects
                student = Student.objects.get(id=student_id)
                from_classroom = ClassRoom.objects.get(id=from_classroom_id)
                to_classroom = ClassRoom.objects.get(id=to_classroom_id)

                # Check if student is enrolled in from_classroom
                try:
                    old_enrollment = Enrollment.objects.get(
                        student=student,
                        classroom=from_classroom,
                        is_active=True
                    )
                except Enrollment.DoesNotExist:
                    return Response(
                        {'error': 'Student is not enrolled in the source classroom'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Check if student is already in to_classroom
                if Enrollment.objects.filter(
                    student=student,
                    classroom=to_classroom,
                    is_active=True
                ).exists():
                    return Response(
                        {'error': 'Student is already enrolled in the target classroom'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Deactivate old enrollment
                old_enrollment.is_active = False
                old_enrollment.save()

                # Create new enrollment
                new_enrollment = Enrollment.objects.create(
                    student=student,
                    classroom=to_classroom,
                    is_active=True
                )

                # Update classroom counts
                from_classroom.students_count = from_classroom.enrollments.filter(
                    is_active=True).count()
                to_classroom.students_count = to_classroom.enrollments.filter(
                    is_active=True).count()
                from_classroom.save()
                to_classroom.save()

                return Response({
                    'message': f'{student.get_full_name()} transferred successfully',
                    'new_enrollment_id': new_enrollment.id,
                    'from_classroom': from_classroom.name,
                    'to_classroom': to_classroom.name
                }, status=status.HTTP_200_OK)

        except (Student.DoesNotExist, ClassRoom.DoesNotExist) as e:
            return Response(
                {'error': 'Student or classroom not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle enrollment active status"""
        enrollment = self.get_object()
        enrollment.is_active = not enrollment.is_active
        enrollment.save()

        # Update classroom student count
        classroom = enrollment.classroom
        classroom.students_count = classroom.enrollments.filter(
            is_active=True).count()
        classroom.save()

        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_classroom(self, request):
        """Get all enrollments grouped by classroom"""
        classrooms = ClassRoom.objects.filter(is_active=True).prefetch_related(
            'enrollments__student__user'
        )

        result = []
        for classroom in classrooms:
            active_enrollments = classroom.enrollments.filter(is_active=True)
            result.append({
                'classroom': {
                    'id': classroom.id,
                    'name': classroom.name,
                    'grade_level': classroom.grade_level,
                    'section': classroom.section
                },
                'enrollments_count': active_enrollments.count(),
                'enrollments': EnrollmentListSerializer(active_enrollments, many=True).data
            })

        return Response(result)
