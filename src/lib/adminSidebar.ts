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
  faClock,
  faClipboard,
  faBullhorn,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

export const getAdminSidebarItems = (currentPath: string) => [
  { 
    icon: faChartBar, 
    label: "Dashboard", 
    path: "/admin",
    active: currentPath === "/admin"
  },
  { 
    icon: faUsers, 
    label: "Students", 
    path: "/admin/students",
    active: currentPath === "/admin/students"
  },
  { 
    icon: faChalkboardTeacher, 
    label: "Teachers", 
    path: "/admin/teachers",
    active: currentPath === "/admin/teachers"
  },
  { 
    icon: faUserTie, 
    label: "Assign Teachers", 
    path: "/admin/assign-teacher",
    active: currentPath === "/admin/assign-teacher"
  },
  { 
    icon: faCalendarAlt, 
    label: "Classes & Subjects", 
    path: "/admin/classes",
    active: currentPath === "/admin/classes"
  },
  { 
    icon: faBook, 
    label: "Class Subjects", 
    path: "/admin/class-subjects",
    active: currentPath === "/admin/class-subjects"
  },
  { 
    icon: faDoorOpen, 
    label: "Rooms", 
    path: "/admin/rooms",
    active: currentPath === "/admin/rooms"
  },
  { 
    icon: faClipboardList, 
    label: "Attendance", 
    path: "/admin/attendance",
    active: currentPath === "/admin/attendance"
  },
  { 
    icon: faTrophy, 
    label: "Grades", 
    path: "/admin/grades",
    active: currentPath === "/admin/grades"
  },
  { 
    icon: faGraduationCap, 
    label: "Exams",
    path: "/admin/exams",
    active: currentPath === "/admin/exams"
  },
  { 
    icon: faClock, 
    label: "Timetable",
    path: "/admin/timetable",
    active: currentPath === "/admin/timetable"
  },
  { 
    icon: faClipboard, 
    label: "Assignments",
    path: "/admin/assignments",
    active: currentPath === "/admin/assignments"
  },
  { 
    icon: faBullhorn, 
    label: "Communications",
    path: "/admin/communications",
    active: currentPath === "/admin/communications"
  },
  { 
    icon: faFileText, 
    label: "Reports", 
    path: "/admin/reports",
    active: currentPath === "/admin/reports"
  },
  { 
    icon: faDollarSign, 
    label: "Fee Management",
    path: "/admin/fees",
    active: currentPath === "/admin/fees"
  },
  { 
    icon: faUserCog, 
    label: "User Management",
    path: "/admin/users",
    active: currentPath === "/admin/users"
  },
  { 
    icon: faCog, 
    label: "Settings",
    path: "/admin/settings",
    active: currentPath === "/admin/settings"
  },
];