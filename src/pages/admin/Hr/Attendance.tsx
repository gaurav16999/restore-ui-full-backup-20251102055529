import { useEffect, useState } from "react";
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const StaffAttendance = () => {
  const sidebarItems = getAdminSidebarItems("/admin/hr/attendance");

  const [role, setRole] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("10/30/2025");
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const api = (await import('@/services/adminApi')).staffAttendanceApi;
        const data = await api.getAll({ date: attendanceDate });
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
        console.error('load staff attendance', err);
        toast?.({ title: 'Error', description: 'Unable to load attendance', variant: 'destructive' });
        setRows([]);
      }
    };
    load();
  }, []);

  const handleImport = () => {
    // placeholder for future import flow
    toast?.({ title: 'Not implemented', description: 'Import attendance not implemented yet' });
  };

  const handleSearch = async () => {
    try {
      const api = (await import('@/services/adminApi')).staffAttendanceApi;
      const params: Record<string, any> = { date: attendanceDate };
      if (role) params.role = role;
      const data = await api.getAll(params);
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
      const count = Array.isArray(data) ? data.length : (data as any)?.results?.length || (data as any)?.data?.length || 0;
      toast?.({ title: 'Search complete', description: `Found ${count} records` });
    } catch (err) {
      console.error('search attendance', err);
      toast?.({ title: 'Error', description: 'Unable to search attendance', variant: 'destructive' });
      setRows([]);
    }
  };

  return (
    <DashboardLayout title="Staff Attendance" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button className="bg-purple-600 border-transparent text-white" onClick={handleImport}>+ IMPORT ATTENDANCE</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-6">
                <label className="text-xs text-muted-foreground block mb-1">ROLE *</label>
                <Select value={role} onValueChange={v => setRole(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Role *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-6">
                <label className="text-xs text-muted-foreground block mb-1">Attendance Date *</label>
                <Input value={attendanceDate} onChange={(e: any) => setAttendanceDate(e.target.value)} placeholder="10/30/2025" />
              </div>

              <div className="lg:col-span-12 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="text-left p-2">Employee</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Notes</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(rows) && rows.length > 0 ? (
                    rows.map((r, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{(r as any).employee_name || r.employee}</td>
                        <td className="p-2">{r.date}</td>
                        <td className="p-2">{r.status}</td>
                        <td className="p-2">{r.notes}</td>
                        <td className="p-2">
                          <Button variant="ghost" className="rounded-full">Edit</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-muted-foreground">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffAttendance;
