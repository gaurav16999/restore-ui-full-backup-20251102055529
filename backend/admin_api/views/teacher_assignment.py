from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_api.models import TeacherAssignment, Teacher, Class, Subject
from admin_api.serializers.teacher_assignment import (
    TeacherAssignmentSerializer,
    TeacherAssignmentCreateSerializer,
    TeacherAssignmentListSerializer
)


class TeacherAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing teacher assignments to classes and subjects"""
    permission_classes = [IsAuthenticated]
    queryset = TeacherAssignment.objects.select_related(
        'teacher__user',
        'class_assigned',
        'subject'
    ).all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherAssignmentCreateSerializer
        elif self.action == 'list':
            return TeacherAssignmentListSerializer
        return TeacherAssignmentSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new teacher assignment"""
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            # Return detailed response
            instance = serializer.instance
            response_serializer = TeacherAssignmentListSerializer(instance)
            
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """Update a teacher assignment"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = TeacherAssignmentSerializer(
            instance,
            data=request.data,
            partial=partial
        )
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            response_serializer = TeacherAssignmentListSerializer(serializer.instance)
            return Response(response_serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def by_teacher(self, request):
        """Get all assignments for a specific teacher"""
        teacher_id = request.query_params.get('teacher_id')
        if not teacher_id:
            return Response(
                {'error': 'teacher_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignments = self.queryset.filter(teacher_id=teacher_id, is_active=True)
        serializer = TeacherAssignmentListSerializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """Get all assignments for a specific class"""
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response(
                {'error': 'class_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignments = self.queryset.filter(class_assigned_id=class_id, is_active=True)
        serializer = TeacherAssignmentListSerializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about teacher assignments"""
        total_assignments = self.queryset.filter(is_active=True).count()
        total_teachers = Teacher.objects.filter(
            assignments__is_active=True
        ).distinct().count()
        total_classes = Class.objects.filter(
            teacher_assignments__is_active=True
        ).distinct().count()
        total_subjects = Subject.objects.filter(
            teacher_assignments__is_active=True
        ).distinct().count()
        
        return Response({
            'total_assignments': total_assignments,
            'teachers_assigned': total_teachers,
            'classes_covered': total_classes,
            'subjects_covered': total_subjects
        })
