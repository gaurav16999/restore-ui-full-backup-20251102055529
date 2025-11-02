import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CreditCard, Download, DollarSign, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { parentAPI, FeeResponse } from '@/services/parentApi';
import { useToast } from '@/hooks/use-toast';

const FeeManagementPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [feeData, setFeeData] = useState<FeeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);

  useEffect(() => {
    if (childId) {
      fetchFeeData();
    }
  }, [childId]);

  const fetchFeeData = async () => {
    if (!childId) return;

    setLoading(true);
    try {
      const data = await parentAPI.getChildFees(parseInt(childId));
      setFeeData(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch fee data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (feeId: number) => {
    setProcessingPayment(feeId);
    try {
      // Create payment intent
      const paymentIntent = await parentAPI.createPaymentIntent(feeId);
      
      // In a real implementation, you would:
      // 1. Load Stripe.js
      // 2. Create Stripe Elements
      // 3. Confirm the payment
      // 4. Handle the response
      
      // For now, we'll simulate a successful payment
      toast({
        title: 'Payment Processing',
        description: 'Redirecting to payment gateway...'
      });

      // Simulate payment gateway redirect
      setTimeout(async () => {
        try {
          await parentAPI.confirmPayment(paymentIntent.payment_intent_id);
          toast({
            title: 'Success',
            description: 'Payment completed successfully'
          });
          fetchFeeData();
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: error.message || 'Failed to confirm payment'
          });
        } finally {
          setProcessingPayment(null);
        }
      }, 2000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to initiate payment'
      });
      setProcessingPayment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', icon: React.ReactNode }> = {
      paid: {
        variant: 'default',
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      pending: {
        variant: 'destructive',
        icon: <Clock className="w-3 h-3 mr-1" />
      },
      overdue: {
        variant: 'destructive',
        icon: <AlertCircle className="w-3 h-3 mr-1" />
      },
      partial: {
        variant: 'secondary',
        icon: <Clock className="w-3 h-3 mr-1" />
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportReceipt = (feeId: number) => {
    toast({
      title: 'Exporting Receipt',
      description: 'Receipt PDF will be downloaded shortly'
    });
    // Implement PDF generation
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!feeData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-lg font-semibold">No Data Available</p>
            <p className="text-sm text-muted-foreground">Fee information could not be loaded</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Fee Management</h1>
            <p className="text-muted-foreground">
              {feeData.student_info.name} - Class {feeData.student_info.class}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(feeData.summary.total_fees)}</div>
            <p className="text-xs text-muted-foreground mt-1">Academic Year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(feeData.summary.paid)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((feeData.summary.paid / feeData.summary.total_fees) * 100).toFixed(1)}% Complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(feeData.summary.pending)}</div>
            <p className="text-xs text-muted-foreground mt-1">Due Payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
          <CardDescription>Details of all fee types and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeData.fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.fee_type}</TableCell>
                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(fee.due_date)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(fee.status)}</TableCell>
                    <TableCell>
                      {fee.paid_date ? formatDate(fee.paid_date) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {fee.status === 'pending' || fee.status === 'overdue' ? (
                          <Button
                            size="sm"
                            onClick={() => handlePayNow(fee.id)}
                            disabled={processingPayment === fee.id}
                          >
                            {processingPayment === fee.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3 h-3 mr-2" />
                                Pay Now
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportReceipt(fee.id)}
                          >
                            <Download className="w-3 h-3 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {feeData.fees.some(f => f.status === 'paid') && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Recent payments made</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feeData.fees
                .filter(f => f.status === 'paid' && f.paid_date)
                .sort((a, b) => new Date(b.paid_date!).getTime() - new Date(a.paid_date!).getTime())
                .map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{fee.fee_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid on {formatDate(fee.paid_date!)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(fee.amount)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportReceipt(fee.id)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeeManagementPage;
