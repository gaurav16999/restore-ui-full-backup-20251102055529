import { useState, useEffect } from "react";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const LessonPage = () => {
  const sidebarItems = getAdminSidebarItems("/admin/lesson-plan/lesson");

  const [classVal, setClassVal] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [serverLessons, setServerLessons] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [classesRes, subjectsRes, lessonsRes] = await Promise.all([
          authClient.get('/api/admin/classes/'),
          authClient.get('/api/admin/subjects/'),
          authClient.get('/api/admin/lessons/')
        ]);

        setClassesList(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.results || []);
        setSubjectsList(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.results || []);
        setServerLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : lessonsRes.data.results || []);
      } catch (error: any) {
        console.error('Failed to load lesson data', error);
        toast({ title: 'Error', description: 'Failed to load lessons data', variant: 'destructive' });
      }
    };

    load();
  }, []);

  const handleAddTitle = () => {
    if (!title.trim()) return;
    const next = { id: rows.length + 1, class: classVal || "", section: "A", subject: subject || "", lesson: title.trim() };
    setRows((s) => [next, ...s]);
    setTitle("");
  };

  const handleSave = async () => {
    if (rows.length === 0) return;
    try {
      for (const r of rows) {
        const payload = {
          title: r.lesson,
          subject: subject || r.subject || null,
          class_assigned: classVal || r.class || null,
        };
        await authClient.post('/api/admin/lessons/', payload);
      }
      toast({ title: 'Success', description: 'Lessons saved' });
      setRows([]);
      // refresh server lessons
      const lessonsRes = await authClient.get('/api/admin/lessons/');
      setServerLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : lessonsRes.data.results || []);
    } catch (error: any) {
      console.error('Failed to save lessons', error);
      toast({ title: 'Error', description: error?.response?.data?.detail || 'Failed to save lessons', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Add Lesson" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Lesson</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                    <Select onValueChange={(v) => setClassVal(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class *" />
                      </SelectTrigger>
                      <SelectContent>
                        {classesList.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                    <Select onValueChange={(v) => setSubject(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subjects *" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsList.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Lesson Name</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                  <div className="flex justify-end">
                    <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleAddTitle}>+</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <Card>
                <CardContent>
                  <div className="flex justify-center">
                    <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE LESSON</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lesson List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <input placeholder="SEARCH" className="w-full border-0 p-0" />
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
                    <TableHead>SL</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, idx) => (
                    <TableRow key={r.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{r.class}</TableCell>
                      <TableCell>{r.section}</TableCell>
                      <TableCell>{r.subject}</TableCell>
                      <TableCell>{r.lesson}</TableCell>
                      <TableCell>
                        <button className="rounded-full border px-3 py-1 text-sm text-purple-600">SELECT</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {rows.length} of {rows.length} entries</div>

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

export default LessonPage;
