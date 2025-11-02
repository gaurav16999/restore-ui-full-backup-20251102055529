import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash,
  faIdCard,
  faFileAlt,
  faUserCog,
  faPrint,
  faArrowUp,
  faDownload,
  faUpload,
  faUserFriends,
  faToggleOn,
  faToggleOff,
  faEnvelope,
  faPhone,
  faGraduationCap,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getStudents, getStudentStats, createStudent, updateStudent, deleteStudent, getClasses } from "@/lib/api";
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
import { Badge } from "@/components/ui/badge";

interface Student {
  id: number;
  student_id: string;
  roll_no?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  class_name: string;
  grade: string;
  date_of_birth: string;
  address: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  admission_date: string;
  status: 'active' | 'inactive';
  has_login: boolean;
  photo?: string;
  blood_group?: string;
  family_id?: string;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showIdCardDialog, setShowIdCardDialog] = useState(false);
  const [showAdmissionLetterDialog, setShowAdmissionLetterDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showFamilyDialog, setShowFamilyDialog] = useState(false);
  const [selectedStudentsForPromotion, setSelectedStudentsForPromotion] = useState<number[]>([]);
  const [promotionTargetClass, setPromotionTargetClass] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    class_name: '',
    grade: '',
    date_of_birth: '',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    admission_date: '',
    blood_group: '',
    status: 'active' as 'active' | 'inactive'
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const [studentsData, statsData, classesData] = await Promise.all([
        getStudents(),
        getStudentStats(),
        getClasses()
      ]);

      const studentsArray = Array.isArray(studentsData) ? studentsData : (studentsData?.results || []);
      const classesArray = Array.isArray(classesData) ? classesData : (classesData?.results || []);

      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
      setClasses(classesArray);
      setStats(statsData || {
        total_students: 0,
        active_students: 0,
        inactive_students: 0,
        new_admissions: 0
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student data",
        variant: "destructive",
      });
      setStudents([]);
      setClasses([]);
      setStats({
        total_students: 0,
        active_students: 0,
        inactive_students: 0,
        new_admissions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student => 
      student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      if (isEditMode && editingStudentId) {
        await updateStudent(token, editingStudentId, formData);
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        await createStudent(token, formData);
        toast({
          title: "Success",
          description: "Student added successfully",
        });
      }

      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingStudentId(null);
      resetForm();
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

  const resetForm = () => {
    setFormData({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      class_name: '',
      grade: '',
      date_of_birth: '',
      address: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      admission_date: '',
      blood_group: '',
      status: 'active'
    });
  };

  const handleEdit = (student: Student) => {
    setIsEditMode(true);
    setEditingStudentId(student.id);
    setFormData({
      student_id: student.student_id || '',
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      email: student.email || '',
      phone: student.phone || '',
      class_name: student.class_name || '',
      grade: student.grade || '',
      date_of_birth: student.date_of_birth || '',
      address: student.address || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      guardian_email: student.guardian_email || '',
      admission_date: student.admission_date || '',
      blood_group: student.blood_group || '',
      status: student.status || 'active'
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingStudentId(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await deleteStudent(token, itemToDelete);
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const toggleStudentStatus = async (student: Student) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const newStatus = student.status === 'active' ? 'inactive' : 'active';
      await updateStudent(token, student.id, { ...student, status: newStatus });
      
      toast({
        title: "Success",
        description: `Student ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update student status",
        variant: "destructive",
      });
    }
  };

  const generateIdCard = (student: Student) => {
    setSelectedStudent(student);
    setShowIdCardDialog(true);
  };

  const generateAdmissionLetter = (student: Student) => {
    setSelectedStudent(student);
    setShowAdmissionLetterDialog(true);
  };

  const manageLogin = (student: Student) => {
    setSelectedStudent(student);
    setShowLoginDialog(true);
  };

  const openPromoteDialog = () => {
    setShowPromoteDialog(true);
  };

  const openFamilyDialog = (student: Student) => {
    setSelectedStudent(student);
    setShowFamilyDialog(true);
  };

  const handlePromoteStudents = async () => {
    if (selectedStudentsForPromotion.length === 0 || !promotionTargetClass) {
      toast({
        title: "Error",
        description: "Please select students and target class",
        variant: "destructive",
      });
      return;
    }

    try {
      // API call to promote students would go here
      toast({
        title: "Success",
        description: `${selectedStudentsForPromotion.length} student(s) promoted successfully`,
      });
      setShowPromoteDialog(false);
      setSelectedStudentsForPromotion([]);
      setPromotionTargetClass("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote students",
        variant: "destructive",
      });
    }
  };

  const exportStudentList = () => {
    // Export functionality
    toast({
      title: "Success",
      description: "Student list exported successfully",
    });
  };

  const sidebarItems = getAdminSidebarItems("/admin/students");

  return (
    <DashboardLayout
      title="Students"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold mb-2">Student Management</h2>
            <p className="text-muted-foreground text-lg">Manage all students and their information</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Students</CardTitle>
              <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_students || students.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Active Students</CardTitle>
              <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.active_students || students.filter(s => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Inactive Students</CardTitle>
              <FontAwesomeIcon icon={faTimesCircle} className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.inactive_students || students.filter(s => s.status === 'inactive').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">With Login Access</CardTitle>
              <FontAwesomeIcon icon={faUserCog} className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {students.filter(s => s.has_login).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="add">Add New</TabsTrigger>
              <TabsTrigger value="families">Manage Families</TabsTrigger>
              <TabsTrigger value="active-inactive">Active / Inactive</TabsTrigger>
              <TabsTrigger value="admission-letter">Admission Letter</TabsTrigger>
              <TabsTrigger value="id-cards">Student ID Cards</TabsTrigger>
              <TabsTrigger value="print-list">Print Basic List</TabsTrigger>
              <TabsTrigger value="login">Manage Login</TabsTrigger>
              <TabsTrigger value="promote">Promote Students</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* All Students Tab */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>Complete list of all enrolled students</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading students...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found. Add your first student to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faUsers} className="text-primary" />
                                <div className="flex flex-col">
                                  <h3 className="font-semibold text-lg">
                                    {student.first_name} {student.last_name}
                                  </h3>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    Student ID: {student.roll_no || student.student_id}
                                  </span>
                                </div>
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                  {student.status}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-primary">{student.class_name}</p>
                              <p className="text-sm text-muted-foreground">Grade: {student.grade}</p>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-muted-foreground w-4" />
                                <span>{student.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhone} className="text-muted-foreground w-4" />
                                <span>{student.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-muted-foreground w-4" />
                                <span>DOB: {student.date_of_birth}</span>
                              </div>
                            </div>

                            <div className="space-y-1 text-sm">
                              <div>
                                <p className="font-medium">Guardian: {student.guardian_name}</p>
                                <p className="text-muted-foreground">{student.guardian_phone}</p>
                              </div>
                              <div className="mt-2">
                                <Badge variant={student.has_login ? 'default' : 'outline'}>
                                  {student.has_login ? 'Has Login' : 'No Login'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4 flex-wrap">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => generateIdCard(student)}
                              title="Generate ID Card"
                            >
                              <FontAwesomeIcon icon={faIdCard} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => generateAdmissionLetter(student)}
                              title="Admission Letter"
                            >
                              <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => manageLogin(student)}
                              title="Manage Login"
                            >
                              <FontAwesomeIcon icon={faUserCog} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openFamilyDialog(student)}
                              title="Family Info"
                            >
                              <FontAwesomeIcon icon={faUserFriends} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(student)}
                              className="hover:bg-primary/10"
                            >
                              <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(student.id)}
                              className="hover:bg-destructive/10 text-destructive"
                            >
                              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add New Student Tab */}
          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Student</CardTitle>
                <CardDescription>Enter student information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student_id">Student ID *</Label>
                      <Input
                        id="student_id"
                        placeholder="e.g., STU001"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class_name">Class *</Label>
                      <Select
                        value={formData.class_name}
                        onValueChange={(value) => setFormData({ ...formData, class_name: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.name}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        placeholder="e.g., 10"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth *</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admission_date">Admission Date *</Label>
                      <Input
                        id="admission_date"
                        type="date"
                        value={formData.admission_date}
                        onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blood_group">Blood Group</Label>
                      <Input
                        id="blood_group"
                        placeholder="e.g., A+"
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardian_name">Guardian Name *</Label>
                      <Input
                        id="guardian_name"
                        placeholder="Parent/Guardian name"
                        value={formData.guardian_name}
                        onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardian_phone">Guardian Phone *</Label>
                      <Input
                        id="guardian_phone"
                        placeholder="+1234567890"
                        value={formData.guardian_phone}
                        onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardian_email">Guardian Email</Label>
                      <Input
                        id="guardian_email"
                        type="email"
                        placeholder="parent@example.com"
                        value={formData.guardian_email}
                        onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Full address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("all")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      {isSubmitting ? "Adding..." : "Add Student"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Families Tab */}
          <TabsContent value="families" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Families</CardTitle>
                <CardDescription>Group students by family and manage family information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 border-2 border-dashed rounded-lg text-center">
                  <FontAwesomeIcon icon={faUserFriends} className="text-6xl text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Family management feature</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Group siblings and manage family-level information
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active / Inactive Tab */}
          <TabsContent value="active-inactive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active / Inactive Students</CardTitle>
                <CardDescription>Manage student status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUsers} className="text-xl text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.first_name} {student.last_name}</h3>
                          <p className="text-sm text-muted-foreground">{student.class_name} - ID: {student.student_id}</p>
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                            {student.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={student.status === 'active' ? 'destructive' : 'default'}
                        onClick={() => toggleStudentStatus(student)}
                      >
                        <FontAwesomeIcon 
                          icon={student.status === 'active' ? faToggleOff : faToggleOn} 
                          className="mr-2" 
                        />
                        {student.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admission Letter Tab */}
          <TabsContent value="admission-letter" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admission Letters</CardTitle>
                <CardDescription>Generate admission and confirmation letters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUsers} className="text-xl text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.first_name} {student.last_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {student.class_name} - Admitted: {student.admission_date}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => generateAdmissionLetter(student)}
                      >
                        <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                        Generate Letter
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student ID Cards Tab */}
          <TabsContent value="id-cards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student ID Cards</CardTitle>
                <CardDescription>Generate and print student ID cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="text-center mb-3">
                        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-2 flex items-center justify-center">
                          <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="font-semibold">{student.first_name} {student.last_name}</h3>
                        <p className="text-sm text-muted-foreground">{student.class_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">ID: {student.student_id}</p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => generateIdCard(student)}
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Generate ID Card
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Print Basic List Tab */}
          <TabsContent value="print-list" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Print Basic List</CardTitle>
                    <CardDescription>Export and print student lists</CardDescription>
                  </div>
                  <Button onClick={exportStudentList}>
                    <FontAwesomeIcon icon={faPrint} className="mr-2" />
                    Print List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-2">ID</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Class</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Phone</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{student.student_id}</td>
                          <td className="p-2">{student.first_name} {student.last_name}</td>
                          <td className="p-2">{student.class_name}</td>
                          <td className="p-2">{student.email}</td>
                          <td className="p-2">{student.phone}</td>
                          <td className="p-2">
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                              {student.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Login Access</CardTitle>
                <CardDescription>Control system access for students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUsers} className="text-xl text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.first_name} {student.last_name}</h3>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <Badge variant={student.has_login ? 'default' : 'outline'} className="mt-1">
                            {student.has_login ? 'Login Enabled' : 'No Login Access'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={student.has_login ? 'destructive' : 'default'}
                        onClick={() => manageLogin(student)}
                      >
                        <FontAwesomeIcon icon={faUserCog} className="mr-2" />
                        {student.has_login ? 'Disable Login' : 'Enable Login'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promote Students Tab */}
          <TabsContent value="promote" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Promote Students</CardTitle>
                    <CardDescription>Promote students to the next class/grade</CardDescription>
                  </div>
                  <Button 
                    onClick={openPromoteDialog}
                    disabled={selectedStudentsForPromotion.length === 0}
                  >
                    <FontAwesomeIcon icon={faArrowUp} className="mr-2" />
                    Promote Selected ({selectedStudentsForPromotion.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStudents.filter(s => s.status === 'active').map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedStudentsForPromotion.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentsForPromotion([...selectedStudentsForPromotion, student.id]);
                            } else {
                              setSelectedStudentsForPromotion(
                                selectedStudentsForPromotion.filter(id => id !== student.id)
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUsers} className="text-xl text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.first_name} {student.last_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Current: {student.class_name} - Grade {student.grade}
                          </p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faGraduationCap} className="text-2xl text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update student information' : 'Enter student information'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student ID *</Label>
                <Input
                  placeholder="e.g., STU001"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Class *</Label>
                <Select
                  value={formData.class_name}
                  onValueChange={(value) => setFormData({ ...formData, class_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Guardian Name *</Label>
                <Input
                  placeholder="Parent/Guardian name"
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Guardian Phone *</Label>
                <Input
                  placeholder="+1234567890"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  required
                />
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

      {/* ID Card Dialog */}
      <Dialog open={showIdCardDialog} onOpenChange={setShowIdCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate ID Card</DialogTitle>
            <DialogDescription>
              ID card for {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 border-2 border-dashed rounded-lg text-center">
            <FontAwesomeIcon icon={faIdCard} className="text-6xl text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ID Card preview and generation feature</p>
            <p className="text-sm text-muted-foreground mt-2">Student ID: {selectedStudent?.student_id}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIdCardDialog(false)}>Close</Button>
            <Button>
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admission Letter Dialog */}
      <Dialog open={showAdmissionLetterDialog} onOpenChange={setShowAdmissionLetterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Admission Letter</DialogTitle>
            <DialogDescription>
              Admission letter for {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 border-2 border-dashed rounded-lg text-center">
            <FontAwesomeIcon icon={faFileAlt} className="text-6xl text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Admission letter template</p>
            <p className="text-sm text-muted-foreground mt-2">Class: {selectedStudent?.class_name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdmissionLetterDialog(false)}>Close</Button>
            <Button>
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Management Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Login Access</DialogTitle>
            <DialogDescription>
              Configure login access for {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Current Status:</p>
              <Badge variant={selectedStudent?.has_login ? 'default' : 'outline'}>
                {selectedStudent?.has_login ? 'Login Enabled' : 'No Login Access'}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Email</Label>
              <p className="text-sm">{selectedStudent?.email}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>Close</Button>
            <Button variant={selectedStudent?.has_login ? "destructive" : "default"}>
              <FontAwesomeIcon icon={faUserCog} className="mr-2" />
              {selectedStudent?.has_login ? 'Disable Login' : 'Enable Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote Students Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Students</DialogTitle>
            <DialogDescription>
              Promote {selectedStudentsForPromotion.length} student(s) to next class
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target Class *</Label>
              <Select value={promotionTargetClass} onValueChange={setPromotionTargetClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Students to promote: {selectedStudentsForPromotion.length}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>Cancel</Button>
            <Button onClick={handlePromoteStudents}>
              <FontAwesomeIcon icon={faArrowUp} className="mr-2" />
              Promote Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Family Dialog */}
      <Dialog open={showFamilyDialog} onOpenChange={setShowFamilyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Family Information</DialogTitle>
            <DialogDescription>
              Family details for {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Guardian Name</Label>
              <p className="text-sm">{selectedStudent?.guardian_name}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Guardian Contact</Label>
              <p className="text-sm">{selectedStudent?.guardian_phone}</p>
              <p className="text-sm text-muted-foreground">{selectedStudent?.guardian_email}</p>
            </div>
            {selectedStudent?.family_id && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Family ID: {selectedStudent.family_id}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFamilyDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student
              record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminStudents;
