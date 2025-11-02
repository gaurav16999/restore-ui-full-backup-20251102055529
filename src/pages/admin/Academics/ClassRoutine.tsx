import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const days = ["SATURDAY","SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"];

import { classApi, classRoomApi, subjectApi, teacherApi, roomApi } from '@/services/adminApi';
import authClient from '@/lib/http';
import { useToast } from '@/hooks/use-toast';

const ClassRoutine = () => {
  const sidebarItems = getAdminSidebarItems("/admin/academics/class-routine");

  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");
  const [activeDay, setActiveDay] = useState(1);

  const [rows, setRows] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<string[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [cdata, rdata, sdata, tdata, roomData] = await Promise.all([classApi.getAll(), classRoomApi.getAll(), subjectApi.getAll(), teacherApi.getAll(), roomApi.getAll()]);
  const clist = Array.isArray(cdata as any) ? (cdata as any) : ((cdata as any)?.results ?? []);
  const rlist = Array.isArray(rdata as any) ? (rdata as any) : ((rdata as any)?.results ?? []);
  const slist = Array.isArray(sdata as any) ? (sdata as any) : ((sdata as any)?.results ?? []);
  const tlist = Array.isArray(tdata as any) ? (tdata as any) : ((tdata as any)?.results ?? []);
  const roomList = Array.isArray(roomData as any) ? (roomData as any) : ((roomData as any)?.results ?? []);
        setClassesList(clist);
        setSectionsList(Array.from(new Set(rlist.map((x: any) => x.section).filter(Boolean))));
        setSubjectsList(slist);
        setTeachersList(tlist);
        setRoomsList(roomList);
      } catch (err) {
        console.error('Failed to load class routine options', err);
      }
    };
    load();
  }, []);

  const handleSearch = () => {
    // Fetch class schedule from backend and populate rows for the active day
    (async () => {
      try {
        if (!classVal) return toast({ title: 'Select class', description: 'Please select a class first', variant: 'destructive' });
        const resp = await authClient.get(`/api/admin/timetables/class_schedule/?class_id=${classVal}`);
        const schedule = resp.data || {};
        const dayKey = days[activeDay].toLowerCase();
        const list = schedule[dayKey] || [];
        // Map backend entries to row shape
        const mapped = list.map((it: any, idx: number) => ({
          id: it.id,
          subject: it.subject,
          subject_id: subjectsList.find(s => s.title === it.subject)?.id ?? '',
          teacher: it.teacher,
          teacher_id: teachersList.find(t => t.name === it.teacher)?.id ?? '',
          startTime: it.start_time,
          endTime: it.end_time,
          isBreak: false,
          classRoom: it.room || '',
          room_id: roomsList.find(r => r.room_number === it.room)?.id ?? ''
        }));
        setRows(mapped);
      } catch (err: any) {
        console.error('Failed to load class routine', err);
        toast({ title: 'Error', description: 'Failed to load class routine options', variant: 'destructive' });
      }
    })();
  };

  const handleAddRow = () => {
    const next = {
      id: rows.length + 1,
      subject: "",
      subject_id: '',
      teacher: "",
      teacher_id: '',
      startTime: "",
      endTime: "",
      isBreak: false,
      otherDay: "",
      classRoom: "",
      room_id: ''
    };
    setRows((s) => [next, ...s]);
  };

  const handleDelete = (id: number) => {
    setRows((s) => s.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    (async () => {
      if (!classVal) return toast({ title: 'Select class', description: 'Please select a class before saving', variant: 'destructive' });
      const dayKey = days[activeDay].toLowerCase();
      try {
        for (const r of rows) {
          // If row already has an id (existing timetable), skip for now
          if (r.id && typeof r.id === 'number' && r.id <= 1000000 && String(r.id).startsWith('')) {
            // existing entries returned from server already persisted; skipping update logic for now
            continue;
          }

          // Create a TimeSlot first
          const slotPayload = {
            name: r.period || `${r.startTime} - ${r.endTime}`,
            day_of_week: dayKey,
            start_time: r.startTime,
            end_time: r.endTime,
            is_break: !!r.isBreak
          };

          const slotRes = await authClient.post('/api/admin/time-slots/', slotPayload);
          const slotId = slotRes.data.id;

          // Prepare timetable payload
          const ttPayload: any = {
            class_assigned: Number(classVal),
            time_slot: slotId,
            subject: Number(r.subject_id || r.subject) || undefined,
            teacher: r.teacher_id ? Number(r.teacher_id) : null,
            room: r.room_id ? Number(r.room_id) : null,
            academic_year: '2024-2025',
            effective_from: new Date().toISOString().slice(0,10),
            is_active: true
          };

          await authClient.post('/api/admin/timetables/', ttPayload);
        }

        toast({ title: 'Success', description: 'Class routine saved' });
        // Refresh schedule
        handleSearch();
      } catch (err: any) {
        console.error('Failed to save class routine', err);
        toast({ title: 'Error', description: err.response?.data?.detail || 'Failed to save class routine', variant: 'destructive' });
      }
    })();
  };

  return (
    <DashboardLayout title="Class Routine Create" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>CLASS *</Label>
                <Select onValueChange={(v) => setClassVal(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary_two">PRIMARY TWO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>SECTION *</Label>
                <Select onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end justify-end">
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Class Routine Create</CardTitle>
              <div className="flex items-center gap-2">
                <Button className="bg-white border rounded text-gray-600">🖨️ PRINT</Button>
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleAddRow}>+ ADD</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              {days.map((d, idx) => (
                <button key={d} onClick={() => setActiveDay(idx)} className={`px-3 py-1 rounded ${activeDay===idx? 'bg-blue-100': 'bg-gray-50'}`}>
                  {d}
                </button>
              ))}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SUBJECT</TableHead>
                  <TableHead>TEACHER</TableHead>
                  <TableHead>START TIME</TableHead>
                  <TableHead>END TIME</TableHead>
                  <TableHead>IS BREAK</TableHead>
                  <TableHead>OTHER DAY</TableHead>
                  <TableHead>CLASS ROOM</TableHead>
                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Select onValueChange={(v) => setRows((s) => s.map((x) => x.id===r.id ? { ...x, subject: v } : x))}>
                        <SelectTrigger>
                          <SelectValue placeholder="SOCIAL studies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social">SOCIAL studies</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Select onValueChange={(v) => setRows((s) => s.map((x) => x.id===r.id ? { ...x, teacher: v } : x))}>
                        <SelectTrigger>
                          <SelectValue placeholder="John Doe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john">John Doe</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Input value={r.startTime} onChange={(e) => setRows((s) => s.map((x) => x.id===r.id ? { ...x, startTime: e.target.value } : x))} placeholder="10:17 AM" />
                    </TableCell>

                    <TableCell>
                      <Input value={r.endTime} onChange={(e) => setRows((s) => s.map((x) => x.id===r.id ? { ...x, endTime: e.target.value } : x))} placeholder="10:17 AM" />
                    </TableCell>

                    <TableCell>
                      <input type="checkbox" checked={r.isBreak} onChange={(e) => setRows((s) => s.map((x) => x.id===r.id ? { ...x, isBreak: e.target.checked } : x))} />
                    </TableCell>

                    <TableCell>
                      <button className="text-blue-500">📅</button>
                    </TableCell>

                    <TableCell>
                      <Select onValueChange={(v) => setRows((s) => s.map((x) => x.id===r.id ? { ...x, classRoom: v } : x))}>
                        <SelectTrigger>
                          <SelectValue placeholder="102" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="102">102</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <button onClick={() => handleDelete(r.id)} className="bg-purple-600 text-white rounded-full w-8 h-8">i</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-center mt-8">
              <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClassRoutine;
