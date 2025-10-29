from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_api.models import Attendance, Class, Student
from admin_api.serializers import AttendanceSerializer, AttendanceCreateSerializer
from datetime import datetime


class AttendanceListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        queryset = Attendance.objects.all()
        class_id = self.request.query_params.get('class_id', None)
        date = self.request.query_params.get('date', None)

        if class_id:
            queryset = queryset.filter(class_section_id=class_id)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(date=date_obj)
            except ValueError:
                pass
        
        return queryset.select_related('student__user', 'class_section')

    def create(self, request, *args, **kwargs):
        if not isinstance(request.data, list):
            # Handle single record as before
            serializer = AttendanceCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            response_serializer = AttendanceSerializer(serializer.instance)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        # Handle bulk records
        created_instances = []
        updated_instances = []
        errors = []

        for record in request.data:
            try:
                # Check if record exists
                instance = Attendance.objects.filter(
                    student_id=record['student'],
                    class_section_id=record['class_section'],
                    date=record['date']
                ).first()

                if instance:
                    # Update existing record
                    serializer = AttendanceSerializer(instance, data=record)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    updated_instances.append(instance)
                else:
                    # Create new record
                    serializer = AttendanceCreateSerializer(data=record)
                    serializer.is_valid(raise_exception=True)
                    instance = serializer.save()
                    created_instances.append(instance)

            except Exception as e:
                errors.append({
                    'data': record,
                    'error': str(e)
                })

        # Prepare response
        all_instances = created_instances + updated_instances
        response_data = {
            'created': AttendanceSerializer(created_instances, many=True).data,
            'updated': AttendanceSerializer(updated_instances, many=True).data,
            'errors': errors
        }

        return Response(response_data, 
                       status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)


class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer
    queryset = Attendance.objects.all()

    def get_queryset(self):
        return Attendance.objects.select_related('student__user', 'class_section')


class ClassStudentsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        class_id = request.query_params.get('class_id')
        date = request.query_params.get('date')
        
        if not class_id:
            return Response({'error': 'class_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            class_obj = Class.objects.get(id=class_id)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
            
        students_query = Student.objects.filter(class_name=class_obj.name)\
            .select_related('user')\
            .values('id', 'roll_no', 'user__first_name', 'user__last_name')
        
        students = list(students_query)
        
        if date:
            # Get existing attendance records for the date
            attendance_records = Attendance.objects.filter(
                class_section=class_obj,
                date=date
            ).values('student_id', 'status')
            
            # Create a map of student_id to attendance status
            attendance_map = {
                record['student_id']: record['status'] 
                for record in attendance_records
            }
            
            # Add attendance status to each student record
            for student in students:
                student['attendance_status'] = attendance_map.get(student['id'])
            
        return Response({
            'class_name': class_obj.name,
            'students_count': len(students),
            'students': students,
            'class_details': {
                'id': class_obj.id,
                'name': class_obj.name,
                'room': class_obj.room,
                'schedule': class_obj.schedule,
                'teacher': class_obj.teacher.user.get_full_name() if class_obj.teacher else None
            }
        })