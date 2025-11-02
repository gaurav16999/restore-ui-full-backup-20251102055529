import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { classRoomApi, roomApi } from '@/services/adminApi';

const ClassRoomPage = () => {
  const sidebarItems = getAdminSidebarItems("/admin/academics/class-room");

  const [roomNo, setRoomNo] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  // selectedTeacher removed because this page no longer assigns teachers
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // Use the Room API which has capacity field to match UI requirements
        const [data, tdata]: any = await Promise.all([roomApi.getAll(), (await import('@/services/adminApi')).teacherApi.getAll()]);
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        const tlist = Array.isArray(tdata) ? tdata : (tdata?.results ?? []);
        setTeachers(tlist.map((t: any) => ({ id: t.id, name: t.name })));
        setRooms(list.map((r: any) => ({ id: r.id, roomNo: r.room_number || r.name || r.room_code, capacity: r.capacity || r.students_count || 0 })));
      } catch (err) {
        console.error('Failed to load classrooms', err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!roomNo.trim() || !capacity.trim()) return;
      // Prevent creating a room with the same number client-side
      const normalized = roomNo.trim();
      if (!editingRoomId && rooms.some(r => String(r.roomNo).toLowerCase() === normalized.toLowerCase())) {
        window.alert(`Room with number "${normalized}" already exists.`);
        return;
      }

      try {
      // Use Room API to persist room_number and capacity
      const payload: any = {
        room_number: roomNo.trim(),
        name: roomNo.trim(),
        capacity: Number(capacity) || 0,
        room_type: 'classroom',
        is_active: true
      };

      if (editingRoomId) {
        const updated: any = await roomApi.update(editingRoomId, payload);
        setRooms((s) => s.map((r) => r.id === editingRoomId ? { id: updated.id, roomNo: updated.room_number || updated.name, capacity: updated.capacity || updated.students_count || 0 } : r));
      } else {
        const created: any = await roomApi.create(payload);
        const next = { id: created.id, roomNo: created.room_number || created.name, capacity: created.capacity || created.students_count || 0 };
        setRooms((s) => [next, ...s]);
      }

  // reset form
  setRoomNo("");
  setCapacity("");
  setEditingRoomId(null);
      } catch (err: any) {
      // Log any validation errors returned by the API and show a friendly alert
      console.error('Failed to save classroom', err);
      const normalizedErr = err?.normalized ?? err;
      const message = normalizedErr?.message || normalizedErr?.response?.data?.detail || 'Failed to save classroom';
      // Show field-specific messages if provided
      if (normalizedErr?.details?.room_number) {
        window.alert(normalizedErr.details.room_number.join('\n'));
      } else if (message) {
        window.alert(String(message));
      }
    }
  };

  const handleEdit = (room: any) => {
    setEditingRoomId(room.id);
    setRoomNo(room.roomNo ?? '');
    setCapacity(String(room.capacity ?? ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    try {
      await roomApi.delete(id);
      setRooms((s) => s.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete classroom', err);
    }
  };

  return (
    <DashboardLayout
      title="Class Room"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Class Room</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>ROOM NO *</Label>
                  <Input value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
                </div>

                <div>
                  <Label>CAPACITY *</Label>
                  <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>

                {/* No assigned teacher on this page; we only collect room no and capacity */}

                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE CLASS ROOM</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Room List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" className="w-full border-0 p-0" />
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
                    <TableHead>Room No</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.roomNo}</TableCell>
                      <TableCell>{r.capacity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(r)}>EDIT</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>DELETE</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {rooms.length} of {rooms.length} entries</div>

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
    </DashboardLayout>
  );
};

export default ClassRoomPage;
