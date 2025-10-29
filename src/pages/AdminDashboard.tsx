import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faChalkboardTeacher, 
  faCalendarAlt, 
  faDollarSign, 
  faChartLine, 
  faChartBar, 
  faCog, 
  faFileText, 
  faUserCog, 
  faClipboardList, 
  faShield, 
  faTrophy, 
  faUserCheck, 
  faUserTimes,
  faUserSlash
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getDashboardStats, getRecentActivities, getUpcomingEvents, getStudentStats, getTeacherStats } from "@/lib/api";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

type DashboardStats = {
  total_students?: number;
  total_teachers?: number;
  active_classes?: number;
  monthly_revenue?: string;
  students_change?: string;
  teachers_change?: string;
  classes_change?: string;
  revenue_change?: string;
};

type Activity = {
  id: number;
  action: string;
  user: string;
  time: string;
  activity_type?: string;
  amount?: string;
};

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
};

const AdminDashboard = () => {
  const { accessToken } = useAuth();
  const sidebarItems = getAdminSidebarItems("/admin");

  // Fetch all admin dashboard data using React Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getDashboardStats,
    enabled: !!accessToken,
    retry: 2,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['admin-recent-activities'],
    queryFn: getRecentActivities,
    enabled: !!accessToken,
    retry: 2,
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['admin-upcoming-events'],
    queryFn: getUpcomingEvents,
    enabled: !!accessToken,
    retry: 2,
  });

  const { data: studentStats, isLoading: studentStatsLoading } = useQuery({
    queryKey: ['admin-student-stats'],
    queryFn: getStudentStats,
    enabled: !!accessToken,
    retry: 2,
  });

  const { data: teacherStats, isLoading: teacherStatsLoading } = useQuery({
    queryKey: ['admin-teacher-stats'],
    queryFn: getTeacherStats,
    enabled: !!accessToken,
    retry: 2,
  });

  const loading = statsLoading || activitiesLoading || eventsLoading;

  // Fallback/demo data
  const statsData: DashboardStats = stats || {
    total_students: 1247,
    total_teachers: 89,
    active_classes: 156,
    monthly_revenue: "$45,231",
    students_change: "+12.5%",
    teachers_change: "+3.2%",
    classes_change: "+8.1%",
    revenue_change: "+18.7%"
  };

  const activitiesData: Activity[] = activities || [
    { id: 1, action: "New student enrolled", user: "Emily Johnson", time: new Date(Date.now() - 5 * 60000).toISOString(), activity_type: "enrollment" },
    { id: 2, action: "Grade submitted", user: "Prof. Michael Smith", time: new Date(Date.now() - 15 * 60000).toISOString(), activity_type: "assignment" },
    { id: 3, action: "Attendance marked", user: "Ms. Sarah Williams", time: new Date(Date.now() - 30 * 60000).toISOString(), activity_type: "class" },
  ];

  const eventsData: Event[] = events || [
    { id: 1, title: "Parent-Teacher Conference", date: "2024-03-15", location: "Main Hall" },
    { id: 2, title: "Science Fair", date: "2024-03-20", location: "Auditorium" },
    { id: 3, title: "Sports Day", date: "2024-03-25", location: "Sports Ground" },
  ];

  const statsCards = [
    { title: "Total Students", value: statsData.total_students || 0, icon: faUsers, color: "primary", change: statsData.students_change || "+0%" },
    { title: "Total Teachers", value: statsData.total_teachers || 0, icon: faChalkboardTeacher, color: "secondary", change: statsData.teachers_change || "+0%" },
    { title: "Active Classes", value: statsData.active_classes || 0, icon: faCalendarAlt, color: "accent", change: statsData.classes_change || "+0%" },
    { title: "Monthly Revenue", value: statsData.monthly_revenue || "$0", icon: faDollarSign, color: "primary", change: statsData.revenue_change || "+0%" },
  ];

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Administrator Portal"
        userName="Dr. Sarah Johnson"
        userRole="School Administrator"
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

  return (
    <DashboardLayout
      title="Administrator Portal"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Administrator</h2>
            <p className="text-muted-foreground text-base md:text-lg">Here's your school overview for today</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-xl w-fit">
            <FontAwesomeIcon icon={faShield} className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Secure Dashboard</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full text-center py-10">Loading...</div>
          ) : (
            statsCards.map((stat, index) => (
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
                    <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                    <p className="text-xs text-success flex items-center gap-1 font-medium">
                      <FontAwesomeIcon icon={faChartLine} className="w-3 h-3" />
                      {stat.change} from last month
                    </p>
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* Dynamic Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Student Status */}
          <Card className="shadow-xl border-2 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg md:text-xl">Student Status</CardTitle>
                  <CardDescription>Real-time student activity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-4">Loading student stats...</div>
              ) : studentStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <FontAwesomeIcon icon={faUserCheck} className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-green-800 text-sm md:text-base">Active Students</p>
                        <p className="text-xs md:text-sm text-green-600">Currently enrolled</p>
                      </div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-green-700">{studentStats.active}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl border-l-4 border-gray-400">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <FontAwesomeIcon icon={faUserSlash} className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm md:text-base">Inactive Students</p>
                        <p className="text-xs md:text-sm text-gray-600">Suspended or withdrawn</p>
                      </div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-gray-700">{studentStats.total - studentStats.active}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-xs md:text-sm font-medium text-blue-800">Avg Attendance</span>
                      <span className="text-base md:text-lg font-bold text-blue-700">{studentStats.avg_attendance}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-xs md:text-sm font-medium text-purple-800">New This Month</span>
                      <span className="text-base md:text-lg font-bold text-purple-700">{studentStats.new_this_month}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No student data available</div>
              )}
            </CardContent>
          </Card>

          {/* Teacher Status */}
          <Card className="shadow-xl border-2 animate-fade-in" style={{ animationDelay: "350ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg md:text-xl">Teacher Status</CardTitle>
                  <CardDescription>Faculty management overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-4">Loading teacher stats...</div>
              ) : teacherStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <FontAwesomeIcon icon={faUserCheck} className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-green-800 text-sm md:text-base">Active Teachers</p>
                        <p className="text-xs md:text-sm text-green-600">Currently teaching</p>
                      </div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-green-700">{teacherStats.active}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl border-l-4 border-gray-400">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <FontAwesomeIcon icon={faUserSlash} className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm md:text-base">Inactive Teachers</p>
                        <p className="text-xs md:text-sm text-gray-600">On leave or suspended</p>
                      </div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-gray-700">{teacherStats.total - teacherStats.active}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-xs md:text-sm font-medium text-blue-800">Teacher-Student Ratio</span>
                      <span className="text-base md:text-lg font-bold text-blue-700">{teacherStats.teacher_student_ratio}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-xs md:text-sm font-medium text-indigo-800">Total Classes</span>
                      <span className="text-base md:text-lg font-bold text-indigo-700">{teacherStats.total_classes}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No teacher data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Activity */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "200ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <FontAwesomeIcon icon={faClipboardList} className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg md:text-xl">Recent Activity</CardTitle>
                  <CardDescription>Latest updates across the school</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">Loading activities...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No recent activities</div>
                ) : (
                  activities.map((activity, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 md:p-4 bg-muted rounded-xl hover:bg-muted/70 transition-colors border">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm md:text-base line-clamp-2">{activity.action}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{activity.user}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(activity.time)}</span>
                        {activity.amount && (
                          <p className="text-sm font-bold text-success">{activity.amount}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "250ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-light rounded-lg">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg md:text-xl">Upcoming Events</CardTitle>
                  <CardDescription>Important dates and schedules</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">Loading events...</div>
                ) : events.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No upcoming events</div>
                ) : (
                  events.map((event, index) => (
                    <div key={index} className="p-3 md:p-4 bg-accent-light rounded-xl border-2 border-accent/30 hover:border-accent/50 transition-colors">
                      <p className="font-bold text-foreground mb-2 line-clamp-2 text-sm md:text-base">{event.title}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm">
                        <span className="text-muted-foreground">{event.date}</span>
                        <span className="text-xs bg-white px-2 py-1 rounded font-medium w-fit">{event.location}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "300ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-light rounded-lg">
                <FontAwesomeIcon icon={faTrophy} className="w-5 h-5 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg md:text-xl">Academic Performance Overview</CardTitle>
                <CardDescription>School-wide statistics for current semester</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="p-4 md:p-6 bg-secondary-light rounded-xl border-2 border-secondary/30 text-center">
                <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">Average Attendance</p>
                <p className="text-2xl md:text-4xl font-bold text-secondary mb-2">94.5%</p>
                <div className="flex items-center justify-center gap-1 text-success text-xs md:text-sm font-medium">
                  <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 md:w-4 md:h-4" />
                  <span>+2.3% from last month</span>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-primary-light rounded-xl border-2 border-primary/30 text-center">
                <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">Average Grade</p>
                <p className="text-2xl md:text-4xl font-bold text-primary mb-2">85.2%</p>
                <div className="flex items-center justify-center gap-1 text-success text-xs md:text-sm font-medium">
                  <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 md:w-4 md:h-4" />
                  <span>+1.8% from last semester</span>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-accent-light rounded-xl border-2 border-accent/30 text-center">
                <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">Pass Rate</p>
                <p className="text-2xl md:text-4xl font-bold text-accent mb-2">96.7%</p>
                <div className="flex items-center justify-center gap-1 text-success text-xs md:text-sm font-medium">
                  <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 md:w-4 md:h-4" />
                  <span>+0.5% from last year</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
