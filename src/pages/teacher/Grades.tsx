import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTeacherGrades, getTeacherClasses } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler, teacherFallbackData } from "@/hooks/use-error-handler";
import { 
  faFileText, 
  faPlus,
  faSearch,
  faEdit,
  faEye,
  faDownload,
  faUpload,
  faChartBar,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faAward,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getTeacherSidebarItems } from "@/lib/teacherSidebar";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TeacherGrades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState("all");
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const sidebarItems = getTeacherSidebarItems("/teacher/grades");
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const { error, handleError, retry } = useErrorHandler();

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!accessToken) {
        handleError("No authentication token found. Please log in.", { showToast: true });
        setLoading(false);
        return;
      }

      const [gradesData, classesData] = await Promise.all([
        getTeacherGrades(accessToken),
        getTeacherClasses(accessToken)
      ]);

      console.log('Teacher grades data received:', gradesData);
      console.log('Teacher classes data received:', classesData);
      
      setGrades(gradesData || []);
      setClasses(classesData || []);
    } catch (error: any) {
      console.error('Failed to fetch teacher grades:', error);
      const fallbackGrades = handleError(error, { 
        showToast: true, 
        fallbackData: teacherFallbackData.grades 
      });
      setGrades(fallbackGrades || []);
      setClasses(teacherFallbackData.classes || []);
      toast({
        title: "Error",
        description: "Failed to fetch grades data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Computed values from API data
  const assessments = grades.reduce((acc, grade) => {
    const existingAssessment = acc.find(a => a.title === grade.assessment && a.class === grade.class_name);
    if (!existingAssessment) {
      acc.push({
        id: `${grade.class_name}-${grade.assessment}`,
        title: grade.assessment,
        class: grade.class_name,
        subject: grade.subject || 'General',
        type: grade.assessment_type || 'Assignment',
        dueDate: grade.due_date || 'TBD',
        totalMarks: grade.max_score,
        submissions: grades.filter(g => g.assessment === grade.assessment && g.class_name === grade.class_name).length,
        graded: grades.filter(g => g.assessment === grade.assessment && g.class_name === grade.class_name && g.status !== 'Pending').length,
        status: grade.status === 'Pending' ? 'In Progress' : 'Completed',
        description: grade.description || `${grade.assessment} for ${grade.class_name}`
      });
    }
    return acc;
  }, []);

  const pendingGrades = grades.filter(grade => grade.status === "Pending");

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = (grade.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (grade.assessment?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesClass = selectedClass === "all" || grade.class_name === selectedClass;
    const matchesAssessment = selectedAssessment === "all" || grade.assessment === selectedAssessment;
    
    return matchesSearch && matchesClass && matchesAssessment;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Graded": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Active": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A": case "A+": return "bg-green-100 text-green-800";
      case "A-": case "B+": return "bg-blue-100 text-blue-800";
      case "B": case "B-": return "bg-yellow-100 text-yellow-800";
      case "C+": case "C": return "bg-orange-100 text-orange-800";
      case "Pending": return "bg-gray-100 text-gray-800";
      default: return "bg-red-100 text-red-800";
    }
  };

  // Calculate statistics
  const gradedEntries = grades.filter(grade => grade.status !== "Pending" && grade.percentage !== null);
  const averageScore = gradedEntries.length > 0 
    ? (gradedEntries.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / gradedEntries.length).toFixed(1)
    : "0";
    
  const thisWeekGraded = grades.filter(grade => {
    if (!grade.graded_date) return false;
    const gradedDate = new Date(grade.graded_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return gradedDate >= weekAgo;
  }).length;

  return (
    <DashboardLayout
      title="Grades & Assessments"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {/* Overview skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-6" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="grid grid-cols-8 gap-4 items-center">
                      <Skeleton className="h-4 col-span-2" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-7 w-16 rounded-full" />
                      <Skeleton className="h-8 w-20 rounded-md justify-self-end" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error?.message || String(error)}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Grades & Assessments</h2>
            <p className="text-muted-foreground">Manage student assessments and grade submissions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export Grades
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Create Assessment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Assessment</DialogTitle>
                  <DialogDescription>Set up a new assessment for your students</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" className="col-span-3" placeholder="Assessment title" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="class" className="text-right">Class</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.name}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Assessment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="marks" className="text-right">Total Marks</Label>
                    <Input id="marks" type="number" className="col-span-3" placeholder="100" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea id="description" className="col-span-3" placeholder="Assessment description" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Assessment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
              <FontAwesomeIcon icon={faFileText} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments.length}</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
              <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingGrades.length}</div>
              <p className="text-xs text-muted-foreground">Need to be graded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <FontAwesomeIcon icon={faChartBar} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded This Week</CardTitle>
              <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisWeekGraded}</div>
              <p className="text-xs text-muted-foreground">Submissions graded</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="grades" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grades">Student Grades</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="pending">Pending Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search grades..."
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
            </div>

            {/* Grades Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Grades</CardTitle>
                <CardDescription>Overview of all student grades across assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>
                          <div className="font-medium">{grade.student_name}</div>
                        </TableCell>
                        <TableCell>{grade.class_name}</TableCell>
                        <TableCell>{grade.assessment}</TableCell>
                        <TableCell>
                          {grade.status === "Pending" ? "-" : `${grade.score}/${grade.max_score}`}
                        </TableCell>
                        <TableCell>
                          {grade.status === "Pending" ? "-" : `${grade.percentage}%`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getGradeBadgeColor(grade.grade)}>
                            {grade.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusBadgeColor(grade.status)}>
                            {grade.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
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

          <TabsContent value="assessments" className="space-y-4">
            {/* Assessments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{assessment.title}</CardTitle>
                      <Badge variant="secondary" className={getStatusBadgeColor(assessment.status)}>
                        {assessment.status}
                      </Badge>
                    </div>
                    <CardDescription>{assessment.class} - {assessment.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <Badge variant="outline">{assessment.type}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Due Date:</span>
                        <span>{assessment.dueDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Marks:</span>
                        <span>{assessment.totalMarks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Submissions:</span>
                        <span>{assessment.submissions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Graded:</span>
                        <span className={assessment.graded === assessment.submissions ? "text-green-600" : "text-yellow-600"}>
                          {assessment.graded}/{assessment.submissions}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{assessment.description}</p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
                        View
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

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} />
                  Pending Grades
                </CardTitle>
                <CardDescription>Submissions waiting to be graded</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingGrades.length === 0 ? (
                  <div className="text-center py-8">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending grades to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingGrades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                        <div className="flex items-center gap-4">
                          <FontAwesomeIcon icon={faClock} className="text-yellow-600" />
                          <div>
                            <h4 className="font-semibold">{grade.student_name}</h4>
                            <p className="text-sm text-muted-foreground">{grade.class_name} - {grade.assessment}</p>
                            <p className="text-sm text-yellow-700">Submitted: {grade.submitted_date}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
                            Review
                          </Button>
                          <Button size="sm">
                            <FontAwesomeIcon icon={faEdit} className="mr-1 w-3 h-3" />
                            Grade
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherGrades;