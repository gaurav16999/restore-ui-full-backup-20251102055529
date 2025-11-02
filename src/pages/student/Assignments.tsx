import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faFileText, faCalendar, faClock, faExclamationTriangle, faCheck, faSearch, faFilter, faDownload, faUpload, faChartLine, faBook, faUsers, faComments, faAward, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { useLocation } from "react-router-dom";

const StudentAssignments = () => {
  const location = useLocation();
  const sidebarItems = getStudentSidebarItems(location.pathname);

  const assignments = [
    {
      id: 1,
      title: "Math Assignment: Calculus",
      subject: "Mathematics",
      type: "Homework",
      dueDate: "2025-10-17",
      dueTime: "11:59 PM",
      status: "pending",
      priority: "urgent",
      progress: 60,
      totalMarks: 100,
      submittedDate: null,
      description: "Solve differential equations and integration problems from Chapter 5",
      attachments: ["calculus_problems.pdf"],
      estimatedTime: "3 hours"
    },
    {
      id: 2,
      title: "Physics Lab Report",
      subject: "Physics",
      type: "Lab Report",
      dueDate: "2025-10-19",
      dueTime: "5:00 PM",
      status: "in-progress",
      priority: "medium",
      progress: 30,
      totalMarks: 50,
      submittedDate: null,
      description: "Write a comprehensive report on the pendulum experiment conducted in lab",
      attachments: ["lab_template.docx", "data_sheet.xlsx"],
      estimatedTime: "4 hours"
    },
    {
      id: 3,
      title: "Chemistry Quiz Preparation",
      subject: "Chemistry",
      type: "Quiz",
      dueDate: "2025-10-21",
      dueTime: "2:00 PM",
      status: "not-started",
      priority: "low",
      progress: 0,
      totalMarks: 25,
      submittedDate: null,
      description: "Study organic chemistry reactions for the upcoming quiz",
      attachments: ["study_guide.pdf"],
      estimatedTime: "2 hours"
    },
    {
      id: 4,
      title: "English Essay: Shakespeare",
      subject: "English",
      type: "Essay",
      dueDate: "2025-10-25",
      dueTime: "11:59 PM",
      status: "submitted",
      priority: "medium",
      progress: 100,
      totalMarks: 75,
      submittedDate: "2025-10-15",
      description: "Write a 1500-word essay analyzing themes in Hamlet",
      attachments: ["essay_guidelines.pdf"],
      estimatedTime: "5 hours"
    },
    {
      id: 5,
      title: "History Research Project",
      subject: "History",
      type: "Project",
      dueDate: "2025-10-30",
      dueTime: "11:59 PM",
      status: "pending",
      priority: "high",
      progress: 25,
      totalMarks: 150,
      submittedDate: null,
      description: "Research and present on World War II impact on society",
      attachments: ["project_rubric.pdf", "source_list.pdf"],
      estimatedTime: "8 hours"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const pendingAssignments = assignments.filter(a => a.status !== 'submitted');
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');

  return (
    <DashboardLayout
      title="Student Portal"
      userName="Alex Thompson"
      userRole="Grade 10 Student"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Assignments</h2>
            <p className="text-muted-foreground">Track and manage your assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs md:text-sm">
              {pendingAssignments.length} Pending
            </Badge>
            <Badge variant="secondary" className="text-xs md:text-sm">
              {submittedAssignments.length} Submitted
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex-1 relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search assignments..." 
                  className="w-full md:max-w-sm pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select>
                  <SelectTrigger className="w-full sm:w-32 md:w-40">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full sm:w-32 md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <FontAwesomeIcon icon={faFilter} className="w-4 h-4 mr-2" />
                  <span className="sm:hidden">Filter</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <FontAwesomeIcon icon={faClock} className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">({pendingAssignments.length})</span>
              <span className="hidden sm:inline">({pendingAssignments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="submitted" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <FontAwesomeIcon icon={faCheck} className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Submitted</span>
              <span className="sm:hidden">({submittedAssignments.length})</span>
              <span className="hidden sm:inline">({submittedAssignments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <FontAwesomeIcon icon={faCalendar} className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Cal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <CardTitle className="text-base md:text-lg line-clamp-2">{assignment.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{assignment.subject}</Badge>
                          <Badge variant="outline" className="text-xs">{assignment.type}</Badge>
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(assignment.priority)}`} title={assignment.priority}></div>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-3">{assignment.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {assignment.priority === 'urgent' && (
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="w-3 h-3" />
                          Urgent
                        </Badge>
                      )}
                      <Badge className={`${getStatusColor(assignment.status)} text-xs`}>
                        {assignment.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{assignment.progress}%</span>
                    </div>
                    <Progress value={assignment.progress} className="h-2" />
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium text-red-600 text-xs md:text-sm">{assignment.dueDate} at {assignment.dueTime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Marks</p>
                      <p className="font-medium">{assignment.totalMarks} points</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estimated Time</p>
                      <p className="font-medium">{assignment.estimatedTime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Attachments</p>
                      <p className="font-medium">{assignment.attachments.length} files</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex items-center gap-2 justify-center text-sm">
                      <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                      <span className="hidden sm:inline">Submit Assignment</span>
                      <span className="sm:hidden">Submit</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 justify-center text-sm">
                      <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                      <span className="hidden sm:inline">Download Materials</span>
                      <span className="sm:hidden">Download</span>
                    </Button>
                    <Button variant="outline" className="text-sm">
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <CardTitle className="text-base md:text-lg line-clamp-2">{assignment.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{assignment.subject}</Badge>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <FontAwesomeIcon icon={faCheck} className="w-3 h-3 mr-1" />
                            Submitted
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-3">{assignment.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Submitted On</p>
                      <p className="font-medium text-green-600">{assignment.submittedDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">{assignment.dueDate} at {assignment.dueTime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Marks</p>
                      <p className="font-medium">{assignment.totalMarks} points</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="text-sm">
                      <span className="hidden sm:inline">View Submission</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                    <Button variant="outline" className="text-sm">
                      <span className="hidden sm:inline">Download Feedback</span>
                      <span className="sm:hidden">Feedback</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Calendar</CardTitle>
                <CardDescription>View assignments by due date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FontAwesomeIcon icon={faCalendar} className="w-16 h-16 mb-4" />
                  <p>Calendar view coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;