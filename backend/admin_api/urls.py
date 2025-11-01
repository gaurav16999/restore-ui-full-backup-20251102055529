from .bulk_import_export import (
    bulk_import_students, bulk_import_teachers,
    export_students, export_teachers, download_import_template
)
from .payment_views import (
    create_payment_intent, confirm_payment, stripe_webhook,
    get_payment_history, create_refund
)
from .views.inventory import SupplierViewSet, ItemCategoryViewSet, ItemViewSet, ItemReceiveViewSet, ItemIssueViewSet
from .views.accounts import ChartOfAccountViewSet, AccountTransactionViewSet
from .views.wallet import WalletAccountViewSet, WalletTransactionViewSet, WalletDepositRequestViewSet, WalletRefundRequestViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardStatsView, RecentActivitiesView, UpcomingEventsView,
    StudentListView, StudentDetailView, StudentStatsView, StudentCreateView,
    TeacherListView, TeacherDetailView, TeacherStatsView, TeacherCreateView,
    ClassListView, ClassDetailView, ClassStatsView, ClassCreateView,
    SubjectListView, SubjectDetailView, SubjectCreateView,
    GradeStatsView, ReportViewSet, EnrollmentViewSet,
    ClassRoomViewSet, FeeStructureViewSet, FeePaymentViewSet,
    ExamViewSet, ExamScheduleViewSet,
    ExamResultViewSet, TimeSlotViewSet, TimetableViewSet,
    AssignmentViewSet, AssignmentSubmissionViewSet,
    AnnouncementViewSet, MessageViewSet,
    NotificationViewSet, UserViewSet
)
from .views.library import BookCategoryViewSet, LibraryMemberViewSet, BookViewSet, BookIssueViewSet
from .views.transport import TransportRouteViewSet, TransportVehicleViewSet, VehicleAssignmentViewSet
from .views.dormitory import DormRoomTypeViewSet, DormRoomViewSet, DormitoryAssignmentViewSet
from .views.online_exam import OnlineExamViewSet
from .views.question import QuestionGroupViewSet, QuestionViewSet
from .views.class_test import ClassTestViewSet
from .views.lesson_plan import LessonViewSet, TopicViewSet, LessonPlanViewSet
from .views.admin_section import (
    PostalReceiveViewSet, PostalDispatchViewSet, PhoneCallLogViewSet
)
# Note: AdmissionQueryViewSet, VisitorBookViewSet, ComplaintViewSet now imported from admission_utility
from .views.hr import DesignationViewSet, DepartmentViewSet, EmployeeViewSet, StaffAttendanceViewSet, PayrollRecordViewSet
from .views.leave import LeaveTypeViewSet, LeaveDefineViewSet, LeaveApplicationViewSet
from .views.role_permission import RoleViewSet, LoginPermissionViewSet, DueFeesLoginPermissionViewSet
from .views.student_viewset import StudentViewSet
from .views.student_category import StudentCategoryViewSet, StudentGroupViewSet, SmsSendingTimeViewSet
from .views.teacher_viewset import TeacherViewSet
from .views.behaviour import IncidentTypeViewSet, StudentIncidentViewSet, BehaviourSettingViewSet
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
from .views.communicate_admin import EmailTemplateViewSet, SmsTemplateViewSet, EmailSmsLogViewSet
from .views.chat_admin import ChatInvitationViewSet, BlockedChatUserViewSet
from .views.style_admin import ColorThemeViewSet, BackgroundSettingViewSet
from .views.academic_enhancement import (
    AcademicYearViewSet, ExamSessionViewSet,
    ProgressCardViewSet, MeritListViewSet
)
# Phase 7: Import new admission/utility ViewSets (overriding academic_enhancement)
from .views.admission_utility import (
    AdmissionApplicationViewSet, StudentPromotionViewSet,
    AdmissionQueryViewSet as AdmissionQueryAdvancedViewSet,
    VisitorBookViewSet as VisitorBookAdvancedViewSet,
    ComplaintViewSet as ComplaintAdvancedViewSet
)
from .views.phase3 import (
    # Payroll
    SalaryGradeViewSet, AllowanceTypeViewSet, DeductionTypeViewSet,
    EmployeeSalaryStructureViewSet, PayslipViewSet,
    # Leave
    LeavePolicyViewSet, EmployeeLeaveBalanceViewSet,
    LeaveApplicationViewSet as Phase3LeaveApplicationViewSet,
    # Expense
    ExpenseCategoryViewSet, ExpenseClaimViewSet,
    # Asset
    AssetCategoryViewSet, AssetViewSet, AssetAssignmentViewSet, AssetMaintenanceViewSet,
    # Accounting
    AccountGroupViewSet, JournalEntryViewSet, BudgetAllocationViewSet
)
from .views.advanced_reports import AdvancedReportsViewSet
from .views.academic_advanced import (
    ExamTypeViewSet, ExamMarkViewSet, ExamResultViewSet as ExamResultAdvancedViewSet,
    GradeScaleViewSet, HomeworkViewSet, HomeworkSubmissionViewSet,
    LessonPlanViewSet as LessonPlanAdvancedViewSet, ClassRoutineViewSet,
    StaffAttendanceViewSet as StaffAttendanceAdvancedViewSet
)
from .views.hr_advanced import (
    DesignationViewSet as DesignationAdvancedViewSet,
    EmployeeDetailsViewSet, PayrollComponentViewSet,
    PayrollRunViewSet, PayslipViewSet,
    LeaveApplicationViewSet as LeaveApplicationAdvancedViewSet,
    HolidayViewSet
)
from .views.admission_utility import (
    AdmissionApplicationViewSet, AdmissionQueryViewSet,
    StudentPromotionViewSet, VisitorBookViewSet, ComplaintViewSet
)
# Phase 8: Academic & Learning Enhanced Module
from .views.academic_learning_enhanced import (
    AdmissionEnhancedViewSet, StudentPromotionEnhancedViewSet,
    AssignmentEnhancedViewSet, AssignmentSubmissionEnhancedViewSet,
    LessonEnhancedViewSet, TopicEnhancedViewSet, LessonPlanEnhancedViewSet,
    ClassTestEnhancedViewSet, OnlineExamEnhancedViewSet,
    QuestionBankViewSet, TimetableEnhancedViewSet
)

