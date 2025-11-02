import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChalkboardTeacher, 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash, 
  faEye, 
  faEyeSlash, 
  faUsers, 
  faChartBar, 
  faCalendarAlt, 
  faDollarSign, 
  faUserCog, 
  faClipboardList, 
  faFileText, 
  faCog,
  faTrophy
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
import { getTeachers, getTeacherStats, createTeacher, updateTeacher, deleteTeacher, toggleTeacherStatus } from "@/lib/api";
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

const AdminTeachers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    subject: '',
    phone: '',
    password: ''
  });

  const fetchData = async () => {
    try {
      setError("");
      const token = localStorage.getItem('accessToken');
      console.log('Teachers page - token:', token ? 'exists' : 'missing');
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      const [teachersData, statsData] = await Promise.all([
        getTeachers(),
        getTeacherStats()
      ]);

      console.log('Teachers data received:', teachersData);
      console.log('Teachers stats received:', statsData);

      // Handle paginated responses
      const teachersArray = Array.isArray(teachersData) ? teachersData : (teachersData?.results || []);

      setTeachers(teachersArray);
      setStats(statsData || {
        total: 0,
        active: 0,
        new_this_month: 0,
        avg_performance: '0%'
      });
    } catch (error: any) {
      console.error('Failed to fetch teachers:', error);
      setError(error.message || "Failed to fetch teachers data");
      toast({
        title: "Error",
        description: "Failed to fetch teachers data",
        variant: "destructive",
      });
      // Set empty arrays on error
      setTeachers([]);
      setStats({
        total: 0,
        active: 0,
        new_this_month: 0,
        avg_performance: '0%'
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

      if (isEditMode && editingTeacherId) {
        // Update existing teacher
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateTeacher(token, editingTeacherId, updateData);
        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        // Create new teacher
        await createTeacher(token, { ...formData, password: formData.password || 'teacher123' });
        toast({
          title: "Success",
          description: "Teacher added successfully",
        });
      }

      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingTeacherId(null);
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        subject: '',
        phone: '',
        password: ''
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'add'} teacher`,
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

  const handleEdit = (teacher: any) => {
    setIsEditMode(true);
    setEditingTeacherId(teacher.id);
    setFormData({
      email: teacher.email || '',
      first_name: teacher.name.split(' ')[0] || '',
      last_name: teacher.name.split(' ').slice(1).join(' ') || '',
      subject: teacher.subject || '',
      phone: teacher.phone || '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await deleteTeacher(token, teacherToDelete);
      
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });

      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (teacherId: number) => {
    setTeacherToDelete(teacherId);
    setDeleteDialogOpen(true);
  };

  const handleStatusToggle = async (teacherId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "Error",
          description: "You must be logged in to update teacher status",
          variant: "destructive",
        });
        return;
      }

      await toggleTeacherStatus(accessToken, teacherId);
      
      // Refresh the teachers list
      await fetchData();
      
      toast({
        title: "Success",
        description: "Teacher status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher status",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingTeacherId(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      subject: '',
      phone: '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const sidebarItems = getAdminSidebarItems("/admin/teachers");

  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Teacher Management"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold mb-2">Teacher Management</h2>
            <p className="text-muted-foreground text-lg">Manage teaching staff and assignments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all h-12" onClick={handleAddNew}>
                <FontAwesomeIcon icon={faPlus} className="w-5 h-5 mr-2" />
                Add New Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'Update teacher information' : 'Enter teacher information to create a new teacher account'}
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
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="e.g., Mathematics & Physics"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
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
                        placeholder={isEditMode ? "Enter new password to change" : "Default: teacher123"}
                      />
                      {!isEditMode && <p className="text-xs text-muted-foreground">Default: teacher123</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Teacher" : "Add Teacher")}
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
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Total Teachers</p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-primary-light rounded-xl">
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="w-8 h-8 text-primary" />
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
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="w-8 h-8 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Total Classes</p>
                      <p className="text-3xl font-bold text-accent">{stats.total_classes}</p>
                    </div>
                    <div className="p-3 bg-accent-light rounded-xl">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Teacher-Student Ratio</p>
                      <p className="text-3xl font-bold text-primary">{stats.teacher_student_ratio}</p>
                    </div>
                    <div className="p-3 bg-primary-light rounded-xl">
                      <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Search and List */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "100ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-light rounded-lg">
                <FontAwesomeIcon icon={faChalkboardTeacher} className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Teaching Staff Directory</CardTitle>
                <CardDescription>Manage teacher records and class assignments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by name or subject..."
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
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">Loading teachers...</TableCell>
                    </TableRow>
                  ) : filteredTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">No teachers found</TableCell>
                    </TableRow>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{teacher.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {teacher.employee_id || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{teacher.user_username}</TableCell>
                        <TableCell>{teacher.subject}</TableCell>
                        <TableCell>{teacher.classes_count} classes</TableCell>
                        <TableCell>{teacher.students_count} students</TableCell>
                        <TableCell className="text-sm">{teacher.phone}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={teacher.status === "Active" ? "default" : "secondary"}
                            className="cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200 select-none"
                            onClick={() => handleStatusToggle(teacher.id)}
                            title="Click to toggle status"
                          >
                            {teacher.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title={teacher.status === "Active" ? "Active" : "Inactive"}>
                              {teacher.status === "Active" ? (
                                <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-green-600" />
                              ) : (
                                <FontAwesomeIcon icon={faEyeSlash} className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(teacher)} title="Edit Teacher">
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(teacher.id)} title="Delete Teacher">
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-destructive" />
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
                This action cannot be undone. This will permanently delete the teacher account and remove their data from the system.
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

export default AdminTeachers;
