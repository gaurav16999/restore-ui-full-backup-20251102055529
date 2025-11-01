import { useEffect, useState } from "react";
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

const FeesGroup = () => {
  const sidebarItems = getAdminSidebarItems("/admin/fees/group");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const resp: any = await import('@/services/adminApi').then(m => m.feeStructureApi.getAll());
        const data = Array.isArray(resp) ? resp : resp?.results || [];
        // derive unique fee_type_display
        const map: Record<string, any> = {};
        data.forEach((d: any) => {
          const key = d.fee_type_display || d.fee_type || 'Other';
          if (!map[key]) map[key] = { name: key, description: '' };
        });
        setRows(Object.values(map));
      } catch (e) {
        console.error('load fee groups', e);
      }
    };
    loadGroups();
  }, []);

  const handleSave = async () => {
    try {
      // Create a small fee-structure entry representing this group (best-effort assumption)
      await import('@/services/adminApi').then(m => m.feeStructureApi.create({ name, fee_type: name.toLowerCase().replace(/\s+/g,'_'), amount: 0, is_active: true } as any));
      // reload groups
      const resp: any = await import('@/services/adminApi').then(m => m.feeStructureApi.getAll());
      const data = Array.isArray(resp) ? resp : resp?.results || [];
      const map: Record<string, any> = {};
      data.forEach((d: any) => {
        const key = d.fee_type_display || d.fee_type || 'Other';
        if (!map[key]) map[key] = { name: key, description: '' };
      });
      setRows(Object.values(map));
      setName(''); setDescription('');
    } catch (err) {
      console.error('save fee group', err);
    }
  };

 

  return (
    <DashboardLayout title="Fees Group" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Fees Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">NAME *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">DESCRIPTION</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-md p-2 h-28"
                  />
                </div>

                <div>
                  <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Fees Group List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">🔍 SEARCH</div>
                <div className="flex space-x-2">
                  <Button variant="ghost" className="border rounded-full">📄</Button>
                  <Button variant="ghost" className="border rounded-full">📥</Button>
                  <Button variant="ghost" className="border rounded-full">📤</Button>
                  <Button variant="ghost" className="border rounded-full">🖨️</Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell>
                        <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {rows.length} of {rows.length} entries</div>
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

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default FeesGroup;
