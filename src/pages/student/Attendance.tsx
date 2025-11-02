import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { faCalendar, faCheckCircle, faTimesCircle, faUsers, faChartLine, faBook, faFileText, faClock, faComments, faAward, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudentAttendance, getStudentDashboard } from "@/lib/api";

type AttendanceData = {
  overall_percentage: number;
  total_classes: number;
  attended_classes: number;
  absent_classes: number;
  late_classes?: number;
  subjects: any[];
  recent_attendance: Array<{
    date: string;
    subject: string;
    status: string;
  }>;
};

const StudentAttendance = () => {
  const location = useLocation();
  const sidebarItems = getStudentSidebarItems(location.pathname);
  const accessToken = window.localStorage.getItem('accessToken') || '';

  // Fetch student dashboard data for name and class
  const { data: dashboardData } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => getStudentDashboard(accessToken),
    enabled: !!accessToken,
  });

  // Fetch attendance data
  const { data: attendanceData, isLoading, error } = useQuery<AttendanceData>({
    queryKey: ['student-attendance'],
    queryFn: () => getStudentAttendance(accessToken),
    enabled: !!accessToken,
  });

  const studentName = dashboardData?.student_name || "Student";
  const className = dashboardData?.class_name || "Not Assigned";

  const attendanceStats = {
    overall: attendanceData?.overall_percentage || 0,
    totalClasses: attendanceData?.total_classes || 0,
    attended: attendanceData?.attended_classes || 0,
    absent: attendanceData?.absent_classes || 0,
  };

  const subjectAttendance = attendanceData?.subjects || [];

  if (isLoading) {
    return (
      <DashboardLayout
        title="Student Portal"
        userName={studentName}
        userRole={className}
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
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
        userName={studentName}
        userRole={className}
        sidebarItems={sidebarItems}
      >
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Attendance</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'Failed to load attendance data'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Student Portal"
      userName={studentName}
      userRole={className}
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Attendance Record</h2>
            <p className="text-muted-foreground">Track your class attendance</p>
          </div>
          <Badge className="bg-green-100 text-green-800 text-sm">
            {attendanceStats.overall}% Overall
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Rate</p>
                  <p className="text-3xl font-bold">{attendanceStats.overall}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Classes Attended</p>
                  <p className="text-3xl font-bold">{attendanceStats.attended}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FontAwesomeIcon icon={faUsers} className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  <p className="text-3xl font-bold">{attendanceStats.totalClasses}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FontAwesomeIcon icon={faCalendar} className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absences</p>
                  <p className="text-3xl font-bold">{attendanceStats.absent}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <FontAwesomeIcon icon={faTimesCircle} className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subjectAttendance.length > 0 ? (
            subjectAttendance.map((subject, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{subject.subject}</CardTitle>
                  <CardDescription>Attendance tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Attendance Rate</span>
                    <span className="font-medium">{subject.percentage}%</span>
                  </div>
                  <Progress value={subject.percentage} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {subject.present} out of {subject.total} classes attended
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-2">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No subject-wise attendance data available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Attendance Records */}
        {attendanceData && attendanceData.recent_attendance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Your latest attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceData.recent_attendance.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        record.status === 'present' ? 'bg-green-100' :
                        record.status === 'absent' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={record.status === 'present' ? faCheckCircle : faTimesCircle} 
                          className={`w-4 h-4 ${
                            record.status === 'present' ? 'text-green-600' :
                            record.status === 'absent' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{record.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;