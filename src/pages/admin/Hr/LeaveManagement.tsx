import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import authClient from '@/lib/http';
import { 
  Calendar, Users, TrendingUp, Clock, Plus, RefreshCw,
  CheckCircle, XCircle, AlertCircle, FileText, Search
} from 'lucide-react';

interface LeaveBalance {
  id: number;
  employee: number;
  employee_name: string;
  employee_id_number: string;
  leave_type: number;
  leave_type_name: string;
  leave_type_is_paid: boolean;
  year: number;
  total_allocated: string;
  used: string;
  carried_forward: string;
  available: number;
}

interface LeaveApplication {
  id: number;
  employee: number;
  employee_name: string;
  employee_id_number: string;
  leave_type: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_date: string;
  approved_by?: string;
  approval_date?: string;
  approval_notes?: string;
}

interface LeavePolicy {
  id: number;
  name: string;
  description: string;
  designation_name?: string;
  department_name?: string;
  is_default: boolean;
  is_active: boolean;
  rules: Array<{
    id: number;
    leave_type_name: string;
    annual_quota: number;
    max_consecutive_days: number;
    carry_forward: boolean;
    max_carry_forward: number;
    requires_approval: boolean;
    min_advance_days: number;
  }>;
  total_annual_leaves: number;
}

interface Employee {
  id: number;
  name: string;
  employee_id: string;
  designation: { name: string };
  department: { name: string };
}

