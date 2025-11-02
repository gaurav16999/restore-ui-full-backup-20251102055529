import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dormRoomTypeApi } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const RoomType = () => {
  const sidebarItems = getAdminSidebarItems("/admin/dormitory/room-type");

  const [roomType, setRoomType] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSave = () => {
    (async () => {
      try {
        const created = await dormRoomTypeApi.create({ title: roomType, description, is_active: true });
        setRows(prev => [created, ...prev]);
        setRoomType("");
        setDescription("");
        toast({ title: 'Room type created' });
      } catch (err: any) {
        console.error('Failed to create room type', err);
        toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to create room type', variant: 'destructive' });
      }
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await dormRoomTypeApi.getAll();
        const data = Array.isArray(res) ? res : (res && (res.results ?? res.data)) || [];
        if (mounted) setRows(data);
      } catch (err) {
        console.error('Failed to load room types', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Room Type" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Room Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">ROOM TYPE *</label>
                  <Input value={roomType} onChange={(e) => setRoomType(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">DESCRIPTION</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md p-2 h-28" />
                </div>

                <div>
                  <Button onClick={handleSave} className="bg-purple-600 text-white">✓ SAVE ROOM TYPE</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Room Type List</CardTitle>
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
                    <TableHead>Room Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell>{r.description}</TableCell>
                        <TableCell>
                          <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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

export default RoomType;
