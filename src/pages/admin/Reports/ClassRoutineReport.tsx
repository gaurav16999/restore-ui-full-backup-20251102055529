import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { classApi, classRoomApi } from "@/services/adminApi";

const ClassRoutineReport: React.FC = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/class-routine");

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [classData, roomData] = await Promise.all([
          classApi.getAll(),
          classRoomApi.getAll()
        ]);
        setClasses(Array.isArray(classData) ? classData : ((classData as any)?.results ?? []));
        const roomList = Array.isArray(roomData) ? roomData : ((roomData as any)?.results ?? []);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    }
    loadDropdowns();
  }, []);

  const days = [
    "SATURDAY",
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ];

  return (
    <DashboardLayout title="Class Routine Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
              <div className="lg:col-span-3">
                <Label className="text-xs">Class *</Label>
                <select className="w-full border rounded px-3 py-2 mt-1">
                  <option value="">Select Class *</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <Label className="text-xs">Section *</Label>
                <select className="w-full border rounded px-3 py-2 mt-1">
                  <option value="">Select Section *</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-6 flex justify-end">
                <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Class Routine</CardTitle>
              <div>
                <Button className="bg-purple-600 text-white">🖨️ PRINT</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-6 text-xs text-center text-muted-foreground">
              {days.map((d) => (
                <div key={d} className="border-t py-6">
                  <div className="font-semibold text-sm">{d}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClassRoutineReport;
