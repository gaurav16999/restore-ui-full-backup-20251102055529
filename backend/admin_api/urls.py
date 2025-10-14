from django.urls import path
from .views import (
    DashboardStatsView, RecentActivitiesView, UpcomingEventsView,
    StudentListView, StudentDetailView, StudentStatsView, StudentCreateView,
    TeacherListView, TeacherDetailView, TeacherStatsView, TeacherCreateView,
    ClassListView, ClassDetailView, ClassStatsView, ClassCreateView,
    SubjectListView, SubjectDetailView, SubjectCreateView
)

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/activities/', RecentActivitiesView.as_view(), name='recent-activities'),
    path('dashboard/events/', UpcomingEventsView.as_view(), name='upcoming-events'),
    
    # Students
    path('students/', StudentListView.as_view(), name='student-list'),
    path('students/create/', StudentCreateView.as_view(), name='student-create'),
    path('students/<int:pk>/', StudentDetailView.as_view(), name='student-detail'),
    path('students/stats/', StudentStatsView.as_view(), name='student-stats'),
    
    # Teachers
    path('teachers/', TeacherListView.as_view(), name='teacher-list'),
    path('teachers/create/', TeacherCreateView.as_view(), name='teacher-create'),
    path('teachers/<int:pk>/', TeacherDetailView.as_view(), name='teacher-detail'),
    path('teachers/stats/', TeacherStatsView.as_view(), name='teacher-stats'),
    
    # Classes
    path('classes/', ClassListView.as_view(), name='class-list'),
    path('classes/create/', ClassCreateView.as_view(), name='class-create'),
    path('classes/<int:pk>/', ClassDetailView.as_view(), name='class-detail'),
    path('classes/stats/', ClassStatsView.as_view(), name='class-stats'),
    
    # Subjects
    path('subjects/', SubjectListView.as_view(), name='subject-list'),
    path('subjects/create/', SubjectCreateView.as_view(), name='subject-create'),
    path('subjects/<int:pk>/', SubjectDetailView.as_view(), name='subject-detail'),
]
