import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, 
  faUsers, 
  faClock,
  faMapMarkerAlt,
  faBookOpen,
  faPlus,
  faSearch,
  faEye,
  faEdit,
  faUserGraduate,
  faChalkboardTeacher,
  faFileText,
  faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getTeacherSidebarItems } from "@/lib/teacherSidebar";
import { getTeacherClasses } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useErrorHandler, teacherFallbackData } from "@/hooks/use-error-handler";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TeacherClasses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const { error, handleError, retry } = useErrorHandler();
  const sidebarItems = getTeacherSidebarItems("/teacher/classes");

  const fetchClasses = async () => {
    try {
      if (!accessToken) {
        handleError("No authentication token found. Please log in.", { showToast: true });
        setLoading(false);
        return;
      }

      const classesData = await getTeacherClasses(accessToken);
      console.log('Teacher classes data received:', classesData);
      setClasses(classesData || []);
    } catch (error: any) {
      console.error('Failed to fetch teacher classes:', error);
      const fallbackClasses = handleError(error, { 
        showToast: true, 
        fallbackData: teacherFallbackData.classes 
      });
      setClasses(fallbackClasses || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaySchedule = classes.slice(0, 2).map(cls => ({
    time: cls.schedule || "TBD",
    subject: cls.subject,
    grade: cls.name,
    room: cls.room,
    topic: "Class Activity",
    students: cls.student_count
  }));

  if (loading) {
    return (
      <DashboardLayout
        title="My Classes"
        userName="Prof. Michael Anderson"
        userRole="Senior Teacher"
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
        title="My Classes"
        userName="Prof. Michael Anderson"
        userRole="Senior Teacher"
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Classes</h2>
            <p className="text-gray-600 mb-4">{error?.message || 'Failed to load classes data'}</p>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
              <p className="text-sm text-orange-700">
                <strong>Note:</strong> Showing demo data while backend is unavailable.
              </p>
            </div>
            <Button onClick={fetchClasses}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Classes"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Classes</h2>
            <p className="text-muted-foreground">Manage your teaching schedule and class activities</p>
          </div>
          <Button>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create Lesson Plan
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <FontAwesomeIcon icon={faChalkboardTeacher} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Active this semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <FontAwesomeIcon icon={faUserGraduate} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">114</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
              <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Mathematics & Chemistry</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
              <FontAwesomeIcon icon={faFileText} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Need to be graded</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all-classes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-classes">All Classes</TabsTrigger>
            <TabsTrigger value="today-schedule">Today's Schedule</TabsTrigger>
            <TabsTrigger value="syllabus">Syllabus Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="all-classes" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => (
                <Card key={cls.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cls.subject}</CardTitle>
                      <Badge variant="secondary">{cls.status}</Badge>
                    </div>
                    <CardDescription>Grade {cls.grade}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{cls.students} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{cls.room}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{cls.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Next: {cls.nextClass}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span>Syllabus Progress</span>
                        <span className="font-medium">{cls.syllabus}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Average Grade</span>
                        <span className="font-medium">{cls.averageGrade}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <FontAwesomeIcon icon={faEdit} className="mr-1 w-3 h-3" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="today-schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Today's Teaching Schedule
                </CardTitle>
                <CardDescription>Your classes scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaySchedule.map((schedule, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{schedule.subject} - Grade {schedule.grade}</h4>
                        <Badge>{schedule.time}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                          <span>{schedule.room}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                          <span>{schedule.students} students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4" />
                          <span>Topic: {schedule.topic}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="syllabus" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClipboardList} />
                  Syllabus Progress Overview
                </CardTitle>
                <CardDescription>Track completion status across all your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{cls.subject} - Grade {cls.grade}</h4>
                        <span className="text-sm font-medium">{cls.syllabus}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: cls.syllabus }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>{cls.assignments} assignments completed</span>
                        <span>Class average: {cls.averageGrade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeacherClasses;