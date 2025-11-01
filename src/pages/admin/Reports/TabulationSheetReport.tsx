import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { examApi, classApi, classRoomApi, studentApi } from "@/services/adminApi";

const TabulationSheetReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/exam/tabulation-sheet");

  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [examData, classData, roomData, studentData] = await Promise.all([
          examApi.getAll(),
          classApi.getAll(),
          classRoomApi.getAll(),
          studentApi.getAll()
        ]);
        setExams(Array.isArray(examData) ? examData : ((examData as any)?.results ?? []));
        setClasses(Array.isArray(classData) ? classData : ((classData as any)?.results ?? []));
        const roomList = Array.isArray(roomData) ? roomData : ((roomData as any)?.results ?? []);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
        setStudents(Array.isArray(studentData) ? studentData : ((studentData as any)?.results ?? []));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    }
    loadDropdowns();
  }, []);

  return (
    <DashboardLayout title="Tabulation Sheet Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="text-xs">EXAM *</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Exam *</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>{e.title || e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">CLASS *</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Class *</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">SECTION *</Label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Section *</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-full">
                  <Label className="text-xs">STUDENT</Label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="">Select Student</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.first_name && st.last_name ? `${st.first_name} ${st.last_name}` : st.name || st.admission_no}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3">
                  <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* placeholder below criteria to match design spacing */}
        <div className="mt-6" />
      </div>
    </DashboardLayout>
  );
};

export default TabulationSheetReport;
