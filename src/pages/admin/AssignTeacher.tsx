import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserTie, 
  faPlus, 
  faSearch, 
  faTrash, 
  faChalkboardTeacher, 
  faBook, 
  faUsers,
  faCheckCircle
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminTeacherAssignments,
  createAdminTeacherAssignment,
  deleteAdminTeacherAssignment,
  getAdminTeacherAssignmentStats,
  getTeachers,
  getClasses,
  getSubjects
} from "@/lib/api";
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
import { Input } from "@/components/ui/input";

export default function AssignTeacher() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    teacher: '',
    class_assigned: '',
    subject: ''
  });

  const fetchData = async () => {
    try {
      setError("");
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      const [assignmentsData, statsData, teachersData, classesData, subjectsData] = await Promise.all([
        getAdminTeacherAssignments(),
        getAdminTeacherAssignmentStats(),
        getTeachers(),
        getClasses(), // legacy Class model used by Classes & Subjects page
        getSubjects()
      ]);

      console.log('Assignments data:', assignmentsData);
      console.log('Stats:', statsData);

      // Handle paginated responses
      const assignmentsArray = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.results || []);
      const teachersArray = Array.isArray(teachersData) ? teachersData : (teachersData?.results || []);
      const classesArray = Array.isArray(classesData) ? classesData : (classesData?.results || []);
      const subjectsArray = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.results || []);

  setAssignments(assignmentsArray);
  setTeachers(teachersArray);
  setClasses(classesArray);
      setSubjects(subjectsArray);
      setStats(statsData || {
        total_assignments: 0,
        teachers_assigned: 0,
        classes_covered: 0,
        subjects_covered: 0
      });
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError(error.message || "Failed to fetch data");
      toast({
        title: "Error",
        description: "Failed to fetch assignments data",
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
      // Convert string IDs to integers for the API
      const payload = {
        teacher: parseInt(formData.teacher),
        class_assigned: parseInt(formData.class_assigned),
        subject: parseInt(formData.subject)
      };

      console.log('Submitting payload:', payload);
      
      await createAdminTeacherAssignment(payload);
      
      toast({
        title: "Success",
        description: "Teacher assigned successfully",
      });

      setIsDialogOpen(false);
      setFormData({
        teacher: '',
        class_assigned: '',
        subject: ''
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Failed to assign teacher:', error);
      console.error('Error details:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.error || error.response?.data?.non_field_errors?.[0] || error.message || "Failed to assign teacher",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      await deleteAdminTeacherAssignment(assignmentToDelete);
      
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });

      setIsDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarItems = getAdminSidebarItems("/admin/assign-teacher");

  if (loading) {
    return (
      <DashboardLayout
        title="Assign Teachers"
        userName="Admin"
        userRole="School Administrator"
        sidebarItems={sidebarItems}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading assignments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Assign Teachers"
        userName="Admin"
        userRole="School Administrator"
        sidebarItems={sidebarItems}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-destructive">
            <p className="text-lg font-semibold">Error Loading Data</p>
            <p className="mt-2">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Assign Teachers"
      userName="Admin"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assign Teachers</h1>
            <p className="text-muted-foreground mt-1">Manage teacher assignments to classes and subjects</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Assignment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_assignments || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers Assigned</CardTitle>
              <FontAwesomeIcon icon={faUserTie} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teachers_assigned || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes Covered</CardTitle>
              <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classes_covered || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects Covered</CardTitle>
              <FontAwesomeIcon icon={faBook} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subjects_covered || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Assignments</CardTitle>
            <CardDescription>View and manage all teacher assignments</CardDescription>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1 max-w-sm">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by teacher, class, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {searchTerm ? "No assignments found matching your search" : "No teacher assignments yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.teacher_name}</TableCell>
                      <TableCell>{assignment.teacher_employee_id || 'N/A'}</TableCell>
                      <TableCell>{assignment.class_name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.subject_title}</div>
                          <div className="text-sm text-muted-foreground">{assignment.subject_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(assignment.assigned_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.is_active ? "default" : "secondary"}>
                          {assignment.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setAssignmentToDelete(assignment.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Assignment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Assign Teacher</DialogTitle>
              <DialogDescription>
                Assign a teacher to a class and subject
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher *</Label>
                  <Select
                    value={formData.teacher}
                    onValueChange={(value) => setFormData({ ...formData, teacher: value })}
                    required
                  >
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.length > 0 ? (
                        teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.name} - {teacher.subject}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="placeholder" disabled>
                          No teachers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class_assigned">Class *</Label>
                  <Select
                    value={formData.class_assigned}
                    onValueChange={(value) => setFormData({ ...formData, class_assigned: value })}
                    required
                  >
                    <SelectTrigger id="class_assigned">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.length > 0 ? (
                        classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id.toString()}>
                            {classItem.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="placeholder" disabled>
                          No classes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    required
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length > 0 ? (
                        subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.title} ({subject.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="placeholder" disabled>
                          No subjects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Assigning..." : "Assign Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the teacher assignment. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAssignmentToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
