import { 
  faChartBar, 
  faBook, 
  faFileText, 
  faCalendar, 
  faArrowTrendUp, 
  faClipboardCheck, 
  faComments, 
  faAward, 
  faCog,
  faDollarSign
} from "@fortawesome/free-solid-svg-icons";

export interface StudentSidebarItem {
  icon: any;
  label: string;
  path: string;
  active?: boolean;
}

export const getStudentSidebarItems = (currentPath: string): StudentSidebarItem[] => {
  const items: StudentSidebarItem[] = [
    { icon: faChartBar, label: "Dashboard", path: "/student" },
    { icon: faBook, label: "My Courses", path: "/student/courses" },
    { icon: faFileText, label: "Assignments", path: "/student/assignments" },
    { icon: faCalendar, label: "Schedule", path: "/student/schedule" },
    { icon: faArrowTrendUp, label: "Grades", path: "/student/grades" },
    { icon: faClipboardCheck, label: "Attendance", path: "/student/attendance" },
    { icon: faDollarSign, label: "Fees & Payments", path: "/student/fees" },
    { icon: faComments, label: "Messages", path: "/student/messages" },
    { icon: faAward, label: "Achievements", path: "/student/achievements" },
    { icon: faCog, label: "Settings", path: "/student/settings" },
  ];

  // Set active state based on current path
  return items.map(item => ({
    ...item,
    active: item.path === currentPath
  }));
};