# Phase 9: Administrative & HR Enhanced Module
from .views.administrative_hr_enhanced import (
    LeaveManagementEnhancedViewSet,
    PayrollRunEnhancedViewSet,
    StaffAttendanceEnhancedViewSet,
    AccountingSystemEnhancedViewSet,
    FeeManagementEnhancedViewSet,
    WalletSystemEnhancedViewSet,
    InventoryEnhancedViewSet,
    LibraryEnhancedViewSet,
    TransportEnhancedViewSet,
    DormitoryEnhancedViewSet
)

# Phase 10: Communication & Notifications Enhanced Module
from .views.communication_notifications_enhanced import (
    EmailTemplateEnhancedViewSet,
    SmsTemplateEnhancedViewSet,
    CommunicationLogViewSet,
    ChatSystemEnhancedViewSet,
    AnnouncementEnhancedViewSet,
    NotificationEnhancedViewSet
)

# DRF Router for ViewSets (clean prefixes under /api/admin/)
router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'classrooms', ClassRoomViewSet, basename='classroom')
router.register(r'students', StudentViewSet, basename='student')
router.register(
    r'student-categories',
    StudentCategoryViewSet,
    basename='student-category')
router.register(
    r'student-groups',
    StudentGroupViewSet,
    basename='student-group')
router.register(
    r'sms-sending-times',
    SmsSendingTimeViewSet,
    basename='sms-sending-time')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(
    r'incident-types',
    IncidentTypeViewSet,
    basename='incident-type')
router.register(
    r'student-incidents',
    StudentIncidentViewSet,
    basename='student-incident')
router.register(
    r'behaviour-settings',
    BehaviourSettingViewSet,
    basename='behaviour-setting')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(
    r'teacher-assignments',
    TeacherAssignmentViewSet,
    basename='teacher-assignment')
router.register(
    r'class-subjects',
    ClassSubjectViewSet,
    basename='class-subject')

# New modules
router.register(
    r'fee-structures',
    FeeStructureViewSet,
    basename='fee-structure')
router.register(r'fee-payments', FeePaymentViewSet, basename='fee-payment')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(
    r'exam-schedules',
    ExamScheduleViewSet,
    basename='exam-schedule')
