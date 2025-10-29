import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { faAward, faMedal, faTrophy, faChartLine, faBook, faFileText, faClock, faUsers, faComments, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { useLocation } from "react-router-dom";

const StudentAchievements = () => {
  const location = useLocation();
  const sidebarItems = getStudentSidebarItems(location.pathname);

  const achievements = [
    {
      id: 1,
      title: "Math Excellence",
      description: "Achieved 90%+ in all math assessments",
      icon: faTrophy,
      color: "bg-yellow-500",
      earned: true,
      date: "October 10, 2025"
    },
    {
      id: 2,
      title: "Perfect Attendance",
      description: "100% attendance for the month",
      icon: faAward,
      color: "bg-green-500",
      earned: true,
      date: "September 30, 2025"
    },
    {
      id: 3,
      title: "Science Star",
      description: "Outstanding performance in Physics lab",
      icon: faMedal,
      color: "bg-blue-500",
      earned: true,
      date: "September 15, 2025"
    },
    {
      id: 4,
      title: "Assignment Master",
      description: "Submit 10 assignments on time",
      icon: faFileText,
      color: "bg-purple-500",
      earned: false,
      progress: 7
    }
  ];

  return (
    <DashboardLayout
      title="Student Portal"
      userName="Alex Thompson"
      userRole="Grade 10 Student"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Achievements</h2>
            <p className="text-muted-foreground">Your academic accomplishments</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {achievements.filter(a => a.earned).length} Earned
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className={`transition-all duration-300 ${achievement.earned ? 'border-2 border-yellow-200 bg-yellow-50' : 'opacity-75'}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`w-16 h-16 rounded-full ${achievement.color} flex items-center justify-center mb-4`}>
                    <FontAwesomeIcon icon={achievement.icon} className="w-8 h-8 text-white" />
                  </div>
                  {achievement.earned ? (
                    <Badge className="bg-green-100 text-green-800">Earned</Badge>
                  ) : (
                    <Badge variant="outline">In Progress</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {achievement.earned ? (
                  <p className="text-sm text-muted-foreground">Earned on {achievement.date}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Progress: {achievement.progress}/10</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAchievements;