import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import authClient from '@/lib/http';
import { 
  DollarSign, TrendingUp, Clock, AlertCircle,
  Plus, Search, CheckCircle, XCircle, FileText, RefreshCw, Receipt
} from 'lucide-react';

interface ExpenseStats {
  total_claims: number;
  total_amount: number;
  approved_amount: number;
  pending_count: number;
  status_breakdown: {
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
    paid: number;
  };
  category_breakdown: Array<{
    category__name: string;
    total: number;
    count: number;
  }>;
}

interface ExpenseClaim {
  id: number;
  claim_number: string;
  employee: number;
  employee_name: string;
  employee_id_number: string;
  category: number;
  category_name: string;
  title: string;
  description: string;
  amount: string;
  expense_date: string;
  receipt_image?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  payment_date?: string;
  created_at: string;
  days_pending: number;
}

interface ExpenseCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  requires_receipt: boolean;
  max_amount?: string;
  is_active: boolean;
}

export default function ExpenseManagement() {
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter, selectedYear, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch expense statistics
      let statsUrl = `/api/admin/expense-claims/statistics/?year=${selectedYear}`;
      if (selectedMonth !== 'all') {
        statsUrl += `&month=${selectedMonth}`;
      }
      const statsRes = await authClient.get(statsUrl);
      setStats(statsRes.data);

      // Fetch expense claims
      let claimsUrl = '/api/admin/expense-claims/';
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (categoryFilter !== 'all') params.push(`category_id=${categoryFilter}`);
      if (params.length > 0) claimsUrl += `?${params.join('&')}`;
      
      const claimsRes = await authClient.get(claimsUrl);
      setClaims(claimsRes.data.results || claimsRes.data);

      // Fetch expense categories
      const categoriesRes = await authClient.get('/api/admin/expense-categories/?is_active=true');
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      toast.error('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async () => {
    if (!selectedClaim) return;
    
    try {
      await authClient.post(`/api/admin/expense-claims/${selectedClaim.id}/process/`, {
        action: approvalAction,
        notes: approvalNotes,
        ...(approvalAction === 'approve' && { payment_date: new Date().toISOString().split('T')[0] })
      });
      
      toast.success(`Expense claim ${approvalAction}d successfully`);
      setShowApprovalDialog(false);
      setSelectedClaim(null);
      setApprovalNotes('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${approvalAction} expense claim`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      paid: 'bg-blue-500'
    };
    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredClaims = claims.filter(claim =>
    claim.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.employee_id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">
            Track employee expenses, approve claims, and manage reimbursements
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_claims}</div>
              <p className="text-xs text-muted-foreground">
                {selectedMonth !== 'all' ? monthNames[selectedMonth - 1] : 'All months'} {selectedYear}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</div>
              <p className="text-xs text-muted-foreground">
                All claims
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.approved_amount)}</div>
              <p className="text-xs text-muted-foreground">
                Ready for payment
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_count}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims">Expense Claims</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Expense Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search claims..."
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
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Month</Label>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(v === 'all' ? 'all' : parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
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

          {/* Expense Claims Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Claims ({filteredClaims.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim #</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-sm">{claim.claim_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{claim.employee_name}</div>
                          <div className="text-xs text-muted-foreground">{claim.employee_id_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{claim.category_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{claim.title}</TableCell>
                      <TableCell>{new Date(claim.expense_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(claim.amount)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(claim.status)}
                          {claim.status === 'submitted' && claim.days_pending > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {claim.days_pending} days pending
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedClaim(claim)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {claim.status === 'submitted' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setApprovalAction('approve');
                                  setShowApprovalDialog(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setApprovalAction('reject');
                                  setShowApprovalDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
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

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {category.name}
                    <Badge variant="outline">{category.code}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Receipt className="h-4 w-4" />
                      <span>Receipt: {category.requires_receipt ? 'Required' : 'Optional'}</span>
                    </div>
                    {category.max_amount && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span>Max Amount: {formatCurrency(category.max_amount)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          {stats && stats.category_breakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expense by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Claims</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.category_breakdown.map((cat, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{cat.category__name}</TableCell>
                        <TableCell className="text-right">{cat.count}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(cat.total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(cat.total / cat.count)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Draft</span>
                      <Badge className="bg-gray-500">{stats.status_breakdown.draft}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Submitted</span>
                      <Badge className="bg-yellow-500">{stats.status_breakdown.submitted}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Approved</span>
                      <Badge className="bg-green-500">{stats.status_breakdown.approved}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rejected</span>
                      <Badge className="bg-red-500">{stats.status_breakdown.rejected}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Paid</span>
                      <Badge className="bg-blue-500">{stats.status_breakdown.paid}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Claim Detail Dialog */}
      {selectedClaim && !showApprovalDialog && (
        <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Expense Claim Details - {selectedClaim.claim_number}</DialogTitle>
              <DialogDescription>
                {selectedClaim.employee_name} • {new Date(selectedClaim.expense_date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Employee ID</Label>
                  <div className="font-medium">{selectedClaim.employee_id_number}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <div className="font-medium">{selectedClaim.category_name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="text-xl font-bold text-primary">{formatCurrency(selectedClaim.amount)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedClaim.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Title</Label>
                <div className="font-medium">{selectedClaim.title}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <div className="text-sm">{selectedClaim.description}</div>
              </div>

              {selectedClaim.receipt_image && (
                <div>
                  <Label className="text-muted-foreground">Receipt</Label>
                  <img 
                    src={selectedClaim.receipt_image} 
                    alt="Receipt" 
                    className="mt-2 rounded-lg border max-h-64 object-contain"
                  />
                </div>
              )}

              {selectedClaim.approved_by && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Approval Details</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div>Approved by: {selectedClaim.approved_by}</div>
                    <div>Approved on: {selectedClaim.approved_at && new Date(selectedClaim.approved_at).toLocaleDateString()}</div>
                    {selectedClaim.approval_notes && (
                      <div>Notes: {selectedClaim.approval_notes}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Approval Dialog */}
      {showApprovalDialog && selectedClaim && (
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Expense Claim
              </DialogTitle>
              <DialogDescription>
                {selectedClaim.claim_number} - {formatCurrency(selectedClaim.amount)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add approval notes (optional)"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                onClick={handleApproveReject}
              >
                {approvalAction === 'approve' ? 'Approve & Pay' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
