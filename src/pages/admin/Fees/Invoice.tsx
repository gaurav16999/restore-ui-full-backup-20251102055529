import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const Badge = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color ?? "bg-green-500 text-white"}`}>
    {children}
  </span>
);

const FeesInvoice = () => {
  const sidebarItems = getAdminSidebarItems("/admin/fees/invoice");

  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const resp: any = await import('@/services/adminApi').then(m => m.feePaymentApi.getAll());
        const data = Array.isArray(resp) ? resp : resp?.results || [];
        setRows(data);
      } catch (e) {
        console.error('load fee payments', e);
      }
    };
    load();
  }, []);

  const handleAdd = async () => {
    try {
      const student = window.prompt('Student ID (number)');
      const feeStructure = window.prompt('Fee Structure ID (number)');
      const amount = window.prompt('Amount');
      if (!student || !feeStructure || !amount) return;
  await import('@/services/adminApi').then(m => m.feePaymentApi.create({ student: Number(student), fee_structure: Number(feeStructure), amount_due: Number(amount), amount_paid: 0, status: 'pending' } as any));
      const resp: any = await import('@/services/adminApi').then(m => m.feePaymentApi.getAll());
      setRows(Array.isArray(resp) ? resp : resp?.results || []);
    } catch (err) {
      console.error('add payment', err);
    }
  };

  return (
    <DashboardLayout title="Fees Invoice" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Fees Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Button className="bg-purple-600 text-white">+ ADD</Button>
              </div>

              <div className="flex-1 text-center text-sm text-muted-foreground">🔍 QUICK SEARCH</div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="border rounded-full">📄</Button>
                <Button variant="ghost" className="border rounded-full">📥</Button>
                <Button variant="ghost" className="border rounded-full">📤</Button>
                <Button variant="ghost" className="border rounded-full">🖨️</Button>
                <Button variant="ghost" className="border rounded-full">📑</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Waiver</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r: any, idx: number) => (
                  <TableRow key={r.id ?? idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="uppercase text-sm text-muted-foreground">{r.student_name ?? r.student}</TableCell>
                    <TableCell>{r.amount_due ?? r.amount}</TableCell>
                    <TableCell>{r.discount ?? '-'}</TableCell>
                    <TableCell>{r.fine ?? r.late_fee ?? 0}</TableCell>
                    <TableCell>{r.amount_paid ?? 0}</TableCell>
                    <TableCell>{(Number(r.amount_due || 0) - Number(r.amount_paid || 0)).toString()}</TableCell>
                    <TableCell>
                      {r.status_display ?? (r.status || '').toUpperCase()}
                    </TableCell>
                    <TableCell>{r.payment_date ?? r.created_at}</TableCell>
                    <TableCell>
                      <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {rows.length} of {rows.length} entries</div>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <Button variant="ghost" className="rounded-full">←</Button>
                <div className="bg-purple-600 text-white px-3 py-1 rounded">1</div>
                <Button variant="ghost" className="rounded-full">→</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default FeesInvoice;
