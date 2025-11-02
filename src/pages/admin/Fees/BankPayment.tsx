import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const BankPayment = () => {
  const sidebarItems = getAdminSidebarItems("/admin/fees/bank-payment");

  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const clsResp: any = await import('@/services/adminApi').then(m => m.classApi.getAll());
        const cls = Array.isArray(clsResp) ? clsResp : clsResp?.results || [];
        setClasses(cls);
        const resp: any = await import('@/services/adminApi').then(m => m.feePaymentApi.getAll());
        setRows(Array.isArray(resp) ? resp : resp?.results || []);
      } catch (e) {
        console.error('load bank payments', e);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="Bank Payment" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">DATE RANGE</label>
                <Input placeholder="10/23/2025 - 10/30/2025" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS</label>
                <Select onValueChange={(v) => setSelectedClass(v)} value={selectedClass}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sec_a">A</SelectItem>
                    <SelectItem value="sec_b">B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">STATUS</label>
                <div className="flex items-end justify-end">
                  <div className="w-full">
                    <Select onValueChange={(v) => setStatus(v)} value={status}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="ml-3">
                    <Button className="bg-purple-600 text-white" onClick={async () => {
                      try {
                        const params: any = {};
                        if (status && status !== 'all') params.status = status;
                        if (selectedClass) params.class_id = selectedClass;
                        const resp: any = await import('@/services/adminApi').then(m => m.feePaymentApi.getAll(params));
                        setRows(Array.isArray(resp) ? resp : resp?.results || []);
                      } catch (e) { console.error('bank payment search', e); }
                    }}>🔍 SEARCH</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Payment List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center text-sm text-muted-foreground">🔍 SEARCH</div>
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
                  <TableHead>Student Name</TableHead>
                  <TableHead>View Transaction</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  rows.map((r: any, idx: number) => (
                    <TableRow key={r.id ?? idx}>
                      <TableCell>{r.student_name ?? r.student}</TableCell>
                      <TableCell>{r.transaction_id ?? '-'}</TableCell>
                      <TableCell>{r.payment_date ?? r.created_at}</TableCell>
                      <TableCell>{r.amount_paid ?? r.amount_due ?? '-'}</TableCell>
                      <TableCell>{r.remarks ?? r.note ?? '-'}</TableCell>
                      <TableCell>{r.file_attachment ?? '-'}</TableCell>
                      <TableCell>{r.status_display ?? r.status ?? '-'}</TableCell>
                      <TableCell>
                        <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <Button variant="ghost" className="rounded-full">←</Button>
                <div className="bg-white text-gray-500 px-3 py-1 rounded">1</div>
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

export default BankPayment;
