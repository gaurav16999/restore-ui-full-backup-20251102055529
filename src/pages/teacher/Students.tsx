import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faUserGraduate,
  faSearch,
  faEye,
  faEdit,
  faEnvelope,
  faPhone,
  faChartLine,
  faAward,
  faExclamationTriangle,
  faCheckCircle,
  faFilter,
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getTeacherSidebarItems } from "@/lib/teacherSidebar";
import { getTeacherStudents, getTeacherClasses } from "@/lib/api";
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

const TeacherStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedPerformance, setSelectedPerformance] = useState("all");
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const { error, handleError, retry } = useErrorHandler();
  const sidebarItems = getTeacherSidebarItems("/teacher/students");

  const fetchData = async () => {
    try {
      if (!accessToken) {
        handleError("No authentication token found. Please log in.", { showToast: true });
        setLoading(false);
        return;
      }

      const [studentsData, classesData] = await Promise.all([
        getTeacherStudents(accessToken, selectedClass !== "all" ? selectedClass : undefined),
        getTeacherClasses(accessToken)
      ]);

      console.log('Teacher students data received:', studentsData);
      console.log('Teacher classes data received:', classesData);
      
      setStudents(studentsData || []);
      setClasses(classesData || []);
    } catch (error: any) {
      console.error('Failed to fetch teacher students:', error);
      const fallbackStudents = handleError(error, { 
        showToast: true, 
        fallbackData: teacherFallbackData.students 
      });
      setStudents(fallbackStudents || []);
      setClasses(teacherFallbackData.classes || []);
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.class_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "all" || student.class_name === selectedClass;
    const matchesPerformance = selectedPerformance === "all" || student.performance === selectedPerformance;
    
    return matchesSearch && matchesClass && matchesPerformance;
  });

  const topPerformers = students
    .filter(student => student.performance === "excellent")
    .slice(0, 3)
    .map(student => ({
      name: student.name,
      class: student.class_name,
      grade: student.average_grade ? `${student.average_grade}%` : 'N/A',
      subject: student.class_name
    }));

  const needsAttention = students
    .filter(student => student.performance === "needs_attention" || student.attendance_percent < 80)
    .slice(0, 2)
    .map(student => ({
      name: student.name,
      class: student.class_name,
      issue: student.attendance_percent < 80 ? `Low attendance (${student.attendance_percent}%)` : "Needs attention",
      subject: student.class_name
    }));

  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "needs_attention": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="My Students"
        userName="Prof. Michael Anderson"
        userRole="Senior Teacher"
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="My Students"
        userName="Prof. Michael Anderson"
        userRole="Senior Teacher"
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Students</h2>
            <p className="text-gray-600 mb-4">{error?.message || String(error)}</p>
            <Button onClick={fetchData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "At Risk": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout
      title="My Students"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Students</h2>
            <p className="text-muted-foreground">Monitor and manage your students' progress</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export List
            </Button>
            <Button>
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              Send Message
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">114</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <FontAwesomeIcon icon={faAward} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">A grade or higher</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Students at risk</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all-students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-students">All Students</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
            <TabsTrigger value="needs-attention">Needs Attention</TabsTrigger>
          </TabsList>

          <TabsContent value="all-students" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPerformance} onValueChange={setSelectedPerformance}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Performance</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="needs_attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student List</CardTitle>
                <CardDescription>Complete overview of your students across all classes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Current Grade</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.class_name}</TableCell>
                        <TableCell>{student.class_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.average_grade || 'N/A'}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={student.attendance_percent >= 90 ? "text-green-600" : student.attendance_percent >= 80 ? "text-yellow-600" : "text-red-600"}>
                              {student.attendance_percent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>N/A</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getPerformanceBadgeColor(student.performance)}>
                            {student.performance === 'excellent' ? 'Excellent' : 
                             student.performance === 'good' ? 'Good' : 
                             student.performance === 'needs_attention' ? 'Needs Attention' : 'Average'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {student.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-performers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faAward} />
                  Top Performing Students
                </CardTitle>
                <CardDescription>Students excelling in their studies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.class} - {student.subject}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {student.grade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="needs-attention" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Students Needing Attention
                </CardTitle>
                <CardDescription>Students requiring immediate support or intervention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {needsAttention.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                      <div className="flex items-center gap-4">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600" />
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.class} - {student.subject}</p>
                          <p className="text-sm text-yellow-700">{student.issue}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FontAwesomeIcon icon={faEnvelope} className="mr-1 w-3 h-3" />
                          Contact
                        </Button>
                        <Button size="sm">
                          <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
                          Review
                        </Button>
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

export default TeacherStudents;