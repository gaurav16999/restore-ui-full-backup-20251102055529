import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { 
  faChartBar, faUsers, faChalkboardTeacher, faCalculator, faUserCheck, 
  faTrophy, faFileText, faPlus, faSearch, faEdit, faTrash, faFilter,
  faChartLine, faBook, faAward
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { getGrades, getGradeStats, createGrade, updateGrade, deleteGrade, getStudents, getSubjects } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

const GradesWithDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGradeType, setSelectedGradeType] = useState("all");
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [deleteGradeId, setDeleteGradeId] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    grade_type: '',
    score: '',
    max_score: '',
    comments: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        toast({
          title: "Error",
          description: "You must be logged in to access grades",
          variant: "destructive",
        });
        return;
      }

      const [gradesData, statsData, studentsData, subjectsData] = await Promise.all([
        getGrades(accessToken),
        getGradeStats(accessToken),
        getStudents(),
        getSubjects()
      ]);

      // Handle pagination - check if data is array or paginated response
      const gradesArray = Array.isArray(gradesData) ? gradesData : (gradesData?.results || []);
      const studentsArray = Array.isArray(studentsData) ? studentsData : (studentsData?.results || []);
      const subjectsArray = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.results || []);

      setGrades(gradesArray);
      setStats(statsData);
      setStudents(studentsArray);
      setSubjects(subjectsArray);
    } catch (error: any) {
      console.error('Failed to fetch grades:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grades data",
        variant: "destructive",
      });
      // Set empty arrays on error
      setGrades([]);
      setStudents([]);
      setSubjects([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "Error",
          description: "You must be logged in to manage grades",
          variant: "destructive",
        });
        return;
      }

      const gradeData = {
        student: parseInt(formData.student),
        subject: parseInt(formData.subject),
        grade_type: formData.grade_type,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        comments: formData.comments
      };

      if (editingGrade) {
        await updateGrade(accessToken, editingGrade.id, gradeData);
        toast({
          title: "Success",
          description: "Grade updated successfully",
        });
      } else {
        await createGrade(accessToken, gradeData);
        toast({
          title: "Success",
          description: "Grade added successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingGrade(null);
      setFormData({
        student: '',
        subject: '',
        grade_type: '',
        score: '',
        max_score: '',
        comments: ''
      });
      fetchData();
    } catch (error: any) {
      console.error('Failed to save grade:', error);
      toast({
        title: "Error",
        description: "Failed to save grade",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (grade: any) => {
    setEditingGrade(grade);
    setFormData({
      student: grade.student.toString(),
      subject: grade.subject.toString(),
      grade_type: grade.grade_type,
      score: grade.score.toString(),
      max_score: grade.max_score.toString(),
      comments: grade.comments || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "Error",
          description: "You must be logged in to manage grades",
          variant: "destructive",
        });
        return;
      }

      await deleteGrade(accessToken, id);
      toast({
        title: "Success",
        description: "Grade deleted successfully",
      });
      setDeleteGradeId(null);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete grade:', error);
      toast({
        title: "Error",
        description: "Failed to delete grade",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setEditingGrade(null);
    setFormData({
      student: '',
      subject: '',
      grade_type: '',
      score: '',
      max_score: '',
      comments: ''
    });
    setIsDialogOpen(true);
  };

  // Filter grades based on search and filters
  const filteredGrades = Array.isArray(grades) ? grades.filter(grade => {
    const matchesSearch = 
      grade.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.grade_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === "all" || grade.subject.toString() === selectedSubject;
    const matchesGradeType = selectedGradeType === "all" || grade.grade_type?.toLowerCase() === selectedGradeType.toLowerCase();
    
    return matchesSearch && matchesSubject && matchesGradeType;
  }) : [];

  const sidebarItems = getAdminSidebarItems("/admin/grades");

  if (loading) {
    return (
      <DashboardLayout
        title="Grade Management"
        userName="Admin User"
        userRole="Administrator"
        sidebarItems={sidebarItems}
      >
        <div className="text-center py-8">Loading grades...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Grade Management"
      userName="Admin User"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Grade Management</h1>
            <p className="text-muted-foreground mt-1">Manage student grades and assessments</p>
          </div>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            Add Grade
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
                <FontAwesomeIcon icon={faCalculator} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_grades}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.grades_this_month} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_score}%</div>
                <p className="text-xs text-muted-foreground">
                  Class performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <FontAwesomeIcon icon={faAward} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.students_above_80}</div>
                <p className="text-xs text-muted-foreground">
                  Students above 80%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <FontAwesomeIcon icon={faBook} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_subjects}</div>
                <p className="text-xs text-muted-foreground">
                  Active subjects
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by student, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-filter">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject: any) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade-type-filter">Grade Type</Label>
                <Select value={selectedGradeType} onValueChange={setSelectedGradeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Homework">Homework</SelectItem>
                    <SelectItem value="Midterm">Midterm</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Participation">Participation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("all");
                    setSelectedGradeType("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grades ({filteredGrades.length})</CardTitle>
            <CardDescription>
              {filteredGrades.length === grades.length 
                ? `Showing all ${grades.length} grades`
                : `Showing ${filteredGrades.length} of ${grades.length} grades`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">
                      {grade.student_name}
                      <div className="text-sm text-muted-foreground">
                        Roll: {grade.student_roll_no}
                      </div>
                    </TableCell>
                    <TableCell>{grade.subject_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {grade.grade_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grade.score}/{grade.max_score}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          grade.percentage >= 80 ? 'text-green-600' :
                          grade.percentage >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {grade.percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${
                          grade.letter_grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade.letter_grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          grade.letter_grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {grade.letter_grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(grade.date_created).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(grade)}
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteGradeId(grade.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Grade Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingGrade ? 'Edit Grade' : 'Add New Grade'}</DialogTitle>
              <DialogDescription>
                {editingGrade ? 'Update the grade information below.' : 'Enter the grade details below.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select 
                    value={formData.student} 
                    onValueChange={(value) => setFormData({...formData, student: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.first_name} {student.last_name} ({student.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData({...formData, subject: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade_type">Grade Type</Label>
                <Select 
                  value={formData.grade_type} 
                  onValueChange={(value) => setFormData({...formData, grade_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Homework">Homework</SelectItem>
                    <SelectItem value="Midterm">Midterm</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Participation">Participation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.score}
                    onChange={(e) => setFormData({...formData, score: e.target.value})}
                    placeholder="Enter score"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_score">Max Score</Label>
                  <Input
                    id="max_score"
                    type="number"
                    min="1"
                    step="0.1"
                    value={formData.max_score}
                    onChange={(e) => setFormData({...formData, max_score: e.target.value})}
                    placeholder="Enter max score"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  placeholder="Add any comments about this grade..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingGrade ? 'Update Grade' : 'Add Grade')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteGradeId !== null} onOpenChange={() => setDeleteGradeId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the grade record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteGradeId && handleDelete(deleteGradeId)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default GradesWithDashboard;