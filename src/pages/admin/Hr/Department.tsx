import { useEffect, useState } from "react";
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const Department = () => {
  const sidebarItems = getAdminSidebarItems("/admin/hr/department");

  const [name, setName] = useState("");
  const [rows, setRows] = useState<Array<{ id?: number; name?: string; title?: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const api = (await import('@/services/adminApi')).departmentApi;
        const data = await api.getAll();
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
        console.error('load depts', err);
        setRows([]);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      const api = (await import('@/services/adminApi')).departmentApi;
      const saved = await api.create({ name });
      setRows((r) => [saved, ...r]);
      setName('');
      toast?.({ title: 'Saved', description: 'Department created' });
    } catch (err) {
      console.error('save department', err);
      toast?.({ title: 'Error', description: 'Unable to save department', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Departments" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">DEPARTMENT NAME *</label>
                    <Input value={name} onChange={(e: any) => setName(e.target.value)} />
                  </div>

                  <div>
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE DEPARTMENT</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Department List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 text-center text-sm text-muted-foreground">🔍 SEARCH</div>
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
                      <TableHead>Department</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(rows) && rows.length > 0 ? (
                      rows.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.name || r.title}</TableCell>
                          <TableCell>
                            <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No departments found
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
        </div>

        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
};

export default Department;
