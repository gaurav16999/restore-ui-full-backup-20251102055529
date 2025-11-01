import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faDollarSign, 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash, 
  faEye, 
  faFileInvoiceDollar,
  faMoneyBillWave,
  faChartLine,
  faCalendarCheck,
  faDownload,
  faPrint
} from "@fortawesome/free-solid-svg-icons";
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
import { useToast } from "@/hooks/use-toast";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/api";

interface FeeStructure {
  id: number;
  name: string;
  fee_type: string;
  amount: string;
  frequency: string;
  class_assigned: number | null;
  class_name?: string;
  grade_level: string;
  is_mandatory: boolean;
  is_active: boolean;
  due_date: string | null;
  description: string;
}

interface FeePayment {
  id: number;
  student: number;
  student_name: string;
  student_roll_no: string;
  fee_structure: number;
  fee_type: string;
  invoice_number: string;
  amount_due: string;
  amount_paid: string;
  balance: string | number;  // Can be string or number from backend
  payment_method: string;
  transaction_id: string;
  status: string;
  payment_date: string | null;
  due_date: string;
  late_fee: string;
  discount: string;
  remarks: string;
}

interface FeeStats {
  total_due: number;
  total_paid: number;
  total_balance: number;
  total_pending: number;
  total_overdue: number;
  this_month_collection: number;
}

