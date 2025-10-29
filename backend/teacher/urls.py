from django.urls import path
from .views import (
    DashboardView, 
    ClassesView, 
    StudentsView, 
    GradesView, 
    AssignmentsView, 
    AssignmentCreateView,
    MessagesView, 
    SendMessageView,
    ResourcesView, 
    UploadResourceView,
    AttendanceView,
    AttendanceSubmitView
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='teacher-dashboard'),
    path('classes/', ClassesView.as_view(), name='teacher-classes'),
    path('students/', StudentsView.as_view(), name='teacher-students'),
    path('grades/', GradesView.as_view(), name='teacher-grades'),
    path('assignments/', AssignmentsView.as_view(), name='teacher-assignments'),
    path('assignments/create/', AssignmentCreateView.as_view(), name='teacher-assignment-create'),
    path('messages/', MessagesView.as_view(), name='teacher-messages'),
    path('messages/send/', SendMessageView.as_view(), name='teacher-send-message'),
    path('resources/', ResourcesView.as_view(), name='teacher-resources'),
    path('resources/upload/', UploadResourceView.as_view(), name='teacher-upload-resource'),
    path('attendance/', AttendanceView.as_view(), name='teacher-attendance'),
    path('attendance/submit/', AttendanceSubmitView.as_view(), name='teacher-attendance-submit'),
]
