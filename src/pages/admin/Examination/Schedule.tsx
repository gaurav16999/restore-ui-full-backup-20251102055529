import { useEffect, useState } from "react";
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
import { examScheduleApi, examApi, classApi, subjectApi } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';

const ExamSchedule = () => {
  const sidebarItems = getAdminSidebarItems("/admin/examination/schedule");

  const [exam, setExam] = useState("");
  const [klass, setKlass] = useState("");
  const [section, setSection] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = () => {
    console.log('search schedule', { exam, klass, section });
  };

  const handleSave = () => {
    (async () => {
      try {
        const payload: any = {
          exam: exam || undefined,
          subject: undefined,
          date: undefined,
        };
        // Minimal create: backend expects full schedule fields; here we call create only if exam/klass provided
        await examScheduleApi.create(payload);
        toast({ title: 'Schedule created' });
  // reload schedules
  const resAny: any = await examScheduleApi.getAll();
  const data = Array.isArray(resAny) ? resAny : (resAny && (resAny.results ?? resAny.data)) || [];
  setRows(data);
      } catch (err: any) {
        console.error('Failed to create schedule', err);
        toast({ title: 'Failed to create schedule', variant: 'destructive', description: err?.response?.data?.detail || 'Create failed' });
      }
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [exRes, clsRes, subRes, schedRes]: any = await Promise.all([
          examApi.getAll(),
          classApi.getAll(),
          subjectApi.getAll(),
          examScheduleApi.getAll(),
        ]);
        const norm = (r: any) => Array.isArray(r) ? r : (r && (r.results ?? r.data)) || [];
        if (!mounted) return;
        setExams(norm(exRes));
        setClasses(norm(clsRes));
        setSubjects(norm(subRes));
        setRows(norm(schedRes));
      } catch (err) {
        console.error('Failed to load schedule data', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Exam Schedule Create" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <Card>
              <CardHeader>
                <CardTitle>Select Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Select value={exam} onValueChange={(v) => setExam(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="half">half</SelectItem>
                        <SelectItem value="march">March paper</SelectItem>
                        <SelectItem value="final">Final Term 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={klass} onValueChange={(v) => setKlass(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary_two">PRIMARY TWO</SelectItem>
                        <SelectItem value="top_class">TOP CLASS</SelectItem>
                        <SelectItem value="one_a">1A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <Select value={section} onValueChange={(v) => setSection(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="ml-4">
                      <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-12">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>Exam Schedule | Exam: {exam || '—'}, Class: {klass || '—'}, Section: {section || '—'}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700">🖨️ PRINT</Button>
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700">＋ ADD</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SUBJECT</TableHead>
                      <TableHead>CLASS</TableHead>
                      <TableHead>SECTION</TableHead>
                      <TableHead>TEACHER</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>START TIME</TableHead>
                      <TableHead>END TIME</TableHead>
                      <TableHead>ROOM</TableHead>
                      <TableHead>ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-24 text-center text-muted-foreground">No schedule records found.</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.subject}</TableCell>
                          <TableCell>{r.class}</TableCell>
                          <TableCell>{r.section}</TableCell>
                          <TableCell>{r.teacher}</TableCell>
                          <TableCell>{r.date}</TableCell>
                          <TableCell>{r.start}</TableCell>
                          <TableCell>{r.end}</TableCell>
                          <TableCell>{r.room}</TableCell>
                          <TableCell>
                            <Button variant="outline" className="rounded-full">EDIT</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="mt-6 flex justify-center">
                  <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
};

export default ExamSchedule;
