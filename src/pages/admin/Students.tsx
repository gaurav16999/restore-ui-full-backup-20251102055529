import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash, 
  faEye, 
  faEyeSlash, 
  faChartBar, 
  faChalkboardTeacher, 
  faCalendarAlt, 
  faDollarSign, 
  faUserCog, 
  faClipboardList, 
  faFileText, 
  faCog,
  faTrophy,
  faUpload,
  faDownload,
  faFileExcel
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
import { getStudents, getStudentStats, createStudent, updateStudent, deleteStudent, toggleStudentStatus, importStudents, downloadStudentCredentials, getClasses } from "@/lib/api";
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
  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  
  // Import-related state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [showDownloadOption, setShowDownloadOption] = useState(false);
  
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    class_name: '',
    phone: '',
    password: ''
  });

  const fetchData = async () => {
    try {
      setError("");
      const token = localStorage.getItem('accessToken');
      console.log('Students page - token:', token ? 'exists' : 'missing');
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      const [studentsData, statsData, classesData] = await Promise.all([
        getStudents(),
        getStudentStats(),
        getClasses()
      ]);

      console.log('Students data received:', studentsData);
      console.log('Stats data received:', statsData);
      console.log('Classes data received:', classesData);

      // Handle paginated responses
      const studentsArray = Array.isArray(studentsData) ? studentsData : (studentsData?.results || []);
      const classesArray = Array.isArray(classesData) ? classesData : (classesData?.results || []);
      
      // Remove duplicate class names (keep first occurrence by ID)
      const uniqueClasses = classesArray.reduce((acc: any[], current: any) => {
        const exists = acc.find(item => item.name === current.name);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setStudents(studentsArray);
      setClasses(uniqueClasses);
      setStats(statsData || {
        total: 0,
        active: 0,
        avg_attendance: '0%',
        new_this_month: 0
      });
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      setError(error.message || "Failed to fetch students data");
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive",
      });
      // Set empty arrays on error
      setStudents([]);
      setClasses([]);
      setStats({
        total: 0,
        active: 0,
        avg_attendance: '0%',
        new_this_month: 0
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

  const handleStatusToggle = async (studentId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "Error",
          description: "You must be logged in to update student status",
          variant: "destructive",
        });
        return;
      }

      await toggleStudentStatus(accessToken, studentId);
      
      // Refresh the students list
      await fetchData();
      
      toast({
        title: "Success",
        description: "Student status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update student status",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingStudentId(null);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      class_name: '',
      phone: '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  // Import handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Invalid File",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setImportFile(file);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImporting(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to import students",
          variant: "destructive",
        });
        return;
      }

      const result = await importStudents(token, importFile);
      
      setImportResult(result);
      setShowDownloadOption(true);
      
      // Refresh the students list
      fetchData();
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${result.total_imported} students`,
      });

    } catch (error: any) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import students",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadCredentials = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to download credentials",
          variant: "destructive",
        });
        return;
      }

      const blob = await downloadStudentCredentials(token);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_credentials.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Student credentials file has been downloaded",
      });

    } catch (error: any) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download credentials",
        variant: "destructive",
      });
    }
  };

  const resetImportDialog = () => {
    setImportDialogOpen(false);
    setImportFile(null);
    setImportResult(null);
    setShowDownloadOption(false);
    setIsImporting(false);
  };

  const sidebarItems = getAdminSidebarItems("/admin/students");

  const filteredStudents = (Array.isArray(students) ? students : []).filter(student =>
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
          <div className="flex gap-3">
            {/* Import Students Button */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all h-12">
                  <FontAwesomeIcon icon={faUpload} className="w-5 h-5 mr-2" />
                  Import Students
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Import Students from Excel</DialogTitle>
                  <DialogDescription>
                    Upload an Excel file (.xlsx or .xls) containing student data. Required columns: Name, Class. Optional: Age, Email.
                  </DialogDescription>
                </DialogHeader>
                
                {!importResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="excel-file">Select Excel File</Label>
                      <Input
                        id="excel-file"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        disabled={isImporting}
                      />
                      {importFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Excel Format Requirements:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Name</strong> (Required): Student's full name</li>
                        <li>• <strong>Class</strong> (Required): Class/Grade name</li>
                        <li>• <strong>Age</strong> (Optional): Student's age</li>
                        <li>• <strong>Email</strong> (Optional): Will be auto-generated if missing</li>
                      </ul>
                      <p className="text-xs text-blue-600 mt-2">
                        Student ID and passwords will be auto-generated for all students.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Import Successful!</h4>
                      <p className="text-green-700">{importResult.message}</p>
                      {importResult.warnings && importResult.warnings.length > 0 && (
                        <div className="mt-3">
                          <p className="text-yellow-700 font-medium">Warnings:</p>
                          <ul className="text-sm text-yellow-600 mt-1">
                            {importResult.warnings.slice(0, 3).map((warning: string, index: number) => (
                              <li key={index}>• {warning}</li>
                            ))}
                            {importResult.warnings.length > 3 && (
                              <li>• ... and {importResult.warnings.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {showDownloadOption && (
                      <Button onClick={handleDownloadCredentials} className="w-full" variant="outline">
                        <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
                        Download Student Credentials (CSV)
                      </Button>
                    )}
                  </div>
                )}
                
                <DialogFooter>
                  {!importResult ? (
                    <>
                      <Button variant="outline" onClick={resetImportDialog} disabled={isImporting}>
                        Cancel
                      </Button>
                      <Button onClick={handleImportSubmit} disabled={!importFile || isImporting}>
                        {isImporting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Importing...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
                            Import Students
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={resetImportDialog} className="w-full">
                      Done
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Add New Student Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all h-12" onClick={handleAddNew}>
                  <FontAwesomeIcon icon={faPlus} className="w-5 h-5 mr-2" />
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
                        <Label htmlFor="class_name">Class *</Label>
                        <Select
                          value={formData.class_name}
                          onValueChange={(value) => setFormData({ ...formData, class_name: value })}
                          required
                        >
                          <SelectTrigger id="class_name">
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.length > 0 ? (
                              classes.map((classItem) => (
                                <SelectItem key={classItem.id} value={classItem.name}>
                                  {classItem.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                No classes available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    {!isEditMode && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Student" : "Add Student")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-scale-in">
          {loading ? (
            <div className="col-span-4 text-center py-10">Loading stats...</div>
          ) : error ? (
            <div className="col-span-4 text-center py-10">
              <div className="text-red-600 mb-4">
                <h3 className="text-lg font-semibold">Error Loading Data</h3>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={fetchData} variant="outline">
                <FontAwesomeIcon icon={faSearch} className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
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
                      <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-primary" />
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
                      <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-success" />
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
                      <FontAwesomeIcon icon={faPlus} className="w-8 h-8 text-accent" />
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
                      <FontAwesomeIcon icon={faClipboardList} className="w-8 h-8 text-primary" />
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
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-primary" />
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
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
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
                    <TableHead>Username</TableHead>
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
                      <TableCell colSpan={8} className="text-center py-10">Loading students...</TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">No students found</TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.roll_no}</TableCell>
                        <TableCell className="font-mono text-sm">{student.user_username}</TableCell>
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
                          <Badge 
                            variant={student.status === "Active" ? "default" : "secondary"}
                            className="cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200 select-none"
                            onClick={() => handleStatusToggle(student.id)}
                            title="Click to toggle status"
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title={student.status === "Active" ? "Active" : "Inactive"}>
                              {student.status === "Active" ? (
                                <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-green-600" />
                              ) : (
                                <FontAwesomeIcon icon={faEyeSlash} className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(student)} title="Edit Student">
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(student.id)} title="Delete Student">
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
