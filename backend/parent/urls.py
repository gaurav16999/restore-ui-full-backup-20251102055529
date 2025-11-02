from django.urls import path
from .views import (
    ParentDashboardView,
    ChildDetailView,
    ChildAttendanceView,
    ChildGradesView,
    ChildFeesView,
    ChildAssignmentsView,
    ParentMessagesView,
    ChildExamResultsView,
    ChildAcademicSummaryView,
    ParentTeacherCommunicationView,
    ParentNotificationsView,
    parent_children_list,
    send_message_to_teacher
)

urlpatterns = [
    # Dashboard
    path('dashboard/', ParentDashboardView.as_view(), name='parent-dashboard'),
    
    # Children Management
    path('children/', parent_children_list, name='parent-children-list'),
    path('children/<int:child_id>/', ChildDetailView.as_view(), name='child-detail'),
    path('children/<int:child_id>/summary/', ChildAcademicSummaryView.as_view(), name='child-academic-summary'),
    path('children/<int:child_id>/attendance/', ChildAttendanceView.as_view(), name='child-attendance'),
    path('children/<int:child_id>/grades/', ChildGradesView.as_view(), name='child-grades'),
    path('children/<int:child_id>/fees/', ChildFeesView.as_view(), name='child-fees'),
    path('children/<int:child_id>/assignments/', ChildAssignmentsView.as_view(), name='child-assignments'),
    path('children/<int:child_id>/exam-results/', ChildExamResultsView.as_view(), name='child-exam-results'),
    
    # Communication
    path('messages/', ParentMessagesView.as_view(), name='parent-messages'),
    path('teachers/', ParentTeacherCommunicationView.as_view(), name='parent-teachers'),
    path('messages/send/', send_message_to_teacher, name='send-message-to-teacher'),
    
    # Notifications
    path('notifications/', ParentNotificationsView.as_view(), name='parent-notifications'),
]
