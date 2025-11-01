import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { NotificationProvider } from "@/lib/notifications";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/admin/Students";
import DeleteStudent from "./pages/admin/Students/Delete";
import MultiClassStudent from "./pages/admin/Students/MultiClass";
import StudentList from "./pages/admin/Students/List";
import UnassignedStudent from "./pages/admin/Students/Unassigned";
import AddStudent from "./pages/admin/Students/Add";
import StudentCategory from "./pages/admin/Students/Category";
import AdminStudentAttendance from "./pages/admin/Students/Attendance";
import StudentGroup from "./pages/admin/Students/Group";
import StudentPromote from "./pages/admin/Students/Promote";
import DisabledStudents from "./pages/admin/Students/Disabled";
import SubjectAttendance from "./pages/admin/Students/SubjectAttendance";
import StudentExport from "./pages/admin/Students/Export";
import SmsSendingTime from "./pages/admin/Students/SmsSendingTime";
import Incidents from "./pages/admin/BehaviourRecords/Incidents";
import AssignIncident from "./pages/admin/BehaviourRecords/AssignIncident";
import StudentIncidentReport from "./pages/admin/BehaviourRecords/StudentIncidentReport";
import BehaviourReport from "./pages/admin/BehaviourRecords/BehaviourReport";
import ClassSectionReport from "./pages/admin/BehaviourRecords/ClassSectionReport";
import IncidentWiseReport from "./pages/admin/BehaviourRecords/IncidentWiseReport";
import Settings from "./pages/admin/BehaviourRecords/Settings";
import AdminTeachers from "./pages/admin/Teachers";
import AdminEmployees from "./pages/admin/Employees";
import AdminAssignTeacher from "./pages/admin/AssignTeacher";
import AdminClassSubjects from "./pages/admin/ClassSubjects";
import AdminClasses from "./pages/admin/Classes";
import OptionalSubject from "./pages/admin/Academics/OptionalSubject";
import Section from "./pages/admin/Academics/Section";
import ClassPage from "./pages/admin/Academics/Class";
import ClassRoom from "./pages/admin/Academics/ClassRoom";
import Subjects from "./pages/admin/Academics/Subjects";
import AssignClassTeacher from "./pages/admin/Academics/AssignClassTeacher";
import AssignSubject from "./pages/admin/Academics/AssignSubject";
import ClassRoutine from "./pages/admin/Academics/ClassRoutine";
import UploadContent from "./pages/admin/StudyMaterial/UploadContent";
import Syllabus from "./pages/admin/StudyMaterial/Syllabus";
import OtherDownloads from "./pages/admin/StudyMaterial/OtherDownloads";
import Lesson from "./pages/admin/LessonPlan/Lesson";
import Topic from "./pages/admin/LessonPlan/Topic";
import TopicOverview from "./pages/admin/LessonPlan/TopicOverview";
import LessonPlan from "./pages/admin/LessonPlan/LessonPlan";
import LessonPlanOverview from "./pages/admin/LessonPlan/LessonPlanOverview";
import BulkIdCard from "./pages/admin/BulkPrint/IdCard";
import BulkCertificate from "./pages/admin/BulkPrint/Certificate";
import BulkPayroll from "./pages/admin/BulkPrint/Payroll";
import AdminSubjects from "./pages/admin/Subjects";
import AdminRooms from "./pages/admin/Rooms";
import AdminGrades from "./pages/admin/Grades";
import SimpleGrades from './pages/admin/SimpleGrades';
import GradesDebug from './pages/admin/GradesDebug';
import GradesSimpleTest from './pages/admin/GradesSimpleTest';
import Grades from './pages/admin/Grades';
import GradesNoDashboard from './pages/admin/GradesNoDashboard';
import GradesWithDashboard from './pages/admin/GradesWithDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import AdminReports from "./pages/admin/Reports";
import StudentAttendanceReport from "./pages/admin/Reports/StudentAttendanceReport";
import SubjectAttendanceReport from "./pages/admin/Reports/SubjectAttendanceReport";
import HomeworkEvaluationReport from "./pages/admin/Reports/HomeworkEvaluationReport";
import StudentTransportReport from "./pages/admin/Reports/StudentTransportReport";
import StudentDormitoryReport from "./pages/admin/Reports/StudentDormitoryReport";
import GuardianReport from "./pages/admin/Reports/GuardianReport";
import StudentLoginInfo from "./pages/admin/Reports/StudentLoginInfo";
import ClassReport from "./pages/admin/Reports/ClassReport";
import ClassRoutineReport from "./pages/admin/Reports/ClassRoutineReport";
import UserLog from "./pages/admin/Reports/UserLog";
import StudentReport from "./pages/admin/Reports/StudentReport";
import ExamRoutineReport from "./pages/admin/Reports/ExamRoutineReport";
import MeritListReport from "./pages/admin/Reports/MeritListReport";
import OnlineExamReport from "./pages/admin/Reports/OnlineExamReport";
import MarkSheetReportStudent from "./pages/admin/Reports/MarkSheetReportStudent";
import TabulationSheetReport from "./pages/admin/Reports/TabulationSheetReport";
import TestGrades from "./pages/admin/TestGrades";
import SimpleTest from "./pages/SimpleTest";
import ProgressCardReport from "./pages/admin/Reports/ProgressCardReport";
import ProgressCardReport100 from "./pages/admin/Reports/ProgressCardReport100";
import PreviousResult from "./pages/admin/Reports/PreviousResult";
import StaffAttendanceReport from "./pages/admin/Reports/StaffAttendanceReport";
import PayrollReport from "./pages/admin/Reports/PayrollReport";
import AdvancedReports from "./pages/admin/Reports/AdvancedReports";
import AttendanceReports from "./pages/admin/Reports/AttendanceReports";
import FeeReports from "./pages/admin/Reports/FeeReports";
import AccountsTransactionReport from "./pages/admin/Reports/AccountsTransactionReport";
import FeesDueReport from "./pages/admin/Reports/FeesDueReport";
import FeesFineReport from "./pages/admin/Reports/FeesFineReport";
import PaymentReport from "./pages/admin/Reports/PaymentReport";
import BalanceReport from "./pages/admin/Reports/BalanceReport";
import WaiverReport from "./pages/admin/Reports/WaiverReport";
import WalletReport from "./pages/admin/Reports/WalletReport";
import AdminAttendance from "./pages/admin/Attendance";
import AdminFeeManagement from "./pages/admin/FeeManagement";
import FeesGroup from "./pages/admin/Fees/Group";
import FeesType from "./pages/admin/Fees/Type";
import FeesInvoice from "./pages/admin/Fees/Invoice";
import BankPayment from "./pages/admin/Fees/BankPayment";
import CarryForward from "./pages/admin/Fees/CarryForward";
import AddHomework from "./pages/admin/Homework/Add";
import HomeworkList from "./pages/admin/Homework/List";
import HomeworkReport from "./pages/admin/Homework/Report";
import AddBook from "./pages/admin/Library/AddBook";
import BookList from "./pages/admin/Library/List";
import Categories from "./pages/admin/Library/Categories";
import AddMember from "./pages/admin/Library/AddMember";
import IssueReturn from "./pages/admin/Library/IssueReturn";
import Issued from "./pages/admin/Library/Issued";
import Subject from "./pages/admin/Library/Subject";
import TransportRoutes from "./pages/admin/Transport/Routes";
import TransportVehicle from "./pages/admin/Transport/Vehicle";
import TransportAssignVehicle from "./pages/admin/Transport/AssignVehicle";
import DormitoryRooms from "./pages/admin/Dormitory/Rooms";
import DormitoryList from "./pages/admin/Dormitory/List";
import DormitoryRoomType from "./pages/admin/Dormitory/RoomType";
import AdmissionManagement from "./pages/admin/Admission/AdmissionManagement";
import StudentPromotion from "./pages/admin/Admission/StudentPromotion";
import ProgressCardManagement from "./pages/admin/Academic/ProgressCardManagement";
import MeritListGeneration from "./pages/admin/Academic/MeritListGeneration";
import PayrollManagement from "./pages/admin/Hr/PayrollManagement";
import LeaveManagement from "./pages/admin/Hr/LeaveManagement";
import ExpenseManagement from "./pages/admin/Finance/ExpenseManagement";
import AssetManagement from "./pages/admin/Assets/AssetManagement";
import AccountingManagement from "./pages/admin/Finance/AccountingManagement";
import AdminAccounts from "./pages/admin/Accounts";
import ProfitLoss from "./pages/admin/Accounts/ProfitLoss";
import AdminSalary from "./pages/admin/Salary";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminSettings from "./pages/admin/Settings";
import Designation from "./pages/admin/Hr/Designation";
import Income from "./pages/admin/Accounts/Income";
import Expense from "./pages/admin/Accounts/Expense";
import ChartOfAccount from "./pages/admin/Accounts/ChartOfAccount";
import BankAccount from "./pages/admin/Accounts/BankAccount";
import FundTransfer from "./pages/admin/Accounts/FundTransfer";
import ItemCategory from "./pages/admin/Inventory/ItemCategory";
import ItemList from "./pages/admin/Inventory/ItemList";
import ItemStore from "./pages/admin/Inventory/ItemStore";
import ItemReceive from "./pages/admin/Inventory/ItemReceive";
import ItemReceiveList from "./pages/admin/Inventory/ItemReceiveList";
import ItemSell from "./pages/admin/Inventory/ItemSell";
import ItemIssue from "./pages/admin/Inventory/ItemIssue";
import ChatBox from "./pages/admin/Chat/Box";
import Invitation from "./pages/admin/Chat/Invitation";
import BlockedUser from "./pages/admin/Chat/BlockedUser";
import NoticeBoard from "./pages/admin/Communicate/NoticeBoard";
import SendEmailSms from "./pages/admin/Communicate/SendEmailSms";
import EmailSmsLog from "./pages/admin/Communicate/EmailSmsLog";
import Event from "./pages/admin/Communicate/Event";
import Calendar from "./pages/admin/Communicate/Calendar";
import EmailTemplate from "./pages/admin/Communicate/EmailTemplate";
import SmsTemplate from "./pages/admin/Communicate/SmsTemplate";
import BackgroundSettings from "./pages/admin/Style/BackgroundSettings";
import ColorTheme from "./pages/admin/Style/ColorTheme";
import Supplier from "./pages/admin/Inventory/Supplier";
import Department from "./pages/admin/Hr/Department";
import AddStaff from "./pages/admin/Hr/AddStaff";
import StaffDirectory from "./pages/admin/Hr/StaffDirectory";
import StaffAttendance from "./pages/admin/Hr/Attendance";
import Payroll from "./pages/admin/Hr/Payroll";
import ApprovedReport from "./pages/admin/TeacherEvaluation/ApprovedReport";
import PendingReport from "./pages/admin/TeacherEvaluation/PendingReport";
import TeacherWiseReport from "./pages/admin/TeacherEvaluation/TeacherWiseReport";
import TeacherEvaluationSettings from "./pages/admin/TeacherEvaluation/Settings";
import ExamManagement from "./pages/admin/ExamManagement";
import ExamType from "./pages/admin/Examination/Type";
import ExamSetup from "./pages/admin/Examination/Setup";
import ExamSchedule from "./pages/admin/Examination/Schedule";
import ExamAttendance from "./pages/admin/Examination/Attendance";
import MarksRegister from "./pages/admin/Examination/MarksRegister";
import MarksGrade from "./pages/admin/Examination/MarksGrade";
import SendMarksSms from "./pages/admin/Examination/SendMarksSms";
import MarksheetReport from "./pages/admin/Examination/MarksheetReport";
import AdmitCard from "./pages/admin/ExamPlan/AdmitCard";
import SeatPlan from "./pages/admin/ExamPlan/SeatPlan";
import QuestionGroup from "./pages/admin/OnlineExam/QuestionGroup";
import QuestionBank from "./pages/admin/OnlineExam/QuestionBank";
import OnlineExamManage from "./pages/admin/OnlineExam/Manage";
import ApplyLeave from "./pages/admin/Leave/Apply";
import ApproveLeave from "./pages/admin/Leave/Approve";
import PendingLeave from "./pages/admin/Leave/Pending";
import LeaveDefine from "./pages/admin/Leave/Define";
import LeaveType from "./pages/admin/Leave/Type";
import LoginPermission from "./pages/admin/RolePermission/LoginPermission";
import Role from "./pages/admin/RolePermission/Role";
import DueFeesLoginPermission from "./pages/admin/RolePermission/DueFeesLoginPermission";
import PendingDeposit from "./pages/admin/Wallet/PendingDeposit";
import ApproveDeposit from "./pages/admin/Wallet/ApproveDeposit";
import RejectDeposit from "./pages/admin/Wallet/RejectDeposit";
import Transaction from "./pages/admin/Wallet/Transaction";
import RefundRequest from "./pages/admin/Wallet/RefundRequest";
import AdminClassTests from "./pages/admin/ClassTests";
import TimetableManagement from "./pages/admin/TimetableManagement";
import AssignmentManagement from "./pages/admin/AssignmentManagement";
import Communications from "./pages/admin/Communications";
import AdmissionQuery from "./pages/admin/AdminSection/AdmissionQuery";
import VisitorBook from "./pages/admin/AdminSection/VisitorBook";
import Complaint from "./pages/admin/AdminSection/Complaint";
import PostalReceive from "./pages/admin/AdminSection/PostalReceive";
import PostalDispatch from "./pages/admin/AdminSection/PostalDispatch";
import PhoneCallLog from "./pages/admin/AdminSection/PhoneCallLog";
import AdminSetup from "./pages/admin/AdminSection/AdminSetup";
import IdCard from "./pages/admin/AdminSection/IdCard";
import Certificate from "./pages/admin/AdminSection/Certificate";
import GenerateCertificate from "./pages/admin/AdminSection/GenerateCertificate";
import GenerateIdCard from "./pages/admin/AdminSection/GenerateIdCard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherStudents from "./pages/teacher/Students";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherMessages from "./pages/teacher/Messages";
import TeacherResources from "./pages/teacher/Resources";
import TeacherSettings from "./pages/teacher/Settings";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourses from "./pages/student/Courses";
import StudentAssignments from "./pages/student/Assignments";
import StudentSchedule from "./pages/student/Schedule";
import StudentGrades from "./pages/student/Grades";
import StudentAttendance from "./pages/student/Attendance";
import StudentMessages from "./pages/student/Messages";
import StudentAchievements from "./pages/student/Achievements";
import StudentSettings from "./pages/student/Settings";
import StudentFeeManagement from "./pages/student/FeeManagement";
import ParentDashboard from "./pages/ParentDashboard";
import ChildAttendancePage from "./pages/parent/ChildAttendancePage";
import ChildGradesPage from "./pages/parent/ChildGradesPage";
import MessagesPage from "./pages/parent/MessagesPage";
import FeeManagementPage from "./pages/parent/FeeManagementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test" element={<SimpleTest />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/students/delete" element={<ProtectedRoute><DeleteStudent /></ProtectedRoute>} />
            <Route path="/admin/students/multi-class" element={<ProtectedRoute><MultiClassStudent /></ProtectedRoute>} />
            <Route path="/admin/students/list" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
            <Route path="/admin/students/unassigned" element={<ProtectedRoute><UnassignedStudent /></ProtectedRoute>} />
            <Route path="/admin/students/add" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
            <Route path="/admin/students/attendance" element={<ProtectedRoute><AdminStudentAttendance /></ProtectedRoute>} />
            <Route path="/admin/students/promote" element={<ProtectedRoute><StudentPromote /></ProtectedRoute>} />
            <Route path="/admin/students/subject-attendance" element={<ProtectedRoute><SubjectAttendance /></ProtectedRoute>} />
            <Route path="/admin/students/export" element={<ProtectedRoute><StudentExport /></ProtectedRoute>} />
            <Route path="/admin/students/sms-sending-time" element={<ProtectedRoute><SmsSendingTime /></ProtectedRoute>} />
            <Route path="/admin/behaviour-records/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
            <Route path="/admin/behaviour-records/assign-incident" element={<ProtectedRoute><AssignIncident /></ProtectedRoute>} />
            <Route path="/admin/behaviour-records/student-incident-report" element={<ProtectedRoute><StudentIncidentReport /></ProtectedRoute>} />
            <Route path="/admin/behaviour-records/behaviour-report" element={<ProtectedRoute><BehaviourReport /></ProtectedRoute>} />
            <Route path="/admin/behaviour-records/class-section-report" element={<ProtectedRoute><ClassSectionReport /></ProtectedRoute>} />
            <Route path="/admin/behaviour-records/incident-wise-report" element={<ProtectedRoute><IncidentWiseReport /></ProtectedRoute>} />
            <Route path="/admin/behaviour-records/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin/students/disabled" element={<ProtectedRoute><DisabledStudents /></ProtectedRoute>} />
            <Route path="/admin/students/group" element={<ProtectedRoute><StudentGroup /></ProtectedRoute>} />
            <Route path="/admin/students/category" element={<ProtectedRoute><StudentCategory /></ProtectedRoute>} />
            
            {/* Phase 2: Academic Enhancement Routes */}
            <Route path="/admin/admission/applications" element={<ProtectedRoute><AdmissionManagement /></ProtectedRoute>} />
            <Route path="/admin/admission/promotion" element={<ProtectedRoute><StudentPromotion /></ProtectedRoute>} />
            <Route path="/admin/academic/progress-cards" element={<ProtectedRoute><ProgressCardManagement /></ProtectedRoute>} />
            <Route path="/admin/academic/merit-lists" element={<ProtectedRoute><MeritListGeneration /></ProtectedRoute>} />
            
            {/* Phase 3: Administrative Management Routes */}
            <Route path="/admin/hr/payroll" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} />
            <Route path="/admin/hr/leave" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
            <Route path="/admin/finance/expenses" element={<ProtectedRoute><ExpenseManagement /></ProtectedRoute>} />
            <Route path="/admin/assets" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
            <Route path="/admin/finance/accounting" element={<ProtectedRoute><AccountingManagement /></ProtectedRoute>} />
            
            <Route path="/admin/teachers" element={<ProtectedRoute><AdminTeachers /></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute><AdminEmployees /></ProtectedRoute>} />
            <Route path="/admin/assign-teacher" element={<ProtectedRoute><AdminAssignTeacher /></ProtectedRoute>} />
            <Route path="/admin/class-subjects" element={<ProtectedRoute><AdminClassSubjects /></ProtectedRoute>} />
            <Route path="/admin/classes" element={<ProtectedRoute><AdminClasses /></ProtectedRoute>} />
              <Route path="/admin/academics/optional-subject" element={<ProtectedRoute><OptionalSubject /></ProtectedRoute>} />
            <Route path="/admin/academics/section" element={<ProtectedRoute><Section /></ProtectedRoute>} />
              <Route path="/admin/academics/class" element={<ProtectedRoute><ClassPage /></ProtectedRoute>} />
              <Route path="/admin/academics/class-room" element={<ProtectedRoute><ClassRoom /></ProtectedRoute>} />
              <Route path="/admin/academics/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path="/admin/academics/assign-class-teacher" element={<ProtectedRoute><AssignClassTeacher /></ProtectedRoute>} />
              <Route path="/admin/academics/assign-subject" element={<ProtectedRoute><AssignSubject /></ProtectedRoute>} />
              <Route path="/admin/academics/class-routine" element={<ProtectedRoute><ClassRoutine /></ProtectedRoute>} />
              <Route path="/admin/study-material/upload-content" element={<ProtectedRoute><UploadContent /></ProtectedRoute>} />
              <Route path="/admin/study-material/syllabus" element={<ProtectedRoute><Syllabus /></ProtectedRoute>} />
              <Route path="/admin/study-material/other-downloads" element={<ProtectedRoute><OtherDownloads /></ProtectedRoute>} />
              <Route path="/admin/lesson-plan/lesson" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
              <Route path="/admin/lesson-plan/topic" element={<ProtectedRoute><Topic /></ProtectedRoute>} />
              <Route path="/admin/lesson-plan/topic-overview" element={<ProtectedRoute><TopicOverview /></ProtectedRoute>} />
              <Route path="/admin/lesson-plan/lesson-plan" element={<ProtectedRoute><LessonPlan /></ProtectedRoute>} />
              <Route path="/admin/lesson-plan/lesson-plan-overview" element={<ProtectedRoute><LessonPlanOverview /></ProtectedRoute>} />
              <Route path="/admin/bulk-print/id-card" element={<ProtectedRoute><BulkIdCard /></ProtectedRoute>} />
              <Route path="/admin/bulk-print/certificate" element={<ProtectedRoute><BulkCertificate /></ProtectedRoute>} />
              <Route path="/admin/bulk-print/payroll" element={<ProtectedRoute><BulkPayroll /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute><AdminSubjects /></ProtectedRoute>} />
            <Route path="/admin/rooms" element={<ProtectedRoute><AdminRooms /></ProtectedRoute>} />
                <Route path="/admin/grades" element={<ProtectedRoute><ErrorBoundary><GradesWithDashboard /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/admin/grades-no-dashboard" element={<ProtectedRoute><ErrorBoundary><GradesNoDashboard /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/admin/grades-simple" element={<ProtectedRoute><SimpleGrades /></ProtectedRoute>} />
            <Route path="/admin/grades-full" element={<ProtectedRoute><AdminGrades /></ProtectedRoute>} />
            <Route path="/admin/test-grades" element={<ProtectedRoute><TestGrades /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/reports/student/attendance" element={<ProtectedRoute><StudentAttendanceReport /></ProtectedRoute>} />
            <Route path="/admin/reports/exam/routine" element={<ProtectedRoute><ExamRoutineReport /></ProtectedRoute>} />
            <Route path="/admin/reports/exam/merit-list" element={<ProtectedRoute><MeritListReport /></ProtectedRoute>} />
            <Route path="/admin/reports/exam/online" element={<ProtectedRoute><OnlineExamReport /></ProtectedRoute>} />
            <Route path="/admin/reports/exam/mark-sheet" element={<ProtectedRoute><MarkSheetReportStudent /></ProtectedRoute>} />
            <Route path="/admin/reports/exam/progress-card" element={<ProtectedRoute><ProgressCardReport /></ProtectedRoute>} />
            <Route path="/admin/reports/exam/progress-card-100" element={<ProtectedRoute><ProgressCardReport100 /></ProtectedRoute>} />
            <Route path="/admin/reports/exam/previous-result" element={<ProtectedRoute><PreviousResult /></ProtectedRoute>} />
            <Route path="/admin/reports/staff/attendance" element={<ProtectedRoute><StaffAttendanceReport /></ProtectedRoute>} />
            <Route path="/admin/reports/staff/payroll" element={<ProtectedRoute><PayrollReport /></ProtectedRoute>} />
            <Route path="/admin/reports/advanced" element={<ProtectedRoute><AdvancedReports /></ProtectedRoute>} />
            <Route path="/admin/reports/advanced/attendance" element={<ProtectedRoute><AttendanceReports /></ProtectedRoute>} />
            <Route path="/admin/reports/advanced/fees" element={<ProtectedRoute><FeeReports /></ProtectedRoute>} />
            <Route path="/admin/reports/accounts/payroll" element={<ProtectedRoute><PayrollReport /></ProtectedRoute>} />
            <Route path="/admin/reports/accounts/transaction" element={<ProtectedRoute><AccountsTransactionReport /></ProtectedRoute>} />
            <Route path="/admin/reports/fees/due" element={<ProtectedRoute><FeesDueReport /></ProtectedRoute>} />
            <Route path="/admin/reports/fees/fine" element={<ProtectedRoute><FeesFineReport /></ProtectedRoute>} />
            <Route path="/admin/reports/fees/payment" element={<ProtectedRoute><PaymentReport /></ProtectedRoute>} />
            <Route path="/admin/reports/fees/balance" element={<ProtectedRoute><BalanceReport /></ProtectedRoute>} />
            <Route path="/admin/reports/fees/waiver" element={<ProtectedRoute><WaiverReport /></ProtectedRoute>} />
            <Route path="/admin/reports/fees/wallet" element={<ProtectedRoute><WalletReport /></ProtectedRoute>} />
            <Route path="/admin/reports/exam/tabulation-sheet" element={<ProtectedRoute><TabulationSheetReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/subject-attendance" element={<ProtectedRoute><SubjectAttendanceReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/homework-evaluation" element={<ProtectedRoute><HomeworkEvaluationReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/transport" element={<ProtectedRoute><StudentTransportReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/dormitory" element={<ProtectedRoute><StudentDormitoryReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/report" element={<ProtectedRoute><StudentReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/guardian" element={<ProtectedRoute><GuardianReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/login" element={<ProtectedRoute><StudentLoginInfo /></ProtectedRoute>} />
            <Route path="/admin/reports/student/class-report" element={<ProtectedRoute><ClassReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/class-routine" element={<ProtectedRoute><ClassRoutineReport /></ProtectedRoute>} />
            <Route path="/admin/reports/student/user-log" element={<ProtectedRoute><UserLog /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/attendance/employees" element={<ProtectedRoute><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/attendance/class-report" element={<ProtectedRoute><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/attendance/students-report" element={<ProtectedRoute><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/attendance/employees-report" element={<ProtectedRoute><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/fees" element={<ProtectedRoute><AdminFeeManagement /></ProtectedRoute>} />
            <Route path="/admin/fees/group" element={<ProtectedRoute><FeesGroup /></ProtectedRoute>} />
            <Route path="/admin/fees/type" element={<ProtectedRoute><FeesType /></ProtectedRoute>} />
            <Route path="/admin/fees/invoice" element={<ProtectedRoute><FeesInvoice /></ProtectedRoute>} />
            <Route path="/admin/fees/bank-payment" element={<ProtectedRoute><BankPayment /></ProtectedRoute>} />
            <Route path="/admin/fees/carry-forward" element={<ProtectedRoute><CarryForward /></ProtectedRoute>} />
            <Route path="/admin/homework/add" element={<ProtectedRoute><AddHomework /></ProtectedRoute>} />
            <Route path="/admin/homework/list" element={<ProtectedRoute><HomeworkList /></ProtectedRoute>} />
            <Route path="/admin/homework/report" element={<ProtectedRoute><HomeworkReport /></ProtectedRoute>} />
            <Route path="/admin/library/add-book" element={<ProtectedRoute><AddBook /></ProtectedRoute>} />
            <Route path="/admin/library/list" element={<ProtectedRoute><BookList /></ProtectedRoute>} />
            <Route path="/admin/library/add-member" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
            <Route path="/admin/library/issue-return" element={<ProtectedRoute><IssueReturn /></ProtectedRoute>} />
            <Route path="/admin/library/issued" element={<ProtectedRoute><Issued /></ProtectedRoute>} />
            <Route path="/admin/library/subject" element={<ProtectedRoute><Subject /></ProtectedRoute>} />
            <Route path="/admin/library/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/admin/transport/routes" element={<ProtectedRoute><TransportRoutes /></ProtectedRoute>} />
            <Route path="/admin/transport/vehicle" element={<ProtectedRoute><TransportVehicle /></ProtectedRoute>} />
            <Route path="/admin/transport/assign-vehicle" element={<ProtectedRoute><TransportAssignVehicle /></ProtectedRoute>} />
            <Route path="/admin/dormitory/rooms" element={<ProtectedRoute><DormitoryRooms /></ProtectedRoute>} />
            <Route path="/admin/dormitory/list" element={<ProtectedRoute><DormitoryList /></ProtectedRoute>} />
            <Route path="/admin/dormitory/room-type" element={<ProtectedRoute><DormitoryRoomType /></ProtectedRoute>} />
            <Route path="/admin/salary" element={<ProtectedRoute><AdminSalary /></ProtectedRoute>} />
            <Route path="/admin/salary/pay" element={<ProtectedRoute><AdminSalary /></ProtectedRoute>} />
            <Route path="/admin/salary/paid-slip" element={<ProtectedRoute><AdminSalary /></ProtectedRoute>} />
            <Route path="/admin/salary/sheet" element={<ProtectedRoute><AdminSalary /></ProtectedRoute>} />
            <Route path="/admin/salary/report" element={<ProtectedRoute><AdminSalary /></ProtectedRoute>} />
            <Route path="/admin/accounts" element={<ProtectedRoute><AdminAccounts /></ProtectedRoute>} />
            <Route path="/admin/accounts/chart" element={<ProtectedRoute><AdminAccounts /></ProtectedRoute>} />
            <Route path="/admin/accounts/profit-loss" element={<ProtectedRoute><ProfitLoss /></ProtectedRoute>} />
            <Route path="/admin/accounts/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
            <Route path="/admin/accounts/chart-of-account" element={<ProtectedRoute><ChartOfAccount /></ProtectedRoute>} />
            <Route path="/admin/accounts/expense" element={<ProtectedRoute><Expense /></ProtectedRoute>} />
            <Route path="/admin/accounts/bank-account" element={<ProtectedRoute><BankAccount /></ProtectedRoute>} />
            <Route path="/admin/accounts/fund-transfer" element={<ProtectedRoute><FundTransfer /></ProtectedRoute>} />
            <Route path="/admin/inventory/item-category" element={<ProtectedRoute><ItemCategory /></ProtectedRoute>} />
            <Route path="/admin/inventory/item-list" element={<ProtectedRoute><ItemList /></ProtectedRoute>} />
            <Route path="/admin/inventory/item-store" element={<ProtectedRoute><ItemStore /></ProtectedRoute>} />
            <Route path="/admin/inventory/item-receive" element={<ProtectedRoute><ItemReceive /></ProtectedRoute>} />
            <Route path="/admin/inventory/item-receive-list" element={<ProtectedRoute><ItemReceiveList /></ProtectedRoute>} />
            <Route path="/admin/inventory/item-sell" element={<ProtectedRoute><ItemSell /></ProtectedRoute>} />
            <Route path="/admin/inventory/item-issue" element={<ProtectedRoute><ItemIssue /></ProtectedRoute>} />
            <Route path="/admin/chat/box" element={<ProtectedRoute><ChatBox /></ProtectedRoute>} />
            <Route path="/admin/chat/invitation" element={<ProtectedRoute><Invitation /></ProtectedRoute>} />
            <Route path="/admin/chat/blocked-user" element={<ProtectedRoute><BlockedUser /></ProtectedRoute>} />
            <Route path="/admin/communicate/notice-board" element={<ProtectedRoute><NoticeBoard /></ProtectedRoute>} />
            <Route path="/admin/communicate/send-email-sms" element={<ProtectedRoute><SendEmailSms /></ProtectedRoute>} />
            <Route path="/admin/communicate/email-sms-log" element={<ProtectedRoute><EmailSmsLog /></ProtectedRoute>} />
            <Route path="/admin/communicate/event" element={<ProtectedRoute><Event /></ProtectedRoute>} />
            <Route path="/admin/communicate/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/admin/communicate/email-template" element={<ProtectedRoute><EmailTemplate /></ProtectedRoute>} />
            <Route path="/admin/communicate/sms-template" element={<ProtectedRoute><SmsTemplate /></ProtectedRoute>} />
            <Route path="/admin/style/background-settings" element={<ProtectedRoute><BackgroundSettings /></ProtectedRoute>} />
            <Route path="/admin/style/color-theme" element={<ProtectedRoute><ColorTheme /></ProtectedRoute>} />
            <Route path="/admin/inventory/supplier" element={<ProtectedRoute><Supplier /></ProtectedRoute>} />
            <Route path="/admin/accounts/add-income" element={<ProtectedRoute><AdminAccounts /></ProtectedRoute>} />
            <Route path="/admin/accounts/add-expense" element={<ProtectedRoute><AdminAccounts /></ProtectedRoute>} />
            <Route path="/admin/accounts/statement" element={<ProtectedRoute><AdminAccounts /></ProtectedRoute>} />
            <Route path="/admin/exams" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/admin/exams/create" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/admin/exams/marks" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/admin/exams/result-card" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/admin/exams/result-sheet" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/admin/exams/schedule" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/admin/exams/date-sheet" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/admin/exams/blank-award-list" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/admin/examination/type" element={<ProtectedRoute><ExamType /></ProtectedRoute>} />
            <Route path="/admin/examination/setup" element={<ProtectedRoute><ExamSetup /></ProtectedRoute>} />
            <Route path="/admin/examination/schedule" element={<ProtectedRoute><ExamSchedule /></ProtectedRoute>} />
            <Route path="/admin/examination/attendance" element={<ProtectedRoute><ExamAttendance /></ProtectedRoute>} />
            <Route path="/admin/examination/marks-register" element={<ProtectedRoute><MarksRegister /></ProtectedRoute>} />
            <Route path="/admin/examination/marks-grade" element={<ProtectedRoute><MarksGrade /></ProtectedRoute>} />
            <Route path="/admin/examination/send-marks-sms" element={<ProtectedRoute><SendMarksSms /></ProtectedRoute>} />
            <Route path="/admin/examination/marksheet-report" element={<ProtectedRoute><MarksheetReport /></ProtectedRoute>} />
            <Route path="/admin/exam-plan/admit-card" element={<ProtectedRoute><AdmitCard /></ProtectedRoute>} />
            <Route path="/admin/exam-plan/seat-plan" element={<ProtectedRoute><SeatPlan /></ProtectedRoute>} />
            <Route path="/admin/online-exam/question-group" element={<ProtectedRoute><QuestionGroup /></ProtectedRoute>} />
            <Route path="/admin/online-exam/question-bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
            <Route path="/admin/hr/designation" element={<ProtectedRoute><Designation /></ProtectedRoute>} />
            <Route path="/admin/hr/department" element={<ProtectedRoute><Department /></ProtectedRoute>} />
            <Route path="/admin/hr/add-staff" element={<ProtectedRoute><AddStaff /></ProtectedRoute>} />
            <Route path="/admin/hr/staff-directory" element={<ProtectedRoute><StaffDirectory /></ProtectedRoute>} />
            <Route path="/admin/hr/attendance" element={<ProtectedRoute><StaffAttendance /></ProtectedRoute>} />
            <Route path="/admin/hr/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
            <Route path="/admin/teacher-evaluation/approved-report" element={<ProtectedRoute><ApprovedReport /></ProtectedRoute>} />
            <Route path="/admin/teacher-evaluation/pending-report" element={<ProtectedRoute><PendingReport /></ProtectedRoute>} />
            <Route path="/admin/teacher-evaluation/teacher-wise-report" element={<ProtectedRoute><TeacherWiseReport /></ProtectedRoute>} />
            <Route path="/admin/teacher-evaluation/settings" element={<ProtectedRoute><TeacherEvaluationSettings /></ProtectedRoute>} />
            <Route path="/admin/online-exam/manage" element={<ProtectedRoute><OnlineExamManage /></ProtectedRoute>} />
            <Route path="/admin/leave/apply" element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
            <Route path="/admin/leave/approve" element={<ProtectedRoute><ApproveLeave /></ProtectedRoute>} />
            <Route path="/admin/leave/pending" element={<ProtectedRoute><PendingLeave /></ProtectedRoute>} />
            <Route path="/admin/leave/define" element={<ProtectedRoute><LeaveDefine /></ProtectedRoute>} />
            <Route path="/admin/leave/type" element={<ProtectedRoute><LeaveType /></ProtectedRoute>} />
            <Route path="/admin/role-permission/login-permission" element={<ProtectedRoute><LoginPermission /></ProtectedRoute>} />
            <Route path="/admin/role-permission/role" element={<ProtectedRoute><Role /></ProtectedRoute>} />
            <Route path="/admin/role-permission/due-fees-login-permission" element={<ProtectedRoute><DueFeesLoginPermission /></ProtectedRoute>} />
            <Route path="/admin/wallet/pending-deposit" element={<ProtectedRoute><PendingDeposit /></ProtectedRoute>} />
            <Route path="/admin/wallet/approve-deposit" element={<ProtectedRoute><ApproveDeposit /></ProtectedRoute>} />
            <Route path="/admin/wallet/reject-deposit" element={<ProtectedRoute><RejectDeposit /></ProtectedRoute>} />
            <Route path="/admin/wallet/transaction" element={<ProtectedRoute><Transaction /></ProtectedRoute>} />
            <Route path="/admin/wallet/refund-request" element={<ProtectedRoute><RefundRequest /></ProtectedRoute>} />
            <Route path="/admin/class-tests" element={<ProtectedRoute><AdminClassTests /></ProtectedRoute>} />
            <Route path="/admin/class-tests/manage-marks" element={<ProtectedRoute><AdminClassTests /></ProtectedRoute>} />
            <Route path="/admin/class-tests/result" element={<ProtectedRoute><AdminClassTests /></ProtectedRoute>} />
            <Route path="/admin/timetable" element={<ProtectedRoute><TimetableManagement /></ProtectedRoute>} />
            <Route path="/admin/assignments" element={<ProtectedRoute><AssignmentManagement /></ProtectedRoute>} />
            <Route path="/admin/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
            <Route path="/admin/admin-section/admission-query" element={<ProtectedRoute><AdmissionQuery /></ProtectedRoute>} />
            <Route path="/admin/admin-section/admin-setup" element={<ProtectedRoute><AdminSetup /></ProtectedRoute>} />
            <Route path="/admin/admin-section/id-card" element={<ProtectedRoute><IdCard /></ProtectedRoute>} />
            <Route path="/admin/admin-section/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
            <Route path="/admin/admin-section/generate-certificate" element={<ProtectedRoute><GenerateCertificate /></ProtectedRoute>} />
            <Route path="/admin/admin-section/generate-id-card" element={<ProtectedRoute><GenerateIdCard /></ProtectedRoute>} />
            <Route path="/admin/admin-section/visitor-book" element={<ProtectedRoute><VisitorBook /></ProtectedRoute>} />
            <Route path="/admin/admin-section/complaint" element={<ProtectedRoute><Complaint /></ProtectedRoute>} />
            <Route path="/admin/admin-section/postal-receive" element={<ProtectedRoute><PostalReceive /></ProtectedRoute>} />
            <Route path="/admin/admin-section/postal-dispatch" element={<ProtectedRoute><PostalDispatch /></ProtectedRoute>} />
            <Route path="/admin/admin-section/phone-call-log" element={<ProtectedRoute><PhoneCallLog /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUserManagement /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/classes" element={<ProtectedRoute><TeacherClasses /></ProtectedRoute>} />
            <Route path="/teacher/students" element={<ProtectedRoute><TeacherStudents /></ProtectedRoute>} />
            <Route path="/teacher/attendance" element={<ProtectedRoute><TeacherAttendance /></ProtectedRoute>} />
            <Route path="/teacher/grades" element={<ProtectedRoute><TeacherGrades /></ProtectedRoute>} />
            <Route path="/teacher/assignments" element={<ProtectedRoute><TeacherAssignments /></ProtectedRoute>} />
            <Route path="/teacher/messages" element={<ProtectedRoute><TeacherMessages /></ProtectedRoute>} />
            <Route path="/teacher/resources" element={<ProtectedRoute><TeacherResources /></ProtectedRoute>} />
            <Route path="/teacher/settings" element={<ProtectedRoute><TeacherSettings /></ProtectedRoute>} />
            
            {/* Parent Portal Routes - Phase 11 */}
            <Route path="/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            <Route path="/parent/attendance/:childId" element={<ProtectedRoute><ChildAttendancePage /></ProtectedRoute>} />
            <Route path="/parent/grades/:childId" element={<ProtectedRoute><ChildGradesPage /></ProtectedRoute>} />
            <Route path="/parent/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/parent/fees/:childId" element={<ProtectedRoute><FeeManagementPage /></ProtectedRoute>} />
            
            <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/assignments" element={<ProtectedRoute><StudentAssignments /></ProtectedRoute>} />
            <Route path="/student/schedule" element={<ProtectedRoute><StudentSchedule /></ProtectedRoute>} />
            <Route path="/student/grades" element={<ProtectedRoute><StudentGrades /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/fees" element={<ProtectedRoute><StudentFeeManagement /></ProtectedRoute>} />
            <Route path="/student/messages" element={<ProtectedRoute><StudentMessages /></ProtectedRoute>} />
            <Route path="/student/achievements" element={<ProtectedRoute><StudentAchievements /></ProtectedRoute>} />
            <Route path="/student/settings" element={<ProtectedRoute><StudentSettings /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
