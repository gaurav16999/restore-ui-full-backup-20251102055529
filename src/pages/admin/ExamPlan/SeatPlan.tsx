import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { examApi, classApi } from '@/services/adminApi';

const SeatPlan = () => {
  const sidebarItems = getAdminSidebarItems("/admin/exam-plan/seat-plan");

  const [exam, setExam] = useState("");
  const [klass, setKlass] = useState("");
  const [section, setSection] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [exRes, clsRes]: any = await Promise.all([
          examApi.getAll(),
          classApi.getAll(),
        ]);
        const norm = (r: any) => Array.isArray(r) ? r : (r && (r.results ?? r.data)) || [];
        if (!mounted) return;
        setExams(norm(exRes));
        setClasses(norm(clsRes));
      } catch (err) {
        console.error('Failed to load exams/classes', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSearch = () => {
    console.log('search seat plan', { exam, klass, section });
  };

  return (
    <DashboardLayout title="Generate Seat Plan" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <Card>
              <CardHeader>
                <CardTitle>Select Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                  <div>
                    <Select value={exam} onValueChange={(v) => setExam(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Exam *" />
                      </SelectTrigger>
                      <SelectContent>
                            {exams.map((e) => (
                              <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={klass} onValueChange={(v) => setKlass(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Class *" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <Select value={section} onValueChange={(v) => setSection(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Section *" />
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
            <div className="h-64 border border-dashed rounded bg-muted" />
          </div>
        </div>

        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
};

export default SeatPlan;
