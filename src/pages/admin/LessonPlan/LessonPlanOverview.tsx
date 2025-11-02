import { useState, useEffect } from "react";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LessonPlanOverview = () => {
  const sidebarItems = getAdminSidebarItems("/admin/lesson-plan/lesson-plan-overview");

  const [teacher, setTeacher] = useState("");
  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<any[]>([]); // no data by default (matches screenshot)
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [teachersRes, classesRes, subjectsRes] = await Promise.all([
          authClient.get('/api/admin/teachers/'),
          authClient.get('/api/admin/classes/'),
          authClient.get('/api/admin/subjects/'),
        ]);
        setTeachersList(Array.isArray(teachersRes.data) ? teachersRes.data : teachersRes.data.results || []);
        setClassesList(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.results || []);
        setSubjectsList(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.results || []);
      } catch (error: any) {
        console.error('Failed to load lists for lesson plan overview', error);
        toast({ title: 'Error', description: 'Failed to load lists', variant: 'destructive' });
      }
    };
    load();
  }, []);

  const handleSearch = async () => {
    try {
      const params: any = {};
      if (teacher) params.teacher = teacher;
      if (classVal) params.class = classVal;
      if (subject) params.subject = subject;
      if (search) params.search = search;

      const res = await authClient.get('/api/admin/lesson-plans/', { params });
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRows(items.map((a: any) => ({
        id: a.id,
        lesson: a.lesson_title || '',
        topic: a.topic_title || '',
        supTopic: '',
        completedDate: a.planned_date || '',
        upcomingDate: '',
        status: a.status || '',
      })));
    } catch (error: any) {
      console.error('Failed to fetch lesson plans', error);
      toast({ title: 'Error', description: 'Failed to fetch lesson plans', variant: 'destructive' });
    }
  };

  const total = rows.length;
  const completed = rows.filter((r) => r.status === "completed").length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <DashboardLayout title="Lesson Plan Overview" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Plan Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">TEACHER *</label>
                <Select onValueChange={(v) => setTeacher(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Teacher *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="rachel">Rachel Okoro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
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
                <label className="text-sm text-muted-foreground block mb-1">SECTION *</label>
                <Select onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-end">
                <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                <div className="flex items-end gap-2">
                  <div className="w-full">
                    <Select onValueChange={(v) => setSubject(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="SOCIAL studies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">SOCIAL studies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Progress</CardTitle>
              <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                <button className="text-gray-500">📎</button>
                <button className="text-gray-500">🖨️</button>
                <button className="text-gray-500">📄</button>
                <button className="text-gray-500">▢</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">{completed}/{total}</div>
              <div className="flex-1 mx-4 bg-gray-100 h-2 rounded overflow-hidden">
                <div style={{ width: `${percent}%` }} className="h-2 bg-purple-600"></div>
              </div>
              <div className="text-sm text-muted-foreground">{percent} %</div>
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-1/2">
                <div className="flex items-center border-b border-gray-200 pb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                  </svg>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" className="w-full border-0 p-0" />
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Sup Topic</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Upcoming Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, idx) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.lesson}</TableCell>
                      <TableCell>{r.topic}</TableCell>
                      <TableCell>{r.supTopic}</TableCell>
                      <TableCell>{r.completedDate}</TableCell>
                      <TableCell>{r.upcomingDate}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell><button className="rounded-full border px-3 py-1 text-sm text-purple-600">SELECT</button></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to {rows.length} of {rows.length} entries</div>

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

export default LessonPlanOverview;
