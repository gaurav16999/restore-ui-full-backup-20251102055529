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
import { toast } from 'sonner';
import authClient from '@/lib/http';
import { 
  DollarSign, Users, TrendingUp, Calendar, 
  Plus, Edit, Trash2, Download, Send, CheckCircle,
  FileText, Search, Filter, RefreshCw, AlertCircle
} from 'lucide-react';

interface PayrollStats {
  total_payslips: number;
  total_gross: number;
  total_net: number;
  total_allowances: number;
  total_deductions: number;
  status_breakdown: {
    draft: number;
    generated: number;
    sent: number;
    paid: number;
  };
}

interface SalaryStructure {
  id: number;
  employee: number;
  employee_name: string;
  employee_id_number: string;
  designation: string;
  department: string;
  basic_salary: string;
  total_allowances: number;
  total_deductions: number;
  gross_salary: number;
  net_salary: number;
  effective_date: string;
  is_active: boolean;
  allowances: Array<{
    id: number;
    allowance_name: string;
    amount: string;
  }>;
  deductions: Array<{
    id: number;
    deduction_name: string;
    amount: string;
  }>;
}

interface Payslip {
  id: number;
  employee: number;
  employee_name: string;
  employee_id_number: string;
  designation: string;
  department: string;
  month: number;
  year: number;
  basic_salary: string;
  total_allowances: string;
  total_deductions: string;
  gross_salary: string;
  net_salary: string;
  working_days: number;
  present_days: number;
  leaves_taken: number;
  status: 'draft' | 'generated' | 'sent' | 'paid';
  payment_date?: string;
  payment_method: string;
  generated_at: string;
  allowance_items: Array<{
    allowance_name: string;
    amount: string;
  }>;
  deduction_items: Array<{
    deduction_name: string;
    amount: string;
  }>;
}

interface Employee {
  id: number;
  name: string;
  employee_id: string;
  designation: { name: string };
  department: { name: string };
}

