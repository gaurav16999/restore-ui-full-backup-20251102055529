import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import authClient from '@/lib/http';
import { 
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  Plus, Search, RefreshCw, CheckCircle, FileText, Calendar
} from 'lucide-react';

interface BudgetSummary {
  fiscal_year: number;
  total_allocated: number;
  total_spent: number;
  department_breakdown: Array<{
    department__name: string;
    allocated: number;
    spent: number;
  }>;
  over_budget_count: number;
  critical_budgets: Array<{
    department: string;
    account: string;
    utilization: number;
  }>;
}

interface JournalEntry {
  id: number;
  entry_number: string;
  entry_date: string;
  description: string;
  reference: string;
  status: 'draft' | 'posted' | 'cancelled';
  total_debit: string;
  total_credit: string;
  is_balanced: boolean;
  created_by_name: string;
  created_at: string;
  posted_at?: string;
  lines: Array<{
    account_name: string;
    account_code: string;
    description: string;
    debit: string;
    credit: string;
  }>;
}

interface BudgetAllocation {
  id: number;
  department: number;
  department_name: string;
  account: number;
  account_name: string;
  account_code: string;
  fiscal_year: number;
  allocated_amount: string;
  spent_amount: string;
  remaining_budget: number;
  utilization_percentage: number;
  status: 'healthy' | 'moderate' | 'high' | 'exceeded';
  is_active: boolean;
}

