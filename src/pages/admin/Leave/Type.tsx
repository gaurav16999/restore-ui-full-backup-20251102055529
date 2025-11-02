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

const LeaveType = () => {
  const sidebarItems = getAdminSidebarItems("/admin/leave/type");

  const [typeName, setTypeName] = useState("");
  const [rows, setRows] = useState<string[]>([
    "Maternity Leave",
    "Paternity Leave",
    "Sabitical Leave",
    "Sick Leave",
    "Unpaid Leave",
  ]);

  const handleSave = () => {
    if (!typeName.trim()) return;
    setRows((r) => [typeName.trim(), ...r]);
    setTypeName("");
  };

  return (
    <DashboardLayout title="Leave Type" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Add leave Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>TYPE NAME *</Label>
                    <Input value={typeName} onChange={(e) => setTypeName(e.target.value)} />
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button className="bg-purple-600 border-transparent text-white" onClick={handleSave}>✓ SAVE TYPE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Leave Type List</CardTitle>
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
                      <TableHead>Type</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((t, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm text-muted-foreground">{t}</TableCell>
                          <TableCell>
                            <Button variant="outline" className="rounded-full border-purple-600 text-purple-600">SELECT ↓</Button>
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

export default LeaveType;
