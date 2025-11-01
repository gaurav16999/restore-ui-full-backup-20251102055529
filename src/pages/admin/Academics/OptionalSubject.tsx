import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { classApi, classRoomApi, subjectApi } from '@/services/adminApi';

const OptionalSubject = () => {
  const sidebarItems = getAdminSidebarItems("/admin/academics/optional-subject");

  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cdata, rdata, sdata] = await Promise.all([classApi.getAll(), classRoomApi.getAll(), subjectApi.getAll()]);
        const classList = Array.isArray(cdata) ? cdata : ((cdata as any)?.results ?? []);
        const roomList = Array.isArray(rdata) ? rdata : ((rdata as any)?.results ?? []);
        const subjectList = Array.isArray(sdata) ? sdata : ((sdata as any)?.results ?? []);
        setClasses(classList);
        setSections(Array.from(new Set(roomList.map((r: any) => r.section).filter(Boolean))));
        setSubjects(subjectList);
      } catch (err) {
        console.error('Failed to load optional subject options', err);
      }
    };
    load();
  }, []);

  const handleSearch = () => {
    console.log("search optional subjects", { classVal, section, subject });
  };

  return (
    <DashboardLayout
      title="Optional Subject"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                <Select onValueChange={(v) => setClassVal(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name || c.title || c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION *</label>
                <Select onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section *" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                <Select onValueChange={(v) => setSubject(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject *" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.title || s.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>SEARCH</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OptionalSubject;
