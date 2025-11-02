from rest_framework.response import Response
from rest_framework.views import APIView


class DashboardStatsView(APIView):
    def get(self, request):
        # Mock data for now
        return Response({
            "total_students": 150,
            "total_teachers": 15,
            "total_classes": 10,
            "attendance_rate": 95.5
        })


class RecentActivitiesView(APIView):
    def get(self, request):
        # Mock data for now
        return Response([
            {"type": "attendance", "description": "Attendance marked for Class 10A"},
            {"type": "grade", "description": "Grades updated for Class 11B"}
        ])


class UpcomingEventsView(APIView):
    def get(self, request):
        # Mock data for now
        return Response([
            {"title": "Parent-Teacher Meeting", "date": "2025-10-20"},
            {"title": "Annual Sports Day", "date": "2025-10-25"}
        ])
