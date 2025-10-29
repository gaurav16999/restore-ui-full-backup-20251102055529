import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faChalkboardTeacher, 
  faCalendarAlt, 
  faDollarSign, 
  faChartBar, 
  faCog, 
  faFileText, 
  faUserCog, 
  faClipboardList, 
  faTrophy,
  faBookOpen,
  faAward
} from "@fortawesome/free-solid-svg-icons";
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

const AdminGrades = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGradeType, setSelectedGradeType] = useState("all");
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    grade_type: 'Assignment',
    score: '',
    max_score: '100',
    notes: '',
    date_recorded: new Date().toISOString().split('T')[0]
  });

  const gradeTypes = ['Assignment', 'Quiz', 'Test', 'Project', 'Homework', 'Midterm', 'Final', 'Participation'];

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
        getStudents(accessToken),
        getSubjects(accessToken)
      ]);

      setGrades(gradesData);
      setStats(statsData);
      setStudents(studentsData);
      setSubjects(subjectsData);
    } catch (error: any) {
      console.error('Failed to fetch grades:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grades data",
        variant: "destructive",
      });
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
        ...formData,
        student_id: parseInt(formData.student_id),
        subject_id: parseInt(formData.subject_id),
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score)
      };

      if (isEditMode && editingGradeId) {
        await updateGrade(accessToken, editingGradeId, gradeData);
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
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save grade",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (grade: any) => {
    setIsEditMode(true);
    setEditingGradeId(grade.id);
    setFormData({
      student_id: grade.student_id.toString(),
      subject_id: grade.subject_id.toString(),
      grade_type: grade.grade_type,
      score: grade.score.toString(),
      max_score: grade.max_score.toString(),
      notes: grade.notes || '',
      date_recorded: grade.date_recorded
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!gradeToDelete) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "Error",
          description: "You must be logged in to delete grades",
          variant: "destructive",
        });
        return;
      }

      await deleteGrade(accessToken, gradeToDelete);
      toast({
        title: "Success",
        description: "Grade deleted successfully",
      });
      
      setDeleteDialogOpen(false);
      setGradeToDelete(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grade",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (gradeId: number) => {
    setGradeToDelete(gradeId);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingGradeId(null);
    setFormData({
      student_id: '',
      subject_id: '',
      grade_type: 'Assignment',
      score: '',
      max_score: '100',
      notes: '',
      date_recorded: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
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

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         grade.subject_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || grade.subject_name === selectedSubject;
    const matchesGradeType = selectedGradeType === "all" || grade.grade_type === selectedGradeType;
    
    return matchesSearch && matchesSubject && matchesGradeType;
  });

  const sidebarItems = getAdminSidebarItems("/admin/grades");

  return (
    <DashboardLayout
      title="Grade Management"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
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
            <Plus className="w-4 h-4" />
            Add Grade
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
                <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_grades}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.grades_this_week}+ this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                <FontAwesomeIcon icon={faChartBar} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.class_average}%</div>
                <p className="text-xs text-muted-foreground">
                  Grade {getLetterGrade(stats.class_average)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <FontAwesomeIcon icon={faAward} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.top_performers}</div>
                <p className="text-xs text-muted-foreground">
                  Students with A grade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <FontAwesomeIcon icon={faFileText} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_grades}</div>
                <p className="text-xs text-muted-foreground">
                  Pending grading
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Grades Overview</CardTitle>
            <CardDescription>View and manage all student grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.title}>
                      {subject.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedGradeType} onValueChange={setSelectedGradeType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {gradeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading grades...
                      </TableCell>
                    </TableRow>
                  ) : filteredGrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No grades found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrades.map((grade) => {
                      const percentage = Math.round((grade.score / grade.max_score) * 100);
                      return (
                        <TableRow key={grade.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{grade.student_name}</div>
                              <div className="text-sm text-muted-foreground">{grade.student_roll_no}</div>
                            </div>
                          </TableCell>
                          <TableCell>{grade.subject_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{grade.grade_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono">
                              {grade.score}/{grade.max_score}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(percentage)}`}>
                              {percentage}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-bold ${getGradeColor(percentage)}`}>
                              {getLetterGrade(percentage)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(grade.date_recorded).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(grade)} title="Edit Grade">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(grade.id)} title="Delete Grade">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Grade Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Grade' : 'Add New Grade'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update the grade information' : 'Enter grade details for the student'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select value={formData.student_id} onValueChange={(value) => setFormData({ ...formData, student_id: value })}>
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
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade_type">Grade Type</Label>
                <Select value={formData.grade_type} onValueChange={(value) => setFormData({ ...formData, grade_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 85"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_score">Max Score</Label>
                  <Input
                    id="max_score"
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="e.g., 100"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_recorded">Date</Label>
                <Input
                  id="date_recorded"
                  type="date"
                  value={formData.date_recorded}
                  onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this grade..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Grade' : 'Add Grade')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the grade record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminGrades;