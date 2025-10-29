import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Users, TrendingUp, Award, FileText } from "lucide-react";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import authClient from "@/lib/http";
import { Textarea } from "@/components/ui/textarea";

interface Exam {
  id: number;
  name: string;
  exam_type: string;
  exam_type_display: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  class_name: string;
  total_marks: number;
  passing_marks: number;
  is_published: boolean;
  total_schedules: number;
}

interface ExamSchedule {
  id: number;
  exam_name: string;
  subject_name: string;
  date: string;
  start_time: string;
  end_time: string;
  room_number: string;
  invigilator_name: string;
  max_marks: number;
  duration_minutes: number;
}

interface ExamResult {
  id: number;
  student_name: string;
  student_roll_no: string;
  exam_name: string;
  subject_name: string;
  marks_obtained: string;
  max_marks: string;
  percentage: string;
  grade: string;
  is_absent: boolean;
  passed: boolean;
}

const ExamManagement = () => {
  const [activeTab, setActiveTab] = useState("exams");
  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'exam' | 'schedule' | 'result'>('exam');
  const { toast } = useToast();

  const [examForm, setExamForm] = useState({
    name: '',
    exam_type: 'unit_test',
    academic_year: '2024-2025',
    start_date: '',
    end_date: '',
    class_assigned: '',
    total_marks: '100',
    passing_marks: '40',
    instructions: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    exam: '',
    subject: '',
    date: '',
    start_time: '',
    end_time: '',
    room: '',
    max_marks: '100',
    duration_minutes: '60',
    instructions: ''
  });

  const [resultForm, setResultForm] = useState({
    student: '',
    exam: '',
    subject: '',
    marks_obtained: '',
    max_marks: '100',
    grade: '',
    is_absent: false,
    remarks: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, schedulesRes, resultsRes, classesRes, subjectsRes, studentsRes] = await Promise.all([
        authClient.get('/api/admin/exams/'),
        authClient.get('/api/admin/exam-schedules/'),
        authClient.get('/api/admin/exam-results/'),
        authClient.get('/api/admin/classes/'),
        authClient.get('/api/admin/subjects/'),
        authClient.get('/api/admin/students/')
      ]);

      setExams(Array.isArray(examsRes.data) ? examsRes.data : examsRes.data.results || []);
      setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : schedulesRes.data.results || []);
      setResults(Array.isArray(resultsRes.data) ? resultsRes.data : resultsRes.data.results || []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.results || []);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.results || []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.results || []);
    } catch (error: any) {
      console.error('Failed to fetch exam data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch exam data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.post('/api/admin/exams/', examForm);
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
      setIsDialogOpen(false);
      fetchData();
      setExamForm({
        name: '',
        exam_type: 'unit_test',
        academic_year: '2024-2025',
        start_date: '',
        end_date: '',
        class_assigned: '',
        total_marks: '100',
        passing_marks: '40',
        instructions: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create exam",
        variant: "destructive",
      });
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.post('/api/admin/exam-schedules/', scheduleForm);
      toast({
        title: "Success",
        description: "Exam schedule created successfully",
      });
      setIsDialogOpen(false);
      fetchData();
      setScheduleForm({
        exam: '',
        subject: '',
        date: '',
        start_time: '',
        end_time: '',
        room: '',
        max_marks: '100',
        duration_minutes: '60',
        instructions: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create schedule",
        variant: "destructive",
      });
    }
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.post('/api/admin/exam-results/', resultForm);
      toast({
        title: "Success",
        description: "Exam result recorded successfully",
      });
      setIsDialogOpen(false);
      fetchData();
      setResultForm({
        student: '',
        exam: '',
        subject: '',
        marks_obtained: '',
        max_marks: '100',
        grade: '',
        is_absent: false,
        remarks: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to record result",
        variant: "destructive",
      });
    }
  };

  const openDialog = (type: 'exam' | 'schedule' | 'result') => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const getGradeBadgeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-800';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-100 text-blue-800';
    if (grade === 'C+' || grade === 'C') return 'bg-yellow-100 text-yellow-800';
    if (grade === 'D') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const sidebarItems = getAdminSidebarItems("/admin/exams");

  if (loading) {
    return (
      <DashboardLayout
        title="Exam Management"
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
      title="Exam Management"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Exam Management</h1>
            <p className="text-muted-foreground mt-1">Manage examinations, schedules, and results</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exams.length}</div>
              <p className="text-xs text-muted-foreground">
                All examinations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Papers</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
              <p className="text-xs text-muted-foreground">
                Subject papers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Results Entered</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">
                Student results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {results.length > 0 ? Math.round((results.filter(r => r.passed).length / results.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Examinations</h2>
              <Button onClick={() => openDialog('exam')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Exam
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Schedules</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell>{exam.exam_type_display}</TableCell>
                        <TableCell>{exam.class_name}</TableCell>
                        <TableCell>
                          {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{exam.total_marks}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.total_schedules} papers</Badge>
                        </TableCell>
                        <TableCell>
                          {exam.is_published ? (
                            <Badge className="bg-green-100 text-green-800">Published</Badge>
                          ) : (
                            <Badge variant="outline">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Exam Schedules</h2>
              <Button onClick={() => openDialog('schedule')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Schedule
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Invigilator</TableHead>
                      <TableHead>Max Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.exam_name}</TableCell>
                        <TableCell>{schedule.subject_name}</TableCell>
                        <TableCell>
                          <div>{new Date(schedule.date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                        </TableCell>
                        <TableCell>{schedule.duration_minutes} mins</TableCell>
                        <TableCell>{schedule.room_number || '-'}</TableCell>
                        <TableCell>{schedule.invigilator_name || '-'}</TableCell>
                        <TableCell>{schedule.max_marks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Exam Results</h2>
              <Button onClick={() => openDialog('result')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Enter Result
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="font-medium">{result.student_name}</div>
                          <div className="text-sm text-muted-foreground">{result.student_roll_no}</div>
                        </TableCell>
                        <TableCell>{result.exam_name}</TableCell>
                        <TableCell>{result.subject_name}</TableCell>
                        <TableCell>
                          {result.is_absent ? (
                            <Badge variant="destructive">Absent</Badge>
                          ) : (
                            <span className="font-mono">{result.marks_obtained}/{result.max_marks}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!result.is_absent && (
                            <span className="font-semibold">{result.percentage}%</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!result.is_absent && (
                            <Badge className={getGradeBadgeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!result.is_absent && (
                            <Badge className={result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {result.passed ? 'Pass' : 'Fail'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialogs */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {dialogType === 'exam' && 'Create New Exam'}
                {dialogType === 'schedule' && 'Add Exam Schedule'}
                {dialogType === 'result' && 'Enter Exam Result'}
              </DialogTitle>
            </DialogHeader>

            {/* Exam Form */}
            {dialogType === 'exam' && (
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam-name">Exam Name</Label>
                    <Input
                      id="exam-name"
                      value={examForm.name}
                      onChange={(e) => setExamForm({...examForm, name: e.target.value})}
                      placeholder="e.g., First Terminal Exam"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-type">Exam Type</Label>
                    <Select value={examForm.exam_type} onValueChange={(value) => setExamForm({...examForm, exam_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit_test">Unit Test</SelectItem>
                        <SelectItem value="monthly">Monthly Test</SelectItem>
                        <SelectItem value="quarterly">Quarterly Exam</SelectItem>
                        <SelectItem value="half_yearly">Half Yearly</SelectItem>
                        <SelectItem value="annual">Annual Exam</SelectItem>
                        <SelectItem value="board">Board Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select value={examForm.class_assigned} onValueChange={(value) => setExamForm({...examForm, class_assigned: value})}>
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
                    <Label htmlFor="academic-year">Academic Year</Label>
                    <Input
                      id="academic-year"
                      value={examForm.academic_year}
                      onChange={(e) => setExamForm({...examForm, academic_year: e.target.value})}
                      placeholder="2024-2025"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={examForm.start_date}
                      onChange={(e) => setExamForm({...examForm, start_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={examForm.end_date}
                      onChange={(e) => setExamForm({...examForm, end_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total-marks">Total Marks</Label>
                    <Input
                      id="total-marks"
                      type="number"
                      value={examForm.total_marks}
                      onChange={(e) => setExamForm({...examForm, total_marks: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passing-marks">Passing Marks</Label>
                    <Input
                      id="passing-marks"
                      type="number"
                      value={examForm.passing_marks}
                      onChange={(e) => setExamForm({...examForm, passing_marks: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    value={examForm.instructions}
                    onChange={(e) => setExamForm({...examForm, instructions: e.target.value})}
                    placeholder="Special instructions for this exam..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Exam</Button>
                </DialogFooter>
              </form>
            )}

            {/* Schedule Form */}
            {dialogType === 'schedule' && (
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-exam">Exam</Label>
                    <Select value={scheduleForm.exam} onValueChange={(value) => setScheduleForm({...scheduleForm, exam: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id.toString()}>
                            {exam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule-subject">Subject</Label>
                    <Select value={scheduleForm.subject} onValueChange={(value) => setScheduleForm({...scheduleForm, subject: value})}>
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
                    <Label htmlFor="schedule-date">Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={scheduleForm.duration_minutes}
                      onChange={(e) => setScheduleForm({...scheduleForm, duration_minutes: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={scheduleForm.start_time}
                      onChange={(e) => setScheduleForm({...scheduleForm, start_time: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm({...scheduleForm, end_time: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-marks">Max Marks</Label>
                    <Input
                      id="max-marks"
                      type="number"
                      value={scheduleForm.max_marks}
                      onChange={(e) => setScheduleForm({...scheduleForm, max_marks: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room">Room (Optional)</Label>
                    <Input
                      id="room"
                      value={scheduleForm.room}
                      onChange={(e) => setScheduleForm({...scheduleForm, room: e.target.value})}
                      placeholder="Room number"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Schedule</Button>
                </DialogFooter>
              </form>
            )}

            {/* Result Form */}
            {dialogType === 'result' && (
              <form onSubmit={handleCreateResult} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="result-student">Student</Label>
                    <Select value={resultForm.student} onValueChange={(value) => setResultForm({...resultForm, student: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.user.first_name} {student.user.last_name} ({student.roll_no})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="result-exam">Exam</Label>
                    <Select value={resultForm.exam} onValueChange={(value) => setResultForm({...resultForm, exam: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id.toString()}>
                            {exam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="result-subject">Subject</Label>
                    <Select value={resultForm.subject} onValueChange={(value) => setResultForm({...resultForm, subject: value})}>
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
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={resultForm.grade}
                      onChange={(e) => setResultForm({...resultForm, grade: e.target.value})}
                      placeholder="e.g., A, B+, C"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marks-obtained">Marks Obtained</Label>
                    <Input
                      id="marks-obtained"
                      type="number"
                      step="0.1"
                      value={resultForm.marks_obtained}
                      onChange={(e) => setResultForm({...resultForm, marks_obtained: e.target.value})}
                      disabled={resultForm.is_absent}
                      required={!resultForm.is_absent}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="result-max-marks">Max Marks</Label>
                    <Input
                      id="result-max-marks"
                      type="number"
                      value={resultForm.max_marks}
                      onChange={(e) => setResultForm({...resultForm, max_marks: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-absent"
                    checked={resultForm.is_absent}
                    onChange={(e) => setResultForm({...resultForm, is_absent: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="is-absent" className="cursor-pointer">
                    Mark as Absent
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    value={resultForm.remarks}
                    onChange={(e) => setResultForm({...resultForm, remarks: e.target.value})}
                    placeholder="Additional remarks..."
                    rows={2}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Result</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ExamManagement;
