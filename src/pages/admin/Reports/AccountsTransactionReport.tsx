import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { accountTransactionApi } from "@/services/adminApi";

interface RowItem {
  id: number;
  date: string;
  name: string;
  payroll?: string;
  payment_method?: string;
  amount: number;
}

const AccountsTransactionReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/accounts/transaction");

  const types = ["Select Type*", "Income", "Expense"];
  const paymentMethods = ["All", "Cash", "Cheque", "Card"];
  const [rows, setRows] = useState<RowItem[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await accountTransactionApi.getAll();
        if (!mounted) return;
        const mapped: RowItem[] = (data || []).map((t: any) => ({
          id: t.id,
          date: t.created_at ? new Date(t.created_at).toLocaleDateString() : "-",
          name: t.reference || t.notes || `Txn #${t.id}`,
          payroll: t.account?.toString() || "",
          payment_method: t.notes || "",
          amount: t.amount || 0
        }));
        setRows(mapped);
      } catch (err) {
        console.error('Failed to load account transactions', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Transaction" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div className="lg:col-span-1">
                <Label className="text-xs">DATE RANGE *</Label>
                <Input value={`10/24/2025 - 10/31/2025`} readOnly />
              </div>

              <div>
                <Label className="text-xs">TYPE *</Label>
                <select className="w-full border rounded px-3 py-2">
                  {types.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">PAYMENT METHOD *</Label>
                <select className="w-full border rounded px-3 py-2">
                  {paymentMethods.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="mt-3">
                  <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <div className="flex items-center gap-2">
                  <Input placeholder="SEARCH" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">⎘</Button>
                <Button variant="outline">📄</Button>
                <Button variant="outline">🖨️</Button>
                <Button variant="outline">▣</Button>
                <Button variant="outline">▦</Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Payroll</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No transactions found</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.payroll}</TableCell>
                        <TableCell>{r.payment_method}</TableCell>
                        <TableCell>{r.amount}</TableCell>
                      </TableRow>
                    ))
                  )}
                  {rows.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-right">Grand Total:</TableCell>
                      <TableCell>{rows.reduce((s, r) => s + Number(r.amount || 0), 0)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">Showing 1 to 2 of 2 entries</div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <Button variant="ghost">←</Button>
              <Button className="bg-purple-600 text-white rounded-full">1</Button>
              <Button variant="ghost">→</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountsTransactionReport;
