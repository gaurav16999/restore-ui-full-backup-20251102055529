import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { teacherApi, teacherAssignmentApi, classApi, classRoomApi, subjectApi } from '@/services/adminApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AssignClassTeacher = () => {
  const sidebarItems = getAdminSidebarItems("/admin/academics/assign-class-teacher");

  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  

  useEffect(() => {
    const load = async () => {
      try {
        const [tdata, adata, cdata, rdata, sdata]: any = await Promise.all([
          teacherApi.getAll(),
          teacherAssignmentApi.getAll(),
          classApi.getAll(),
          classRoomApi.getAll(),
          subjectApi.getAll(),
        ]);

  const tlist = Array.isArray(tdata) ? tdata : (tdata?.results ?? []) as any[];
  const alist = Array.isArray(adata) ? adata : (adata?.results ?? []) as any[];
  const clist = Array.isArray(cdata) ? cdata : (cdata?.results ?? []) as any[];
  const rlist = Array.isArray(rdata) ? rdata : (rdata?.results ?? []) as any[];

        setTeachers(tlist);
        // Normalize assignment objects so the UI has consistent keys regardless
        // of whether the API returned nested objects or flattened fields.
        const normalizedAssignments = alist.map((a: any) => ({
          ...a,
          class_name: a.class_name || a.class_assigned?.name || a.class?.name || a.class || a.class_name,
          class_section: a.class_section || a.section || a.class_assigned?.section || a.class?.section || '',
          teacher_name: a.teacher_name || a.teacher?.full_name || a.teacher?.name || '',
        }));
        setAssignments(normalizedAssignments);
        setClasses(clist);
  const slist = Array.isArray(sdata) ? sdata : (sdata?.results ?? []) as any[];
  setSubjects(slist);

  const uniqueSections = Array.from(new Set(rlist.map((c: any) => c.section).filter(Boolean))) as string[];
  setSectionsList(uniqueSections.length ? uniqueSections : []);
      } catch (err) {
        console.error('Failed to load assign class teacher data', err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!classVal || !section || !selectedTeacher || !selectedSubject) return;
    try {
      const payload = { teacher: Number(selectedTeacher), class_assigned: Number(classVal), subject: Number(selectedSubject) } as any;
      const created = await teacherAssignmentApi.create(payload);
      setAssignments((s) => [created, ...s]);
      setClassVal("");
      setSection("");
      setSelectedTeacher("");
      setSelectedSubject("");
    } catch (err) {
      console.error('Failed to create teacher assignment', err);
    }
  };

  return (
    <DashboardLayout
      title="Assign Class Teacher"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Class Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                  <Select value={classVal} onValueChange={(v) => setClassVal(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class *" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c: any) => (
                        <SelectItem key={c.id ?? c.name} value={String(c.id ?? c.name)}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
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
                  <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject *" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.title ?? s.code ?? s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">TEACHER *</label>
                  <div className="mt-2 space-y-2 max-h-52 overflow-auto">
                    {teachers.map((t: any) => {
                      const id = t?.id ?? String(t);
                      const label = t?.full_name ?? t?.name ?? (t?.first_name && t?.last_name ? `${t.first_name} ${t.last_name}` : String(t));
                      return (
                        <label key={id} className="flex items-center gap-2">
                          <input type="radio" name="teacher" checked={selectedTeacher === String(id)} onChange={() => setSelectedTeacher(String(id))} />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE CLASS TEACHER</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Teacher List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" className="w-full border-0 p-0" />
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                  <button className="text-gray-500">📎</button>
                  <button className="text-gray-500">🖨️</button>
                  <button className="text-gray-500">📄</button>
                  <button className="text-gray-500">▢</button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a: any) => {
                    const key = a?.id ?? JSON.stringify(a);
                    const classLabel = a?.class?.name ?? a?.class_assigned?.name ?? a?.class ?? a?.class_name ?? a?.class_name ?? '';
                    const sectionLabel = a?.section ?? a?.class_section ?? '';
                    const teacherLabel = a?.teacher?.full_name ?? a?.teacher?.name ?? a?.teacher_name ?? (a?.teacher && typeof a.teacher === 'string' ? a.teacher : '');
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{classLabel}</TableCell>
                        <TableCell>{sectionLabel}</TableCell>
                        <TableCell>{teacherLabel}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">SELECT</Button>
                        </TableCell>
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
      </div>
    </DashboardLayout>
  );
};

export default AssignClassTeacher;
