from django.urls import path
from .views import (
    DashboardView, 
    CoursesView, 
    AssignmentsView, 
    ScheduleView, 
    GradesView, 
    AttendanceView, 
    MessagesView, 
    AchievementsView
)
from .notifications_view import NotificationsView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='student-dashboard'),
    path('courses/', CoursesView.as_view(), name='student-courses'),
    path('assignments/', AssignmentsView.as_view(), name='student-assignments'),
    path('schedule/', ScheduleView.as_view(), name='student-schedule'),
    path('grades/', GradesView.as_view(), name='student-grades'),
    path('attendance/', AttendanceView.as_view(), name='student-attendance'),
    path('messages/', MessagesView.as_view(), name='student-messages'),
    path('notifications/', NotificationsView.as_view(), name='notifications'),
    path('achievements/', AchievementsView.as_view(), name='student-achievements'),
]
