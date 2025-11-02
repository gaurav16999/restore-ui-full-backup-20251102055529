import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { transportRouteApi, transportVehicleApi, vehicleAssignmentApi } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const AssignVehicle = () => {
  const sidebarItems = getAdminSidebarItems("/admin/transport/assign-vehicle");

  const [route, setRoute] = useState("");
  const [vehicle, setVehicle] = useState("");
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const handleSave = () => {
    (async () => {
      try {
        const payload = { route: Number(route), vehicle: Number(vehicle) };
        const created = await vehicleAssignmentApi.create(payload);
        setRows(prev => [created, ...prev]);
        setRoute(''); setVehicle('');
        toast({ title: 'Vehicle assigned' });
      } catch (err: any) {
        console.error('Failed to assign vehicle', err);
        toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to assign vehicle', variant: 'destructive' });
      }
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rRes, vRes, aRes] = await Promise.all([transportRouteApi.getAll(), transportVehicleApi.getAll(), vehicleAssignmentApi.getAll()]);
        const anyR: any = rRes;
        const anyV: any = vRes;
        const anyA: any = aRes;
        const rData = Array.isArray(anyR) ? anyR : (anyR && (anyR.results ?? anyR.data)) || [];
        const vData = Array.isArray(anyV) ? anyV : (anyV && (anyV.results ?? anyV.data)) || [];
        const aData = Array.isArray(anyA) ? anyA : (anyA && (anyA.results ?? anyA.data)) || [];
        if (mounted) {
          setRoutes(rData);
          setVehicles(vData);
          setRows(aData);
        }
      } catch (err) {
        console.error('Failed to load transport data', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Assign Vehicle" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Assign Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Select Route *</label>
                  <Select onValueChange={(v) => setRoute(v)} value={route}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Route *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a1">A1</SelectItem>
                      <SelectItem value="bc">BC</SelectItem>
                      <SelectItem value="973">973 - CB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">VEHICLE *</label>
                  <Select onValueChange={(v) => setVehicle(v)} value={vehicle}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Vehicle *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bus_1">Bus A1</SelectItem>
                      <SelectItem value="van_1">Van BC</SelectItem>
                      <SelectItem value="bus_2">Bus 973</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button onClick={handleSave} className="bg-purple-600 text-white">✓ SAVE</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Assigned Vehicle List</CardTitle>
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
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle</TableHead>
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
                        <TableCell>{r.route}</TableCell>
                        <TableCell>{r.vehicle}</TableCell>
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

export default AssignVehicle;