router.register(r'exam-results', ExamResultViewSet, basename='exam-result')
router.register(r'time-slots', TimeSlotViewSet, basename='time-slot')
router.register(r'timetables', TimetableViewSet, basename='timetable')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(
    r'assignment-submissions',
    AssignmentSubmissionViewSet,
    basename='assignment-submission')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(
    r'book-categories',
    BookCategoryViewSet,
    basename='book-category')
router.register(
    r'library-members',
    LibraryMemberViewSet,
    basename='library-member')
router.register(r'books', BookViewSet, basename='book')
router.register(r'book-issues', BookIssueViewSet, basename='book-issue')
router.register(
    r'transport-routes',
    TransportRouteViewSet,
    basename='transport-route')
router.register(
    r'transport-vehicles',
    TransportVehicleViewSet,
    basename='transport-vehicle')
router.register(
    r'vehicle-assignments',
    VehicleAssignmentViewSet,
    basename='vehicle-assignment')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'lesson-plans', LessonPlanViewSet, basename='lesson-plan')
router.register(r'messages', MessageViewSet, basename='message')
router.register(
    r'notifications-v2',
    NotificationViewSet,
    basename='notification-v2')
router.register(r'users', UserViewSet, basename='user')
router.register(r'online-exams', OnlineExamViewSet, basename='online-exam')
router.register(
    r'question-groups',
    QuestionGroupViewSet,
    basename='question-group')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'class-tests', ClassTestViewSet, basename='class-test')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(
    r'staff-attendance',
    StaffAttendanceViewSet,
    basename='staff-attendance')
router.register(
    r'payroll-records',
    PayrollRecordViewSet,
    basename='payroll-record')

router.register(r'leave-types', LeaveTypeViewSet, basename='leave-type')
router.register(r'leave-defines', LeaveDefineViewSet, basename='leave-define')
# Phase 3 Leave Applications (replaces old system)
router.register(
    r'leave-applications',
    Phase3LeaveApplicationViewSet,
    basename='leave-application')

router.register(r'roles', RoleViewSet, basename='role')
router.register(
    r'login-permissions',
    LoginPermissionViewSet,
    basename='login-permission')
router.register(
    r'due-fees-login-permissions',
    DueFeesLoginPermissionViewSet,
    basename='due-fees-login-permission')

# Communicate / Chat / Style
router.register(
    r'email-templates',
    EmailTemplateViewSet,
    basename='email-template')
router.register(r'sms-templates', SmsTemplateViewSet, basename='sms-template')
router.register(
    r'email-sms-logs',
    EmailSmsLogViewSet,
    basename='email-sms-log')

router.register(
    r'chat-invitations',
    ChatInvitationViewSet,
    basename='chat-invitation')
router.register(
    r'chat-blocked-users',
    BlockedChatUserViewSet,
    basename='chat-blocked-user')

router.register(r'color-themes', ColorThemeViewSet, basename='color-theme')
router.register(
    r'background-settings',
    BackgroundSettingViewSet,
    basename='background-setting')

# Wallet / Accounts / Inventory

router.register(
    r'wallet-accounts',
    WalletAccountViewSet,
    basename='wallet-account')
router.register(
    r'wallet-transactions',
    WalletTransactionViewSet,
    basename='wallet-transaction')
router.register(
    r'wallet-deposits',
    WalletDepositRequestViewSet,
    basename='wallet-deposit')
router.register(
    r'wallet-refunds',
    WalletRefundRequestViewSet,
    basename='wallet-refund')

router.register(
    r'chart-of-accounts',
    ChartOfAccountViewSet,
    basename='chart-of-account')
router.register(
    r'account-transactions',
    AccountTransactionViewSet,
    basename='account-transaction')

router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(
    r'item-categories',
    ItemCategoryViewSet,
    basename='item-category')
router.register(r'items', ItemViewSet, basename='item')
router.register(r'item-receives', ItemReceiveViewSet, basename='item-receive')
router.register(r'item-issues', ItemIssueViewSet, basename='item-issue')

# Academic Enhancement Module (Phase 2)
router.register(r'academic-years', AcademicYearViewSet, basename='academic-year')
router.register(
    r'admission-applications',
    AdmissionApplicationViewSet,
    basename='admission-application')
router.register(
    r'student-promotions',
    StudentPromotionViewSet,
    basename='student-promotion')
