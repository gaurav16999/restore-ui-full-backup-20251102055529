import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const LeaveDefine = () => {
  const sidebarItems = getAdminSidebarItems("/admin/leave/define");

  const [role, setRole] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [days, setDays] = useState("");

  const rows: any[] = [];

  const handleSave = () => {
    console.log("save leave define", { role, leaveType, days });
  };

  return (
    <DashboardLayout title="Leave Define" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Add leave Define</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>ROLE *</Label>
                    <Select onValueChange={(v) => setRole(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Role *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>LEAVE TYPE *</Label>
                    <Select onValueChange={(v) => setLeaveType(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Leave Type *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>DAYS *</Label>
                    <Input value={days} onChange={(e) => setDays(e.target.value)} />
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
                <CardTitle>Leave Define List</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input placeholder=" QUICK SEARCH" className="w-full border rounded px-3 py-2" />
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
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.user}</TableCell>
                          <TableCell>{r.role}</TableCell>
                          <TableCell>{r.leaveType}</TableCell>
                          <TableCell>{r.days}</TableCell>
                          <TableCell>{/* actions */}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 0 to {rows.length} of {rows.length} entries</div>
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

export default LeaveDefine;
