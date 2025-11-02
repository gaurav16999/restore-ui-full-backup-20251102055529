import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { studentApi, feeStructureApi, feePaymentApi } from "@/services/adminApi";

interface DueRow {
  id: number;
  admission_no?: string;
  roll_no?: string;
  name?: string;
  due_date?: string;
  amount?: number;
  paid?: number;
  waiver?: number;
  fine?: number;
  balance?: number;
}

const FeesDueReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/fees/due");

  const classes = ["Select Class", "PRIMARY TWO", "PRIMARY THREE"];
  const sections = ["Select Section", "A", "B"];
  const [students, setStudents] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | number>('');
  const [rows, setRows] = useState<DueRow[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const s = await studentApi.getAll();
        const f = await feeStructureApi.getAll();
        if (!mounted) return;
        setStudents(s || []);
        setFeeStructures(f || []);
      } catch (err) {
        console.error('Failed to load students or fee structures', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Fees Due" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div className="lg:col-span-1">
                <Label className="text-xs">DATE RANGE</Label>
                <Input value={`10/23/2025 - 10/30/2025`} readOnly />
              </div>

              <div>
                <Label className="text-xs">CLASS</Label>
                <select className="w-full border rounded px-3 py-2">
                  {classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">SECTION</Label>
                <select className="w-full border rounded px-3 py-2">
                  {sections.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-full">
                  <Label className="text-xs">STUDENT</Label>
                  <select className="w-full border rounded px-3 py-2">
                    {students.map((st) => (
                      <option key={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-3">
                  <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Quick Search" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">🔁</Button>
                <Button variant="outline">📄</Button>
                <Button variant="outline">🖨️</Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount ($)</TableHead>
                    <TableHead>Paid ($)</TableHead>
                    <TableHead>Waiver ($)</TableHead>
                    <TableHead>Fine ($)</TableHead>
                    <TableHead>Balance ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.admission_no || '-'}</TableCell>
                        <TableCell>{r.roll_no || '-'}</TableCell>
                        <TableCell>{r.name || '-'}</TableCell>
                        <TableCell>{r.due_date || '-'}</TableCell>
                        <TableCell>{r.amount ?? '-'}</TableCell>
                        <TableCell>{r.paid ?? '-'}</TableCell>
                        <TableCell>{r.waiver ?? '-'}</TableCell>
                        <TableCell>{r.fine ?? '-'}</TableCell>
                        <TableCell>{r.balance ?? '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <Button variant="ghost">←</Button>
              <Button variant="ghost">→</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FeesDueReport;
