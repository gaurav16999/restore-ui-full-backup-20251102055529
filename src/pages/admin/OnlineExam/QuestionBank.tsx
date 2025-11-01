import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { classApi, subjectApi } from '@/services/adminApi';

const QuestionBank = () => {
  const sidebarItems = getAdminSidebarItems("/admin/online-exam/question-bank");

  const [group, setGroup] = useState("");
  const [klass, setKlass] = useState("");
  const [section, setSection] = useState("");
  const [qtype, setQtype] = useState("");
  const [question, setQuestion] = useState("");
  const [marks, setMarks] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const handleSave = () => {
    console.log('save question', { group, klass, section, qtype, question, marks });
  };

  const rows: any[] = []; // placeholder - no data

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
    <DashboardLayout title="Question Bank" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add Question Bank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">GROUP *</label>
                    <Select value={group} onValueChange={(v) => setGroup(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Group *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="biology">Biology test</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                    <Select value={klass} onValueChange={(v) => setKlass(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Class *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary_two">PRIMARY TWO</SelectItem>
                        <SelectItem value="one_a">1A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">SECTION *</label>
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
                    <label className="text-sm text-muted-foreground block mb-1">QUESTION TYPE *</label>
                    <Select value={qtype} onValueChange={(v) => setQtype(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Question Type *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">MCQ</SelectItem>
                        <SelectItem value="short">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">QUESTION *</label>
                    <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full rounded border p-2 h-24" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">MARKS *</label>
                    <Input value={marks} onChange={(e: any) => setMarks(e.target.value)} />
                  </div>

                  <div className="flex justify-center">
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE QUESTION</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Question Bank List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 text-center text-sm text-muted-foreground">🔍 SEARCH</div>
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
                      <TableHead>Group</TableHead>
                      <TableHead>Class (Section)</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No Data Available In Table</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.group}</TableCell>
                          <TableCell>{r.class}</TableCell>
                          <TableCell>{r.question}</TableCell>
                          <TableCell>{r.type}</TableCell>
                          <TableCell>
                            <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 0 to {rows.length} of {rows.length} entries</div>
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

export default QuestionBank;
