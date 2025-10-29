import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { faChartBar, faUsers, faCalendar, faClipboardCheck, faArrowTrendUp, faAward, faFileText, faComments, faCog, faUser, faShield, faExclamationCircle, faBook } from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { getStudentDashboard } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { useLocation } from "react-router-dom";
import NotificationTester from "@/components/NotificationTester";

type StudentDashboardData = {
  user?: string;
  student_name?: string;
  class_name?: string;
  roll_no?: string;
  stats: any[];
  upcoming_assignments: any[];
  today_schedule: any[];
  recent_grades: any[];
};

const StudentDashboard = () => {
  const location = useLocation();
  const sidebarItems = getStudentSidebarItems(location.pathname);

  const accessToken = window.localStorage.getItem('accessToken') || '';

  const { data, isLoading, error } = useQuery<StudentDashboardData>({
    queryKey: ['student-dashboard'],
    queryFn: () => getStudentDashboard(accessToken),
    enabled: !!accessToken,
  });

  // Fallback data if API doesn't return the expected structure
  const stats = data?.stats ?? [
    { title: "Enrolled Courses", value: "8", icon: faBook, color: "primary" },
    { title: "Attendance Rate", value: "92%", icon: faClipboardCheck, color: "secondary" },
    { title: "Average Grade", value: "85%", icon: faArrowTrendUp, color: "accent" },
    { title: "Achievements", value: "12", icon: faAward, color: "primary" },
  ];

  const upcomingAssignments = data?.upcoming_assignments ?? [
    { title: "Math Assignment: Calculus", subject: "Mathematics", due: "Tomorrow, 11:59 PM", progress: 60, urgent: true },
    { title: "Physics Lab Report", subject: "Physics", due: "In 3 days", progress: 30, urgent: false },
    { title: "Chemistry Quiz Preparation", subject: "Chemistry", due: "In 5 days", progress: 0, urgent: false },
    { title: "English Essay: Shakespeare", subject: "English", due: "Next week", progress: 45, urgent: false },
  ];

  const todaySchedule = data?.today_schedule ?? [
    { subject: "Mathematics", time: "9:00 AM - 10:00 AM", room: "Room 201", teacher: "Mr. Smith" },
    { subject: "Physics", time: "10:30 AM - 11:30 AM", room: "Lab 3", teacher: "Dr. Johnson" },
    { subject: "Chemistry", time: "2:00 PM - 3:00 PM", room: "Lab 2", teacher: "Ms. Davis" },
  ];

  const recentGrades = data?.recent_grades ?? [
    { subject: "Mathematics", assessment: "Midterm Exam", grade: "A", score: "92/100", date: "2 days ago" },
    { subject: "Physics", assessment: "Lab Report 3", grade: "B+", score: "87/100", date: "5 days ago" },
    { subject: "Chemistry", assessment: "Quiz 5", grade: "A-", score: "89/100", date: "1 week ago" },
    { subject: "English", assessment: "Essay 2", grade: "A", score: "94/100", date: "1 week ago" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout
        title="Student Portal"
        userName="Loading..."
        userRole="Student"
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Student Portal"
        userName="Student"
        userRole="Student"
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error?.message || 'Failed to load student dashboard data'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get student name and class from API data
  const studentName = data?.student_name || "Student";
  const className = data?.class_name || "Not Assigned";

  return (
    <DashboardLayout
      title="Student Portal"
      userName={studentName}
      userRole={className}
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {studentName.split(' ')[0]}</h2>
            <p className="text-muted-foreground text-base md:text-lg">Keep up the great work! Here's your academic progress</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-xl w-fit">
            <FontAwesomeIcon icon={faShield} className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Secure Session</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            return (
              <Card key={stat.title} className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-primary-light rounded-lg">
                    <FontAwesomeIcon icon={stat.icon} className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Upcoming Assignments */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "200ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <FontAwesomeIcon icon={faFileText} className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg md:text-xl">Upcoming Assignments</CardTitle>
                  <CardDescription>Track your pending work</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 md:space-y-5">
                {upcomingAssignments.map((assignment, index) => (
                  <div key={index} className="space-y-3 p-3 md:p-4 bg-muted rounded-xl border-2 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <p className="font-bold text-sm md:text-base line-clamp-2">{assignment.title}</p>
                          {assignment.urgent && (
                            <span className="flex items-center gap-1 text-xs bg-destructive-light text-destructive px-2 py-1 rounded-lg font-semibold w-fit">
                              <FontAwesomeIcon icon={faExclamationCircle} className="w-3 h-3" />
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{assignment.subject}</p>
                      </div>
                      <p className="text-xs text-primary font-bold whitespace-nowrap bg-primary-light px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                        {assignment.due}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={assignment.progress} className="flex-1 h-2" />
                      <span className="text-sm font-bold text-muted-foreground w-12 md:w-14 text-right">{assignment.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "250ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-light rounded-lg">
                  <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg md:text-xl">Today's Schedule</CardTitle>
                  <CardDescription>Your classes for today</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {todaySchedule.map((cls, index) => (
                  <div key={index} className="p-4 md:p-5 bg-primary-light rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-colors">
                    <p className="font-bold text-primary text-base md:text-lg mb-2">{cls.subject}</p>
                    <p className="text-sm text-foreground font-semibold mb-3">{cls.time}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-1 sm:gap-0">
                      <span className="text-muted-foreground font-medium">{cls.room}</span>
                      <span className="text-primary font-semibold">{cls.teacher}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Grades */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "300ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-light rounded-lg">
                <FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg md:text-xl">Recent Grades & Assessments</CardTitle>
                <CardDescription>Your latest academic results</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {recentGrades.map((grade, index) => (
                <div key={index} className="p-4 md:p-5 bg-secondary-light rounded-xl border-2 border-secondary/30 hover:border-secondary/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-base md:text-lg line-clamp-1">{grade.subject}</p>
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2">{grade.assessment}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-2xl md:text-3xl font-bold text-secondary">{grade.grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t">
                    <span className="font-semibold text-muted-foreground">{grade.score}</span>
                    <span className="text-xs text-muted-foreground">{grade.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Tester - Remove this in production */}
        <NotificationTester />
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
