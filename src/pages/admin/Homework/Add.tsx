import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const AddHomework = () => {
  const sidebarItems = getAdminSidebarItems("/admin/homework/add");

  const [classVal, setClassVal] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const [homeworkDate, setHomeworkDate] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [marks, setMarks] = useState("");
  const [description, setDescription] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const clsResp: any = await import('@/services/adminApi').then(m => m.classApi.getAll());
        setClasses(Array.isArray(clsResp) ? clsResp : clsResp?.results || []);
        const subResp: any = await import('@/services/adminApi').then(m => m.subjectApi.getAll());
        setSubjects(Array.isArray(subResp) ? subResp : subResp?.results || []);
      } catch (e) { console.error('load classes/subjects', e); }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      const payload: any = {
        title: `Homework - ${subject}`,
        description,
        assignment_type: 'homework',
        subject: Number(subject),
        class_assigned: Number(classVal),
        due_date: submissionDate,
        max_marks: Number(marks) || 0,
        instructions: description,
        status: 'published'
      };
      await import('@/services/adminApi').then(m => m.assignmentApi.create(payload as any));
      // simple redirect or notify - for now console log
      console.log('homework created');
    } catch (e) {
      console.error('save homework', e);
    }
  };

  return (
    <DashboardLayout title="Add Homework" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Homework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                <Select onValueChange={(v) => setClassVal(v)} value={classVal}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                <Select onValueChange={(v) => setSubject(v)} value={subject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subjects *" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.title ?? s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Section *</label>
                <Select onValueChange={(v) => setSection(v)} value={section}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">HOMEWORK DATE *</label>
                <Input value={homeworkDate} onChange={(e) => setHomeworkDate(e.target.value)} placeholder="10/30/2025" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SUBMISSION DATE *</label>
                <Input value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} placeholder="10/30/2025" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">MARKS *</label>
                <Input value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="" />
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm text-muted-foreground block mb-1">ATTACH FILE</label>
                <div className="flex items-center">
                  <Input className="flex-1" placeholder="Attach File" />
                  <Button className="ml-3 bg-purple-600 text-white">BROWSE</Button>
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="text-sm text-muted-foreground block mb-1">DESCRIPTION *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md p-2 h-28" />
              </div>

              <div className="lg:col-span-3 flex justify-center">
                <Button onClick={handleSave} className="bg-purple-600 text-white">✓ SAVE HOMEWORK</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default AddHomework;
