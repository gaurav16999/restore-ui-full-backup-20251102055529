import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Search, Edit, Trash2, Eye, EyeOff, BarChart3, BookOpen, Calendar, DollarSign, UserCog, ClipboardList, FileText, Settings } from "lucide-react";
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
import { getStudents, getStudentStats, createStudent, updateStudent, deleteStudent } from "@/lib/api";
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

const AdminStudents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    roll_no: '',
    class_name: '',
    phone: '',
    password: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const [studentsData, statsData] = await Promise.all([
        getStudents(token),
        getStudentStats(token)
      ]);

      setStudents(studentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data",
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
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      if (isEditMode && editingStudentId) {
        // Update existing student
        const updateData = { ...formData };
        // Don't send password if it's empty (means no change)
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateStudent(token, editingStudentId, updateData);
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        // Create new student
        await createStudent(token, { ...formData, password: formData.password || 'student123' });
        toast({
          title: "Success",
          description: "Student added successfully",
        });
      }

      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingStudentId(null);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        roll_no: '',
        class_name: '',
        phone: '',
        password: ''
      });
      
      // Refresh data
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'add'} student`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (student: any) => {
    setIsEditMode(true);
    setEditingStudentId(student.id);
    setFormData({
      username: student.user_username || '',
      email: student.email || '',
      first_name: student.name.split(' ')[0] || '',
      last_name: student.name.split(' ').slice(1).join(' ') || '',
      roll_no: student.roll_no || '',
      class_name: student.class_name || '',
      phone: student.phone || '',
      password: '' // Leave empty, will only update if filled
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await deleteStudent(token, studentToDelete);
      
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      
      // Refresh data
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (studentId: number) => {
    setStudentToDelete(studentId);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingStudentId(null);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      roll_no: '',
      class_name: '',
      phone: '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Students", active: true, path: "/admin/students" },
    { icon: BookOpen, label: "Teachers", path: "/admin/teachers" },
    { icon: Calendar, label: "Classes & Subjects", path: "/admin/classes" },
    { icon: ClipboardList, label: "Attendance", path: "/admin/attendance" },
    { icon: FileText, label: "Grades & Reports" },
    { icon: DollarSign, label: "Fee Management" },
    { icon: UserCog, label: "User Management" },
    { icon: Settings, label: "Settings" },
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.roll_no.includes(searchQuery) ||
    student.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Student Management"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold mb-2">Student Management</h2>
            <p className="text-muted-foreground text-lg">Manage student records and information</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all h-12" onClick={handleAddNew}>
                <Plus className="w-5 h-5 mr-2" />
                Add New Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'Update student information' : 'Enter student information to create a new student account'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roll_no">Roll Number *</Label>
                      <Input
                        id="roll_no"
                        name="roll_no"
                        value={formData.roll_no}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class_name">Class *</Label>
                      <Input
                        id="class_name"
                        name="class_name"
                        placeholder="e.g., 10A"
                        value={formData.class_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password {isEditMode && '(leave empty to keep current)'}</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={isEditMode ? "Enter new password to change" : "Default: student123"}
                      />
                      {!isEditMode && <p className="text-xs text-muted-foreground">Default: student123</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Student" : "Add Student")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-scale-in">
          {loading ? (
            <div className="col-span-4 text-center py-10">Loading...</div>
          ) : stats ? (
            <>
              <Card className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Total Students</p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-primary-light rounded-xl">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Active</p>
                      <p className="text-3xl font-bold text-success">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-success-light rounded-xl">
                      <Users className="w-8 h-8 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">New This Month</p>
                      <p className="text-3xl font-bold text-accent">{stats.new_this_month}</p>
                    </div>
                    <div className="p-3 bg-accent-light rounded-xl">
                      <Plus className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Avg. Attendance</p>
                      <p className="text-3xl font-bold text-primary">{stats.avg_attendance}</p>
                    </div>
                    <div className="p-3 bg-primary-light rounded-xl">
                      <ClipboardList className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Search and Filter */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "100ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-light rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Student Directory</CardTitle>
                <CardDescription>Search and manage all student records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by name, roll number, or class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-2 hover:border-primary transition-colors"
                />
              </div>
              <Button variant="outline" className="h-11 border-2 hover:border-primary">Filter</Button>
              <Button variant="outline" className="h-11 border-2 hover:border-primary">Export</Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">Loading students...</TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">No students found</TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.roll_no}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>Grade {student.class_name}</TableCell>
                        <TableCell className="text-sm">{student.phone}</TableCell>
                        <TableCell>
                          <Badge variant={parseFloat(student.attendance_percentage) >= 90 ? "default" : "destructive"}>
                            {student.attendance_percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title={student.status === "Active" ? "Active" : "Inactive"}>
                              {student.status === "Active" ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(student)} title="Edit Student">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(student.id)} title="Delete Student">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the student account and remove their data from the system.
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

export default AdminStudents;
