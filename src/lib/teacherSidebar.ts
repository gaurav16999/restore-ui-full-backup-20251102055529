import { 
  faChartBar, 
  faCalendar, 
  faUsers, 
  faClipboardCheck, 
  faFileText, 
  faUpload, 
  faComments, 
  faBook, 
  faCog 
} from "@fortawesome/free-solid-svg-icons";

export const getTeacherSidebarItems = (currentPath: string) => [
  { 
    icon: faChartBar, 
    label: "Dashboard", 
    path: "/teacher",
    active: currentPath === "/teacher"
  },
  { 
    icon: faCalendar, 
    label: "My Classes", 
    path: "/teacher/classes",
    active: currentPath === "/teacher/classes"
  },
  { 
    icon: faUsers, 
    label: "Students", 
    path: "/teacher/students",
    active: currentPath === "/teacher/students"
  },
  { 
    icon: faClipboardCheck, 
    label: "Attendance", 
    path: "/teacher/attendance",
    active: currentPath === "/teacher/attendance"
  },
  { 
    icon: faFileText, 
    label: "Grades & Assessments", 
    path: "/teacher/grades",
    active: currentPath === "/teacher/grades"
  },
  { 
    icon: faUpload, 
    label: "Assignments", 
    path: "/teacher/assignments",
    active: currentPath === "/teacher/assignments"
  },
  { 
    icon: faComments, 
    label: "Messages", 
    path: "/teacher/messages",
    active: currentPath === "/teacher/messages"
  },
  { 
    icon: faBook, 
    label: "Resources", 
    path: "/teacher/resources",
    active: currentPath === "/teacher/resources"
  },
  { 
    icon: faCog, 
    label: "Settings", 
    path: "/teacher/settings",
    active: currentPath === "/teacher/settings"
  },
];