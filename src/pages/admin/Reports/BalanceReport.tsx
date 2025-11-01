import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { classApi, classRoomApi, studentApi } from "@/services/adminApi";

const BalanceReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/fees/balance");

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [classData, roomData, studentData] = await Promise.all([
          classApi.getAll(),
          classRoomApi.getAll(),
          studentApi.getAll()
        ]);
        setClasses(Array.isArray(classData) ? classData : ((classData as any)?.results ?? []));
        const roomList = Array.isArray(roomData) ? roomData : ((roomData as any)?.results ?? []);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
        setStudents(Array.isArray(studentData) ? studentData : ((studentData as any)?.results ?? []));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    }
    loadDropdowns();
  }, []);

  return (
    <DashboardLayout title="Balance Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
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
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">SECTION</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-full">
                  <Label className="text-xs">STUDENT</Label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="">Select Student</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.first_name && st.last_name ? `${st.first_name} ${st.last_name}` : st.name || st.admission_no}
                      </option>
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
                    <TableHead>SL</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Balance ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right">Total</TableCell>
                    <TableCell>0</TableCell>
                  </TableRow>
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

export default BalanceReport;