router.register(r'exam-sessions', ExamSessionViewSet, basename='exam-session')
router.register(r'progress-cards', ProgressCardViewSet, basename='progress-card')
router.register(r'merit-lists', MeritListViewSet, basename='merit-list')

# Enhanced HR & Administrative Modules (Phase 3)
# Payroll Management
router.register(r'salary-grades', SalaryGradeViewSet, basename='salary-grade')
router.register(r'allowance-types', AllowanceTypeViewSet, basename='allowance-type')
router.register(r'deduction-types', DeductionTypeViewSet, basename='deduction-type')
router.register(
    r'employee-salary-structures',
    EmployeeSalaryStructureViewSet,
    basename='employee-salary-structure')
router.register(r'payslips', PayslipViewSet, basename='payslip')

# Leave Management
router.register(r'leave-policies', LeavePolicyViewSet, basename='leave-policy')
router.register(
    r'employee-leave-balances',
    EmployeeLeaveBalanceViewSet,
    basename='employee-leave-balance')

# Expense Management
router.register(r'expense-categories', ExpenseCategoryViewSet, basename='expense-category')
router.register(r'expense-claims', ExpenseClaimViewSet, basename='expense-claim')

# Asset Management
router.register(r'asset-categories', AssetCategoryViewSet, basename='asset-category')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'asset-assignments', AssetAssignmentViewSet, basename='asset-assignment')
router.register(r'asset-maintenance', AssetMaintenanceViewSet, basename='asset-maintenance')

# Accounting
router.register(r'account-groups', AccountGroupViewSet, basename='account-group')
router.register(r'journal-entries', JournalEntryViewSet, basename='journal-entry')
router.register(r'budget-allocations', BudgetAllocationViewSet, basename='budget-allocation')

# Phase 4: Advanced Reports & Analytics
router.register(r'advanced-reports', AdvancedReportsViewSet, basename='advanced-report')

# Phase 5: Advanced Academic Module (Exam Management, Homework, Lesson Plans, Timetable, Staff Attendance)
router.register(r'exam-types', ExamTypeViewSet, basename='exam-type')
router.register(r'exam-marks', ExamMarkViewSet, basename='exam-mark')
router.register(r'exam-results-advanced', ExamResultAdvancedViewSet, basename='exam-result-advanced')
router.register(r'grade-scales', GradeScaleViewSet, basename='grade-scale')
router.register(r'homework', HomeworkViewSet, basename='homework')
router.register(r'homework-submissions', HomeworkSubmissionViewSet, basename='homework-submission')
router.register(r'lesson-plans-advanced', LessonPlanAdvancedViewSet, basename='lesson-plan-advanced')
router.register(r'class-routines', ClassRoutineViewSet, basename='class-routine')
router.register(r'staff-attendance-advanced', StaffAttendanceAdvancedViewSet, basename='staff-attendance-advanced')

# Phase 6: Advanced HR Module (Payroll, Leave Management, Employee Management, Holidays)
router.register(r'designations-advanced', DesignationAdvancedViewSet, basename='designation-advanced')
router.register(r'employee-details', EmployeeDetailsViewSet, basename='employee-detail')
router.register(r'payroll-components', PayrollComponentViewSet, basename='payroll-component')
router.register(r'payroll-runs', PayrollRunViewSet, basename='payroll-run')
router.register(r'payslips-advanced', PayslipViewSet, basename='payslip-advanced')
router.register(r'leave-applications-advanced', LeaveApplicationAdvancedViewSet, basename='leave-application-advanced')
router.register(r'holidays', HolidayViewSet, basename='holiday')

# Phase 7: Admission & Utility Module (Enhanced versions with custom actions)
router.register(r'admission-queries-advanced', AdmissionQueryAdvancedViewSet, basename='admission-query-advanced')
router.register(r'visitor-book-advanced', VisitorBookAdvancedViewSet, basename='visitor-book-advanced')
router.register(r'complaints-advanced', ComplaintAdvancedViewSet, basename='complaint-advanced')
router.register(
    r'postal-receive',
    PostalReceiveViewSet,
    basename='postal-receive')
router.register(
    r'postal-dispatch',
    PostalDispatchViewSet,
    basename='postal-dispatch')
router.register(
    r'phone-call-logs',
    PhoneCallLogViewSet,
    basename='phone-call-log')
router.register(
    r'dorm-room-types',
    DormRoomTypeViewSet,
    basename='dorm-room-type')
