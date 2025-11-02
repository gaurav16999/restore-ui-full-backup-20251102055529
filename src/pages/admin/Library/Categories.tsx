import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const Categories = () => {
  const sidebarItems = getAdminSidebarItems("/admin/library/categories");
  const [category, setCategory] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await (await import('@/services/adminApi')).bookCategoryApi.getAll();
        const anyRes: any = res;
        const data = Array.isArray(anyRes) ? anyRes : (anyRes && (anyRes.results ?? anyRes.data)) || [];
        if (mounted) setRows(data as any[]);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    try {
      const svc = (await import('@/services/adminApi')).bookCategoryApi;
      const created = await svc.create({ title: category });
      setCategory('');
      setRows(prev => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create category', err);
      toast({ title: 'Failed to create category', variant: 'destructive', description: err?.response?.data?.detail || 'Could not create category' });
    }
  };

  return (
    <DashboardLayout title="Book Categories" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Book Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">CATEGORY NAME *</label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="" />
                </div>

                <div>
                  <Button onClick={handleSave} className="bg-purple-600 text-white">✓ SAVE CATEGORY</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Category List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 text-center text-sm text-muted-foreground">🔍 SEARCH</div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" className="border rounded-full">📄</Button>
                  <Button variant="ghost" className="border rounded-full">📥</Button>
                  <Button variant="ghost" className="border rounded-full">📤</Button>
                  <Button variant="ghost" className="border rounded-full">🖨️</Button>
                  <Button variant="ghost" className="border rounded-full">📑</Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SL</TableHead>
                    <TableHead>Category Title</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell>
                          <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>
              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center space-x-2">
                  <Button variant="ghost" className="rounded-full">←</Button>
                  <div className="bg-white text-gray-500 px-3 py-1 rounded">1</div>
                  <Button variant="ghost" className="rounded-full">→</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default Categories;
