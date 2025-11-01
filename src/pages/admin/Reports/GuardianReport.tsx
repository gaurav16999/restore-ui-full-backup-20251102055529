import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { classApi, classRoomApi } from "@/services/adminApi";

const GuardianReport: React.FC = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/guardian");

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [classData, roomData] = await Promise.all([
          classApi.getAll(),
          classRoomApi.getAll()
        ]);
        setClasses(Array.isArray(classData) ? classData : ((classData as any)?.results ?? []));
        const roomList = Array.isArray(roomData) ? roomData : ((roomData as any)?.results ?? []);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    }
    loadDropdowns();
  }, []);

  return (
    <DashboardLayout title="Guardian Reports" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="text-xs">Class</Label>
                <select className="w-full border rounded px-3 py-2 mt-1">
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Section</Label>
                <select className="w-full border rounded px-3 py-2 mt-1">
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 lg:col-span-2 flex justify-end">
                <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardian Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">&nbsp;</div>
              <div>
                <Input placeholder="Search" className="w-64" />
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Guardians Name</TableHead>
                    <TableHead>Relation With Guardian</TableHead>
                    <TableHead>Guardians Phone</TableHead>
                    <TableHead>Father Name</TableHead>
                    <TableHead>Father Phone</TableHead>
                    <TableHead>Mother Name</TableHead>
                    <TableHead>Mother Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
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

export default GuardianReport;
