from .attendance import AttendanceListCreateView, AttendanceDetailView, ClassStudentsView
from .dashboard import DashboardStatsView, RecentActivitiesView, UpcomingEventsView
from .student import StudentListView, StudentDetailView, StudentStatsView, StudentCreateView
from .teacher import TeacherListView, TeacherDetailView, TeacherStatsView, TeacherCreateView
from .class_view import ClassListView, ClassDetailView, ClassStatsView, ClassCreateView
from .subject import SubjectListView, SubjectDetailView, SubjectCreateView
from .grade import GradeListView, GradeDetailView, GradeStatsView
from .enhanced_reports import ReportViewSet
from .enrollment import EnrollmentViewSet
from .classroom import ClassRoomViewSet
from .fee import FeeStructureViewSet, FeePaymentViewSet
from .exam import ExamViewSet, ExamScheduleViewSet, ExamResultViewSet
from .timetable import TimeSlotViewSet, TimetableViewSet
from .assignment import AssignmentViewSet, AssignmentSubmissionViewSet
from .communication import AnnouncementViewSet, MessageViewSet, NotificationViewSet
from .user import UserViewSet
from .library import BookCategoryViewSet, LibraryMemberViewSet, BookViewSet, BookIssueViewSet
from .transport import TransportRouteViewSet, TransportVehicleViewSet, VehicleAssignmentViewSet
from .dormitory import DormRoomTypeViewSet, DormRoomViewSet, DormitoryAssignmentViewSet
from .online_exam import OnlineExamViewSet
from .question import QuestionGroupViewSet, QuestionViewSet
from .class_test import ClassTestViewSet
from .hr import DesignationViewSet, DepartmentViewSet, EmployeeViewSet, StaffAttendanceViewSet, PayrollRecordViewSet
from .leave import LeaveTypeViewSet, LeaveDefineViewSet, LeaveApplicationViewSet
from .role_permission import RoleViewSet, LoginPermissionViewSet, DueFeesLoginPermissionViewSet
from .wallet import WalletAccountViewSet, WalletTransactionViewSet, WalletDepositRequestViewSet, WalletRefundRequestViewSet
from .accounts import ChartOfAccountViewSet, AccountTransactionViewSet
from .inventory import SupplierViewSet, ItemCategoryViewSet, ItemViewSet, ItemReceiveViewSet, ItemIssueViewSet
from .communicate_admin import EmailTemplateViewSet, SmsTemplateViewSet, EmailSmsLogViewSet
from .chat_admin import ChatInvitationViewSet, BlockedChatUserViewSet
from .style_admin import ColorThemeViewSet, BackgroundSettingViewSet

__all__ = [
    'AttendanceListCreateView',
    'AttendanceDetailView',
    'ClassStudentsView',
    'DashboardStatsView',
    'RecentActivitiesView',
    'UpcomingEventsView',
    'StudentListView',
    'StudentDetailView',
    'StudentStatsView',
    'StudentCreateView',
    'TeacherListView',
    'TeacherDetailView',
    'TeacherStatsView',
    'TeacherCreateView',
    'ClassListView',
    'ClassDetailView',
    'ClassStatsView',
    'ClassCreateView',
    'SubjectListView',
    'SubjectDetailView',
    'SubjectCreateView',
    'GradeListView',
    'GradeDetailView',
    'GradeStatsView',
    'ReportViewSet',
    'EnrollmentViewSet',
    'ClassRoomViewSet',
    'FeeStructureViewSet',
    'FeePaymentViewSet',
    'ExamViewSet',
    'ExamScheduleViewSet',
    'ExamResultViewSet',
    'TimeSlotViewSet',
    'TimetableViewSet',
    'AssignmentViewSet',
    'AssignmentSubmissionViewSet',
    'AnnouncementViewSet',
    'MessageViewSet',
    'NotificationViewSet',
    'UserViewSet',
    'BookCategoryViewSet',
    'LibraryMemberViewSet',
    'BookViewSet',
    'BookIssueViewSet',
    'OnlineExamViewSet',
    'QuestionGroupViewSet',
    'QuestionViewSet',
    'ClassTestViewSet',
    'DesignationViewSet',
    'DepartmentViewSet',
    'EmployeeViewSet',
    'StaffAttendanceViewSet',
    'PayrollRecordViewSet',
    'LeaveTypeViewSet',
    'LeaveDefineViewSet',
    'LeaveApplicationViewSet',
    'RoleViewSet',
    'LoginPermissionViewSet',
    'DueFeesLoginPermissionViewSet',
    'WalletAccountViewSet',
    'WalletTransactionViewSet',
    'WalletDepositRequestViewSet',
    'WalletRefundRequestViewSet',
    'ChartOfAccountViewSet',
    'AccountTransactionViewSet',
    'SupplierViewSet',
    'ItemCategoryViewSet',
    'ItemViewSet',
    'ItemReceiveViewSet',
    'ItemIssueViewSet',
    'EmailTemplateViewSet',
    'SmsTemplateViewSet',
    'EmailSmsLogViewSet',
    'ChatInvitationViewSet',
    'BlockedChatUserViewSet',
    'ColorThemeViewSet',
    'BackgroundSettingViewSet',
    'TransportRouteViewSet',
    'TransportVehicleViewSet',
    'VehicleAssignmentViewSet',
    'DormRoomTypeViewSet',
    'DormRoomViewSet',
    'DormitoryAssignmentViewSet',
]
