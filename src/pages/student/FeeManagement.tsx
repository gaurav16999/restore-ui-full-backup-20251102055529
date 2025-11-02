import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faMoneyBillWave,
  faExclamationTriangle,
  faCheckCircle,
  faCalendarAlt,
  faFileInvoice,
  faClock,
  faDownload,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { authClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";

interface FeeStructure {
  id: number;
  fee_type: string;
  amount: string;
  academic_year: string;
  grade_level: string;
  due_date: string;
  description: string;
}

interface FeePayment {
  id: number;
  student: number;
  student_name: string;
  fee_structure: number;
  fee_type: string;
  amount_paid: string;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  remarks: string;
}

interface FeeStatus {
  total_fees: string;
  total_paid: string;
  total_outstanding: string;
  overdue_amount: string;
  payment_percentage: number;
}

const StudentFeeManagement = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState<string>("Student");
  const [className, setClassName] = useState<string>("Not Assigned");
  const { toast } = useToast();
  const { user } = useAuth();
  const sidebarItems = getStudentSidebarItems("/student/fees");

  // eSewa payment configuration
  // NOTE: eSewa UAT may not be publicly accessible. For testing, use mock mode in backend.
  // For production: Get merchant ID from eSewa and update both here and in backend.
  const ESEWA_CONFIG = {
    merchantId: "EPAYTEST", // Replace with actual merchant ID from eSewa
    paymentUrl: "https://esewa.com.np/epay/main", // Production URL
    successUrl: `${window.location.origin}/student/fees?payment=success`,
    failureUrl: `${window.location.origin}/student/fees?payment=failed`,
    useMockPayment: true, // Set to false when using real eSewa credentials
  };

  const initiateEsewaPayment = (feeStructure: FeeStructure) => {
    try {
      if (ESEWA_CONFIG.useMockPayment) {
        // Mock payment for testing when eSewa is not accessible
        const mockOid = `FEE-${feeStructure.id}-${Date.now()}`;
        const mockRefId = `MOCK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const mockAmt = feeStructure.amount;
        
        toast({
          title: "Mock Payment Mode",
          description: "Simulating eSewa payment for testing...",
        });
        
        // Simulate redirect delay
        setTimeout(() => {
          window.location.href = `${window.location.origin}/student/fees?payment=success&oid=${mockOid}&refId=${mockRefId}&amt=${mockAmt}`;
        }, 1000);
        
        return;
      }
      
      // Real eSewa payment flow
      // Create eSewa payment form
      const path = ESEWA_CONFIG.paymentUrl;
      
      const params = {
        amt: parseFloat(feeStructure.amount), // Total amount
        psc: 0, // Service charge (if any)
        pdc: 0, // Delivery charge (if any)
        txAmt: 0, // Tax amount (if any)
        tAmt: parseFloat(feeStructure.amount), // Total amount including all charges
        pid: `FEE-${feeStructure.id}-${Date.now()}`, // Unique product/transaction ID
        scd: ESEWA_CONFIG.merchantId, // Merchant code
        su: ESEWA_CONFIG.successUrl, // Success URL
        fu: ESEWA_CONFIG.failureUrl, // Failure URL
      };

      // Create a form dynamically and submit
      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', path);

      // Add form parameters
      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', key);
        input.setAttribute('value', String(value));
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
      toast({
        title: "Redirecting to eSewa",
        description: "Please complete your payment on the eSewa platform.",
      });
    } catch (error) {
      console.error('eSewa payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate eSewa payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      
      // First, get the student profile to get student ID
      const studentProfileRes = await authClient.get('/api/student/dashboard/');
      const studentData = studentProfileRes.data;
      
      // Set student name and class from API response
      setStudentName(studentData.student_name || "Student");
      setClassName(studentData.class_name || "Not Assigned");
      
      // Get student ID from backend - the backend uses Student model which has an id
      // For now, we'll fetch all data and filter on frontend
      // TODO: Backend should provide /api/student/my-fees/ endpoint for better performance
      
      const [structuresRes, paymentsRes] = await Promise.all([
        authClient.get('/api/admin/fee-structures/'),
        authClient.get('/api/admin/fee-payments/')
      ]);

      const allStructures = Array.isArray(structuresRes.data) ? structuresRes.data : structuresRes.data.results || [];
      const allPayments = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data.results || [];
      
      // Filter payments by current user's username (student_name contains the name)
      // This is a temporary solution until backend provides student-specific endpoints
      const currentUserName = `Rs.{user?.first_name || ''} Rs.{user?.last_name || ''}`.trim();
      const myPayments = allPayments.filter((payment: FeePayment) => 
        payment.student_name && payment.student_name.toLowerCase().includes(currentUserName.toLowerCase())
      );
      
      // For fee structures, filter by student's class if available
      const studentClass = studentData.class_name;
      const myStructures = studentClass 
        ? allStructures.filter((fee: FeeStructure) => 
            fee.grade_level === studentClass || !fee.grade_level
          )
        : allStructures;
      
      setFeeStructures(myStructures);
      setPayments(myPayments);

      // Calculate fee status based on filtered data
      const totalFees = myStructures.reduce((sum: number, fee: FeeStructure) => sum + parseFloat(fee.amount || '0'), 0);
      const totalPaid = myPayments.reduce((sum: number, payment: FeePayment) => sum + parseFloat(payment.amount_paid || '0'), 0);
      const totalOutstanding = totalFees - totalPaid;
      
      // Calculate overdue amount (fees with past due dates that are unpaid)
      const today = new Date();
      const overdueFees = myStructures.filter((fee: FeeStructure) => {
        const dueDate = new Date(fee.due_date);
        return dueDate < today;
      });
      
      const paidFeeIds = myPayments.map((p: FeePayment) => p.fee_structure);
      const overdueAmount = overdueFees
        .filter((fee: FeeStructure) => !paidFeeIds.includes(fee.id))
        .reduce((sum: number, fee: FeeStructure) => sum + parseFloat(fee.amount || '0'), 0);

      setFeeStatus({
        total_fees: totalFees.toFixed(2),
        total_paid: totalPaid.toFixed(2),
        total_outstanding: totalOutstanding.toFixed(2),
        overdue_amount: overdueAmount.toFixed(2),
        payment_percentage: totalFees > 0 ? (totalPaid / totalFees) * 100 : 0
      });

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
    fetchFeeData();
    
    // Check for payment callback from eSewa
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const oid = urlParams.get('oid'); // Order ID from eSewa
    const refId = urlParams.get('refId'); // Reference ID from eSewa
    const amt = urlParams.get('amt'); // Amount
    
    if (paymentStatus === 'success' && oid && refId && amt) {
      // Extract fee structure ID from oid (format: FEE-{id}-{timestamp})
      const feeStructureId = oid.split('-')[1];
      
      // Verify payment with backend
      verifyPayment(oid, refId, amt, feeStructureId);
      
      // Clean URL
      window.history.replaceState({}, '', '/student/fees');
    } else if (paymentStatus === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your payment was not completed. Please try again.",
        variant: "destructive",
      });
      
      // Clean URL
      window.history.replaceState({}, '', '/student/fees');
    }
  }, []);

  const verifyPayment = async (oid: string, refId: string, amt: string, feeStructureId: string) => {
    try {
      const response = await authClient.post('/api/student/payment/esewa/verify/', {
        oid,
        refId,
        amt,
        fee_structure_id: feeStructureId,
        payment_date: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "Payment Successful!",
        description: `Your payment of Rs.${amt} has been verified and recorded. Invoice: ${response.data.invoice_number}`,
      });
      
      // Refresh fee data to show updated status
      fetchFeeData();
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.error || "Failed to verify payment. Please contact support with transaction ID: " + refId,
        variant: "destructive",
      });
    }
  };

  const getFeeTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'tuition': 'bg-blue-100 text-blue-800 border-blue-200',
      'library': 'bg-green-100 text-green-800 border-green-200',
      'laboratory': 'bg-purple-100 text-purple-800 border-purple-200',
      'sports': 'bg-orange-100 text-orange-800 border-orange-200',
      'transport': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'exam': 'bg-red-100 text-red-800 border-red-200',
      'other': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type.toLowerCase()] || colors['other'];
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-blue-100 text-blue-800'
    };
    return colors[status.toLowerCase()] || colors['pending'];
  };

  const isPaid = (feeStructureId: number) => {
    return payments.some(p => p.fee_structure === feeStructureId && p.status === 'completed');
  };

  const isOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Student Portal"
        userName={studentName}
        userRole={className}
        sidebarItems={sidebarItems}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading fee information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Student Portal"
      userName={studentName}
      userRole={className}
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Fee Management</h2>
            <p className="text-muted-foreground">View your fee structure and payment history</p>
          </div>
          <Button variant="outline" className="w-fit">
            <FontAwesomeIcon icon={faDownload} className="mr-2 w-4 h-4" />
            Download Receipt
          </Button>
        </div>

        {/* Outstanding Fee Alert */}
        {feeStatus && parseFloat(feeStatus.overdue_amount) > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              You have overdue fees of <span className="font-bold">Rs.{feeStatus.overdue_amount}</span>. 
              Please contact the accounts office to make payment.
            </AlertDescription>
          </Alert>
        )}

        {/* Fee Statistics */}
        {feeStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileInvoice} className="w-4 h-4 text-blue-600" />
                  Total Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">Rs.{feeStatus.total_fees}</div>
                <p className="text-xs text-muted-foreground mt-1">This academic year</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-600" />
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">Rs.{feeStatus.total_paid}</div>
                <p className="text-xs text-muted-foreground mt-1">{feeStatus.payment_percentage.toFixed(1)}% completed</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="w-4 h-4 text-orange-600" />
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">Rs.{feeStatus.total_outstanding}</div>
                <p className="text-xs text-muted-foreground mt-1">Remaining balance</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 text-red-600" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">Rs.{feeStatus.overdue_amount}</div>
                <p className="text-xs text-muted-foreground mt-1">Past due date</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fee Structures */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Fee Structure</CardTitle>
                <CardDescription>Your assigned fees for this academic year</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {feeStructures.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faInfoCircle} className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">No fee structures assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feeStructures.map((fee) => {
                  const paid = isPaid(fee.id);
                  const overdue = !paid && isOverdue(fee.due_date);
                  
                  return (
                    <div
                      key={fee.id}
                      className={`p-5 rounded-xl border-2 transition-all ${
                        paid
                          ? 'bg-green-50 border-green-200'
                          : overdue
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${getFeeTypeColor(fee.fee_type)} border`}>
                              {fee.fee_type}
                            </Badge>
                            {paid && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                            {overdue && (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-3 h-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{fee.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                              Due: {formatDate(fee.due_date)}
                            </span>
                            <span className="text-muted-foreground">
                              Grade: {fee.grade_level}
                            </span>
                            <span className="text-muted-foreground">
                              Year: {fee.academic_year}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${paid ? 'text-green-600' : overdue ? 'text-red-600' : 'text-blue-600'}`}>
                            Rs.{fee.amount}
                          </div>
                          {!paid && (
                            <Button 
                              size="sm" 
                              className="mt-2 bg-green-600 hover:bg-green-700"
                              onClick={() => initiateEsewaPayment(fee)}
                            >
                              <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 w-3 h-3" />
                              Pay with eSewa
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Payment History</CardTitle>
                <CardDescription>Your past fee payments and transactions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faInfoCircle} className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">No payment history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getFeeTypeColor(payment.fee_type)}>
                            {payment.fee_type}
                          </Badge>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                              {formatDate(payment.payment_date)}
                            </span>
                            <span className="text-muted-foreground">
                              Method: {payment.payment_method}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Transaction ID: {payment.transaction_id}
                          </p>
                          {payment.remarks && (
                            <p className="text-xs text-muted-foreground italic">
                              Note: {payment.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">Rs.{payment.amount_paid}</div>
                        <Button variant="outline" size="sm" className="mt-2">
                          <FontAwesomeIcon icon={faDownload} className="mr-2 w-3 h-3" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-2 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  For any queries regarding fees or payments, please contact the accounts office:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>📧 Email: accounts@school.edu</li>
                  <li>📞 Phone: (123) 456-7890</li>
                  <li>🕒 Office Hours: Monday - Friday, 9:00 AM - 5:00 PM</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentFeeManagement;
