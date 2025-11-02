import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { faChartBar, faUsers, faCalendar, faClipboardCheck, faComments, faFileText, faChartLine, faCog, faUpload, faAward, faShield, faArrowTrendUp, faBook, faClipboard, faClock, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getTeacherDashboard } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTeacherSidebarItems } from "@/lib/teacherSidebar";
import { useAuth } from "@/lib/auth";
import { useErrorHandler, teacherFallbackData } from "@/hooks/use-error-handler";
import { Link } from "react-router-dom";

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
  const sidebarItems = getTeacherSidebarItems("/teacher");
  const { accessToken } = useAuth();
  const { handleError, retry } = useErrorHandler();

  const { data, isLoading, error } = useQuery<TeacherDashboardData>({
    queryKey: ['teacher-dashboard'],
    queryFn: () => getTeacherDashboard(accessToken!),
    enabled: !!accessToken,
    retry: 2,
    retryDelay: 1000,
  });

  // Use fallback data when there's an error
  const dashboardData = error ? teacherFallbackData.dashboard : data;

  const stats: Stat[] = dashboardData?.stats ?? [];
  const todayClasses: TodayClass[] = dashboardData?.today_classes ?? [];
  const pendingTasks: PendingTask[] = dashboardData?.pending_tasks ?? [];
  const topStudents: TopStudent[] = dashboardData?.top_students ?? [];

  if (isLoading) {
    return (
      <DashboardLayout
        title="Teacher Portal"
        userName="Prof. Michael Anderson"
        userRole="Senior Teacher"
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
        title="Teacher Portal"
        userName="Prof. Michael Anderson"
        userRole="Senior Teacher"
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Backend Connection Error</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load teacher dashboard data'}
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Quick Fix:</strong>
                  </p>
                  <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside">
                    <li>Open Command Prompt or PowerShell as Administrator</li>
                    <li>Navigate to: <code>C:\Users\Gauravkc\Desktop\New folder (7)\gleam-education-main\backend</code></li>
                    <li>Run: <code>.venv\Scripts\activate</code></li>
                    <li>Run: <code>python manage.py runserver 8000</code></li>
                  </ol>
                </div>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Teacher Portal"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>Notice:</strong> Backend connection failed. Showing demo data. 
                  <button 
                    onClick={() => window.location.reload()} 
                    className="ml-2 underline hover:no-underline"
                  >
                    Retry connection
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Welcome Section */}
        <div className="animate-fade-in flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Good morning, Professor</h2>
            <p className="text-muted-foreground text-lg">Here's your teaching schedule for today</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-xl">
            <FontAwesomeIcon icon={faShield} className="w-5 h-5 text-primary" />
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
                    <FontAwesomeIcon icon={faBook} className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions for Teachers */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "175ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Access your teaching tools</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/teacher/assignments" className="group">
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <FontAwesomeIcon icon={faClipboard} className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-orange-900">Assignments</h3>
                  </div>
                  <p className="text-xs text-orange-700 mb-2">Create & grade homework</p>
                  <div className="flex items-center gap-1 text-orange-600 text-xs font-medium group-hover:gap-2 transition-all">
                    <span>Manage Assignments</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                  </div>
                </div>
              </Link>

              <Link to="/teacher/attendance" className="group">
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <FontAwesomeIcon icon={faClipboardCheck} className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-900">Attendance</h3>
                  </div>
                  <p className="text-xs text-green-700 mb-2">Mark student attendance</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium group-hover:gap-2 transition-all">
                    <span>Take Attendance</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                  </div>
                </div>
              </Link>

              <Link to="/teacher/grades" className="group">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <FontAwesomeIcon icon={faAward} className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Grades</h3>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">Enter student grades</p>
                  <div className="flex items-center gap-1 text-blue-600 text-xs font-medium group-hover:gap-2 transition-all">
                    <span>Grade Students</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "200ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-primary" />
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
                  <FontAwesomeIcon icon={faClipboardCheck} className="w-5 h-5 text-secondary" />
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
                <FontAwesomeIcon icon={faAward} className="w-5 h-5 text-accent" />
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
