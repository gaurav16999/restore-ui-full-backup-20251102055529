import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import authClient from '@/lib/http';
import { 
  BarChart, TrendingUp, Users, DollarSign, Calendar,
  Download, FileText, Search, RefreshCw, Award, BookOpen
} from 'lucide-react';

interface StudentPerformance {
  student: {
    id: number;
    name: string;
    email: string;
    class: string;
    roll_number: string;
  };
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  overall_performance: {
    average_marks: number;
    class_average: number;
    rank: number;
    total_students: number;
    percentile: number;
  };
  subject_performance: Array<{
    subject_id: number;
    subject_name: string;
    average_marks: number;
    class_average: number;
    difference: number;
    total_assessments: number;
    highest_marks: number;
    lowest_marks: number;
  }>;
  exam_results: Array<{
    exam_id: number;
    exam_name: string;
    exam_date: string;
    subject_name: string;
    marks_obtained: number;
    total_marks: number;
    percentage: number;
    grade: string;
  }>;
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    percentage: number;
  };
  assignment_completion: {
    total_assignments: number;
    submitted: number;
    completion_rate: number;
  };
}

interface ClassAnalytics {
  class: {
    id: number;
    name: string;
    total_students: number;
  };
  overall_statistics: {
    average_marks: number;
    highest_marks: number;
    lowest_marks: number;
    total_assessments: number;
    attendance_rate: number;
  };
  subject_statistics: Array<{
    subject_id: number;
    subject_name: string;
    average_marks: number;
    total_assessments: number;
    highest_marks: number;
    lowest_marks: number;
    grade_distribution: {
      excellent: number;
      good: number;
      average: number;
      below_average: number;
    };
  }>;
  top_performers: Array<{
    student_id: number;
    student_name: string;
    average_marks: number;
  }>;
  below_average_students: Array<{
    student_id: number;
    student_name: string;
    average_marks: number;
  }>;
  grade_distribution: {
    excellent: number;
    good: number;
    average: number;
    below_average: number;
  };
}

interface Student {
  id: number;
  user: {
    first_name: string;
    last_name: string;
  };
}

interface ClassRoom {
  id: number;
  name: string;
}