router.register(r'dorm-rooms', DormRoomViewSet, basename='dorm-room')
router.register(
    r'dormitory-assignments',
    DormitoryAssignmentViewSet,
    basename='dormitory-assignment')

# Phase 8: Academic & Learning Enhanced Module (Comprehensive Enhancements)
router.register(r'admission-enhanced', AdmissionEnhancedViewSet, basename='admission-enhanced')
router.register(r'promotion-enhanced', StudentPromotionEnhancedViewSet, basename='promotion-enhanced')
router.register(r'assignments-enhanced', AssignmentEnhancedViewSet, basename='assignments-enhanced')
router.register(r'submissions-enhanced', AssignmentSubmissionEnhancedViewSet, basename='submissions-enhanced')
router.register(r'lessons-enhanced', LessonEnhancedViewSet, basename='lessons-enhanced')
router.register(r'topics-enhanced', TopicEnhancedViewSet, basename='topics-enhanced')
router.register(r'lesson-plans-enhanced', LessonPlanEnhancedViewSet, basename='lesson-plans-enhanced')
router.register(r'class-tests-enhanced', ClassTestEnhancedViewSet, basename='class-tests-enhanced')
router.register(r'online-exams-enhanced', OnlineExamEnhancedViewSet, basename='online-exams-enhanced')
router.register(r'question-bank', QuestionBankViewSet, basename='question-bank')
router.register(r'timetable-enhanced', TimetableEnhancedViewSet, basename='timetable-enhanced')

# Phase 9: Administrative & HR Enhanced Module (Complete Business Operations)
# Leave Management
router.register(r'leave-management-enhanced', LeaveManagementEnhancedViewSet, basename='leave-management-enhanced')
# Payroll Processing
router.register(r'payroll-run-enhanced', PayrollRunEnhancedViewSet, basename='payroll-run-enhanced')
# Staff Attendance
router.register(r'staff-attendance-enhanced', StaffAttendanceEnhancedViewSet, basename='staff-attendance-enhanced')
# Double-Entry Accounting (Chart of Accounts, Ledgers, Vouchers, Trial Balance, Reports)
router.register(r'accounting-system-enhanced', AccountingSystemEnhancedViewSet, basename='accounting-system-enhanced')
# Fee Management (Waivers, Refunds, Online Payments)
router.register(r'fee-management-enhanced', FeeManagementEnhancedViewSet, basename='fee-management-enhanced')
# Wallet System (Deposits, Transfers, Transaction History)
router.register(r'wallet-system-enhanced', WalletSystemEnhancedViewSet, basename='wallet-system-enhanced')
# Inventory Management (Stock Alerts, Movement Reports, Valuation)
router.register(r'inventory-enhanced', InventoryEnhancedViewSet, basename='inventory-enhanced')
# Library Management (Overdue Tracking, Statistics)
router.register(r'library-enhanced', LibraryEnhancedViewSet, basename='library-enhanced')
# Transport Management (Route-wise Students, Vehicle Summary)
router.register(r'transport-enhanced', TransportEnhancedViewSet, basename='transport-enhanced')
# Dormitory Management (Occupancy Reports, Room Assignments)
router.register(r'dormitory-enhanced', DormitoryEnhancedViewSet, basename='dormitory-enhanced')

# Phase 10: Communication & Notifications Enhanced Module (Real-Time Communication System)
# Email Template Management (Variable Substitution, Bulk Sending, Preview)
router.register(r'email-template-enhanced', EmailTemplateEnhancedViewSet, basename='email-template-enhanced')
# SMS Template Management (Gateway Integration, Variable Substitution)
router.register(r'sms-template-enhanced', SmsTemplateEnhancedViewSet, basename='sms-template-enhanced')
# Communication Logs (Email/SMS Audit Trail, Statistics)
router.register(r'communication-log-enhanced', CommunicationLogViewSet, basename='communication-log-enhanced')
# Chat System (Invitation-Based, Block/Unblock, WebSocket Ready)
router.register(r'chat-system-enhanced', ChatSystemEnhancedViewSet, basename='chat-system-enhanced')
# Announcements (Targeted Broadcasts, Auto-Notifications)
router.register(r'announcement-enhanced', AnnouncementEnhancedViewSet, basename='announcement-enhanced')
# Notifications (Real-Time Push, Read/Unread Management)
router.register(r'notification-enhanced', NotificationEnhancedViewSet, basename='notification-enhanced')

