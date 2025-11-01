import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserFriends,
  faPlus, 
  faEdit, 
  faTrash,
  faIdCard,
  faFileAlt,
  faUserCog,
  faSearch,
  faDownload,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faBriefcase,
  faCalendarAlt,
  faMoneyBillWave
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
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
import { Textarea } from "@/components/ui/textarea";
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

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  date_of_joining: string;
  salary: number;
  photo?: string;
  qualification: string;
  experience: string;
  blood_group: string;
  emergency_contact: string;
  status: 'active' | 'inactive';
  has_login: boolean;
}

const AdminEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showJobLetterDialog, setShowJobLetterDialog] = useState(false);
  const [showIdCardDialog, setShowIdCardDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // basic employee identity
    employee_id: '',
    employee_name: '',
    first_name: '',
    last_name: '',
    mobile_no: '',
    phone: '',
    email: '',
    // address & personal
    address: '',
    home_address: '',
    date_of_birth: '',
    father_husband_name: '',
    gender: '',
    national_id: '',
    religion: '',
    education: '',
    // job
    position: '',
    department: '',
    employee_role: '',
    date_of_joining: '',
    salary: '',
    qualification: '',
    experience: '',
    blood_group: '',
    emergency_contact: '',
    // file upload
    picture: null as File | null,
    status: 'active' as 'active' | 'inactive'
  });

  // Mock data for demonstration
  const mockEmployees: Employee[] = [
    {
      id: 1,
      employee_id: 'EMP001',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@school.com',
      phone: '+1234567890',
      address: '123 Main St, City',
      position: 'Principal',
      department: 'Administration',
      date_of_joining: '2020-01-15',
      salary: 80000,
      qualification: 'PhD in Education',
      experience: '15 years',
      blood_group: 'A+',
      emergency_contact: '+1234567899',
      status: 'active',
      has_login: true
    },
    {
      id: 2,
      employee_id: 'EMP002',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@school.com',
      phone: '+1234567891',
      address: '456 Oak Ave, City',
      position: 'Librarian',
      department: 'Library',
      date_of_joining: '2021-03-20',
      salary: 45000,
      qualification: 'Masters in Library Science',
      experience: '8 years',
      blood_group: 'B+',
      emergency_contact: '+1234567898',
      status: 'active',
      has_login: false
    },
    {
      id: 3,
      employee_id: 'EMP003',
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@school.com',
      phone: '+1234567892',
      address: '789 Pine Rd, City',
      position: 'Accountant',
      department: 'Finance',
      date_of_joining: '2019-08-10',
      salary: 55000,
      qualification: 'MBA Finance',
      experience: '10 years',
      blood_group: 'O+',
      emergency_contact: '+1234567897',
      status: 'active',
      has_login: true
    }
  ];

  useEffect(() => {
    // In a real app, fetch from API
    setEmployees(mockEmployees);
    setFilteredEmployees(mockEmployees);
    setLoading(false);
  }, []);

  useEffect(() => {
    const filtered = employees.filter(emp => 
      emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, call API here
      const newEmployee: Employee = {
        id: employees.length + 1,
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        position: formData.position,
        department: formData.department,
        date_of_joining: formData.date_of_joining,
        salary: parseFloat(formData.salary),
        qualification: formData.qualification,
        experience: formData.experience,
        blood_group: formData.blood_group,
        emergency_contact: formData.emergency_contact,
        status: formData.status,
        has_login: false
      };

      if (isEditMode && editingEmployeeId) {
        setEmployees(employees.map(emp => 
          emp.id === editingEmployeeId ? { ...newEmployee, id: editingEmployeeId } : emp
        ));
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        setEmployees([...employees, newEmployee]);
        toast({
          title: "Success",
          description: "Employee added successfully",
        });
      }

      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingEmployeeId(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'add'} employee`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      employee_name: '',
      first_name: '',
      last_name: '',
      mobile_no: '',
      phone: '',
      email: '',
      address: '',
      home_address: '',
      date_of_birth: '',
      father_husband_name: '',
      gender: '',
      national_id: '',
      religion: '',
      education: '',
      position: '',
      department: '',
      employee_role: '',
      date_of_joining: '',
      salary: '',
      qualification: '',
      experience: '',
      blood_group: '',
      emergency_contact: '',
      picture: null,
      status: 'active'
    });
  };

  const handleEdit = (employee: Employee) => {
    setIsEditMode(true);
    setEditingEmployeeId(employee.id);
    setFormData({
      employee_id: employee.employee_id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      first_name: employee.first_name,
      last_name: employee.last_name,
      mobile_no: employee.phone,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      home_address: employee.address,
      date_of_birth: '',
      father_husband_name: '',
      gender: '',
      national_id: '',
      religion: '',
      education: '',
      position: employee.position,
      department: employee.department,
      employee_role: employee.position,
      date_of_joining: employee.date_of_joining,
      salary: employee.salary.toString(),
      qualification: employee.qualification,
      experience: employee.experience,
      blood_group: employee.blood_group,
      emergency_contact: employee.emergency_contact,
      picture: null,
      status: employee.status
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingEmployeeId(null);
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
      setEmployees(employees.filter(emp => emp.id !== itemToDelete));
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const generateIdCard = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowIdCardDialog(true);
  };

  const generateJobLetter = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowJobLetterDialog(true);
  };

  const manageLogin = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowLoginDialog(true);
  };

  const sidebarItems = getAdminSidebarItems("/admin/employees");

  return (
    <DashboardLayout
      title="Employees"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold mb-2">Employee Management</h2>
            <p className="text-muted-foreground text-lg">Manage all school staff and employees</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Employees</CardTitle>
              <FontAwesomeIcon icon={faUserFriends} className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Active Staff</CardTitle>
              <FontAwesomeIcon icon={faUserCog} className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employees.filter(e => e.status === 'active').length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">With Login Access</CardTitle>
              <FontAwesomeIcon icon={faUserCog} className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employees.filter(e => e.has_login).length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Departments</CardTitle>
              <FontAwesomeIcon icon={faBriefcase} className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(employees.map(e => e.department)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Employees</TabsTrigger>
              <TabsTrigger value="add">Add New</TabsTrigger>
              <TabsTrigger value="id-cards">Staff ID Cards</TabsTrigger>
              <TabsTrigger value="job-letter">Job Letter</TabsTrigger>
              <TabsTrigger value="login">Manage Login</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* All Employees Tab */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Employees</CardTitle>
                <CardDescription>Complete list of all staff members</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading employees...</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No employees found. Add your first employee to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faUserFriends} className="text-primary" />
                                <h3 className="font-semibold text-lg">
                                  {employee.first_name} {employee.last_name}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  employee.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {employee.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">ID: {employee.employee_id}</p>
                              <p className="text-sm font-medium text-primary">{employee.position}</p>
                              <p className="text-sm text-muted-foreground">{employee.department}</p>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-muted-foreground w-4" />
                                <span>{employee.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhone} className="text-muted-foreground w-4" />
                                <span>{employee.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-muted-foreground w-4" />
                                <span>Joined: {employee.date_of_joining}</span>
                              </div>
                            </div>

                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-muted-foreground w-4" />
                                <span>${employee.salary.toLocaleString()}/year</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faBriefcase} className="text-muted-foreground w-4" />
                                <span>{employee.experience}</span>
                              </div>
                              <div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  employee.has_login 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {employee.has_login ? 'Has Login' : 'No Login'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => generateIdCard(employee)}
                              title="Generate ID Card"
                            >
                              <FontAwesomeIcon icon={faIdCard} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => generateJobLetter(employee)}
                              title="Generate Job Letter"
                            >
                              <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => manageLogin(employee)}
                              title="Manage Login"
                            >
                              <FontAwesomeIcon icon={faUserCog} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(employee)}
                              className="hover:bg-primary/10"
                            >
                              <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(employee.id)}
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

          {/* Add New Employee Tab */}
          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Form</CardTitle>
                <CardDescription>
                  <span className="text-red-500">*</span> Required{" "}
                  <span className="text-blue-500">*</span> Optional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm">1</span>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employee_name" className="text-blue-600">
                          Employee Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="employee_name"
                          placeholder="Name of Employee"
                          value={formData.employee_name}
                          onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile_no" className="text-blue-600">
                          Mobile No w/ SMS/WhatsApp <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="mobile_no"
                          placeholder="e.g +44xxxxxxxxx"
                          value={formData.mobile_no}
                          onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employee_role" className="text-blue-600">
                          Employee Role <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.employee_role}
                          onValueChange={(value) => setFormData({ ...formData, employee_role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select*" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Principal">Principal</SelectItem>
                            <SelectItem value="Management Staff">Management Staff</SelectItem>
                            <SelectItem value="Teacher">Teacher</SelectItem>
                            <SelectItem value="Accountant">Accountant</SelectItem>
                            <SelectItem value="Store Manager">Store Manager</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="picture" className="text-blue-600">
                          Picture - Optional
                        </Label>
                        <Input
                          id="picture"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({ ...formData, picture: e.target.files?.[0] || null })}
                        />
                        <p className="text-xs text-yellow-600">Max size 500KB</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_of_joining" className="text-blue-600">
                          Date of Joining <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="date_of_joining"
                          type="date"
                          value={formData.date_of_joining}
                          onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-blue-600">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Other Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm">2</span>
                      Other Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="father_husband_name" className="text-blue-600">
                          Father / Husband Name
                        </Label>
                        <Input
                          id="father_husband_name"
                          placeholder="Father / Husband Name"
                          value={formData.father_husband_name}
                          onChange={(e) => setFormData({ ...formData, father_husband_name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-blue-600">
                          Gender
                        </Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="national_id" className="text-blue-600">
                          National ID
                        </Label>
                        <Input
                          id="national_id"
                          placeholder="National ID"
                          value={formData.national_id}
                          onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="religion" className="text-blue-600">
                          Religion
                        </Label>
                        <Select
                          value={formData.religion}
                          onValueChange={(value) => setFormData({ ...formData, religion: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Buddhism">Buddhism</SelectItem>
                            <SelectItem value="Christianity">Christianity</SelectItem>
                            <SelectItem value="Hinduism">Hinduism</SelectItem>
                            <SelectItem value="Islam">Islam</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education" className="text-blue-600">
                          Education
                        </Label>
                        <Input
                          id="education"
                          placeholder="Education"
                          value={formData.education}
                          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="blood_group" className="text-blue-600">
                          Blood Group
                        </Label>
                        <Select
                          value={formData.blood_group}
                          onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="home_address" className="text-blue-600">
                          Home Address
                        </Label>
                        <Input
                          id="home_address"
                          placeholder="Home Address"
                          value={formData.home_address}
                          onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth" className="text-blue-600">
                          Date of Birth
                        </Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          placeholder="mm/dd/yyyy"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" className="bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300">
                      <FontAwesomeIcon icon={faPlus} className="mr-2 rotate-45" />
                      Reset
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff ID Cards Tab */}
          <TabsContent value="id-cards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff ID Cards</CardTitle>
                <CardDescription>Generate and print employee ID cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="text-center mb-3">
                        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-2 flex items-center justify-center">
                          <FontAwesomeIcon icon={faUserFriends} className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <p className="text-xs text-muted-foreground mt-1">ID: {employee.employee_id}</p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => generateIdCard(employee)}
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

          {/* Job Letter Tab */}
          <TabsContent value="job-letter" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Letters</CardTitle>
                <CardDescription>Generate appointment and experience letters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUserFriends} className="text-xl text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.position} - {employee.department}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => generateJobLetter(employee)}
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

          {/* Manage Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Login Access</CardTitle>
                <CardDescription>Control system access for employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUserFriends} className="text-xl text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            employee.has_login 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {employee.has_login ? 'Login Enabled' : 'No Login Access'}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={employee.has_login ? "destructive" : "default"}
                        onClick={() => manageLogin(employee)}
                      >
                        <FontAwesomeIcon icon={faUserCog} className="mr-2" />
                        {employee.has_login ? 'Disable Login' : 'Enable Login'}
                      </Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update employee information' : 'Enter employee information'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit_employee_name">Employee Name *</Label>
                  <Input
                    id="edit_employee_name"
                    placeholder="Name of Employee"
                    value={formData.employee_name}
                    onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_mobile_no">Mobile No *</Label>
                  <Input
                    id="edit_mobile_no"
                    placeholder="e.g +44xxxxxxxxx"
                    value={formData.mobile_no}
                    onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_employee_role">Employee Role *</Label>
                  <Select
                    value={formData.employee_role}
                    onValueChange={(value) => setFormData({ ...formData, employee_role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Principal">Principal</SelectItem>
                      <SelectItem value="Management Staff">Management Staff</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                      <SelectItem value="Store Manager">Store Manager</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_date_of_joining">Date of Joining *</Label>
                  <Input
                    id="edit_date_of_joining"
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email Address</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_status">Status *</Label>
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
              </div>
            </div>

            {/* Other Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Other Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit_father_husband_name">Father / Husband Name</Label>
                  <Input
                    id="edit_father_husband_name"
                    placeholder="Father / Husband Name"
                    value={formData.father_husband_name}
                    onChange={(e) => setFormData({ ...formData, father_husband_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_national_id">National ID</Label>
                  <Input
                    id="edit_national_id"
                    placeholder="National ID"
                    value={formData.national_id}
                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_religion">Religion</Label>
                  <Select
                    value={formData.religion}
                    onValueChange={(value) => setFormData({ ...formData, religion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buddhism">Buddhism</SelectItem>
                      <SelectItem value="Christianity">Christianity</SelectItem>
                      <SelectItem value="Hinduism">Hinduism</SelectItem>
                      <SelectItem value="Islam">Islam</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_education">Education</Label>
                  <Input
                    id="edit_education"
                    placeholder="Education"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_blood_group">Blood Group</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit_home_address">Home Address</Label>
                  <Input
                    id="edit_home_address"
                    placeholder="Home Address"
                    value={formData.home_address}
                    onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    placeholder="mm/dd/yyyy"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Employee" : "Add Employee")}
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
              ID card for {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 border-2 border-dashed rounded-lg text-center">
            <FontAwesomeIcon icon={faIdCard} className="text-6xl text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ID Card preview and generation feature will be implemented here</p>
            <p className="text-sm text-muted-foreground mt-2">Employee: {selectedEmployee?.employee_id}</p>
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

      {/* Job Letter Dialog */}
      <Dialog open={showJobLetterDialog} onOpenChange={setShowJobLetterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Job Letter</DialogTitle>
            <DialogDescription>
              Job letter for {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 border-2 border-dashed rounded-lg text-center">
            <FontAwesomeIcon icon={faFileAlt} className="text-6xl text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Job letter template and generation feature will be implemented here</p>
            <p className="text-sm text-muted-foreground mt-2">Position: {selectedEmployee?.position}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJobLetterDialog(false)}>Close</Button>
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
              Configure login access for {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Current Status:</p>
              <span className={`text-xs px-3 py-1.5 rounded ${
                selectedEmployee?.has_login 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedEmployee?.has_login ? 'Login Enabled' : 'No Login Access'}
              </span>
            </div>
            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Email</Label>
              <p className="text-sm">{selectedEmployee?.email}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Role/Position</Label>
              <p className="text-sm">{selectedEmployee?.position}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>Close</Button>
            <Button variant={selectedEmployee?.has_login ? "destructive" : "default"}>
              <FontAwesomeIcon icon={faUserCog} className="mr-2" />
              {selectedEmployee?.has_login ? 'Disable Login' : 'Enable Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
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

export default AdminEmployees;
