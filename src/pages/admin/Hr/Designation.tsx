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
  Download, 
  MoreVertical,
  Edit, 
  Trash2, 
  Eye,
  Users,
  Briefcase,
  GraduationCap,
  Shield,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { designationApi, type Designation } from '@/services/adminApi';

interface Employee {
  id: number;
  name: string;
  employee_id: string;
  designation?: number;
  designation_name?: string;
  department?: number;
  department_name?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  join_date?: string;
}

// School-specific designation presets
const SCHOOL_DESIGNATIONS = {
  teaching: [
    { title: 'Principal', description: 'Head of the school, overall management and administration' },
    { title: 'Vice Principal', description: 'Assistant to Principal, manages academic affairs' },
    { title: 'Head of Department (HOD)', description: 'Leads a specific academic department' },
    { title: 'Senior Teacher', description: 'Experienced teacher with mentorship responsibilities' },
    { title: 'Teacher', description: 'Primary teaching staff member' },
    { title: 'Assistant Teacher', description: 'Entry-level teaching position' },
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
  ],
};

const TYPE_OPTIONS = [
  { value: 'teaching', label: 'Teaching Staff', icon: GraduationCap, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'administrative', label: 'Administrative', icon: Briefcase, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  { value: 'support', label: 'Support Staff', icon: Shield, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
];

interface FormData {
  title: string;
  description: string;
  designation_type: string;
  is_active: boolean;
}

const Designation = () => {
  const sidebarItems = getAdminSidebarItems("/admin/hr/designation");
  const { toast } = useToast();

  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEmployeesDialog, setShowEmployeesDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [designationEmployees, setDesignationEmployees] = useState<Employee[]>([]);
  const [quickAddType, setQuickAddType] = useState<string>("teaching");
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    designation_type: "teaching",
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const stats = {
    total: designations.length,
    teaching: designations.filter(d => d.designation_type === 'teaching').length,
    administrative: designations.filter(d => d.designation_type === 'administrative').length,
    support: designations.filter(d => d.designation_type === 'support').length,
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  const loadDesignations = async () => {
    setLoading(true);
    try {
      const api = (await import('@/services/adminApi')).designationApi;
      const data = await api.getAll();
      const results = Array.isArray(data) ? data : (data as any)?.results || [];
      setDesignations(results);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load designations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDesignations = designations.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || d.designation_type === filterType;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && d.is_active) || 
      (filterStatus === "inactive" && !d.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      designation_type: "teaching",
      is_active: true,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const api = (await import('@/services/adminApi')).designationApi;
      await api.create(formData);
      
      toast({
        title: 'Success',
        description: 'Designation created successfully',
      });
      
      setShowAddDialog(false);
      resetForm();
      loadDesignations();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create designation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (designation: { title: string; description: string }) => {
    setLoading(true);
    try {
      const api = (await import('@/services/adminApi')).designationApi;
      await api.create({
        ...designation,
        designation_type: quickAddType,
        is_active: true,
      });
      
      toast({
        title: 'Success',
        description: `${designation.title} added successfully`,
      });
      
      loadDesignations();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add designation',
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
      await api.update(selectedDesignation.id, formData);
      
      toast({
        title: 'Success',
        description: 'Designation updated successfully',
      });
      
      setShowEditDialog(false);
      resetForm();
      setSelectedDesignation(null);
      loadDesignations();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update designation',
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
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete designation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (designation: Designation) => {
    setSelectedDesignation(designation);
    setFormData({
      title: designation.title,
      description: designation.description || "",
      designation_type: designation.designation_type,
      is_active: designation.is_active,
    });
    setShowEditDialog(true);
  };

  const loadDesignationEmployees = async (designationId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/designations/${designationId}/employees/`);
      if (response.ok) {
        const data = await response.json();
        setDesignationEmployees(data);
        setShowEmployeesDialog(true);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Type', 'Staff Count', 'Status'];
    const rows = filteredDesignations.map(d => [
      d.title,
      TYPE_OPTIONS.find(t => t.value === d.designation_type)?.label || d.designation_type,
      d.staff_count || 0,
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
    a.download = `designations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userName="Admin" userRole="Administrator" title="Designation Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teaching}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrative</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.administrative}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Staff</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.support}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>School Designations</CardTitle>
                <CardDescription>Manage teaching, administrative, and support staff positions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowQuickAddDialog(true)}
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Quick Add
                </Button>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search designations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {TYPE_OPTIONS.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={loadDesignations} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button onClick={exportToCSV} variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredDesignations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No designations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDesignations.map((designation) => {
                      const typeInfo = TYPE_OPTIONS.find(t => t.value === designation.designation_type);
                      return (
                        <TableRow key={designation.id}>
                          <TableCell className="font-medium">{designation.title}</TableCell>
                          <TableCell>
                            <Badge className={typeInfo?.color}>
                              {typeInfo?.label || designation.designation_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              {designation.staff_count || 0}
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
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedDesignation(designation);
                                  setShowViewDialog(true);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(designation)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDesignation(designation);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredDesignations.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredDesignations.length} of {designations.length} designation(s)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={showQuickAddDialog} onOpenChange={setShowQuickAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Add School Positions</DialogTitle>
            <DialogDescription>
              Select pre-defined school designations to add quickly
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={quickAddType} onValueChange={setQuickAddType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid gap-2 max-h-[400px] overflow-y-auto">
              {SCHOOL_DESIGNATIONS[quickAddType as keyof typeof SCHOOL_DESIGNATIONS].map((designation, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{designation.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{designation.description}</p>
                    </div>
                    <Button
                      onClick={() => handleQuickAdd(designation)}
                      size="sm"
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickAddDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Designation</DialogTitle>
            <DialogDescription>Create a custom position for your school</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Music Teacher"
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.designation_type}
                onValueChange={(value) => setFormData({ ...formData, designation_type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role and responsibilities..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active Status</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Designation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.designation_type}
                onValueChange={(value) => setFormData({ ...formData, designation_type: value })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="edit-active" className="cursor-pointer">Active Status</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Designation Details</DialogTitle>
          </DialogHeader>
          
          {selectedDesignation && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-lg font-semibold">{selectedDesignation.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge className={TYPE_OPTIONS.find(t => t.value === selectedDesignation.designation_type)?.color}>
                  {TYPE_OPTIONS.find(t => t.value === selectedDesignation.designation_type)?.label}
                </Badge>
              </div>

              {selectedDesignation.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedDesignation.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Staff Count</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-5 h-5" />
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

              {selectedDesignation.staff_count && selectedDesignation.staff_count > 0 && (
                <div>
                  <Button
                    onClick={() => loadDesignationEmployees(selectedDesignation.id)}
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View {selectedDesignation.staff_count} Staff Member(s)
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            {selectedDesignation && (
              <Button onClick={() => {
                setShowViewDialog(false);
                openEditDialog(selectedDesignation);
              }} className="bg-purple-600 hover:bg-purple-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedDesignation?.title}".
              {selectedDesignation?.staff_count && selectedDesignation.staff_count > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    ⚠️ Warning: This designation has {selectedDesignation.staff_count} staff member(s).
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

      {/* Employees Dialog */}
      <Dialog open={showEmployeesDialog} onOpenChange={setShowEmployeesDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Staff Members - {selectedDesignation?.title}
            </DialogTitle>
            <DialogDescription>
              Employees with this designation and their auto-generated employee IDs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading employees...
              </div>
            ) : designationEmployees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No employees found for this designation
              </div>
            ) : (
              <div className="space-y-2">
                {designationEmployees.map((employee) => (
                  <Card key={employee.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{employee.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="outline" className="text-sm font-semibold tracking-wide">
                                {employee.employee_id}
                              </Badge>
                              {employee.department_name && (
                                <span className="text-xs text-muted-foreground">
                                  {employee.department_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {(employee.email || employee.phone) && (
                          <div className="mt-2 ml-13 text-sm text-muted-foreground">
                            {employee.email && <div>📧 {employee.email}</div>}
                            {employee.phone && <div>📱 {employee.phone}</div>}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {employee.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {employee.join_date && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Joined: {new Date(employee.join_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEmployeesDialog(false);
                setDesignationEmployees([]);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Designation;
