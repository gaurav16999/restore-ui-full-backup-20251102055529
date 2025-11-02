import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { dormRoomApi, dormRoomTypeApi } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const Rooms = () => {
  const sidebarItems = getAdminSidebarItems("/admin/dormitory/rooms");

  const [dormitory, setDormitory] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("");
  const [beds, setBeds] = useState("");
  const [costPerBed, setCostPerBed] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSave = () => {
    (async () => {
      try {
        const payload: any = {
          room_number: roomNumber,
          room_type: type ? Number(type) : undefined,
          capacity: beds ? Number(beds) : undefined,
          is_active: true,
        };
        const created = await dormRoomApi.create(payload);
        setRows(prev => [created, ...prev]);
        setDormitory("");
        setRoomNumber("");
        setType("");
        setBeds("");
        setCostPerBed("");
        setDescription("");
        toast({ title: 'Room created' });
      } catch (err: any) {
        console.error('Failed to create room', err);
        toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to create room', variant: 'destructive' });
      }
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [roomsRes, typesRes]: any = await Promise.all([
          dormRoomApi.getAll(),
          dormRoomTypeApi.getAll(),
        ]);
        const rooms = Array.isArray(roomsRes) ? roomsRes : (roomsRes && (roomsRes.results ?? roomsRes.data)) || [];
        const t = Array.isArray(typesRes) ? typesRes : (typesRes && (typesRes.results ?? typesRes.data)) || [];
        if (mounted) {
          setRows(rooms);
          setTypes(t);
        }
      } catch (err) {
        console.error('Failed to load dormitory rooms or types', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Dormitory Rooms" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Dormitory Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">DORMITORY *</label>
                  <Select onValueChange={(v) => setDormitory(v)} value={dormitory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Dormitory *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys</SelectItem>
                      <SelectItem value="girls">Girls</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">ROOM NUMBER *</label>
                  <Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">TYPE *</label>
                  <Select onValueChange={(v) => setType(v)} value={type}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Room Type *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1f">1 F</SelectItem>
                      <SelectItem value="2f">2 F</SelectItem>
                      <SelectItem value="ac">AC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">NUMBER OF BED *</label>
                  <Input value={beds} onChange={(e) => setBeds(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">COST PER BED *</label>
                  <Input value={costPerBed} onChange={(e) => setCostPerBed(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">DESCRIPTION</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md p-2 h-24" />
                </div>

                <div>
                  <Button onClick={handleSave} className="bg-purple-600 text-white">✓ SAVE ROOM</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dormitory Rooms List</CardTitle>
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
                    <TableHead>Dormitory</TableHead>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>NO. OF Bed</TableHead>
                    <TableHead>Cost Per Bed ($)</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{/* dormitory not represented on model */}</TableCell>
                        <TableCell>{r.room_number}</TableCell>
                        <TableCell>{(types.find(t => t.id === r.room_type) || {}).title || r.room_type}</TableCell>
                        <TableCell>{r.capacity}</TableCell>
                        <TableCell>{/* cost per bed not available on model */}</TableCell>
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

export default Rooms;
