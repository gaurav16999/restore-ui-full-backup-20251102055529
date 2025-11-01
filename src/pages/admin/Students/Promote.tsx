import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

const StudentPromote = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/promote");
  const { toast } = useToast();

  const [academicYear, setAcademicYear] = useState("");
  const [promoteSession, setPromoteSession] = useState("");
  const [currentClass, setCurrentClass] = useState("");
  const [section, setSection] = useState("");
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
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

  const handleSearch = async () => {
    try {
      const params: any = {};
      if (currentClass) params.class_name = currentClass;
      const res = await authClient.get('/api/admin/students/', { params });
      console.log("Students to promote", res.data);
      toast({
        title: 'Success',
        description: `Found ${Array.isArray(res.data) ? res.data.length : res.data.results?.length || 0} students`,
      });
    } catch (error: any) {
      console.error('Failed to search students', error);
      toast({
        title: 'Error',
        description: 'Failed to search students',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Student Promote" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">ACADEMIC YEAR *</label>
                <Select onValueChange={(v) => setAcademicYear(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Academic Year *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select Academic Year *</SelectItem>
                    <SelectItem value="2023-2024">2023 - 2024</SelectItem>
                    <SelectItem value="2024-2025">2024 - 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">PROMOTE SESSION *</label>
                <Select onValueChange={(v) => setPromoteSession(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Promote Academic Year *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Promote Academic Year *</SelectItem>
                    <SelectItem value="2024-2025">2024 - 2025</SelectItem>
                    <SelectItem value="2025-2026">2025 - 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">CURRENT CLASS *</label>
                <Select onValueChange={(v) => setCurrentClass(v)} value={currentClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Current Class *" />
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
                <Select onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section*" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select Section*</SelectItem>
                    <SelectItem value="a">A</SelectItem>
                    <SelectItem value="b">B</SelectItem>
                  </SelectContent>
                </Select>
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

export default StudentPromote;
