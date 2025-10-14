import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, DollarSign, TrendingUp, BarChart3, Settings, FileText, UserCog, ClipboardList, Shield, Award } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getDashboardStats, getRecentActivities, getUpcomingEvents } from "@/lib/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const [statsData, activitiesData, eventsData] = await Promise.all([
          getDashboardStats(token),
          getRecentActivities(token),
          getUpcomingEvents(token)
        ]);

        setStats(statsData);
        setActivities(activitiesData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", active: true, path: "/admin" },
    { icon: Users, label: "Students", path: "/admin/students" },
    { icon: BookOpen, label: "Teachers", path: "/admin/teachers" },
    { icon: Calendar, label: "Classes & Subjects", path: "/admin/classes" },
    { icon: ClipboardList, label: "Attendance", path: "/admin/attendance" },
    { icon: FileText, label: "Grades & Reports" },
    { icon: DollarSign, label: "Fee Management" },
    { icon: UserCog, label: "User Management" },
    { icon: Settings, label: "Settings" },
  ];

  const statsCards = stats ? [
    { title: "Total Students", value: stats.total_students, icon: Users, color: "primary", change: stats.students_change },
    { title: "Total Teachers", value: stats.total_teachers, icon: BookOpen, color: "secondary", change: stats.teachers_change },
    { title: "Active Classes", value: stats.active_classes, icon: Calendar, color: "accent", change: stats.classes_change },
    { title: "Monthly Revenue", value: stats.monthly_revenue, icon: DollarSign, color: "primary", change: stats.revenue_change },
  ] : [];

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <DashboardLayout
      title="Administrator Portal"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, Administrator</h2>
            <p className="text-muted-foreground text-lg">Here's your school overview for today</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Secure Dashboard</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 text-center py-10">Loading...</div>
          ) : (
            statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="p-2 bg-primary-light rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <p className="text-xs text-success flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change} from last month
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "200ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
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
                    <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/70 transition-colors border">
                      <div>
                        <p className="font-semibold">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.user}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">{getTimeAgo(activity.time)}</span>
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
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
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
                    <div key={index} className="p-4 bg-accent-light rounded-xl border-2 border-accent/30 hover:border-accent/50 transition-colors">
                      <p className="font-bold text-foreground mb-2">{event.title}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{event.date}</span>
                        <span className="text-xs bg-white px-2 py-1 rounded font-medium">{event.location}</span>
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
                <Award className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Academic Performance Overview</CardTitle>
                <CardDescription>School-wide statistics for current semester</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-secondary-light rounded-xl border-2 border-secondary/30 text-center">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Average Attendance</p>
                <p className="text-4xl font-bold text-secondary mb-2">94.5%</p>
                <div className="flex items-center justify-center gap-1 text-success text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>+2.3% from last month</span>
                </div>
              </div>
              <div className="p-6 bg-primary-light rounded-xl border-2 border-primary/30 text-center">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Average Grade</p>
                <p className="text-4xl font-bold text-primary mb-2">85.2%</p>
                <div className="flex items-center justify-center gap-1 text-success text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>+1.8% from last semester</span>
                </div>
              </div>
              <div className="p-6 bg-accent-light rounded-xl border-2 border-accent/30 text-center">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Pass Rate</p>
                <p className="text-4xl font-bold text-accent mb-2">96.7%</p>
                <div className="flex items-center justify-center gap-1 text-success text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
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