const FeeManagement = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch fee structures, payments, and stats
      const [structuresRes, paymentsRes, statsRes] = await Promise.all([
        authClient.get('/api/admin/fee-structures/'),
        authClient.get('/api/admin/fee-payments/'),
        authClient.get('/api/admin/fee-payments/stats/')
      ]);

      const structures = Array.isArray(structuresRes.data) 
        ? structuresRes.data 
        : structuresRes.data.results || [];
      
      const paymentData = Array.isArray(paymentsRes.data)
        ? paymentsRes.data
        : paymentsRes.data.results || [];

      setFeeStructures(structures);
      setPayments(paymentData);
      setStats(statsRes.data);

    } catch (error: any) {
      console.error('Failed to fetch fee data:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch fee data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "partial": return "bg-blue-100 text-blue-700";
      case "overdue": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const recordPayment = async () => {
    if (!selectedPayment || !paymentAmount) {
      toast({
        title: "Error",
        description: "Please enter payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await authClient.post(`/api/admin/fee-payments/${selectedPayment.id}/record_payment/`, {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        transaction_id: `TXN${Date.now()}`
      });

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      setRecordPaymentOpen(false);
      setPaymentAmount("");
      setPaymentMethod("");
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.student_roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || payment.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sidebarItems = getAdminSidebarItems("/admin/fees");

  return (
    <DashboardLayout
      title="Fee Management"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Fee Management</h2>
            <p className="text-muted-foreground">Manage student fees, payments, and financial records</p>
          </div>
          <div className="flex gap-3">
            <Button>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Fee Structure
            </Button>
            <Button variant="outline">
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" />
              Generate Invoices
            </Button>
          </div>
        </div>

        {/* Fee Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Due</CardTitle>
              <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs.{stats?.total_due.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total amount due
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
              <FontAwesomeIcon icon={faMoneyBillWave} className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats?.total_paid.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats ? ((stats.total_paid / stats.total_due) * 100).toFixed(1) : 0}% collection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">Rs.{stats?.total_balance.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_pending || 0} pending | {stats?.total_overdue || 0} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Rs.{stats?.this_month_collection.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Monthly collection
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Fee Management Tabs */}
        <Tabs defaultValue="fees" className="space-y-4">
          <TabsList>
              <TabsTrigger value="fees">Fee Records</TabsTrigger>
              <TabsTrigger value="generate">Generate Fees Invoice</TabsTrigger>
              <TabsTrigger value="collect">Collect Fees</TabsTrigger>
              <TabsTrigger value="payments">Fees Paid Slip</TabsTrigger>
              <TabsTrigger value="defaulters">Fees Defaulters</TabsTrigger>
              <TabsTrigger value="reports">Fees Report</TabsTrigger>
              <TabsTrigger value="delete">Delete Fees</TabsTrigger>
              <TabsTrigger value="structure">Fee Structure</TabsTrigger>
            </TabsList>

          <TabsContent value="fees" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Records</CardTitle>
                <CardDescription>Manage student fee records and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Students</Label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name or student ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="Class 9A">Class 9A</SelectItem>
                        <SelectItem value="Class 10A">Class 10A</SelectItem>
                        <SelectItem value="Class 10B">Class 10B</SelectItem>
                        <SelectItem value="Class 11A">Class 11A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Payment Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Fee Records Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount Due</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No fee records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono text-sm">{payment.invoice_number}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{payment.student_name}</div>
                                <div className="text-sm text-muted-foreground">{payment.student_roll_no}</div>
                              </div>
                            </TableCell>
                            <TableCell>{payment.fee_type}</TableCell>
                            <TableCell>Rs.{parseFloat(payment.amount_due).toFixed(2)}</TableCell>
                            <TableCell className="text-green-600">Rs.{parseFloat(payment.amount_paid).toFixed(2)}</TableCell>
                            <TableCell className="text-yellow-600">Rs.{parseFloat(payment.balance.toString()).toFixed(2)}</TableCell>
                            <TableCell>{new Date(payment.due_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {payment.status !== 'paid' && (
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => {
                                      setSelectedPayment(payment);
                                      setRecordPaymentOpen(true);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-1" />
                                    Pay
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  <FontAwesomeIcon icon={faEye} />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <FontAwesomeIcon icon={faPrint} />
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
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all completed payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : payments.filter(p => p.status === 'paid' && p.payment_date).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No payment history found
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments
                          .filter(p => p.status === 'paid' && p.payment_date)
                          .map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-mono text-sm">{payment.invoice_number}</TableCell>
                              <TableCell>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{payment.student_name}</div>
                                  <div className="text-sm text-muted-foreground">{payment.student_roll_no}</div>
                                </div>
                              </TableCell>
                              <TableCell>{payment.fee_type}</TableCell>
                              <TableCell className="text-green-600 font-semibold">Rs.{parseFloat(payment.amount_paid).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {payment.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{payment.transaction_id || '-'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <FontAwesomeIcon icon={faDownload} />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <FontAwesomeIcon icon={faPrint} />
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
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Fee Structure</CardTitle>
                  <CardDescription>Configure fee types and amounts for different classes</CardDescription>
                </div>
                <Button>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Fee Structure
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Class/Grade</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : feeStructures.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <FontAwesomeIcon icon={faDollarSign} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Fee Structures Found</h3>
                            <p className="text-muted-foreground mb-4">Set up fee types, amounts, and schedules for each class</p>
                            <Button>
                              <FontAwesomeIcon icon={faPlus} className="mr-2" />
                              Create Fee Structure
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        feeStructures.map((structure) => (
                          <TableRow key={structure.id}>
                            <TableCell className="font-medium">{structure.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {structure.fee_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">Rs.{parseFloat(structure.amount).toFixed(2)}</TableCell>
                            <TableCell>{structure.frequency.replace('_', ' ')}</TableCell>
                            <TableCell>{structure.class_name || structure.grade_level || 'All'}</TableCell>
                            <TableCell>{structure.due_date ? new Date(structure.due_date).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>
                              <Badge className={structure.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {structure.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <FontAwesomeIcon icon={faTrash} />
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
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate comprehensive financial reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Collection Report</h4>
                    <p className="text-sm text-muted-foreground mb-4">Monthly fee collection summary</p>
                    <Button variant="outline" className="w-full">
                      <FontAwesomeIcon icon={faDownload} className="mr-2" />
                      Generate Report
                    </Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Outstanding Fees</h4>
                    <p className="text-sm text-muted-foreground mb-4">List of pending payments</p>
                    <Button variant="outline" className="w-full">
                      <FontAwesomeIcon icon={faDownload} className="mr-2" />
                      Generate Report
                    </Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Financial Summary</h4>
                    <p className="text-sm text-muted-foreground mb-4">Complete financial overview</p>
                    <Button variant="outline" className="w-full">
                      <FontAwesomeIcon icon={faDownload} className="mr-2" />
                      Generate Report
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Fees Invoice */}
          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Fees Invoice</CardTitle>
                <CardDescription>Create bulk invoices for selected classes or students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Class / Group</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class 9A">Class 9A</SelectItem>
                        <SelectItem value="Class 10A">Class 10A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button>
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collect Fees (quick payment UI) */}
          <TabsContent value="collect" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Collect Fees</CardTitle>
                <CardDescription>Quickly record incoming payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">Search student and record payment</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input placeholder="Search student by name or roll" />
                  <Input placeholder="Invoice #" />
                  <Input placeholder="Amount" type="number" />
                </div>
                <div className="flex justify-end mt-4">
                  <Button>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                    Record Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Defaulters */}
          <TabsContent value="defaulters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fees Defaulters</CardTitle>
                <CardDescription>Students with overdue fees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">List of students with unpaid or overdue invoices</p>
                <div className="rounded-md border p-4">
                  <p className="text-muted-foreground">This list is generated from unpaid invoices. Use filters above to narrow results.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delete Fees (careful) */}
          <TabsContent value="delete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delete Fees</CardTitle>
                <CardDescription>Delete fee records or invoices (use with caution)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 mb-4">Deleting fees is irreversible. Please ensure you have backups.</p>
                <div className="flex gap-3">
                  <Input placeholder="Invoice # or student ID" />
                  <Button variant="destructive">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Record Payment Dialog */}
        <Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for {selectedPayment?.student_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Invoice Number</Label>
                <Input value={selectedPayment?.invoice_number || ''} disabled />
              </div>
              <div>
                <Label>Fee Type</Label>
                <Input value={selectedPayment?.fee_type || ''} disabled />
              </div>
              <div>
                <Label>Balance Due</Label>
                <Input value={`Rs.${selectedPayment ? parseFloat(selectedPayment.balance.toString()).toFixed(2) : '0.00'}`} disabled />
              </div>
              <div>
                <Label htmlFor="paymentAmount">Payment Amount *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedPayment?.balance}
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecordPaymentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={recordPayment}>
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FeeManagement;