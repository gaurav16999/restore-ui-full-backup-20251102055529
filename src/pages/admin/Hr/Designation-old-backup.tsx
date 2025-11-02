import { useEffect, useState } from "react";
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Upload, 
  Printer, 
  MoreVertical,
  Edit, 
  Trash2, 
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { designationApi, departmentApi, type Designation, type Department } from '@/services/adminApi';

// School-specific designation presets
const SCHOOL_DESIGNATIONS = {
  teaching: [
    { title: 'Principal', description: 'Head of the school, overall management and administration' },
    { title: 'Vice Principal', description: 'Assistant to Principal, manages academic affairs' },
    { title: 'Head of Department (HOD)', description: 'Leads a specific academic department' },
    { title: 'Senior Teacher', description: 'Experienced teacher with mentorship responsibilities' },
    { title: 'Teacher', description: 'Primary teaching staff member' },
    { title: 'Assistant Teacher', description: 'Entry-level teaching position' },
    { title: 'Subject Coordinator', description: 'Coordinates curriculum for specific subjects' },
    { title: 'Class Teacher', description: 'Manages a specific class/section' },
    { title: 'PGT (Post Graduate Teacher)', description: 'Post-graduate qualified teacher for senior classes' },
    { title: 'TGT (Trained Graduate Teacher)', description: 'Graduate teacher for middle classes' },
    { title: 'PRT (Primary Teacher)', description: 'Primary level teacher' },
  ],
  administrative: [
    { title: 'Administrator', description: 'School administrative manager' },
    { title: 'Academic Coordinator', description: 'Coordinates academic programs and schedules' },
    { title: 'Exam Controller', description: 'Manages examinations and assessments' },
    { title: 'Admission Officer', description: 'Handles student admissions and registrations' },
    { title: 'Accountant', description: 'Manages school finances and accounts' },
    { title: 'Librarian', description: 'Manages school library and resources' },
    { title: 'IT Administrator', description: 'Manages school IT infrastructure' },
    { title: 'Office Clerk', description: 'General office administrative work' },
    { title: 'Receptionist', description: 'Front desk and visitor management' },
  ],
  support: [
    { title: 'Lab Assistant', description: 'Assists in science/computer labs' },
    { title: 'Sports Instructor', description: 'Manages sports and physical education' },
    { title: 'Counselor', description: 'Student counseling and guidance' },
    { title: 'Nurse', description: 'School health and medical care' },
    { title: 'Security Guard', description: 'School security and safety' },
    { title: 'Peon', description: 'General support staff' },
    { title: 'Cleaner', description: 'Maintains school cleanliness' },
    { title: 'Driver', description: 'School transport driver' },
    { title: 'Canteen Staff', description: 'Manages school canteen/cafeteria' },
  ],
};

// Types
interface FormData {
  title: string;
  description: string;
  designation_type: string;
  is_active: boolean;
}

