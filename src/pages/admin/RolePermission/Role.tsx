import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type RoleRow = { name: string; type: string };

const Role = () => {
  const sidebarItems = getAdminSidebarItems("/admin/role-permission/role");

  const [name, setName] = useState("");
  const [rows, setRows] = useState<RoleRow[]>([
    { name: "Accountant", type: "System" },
    { name: "Admin", type: "System" },
    { name: "Driver", type: "System" },
    { name: "Librarian", type: "System" },
    { name: "maxamed", type: "User Defined" },
    { name: "Nam", type: "User Defined" },
    { name: "Parents", type: "System" },
    { name: "Receptionist", type: "System" },
    { name: "Security", type: "User Defined" },
    { name: "Student", type: "System" },
  ]);

  const handleSave = () => {
    if (!name.trim()) return;
    setRows((r) => [{ name: name.trim(), type: "User Defined" }, ...r]);
    setName("");
  };

  return (
    <DashboardLayout title="Role Permission" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>NAME *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button className="bg-purple-600 border-transparent text-white" onClick={handleSave}>✓ SAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Role List</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input placeholder=" SEARCH" className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="inline-flex items-center space-x-2">
                      <Button variant="outline">⎘</Button>
                      <Button variant="outline">⎙</Button>
                      <Button variant="outline">▣</Button>
                      <Button variant="outline">🖨️</Button>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Type</TableHead>
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
                          <TableCell className="text-sm text-muted-foreground">{r.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Button variant="outline" className="rounded-full border-purple-600 text-purple-600">SELECT ↓</Button>
                              <Button className="bg-purple-600 border-transparent text-white">ASSIGN PERMISSION</Button>
                            </div>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Role;
