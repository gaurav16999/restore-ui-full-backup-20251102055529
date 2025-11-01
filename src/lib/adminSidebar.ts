import {
  faChartBar,
  faUsers,
  faChalkboardTeacher,
  faCalendarAlt,
  faClipboardList,
  faTrophy,
  faFileText,
  faDollarSign,
  faUserCog,
  faCog,
  faDoorOpen,
  faUserTie,
  faBook,
  faPrint,
  faDownload,
  faBus,
  faBed,
  faPencilAlt,
  faClock,
  faClipboard,
  faBullhorn,
  faGraduationCap,
  faUserFriends,
  faWallet,
  faUserCheck,
  faBookOpen,
  faFileAlt,
  faGlobe,
  faStar,
  faUserShield,
  faUniversity,
  faBoxes,
  faPalette,
  faComments
} from '@fortawesome/free-solid-svg-icons';

export const getAdminSidebarItems = (currentPath: string) => [
  // Dashboard
  { type: 'section', label: 'Dashboard' },
  { icon: faChartBar, label: 'Dashboard', path: '/admin', active: currentPath === '/admin' },
  { icon: faCog, label: 'Sidebar Manager', path: '/admin/sidebar-manager', active: currentPath === '/admin/sidebar-manager' },

  // Administration
  { type: 'section', label: 'Administration' },
  {
    icon: faUserCog,
    label: 'Admin Section',
    path: '/admin/admin-section',
    active: currentPath.startsWith('/admin/admin-section'),
    children: [
      { label: 'Admission Query', path: '/admin/admin-section/admission-query' },
      { label: 'Visitor Book', path: '/admin/admin-section/visitor-book' },
      { label: 'Complaint', path: '/admin/admin-section/complaint' },
      { label: 'Postal Receive', path: '/admin/admin-section/postal-receive' },
      { label: 'Postal Dispatch', path: '/admin/admin-section/postal-dispatch' },
      { label: 'Phone Call Log', path: '/admin/admin-section/phone-call-log' },
      { label: 'Admin Setup', path: '/admin/admin-section/admin-setup' },
      { label: 'ID Card', path: '/admin/admin-section/id-card' },
      { label: 'Certificate', path: '/admin/admin-section/certificate' },
      { label: 'Generate Certificate', path: '/admin/admin-section/generate-certificate' },
      { label: 'Generate ID Card', path: '/admin/admin-section/generate-id-card' }
    ]
  },
  {
    icon: faBook,
    label: 'Academics',
    path: '/admin/academics',
    active: currentPath.startsWith('/admin/academics'),
    children: [
      { label: 'Optional Subject', path: '/admin/academics/optional-subject' },
      { label: 'Section', path: '/admin/academics/section' },
      { label: 'Class', path: '/admin/academics/class' },
      { label: 'Subjects', path: '/admin/academics/subjects' },
      { label: 'Assign Class Teacher', path: '/admin/academics/assign-class-teacher' },
      { label: 'Assign Subject', path: '/admin/academics/assign-subject' },
      { label: 'Class Room', path: '/admin/academics/class-room' },
      { label: 'Class Routine', path: '/admin/academics/class-routine' }
    ]
  },
  {
    icon: faFileText,
    label: 'Study Material',
  path: '/admin/study-material',
    children: [
      { label: 'Upload Content', path: '/admin/study-material/upload-content' },
      // point to the existing assignments page so the same component is used
      { label: 'Assignment', path: '/admin/assignments' },
      { label: 'Syllabus', path: '/admin/study-material/syllabus' },
      { label: 'Other Downloads', path: '/admin/study-material/other-downloads' }
    ],
    // also treat the assignments route as part of this parent for active highlighting
    active: currentPath.startsWith('/admin/study-material') || currentPath === '/admin/assignments',
  },
  {
    icon: faClipboardList,
    label: 'Lesson Plan',
    path: '/admin/lesson-plan',
    active: currentPath.startsWith('/admin/lesson-plan'),
    children: [
      { label: 'Lesson', path: '/admin/lesson-plan/lesson' },
      { label: 'Topic', path: '/admin/lesson-plan/topic' },
      { label: 'Topic Overview', path: '/admin/lesson-plan/topic-overview' },
      { label: 'Lesson Plan', path: '/admin/lesson-plan/lesson-plan' },
      { label: 'Lesson Plan Overview', path: '/admin/lesson-plan/lesson-plan-overview' }
    ]
  },
  {
    icon: faPrint,
    label: 'Bulk Print',
    path: '/admin/bulk-print',
    active: currentPath.startsWith('/admin/bulk-print'),
    children: [
      { label: 'ID Card', path: '/admin/bulk-print/id-card' },
      { label: 'Certificate', path: '/admin/bulk-print/certificate' },
      { label: 'Payroll Bulk Print', path: '/admin/bulk-print/payroll' },
      { label: 'Fees Invoice Bulk Print', path: '/admin/bulk-print/fees-invoice' },
      { label: 'Fees Invoice Bulk Print Settings', path: '/admin/bulk-print/fees-invoice-settings' }
    ]
  },
  { icon: faDownload, label: 'Download Center', path: '/admin/download-center', active: currentPath === '/admin/download-center' },
  { icon: faChalkboardTeacher, label: 'Teachers', path: '/admin/teachers', active: currentPath === '/admin/teachers' },
  { icon: faUserFriends, label: 'Employees', path: '/admin/employees', active: currentPath === '/admin/employees' },
  { icon: faUserTie, label: 'Assign Teachers', path: '/admin/assign-teacher', active: currentPath === '/admin/assign-teacher' },
  { icon: faCalendarAlt, label: 'Classes & Subjects', path: '/admin/classes', active: currentPath === '/admin/classes' },
  { icon: faBookOpen, label: 'Subjects', path: '/admin/subjects', active: currentPath === '/admin/subjects' },
  { icon: faBook, label: 'Class Subjects', path: '/admin/class-subjects', active: currentPath === '/admin/class-subjects' },
  { icon: faDoorOpen, label: 'Rooms', path: '/admin/rooms', active: currentPath === '/admin/rooms' },
  { icon: faClock, label: 'Timetable', path: '/admin/timetable', active: currentPath === '/admin/timetable' },

  // Student
  { type: 'section', label: 'Student' },
  {
    icon: faUsers,
    label: 'Student Info',
    path: '/admin/students',
    active: currentPath.startsWith('/admin/students'),
    children: [
      { label: 'Student Category', path: '/admin/students/category' },
      { label: 'Add Student', path: '/admin/students/add' },
      { label: 'Student List', path: '/admin/students/list' },
      { label: 'Multi Class Student', path: '/admin/students/multi-class' },
      { label: 'Delete Student Record', path: '/admin/students/delete' },
      { label: 'Unassigned Student', path: '/admin/students/unassigned' },
      { label: 'Student Attendance', path: '/admin/students/attendance' },
      { label: 'Student Group', path: '/admin/students/group' },
      { label: 'Student Promote', path: '/admin/students/promote' },
      { label: 'Disabled Students', path: '/admin/students/disabled' },
      { label: 'Subject Wise Attendance', path: '/admin/students/subject-attendance' },
      { label: 'Student Export', path: '/admin/students/export' },
      { label: 'SMS Sending Time', path: '/admin/students/sms-sending-time' }
    ]
  },
  {
    icon: faFileAlt,
    label: 'Behaviour Records',
    path: '/admin/behaviour-records',
    active: currentPath.startsWith('/admin/behaviour-records'),
    children: [
      { label: 'Incidents', path: '/admin/behaviour-records/incidents' },
      { label: 'Assign Incident', path: '/admin/behaviour-records/assign-incident' },
      { label: 'Student Incident Report', path: '/admin/behaviour-records/student-incident-report' },
      { label: 'Behaviour Report', path: '/admin/behaviour-records/behaviour-report' },
      { label: 'Class Section Report', path: '/admin/behaviour-records/class-section-report' },
      { label: 'Incident Wise Report', path: '/admin/behaviour-records/incident-wise-report' },
      { label: 'Settings', path: '/admin/behaviour-records/settings' }
    ]
  },
  {
    icon: faDollarSign,
    label: 'Fees',
    path: '/admin/fees',
    active: currentPath.startsWith('/admin/fees'),
    children: [
      { label: 'Fees Group', path: '/admin/fees/group' },
      { label: 'Fees Type', path: '/admin/fees/type' },
      { label: 'Fees Invoice', path: '/admin/fees/invoice' },
      { label: 'Bank Payment', path: '/admin/fees/bank-payment' },
      { label: 'Fees Carry Forward', path: '/admin/fees/carry-forward' }
    ]
  },
  {
    icon: faFileText,
    label: 'HomeWork',
    path: '/admin/homework',
    active: currentPath.startsWith('/admin/homework'),
    children: [
      { label: 'Add Homework', path: '/admin/homework/add' },
      { label: 'Homework List', path: '/admin/homework/list' },
      { label: 'Homework Report', path: '/admin/homework/report' }
    ]
  },
  {
    icon: faBookOpen,
    label: 'Library',
    path: '/admin/library',
    active: currentPath.startsWith('/admin/library'),
    children: [
      { label: 'Add Book', path: '/admin/library/add-book' },
      { label: 'Book List', path: '/admin/library/list' },
      { label: 'Book Categories', path: '/admin/library/categories' },
      { label: 'Add Member', path: '/admin/library/add-member' },
      { label: 'Issue/Return Book', path: '/admin/library/issue-return' },
      { label: 'All Issued Book', path: '/admin/library/issued' },
      { label: 'Subject', path: '/admin/library/subject' }
    ]
  },
  {
    icon: faBus,
    label: 'Transport',
    path: '/admin/transport',
    active: currentPath.startsWith('/admin/transport'),
    children: [
      { label: 'Routes', path: '/admin/transport/routes' },
      { label: 'Vehicle', path: '/admin/transport/vehicle' },
      { label: 'Assign Vehicle', path: '/admin/transport/assign-vehicle' }
    ]
  },
  {
    icon: faBed,
    label: 'Dormitory',
    path: '/admin/dormitory',
    active: currentPath.startsWith('/admin/dormitory'),
    children: [
      { label: 'Dormitory Rooms', path: '/admin/dormitory/rooms' },
      { label: 'Dormitory', path: '/admin/dormitory/list' },
      { label: 'Room Type', path: '/admin/dormitory/room-type' }
    ]
  },

  // Exam
  { type: 'section', label: 'Exam' },
  {
    icon: faBookOpen,
    label: 'Examination',
    path: '/admin/examination',
    active: currentPath.startsWith('/admin/examination'),
    children: [
      { label: 'Exam Type', path: '/admin/examination/type' },
      { label: 'Exam Setup', path: '/admin/examination/setup' },
      { label: 'Exam Schedule', path: '/admin/examination/schedule' },
      { label: 'Exam Attendance', path: '/admin/examination/attendance' },
      { label: 'Marks Register', path: '/admin/examination/marks-register' },
      { label: 'Marks Grade', path: '/admin/examination/marks-grade' },
      { label: 'Send Marks By Sms', path: '/admin/examination/send-marks-sms' },
      { label: 'Marksheet Report', path: '/admin/examination/marksheet-report' }
    ]
  },
  {
    icon: faClipboardList,
    label: 'Exam Plan',
    path: '/admin/exam-plan',
    active: currentPath.startsWith('/admin/exam-plan'),
    children: [
      { label: 'Admit Card', path: '/admin/exam-plan/admit-card' },
      { label: 'Seat Plan', path: '/admin/exam-plan/seat-plan' }
    ]
  },
  {
    icon: faGlobe,
    label: 'Online Exam',
    path: '/admin/online-exam',
    active: currentPath.startsWith('/admin/online-exam'),
    children: [
      { label: 'Question Group', path: '/admin/online-exam/question-group' },
      { label: 'Question Bank', path: '/admin/online-exam/question-bank' },
      { label: 'Online Exam', path: '/admin/online-exam/manage' }
    ]
  },
  {
    icon: faGraduationCap,
    label: 'Exams',
    path: '/admin/exams',
    active: currentPath === '/admin/exams',
    children: [
      { label: 'Create New Exam', path: '/admin/exams/create' },
      { label: 'Add / update Exam Marks', path: '/admin/exams/marks' },
      { label: 'Result Card', path: '/admin/exams/result-card' },
      { label: 'Result Sheet', path: '/admin/exams/result-sheet' },
      { label: 'Exam Schedule', path: '/admin/exams/schedule' },
      { label: 'Date Sheet', path: '/admin/exams/date-sheet' },
      { label: 'Blank Award List', path: '/admin/exams/blank-award-list' }
    ]
  },
  {
    icon: faFileText,
    label: 'Class Tests',
    path: '/admin/class-tests',
    active: currentPath === '/admin/class-tests',
    children: [
      { label: 'Manage Test Marks', path: '/admin/class-tests/manage-marks' },
      { label: 'Test Result', path: '/admin/class-tests/result' }
    ]
  },

  // HR
  { type: 'section', label: 'HR' },
  {
    icon: faUserFriends,
    label: 'Human Resource',
    path: '/admin/hr',
    active: currentPath.startsWith('/admin/hr'),
    children: [
      { label: 'Designation', path: '/admin/hr/designation' },
      { label: 'Department', path: '/admin/hr/department' },
      { label: 'Add Staff', path: '/admin/hr/add-staff' },
      { label: 'Staff Directory', path: '/admin/hr/staff-directory' },
      { label: 'Staff Attendance', path: '/admin/hr/attendance' },
      { label: 'Payroll', path: '/admin/hr/payroll' }
    ]
  },
  {
    icon: faStar,
    label: 'Teacher Evaluation',
    path: '/admin/teacher-evaluation',
    active: currentPath.startsWith('/admin/teacher-evaluation'),
    children: [
      { label: 'Approved Report', path: '/admin/teacher-evaluation/approved-report' },
      { label: 'Pending Report', path: '/admin/teacher-evaluation/pending-report' },
      { label: 'Teacher Wise Report', path: '/admin/teacher-evaluation/teacher-wise-report' },
      { label: 'Settings', path: '/admin/teacher-evaluation/settings' }
    ]
  },
  {
    icon: faCalendarAlt,
    label: 'Leave',
    path: '/admin/leave',
    active: currentPath.startsWith('/admin/leave'),
    children: [
      { label: 'Apply Leave', path: '/admin/leave/apply' },
      { label: 'Approve Leave Request', path: '/admin/leave/approve' },
      { label: 'Pending Leave Request', path: '/admin/leave/pending' },
      { label: 'Leave Define', path: '/admin/leave/define' },
      { label: 'Leave Type', path: '/admin/leave/type' }
    ]
  },
  {
    icon: faUserShield,
    label: 'Role & Permission',
    path: '/admin/role-permission',
    active: currentPath.startsWith('/admin/role-permission'),
    children: [
      { label: 'Login Permission', path: '/admin/role-permission/login-permission' },
      { label: 'Role', path: '/admin/role-permission/role' },
      { label: 'Due Fees Login Permission', path: '/admin/role-permission/due-fees-login-permission' }
    ]
  },

  // Accounts
  { type: 'section', label: 'Accounts' },
  {
    icon: faWallet,
    label: 'Wallet',
    path: '/admin/wallet',
    active: currentPath.startsWith('/admin/wallet'),
    children: [
      { label: 'Pending Deposit', path: '/admin/wallet/pending-deposit' },
      { label: 'Approve Deposit', path: '/admin/wallet/approve-deposit' },
      { label: 'Reject Deposit', path: '/admin/wallet/reject-deposit' },
      { label: 'Wallet Transaction', path: '/admin/wallet/transaction' },
      { label: 'Refund Request', path: '/admin/wallet/refund-request' }
    ]
  },
  {
    icon: faUniversity,
    label: 'Accounts',
    path: '/admin/accounts',
    active: currentPath.startsWith('/admin/accounts'),
    children: [
      { label: 'Profit & Loss', path: '/admin/accounts/profit-loss' },
      { label: 'Income', path: '/admin/accounts/income' },
      { label: 'Expense', path: '/admin/accounts/expense' },
      { label: 'Chart Of Account', path: '/admin/accounts/chart-of-account' },
      { label: 'Bank Account', path: '/admin/accounts/bank-account' },
      { label: 'Fund Transfer', path: '/admin/accounts/fund-transfer' }
    ]
  },
  {
    icon: faBoxes,
    label: 'Inventory',
    path: '/admin/inventory',
    active: currentPath.startsWith('/admin/inventory'),
    children: [
      { label: 'Item Category', path: '/admin/inventory/item-category' },
      { label: 'Item List', path: '/admin/inventory/item-list' },
      { label: 'Item Store', path: '/admin/inventory/item-store' },
      { label: 'Supplier', path: '/admin/inventory/supplier' },
      { label: 'Item Receive', path: '/admin/inventory/item-receive' },
      { label: 'Item Receive List', path: '/admin/inventory/item-receive-list' },
      { label: 'Item Sell', path: '/admin/inventory/item-sell' },
      { label: 'Item Issue', path: '/admin/inventory/item-issue' }
    ]
  },

  // Utilities
  { type: 'section', label: 'Utilities' },
  {
    icon: faComments,
    label: 'Chat',
    path: '/admin/chat',
    active: currentPath.startsWith('/admin/chat'),
    children: [
      { label: 'Chat Box', path: '/admin/chat/box' },
      { label: 'Invitation', path: '/admin/chat/invitation' },
      { label: 'Blocked User', path: '/admin/chat/blocked-user' }
    ]
  },
  {
    icon: faBullhorn,
    label: 'Communicate',
    path: '/admin/communicate',
    active: currentPath.startsWith('/admin/communicate'),
    children: [
      { label: 'Notice Board', path: '/admin/communicate/notice-board' },
      { label: 'Send Email / Sms', path: '/admin/communicate/send-email-sms' },
      { label: 'Email / Sms Log', path: '/admin/communicate/email-sms-log' },
      { label: 'Event', path: '/admin/communicate/event' },
      { label: 'Calendar', path: '/admin/communicate/calendar' },
      { label: 'Email Template', path: '/admin/communicate/email-template' },
      { label: 'Sms Template', path: '/admin/communicate/sms-template' }
    ]
  },
  {
    icon: faPalette,
    label: 'Style',
    path: '/admin/style',
    active: currentPath.startsWith('/admin/style'),
    children: [
      { label: 'BackGround Settings', path: '/admin/style/background-settings' },
      { label: 'Color Theme', path: '/admin/style/color-theme' }
    ]
  },

  // Report
  { type: 'section', label: 'Report' },
  {
    icon: faUserCheck,
    label: 'Student Report',
    path: '/admin/reports/student',
    active: currentPath.startsWith('/admin/reports/student'),
    children: [
      { label: 'Student Attendance Report', path: '/admin/reports/student/attendance' },
      { label: 'Subject Attendance Report', path: '/admin/reports/student/subject-attendance' },
      { label: 'Homework Evaluation Report', path: '/admin/reports/student/homework-evaluation' },
      { label: 'Student Transport Report', path: '/admin/reports/student/transport' },
      { label: 'Student Dormitory Report', path: '/admin/reports/student/dormitory' },
      { label: 'Guardian Reports', path: '/admin/reports/student/guardian' },
      { label: 'Student History', path: '/admin/reports/student/history' },
      { label: 'Student Login Report', path: '/admin/reports/student/login' },
      { label: 'Class Report', path: '/admin/reports/student/class-report' },
      { label: 'Class Routine', path: '/admin/reports/student/class-routine' },
      { label: 'User Log', path: '/admin/reports/student/user-log' },
      { label: 'Student Report', path: '/admin/reports/student/report' },
      { label: 'Previous Record', path: '/admin/reports/student/previous-record' }
    ]
  },
  {
    icon: faFileText,
    label: 'Exam Report',
    path: '/admin/reports/exam',
    active: currentPath.startsWith('/admin/reports/exam'),
    children: [
      { label: 'Exam Routine', path: '/admin/reports/exam/routine' },
      { label: 'Merit List Report', path: '/admin/reports/exam/merit-list' },
      { label: 'Online Exam Report', path: '/admin/reports/exam/online' },
      { label: 'Mark Sheet Report', path: '/admin/reports/exam/mark-sheet' },
      { label: 'Tabulation Sheet Report', path: '/admin/reports/exam/tabulation-sheet' },
      { label: 'Progress Card Report', path: '/admin/reports/exam/progress-card' },
      { label: 'Progress Card Report 100 Percent', path: '/admin/reports/exam/progress-card-100' },
      { label: 'Previous Result', path: '/admin/reports/exam/previous-result' }
    ]
  },
  {
    icon: faUserFriends,
    label: 'Staff Report',
    path: '/admin/reports/staff',
    active: currentPath.startsWith('/admin/reports/staff'),
    children: [
      { label: 'Staff Attendance Report', path: '/admin/reports/staff/attendance' },
      { label: 'Payroll Report', path: '/admin/reports/staff/payroll' }
    ]
  },
  {
    icon: faDollarSign,
    label: 'Fees Report',
    path: '/admin/reports/fees',
    active: currentPath.startsWith('/admin/reports/fees'),
    children: [
      { label: 'Fees Due Report', path: '/admin/reports/fees/due' },
      { label: 'Fine Report', path: '/admin/reports/fees/fine' },
      { label: 'Payment Report', path: '/admin/reports/fees/payment' },
      { label: 'Balance Report', path: '/admin/reports/fees/balance' },
      { label: 'Waiver Report', path: '/admin/reports/fees/waiver' },
      { label: 'Wallet Report', path: '/admin/reports/fees/wallet' }
    ]
  },
  {
    icon: faWallet,
    label: 'Accounts Report',
    path: '/admin/reports/accounts',
    active: currentPath.startsWith('/admin/reports/accounts'),
    children: [
      { label: 'Payroll Report', path: '/admin/reports/accounts/payroll' },
      { label: 'Transaction', path: '/admin/reports/accounts/transaction' }
    ]
  },

  // Settings
  { type: 'section', label: 'Settings Section' },
  {
    icon: faPencilAlt,
    label: 'Custom Field',
    path: '/admin/settings/custom-field',
    active: currentPath.startsWith('/admin/settings/custom-field'),
    children: [
      { label: 'Student Registration', path: '/admin/settings/custom-field/student-registration' },
      { label: 'Staff Registration', path: '/admin/settings/custom-field/staff-registration' }
    ]
  },
  {
    icon: faCog,
    label: 'General Settings',
    path: '/admin/settings/general',
    active: currentPath.startsWith('/admin/settings/general'),
    children: [
      { label: 'Student Settings', path: '/admin/settings/general/student-settings' },
      { label: 'Two Factor Setting', path: '/admin/settings/general/two-factor-setting' },
      { label: 'Lesson Plan Setting', path: '/admin/settings/general/lesson-plan-setting' },
      { label: 'Staff Settings', path: '/admin/settings/general/staff-settings' },
      { label: 'Chat Settings', path: '/admin/settings/general/chat-settings' },
      { label: 'General Settings', path: '/admin/settings/general/general' },
      { label: 'Optional Subject', path: '/admin/settings/general/optional-subject' },
      { label: 'Academic Year', path: '/admin/settings/general/academic-year' },
      { label: 'Holiday', path: '/admin/settings/general/holiday' },
      { label: 'Module Manager', path: '/admin/settings/general/module-manager' },
      { label: 'Notification Setting', path: '/admin/settings/general/notification-setting' },
      { label: 'Tawk To Chat', path: '/admin/settings/general/tawk-to-chat' },
      { label: 'Messenger Chat', path: '/admin/settings/general/messenger-chat' },
      { label: 'Manage Currency', path: '/admin/settings/general/manage-currency' },
      { label: 'Email Settings', path: '/admin/settings/general/email-settings' },
      { label: 'Payment Settings', path: '/admin/settings/general/payment-settings' },
      { label: 'Base Setup', path: '/admin/settings/general/base-setup' },
      { label: 'Sms Settings', path: '/admin/settings/general/sms-settings' },
      { label: 'Weekend', path: '/admin/settings/general/weekend' },
      { label: 'Language Settings', path: '/admin/settings/general/language-settings' },
      { label: 'Backup', path: '/admin/settings/general/backup' },
      { label: 'Dashboard', path: '/admin/settings/general/dashboard' },
      { label: 'About & Update', path: '/admin/settings/general/about-update' },
      { label: 'Api Permission', path: '/admin/settings/general/api-permission' },
      { label: 'Language', path: '/admin/settings/general/language' },
      { label: 'Preloader Settings', path: '/admin/settings/general/preloader-settings' },
      { label: 'Utilities', path: '/admin/settings/general/utilities' }
    ]
  },
  {
    icon: faFileText,
    label: 'Frontend CMS',
    path: '/admin/settings/frontend-cms',
    active: currentPath.startsWith('/admin/settings/frontend-cms'),
    children: [
      { label: 'Manage Theme', path: '/admin/settings/frontend-cms/manage-theme' },
      { label: 'Home Slider', path: '/admin/settings/frontend-cms/home-slider' },
      { label: 'Aora Pagebuilder', path: '/admin/settings/frontend-cms/aora-pagebuilder' },
      { label: 'Expert Teacher', path: '/admin/settings/frontend-cms/expert-teacher' },
      { label: 'Photo Gallery', path: '/admin/settings/frontend-cms/photo-gallery' },
      { label: 'Video Gallery', path: '/admin/settings/frontend-cms/video-gallery' },
      { label: 'Result', path: '/admin/settings/frontend-cms/result' },
      { label: 'Class Routine', path: '/admin/settings/frontend-cms/class-routine' },
      { label: 'Exam Routine', path: '/admin/settings/frontend-cms/exam-routine' },
      { label: 'Academic Calendar', path: '/admin/settings/frontend-cms/academic-calendar' },
      { label: 'Header Content', path: '/admin/settings/frontend-cms/header-content' },
      { label: 'Footer Content', path: '/admin/settings/frontend-cms/footer-content' },
      { label: 'News List', path: '/admin/settings/frontend-cms/news-list' },
      { label: 'News Category', path: '/admin/settings/frontend-cms/news-category' },
      { label: 'News Comments', path: '/admin/settings/frontend-cms/news-comments' },
      { label: 'Testimonial', path: '/admin/settings/frontend-cms/testimonial' },
      { label: 'Course List', path: '/admin/settings/frontend-cms/course-list' },
      { label: 'Contact Message', path: '/admin/settings/frontend-cms/contact-message' },
      { label: 'Menu', path: '/admin/settings/frontend-cms/menu' },
      { label: 'Pages', path: '/admin/settings/frontend-cms/pages' },
      { label: 'Course Category', path: '/admin/settings/frontend-cms/course-category' },
      { label: 'Speech Slider', path: '/admin/settings/frontend-cms/speech-slider' },
      { label: 'Donor', path: '/admin/settings/frontend-cms/donor' },
      { label: 'Form Download', path: '/admin/settings/frontend-cms/form-download' }
    ]
  },
  {
    icon: faDollarSign,
    label: 'Fees Settings',
    path: '/admin/settings/fees',
    active: currentPath.startsWith('/admin/settings/fees'),
    children: [
      { label: 'Fees Invoice Settings', path: '/admin/settings/fees/invoice-settings' }
    ]
  },
  {
    icon: faGraduationCap,
    label: 'Exam Settings',
    path: '/admin/settings/exam',
    active: currentPath.startsWith('/admin/settings/exam'),
    children: [
      { label: 'Format Settings', path: '/admin/settings/exam/format-settings' },
      { label: 'Setup Exam Rule', path: '/admin/settings/exam/setup-exam-rule' },
      { label: 'Position', path: '/admin/settings/exam/position' },
      { label: 'All Exam Position', path: '/admin/settings/exam/all-exam-position' },
      { label: 'Exam Signature Settings', path: '/admin/settings/exam/exam-signature-settings' },
      { label: 'Admit Card Setting', path: '/admin/settings/exam/admit-card-setting' },
      { label: 'Seat Plan Setting', path: '/admin/settings/exam/seat-plan-setting' }
    ]
  }
];