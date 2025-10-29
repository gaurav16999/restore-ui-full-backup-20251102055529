import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import authClient from "@/lib/http";
import { Textarea } from "@/components/ui/textarea";

interface Assignment {
  id: number;
  title: string;
  description: string;
  assignment_type: string;
  subject_name: string;
  class_name: string;
  teacher_name: string;
  assigned_date: string;
  due_date: string;
  max_marks: number;
  status: string;
  total_submissions: number;
  pending_submissions: number;
}

interface Submission {
  id: number;
  assignment_title: string;
  student_name: string;
  student_roll_no: string;
  submission_date: string;
  status: string;
  status_display: string;
  marks_obtained: string;
  is_late: boolean;
  feedback: string;
}

const AssignmentManagement = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const { toast } = useToast();

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    assignment_type: 'homework',
    subject: '',
    class_assigned: '',
    teacher: '',
    due_date: '',
    max_marks: '10',
    instructions: '',
    attachment_url: ''
  });

  const [gradeForm, setGradeForm] = useState({
    marks_obtained: '',
    feedback: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, submissionsRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        authClient.get('/api/admin/assignments/'),
        authClient.get('/api/admin/assignment-submissions/'),
        authClient.get('/api/admin/classes/'),
        authClient.get('/api/admin/subjects/'),
        authClient.get('/api/admin/teachers/')
      ]);

      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : assignmentsRes.data.results || []);
      setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : submissionsRes.data.results || []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.results || []);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.results || []);
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : teachersRes.data.results || []);
    } catch (error: any) {
      console.error('Failed to fetch assignment data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assignment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.post('/api/admin/assignments/', assignmentForm);
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      setIsDialogOpen(false);
      fetchData();
      setAssignmentForm({
        title: '',
        description: '',
        assignment_type: 'homework',
        subject: '',
        class_assigned: '',
        teacher: '',
        due_date: '',
        max_marks: '10',
        instructions: '',
        attachment_url: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      await authClient.post(`/api/admin/assignment-submissions/${selectedSubmission.id}/grade/`, gradeForm);
      toast({
        title: "Success",
        description: "Submission graded successfully",
      });
      setIsGradeDialogOpen(false);
      setSelectedSubmission(null);
      fetchData();
      setGradeForm({ marks_obtained: '', feedback: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to grade submission",
        variant: "destructive",
      });
    }
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      marks_obtained: submission.marks_obtained || '',
      feedback: submission.feedback || ''
    });
    setIsGradeDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
      late: "bg-orange-100 text-orange-800",
      graded: "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const sidebarItems = getAdminSidebarItems("/admin/assignments");

  if (loading) {
    return (
      <DashboardLayout
        title="Assignment Management"
        userName="Admin"
        userRole="Administrator"
        sidebarItems={sidebarItems}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Assignment Management"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assignment Management</h1>
            <p className="text-muted-foreground mt-1">Manage homework, projects, and assignments</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Assignment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">
                All assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.filter(s => s.status !== 'pending').length}</div>
              <p className="text-xs text-muted-foreground">
                Total submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {submissions.filter(s => s.status === 'submitted' || s.status === 'late').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Needs grading
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Submissions</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {submissions.filter(s => s.is_late).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Past deadline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Assignments</CardTitle>
                <CardDescription>Manage homework, projects, and other assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {assignment.assignment_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignment.subject_name}</TableCell>
                        <TableCell>{assignment.class_name}</TableCell>
                        <TableCell className="text-sm">{assignment.teacher_name}</TableCell>
                        <TableCell>
                          {new Date(assignment.due_date).toLocaleDateString()}
                          {new Date(assignment.due_date) < new Date() && (
                            <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{assignment.total_submissions}</span>
                            {assignment.pending_submissions > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {assignment.pending_submissions} pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={assignment.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>Review and grade student work</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id} className={submission.is_late ? 'bg-orange-50' : ''}>
                        <TableCell>
                          <div className="font-medium">{submission.student_name}</div>
                          <div className="text-sm text-muted-foreground">{submission.student_roll_no}</div>
                        </TableCell>
                        <TableCell className="font-medium">{submission.assignment_title}</TableCell>
                        <TableCell>
                          {new Date(submission.submission_date).toLocaleDateString()}
                          {submission.is_late && (
                            <Badge variant="destructive" className="ml-2 text-xs">Late</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.marks_obtained ? (
                            <span className="font-mono font-semibold">{submission.marks_obtained}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(submission.status)}>
                            {submission.status_display}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openGradeDialog(submission)}
                            disabled={submission.status === 'pending'}
                          >
                            {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Assignment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create a new homework, project, or assignment for students
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                    placeholder="e.g., Chapter 5 Exercises"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                    placeholder="Describe the assignment..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignment-type">Type</Label>
                  <Select value={assignmentForm.assignment_type} onValueChange={(value) => setAssignmentForm({...assignmentForm, assignment_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">Homework</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="practical">Practical Work</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={assignmentForm.subject} onValueChange={(value) => setAssignmentForm({...assignmentForm, subject: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={assignmentForm.class_assigned} onValueChange={(value) => setAssignmentForm({...assignmentForm, class_assigned: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select value={assignmentForm.teacher} onValueChange={(value) => setAssignmentForm({...assignmentForm, teacher: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.user ? `${teacher.user.first_name} ${teacher.user.last_name}` : `Teacher ${teacher.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-marks">Max Marks</Label>
                  <Input
                    id="max-marks"
                    type="number"
                    value={assignmentForm.max_marks}
                    onChange={(e) => setAssignmentForm({...assignmentForm, max_marks: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    value={assignmentForm.instructions}
                    onChange={(e) => setAssignmentForm({...assignmentForm, instructions: e.target.value})}
                    placeholder="Additional instructions..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Assignment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Grade Submission Dialog */}
        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
              <DialogDescription>
                {selectedSubmission && `${selectedSubmission.student_name} - ${selectedSubmission.assignment_title}`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marks">Marks Obtained</Label>
                <Input
                  id="marks"
                  type="number"
                  step="0.1"
                  value={gradeForm.marks_obtained}
                  onChange={(e) => setGradeForm({...gradeForm, marks_obtained: e.target.value})}
                  placeholder="Enter marks"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                  placeholder="Provide feedback to the student..."
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Grade</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentManagement;
