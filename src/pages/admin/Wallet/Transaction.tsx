import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { useEffect, useState } from "react";
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Transaction = () => {
  const sidebarItems = getAdminSidebarItems("/admin/wallet/transaction");

  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const api = (await import('@/services/adminApi')).walletTransactionApi;
        const data = await api.getAll();
        // Enhanced response handling
        if (Array.isArray(data)) {
          setRows(data);
        } else if (data && typeof data === 'object') {
          const responseData = data as any;
          if (Array.isArray(responseData.results)) {
            setRows(responseData.results);
          } else if (Array.isArray(responseData.data)) {
            setRows(responseData.data);
          } else {
            setRows([]);
          }
        } else {
          setRows([]);
        }
      } catch (err) {
        console.error('load wallet transactions', err);
        toast?.({ title: 'Error', description: 'Unable to load wallet transactions', variant: 'destructive' });
        setRows([]);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="Wallet Transaction" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-center">
                  <div className="w-1/3">
                    <Input placeholder=" QUICK SEARCH" />
                  </div>
                </div>

                <div className="inline-flex items-center space-x-2">
                  <Button variant="outline">⎘</Button>
                  <Button variant="outline">⎙</Button>
                  <Button variant="outline">▣</Button>
                  <Button variant="outline">🖨️</Button>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Approve</TableHead>
                  <TableHead>Reject</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead>Expense</TableHead>
                  <TableHead>Fees Refund</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(rows) && rows.length > 0 ? (
                  rows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{r.wallet_name || r.wallet}</TableCell>
                      <TableCell>{r.transaction_type}</TableCell>
                      <TableCell>{r.amount}</TableCell>
                      <TableCell>{/* pending column */}</TableCell>
                      <TableCell>{/* approve */}</TableCell>
                      <TableCell>{/* reject */}</TableCell>
                      <TableCell>{/* refund */}</TableCell>
                      <TableCell>{/* expense */}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-sm text-muted-foreground">
                      No Data Available In Table
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing 1 to {Array.isArray(rows) ? rows.length : 0} of {Array.isArray(rows) ? rows.length : 0} entries
            </div>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <Button variant="ghost" className="rounded-full">←</Button>
                <Button variant="ghost" className="rounded-full">→</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transaction;