export default function PayrollManagement() {
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch payroll statistics
      const statsRes = await authClient.get(`/api/admin/payslips/statistics/?month=${selectedMonth}&year=${selectedYear}`);
      setStats(statsRes.data);

      // Fetch payslips
      const payslipsRes = await authClient.get(`/api/admin/payslips/?month=${selectedMonth}&year=${selectedYear}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`);
      setPayslips(payslipsRes.data.results || payslipsRes.data);

      // Fetch salary structures
      const structuresRes = await authClient.get('/api/admin/employee-salary-structures/?is_active=true');
      setSalaryStructures(structuresRes.data.results || structuresRes.data);

      // Fetch employees
      const employeesRes = await authClient.get('/api/admin/employees/?is_active=true');
      setEmployees(employeesRes.data.results || employeesRes.data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = async () => {
    try {
      const response = await authClient.post('/api/admin/payslips/generate_bulk/', {
        employee_ids: selectedEmployees.length > 0 ? selectedEmployees : undefined,
        month: selectedMonth,
        year: selectedYear,
        payment_method: 'Bank Transfer'
      });

      toast.success(`Generated ${response.data.generated_count} payslips successfully!`);
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} errors occurred`);
      }
      
      setShowGenerateDialog(false);
      setSelectedEmployees([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate payslips');
    }
  };

  const handleMarkPaid = async (payslipId: number) => {
    try {
      await authClient.post(`/api/admin/payslips/${payslipId}/mark_paid/`, {
        payment_date: new Date().toISOString().split('T')[0]
      });
      toast.success('Payslip marked as paid');
      fetchData();
    } catch (error) {
      toast.error('Failed to mark payslip as paid');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-500',
      generated: 'bg-blue-500',
      sent: 'bg-yellow-500',
      paid: 'bg-green-500'
    };
    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredPayslips = payslips.filter(payslip =>
    payslip.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payslip.employee_id_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: string | number) => {
    return `₹${parseFloat(amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage employee salaries, generate payslips, and track payments
          </p>
        </div>
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Payslips
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Payslips</DialogTitle>
              <DialogDescription>
                Generate payslips for {monthNames[selectedMonth - 1]} {selectedYear}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Month</Label>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, idx) => (
                        <SelectItem key={idx} value={(idx + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
              
              <div>
                <Label>Select Employees (Leave empty for all)</Label>
                <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-2">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees([...selectedEmployees, emp.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {emp.name} ({emp.employee_id}) - {emp.designation?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGeneratePayslips}>
                  Generate {selectedEmployees.length > 0 ? selectedEmployees.length : 'All'} Payslips
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_payslips}</div>
              <p className="text-xs text-muted-foreground">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_gross)}</div>
              <p className="text-xs text-muted-foreground">
                Before deductions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Salary</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_net)}</div>
              <p className="text-xs text-muted-foreground">
                After deductions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.status_breakdown.paid}</div>
              <p className="text-xs text-muted-foreground">
                {stats.status_breakdown.generated} pending payment
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="payslips" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="salary-structures">Salary Structures</TabsTrigger>
        </TabsList>

        {/* Payslips Tab */}
        <TabsContent value="payslips" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Month</Label>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, idx) => (
                        <SelectItem key={idx} value={(idx + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Payslips Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payslips ({filteredPayslips.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payslip.employee_name}</div>
                          <div className="text-xs text-muted-foreground">{payslip.employee_id_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payslip.department}</TableCell>
                      <TableCell>
                        {monthNames[payslip.month - 1]} {payslip.year}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.gross_salary)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.total_deductions)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(payslip.net_salary)}</TableCell>
                      <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPayslip(payslip)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {payslip.status === 'generated' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleMarkPaid(payslip.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Structures Tab */}
        <TabsContent value="salary-structures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Salary Structures ({salaryStructures.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">Allowances</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Effective Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{structure.employee_name}</div>
                          <div className="text-xs text-muted-foreground">{structure.employee_id_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{structure.designation}</TableCell>
                      <TableCell className="text-right">{formatCurrency(structure.basic_salary)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        +{formatCurrency(structure.total_allowances)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(structure.total_deductions)}
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(structure.net_salary)}</TableCell>
                      <TableCell>{new Date(structure.effective_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payslip Detail Dialog */}
      {selectedPayslip && (
        <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payslip Details</DialogTitle>
              <DialogDescription>
                {monthNames[selectedPayslip.month - 1]} {selectedPayslip.year} - {selectedPayslip.employee_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Employee ID</Label>
                  <div className="font-medium">{selectedPayslip.employee_id_number}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Designation</Label>
                  <div className="font-medium">{selectedPayslip.designation}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <div className="font-medium">{selectedPayslip.department}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedPayslip.status)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Attendance</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Working Days</Label>
                    <div className="font-medium">{selectedPayslip.working_days}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Present Days</Label>
                    <div className="font-medium">{selectedPayslip.present_days}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Leaves</Label>
                    <div className="font-medium">{selectedPayslip.leaves_taken}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-medium">{formatCurrency(selectedPayslip.basic_salary)}</span>
                  </div>
                  {selectedPayslip.allowance_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.allowance_name}</span>
                      <span className="text-green-600">+{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Gross Salary</span>
                    <span>{formatCurrency(selectedPayslip.gross_salary)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Deductions</h4>
                <div className="space-y-2">
                  {selectedPayslip.deduction_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.deduction_name}</span>
                      <span className="text-red-600">-{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Deductions</span>
                    <span className="text-red-600">-{formatCurrency(selectedPayslip.total_deductions)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 bg-primary/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Net Salary</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(selectedPayslip.net_salary)}</span>
                </div>
              </div>

              {selectedPayslip.payment_date && (
                <div className="text-sm text-muted-foreground">
                  Paid on: {new Date(selectedPayslip.payment_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
