import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

const SubjectAttendance = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/subject-attendance");
  const { toast } = useToast();

  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await authClient.get('/api/admin/classes/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setClasses(items);
    } catch (error: any) {
      console.error('Failed to load classes', error);
      toast({
        title: 'Error',
        description: 'Failed to load classes',
        variant: 'destructive',
      });
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await authClient.get('/api/admin/subjects/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setSubjects(items);
    } catch (error: any) {
      console.error('Failed to load subjects', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async () => {
    try {
      const params: any = {};
      if (className) params.class_name = className;
      if (attendanceDate) params.date = attendanceDate;
      
      const res = await authClient.get('/api/admin/attendance/', { params });
      console.log("Subject attendance", res.data);
      toast({
        title: 'Success',
        description: 'Attendance records loaded',
      });
    } catch (error: any) {
      console.error('Failed to load attendance', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Subject Wise Attendance" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                <Select onValueChange={(v) => setClassName(v)} value={className}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION *</label>
                <Select onValueChange={(v) => setSection(v)} value={section}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">A</SelectItem>
                    <SelectItem value="b">B</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                <Select onValueChange={(v) => setSubject(v)} value={subject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject *" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subj) => (
                      <SelectItem key={subj.id} value={subj.title}>{subj.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Attendance Date *</label>
                <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default SubjectAttendance;
