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

const Designation = () => {
  const sidebarItems = getAdminSidebarItems("/admin/hr/designation");
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Array<{ id?: number; title: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    // load existing designations
    const load = async () => {
      try {
        const api = (await import('@/services/adminApi')).designationApi;
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
        console.error('load designations', err);
        setRows([]);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      const api = (await import('@/services/adminApi')).designationApi;
      const saved = await api.create({ title });
      setRows((r) => [saved, ...r]);
      setTitle('');
      toast?.({ title: 'Saved', description: 'Designation created', variant: 'default' });
    } catch (err) {
      console.error('save designation', err);
      toast?.({ title: 'Error', description: 'Unable to save designation', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Designation" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add Designation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">DESIGNATION TITLE *</label>
                    <Input value={title} onChange={(e: any) => setTitle(e.target.value)} />
                  </div>

                  <div>
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE DESIGNATION</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Designation List</CardTitle>
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
                      <TableHead>Designation</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(rows) && rows.length > 0 ? (
                      rows.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.title}</TableCell>
                          <TableCell>
                            <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No designations found
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

export default Designation;
