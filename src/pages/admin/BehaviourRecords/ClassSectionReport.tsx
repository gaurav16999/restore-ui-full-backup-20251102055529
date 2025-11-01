import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const ClassSectionReport: React.FC = () => {
  const [rows, setRows] = useState<Array<any>>([]);

  useEffect(() => {
    loadClassSectionReport();
  }, []);

  const loadClassSectionReport = async () => {
    try {
      const incidentsData = await (await import('@/services/adminApi')).studentIncidentApi.getAll();
      const incidents = Array.isArray(incidentsData) ? incidentsData : (incidentsData as any)?.results || [];
      const studentsData = await (await import('@/services/adminApi')).studentApi.getAll();
      const students = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.results || [];
      const studentMap: Record<number, any> = {};
      students.forEach((s: any) => { studentMap[s.id] = s; });

      const classMap: Record<string, { studentsSet: Set<number>; points: number }> = {};
      incidents.forEach((inc: any) => {
        const sid = inc.student;
        const student = studentMap[sid];
        const className = (student && student.class_name) ? student.class_name : 'Unassigned';
        if (!classMap[className]) classMap[className] = { studentsSet: new Set(), points: 0 };
        classMap[className].studentsSet.add(sid);
        classMap[className].points += (inc.points || 0);
      });

      const out = Object.entries(classMap).map(([className, v], idx) => ({
        rank: idx + 1,
        className,
        students: v.studentsSet.size,
        sections: `${v.studentsSet.size === 0 ? '' : `A-(${v.studentsSet.size})`}`,
        points: v.points,
      }));
      setRows(out);
    } catch (err) {
      console.error('Failed to load class section report', err);
    }
  };

  const sidebarItems = getAdminSidebarItems("/admin/behaviour-records/class-section-report");

  return (
    <DashboardLayout title="Class Section Wise Rank Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Section Wise Rank Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">🔍 SEARCH</div>
              <div className="flex space-x-2">
                <Button variant="ghost" className="border rounded-full">📄</Button>
                <Button variant="ghost" className="border rounded-full">📥</Button>
                <Button variant="ghost" className="border rounded-full">📤</Button>
                <Button variant="ghost" className="border rounded-full">🖨️</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Section-(Students)</TableHead>
                  <TableHead>Total Points</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.className}>
                    <TableCell>{r.rank}</TableCell>
                    <TableCell>{r.className}</TableCell>
                    <TableCell>{r.students}</TableCell>
                    <TableCell>{r.sections}</TableCell>
                    <TableCell>{r.points}</TableCell>
                    <TableCell>
                      <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                    </TableCell>
                  </TableRow>
                ))}
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

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};
export default ClassSectionReport;
