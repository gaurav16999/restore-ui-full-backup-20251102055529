import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

const MultiClassStudent = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/multi-class");
  const { toast } = useToast();

  const [academicYear, setAcademicYear] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [student, setStudent] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (className) {
      loadStudents();
    }
  }, [className]);

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

  const loadStudents = async () => {
    try {
      const res = await authClient.get('/api/admin/students/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setStudents(items.filter((s: any) => s.class_name === className));
    } catch (error: any) {
      console.error('Failed to load students', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async () => {
    try {
      const params: any = {};
      if (className) params.class_name = className;
      const res = await authClient.get('/api/admin/students/', { params });
      console.log("Multi-class students", res.data);
      toast({
        title: 'Success',
        description: 'Students loaded successfully',
      });
    } catch (error: any) {
      console.error('Failed to search', error);
      toast({
        title: 'Error',
        description: 'Failed to search students',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Multi Class Student" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700">+ DELETE STUDENT RECORD</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">ACADEMIC YEAR</label>
                <Select onValueChange={(v) => setAcademicYear(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="2025|2025" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>2025|2025</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS</label>
                <Select onValueChange={(v) => setClassName(v)} value={className}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION</label>
                <Select onValueChange={(v) => setSection(v)} value={section}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">A</SelectItem>
                    <SelectItem value="b">B</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">STUDENT</label>
                <Select onValueChange={(v) => setStudent(v)} value={student}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((stu) => (
                      <SelectItem key={stu.id} value={String(stu.id)}>{stu.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4 flex justify-end">
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty results area as per screenshot */}
        <div className="h-12" />
      </div>
    </DashboardLayout>
  );
};

export default MultiClassStudent;
