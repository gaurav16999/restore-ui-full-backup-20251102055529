from rest_framework import generics, status
from rest_framework.response import Response
from admin_api.models import Teacher
from admin_api.serializers.teacher import TeacherSerializer, TeacherCreateSerializer


class TeacherListView(generics.ListAPIView):
    queryset = Teacher.objects.all().select_related('user')
    serializer_class = TeacherSerializer


class TeacherDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all().select_related('user')
    serializer_class = TeacherSerializer


class TeacherCreateView(generics.CreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherCreateSerializer


class TeacherStatsView(generics.RetrieveAPIView):
    def get(self, request):
        total_teachers = Teacher.objects.count()
        active_teachers = Teacher.objects.filter(is_active=True).count()
        # For now, using dummy data for new_this_month and avg_performance
        # In a real app, you'd calculate these based on created_at dates and performance metrics
        return Response({
            'total': total_teachers,
            'active': active_teachers,
            'new_this_month': max(0, total_teachers // 15),  # Dummy calculation
            'avg_performance': '92%',  # Dummy value
        })