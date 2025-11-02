import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faChartLine, faArrowUp, faArrowDown, faAward, faBook, faFileText, faClock, faUsers, faComments, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { useLocation } from "react-router-dom";

const StudentGrades = () => {
  const location = useLocation();
  const sidebarItems = getStudentSidebarItems(location.pathname);

  const subjects = [
    {
      name: "Mathematics",
      grade: "A",
      percentage: 92,
      trend: "up",
      color: "bg-blue-500",
      assessments: [
        { name: "Midterm Exam", score: 95, total: 100, weight: 30, date: "2025-10-10" },
        { name: "Quiz 1", score: 88, total: 100, weight: 10, date: "2025-10-05" },
        { name: "Assignment 1", score: 94, total: 100, weight: 15, date: "2025-09-28" },
      ]
    },
    {
      name: "Physics",
      grade: "B+",
      percentage: 87,
      trend: "up",
      color: "bg-green-500",
      assessments: [
        { name: "Lab Report 3", score: 85, total: 100, weight: 25, date: "2025-10-12" },
        { name: "Midterm", score: 89, total: 100, weight: 35, date: "2025-10-08" },
        { name: "Quiz 2", score: 92, total: 100, weight: 15, date: "2025-10-01" },
      ]
    },
    {
      name: "Chemistry",
      grade: "A-",
      percentage: 89,
      trend: "stable",
      color: "bg-purple-500",
      assessments: [
        { name: "Lab Practical", score: 91, total: 100, weight: 30, date: "2025-10-14" },
        { name: "Quiz 5", score: 87, total: 100, weight: 10, date: "2025-10-07" },
        { name: "Assignment 2", score: 89, total: 100, weight: 20, date: "2025-09-30" },
      ]
    },
    {
      name: "English",
      grade: "A",
      percentage: 94,
      trend: "up",
      color: "bg-orange-500",
      assessments: [
        { name: "Essay 2", score: 96, total: 100, weight: 25, date: "2025-10-11" },
        { name: "Presentation", score: 92, total: 100, weight: 20, date: "2025-10-04" },
        { name: "Quiz 3", score: 94, total: 100, weight: 15, date: "2025-09-29" },
      ]
    }
  ];

  const overallStats = {
    gpa: 3.8,
    averageGrade: 90.5,
    totalAssessments: 45,
    completedAssessments: 42
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4 text-green-600" />;
      case 'down':
        return <FontAwesomeIcon icon={faArrowDown} className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout
      title="Student Portal"
      userName="Alex Thompson"
      userRole="Grade 10 Student"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Grades & Performance</h2>
            <p className="text-muted-foreground">Track your academic progress and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 text-sm">
              GPA: {overallStats.gpa}
            </Badge>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall GPA</p>
                  <p className="text-3xl font-bold">{overallStats.gpa}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <FontAwesomeIcon icon={faAward} className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                  <p className="text-3xl font-bold">{overallStats.averageGrade}%</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FontAwesomeIcon icon={faChartLine} className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Assessments</p>
                  <p className="text-3xl font-bold">{overallStats.completedAssessments}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FontAwesomeIcon icon={faFileText} className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-3xl font-bold">{Math.round((overallStats.completedAssessments / overallStats.totalAssessments) * 100)}%</p>
                </div>
                <Progress value={(overallStats.completedAssessments / overallStats.totalAssessments) * 100} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grades Tabs */}
        <Tabs defaultValue="subjects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subjects">By Subject</TabsTrigger>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjects.map((subject) => (
                <Card key={subject.name} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${subject.color} flex items-center justify-center`}>
                          <FontAwesomeIcon icon={faBook} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                          <CardDescription>Current Grade</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getGradeColor(subject.grade)}>
                          {subject.grade}
                        </Badge>
                        {getTrendIcon(subject.trend)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Overall Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Score</span>
                        <span className="font-medium">{subject.percentage}%</span>
                      </div>
                      <Progress value={subject.percentage} className="h-2" />
                    </div>

                    {/* Recent Assessments */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Recent Assessments</h4>
                      {subject.assessments.slice(0, 3).map((assessment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{assessment.name}</p>
                            <p className="text-xs text-muted-foreground">{assessment.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">
                              {assessment.score}/{assessment.total}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round((assessment.score / assessment.total) * 100)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full">
                      View All Assessments
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Grade Timeline</CardTitle>
                <CardDescription>Your grade progression over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FontAwesomeIcon icon={faChartLine} className="w-16 h-16 mb-4" />
                  <p>Grade timeline chart coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentGrades;