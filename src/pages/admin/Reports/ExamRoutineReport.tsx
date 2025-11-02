import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { examScheduleApi, examApi, classApi, classRoomApi } from "@/services/adminApi";

interface RoutineRow {
  id: number;
  date?: string;
  subject?: string;
  class_section?: string;
  teacher?: string;
  time?: string;
  duration?: string;
  room?: string;
}

const ExamRoutineReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/exam/routine");

  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [rows, setRows] = useState<RoutineRow[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadDropdowns() {
      try {
        const [examData, classData, roomData] = await Promise.all([
          examApi.getAll(),
          classApi.getAll(),
          classRoomApi.getAll()
        ]);
        if (!mounted) return;
        setExams(Array.isArray(examData) ? examData : ((examData as any)?.results ?? []));
        setClasses(Array.isArray(classData) ? classData : ((classData as any)?.results ?? []));
        const roomList = Array.isArray(roomData) ? roomData : ((roomData as any)?.results ?? []);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    }
    loadDropdowns();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await examScheduleApi.getAll();
        if (!mounted) return;
        const mapped = (data || []).map((s: any) => ({
          id: s.id,
          date: s.date,
          subject: s.subject_name || s.subject || 'N/A',
          class_section: s.class_name || `${s.class_assigned || ''} (${s.section || ''})`,
          teacher: s.invigilator_name || s.invigilator || '',
          time: s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : s.start_time || '',
          duration: s.duration_minutes ? `${s.duration_minutes} mins` : '',
          room: s.room_name || s.room || ''
        }));
        setRows(mapped);
      } catch (err) {
        console.error('Failed to load exam schedules', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Exam Routine Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        {/* Select Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              <div>
                <Label className="text-xs">EXAM *</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Exam *</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>{e.title || e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">CLASS *</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Class *</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-full">
                  <Label className="text-xs">SECTION</Label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="">Select Section</option>
                    {sections.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-3">
                  <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routine Table */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Routine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="mx-auto text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <span>SEARCH</span>
              </div>

              <div className="flex items-center gap-3">
                <Button className="bg-purple-600 text-white">🖨️ PRINT</Button>
                <div className="flex items-center gap-2 border rounded px-2 py-1">
                  <button className="p-2">📄</button>
                  <button className="p-2">📥</button>
                  <button className="p-2">📤</button>
                  <button className="p-2">🖨️</button>
                </div>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Day</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class (Section)</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Room</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.subject}</TableCell>
                        <TableCell>{r.class_section}</TableCell>
                        <TableCell>{r.teacher}</TableCell>
                        <TableCell>{r.time}</TableCell>
                        <TableCell>{r.duration}</TableCell>
                        <TableCell>{r.room}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>

            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-4 text-muted-foreground">
                <button className="p-2">◀</button>
                <button className="p-2">▶</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExamRoutineReport;
