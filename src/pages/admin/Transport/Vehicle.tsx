import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { transportVehicleApi } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const Vehicle = () => {
  const sidebarItems = getAdminSidebarItems("/admin/transport/vehicle");

  const [vehicleNo, setVehicleNo] = useState("");
  const [regNo, setRegNo] = useState("");
  const [type, setType] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [capacity, setCapacity] = useState("");

  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);

  const handleSave = async () => {
    try {
      const payload: any = {
        vehicle_no: vehicleNo,
        registration_no: regNo,
        vehicle_type: type,
        driver_name: driverName,
        driver_mobile: driverMobile,
        capacity: capacity ? Number(capacity) : undefined,
      };
  const created = await transportVehicleApi.create(payload);
      setRows(prev => [created, ...prev]);
      setVehicleNo(''); setRegNo(''); setType(''); setDriverName(''); setDriverMobile(''); setCapacity('');
  toast({ title: 'Vehicle created' });
    } catch (err) {
      console.error('Failed to create vehicle', err);
  toast({ title: 'Error', description: 'Failed to create vehicle', variant: 'destructive' });
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const res = await transportVehicleApi.getAll();
        const anyRes: any = res;
        const data = Array.isArray(anyRes) ? anyRes : (anyRes && (anyRes.results ?? anyRes.data)) || [];
        if (mounted) setRows(data);
      } catch (err) {
        console.error('Failed to load vehicles', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Transport Vehicle" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">VEHICLE NO *</label>
                  <Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">REGISTRATION NO</label>
                  <Input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">VEHICLE TYPE</label>
                  <Select onValueChange={(v) => setType(v)} value={type}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">DRIVER NAME</label>
                  <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">DRIVER MOBILE</label>
                  <Input value={driverMobile} onChange={(e) => setDriverMobile(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">SEAT CAPACITY</label>
                  <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="" />
                </div>

                <div>
                  <Button onClick={handleSave} className="bg-purple-600 text-white">✓ SAVE VEHICLE</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Route List</CardTitle>
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
                    <TableHead>Vehicle No</TableHead>
                    <TableHead>Reg No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.vehicleNo}</TableCell>
                        <TableCell>{r.regNo}</TableCell>
                        <TableCell>{r.type}</TableCell>
                        <TableCell>{r.driver}</TableCell>
                        <TableCell>{r.mobile}</TableCell>
                        <TableCell>{r.capacity}</TableCell>
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

export default Vehicle;
