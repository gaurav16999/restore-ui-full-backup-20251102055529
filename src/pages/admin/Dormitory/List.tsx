import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const DormitoryList = () => {
  const sidebarItems = getAdminSidebarItems("/admin/dormitory/list");

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [intake, setIntake] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    console.log("save dormitory", { name, type, address, intake, description });
    setName("");
    setType("");
    setAddress("");
    setIntake("");
    setDescription("");
  };

  // seeded row to match screenshot
  const rows = [
    { name: "Boys", type: "Boys", address: "111", intake: "1111" },
  ];

  return (
    <DashboardLayout title="Dormitory List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Dormitory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">DORMITORY NAME *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">TYPE *</label>
                  <Select onValueChange={(v) => setType(v)} value={type}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Type *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys</SelectItem>
                      <SelectItem value="girls">Girls</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">ADDRESS *</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">INTAKE *</label>
                  <Input value={intake} onChange={(e) => setIntake(e.target.value)} placeholder="" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">DESCRIPTION</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md p-2 h-24" />
                </div>

                <div>
                  <Button onClick={handleSave} className="bg-purple-600 text-white">✓ SAVE DORMITORY</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dormitory List</CardTitle>
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
                    <TableHead>Dormitory Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.type}</TableCell>
                        <TableCell>{r.address}</TableCell>
                        <TableCell>{r.intake}</TableCell>
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

export default DormitoryList;
