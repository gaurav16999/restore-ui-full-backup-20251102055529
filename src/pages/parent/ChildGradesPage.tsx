import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, TrendingUp, Calendar, Download } from 'lucide-react';
import { parentAPI, GradesResponse, Grade } from '@/services/parentApi';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChildGradesPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gradesData, setGradesData] = useState<GradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  useEffect(() => {
    if (childId) {
      fetchGrades();
    }
  }, [childId, selectedSubject, selectedSemester]);

  const fetchGrades = async () => {
    if (!childId) return;
    
    setLoading(true);
    try {
      const data = await parentAPI.getChildGrades(
        parseInt(childId),
        selectedSubject !== 'all' ? selectedSubject : undefined,
        selectedSemester !== 'all' ? selectedSemester : undefined
      );
      setGradesData(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch grades data'
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadgeVariant = (percentage: number): 'default' | 'secondary' | 'destructive' => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const exportToPDF = () => {
    toast({
      title: 'Export Started',
      description: 'Generating grades report...'
    });
  };

  const prepareChartData = () => {
    if (!gradesData) return [];

    return gradesData.grades
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(grade => ({
        date: new Date(grade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        percentage: grade.grade_percentage,
        subject: grade.subject.title,
      }));
  };

  const getSubjects = (): string[] => {
    if (!gradesData) return [];
    const subjects = new Set(gradesData.grades.map(g => g.subject.title));
    return Array.from(subjects);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!gradesData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Unable to load grades data</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { student_info, grades, average_percentage } = gradesData;
  const subjects = getSubjects();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Academic Grades</h1>
          <p className="text-muted-foreground">
            {student_info.name} - Class {student_info.class}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Grade</CardDescription>
            <CardTitle className={`text-4xl ${getGradeColor(average_percentage)}`}>
              {average_percentage.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={average_percentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Grades</CardDescription>
            <CardTitle className="text-4xl">{grades.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Subjects</CardDescription>
            <CardTitle className="text-4xl">{subjects.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Grade Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Trend
          </CardTitle>
          <CardDescription>Grade progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Grade %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grade Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grades.map((grade) => (
          <Card key={grade.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{grade.subject.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(grade.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </CardDescription>
                </div>
                <Badge variant={getGradeBadgeVariant(grade.grade_percentage)}>
                  {grade.grade_letter}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Percentage</span>
                    <span className={`font-bold ${getGradeColor(grade.grade_percentage)}`}>
                      {grade.grade_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={grade.grade_percentage} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Marks</span>
                  <span className="font-medium">
                    {grade.marks_obtained} / {grade.total_marks}
                  </span>
                </div>

                {grade.exam_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Exam Date</span>
                    <span className="font-medium">
                      {new Date(grade.exam_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {grade.remarks && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <div className="text-muted-foreground mb-1">Remarks:</div>
                    <div className="text-gray-700">{grade.remarks}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Performance Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {grades.slice(0, 5).map((grade) => (
              <div
                key={grade.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${getGradeColor(grade.grade_percentage)}`}>
                    {grade.grade_letter}
                  </div>
                  <div>
                    <div className="font-medium">{grade.subject.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(grade.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getGradeColor(grade.grade_percentage)}`}>
                    {grade.grade_percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {grade.marks_obtained}/{grade.total_marks}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildGradesPage;
