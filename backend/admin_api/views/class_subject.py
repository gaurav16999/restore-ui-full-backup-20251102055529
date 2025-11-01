from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_api.models import ClassSubject
from admin_api.serializers.class_subject import (
    ClassSubjectCreateSerializer,
    ClassSubjectListSerializer,
    ClassSubjectDetailSerializer
)


class ClassSubjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ClassSubject.objects.all().select_related('class_assigned', 'subject')

    def get_serializer_class(self):
        if self.action == 'create':
            return ClassSubjectCreateSerializer
        elif self.action == 'retrieve':
            return ClassSubjectDetailSerializer
        return ClassSubjectListSerializer

    def list(self, request):
        """Get all class-subject assignments"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create a new class-subject assignment"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete a class-subject assignment"""
        try:
            class_subject = self.get_object()
            class_subject.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ClassSubject.DoesNotExist:
            return Response(
                {'error': 'Class-subject assignment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """Get all subjects for a specific class"""
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response(
                {'error': 'class_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        class_subjects = self.get_queryset().filter(
            class_assigned_id=class_id, is_active=True)
        serializer = self.get_serializer(class_subjects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_subject(self, request):
        """Get all classes for a specific subject"""
        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response(
                {'error': 'subject_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        class_subjects = self.get_queryset().filter(
            subject_id=subject_id, is_active=True)
        serializer = self.get_serializer(class_subjects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about class-subject assignments"""
        total_assignments = ClassSubject.objects.filter(is_active=True).count()
        classes_with_subjects = ClassSubject.objects.filter(
            is_active=True).values('class_assigned').distinct().count()
        subjects_assigned = ClassSubject.objects.filter(
            is_active=True).values('subject').distinct().count()
        compulsory_count = ClassSubject.objects.filter(
            is_active=True, is_compulsory=True).count()

        return Response({
            'total_assignments': total_assignments,
            'classes_with_subjects': classes_with_subjects,
            'subjects_assigned': subjects_assigned,
            'compulsory_subjects': compulsory_count,
            'optional_subjects': total_assignments - compulsory_count
        })
