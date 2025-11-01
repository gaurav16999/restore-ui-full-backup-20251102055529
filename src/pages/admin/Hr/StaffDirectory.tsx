import { useEffect, useState } from "react";
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

const StaffDirectory = () => {
  const sidebarItems = getAdminSidebarItems("/admin/hr/staff-directory");

  const [role, setRole] = useState("");
  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");
  const [rows, setRows] = useState<Array<any>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const apiModule = await import('@/services/adminApi');
        const data = await apiModule.employeeApi.getAll();
        // Handle different response formats
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
        console.error('load employees', err);
        setRows([]);
      }
    };
    load();
  }, []);

  const handleSearch = async () => {
    try {
      const apiModule = await import('@/services/adminApi');
      const params: any = {};
      if (role) params.role = role;
      if (staffId) params.employee_id = staffId;
      if (name) params.name = name;
      const data = await apiModule.employeeApi.getAll(params);
      // Handle different response formats
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
      console.error('search staff', err);
      setRows([]);
    }
  };

  return (
    <DashboardLayout title="Staff List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-4">
                <label className="text-xs text-muted-foreground block mb-1">ROLE</label>
                <Select value={role} onValueChange={v => setRole(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-4">
                <label className="text-xs text-muted-foreground block mb-1">SEARCH BY STAFF ID</label>
                <Input value={staffId} onChange={(e: any) => setStaffId(e.target.value)} placeholder="Search By Staff Id" />
              </div>

              <div className="lg:col-span-4">
                <label className="text-xs text-muted-foreground block mb-1">SEARCH BY NAME</label>
                <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Search by Name" />
              </div>

              <div className="lg:col-span-12 flex justify-end">
                <div className="flex items-center gap-3">
                  <Button className="bg-purple-600 border-transparent text-white" onClick={handleSearch}>🔍 SEARCH</Button>
                  <Button className="bg-purple-600 border-transparent text-white" onClick={() => window.location.href = '/admin/hr/add-staff'}>+ ADD STAFF</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center text-sm text-muted-foreground">🔍 QUICK SEARCH</div>
              <div className="flex space-x-2">
                <Button variant="ghost" className="border rounded-full">📄</Button>
                <Button variant="ghost" className="border rounded-full">📥</Button>
                <Button variant="ghost" className="border rounded-full">📤</Button>
                <Button variant="ghost" className="border rounded-full">🖨️</Button>
                <Button variant="ghost" className="border rounded-full">▦</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(rows) && rows.length > 0 ? (
                  rows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.no || idx + 1}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.role}</TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell>{r.designation}</TableCell>
                      <TableCell>{r.mobile}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>
                        <span className={r.status ? 'inline-block w-8 h-4 bg-purple-600 rounded-full' : 'inline-block w-8 h-4 bg-gray-300 rounded-full'} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No staff members found
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
                <div className="bg-purple-600 text-white px-3 py-1 rounded">1</div>
                <Button variant="ghost" className="rounded-full">→</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffDirectory;
