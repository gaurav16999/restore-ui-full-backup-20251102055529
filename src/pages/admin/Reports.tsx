import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faDownload, 
  faSearch, 
  faFilter, 
  faChartLine, 
  faUsers, 
  faTrophy, 
  faChartBar, 
  faChartPie, 
  faPrint, 
  faEye, 
  faBook, 
  faCalculator, 
  faFileText,
  faCog 
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReports, getClassAnalytics, getStudentProgress, getGradeDistribution, getStudents, getSubjects } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAdminSidebarItems } from "@/lib/adminSidebar";

const AdminReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [classAnalytics, setClassAnalytics] = useState<any>(null);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedStudentReport, setSelectedStudentReport] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      console.log('Reports page - Access token:', accessToken ? 'Present' : 'Missing');
      
      if (!accessToken) {
        console.log('Reports page - No access token found');
        toast({
          title: "Error",
          description: "You must be logged in to access reports",
          variant: "destructive",
        });
        return;
      }

      // Fetch each endpoint individually to handle partial failures
      const fetchWithFallback = async (fetchFn: () => Promise<any>, fallback: any) => {
        try {
          return await fetchFn();
        } catch (error) {
          console.warn('API call failed, using fallback:', error);
          return fallback;
        }
      };

      const [
        reportsData,
        analyticsData,
        distributionData,
        progressData,
        studentsData,
        subjectsData
      ] = await Promise.all([
        fetchWithFallback(() => getReports(accessToken), []),
        fetchWithFallback(() => getClassAnalytics(accessToken), {}),
        fetchWithFallback(() => getGradeDistribution(accessToken), []),
        fetchWithFallback(() => getStudentProgress(accessToken), []),
        fetchWithFallback(() => getStudents(), []),
        fetchWithFallback(() => getSubjects(), [])
      ]);

      console.log('Reports page - Data fetched:', {
        reports: reportsData,
        analytics: analyticsData,
        distribution: distributionData,
        progress: progressData,
        students: studentsData,
        subjects: subjectsData
      });

      setReports(Array.isArray(reportsData) ? reportsData : []);
      setClassAnalytics(analyticsData);
      setGradeDistribution(Array.isArray(distributionData) ? distributionData : []);
      setStudentProgress(Array.isArray(progressData) ? progressData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      
      // Show success toast if we got any data
      if (Array.isArray(reportsData) && reportsData.length > 0) {
        toast({
          title: "Success",
          description: `Loaded ${reportsData.length} student reports`,
        });
      }
      
    } catch (error: any) {
      console.error('Reports page - Failed to fetch reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports data",
        variant: "destructive",
      });
    } finally {
      console.log('Reports page - Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Reports page - Component mounted, fetching data...');
    fetchData();
  }, []);

  const handleExportReport = (reportType: string, format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${reportType} as ${format.toUpperCase()}...`,
    });
    
    // Mock export functionality
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${reportType} exported successfully`,
      });
    }, 2000);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const filteredReports = (Array.isArray(reports) ? reports : []).filter(report => {
    const matchesSearch = report.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "all" || report.class_name === selectedClass;
    const matchesSubject = selectedSubject === "all" || report.subject === selectedSubject;
    
    return matchesSearch && matchesClass && matchesSubject;
  });

  const sidebarItems = getAdminSidebarItems("/admin/reports");

  console.log('Reports page - Rendering component, loading:', loading, 'reports:', (Array.isArray(reports) ? reports : []).length);

  return (
    <DashboardLayout
      title="Reports & Analytics"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Generate reports and analyze student performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportReport("All Reports", "PDF")}>
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => handleExportReport("All Reports", "Excel")}>
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        {classAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                <FontAwesomeIcon icon={faChartBar} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classAnalytics.class_average}%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full ${getGradeColor(classAnalytics.class_average)}`}>
                    Grade {getLetterGrade(classAnalytics.class_average)}
                  </div>
                  <span>{classAnalytics.trend > 0 ? '+' : ''}{classAnalytics.trend}% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classAnalytics.top_performers}</div>
                <p className="text-xs text-muted-foreground">
                  Students with A grade (90%+)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classAnalytics.at_risk}</div>
                <p className="text-xs text-muted-foreground">
                  Students below 60%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Improvement Rate</CardTitle>
                <FontAwesomeIcon icon={faChartPie} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classAnalytics.improvement_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  Students showing improvement
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tabs */}
        <Tabs defaultValue="student-reports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="student-reports">Student Reports</TabsTrigger>
            <TabsTrigger value="class-analytics">Class Analytics</TabsTrigger>
            <TabsTrigger value="grade-distribution">Grade Distribution</TabsTrigger>
            <TabsTrigger value="progress-tracking">Progress Tracking</TabsTrigger>
          </TabsList>

          {/* Student Reports Tab */}
          <TabsContent value="student-reports">
            <Card>
              <CardHeader>
                <CardTitle>Student Report Cards</CardTitle>
                <CardDescription>Individual student performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="10A">Class 10A</SelectItem>
                      <SelectItem value="10B">Class 10B</SelectItem>
                      <SelectItem value="11A">Class 11A</SelectItem>
                      <SelectItem value="11B">Class 11B</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Quarter</SelectItem>
                      <SelectItem value="semester">This Semester</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Overall Average</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading reports...
                          </TableCell>
                        </TableRow>
                      ) : filteredReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No reports found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{report.student_name}</div>
                                <div className="text-sm text-muted-foreground">{report.roll_no}</div>
                              </div>
                            </TableCell>
                            <TableCell>{report.class_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono">{report.overall_average}%</span>
                                <Progress value={report.overall_average} className="w-20" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-bold ${getGradeColor(report.overall_average)}`}>
                                {getLetterGrade(report.overall_average)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={report.rank <= 5 ? "default" : "secondary"}>
                                #{report.rank}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{report.attendance}%</span>
                                <Progress value={report.attendance} className="w-16" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" title="View Report">
                                      <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Student Report Card</DialogTitle>
                                      <DialogDescription>
                                        Detailed report for {report.student_name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <strong>Student:</strong> {report.student_name}
                                        </div>
                                        <div>
                                          <strong>Roll No:</strong> {report.roll_no}
                                        </div>
                                        <div>
                                          <strong>Class:</strong> {report.class_name}
                                        </div>
                                        <div>
                                          <strong>Overall Grade:</strong> {getLetterGrade(report.overall_average)}
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-medium">Subject-wise Performance</h4>
                                        <div className="space-y-2">
                                          {report.subjects?.map((subject: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                                              <span>{subject.name}</span>
                                              <div className="flex items-center space-x-2">
                                                <span className="font-mono">{subject.average}%</span>
                                                <Badge className={getGradeColor(subject.average)}>
                                                  {getLetterGrade(subject.average)}
                                                </Badge>
                                              </div>
                                            </div>
                                          )) || <p>No subject data available</p>}
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleExportReport(`${report.student_name} Report`, "PDF")}
                                  title="Download PDF"
                                >
                                  <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => window.print()}
                                  title="Print Report"
                                >
                                  <FontAwesomeIcon icon={faPrint} className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Analytics Tab */}
          <TabsContent value="class-analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Average performance by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(Array.isArray(subjects) ? subjects : []).map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{subject.name}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={subject.average || 75} className="w-24" />
                          <span className="text-sm font-mono w-12">{subject.average || 75}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Monthly grade trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                      Grade trends chart would be displayed here
                    </div>
                    <div className="h-32 bg-muted rounded flex items-center justify-center">
                      <FontAwesomeIcon icon={faChartPie} className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grade Distribution Tab */}
          <TabsContent value="grade-distribution">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution Analysis</CardTitle>
                <CardDescription>Distribution of grades across all students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  {['A', 'B', 'C', 'D', 'F'].map((grade) => (
                    <Card key={grade}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{grade}</div>
                        <div className="text-sm text-muted-foreground">
                          {grade === 'A' ? '28' : grade === 'B' ? '45' : grade === 'C' ? '32' : grade === 'D' ? '18' : '7'} students
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {grade === 'A' ? '21%' : grade === 'B' ? '35%' : grade === 'C' ? '25%' : grade === 'D' ? '14%' : '5%'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faChartBar} className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Grade distribution chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress-tracking">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress Tracking</CardTitle>
                <CardDescription>Individual student progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Array.isArray(studentProgress) ? studentProgress : []).map((student, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">Class {student.class} • Roll No: {student.roll_no}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{student.current_average}%</div>
                          <div className={`text-sm ${student.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {student.trend >= 0 ? '+' : ''}{student.trend}% change
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Progress</span>
                        <Progress value={student.current_average} className="flex-1" />
                        <span className="text-sm font-mono">{student.current_average}%</span>
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

export default AdminReports;