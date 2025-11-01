import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { attendanceApi, classApi, classRoomApi } from "@/services/adminApi";

const StudentAttendanceReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/attendance");

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["2025", "2024", "2023", "2022"];
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [classData, roomData] = await Promise.all([
          classApi.getAll(),
          classRoomApi.getAll()
        ]);
        const classList = Array.isArray(classData) ? classData : ((classData as any)?.results ?? []);
        const roomList = Array.isArray(roomData) ? roomData : ((roomData as any)?.results ?? []);
        setClasses(classList);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    }
    loadDropdowns();
  }, []);

  async function handleSearch() {
    try {
      const data = await attendanceApi.getAll();
      setRows(data || []);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    }
  }

  return (
    <DashboardLayout title="Student Attendance Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        {/* Select Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
              <div>
                <Label className="text-xs">Class</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Select Section *</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Section *</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Month</Label>
                <select className="w-full border rounded px-3 py-2">
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Year</Label>
                <select className="w-full border rounded px-3 py-2">
                  {years.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 text-white" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Present: <span className="text-green-600">P</span> Late: <span className="text-yellow-600">L</span> Absent: <span className="text-red-600">A</span> Half Day: <span className="text-orange-600">F</span> Holiday: <span className="text-sky-600">H</span></div>
              <div>
                <Button className="bg-purple-600 text-white">🖨️ PRINT</Button>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>L</TableHead>
                    <TableHead>A</TableHead>
                    <TableHead>F</TableHead>
                    <TableHead>H</TableHead>
                    <TableHead>%</TableHead>
                    {/* Days 1..31 (render as many as needed) */}
                    {Array.from({ length: 31 }).map((_, i) => (
                      <TableHead key={i}>{i + 1}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={39} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendanceReport;
