import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, ClipboardCheck, MessageSquare, FileText, BarChart3, Settings, Upload, Award, Shield, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getTeacherDashboard } from "@/lib/api";

type Stat = { title: string; value: string; color?: string };
type TodayClass = { subject: string; class: string; time: string; room: string; students: number };
type PendingTask = { task: string; class: string; count: string; priority: string };
type TopStudent = { name: string; class: string; grade: string; average: string };

type TeacherDashboardData = {
  user?: string;
  stats: Stat[];
  today_classes: TodayClass[];
  pending_tasks: PendingTask[];
  top_students: TopStudent[];
};

const TeacherDashboard = () => {
  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", active: true, path: "/teacher" },
    { icon: Calendar, label: "My Classes" },
    { icon: Users, label: "Students" },
    { icon: ClipboardCheck, label: "Attendance", path: "/teacher/attendance" },
    { icon: FileText, label: "Grades & Assessments" },
    { icon: Upload, label: "Assignments" },
    { icon: MessageSquare, label: "Messages" },
    { icon: BookOpen, label: "Resources" },
    { icon: Settings, label: "Settings" },
  ];

  const accessToken = window.localStorage.getItem('accessToken') || '';

  const { data, isLoading, error } = useQuery<TeacherDashboardData>({
    queryKey: ['teacher-dashboard'],
    queryFn: () => getTeacherDashboard(accessToken),
    enabled: !!accessToken,
  });

  const stats: Stat[] = data?.stats ?? [];
  const todayClasses: TodayClass[] = data?.today_classes ?? [];
  const pendingTasks: PendingTask[] = data?.pending_tasks ?? [];
  const topStudents: TopStudent[] = data?.top_students ?? [];

  return (
    <DashboardLayout
      title="Teacher Portal"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Good morning, Professor</h2>
            <p className="text-muted-foreground text-lg">Here's your teaching schedule for today</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Secure Session</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat: any, index: number) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-primary-light rounded-lg">
                    {/* icons in API are not provided; use generic icon */}
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "200ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Today's Schedule</CardTitle>
                  <CardDescription>Your classes and activities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {todayClasses.map((cls: any, index: number) => (
                  <div key={index} className="p-5 bg-primary-light rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-primary text-lg">{cls.subject}</p>
                        <p className="text-sm text-foreground font-medium">{cls.class}</p>
                      </div>
                      <span className="text-xs bg-white px-3 py-1.5 rounded-lg font-semibold">{cls.students} students</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-muted-foreground">{cls.time}</span>
                      <span className="text-primary">{cls.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "250ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-light rounded-lg">
                  <ClipboardCheck className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Pending Tasks</CardTitle>
                  <CardDescription>Items requiring your attention</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">{task.task}</p>
                      <p className="text-sm text-muted-foreground">{task.class} • {task.count}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                      task.priority === 'medium' ? 'bg-accent/20 text-accent-foreground' :
                      'bg-secondary/20 text-secondary-foreground'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Students */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "300ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-light rounded-lg">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Top Performing Students</CardTitle>
                <CardDescription>Students excelling in your subjects</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-5">
              {topStudents.map((student: any, index: number) => (
                <div key={index} className="p-5 bg-secondary-light rounded-xl border-2 border-secondary/30 hover:border-secondary/50 transition-colors">
                  <p className="font-bold text-foreground text-lg mb-1">{student.name}</p>
                  <p className="text-sm text-muted-foreground mb-4">{student.class}</p>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-3xl font-bold text-secondary">{student.grade}</span>
                    <span className="text-sm font-semibold text-muted-foreground">{student.average}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
