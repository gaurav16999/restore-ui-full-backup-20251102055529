import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import authClient from '@/lib/http';
import { DollarSign, Download, RefreshCw, TrendingUp, CreditCard, Calendar, AlertCircle } from 'lucide-react';

interface FeeCollectionReport {
  period: {
    type: string;
    start_date: string;
    end_date: string;
  };
  summary: {
    total_collected: number;
    total_transactions: number;
    total_expected: number;
    pending_amount: number;
    collection_rate: number;
  };
  payment_methods: Array<{
    method: string;
    transactions: number;
    amount: number;
  }>;
  daily_collection: Array<{
    date: string;
    transactions: number;
    amount: number;
  }>;
}

export default function FeeReports() {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<string>('monthly');
  const [feeReport, setFeeReport] = useState<FeeCollectionReport | null>(null);

  const fetchFeeReport = async () => {
    setLoading(true);
    try {
      const response = await authClient.get(
        `/api/admin/advanced-reports/fee_collection_report/?period=${period}`
      );
      setFeeReport(response.data);
      toast.success('Fee collection report generated');
    } catch (error: any) {
      console.error('Error fetching fee report:', error);
      toast.error(error.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'online':
        return '🌐';
      case 'cheque':
        return '📝';
      default:
        return '💰';
    }
  };

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-blue-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fee Collection Reports</h1>
          <p className="text-muted-foreground">
            Track and analyze fee collection trends
          </p>
        </div>
        <Button className="gap-2" onClick={() => window.print()}>
          <Download className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Fee Collection Report</CardTitle>
          <CardDescription>Select time period to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchFeeReport} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {feeReport && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(feeReport.summary.total_collected)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {feeReport.summary.total_transactions} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(feeReport.summary.total_expected)}
                </div>
                <p className="text-xs text-muted-foreground">Total due</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(feeReport.summary.pending_amount)}
                </div>
                <p className="text-xs text-muted-foreground">Outstanding fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getCollectionRateColor(feeReport.summary.collection_rate)}`}>
                  {feeReport.summary.collection_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Collection efficiency</p>
              </CardContent>
            </Card>
          </div>

          {/* Collection Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Progress</CardTitle>
              <CardDescription>
                {formatCurrency(feeReport.summary.total_collected)} collected out of {formatCurrency(feeReport.summary.total_expected)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Collected: {feeReport.summary.collection_rate.toFixed(1)}%</span>
                  <span>Pending: {(100 - feeReport.summary.collection_rate).toFixed(1)}%</span>
                </div>
                <Progress value={feeReport.summary.collection_rate} className="h-4" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(feeReport.summary.total_collected)}
                    </div>
                    <p className="text-sm text-green-800">Amount Collected</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(feeReport.summary.pending_amount)}
                    </div>
                    <p className="text-sm text-red-800">Amount Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Breakdown</CardTitle>
              <CardDescription>Collection by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {feeReport.payment_methods.map((method, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{getPaymentMethodIcon(method.method)}</span>
                        <Badge variant="outline">{method.transactions} txn</Badge>
                      </div>
                      <div className="text-lg font-bold capitalize">{method.method}</div>
                      <div className="text-sm text-muted-foreground">{formatCurrency(method.amount)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {((method.amount / feeReport.summary.total_collected) * 100).toFixed(1)}% of total
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Collection */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Collection Breakdown</CardTitle>
              <CardDescription>Day-by-day fee collection tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Amount Collected</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeReport.daily_collection.map((day, idx) => {
                    const percentage = (day.amount / feeReport.summary.total_collected) * 100;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {formatDate(day.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{day.transactions}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(day.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {percentage.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="w-20 h-2" />
                            {day.amount > feeReport.summary.total_collected / feeReport.daily_collection.length && (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Period Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Period Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Report Period</Label>
                  <div className="text-lg font-semibold capitalize">{feeReport.period.type}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <div className="text-lg font-semibold">{formatDate(feeReport.period.start_date)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <div className="text-lg font-semibold">{formatDate(feeReport.period.end_date)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Days</Label>
                  <div className="text-lg font-semibold">{feeReport.daily_collection.length}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Average per Day</Label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(feeReport.summary.total_collected / feeReport.daily_collection.length)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Average per Transaction</Label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(feeReport.summary.total_collected / feeReport.summary.total_transactions)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {feeReport.summary.collection_rate < 75 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Collection Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-900">
                  Collection rate is below 75%. Consider sending reminders to students with pending fees.
                  Pending amount: <strong>{formatCurrency(feeReport.summary.pending_amount)}</strong>
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
