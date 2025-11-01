import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { staffAttendanceApi } from "@/services/adminApi";

const StaffAttendanceReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/staff/attendance");

  const roles = ["Select Role*", "Teacher", "Staff"];
  const months = ["October", "September", "August"];
  const years = ["2025", "2024", "2023"];
  const [rows, setRows] = useState<any[]>([]);

  async function handleSearch(role?: string, month?: string, year?: string) {
    try {
      const params: any = {};
      if (role && role !== 'Select Role*') params.role = role;
      if (month) params.month = month;
      if (year) params.year = year;
      const data = await staffAttendanceApi.getAll(params);
      setRows(data || []);
    } catch (err) {
      console.error('Failed to fetch staff attendance', err);
    }
  }

  return (
    <DashboardLayout title="Staff Attendance Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              <div>
                <Label className="text-xs">ROLE *</Label>
                <select className="w-full border rounded px-3 py-2">
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">SELECT MONTH *</Label>
                <select className="w-full border rounded px-3 py-2">
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-full">
                  <Label className="text-xs">SELECT YEAR *</Label>
                  <select className="w-full border rounded px-3 py-2">
                    {years.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-3">
                  <Button className="bg-purple-600 text-white" onClick={() => handleSearch()}>🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6" />
        {rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Found {rows.length} attendance records</div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffAttendanceReport;
