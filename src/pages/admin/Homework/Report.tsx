import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const HomeworkReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/homework/report");

  const [rows, setRows] = useState<any[]>([]);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [section, setSection] = useState<string | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        // For report, we'll fetch submissions (empty by default)
        const resp: any = await import('@/services/adminApi').then(m => m.assignmentSubmissionApi.getAll());
        const data = Array.isArray(resp) ? resp : resp?.results || [];
        setRows(data);
      } catch (e) {
        console.error('load homework report submissions', e);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="Homework Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary_two">PRIMARY TWO</SelectItem>
                    <SelectItem value="middle_class">MIDDLE CLASS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subjects *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">SOCIAL studies</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION *</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Section *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">HOMEWORK DATE</label>
                <Input placeholder="10/30/2025" />
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homework Report</CardTitle>
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
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class (Section)</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Evaluation Date</TableHead>
                  <TableHead>Evaluated By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  rows.map((r: any, idx: number) => (
                    <TableRow key={r.id ?? idx}>
                      <TableCell>{r.student_name ?? r.student}</TableCell>
                      <TableCell>{r.assignment_title ? `${r.assignment_title}` : (r.assignment || '')}</TableCell>
                      <TableCell>{/* subject can be inferred from assignment; leave blank */ ''}</TableCell>
                      <TableCell>{r.marks_obtained ?? '-'}</TableCell>
                      <TableCell>{r.submission_date ?? r.created_at}</TableCell>
                      <TableCell>{r.graded_at ?? '-'}</TableCell>
                      <TableCell>{r.graded_by_name ?? '-'}</TableCell>
                      <TableCell>{r.status_display ?? r.status ?? '-'}</TableCell>
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

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default HomeworkReport;
