import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const StudentLoginInfo: React.FC = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/login");

  const classes = ["PRIMARY TWO", "PRIMARY ONE"];
  const sections = ["Select Current Section", "A", "B"];

  return (
    <DashboardLayout title="Student Login Info" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
              <div className="lg:col-span-3">
                <Label className="text-xs">Class *</Label>
                <select className="w-full border rounded px-3 py-2 mt-1">
                  {classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <Label className="text-xs">Section</Label>
                <select className="w-full border rounded px-3 py-2 mt-1">
                  {sections.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-6 flex justify-end">
                <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">&nbsp;</div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search" className="w-64" />
                </div>
                {/* action icons placeholder */}
                <div className="space-x-2">
                  <button className="border rounded-full px-2 py-1">⤓</button>
                  <button className="border rounded-full px-2 py-1">📄</button>
                </div>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SL</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email & Password</TableHead>
                    <TableHead>Parent Email & Password</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No Data Available In Table
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-gray-500">Showing 0 to 0 of 0 entries</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentLoginInfo;