export default function AccountingManagement() {
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(new Date().getFullYear());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, selectedFiscalYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch budget summary
      const budgetRes = await authClient.get(`/api/admin/budget-allocations/summary/?fiscal_year=${selectedFiscalYear}`);
      setBudgetSummary(budgetRes.data);

      // Fetch journal entries
      let entriesUrl = '/api/admin/journal-entries/';
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (params.length > 0) entriesUrl += `?${params.join('&')}`;
      
      const entriesRes = await authClient.get(entriesUrl);
      setJournalEntries(entriesRes.data.results || entriesRes.data);

      // Fetch budget allocations
      const allocationsRes = await authClient.get(`/api/admin/budget-allocations/?fiscal_year=${selectedFiscalYear}`);
      setBudgetAllocations(allocationsRes.data.results || allocationsRes.data);
    } catch (error) {
      console.error('Error fetching accounting data:', error);
      toast.error('Failed to load accounting data');
    } finally {
      setLoading(false);
    }
  };

  const handlePostEntry = async (entryId: number) => {
    try {
      await authClient.post(`/api/admin/journal-entries/${entryId}/post/`);
      toast.success('Journal entry posted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to post journal entry');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-500',
      posted: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getBudgetStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      healthy: 'bg-green-500',
      moderate: 'bg-yellow-500',
      high: 'bg-orange-500',
      exceeded: 'bg-red-500'
    };
    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredEntries = journalEntries.filter(entry =>
    entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: string | number) => {
    return `₹${parseFloat(amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          <h1 className="text-3xl font-bold">Accounting Management</h1>
          <p className="text-muted-foreground">
            Journal entries, budget tracking, and financial reports
          </p>
        </div>
      </div>

      {/* Budget Summary Cards */}
      {budgetSummary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(budgetSummary.total_allocated)}</div>
              <p className="text-xs text-muted-foreground">
                FY {budgetSummary.fiscal_year}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(budgetSummary.total_spent)}</div>
              <p className="text-xs text-muted-foreground">
                {((budgetSummary.total_spent / budgetSummary.total_allocated) * 100).toFixed(1)}% utilized
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(budgetSummary.total_allocated - budgetSummary.total_spent)}
              </div>
              <p className="text-xs text-muted-foreground">
                Available balance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Budgets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetSummary.critical_budgets.length}</div>
              <p className="text-xs text-muted-foreground">
                {budgetSummary.over_budget_count} over budget
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="journal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="budget">Budget Allocations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Journal Entries Tab */}
        <TabsContent value="journal" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
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
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journal Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries ({filteredEntries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{entry.entry_number}</TableCell>
                      <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                      <TableCell>{entry.reference || 'N/A'}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(entry.total_debit)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(entry.total_credit)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(entry.status)}
                          {!entry.is_balanced && (
                            <div className="text-xs text-red-600">Unbalanced</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {entry.status === 'draft' && entry.is_balanced && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePostEntry(entry.id)}
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

        {/* Budget Allocations Tab */}
        <TabsContent value="budget" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Fiscal Year</Label>
                <Select value={selectedFiscalYear.toString()} onValueChange={(v) => setSelectedFiscalYear(parseInt(v))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        FY {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocations ({budgetAllocations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>{allocation.department_name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{allocation.account_name}</div>
                          <div className="text-xs text-muted-foreground">{allocation.account_code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(allocation.allocated_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(allocation.spent_amount)}</TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={allocation.remaining_budget < 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatCurrency(allocation.remaining_budget)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 w-32">
                          <Progress value={Math.min(allocation.utilization_percentage, 100)} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {allocation.utilization_percentage.toFixed(1)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getBudgetStatusBadge(allocation.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {/* Critical Budgets Alert */}
          {budgetSummary && budgetSummary.critical_budgets.length > 0 && (
            <Card className="border-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Critical Budget Alerts
                </CardTitle>
                <CardDescription>
                  Budgets with over 80% utilization or exceeded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Utilization</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetSummary.critical_budgets.map((budget, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{budget.department}</TableCell>
                        <TableCell>{budget.account}</TableCell>
                        <TableCell className="text-right font-bold">
                          <span className={budget.utilization > 100 ? 'text-red-600' : 'text-orange-600'}>
                            {budget.utilization.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {getBudgetStatusBadge(budget.utilization > 100 ? 'exceeded' : 'high')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Department Budget Breakdown */}
          {budgetSummary && budgetSummary.department_breakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Department Budget Summary</CardTitle>
                <CardDescription>FY {budgetSummary.fiscal_year}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead className="text-right">Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetSummary.department_breakdown.map((dept, idx) => {
                      const utilization = (dept.spent / dept.allocated) * 100;
                      return (
                        <TableRow key={idx}>
                          <TableCell>{dept.department__name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dept.allocated)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dept.spent)}</TableCell>
                          <TableCell className="text-right font-bold">
                            <span className={dept.allocated - dept.spent < 0 ? 'text-red-600' : 'text-green-600'}>
                              {formatCurrency(dept.allocated - dept.spent)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={utilization > 100 ? 'text-red-600' : utilization > 80 ? 'text-orange-600' : 'text-green-600'}>
                              {utilization.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Journal Entry Detail Dialog */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Journal Entry - {selectedEntry.entry_number}</DialogTitle>
              <DialogDescription>
                {new Date(selectedEntry.entry_date).toLocaleDateString()} • {selectedEntry.created_by_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedEntry.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reference</Label>
                  <div className="font-medium">{selectedEntry.reference || 'N/A'}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <div>{selectedEntry.description}</div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Journal Lines</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lines.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{line.account_name}</div>
                            <div className="text-xs text-muted-foreground">{line.account_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{line.description}</TableCell>
                        <TableCell className="text-right font-mono">
                          {parseFloat(line.debit) > 0 ? formatCurrency(line.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {parseFloat(line.credit) > 0 ? formatCurrency(line.credit) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 font-bold">
                  <div className="flex justify-between">
                    <span>Total Debit:</span>
                    <span>{formatCurrency(selectedEntry.total_debit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Credit:</span>
                    <span>{formatCurrency(selectedEntry.total_credit)}</span>
                  </div>
                </div>
                {selectedEntry.is_balanced ? (
                  <div className="text-green-600 text-sm mt-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Entry is balanced
                  </div>
                ) : (
                  <div className="text-red-600 text-sm mt-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Entry is not balanced
                  </div>
                )}
              </div>

              {selectedEntry.posted_at && (
                <div className="text-sm text-muted-foreground">
                  Posted on: {new Date(selectedEntry.posted_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
