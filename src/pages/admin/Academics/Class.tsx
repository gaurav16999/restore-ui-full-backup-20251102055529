import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { classApi, classRoomApi } from '@/services/adminApi';

const ClassPage = () => {
  const sidebarItems = getAdminSidebarItems("/admin/academics/class");

  const [name, setName] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch classes (for list) and classrooms (to derive canonical sections)
        const [cdata, rdata]: any = await Promise.all([classApi.getAll(), classRoomApi.getAll()]);
        const classList = Array.isArray(cdata) ? cdata : (cdata?.results ?? []);
        const roomList = Array.isArray(rdata) ? rdata : (rdata?.results ?? []);
        setClasses(classList);
        // derive sections from classrooms (Section page uses classrooms as source of truth)
        const uniqueSections = Array.from(new Set(roomList.map((c: any) => c.section).filter(Boolean))) as string[];
        setSections(uniqueSections.length ? uniqueSections : ["A", "B", "Primero"]);
      } catch (err) {
        console.error('Failed to load classes', err);
        // fallback to defaults
        setSections(["A", "B", "Primero"]);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      // backend Class serializer requires a 'room' field (non-blank). Include
      // a sensible default so server-side validation doesn't reject the request.
      const payload = { name: name.trim(), section: selectedSection ?? "", room: name.trim() } as any;
      const created = await classApi.create(payload);
      setClasses((s) => [created, ...s]);
      setName("");
      setSelectedSection(null);
    } catch (err) {
      console.error('Failed to create class', err);
      // local fallback: add to UI only
      const next = { id: classes.length + 1, name: name.trim(), section: selectedSection ?? "", room: name.trim() };
      setClasses((s) => [next, ...s]);
      setName("");
      setSelectedSection(null);
    }
  };

  return (
    <DashboardLayout
      title="Class"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>NAME *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                  <Label>SECTION *</Label>
                  <div className="mt-2">
                    {sections.map((s) => (
                      <label key={s} className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="section"
                          checked={selectedSection === s}
                          onChange={() => setSelectedSection(s)}
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE CLASS</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" className="w-full border-0 p-0" />
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                  <button className="text-gray-500">📎</button>
                  <button className="text-gray-500">🖨️</button>
                  <button className="text-gray-500">📄</button>
                  <button className="text-gray-500">▢</button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes
                    .filter((c) => !search.trim() || String(c.name).toLowerCase().includes(search.toLowerCase()))
                    .map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.section}</TableCell>
                        <TableCell>{c.students ?? c.students_count ?? 0}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">SELECT</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {classes.length} of {classes.length} entries</div>

              <div className="flex justify-center mt-6">
                <div className="inline-flex items-center gap-4">
                  <button className="text-gray-400">‹</button>
                  <div className="bg-purple-600 text-white rounded-md p-2 shadow">1</div>
                  <button className="text-gray-400">›</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassPage;