urlpatterns = [
    # Dashboard
    path(
        'dashboard/stats/',
        DashboardStatsView.as_view(),
        name='dashboard-stats'),
    path(
        'dashboard/activities/',
        RecentActivitiesView.as_view(),
        name='recent-activities'),
    path(
        'dashboard/events/',
        UpcomingEventsView.as_view(),
        name='upcoming-events'),

    # Students
    path('students/', StudentListView.as_view(), name='student-list'),
    path(
        'students/create/',
        StudentCreateView.as_view(),
        name='student-create'),
    path(
        'students/import/',
        StudentImportView.as_view(),
        name='student-import'),
    path('students/download-credentials/',
         StudentCredentialsDownloadView.as_view(),
         name='student-credentials-download'),
    path(
        'students/<int:pk>/',
        StudentDetailView.as_view(),
        name='student-detail'),
    path('students/stats/', StudentStatsView.as_view(), name='student-stats'),

    # Teachers
    path('teachers/', TeacherListView.as_view(), name='teacher-list'),
    path(
        'teachers/create/',
        TeacherCreateView.as_view(),
        name='teacher-create'),
    path(
        'teachers/<int:pk>/',
        TeacherDetailView.as_view(),
        name='teacher-detail'),
    path('teachers/stats/', TeacherStatsView.as_view(), name='teacher-stats'),

    # Classes
    path('classes/', ClassListView.as_view(), name='class-list'),
    path('classes/create/', ClassCreateView.as_view(), name='class-create'),
    path('classes/<int:pk>/', ClassDetailView.as_view(), name='class-detail'),
    path('classes/stats/', ClassStatsView.as_view(), name='class-stats'),

    # Subjects
    path('subjects/', SubjectListView.as_view(), name='subject-list'),
    path(
        'subjects/create/',
        SubjectCreateView.as_view(),
        name='subject-create'),
    path(
        'subjects/<int:pk>/',
        SubjectDetailView.as_view(),
        name='subject-detail'),

    # Rooms
    path('rooms/', RoomListView.as_view(), name='room-list'),
    path('rooms/create/', RoomCreateView.as_view(), name='room-create'),
    path('rooms/stats/', RoomStatsView.as_view(), name='room-stats'),
    path('rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),

    # Grades - handled by GradeViewSet in router (see router.register above)
    # Keeping only stats endpoint as it has custom logic
    path('grades/stats/', GradeStatsView.as_view(), name='grade-stats'),

    # Attendance
    path(
        'attendance/',
        AttendanceListCreateView.as_view(),
        name='attendance-list-create'),
    path(
        'attendance/<int:pk>/',
        AttendanceDetailView.as_view(),
        name='attendance-detail'),
    path(
        'class-students/',
        ClassStudentsView.as_view(),
        name='class-students'),

    # Reports & Analytics
    path(
        'reports/analytics/',
        ReportAnalyticsView.as_view(),
        name='report-analytics'),

    # Notifications
    path(
        'notifications/',
        NotificationsView.as_view(),
        name='admin-notifications'),
]

# Payment endpoints (Stripe integration)

urlpatterns += [
    path(
        'payments/create-intent/',
        create_payment_intent,
        name='create-payment-intent'),
    path(
        'payments/confirm/',
        confirm_payment,
        name='confirm-payment'),
    path(
        'payments/webhook/',
        stripe_webhook,
        name='stripe-webhook'),
    path(
        'payments/history/<int:student_id>/',
        get_payment_history,
        name='payment-history'),
    path(
        'payments/refund/',
        create_refund,
        name='create-refund'),
]

# Bulk Import/Export endpoints

urlpatterns += [
    path(
        'bulk/import/students/',
        bulk_import_students,
        name='bulk-import-students'),
    path(
        'bulk/import/teachers/',
        bulk_import_teachers,
        name='bulk-import-teachers'),
    path(
        'bulk/export/students/',
        export_students,
        name='export-students'),
    path(
        'bulk/export/teachers/',
        export_teachers,
        name='export-teachers'),
    path(
        'bulk/template/<str:entity_type>/',
        download_import_template,
        name='download-template'),
]

# Include router URLs at /api/admin/
urlpatterns += [
    path('', include(router.urls)),
]
