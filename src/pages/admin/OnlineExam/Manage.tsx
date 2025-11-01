import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { classApi, subjectApi } from '@/services/adminApi';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const OnlineExamManage = () => {
  const sidebarItems = getAdminSidebarItems("/admin/online-exam/manage");

  const [title, setTitle] = useState("");
  const [klass, setKlass] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minPercent, setMinPercent] = useState("");
  const [instruction, setInstruction] = useState("");
  const [autoMark, setAutoMark] = useState(false);

  const handleSave = () => {
    console.log('save online exam', { title, klass, subject, section, date, endDate, startTime, endTime, minPercent, instruction, autoMark });
  };

  const rows = [
    {
      title: 'CAT Test',
      class: 'TOP CLASS(B)',
      subject: 'SOCIAL studies',
      examDate: '26th Oct, 2025 Time:10:16 AM-10:16 AM',
      duration: 0,
      minPercent: 25,
      status: 'PENDING'
    }
  ];

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [clsRes, subRes]: any = await Promise.all([classApi.getAll(), subjectApi.getAll()]);
        const norm = (r: any) => Array.isArray(r) ? r : (r && (r.results ?? r.data)) || [];
        if (!mounted) return;
        setClasses(norm(clsRes));
        setSubjects(norm(subRes));
      } catch (err) {
        console.error('Failed to load classes/subjects', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Online Exam" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add Online Exam</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">EXAM TITLE *</label>
                    <Input value={title} onChange={(e: any) => setTitle(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                    <Select value={klass} onValueChange={(v) => setKlass(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Class *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top_class">TOP CLASS</SelectItem>
                        <SelectItem value="primary_two">PRIMARY TWO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                    <Select value={subject} onValueChange={(v) => setSubject(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Subjects *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">SOCIAL studies</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Section*</label>
                    <Select value={section} onValueChange={(v) => setSection(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">DATE *</label>
                    <Input value={date} onChange={(e: any) => setDate(e.target.value)} placeholder="10/30/2025" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">END DATE *</label>
                    <Input value={endDate} onChange={(e: any) => setEndDate(e.target.value)} placeholder="10/30/2025" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">START TIME *</label>
                    <Input value={startTime} onChange={(e: any) => setStartTime(e.target.value)} placeholder="3:48 PM" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">END TIME *</label>
                    <Input value={endTime} onChange={(e: any) => setEndTime(e.target.value)} placeholder="3:48 PM" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">MINIMUM PERCENTAGE *</label>
                    <Input value={minPercent} onChange={(e: any) => setMinPercent(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">INSTRUCTION *</label>
                    <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} className="w-full rounded border p-2 h-24" />
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={autoMark} onChange={() => setAutoMark(!autoMark)} />
                    <div className="text-sm text-muted-foreground">Auto Mark Register <div className="text-xs text-muted-foreground">(Only For Multiple)</div></div>
                  </div>

                  <div>
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE ONLINE EXAM</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Online Exam List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 text-center text-sm text-muted-foreground">🔍 QUICK SEARCH</div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" className="border rounded-full">📄</Button>
                    <Button variant="ghost" className="border rounded-full">📥</Button>
                    <Button variant="ghost" className="border rounded-full">📤</Button>
                    <Button variant="ghost" className="border rounded-full">🖨️</Button>
                    <Button variant="ghost" className="border rounded-full">▦</Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Class (Section)</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Minimum Percentage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{r.title}</TableCell>
                        <TableCell>{r.class}</TableCell>
                        <TableCell>{r.subject}</TableCell>
                        <TableCell>{r.examDate}</TableCell>
                        <TableCell>{r.duration}</TableCell>
                        <TableCell>{r.minPercent}</TableCell>
                        <TableCell><span className="px-3 py-1 bg-orange-100 text-orange-700 rounded">{r.status}</span></TableCell>
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
          </div>
        </div>

        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
};

export default OnlineExamManage;