const DESIGNATION_TYPE_OPTIONS = [
  { value: 'teaching', label: 'Teaching Staff', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'administrative', label: 'Administrative Staff', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  { value: 'support', label: 'Support Staff', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
];

const Designation = () => {
  const sidebarItems = getAdminSidebarItems("/admin/hr/designation");
  const { toast } = useToast();

  // State
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    department: "",
    level: "L1",
    salary_min: "",
    salary_max: "",
    description: "",
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    avgSalaryRange: 0,
  });

  // Load data on mount
  useEffect(() => {
    loadDesignations();
    loadDepartments();
  }, []);

  // Update stats when designations change
  useEffect(() => {
    calculateStats();
  }, [designations]);

  const loadDesignations = async () => {
    setLoading(true);
    try {
      const api = (await import('@/services/adminApi')).designationApi;
      const data = await api.getAll();
      
      let designationList: Designation[] = [];
      if (Array.isArray(data)) {
        designationList = data;
      } else if (data && typeof data === 'object') {
        const responseData = data as any;
        if (Array.isArray(responseData.results)) {
          designationList = responseData.results;
        } else if (Array.isArray(responseData.data)) {
          designationList = responseData.data;
        }
      }
      
      setDesignations(designationList);
    } catch (err) {
      console.error('Load designations error:', err);
      toast({
        title: 'Error',
        description: 'Failed to load designations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const api = (await import('@/services/adminApi')).departmentApi;
      const data = await api.getAll();
      
      let deptList: Department[] = [];
      if (Array.isArray(data)) {
        deptList = data;
      } else if (data && typeof data === 'object') {
        const responseData = data as any;
        if (Array.isArray(responseData.results)) {
          deptList = responseData.results;
        } else if (Array.isArray(responseData.data)) {
          deptList = responseData.data;
        }
      }
      
      setDepartments(deptList);
    } catch (err) {
      console.error('Load departments error:', err);
    }
  };

  const calculateStats = () => {
    const total = designations.length;
    const active = designations.filter(d => d.is_active).length;
    const inactive = total - active;
    
    const avgSalaryRange = designations.length > 0
      ? designations.reduce((sum, d) => {
          const min = parseFloat(String(d.salary_min || 0));
          const max = parseFloat(String(d.salary_max || 0));
          return sum + (max - min);
        }, 0) / designations.length
      : 0;
    
    setStats({ total, active, inactive, avgSalaryRange });
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Designation name is required';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Designation code is required';
    }
    
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    
    const salaryMin = parseFloat(formData.salary_min);
    const salaryMax = parseFloat(formData.salary_max);
    
    if (isNaN(salaryMin) || salaryMin < 0) {
      errors.salary_min = 'Valid minimum salary is required';
    }
    
    if (isNaN(salaryMax) || salaryMax < 0) {
      errors.salary_max = 'Valid maximum salary is required';
    }
    
    if (salaryMin >= salaryMax) {
      errors.salary_max = 'Maximum salary must be greater than minimum';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const api = (await import('@/services/adminApi')).designationApi;
      const payload = {
        name: formData.name,
        code: formData.code,
        department: parseInt(formData.department),
        level: formData.level,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        description: formData.description,
        is_active: formData.is_active,
      };
      
      await api.create(payload);
      
      toast({
        title: 'Success',
        description: 'Designation created successfully',
      });
      
      setShowAddDialog(false);
      resetForm();
      loadDesignations();
    } catch (err: any) {
      console.error('Create designation error:', err);
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to create designation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDesignation || !validateForm()) return;
    
    setLoading(true);
    try {
      const api = (await import('@/services/adminApi')).designationApi;
      const payload = {
        name: formData.name,
        code: formData.code,
        department: parseInt(formData.department),
        level: formData.level,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        description: formData.description,
        is_active: formData.is_active,
      };
      
      await api.update(selectedDesignation.id, payload);
      
      toast({
        title: 'Success',
        description: 'Designation updated successfully',
      });
      
      setShowEditDialog(false);
      setSelectedDesignation(null);
      resetForm();
      loadDesignations();
    } catch (err: any) {
      console.error('Update designation error:', err);
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to update designation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDesignation) return;
    
    setLoading(true);
    try {
      const api = (await import('@/services/adminApi')).designationApi;
      await api.delete(selectedDesignation.id);
      
      toast({
        title: 'Success',
        description: 'Designation deleted successfully',
      });
      
      setShowDeleteDialog(false);
      setSelectedDesignation(null);
      loadDesignations();
    } catch (err: any) {
      console.error('Delete designation error:', err);
      const message = err?.response?.status === 409
        ? 'Cannot delete designation with assigned staff members'
        : 'Failed to delete designation';
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (designation: Designation) => {
    setSelectedDesignation(designation);
    setFormData({
      name: designation.name,
      code: designation.code,
      department: designation.department?.toString() || "",
      level: designation.level,
      salary_min: designation.salary_min.toString(),
      salary_max: designation.salary_max.toString(),
      description: designation.description || "",
      is_active: designation.is_active,
    });
    setFormErrors({});
    setShowEditDialog(true);
  };

  const openViewDialog = (designation: Designation) => {
    setSelectedDesignation(designation);
    setShowViewDialog(true);
  };

  const openDeleteDialog = (designation: Designation) => {
    setSelectedDesignation(designation);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      department: "",
      level: "L1",
      salary_min: "",
      salary_max: "",
      description: "",
      is_active: true,
    });
    setFormErrors({});
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Code', 'Department', 'Level', 'Min Salary', 'Max Salary', 'Status'];
    const rows = filteredDesignations.map(d => [
      d.name,
      d.code,
      d.department_name || '-',
      d.level,
      d.salary_min,
      d.salary_max,
      d.is_active ? 'Active' : 'Inactive'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `designations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: 'Success',
      description: 'Designations exported to CSV',
    });
  };

  // Filter designations
  const filteredDesignations = designations.filter(d => {
    const matchesSearch = searchQuery === "" || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || 
      d.department?.toString() === filterDepartment;
    
    const matchesLevel = filterLevel === "all" || d.level === filterLevel;
    
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && d.is_active) ||
      (filterStatus === "inactive" && !d.is_active);
    
    return matchesSearch && matchesDepartment && matchesLevel && matchesStatus;
  });

  return (
    <DashboardLayout 
      title="Designation Management" 
      userName="Admin" 
      userRole="Administrator" 
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Designations</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.total}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <h3 className="text-2xl font-bold mt-2 text-green-600">{stats.active}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <h3 className="text-2xl font-bold mt-2 text-red-600">{stats.inactive}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Salary Range</p>
                  <h3 className="text-2xl font-bold mt-2">${stats.avgSalaryRange.toFixed(0)}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Designation List</CardTitle>
                <CardDescription>Manage organizational job positions and titles</CardDescription>
              </div>
              <Button onClick={openAddDialog} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Designation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {LEVEL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadDesignations}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleExportCSV}
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Level</TableHead>
                    <TableHead className="font-semibold">Salary Range</TableHead>
                    <TableHead className="font-semibold">Staff Count</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading designations...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredDesignations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No designations found</p>
                        <Button 
                          variant="link" 
                          onClick={openAddDialog}
                          className="mt-2"
                        >
                          Create your first designation
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDesignations.map((designation) => (
                      <TableRow key={designation.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{designation.code}</TableCell>
                        <TableCell className="font-medium">{designation.name}</TableCell>
                        <TableCell>{designation.department_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{designation.level}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          ${Number(designation.salary_min).toLocaleString()} - ${Number(designation.salary_max).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{designation.staff_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {designation.is_active ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openViewDialog(designation)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(designation)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(designation)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Info */}
            {filteredDesignations.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredDesignations.length} of {designations.length} designation(s)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Designation</DialogTitle>
            <DialogDescription>
              Create a new job position with salary range and hierarchy level
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">
                  Designation Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Senior Developer"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-code">
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SEN-DEV"
                />
                {formErrors.code && (
                  <p className="text-sm text-red-500">{formErrors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger id="add-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.department && (
                  <p className="text-sm text-red-500">{formErrors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-level">
                  Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger id="add-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-salary-min">
                  Minimum Salary <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-salary-min"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  placeholder="e.g., 50000"
                />
                {formErrors.salary_min && (
                  <p className="text-sm text-red-500">{formErrors.salary_min}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-salary-max">
                  Maximum Salary <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-salary-max"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  placeholder="e.g., 80000"
                />
                {formErrors.salary_max && (
                  <p className="text-sm text-red-500">{formErrors.salary_max}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description">Description</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter designation description and responsibilities..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="add-active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="add-active" className="cursor-pointer">
                Active Status
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Creating...' : 'Create Designation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Designation</DialogTitle>
            <DialogDescription>
              Update designation details and salary range
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Designation Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-code">
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
                {formErrors.code && (
                  <p className="text-sm text-red-500">{formErrors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger id="edit-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.department && (
                  <p className="text-sm text-red-500">{formErrors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-level">
                  Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger id="edit-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-salary-min">
                  Minimum Salary <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-salary-min"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                />
                {formErrors.salary_min && (
                  <p className="text-sm text-red-500">{formErrors.salary_min}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-salary-max">
                  Maximum Salary <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-salary-max"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                />
                {formErrors.salary_max && (
                  <p className="text-sm text-red-500">{formErrors.salary_max}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-active" className="cursor-pointer">
                Active Status
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Updating...' : 'Update Designation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Designation Details</DialogTitle>
            <DialogDescription>
              Complete information about this designation
            </DialogDescription>
          </DialogHeader>
          
          {selectedDesignation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{selectedDesignation.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Code</p>
                  <p className="text-lg font-mono">{selectedDesignation.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-lg">{selectedDesignation.department_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Level</p>
                  <Badge variant="outline" className="text-sm">{selectedDesignation.level}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Minimum Salary</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${Number(selectedDesignation.salary_min).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Maximum Salary</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ${Number(selectedDesignation.salary_max).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
                <p className="text-lg font-semibold">
                  ${(Number(selectedDesignation.salary_max) - Number(selectedDesignation.salary_min)).toLocaleString()}
                </p>
              </div>

              {selectedDesignation.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                    {selectedDesignation.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Staff Count</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-lg font-semibold">{selectedDesignation.staff_count || 0}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {selectedDesignation.is_active ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 mt-1">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1">Inactive</Badge>
                  )}
                </div>
              </div>

              {selectedDesignation.created_at && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(selectedDesignation.created_at).toLocaleDateString()}
                    {selectedDesignation.updated_at && (
                      <> • Updated: {new Date(selectedDesignation.updated_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowViewDialog(false)}
            >
              Close
            </Button>
            {selectedDesignation && (
              <Button
                onClick={() => {
                  setShowViewDialog(false);
                  openEditDialog(selectedDesignation);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the designation "{selectedDesignation?.name}".
              {selectedDesignation?.staff_count && selectedDesignation.staff_count > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    ⚠️ Warning: This designation has {selectedDesignation.staff_count} staff member(s) assigned.
                    You may need to reassign them first.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Designation;
