import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const CarryForward = () => {
  const sidebarItems = getAdminSidebarItems("/admin/fees/carry-forward");

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        const resp: any = await import('@/services/adminApi').then(m => m.classApi.getAll());
        const cls = Array.isArray(resp) ? resp : resp?.results || [];
        setClasses(cls);
        const roomsResp: any = await import('@/services/adminApi').then(m => m.classRoomApi.getAll());
        const rooms = Array.isArray(roomsResp) ? roomsResp : roomsResp?.results || [];
        setSections(rooms.map((r: any) => ({ id: r.id, name: r.section ?? r.name })));
      } catch (e) {
        console.error('load classes/sections', e);
      }
    };
    load();
  }, []);

  const handleSearch = async () => {
    try {
      const params: any = {};
      if (selectedClass) params.class_id = selectedClass;
      if (selectedSection) params.section = selectedSection;
      const resp: any = await import('@/services/adminApi').then(m => m.feeStructureApi.getAll(params));
      const data = Array.isArray(resp) ? resp : resp?.results || [];
      console.log('carry-forward results', data);
      // For now we just log; more UI can be added to display results.
    } catch (e) {
      console.error('carry forward search', e);
    }
  };

  return (
    <DashboardLayout title="Fees Carry Forward" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Select Class *</label>
                <Select onValueChange={(v) => setSelectedClass(v)} value={selectedClass}>
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
                <label className="text-sm text-muted-foreground block mb-1">Select Section *</label>
                <Select onValueChange={(v) => setSelectedSection(v)} value={selectedSection}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Section *" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 text-white" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default CarryForward;