export default function LeaveManagement() {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [showInitializeDialog, setShowInitializeDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedYear, statusFilter, selectedEmployee]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch leave balances
      let balancesUrl = `/api/admin/employee-leave-balances/?year=${selectedYear}`;
      if (selectedEmployee) {
        balancesUrl += `&employee_id=${selectedEmployee}`;
      }
      const balancesRes = await authClient.get(balancesUrl);
      setLeaveBalances(balancesRes.data.results || balancesRes.data);

      // Fetch leave applications
      let applicationsUrl = '/api/admin/leave-applications/';
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (selectedEmployee) params.push(`employee=${selectedEmployee}`);
      if (params.length > 0) applicationsUrl += `?${params.join('&')}`;
      
      const applicationsRes = await authClient.get(applicationsUrl);
      setLeaveApplications(applicationsRes.data.results || applicationsRes.data);

      // Fetch leave policies
      const policiesRes = await authClient.get('/api/admin/leave-policies/?is_active=true');
      setLeavePolicies(policiesRes.data.results || policiesRes.data);

      // Fetch employees
      const employeesRes = await authClient.get('/api/admin/employees/?is_active=true');
      setEmployees(employeesRes.data.results || employeesRes.data);
    } catch (error) {
      console.error('Error fetching leave data:', error);
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeBalances = async () => {
    try {
      const response = await authClient.post('/api/admin/employee-leave-balances/initialize_balances/', {
        year: selectedYear,
        employee_ids: selectedEmployee ? [selectedEmployee] : undefined
      });

      toast.success(`Initialized ${response.data.created_count} leave balances successfully!`);
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} errors occurred`);
      }
      
      setShowInitializeDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to initialize leave balances');
    }
  };

  const handleApproveReject = async (applicationId: number, action: 'approve' | 'reject', notes: string = '') => {
    try {
      await authClient.post(`/api/admin/leave-applications/${applicationId}/${action}/`, {
        notes
      });
      toast.success(`Leave application ${action}d successfully`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} leave application`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-500', icon: Clock },
      approved: { color: 'bg-green-500', icon: CheckCircle },
      rejected: { color: 'bg-red-500', icon: XCircle }
    };
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredApplications = leaveApplications.filter(app =>
    app.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.employee_id_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateUtilization = (balance: LeaveBalance) => {
    const total = parseFloat(balance.total_allocated) + parseFloat(balance.carried_forward);
    const used = parseFloat(balance.used);
    return total > 0 ? (used / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage leave policies, balances, and approve leave applications
          </p>
        </div>
        <Dialog open={showInitializeDialog} onOpenChange={setShowInitializeDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Initialize Balances
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initialize Leave Balances</DialogTitle>
              <DialogDescription>
                Initialize leave balances for year {selectedYear}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Year</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Employee (Optional)</Label>
                <Select 
                  value={selectedEmployee?.toString() || ''} 
                  onValueChange={(v) => setSelectedEmployee(v ? parseInt(v) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All employees</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} ({emp.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInitializeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInitializeBalances}>
                  Initialize
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(leaveBalances.map(b => b.employee)).size}</div>
            <p className="text-xs text-muted-foreground">
              With leave balances
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveApplications.filter(app => app.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveApplications.filter(app => {
                if (app.status !== 'approved' || !app.approval_date) return false;
                const approvalDate = new Date(app.approval_date);
                const now = new Date();
                return approvalDate.getMonth() === now.getMonth() && 
                       approvalDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leavePolicies.length}</div>
            <p className="text-xs text-muted-foreground">
              Leave policies configured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="balances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
          <TabsTrigger value="applications">Leave Applications</TabsTrigger>
          <TabsTrigger value="policies">Leave Policies</TabsTrigger>
        </TabsList>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Year</Label>
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2023, 2024, 2025, 2026].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employee</Label>
                  <Select 
                    value={selectedEmployee?.toString() || 'all'} 
                    onValueChange={(v) => setSelectedEmployee(v === 'all' ? null : parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Balances Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances ({leaveBalances.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead className="text-center">Allocated</TableHead>
                    <TableHead className="text-center">Carried Forward</TableHead>
                    <TableHead className="text-center">Used</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead>Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveBalances.map((balance) => {
                    const utilization = calculateUtilization(balance);
                    return (
                      <TableRow key={balance.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{balance.employee_name}</div>
                            <div className="text-xs text-muted-foreground">{balance.employee_id_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {balance.leave_type_name}
                            {balance.leave_type_is_paid && (
                              <Badge variant="outline" className="text-xs">Paid</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{balance.total_allocated}</TableCell>
                        <TableCell className="text-center">{balance.carried_forward}</TableCell>
                        <TableCell className="text-center text-red-600">{balance.used}</TableCell>
                        <TableCell className="text-center font-bold text-green-600">
                          {balance.available.toFixed(1)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={utilization} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {utilization.toFixed(0)}% used
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employee</Label>
                  <Select 
                    value={selectedEmployee?.toString() || 'all'} 
                    onValueChange={(v) => setSelectedEmployee(v === 'all' ? null : parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Applications ({filteredApplications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.employee_name}</div>
                          <div className="text-xs text-muted-foreground">{application.employee_id_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{application.leave_type_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(application.start_date).toLocaleDateString()} - <br />
                          {new Date(application.end_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">{application.total_days}</TableCell>
                      <TableCell className="max-w-xs truncate">{application.reason}</TableCell>
                      <TableCell>{new Date(application.applied_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveReject(application.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproveReject(application.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {application.status !== 'pending' && (
                          <div className="text-xs text-muted-foreground">
                            {application.approved_by && `By ${application.approved_by}`}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {leavePolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {policy.name}
                    {policy.is_default && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {policy.designation_name && `For ${policy.designation_name}`}
                    {policy.department_name && `Department: ${policy.department_name}`}
                    {!policy.designation_name && !policy.department_name && 'Universal Policy'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Leave Allocations</h4>
                      <div className="space-y-2">
                        {policy.rules.map((rule) => (
                          <div key={rule.id} className="flex justify-between items-center text-sm border-b pb-2">
                            <span>{rule.leave_type_name}</span>
                            <div className="flex items-center gap-4">
                              <span className="font-bold">{rule.annual_quota} days</span>
                              {rule.carry_forward && (
                                <Badge variant="outline" className="text-xs">
                                  CF: {rule.max_carry_forward}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Total Annual Leaves:</span>
                      <span className="text-lg font-bold text-primary">
                        {policy.total_annual_leaves} days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
