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

const FeeManagement = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockFees = [
      {
        id: 1,
        student_name: "John Smith",
        student_id: "2021001",
        class_name: "Class 10A",
        fee_type: "Tuition Fee",
        amount: 5000,
        due_date: "2024-11-15",
        status: "pending",
        paid_amount: 0
      },
      {
        id: 2,
        student_name: "Emma Johnson",
        student_id: "2021002", 
        class_name: "Class 10B",
        fee_type: "Tuition Fee",
        amount: 5000,
        due_date: "2024-11-15",
        status: "paid",
        paid_amount: 5000
      },
      {
        id: 3,
        student_name: "Michael Brown",
        student_id: "2021003",
        class_name: "Class 9A",
        fee_type: "Library Fee",
        amount: 500,
        due_date: "2024-12-01",
        status: "partial",
        paid_amount: 250
      },
      {
        id: 4,
        student_name: "Sarah Davis",
        student_id: "2021004",
        class_name: "Class 11A",
        fee_type: "Lab Fee",
        amount: 1500,
        due_date: "2024-11-30",
        status: "overdue",
        paid_amount: 0
      }
    ];

    const mockPayments = [
      {
        id: 1,
        student_name: "Emma Johnson",
        amount: 5000,
        payment_method: "Bank Transfer",
        payment_date: "2024-10-15",
        fee_type: "Tuition Fee",
        status: "completed"
      },
      {
        id: 2,
        student_name: "Michael Brown",
        amount: 250,
        payment_method: "Cash",
        payment_date: "2024-10-10",
        fee_type: "Library Fee",
        status: "completed"
      }
    ];

    setFees(mockFees);
    setPayments(mockPayments);
    setLoading(false);
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

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fee.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "all" || fee.class_name === selectedClass;
    const matchesStatus = selectedStatus === "all" || fee.status === selectedStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const sidebarItems = getAdminSidebarItems("/admin/fees");

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const collectedFees = fees.reduce((sum, fee) => sum + fee.paid_amount, 0);
  const pendingFees = totalFees - collectedFees;
  const collectionRate = totalFees > 0 ? (collectedFees / totalFees) * 100 : 0;

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
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
              <FontAwesomeIcon icon={faMoneyBillWave} className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${collectedFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {collectionRate.toFixed(1)}% collection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${pendingFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {fees.filter(f => f.status === 'pending').length} pending payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
              <Progress value={collectionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Fee Management Tabs */}
        <Tabs defaultValue="fees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fees">Fee Records</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="structure">Fee Structure</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
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
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fee.student_name}</div>
                              <div className="text-sm text-muted-foreground">{fee.student_id}</div>
                            </div>
                          </TableCell>
                          <TableCell>{fee.class_name}</TableCell>
                          <TableCell>{fee.fee_type}</TableCell>
                          <TableCell>${fee.amount}</TableCell>
                          <TableCell>${fee.paid_amount}</TableCell>
                          <TableCell>{fee.due_date}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(fee.status)}>
                              {fee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                              <Button size="sm" variant="outline">
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                              <Button size="sm" variant="outline">
                                <FontAwesomeIcon icon={faPrint} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
                <CardDescription>Track all payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.payment_date}</TableCell>
                          <TableCell>{payment.student_name}</TableCell>
                          <TableCell>{payment.fee_type}</TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700">
                              {payment.status}
                            </Badge>
                          </TableCell>
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure</CardTitle>
                <CardDescription>Configure fee types and amounts for different classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faDollarSign} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Fee Structure Configuration</h3>
                  <p className="text-muted-foreground mb-4">Set up fee types, amounts, and schedules for each class</p>
                  <Button>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Configure Fee Structure
                  </Button>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FeeManagement;