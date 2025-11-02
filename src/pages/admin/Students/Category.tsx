import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

const StudentCategory = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/category");
  const { toast } = useToast();

  const [type, setType] = useState("");
  const [rows, setRows] = useState<Array<{ id: number; category: string }>>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await authClient.get('/api/admin/student-categories/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRows(items.map((item: any) => ({ id: item.id, category: item.name })));
    } catch (error: any) {
      console.error('Failed to load categories', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!type.trim()) return;
    try {
      await authClient.post('/api/admin/student-categories/', { name: type.trim() });
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      setType("");
      loadCategories();
    } catch (error: any) {
      console.error('Failed to create category', error);
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Student Category" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add Student Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">TYPE *</label>
                    <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="" />
                  </div>

                  <div>
                    <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>
                      ✅ SAVE CATEGORY
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Category List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-1/3">
                    <div className="flex items-center border-b border-gray-200 pb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                      </svg>
                      <input placeholder="SEARCH" className="w-full border-0 p-0" />
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                    <button className="text-gray-500">📎</button>
                    <button className="text-gray-500">🖨️</button>
                    <button className="text-gray-500">📄</button>
                    <button className="text-gray-500">▢</button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="w-12">{r.id}</TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <button className="px-4 py-1 rounded-full border border-purple-600 text-purple-600 hover:bg-purple-50">SELECT ↓</button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {rows.length} of {rows.length} entries</div>

                <div className="flex justify-center mt-6">
                  <div className="inline-flex items-center gap-4">
                    <button className="text-gray-400">‹</button>
                    <div className="bg-purple-600 text-white rounded-md p-2 shadow">1</div>
                    <button className="text-gray-400">›</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCategory;
