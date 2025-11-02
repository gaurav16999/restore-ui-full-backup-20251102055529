import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { faBook, faUsers, faClock, faChartLine, faFileText, faVideo, faDownload, faComments, faAward, faCog, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudentCourses, getStudentDashboard } from "@/lib/api";

type Course = {
  id: number;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  schedule: string;
  room: string;
  progress: number;
  status: string;
  next_class: string;
};

const StudentCourses = () => {
  const location = useLocation();
  const sidebarItems = getStudentSidebarItems(location.pathname);

  // Fetch student info for header
  const { data: dashboardData } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => getStudentDashboard(localStorage.getItem('accessToken') || ''),
  });

  // Fetch courses
  const { data: courses = [], isLoading, error } = useQuery<Course[]>({
    queryKey: ['student-courses'],
    queryFn: getStudentCourses,
  });

  // Color mapping for different subjects
  const getSubjectColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500',
    ];
    return colors[index % colors.length];
  };

  const studentName = dashboardData?.student_name || "Student";
  const studentClass = dashboardData?.class_name || "Class";

  return (
    <DashboardLayout
      title="Student Portal"
      userName={studentName}
      userRole={studentClass}
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Courses</h2>
            <p className="text-muted-foreground">Track your enrolled courses and progress</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
            </Badge>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">Failed to load courses. Please try again later.</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && courses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FontAwesomeIcon icon={faBook} className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Courses Assigned</h3>
              <p className="text-muted-foreground">
                You don't have any courses assigned yet. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        {!isLoading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <Card key={course.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-lg ${getSubjectColor(index)} flex items-center justify-center mb-3`}>
                      <FontAwesomeIcon icon={faBook} className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant={course.status === 'enrolled' ? 'default' : 'secondary'}>
                      {course.status === 'enrolled' ? 'Compulsory' : 'Optional'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>
                    <p className="font-medium">{course.code}</p>
                    <p className="text-xs mt-1">{course.credits} Credit Hours</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Teacher & Room */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-muted-foreground" />
                      <span>{course.teacher}</span>
                    </div>
                    {course.room && (
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{course.room}</span>
                      </div>
                    )}
                    {course.schedule && course.schedule !== 'TBD' && (
                      <div className="text-xs text-muted-foreground">
                        Schedule: {course.schedule}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <FontAwesomeIcon icon={faVideo} className="w-4 h-4 mr-2" />
                      Join Class
                    </Button>
                    <Button size="sm" variant="outline">
                      <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used course-related actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FontAwesomeIcon icon={faFileText} className="w-6 h-6" />
                <span>View All Assignments</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FontAwesomeIcon icon={faClock} className="w-6 h-6" />
                <span>Today's Schedule</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FontAwesomeIcon icon={faChartLine} className="w-6 h-6" />
                <span>Grade Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FontAwesomeIcon icon={faDownload} className="w-6 h-6" />
                <span>Download Materials</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;