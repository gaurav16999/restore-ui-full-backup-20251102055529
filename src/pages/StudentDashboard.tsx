import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, ClipboardCheck, TrendingUp, Award, FileText, MessageSquare, BarChart3, Settings, User, Shield, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";

const StudentDashboard = () => {
  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", active: true },
    { icon: BookOpen, label: "My Courses" },
    { icon: FileText, label: "Assignments" },
    { icon: Calendar, label: "Schedule" },
    { icon: TrendingUp, label: "Grades" },
    { icon: ClipboardCheck, label: "Attendance" },
    { icon: MessageSquare, label: "Messages" },
    { icon: Award, label: "Achievements" },
    { icon: Settings, label: "Settings" },
  ];

  const stats = [
    { title: "Enrolled Courses", value: "8", icon: BookOpen, color: "primary" },
    { title: "Attendance Rate", value: "92%", icon: ClipboardCheck, color: "secondary" },
    { title: "Average Grade", value: "85%", icon: TrendingUp, color: "accent" },
    { title: "Achievements", value: "12", icon: Award, color: "primary" },
  ];

  const upcomingAssignments = [
    { title: "Math Assignment: Calculus", subject: "Mathematics", due: "Tomorrow, 11:59 PM", progress: 60, urgent: true },
    { title: "Physics Lab Report", subject: "Physics", due: "In 3 days", progress: 30, urgent: false },
    { title: "Chemistry Quiz Preparation", subject: "Chemistry", due: "In 5 days", progress: 0, urgent: false },
    { title: "English Essay: Shakespeare", subject: "English", due: "Next week", progress: 45, urgent: false },
  ];

  const todaySchedule = [
    { subject: "Mathematics", time: "9:00 AM - 10:00 AM", room: "Room 201", teacher: "Mr. Smith" },
    { subject: "Physics", time: "10:30 AM - 11:30 AM", room: "Lab 3", teacher: "Dr. Johnson" },
    { subject: "Chemistry", time: "2:00 PM - 3:00 PM", room: "Lab 2", teacher: "Ms. Davis" },
  ];

  const recentGrades = [
    { subject: "Mathematics", assessment: "Midterm Exam", grade: "A", score: "92/100", date: "2 days ago" },
    { subject: "Physics", assessment: "Lab Report 3", grade: "B+", score: "87/100", date: "5 days ago" },
    { subject: "Chemistry", assessment: "Quiz 5", grade: "A-", score: "89/100", date: "1 week ago" },
    { subject: "English", assessment: "Essay 2", grade: "A", score: "94/100", date: "1 week ago" },
  ];

  return (
    <DashboardLayout
      title="Student Portal"
      userName="Alex Thompson"
      userRole="Grade 10 Student"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, Alex</h2>
            <p className="text-muted-foreground text-lg">Keep up the great work! Here's your academic progress</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Student Portal</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
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
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Assignments */}
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "200ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Upcoming Assignments</CardTitle>
                  <CardDescription>Track your pending work</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {upcomingAssignments.map((assignment, index) => (
                  <div key={index} className="space-y-3 p-4 bg-muted rounded-xl border-2 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-base">{assignment.title}</p>
                          {assignment.urgent && (
                            <span className="flex items-center gap-1 text-xs bg-destructive-light text-destructive px-2 py-1 rounded-lg font-semibold">
                              <AlertCircle className="w-3 h-3" />
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{assignment.subject}</p>
                      </div>
                      <p className="text-xs text-primary font-bold whitespace-nowrap ml-3 bg-primary-light px-3 py-1.5 rounded-lg">
                        {assignment.due}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={assignment.progress} className="flex-1 h-2" />
                      <span className="text-sm font-bold text-muted-foreground w-14 text-right">{assignment.progress}%</span>
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
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl">Today's Schedule</CardTitle>
                  <CardDescription>Your classes for today</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {todaySchedule.map((cls, index) => (
                  <div key={index} className="p-5 bg-primary-light rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-colors">
                    <p className="font-bold text-primary text-lg mb-2">{cls.subject}</p>
                    <p className="text-sm text-foreground font-semibold mb-3">{cls.time}</p>
                    <div className="flex items-center justify-between text-sm">
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
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Recent Grades & Assessments</CardTitle>
                <CardDescription>Your latest academic results</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-5">
              {recentGrades.map((grade, index) => (
                <div key={index} className="p-5 bg-secondary-light rounded-xl border-2 border-secondary/30 hover:border-secondary/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground text-lg">{grade.subject}</p>
                      <p className="text-sm text-muted-foreground font-medium">{grade.assessment}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-secondary">{grade.grade}</p>
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
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