export default function AdvancedReports() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('year');
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance | null>(null);
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch students
      const studentsRes = await authClient.get('/api/admin/students/');
      setStudents(studentsRes.data.results || studentsRes.data);

      // Fetch classes
      const classesRes = await authClient.get('/api/admin/classrooms/');
      setClasses(classesRes.data.results || classesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load data');
    }
  };

  const fetchStudentPerformance = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    setLoading(true);
    try {
      const response = await authClient.get(
        `/api/admin/advanced-reports/student_performance/?student_id=${selectedStudent}&period=${selectedPeriod}`
      );
      setStudentPerformance(response.data);
      toast.success('Student performance report loaded');
    } catch (error: any) {
      console.error('Error fetching student performance:', error);
      toast.error(error.response?.data?.error || 'Failed to load student performance');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassAnalytics = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    setLoading(true);
    try {
      const response = await authClient.get(
        `/api/admin/advanced-reports/class_analytics/?class_id=${selectedClass}`
      );
      setClassAnalytics(response.data);
      toast.success('Class analytics loaded');
    } catch (error: any) {
      console.error('Error fetching class analytics:', error);
      toast.error(error.response?.data?.error || 'Failed to load class analytics');
    } finally {
      setLoading(false);
    }
  };

  const getGradeBadgeColor = (average: number) => {
    if (average >= 90) return 'bg-green-500';
    if (average >= 75) return 'bg-blue-500';
    if (average >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceColor = (difference: number) => {
    if (difference > 10) return 'text-green-600';
    if (difference > 0) return 'text-blue-600';
    if (difference > -10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive performance tracking and insights
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="student" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="student">Student Performance</TabsTrigger>
          <TabsTrigger value="class">Class Analytics</TabsTrigger>
          <TabsTrigger value="attendance">Attendance & Fees</TabsTrigger>
        </TabsList>

        {/* Student Performance Tab */}
        <TabsContent value="student" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Student Report</CardTitle>
              <CardDescription>Select a student and period to view detailed performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Select Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.user.first_name} {student.user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="semester">This Semester</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchStudentPerformance} disabled={loading} className="w-full">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Performance Results */}
          {studentPerformance && (
            <>
              {/* Student Info & Overall Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {studentPerformance.overall_performance.average_marks.toFixed(2)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Class avg: {studentPerformance.overall_performance.class_average.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      #{studentPerformance.overall_performance.rank}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {studentPerformance.overall_performance.total_students} students
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Percentile</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {studentPerformance.overall_performance.percentile.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Performance ranking
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {studentPerformance.attendance.percentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {studentPerformance.attendance.present_days} / {studentPerformance.attendance.total_days} days
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                  <CardDescription>Detailed breakdown by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-right">Student Avg</TableHead>
                        <TableHead className="text-right">Class Avg</TableHead>
                        <TableHead className="text-right">Difference</TableHead>
                        <TableHead className="text-right">Assessments</TableHead>
                        <TableHead>Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentPerformance.subject_performance.map((subject) => (
                        <TableRow key={subject.subject_id}>
                          <TableCell className="font-medium">{subject.subject_name}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={getGradeBadgeColor(subject.average_marks)}>
                              {subject.average_marks.toFixed(2)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{subject.class_average.toFixed(2)}%</TableCell>
                          <TableCell className={`text-right font-semibold ${getPerformanceColor(subject.difference)}`}>
                            {subject.difference > 0 ? '+' : ''}{subject.difference.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">{subject.total_assessments}</TableCell>
                          <TableCell>
                            <Progress 
                              value={subject.average_marks} 
                              className="w-[60px]"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Exam Results */}
              {studentPerformance.exam_results.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Exam Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Marks</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentPerformance.exam_results.map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{result.exam_name}</TableCell>
                            <TableCell>{result.subject_name}</TableCell>
                            <TableCell>{new Date(result.exam_date).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              {result.marks_obtained} / {result.total_marks}
                            </TableCell>
                            <TableCell className="text-right">{result.percentage.toFixed(2)}%</TableCell>
                            <TableCell>
                              <Badge className={getGradeBadgeColor(result.percentage)}>
                                {result.grade || 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Assignment Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold">
                          {studentPerformance.assignment_completion.submitted} / {studentPerformance.assignment_completion.total_assignments}
                        </div>
                        <p className="text-sm text-muted-foreground">Assignments Submitted</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {studentPerformance.assignment_completion.completion_rate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                      </div>
                    </div>
                    <Progress value={studentPerformance.assignment_completion.completion_rate} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Class Analytics Tab */}
        <TabsContent value="class" className="space-y-4">
          {/* Class Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Class Performance Analysis</CardTitle>
              <CardDescription>View comprehensive class-wide statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class" />
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
                <div className="flex items-end">
                  <Button onClick={fetchClassAnalytics} disabled={loading} className="w-full">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart className="h-4 w-4 mr-2" />}
                    Analyze Class
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Analytics Results */}
          {classAnalytics && (
            <>
              {/* Overall Statistics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {classAnalytics.overall_statistics.average_marks.toFixed(2)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {classAnalytics.class.total_students} students
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {classAnalytics.overall_statistics.highest_marks}%
                    </div>
                    <p className="text-xs text-muted-foreground">Best performance</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {classAnalytics.overall_statistics.attendance_rate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Class attendance</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assessments</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {classAnalytics.overall_statistics.total_assessments}
                    </div>
                    <p className="text-xs text-muted-foreground">Total conducted</p>
                  </CardContent>
                </Card>
              </div>

              {/* Grade Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Student performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {classAnalytics.grade_distribution.excellent}
                      </div>
                      <p className="text-sm text-muted-foreground">Excellent (90+)</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {classAnalytics.grade_distribution.good}
                      </div>
                      <p className="text-sm text-muted-foreground">Good (75-89)</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {classAnalytics.grade_distribution.average}
                      </div>
                      <p className="text-sm text-muted-foreground">Average (60-74)</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {classAnalytics.grade_distribution.below_average}
                      </div>
                      <p className="text-sm text-muted-foreground">Below Avg (&lt;60)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="text-right">Average Marks</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classAnalytics.top_performers.map((student, idx) => (
                        <TableRow key={student.student_id}>
                          <TableCell className="font-bold">#{idx + 1}</TableCell>
                          <TableCell className="font-medium">{student.student_name}</TableCell>
                          <TableCell className="text-right">{student.average_marks.toFixed(2)}%</TableCell>
                          <TableCell>
                            <Badge className={getGradeBadgeColor(student.average_marks)}>
                              {student.average_marks >= 90 ? 'A+' : student.average_marks >= 75 ? 'A' : 'B'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Subject Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-right">Average</TableHead>
                        <TableHead className="text-right">Highest</TableHead>
                        <TableHead className="text-right">Lowest</TableHead>
                        <TableHead className="text-right">Assessments</TableHead>
                        <TableHead>Distribution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classAnalytics.subject_statistics.map((subject) => (
                        <TableRow key={subject.subject_id}>
                          <TableCell className="font-medium">{subject.subject_name}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={getGradeBadgeColor(subject.average_marks)}>
                              {subject.average_marks.toFixed(2)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{subject.highest_marks}%</TableCell>
                          <TableCell className="text-right">{subject.lowest_marks}%</TableCell>
                          <TableCell className="text-right">{subject.total_assessments}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <div className="text-xs text-green-600">E:{subject.grade_distribution.excellent}</div>
                              <div className="text-xs text-blue-600">G:{subject.grade_distribution.good}</div>
                              <div className="text-xs text-yellow-600">A:{subject.grade_distribution.average}</div>
                              <div className="text-xs text-red-600">B:{subject.grade_distribution.below_average}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Below Average Students Alert */}
              {classAnalytics.below_average_students.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">Students Requiring Attention</CardTitle>
                    <CardDescription>Below 60% average - {classAnalytics.below_average_students.length} students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {classAnalytics.below_average_students.map((student) => (
                        <div key={student.student_id} className="p-2 bg-white rounded border border-red-200">
                          <div className="font-medium text-sm">{student.student_name}</div>
                          <div className="text-xs text-red-600">{student.average_marks.toFixed(2)}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Attendance & Fees Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance & Fee Reports</CardTitle>
              <CardDescription>Coming soon - Attendance summary and fee collection reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p>Attendance and fee reports will be available soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
