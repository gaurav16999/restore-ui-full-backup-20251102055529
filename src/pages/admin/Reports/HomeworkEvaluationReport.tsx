import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { classApi, subjectApi, classRoomApi } from "@/services/adminApi";

const HomeworkEvaluationReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/homework-evaluation");

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [classData, subjectData, roomData] = await Promise.all([
          classApi.getAll(),
          subjectApi.getAll(),
          classRoomApi.getAll()
        ]);
        setClasses(Array.isArray(classData) ? classData : ((classData as any)?.results ?? []));
        setSubjects(Array.isArray(subjectData) ? subjectData : ((subjectData as any)?.results ?? []));
        const roomList = Array.isArray(roomData) ? roomData : ((roomData as any)?.results ?? []);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    }
    loadDropdowns();
  }, []);

  return (
    <DashboardLayout title="Homework Evaluation Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Class *</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Subject *</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name || s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HomeworkEvaluationReport;
