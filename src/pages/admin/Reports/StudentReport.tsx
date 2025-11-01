import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { studentApi, classApi, classRoomApi } from "@/services/adminApi";

const StudentReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/report");

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const types = ["sd", "Regular", "Repeater"];
  const genders = ["Male", "Female"];
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [classData, roomData] = await Promise.all([
          classApi.getAll(),
          classRoomApi.getAll()
        ]);
        setClasses(Array.isArray(classData) ? classData : ((classData as any)?.results ?? []));
        const roomList = Array.isArray(roomData) ? roomData : ((roomData as any)?.results ?? []);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    }
    loadDropdowns();
  }, []);

  async function handleSearch(filters?: Record<string, any>) {
    try {
      const data = await studentApi.getAll(filters);
      setRows(data || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  }

  return (
    <DashboardLayout title="Student Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        {/* Select Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="text-xs">CLASS *</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Class *</option>
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

              <div>
                <Label className="text-xs">TYPE</Label>
                <select className="w-full border rounded px-3 py-2">
                  {types.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-full">
                  <Label className="text-xs">GENDER</Label>
                  <select className="w-full border rounded px-3 py-2">
                    {genders.map((g) => (
                      <option key={g}>{g}</option>
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

        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="mx-auto text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <span>SEARCH</span>
              </div>

              <div className="flex items-center gap-2">
                {/* action icons placeholders */}
                <button className="border rounded p-2">📄</button>
                <button className="border rounded p-2">📥</button>
                <button className="border rounded p-2">📤</button>
                <button className="border rounded p-2">🖨️</button>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Father Name</TableHead>
                    <TableHead>Date Of Birth</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.class_name}</TableCell>
                        <TableCell>{s.section || '-'}</TableCell>
                        <TableCell>{s.roll_no}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.parent_contact || '-'}</TableCell>
                        <TableCell>{s.date_of_birth || '-'}</TableCell>
                        <TableCell>{s.gender || '-'}</TableCell>
                        <TableCell>{s.type || '-'}</TableCell>
                        <TableCell>{s.phone || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>

            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-4 text-muted-foreground">
                <button className="p-2">◀</button>
                <button className="p-2">▶</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentReport;
