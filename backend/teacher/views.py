from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return structured teacher dashboard data (sample)
        data = {
            'user': request.user.username,
            'stats': [
                { 'title': 'My Classes', 'value': '6', 'color': 'primary' },
                { 'title': 'Total Students', 'value': '156', 'color': 'secondary' },
                { 'title': 'Pending Grades', 'value': '12', 'color': 'accent' },
                { 'title': 'Unread Messages', 'value': '8', 'color': 'primary' },
            ],
            'today_classes': [
                { 'subject': 'Mathematics', 'class': 'Grade 10A', 'time': '9:00 AM - 10:00 AM', 'room': 'Room 201', 'students': 32 },
                { 'subject': 'Physics', 'class': 'Grade 11B', 'time': '11:00 AM - 12:00 PM', 'room': 'Lab 3', 'students': 28 },
                { 'subject': 'Chemistry', 'class': 'Grade 10B', 'time': '2:00 PM - 3:00 PM', 'room': 'Lab 2', 'students': 30 },
            ],
            'pending_tasks': [
                { 'task': 'Grade Math Quiz', 'class': '10A', 'count': '12 submissions', 'priority': 'high' },
                { 'task': 'Review Lab Reports', 'class': '11B', 'count': '8 submissions', 'priority': 'medium' },
                { 'task': 'Create Physics Exam', 'class': '11B', 'count': 'Due in 3 days', 'priority': 'high' },
            ],
            'top_students': [
                { 'name': 'Emma Wilson', 'class': '10A', 'grade': 'A+', 'average': '97%' },
                { 'name': 'James Chen', 'class': '11B', 'grade': 'A+', 'average': '96%' },
                { 'name': 'Sofia Rodriguez', 'class': '10B', 'grade': 'A', 'average': '94%' },
            ],
        }
        return Response(data)
