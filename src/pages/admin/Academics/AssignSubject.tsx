import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { classApi, subjectApi, classSubjectApi, classRoomApi, teacherApi, teacherAssignmentApi, assignSubjectToClass, assignTeacherToClass } from '@/services/adminApi';

const AssignSubject = () => {
  const sidebarItems = getAdminSidebarItems("/admin/academics/assign-subject");

  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [clistData, slistData, assignData, rdata, tdata] = await Promise.all([
          classApi.getAll(),
          subjectApi.getAll(),
          classSubjectApi.getAll(),
          classRoomApi.getAll(),
          teacherApi.getAll(),
        ]);
  // The admin API sometimes returns paginated objects { results: [] }
  // or a raw array. Normalize both cases safely.
  const clist = Array.isArray(clistData) ? clistData : (clistData && (clistData as any).results ? (clistData as any).results : []);
  const slist = Array.isArray(slistData) ? slistData : (slistData && (slistData as any).results ? (slistData as any).results : []);
  const alist = Array.isArray(assignData) ? assignData : (assignData && (assignData as any).results ? (assignData as any).results : []);
  const rlist = Array.isArray(rdata) ? rdata : (rdata && (rdata as any).results ? (rdata as any).results : []);
  const tlist = Array.isArray(tdata) ? tdata : (tdata && (tdata as any).results ? (tdata as any).results : []);
  // fetch teacher assignments separately
  const tatRaw = await teacherAssignmentApi.getAll();
  const tatlist = Array.isArray(tatRaw) ? tatRaw : (tatRaw && (tatRaw as any).results ? (tatRaw as any).results : []);
        setClasses(clist);
        setSubjects(slist);
        setAssignments(alist);
        setClassrooms(rlist);
        setTeachers(tlist);
        setTeacherAssignments(tatlist);
        // build quick lookup map for classId-subjectId -> teacher name
        const map: Record<string, string> = {};
        tatlist.forEach((t: any) => {
          const cid = t.class_id ?? t.class_assigned?.id ?? t.class_assigned ?? t.class;
          const sid = t.subject_id ?? t.subject?.id ?? t.subject;
          if (cid != null && sid != null) {
            const key = `${cid}-${sid}`;
            map[key] = t.teacher_name ?? t.teacher?.full_name ?? t.teacher?.name ?? '';
          }
        });
        setTeacherMap(map);
      } catch (err) {
        console.error('Failed to load assigned subjects', err);
      }
    };
    load();
  }, []);

  const handleSearch = () => {
    // placeholder: would call backend to filter assignments
    console.log('search assign subject', { classVal, section, subject });
  };

  const openAssignModal = () => {
    // placeholder: would open a modal to assign new subject
    console.log('open assign modal');
  };

  return (
    <DashboardLayout
      title="Assign Subject"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between w-full">
              <div>
                <CardTitle>Select Criteria</CardTitle>
                <CardDescription />
              </div>
              <div className="flex items-center gap-2">
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={openAssignModal}>+ ASSIGN SUBJECT</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select value={classVal} onValueChange={(v) => setClassVal(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={section} onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section *" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(classes.map((c: any) => c.section).filter(Boolean))).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end justify-end">
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Subject to Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                <Select value={classVal} onValueChange={(v) => setClassVal(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION *</label>
                <Select value={section} onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section *" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(classes.map((c: any) => c.section).filter(Boolean))).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                <Select value={subject} onValueChange={(v) => setSubject(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject *" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.title ?? s.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">TEACHER *</label>
                <Select value={selectedTeacher} onValueChange={(v) => setSelectedTeacher(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Teacher *" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4 flex justify-end">
                <Button className="bg-green-600 border-transparent hover:bg-green-700" onClick={async () => {
                  // assign subject to class and teacher
                  if (!classVal || !subject || !selectedTeacher) return;
                  try {
                    const classId = Number(classVal);
                    const subjectId = Number(subject);
                    // check if class-subject exists
                    const exists = assignments.some((a: any) => (a.class_assigned === classId || a.class_assigned?.id === classId || a.class_id === classId) && (a.subject === subjectId || a.subject_id === subjectId));
                    if (!exists) {
                      const created = await assignSubjectToClass(classId, subjectId, true);
                      setAssignments((s) => [created, ...s]);
                    }
                    // now assign teacher
                    const teacherId = Number(selectedTeacher);
                    const taCreated = await assignTeacherToClass(teacherId, Number(classVal), Number(subject));
                    setTeacherAssignments((s) => [taCreated, ...s]);
                    // clear selections
                    setSubject("");
                    setSelectedTeacher("");
                  } catch (e) {
                    console.error('Assign failed', e);
                  }
                }}>ASSIGN SUBJECT TO TEACHER</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Subject</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" className="border-0 p-0" />
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                  <button className="text-gray-500">📎</button>
                  <button className="text-gray-500">🖨️</button>
                  <button className="text-gray-500">📄</button>
                  <button className="text-gray-500">▢</button>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments
                  .filter((a) => {
                    if (classVal && String(a.class_id ?? a.class_assigned ?? a.class) !== String(classVal)) return false;
                    if (section && String(a.class_section ?? a.section) !== String(section)) return false;
                    if (search && !(String(a.subject_title ?? a.subject ?? a.subject_name ?? '').toLowerCase().includes(search.toLowerCase()))) return false;
                    return true;
                  })
                  .map((a) => {
                    const subjectLabel = a.subject_title ?? a.subject?.title ?? a.subject ?? a.subject_name ?? '';
                    const cid = a.class_assigned ?? a.class_id ?? a.class ?? (a.class_assigned?.id ?? undefined);
                    const sid = a.subject ?? a.subject_id ?? (a.subject?.id ?? undefined);
                    const key = `${cid}-${sid}`;
                    const teacherLabel = teacherMap[key] ?? a.teacher_name ?? a.teacher?.full_name ?? a.teacher?.name ?? '';
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{subjectLabel}</TableCell>
                        <TableCell>{teacherLabel}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {assignments.length} of {assignments.length} entries</div>

            <div className="flex justify-center mt-6">
              <div className="inline-flex items-center gap-4">
                <button className="text-gray-400">‹</button>
                <div className="bg-purple-600 text-white rounded-md p-2 shadow">1</div>
                <button className="text-gray-400">›</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AssignSubject;
