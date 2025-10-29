from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardStatsView, RecentActivitiesView, UpcomingEventsView,
    StudentListView, StudentDetailView, StudentStatsView, StudentCreateView,
    TeacherListView, TeacherDetailView, TeacherStatsView, TeacherCreateView,
    ClassListView, ClassDetailView, ClassStatsView, ClassCreateView,
    SubjectListView, SubjectDetailView, SubjectCreateView,
    GradeListView, GradeDetailView, GradeStatsView,
    ReportViewSet, EnrollmentViewSet, ClassRoomViewSet
)
from .views.student_viewset import StudentViewSet
from .views.teacher_viewset import TeacherViewSet
from .views.subject_viewset import SubjectViewSet
from .views.grade_viewset import GradeViewSet
from .views.attendance_viewset import AttendanceViewSet
from .views.teacher_assignment import TeacherAssignmentViewSet
from .views.class_subject import ClassSubjectViewSet
from .views.student import StudentImportView, StudentCredentialsDownloadView
from .views.attendance import (
    AttendanceListCreateView, AttendanceDetailView, ClassStudentsView
)
from .views.room import RoomListView, RoomDetailView, RoomCreateView, RoomStatsView
from .views.report_analytics import ReportAnalyticsView
from student.notifications_view import NotificationsView

# DRF Router for ViewSets (clean prefixes under /api/admin/)
router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'classrooms', ClassRoomViewSet, basename='classroom')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'teacher-assignments', TeacherAssignmentViewSet, basename='teacher-assignment')
router.register(r'class-subjects', ClassSubjectViewSet, basename='class-subject')

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/activities/', RecentActivitiesView.as_view(), name='recent-activities'),
    path('dashboard/events/', UpcomingEventsView.as_view(), name='upcoming-events'),
    
    # Students
    path('students/', StudentListView.as_view(), name='student-list'),
    path('students/create/', StudentCreateView.as_view(), name='student-create'),
    path('students/import/', StudentImportView.as_view(), name='student-import'),
    path('students/download-credentials/', StudentCredentialsDownloadView.as_view(), name='student-credentials-download'),
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
    
    # Rooms
    path('rooms/', RoomListView.as_view(), name='room-list'),
    path('rooms/create/', RoomCreateView.as_view(), name='room-create'),
    path('rooms/stats/', RoomStatsView.as_view(), name='room-stats'),
    path('rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),
    
    # Grades
    path('grades/', GradeListView.as_view(), name='grade-list'),
    path('grades/<int:pk>/', GradeDetailView.as_view(), name='grade-detail'),
    path('grades/stats/', GradeStatsView.as_view(), name='grade-stats'),

    # Attendance
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance-list-create'),
    path('attendance/<int:pk>/', AttendanceDetailView.as_view(), name='attendance-detail'),
    path('class-students/', ClassStudentsView.as_view(), name='class-students'),
    
    # Reports & Analytics
    path('reports/analytics/', ReportAnalyticsView.as_view(), name='report-analytics'),
    
    # Notifications
    path('notifications/', NotificationsView.as_view(), name='admin-notifications'),
]

# Include router URLs at /api/admin/
urlpatterns += [
    path('', include(router.urls)),
]
