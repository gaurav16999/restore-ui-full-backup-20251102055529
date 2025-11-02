import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTeacherAssignments, getTeacherClasses } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler, teacherFallbackData } from "@/hooks/use-error-handler";
import { 
  faUpload, 
  faPlus,
  faSearch,
  faEdit,
  faEye,
  faDownload,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faFileText,
  faClipboardList,
  faUsers
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TeacherAssignments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const sidebarItems = getTeacherSidebarItems("/teacher/assignments");
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

      const [assignmentsData, classesData] = await Promise.all([
        getTeacherAssignments(accessToken),
        getTeacherClasses(accessToken)
      ]);

      console.log('Teacher assignments data received:', assignmentsData);
      console.log('Teacher classes data received:', classesData);
      
      setAssignments(assignmentsData || []);
      setClasses(classesData || []);
    } catch (error: any) {
      console.error('Failed to fetch teacher assignments:', error);
      const fallbackAssignments = handleError(error, { 
        showToast: true, 
        fallbackData: teacherFallbackData.assignments 
      });
      setAssignments(fallbackAssignments || []);
      setClasses(teacherFallbackData.classes || []);
      toast({
        title: "Error",
        description: "Failed to fetch assignments data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Computed values from API data
  const submissions = assignments.flatMap(assignment => {
    // Ensure submissions is an array
    const assignmentSubmissions = Array.isArray(assignment.submissions) ? assignment.submissions : [];
    return assignmentSubmissions.map(sub => ({
      ...sub,
      assignment: assignment.title,
      class: assignment.class_name,
      dueDate: assignment.due_date,
      maxScore: assignment.max_marks
    }));
  });

  const pendingSubmissions = submissions.filter(sub => !sub.graded);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = (assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (assignment.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesClass = selectedClass === "all" || assignment.class_name === selectedClass;
    const matchesStatus = selectedStatus === "all" || assignment.status === selectedStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Overdue": return "bg-red-100 text-red-800";
      case "Draft": return "bg-gray-100 text-gray-800";
      case "On Time": return "bg-green-100 text-green-800";
      case "Early": return "bg-blue-100 text-blue-800";
      case "Late": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100);
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const pendingGrades = submissions.filter(sub => !sub.graded).length;
  
  const gradedSubmissions = submissions.filter(sub => sub.graded && sub.score !== null);
  const averageScore = gradedSubmissions.length > 0 
    ? (gradedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / gradedSubmissions.length).toFixed(1)
    : "0";
    
  const totalSubmitted = submissions.filter(sub => sub.submitted_date).length;
  const totalExpected = assignments.reduce((sum, assignment) => sum + (assignment.total_students || 0), 0);
  const completionRate = totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;

  return (
    <DashboardLayout
      title="Assignments"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading assignments...</p>
            </div>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Assignments</h2>
            <p className="text-muted-foreground">Create and manage student assignments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              <span className="hidden sm:inline">Export Reports</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  <span className="hidden sm:inline">Create Assignment</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>Set up a new assignment for your students</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="md:text-right">Title</Label>
                    <Input id="title" className="md:col-span-3" placeholder="Assignment title" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="class" className="md:text-right">Class</Label>
                    <Select>
                      <SelectTrigger className="md:col-span-3">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.name}>
                            {cls.name} - {cls.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="md:text-right">Due Date</Label>
                    <Input id="dueDate" type="date" className="md:col-span-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="maxMarks" className="md:text-right">Max Marks</Label>
                    <Input id="maxMarks" type="number" className="md:col-span-3" placeholder="100" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="md:text-right">Description</Label>
                    <Textarea id="description" className="md:col-span-3" placeholder="Assignment instructions and requirements" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="attachment" className="md:text-right">Attachment</Label>
                    <Input id="attachment" type="file" className="md:col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full sm:w-auto">Create Assignment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FontAwesomeIcon icon={faClipboardList} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingGrades}</div>
              <p className="text-xs text-muted-foreground">Need grading</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">Across all assignments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Student submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">All Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1 max-w-full sm:max-w-sm">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base md:text-lg line-clamp-2">{assignment.title}</CardTitle>
                      <Badge variant="secondary" className={`${getStatusBadgeColor(assignment.status)} shrink-0 text-xs`}>
                        {assignment.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-1">{assignment.class_name} - {assignment.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">Due: {assignment.due_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileText} className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{assignment.max_marks} marks</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Submission Progress</span>
                        <span>{getProgressPercentage(assignment.submitted, assignment.totalStudents)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${getProgressPercentage(assignment.submitted || 0, assignment.total_students || 1)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{assignment.submitted || 0}/{assignment.total_students || 0} submitted</span>
                        <span>{assignment.graded || 0} graded</span>
                      </div>
                    </div>

                    {assignment.status === "Completed" && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Average Score:</span>
                          <span className="font-medium">{assignment.average_score || 0}/{assignment.max_marks}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <FontAwesomeIcon icon={faEdit} className="mr-1 w-3 h-3" />
                        <span className="hidden sm:inline">Manage</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Student submissions across all assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="font-medium">{submission.student_name}</div>
                          </TableCell>
                          <TableCell>{submission.assignment}</TableCell>
                          <TableCell>{submission.class}</TableCell>
                          <TableCell>{submission.submitted_date}</TableCell>
                          <TableCell>{submission.dueDate}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusBadgeColor(submission.status)}>
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {submission.graded ? `${submission.score}/${submission.maxScore}` : "Pending"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                              </Button>
                              {!submission.graded && (
                                <Button size="sm">
                                  <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile view for submissions */}
                <div className="md:hidden space-y-4">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{submission.student_name}</h4>
                            <p className="text-sm text-muted-foreground">{submission.assignment}</p>
                          </div>
                          <Badge variant="secondary" className={`${getStatusBadgeColor(submission.status)} text-xs`}>
                            {submission.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Class:</span> {submission.class}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Score:</span> {submission.graded ? `${submission.score}/${submission.maxScore}` : "Pending"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span> {submission.submitted_date}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due:</span> {submission.dueDate}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <FontAwesomeIcon icon={faEye} className="mr-2 w-3 h-3" />
                            View
                          </Button>
                          {!submission.graded && (
                            <Button size="sm" className="flex-1">
                              <FontAwesomeIcon icon={faEdit} className="mr-2 w-3 h-3" />
                              Grade
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} />
                  Pending Review
                </CardTitle>
                <CardDescription>Submissions waiting for your review and grading</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending submissions to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSubmissions.map((submission) => (
                      <div key={submission.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50 gap-4">
                        <div className="flex items-start md:items-center gap-4">
                          <FontAwesomeIcon icon={faClock} className="text-yellow-600 mt-1 md:mt-0 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold">{submission.student_name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{submission.assignment}</p>
                            <p className="text-sm text-yellow-700">
                              Submitted: {submission.submitted_date} | Due: {submission.dueDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="flex-1 md:flex-none">
                            <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
                            Review
                          </Button>
                          <Button size="sm" className="flex-1 md:flex-none">
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

export default TeacherAssignments;