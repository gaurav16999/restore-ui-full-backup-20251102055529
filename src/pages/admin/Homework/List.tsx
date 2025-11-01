import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const HomeworkList = () => {
  const sidebarItems = getAdminSidebarItems("/admin/homework/list");

  const [rows, setRows] = useState<any[]>([]);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [section, setSection] = useState<string | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        const resp: any = await import('@/services/adminApi').then(m => m.assignmentApi.getAll({ assignment_type: 'homework' }));
        const data = Array.isArray(resp) ? resp : resp?.results || [];
        setRows(data);
      } catch (e) {
        console.error('load homework assignments', e);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="Homework List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Class *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary_two">PRIMARY TWO</SelectItem>
                        <SelectItem value="middle_class">MIDDLE CLASS</SelectItem>
                        <SelectItem value="top_class">TOP CLASS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">SUBJECT</label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">SOCIAL studies</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">SECTION</label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex flex-col items-end space-y-3">
                <div>
                  <Button className="bg-purple-600 text-white">+ ADD HOMEWORK</Button>
                </div>
                <div>
                  <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homework List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center text-sm text-muted-foreground">🔍 QUICK SEARCH</div>
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
                  <TableHead>si</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Homework Date</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Evaluation Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell className="uppercase text-sm text-muted-foreground">{r.class_name ?? r.class_assigned}</TableCell>
                    <TableCell>{/* section not stored on assignment directly; show class */ r.class_name ? '' : (r.section ?? '')}</TableCell>
                    <TableCell>{r.subject_name ?? r.subject}</TableCell>
                    <TableCell>{r.max_marks ?? r.maxMarks ?? '-'}</TableCell>
                    <TableCell>{r.assigned_date ?? r.assignedDate ?? r.created_at}</TableCell>
                    <TableCell>{r.due_date ?? r.submission_date}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{r.teacher_name ?? '-'}</TableCell>
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

export default HomeworkList;
