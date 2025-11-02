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

import { classRoomApi } from '@/services/adminApi';

const Section = () => {
  const sidebarItems = getAdminSidebarItems("/admin/academics/section");

  const [name, setName] = useState("");
  const [sections, setSections] = useState<{ id?: number; name: string }[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data: any = await classRoomApi.getAll();
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        const unique = Array.from(new Map(list.map((c: any) => [c.section, c])).values()).map((c: any, idx: number) => ({ id: idx + 1, name: c.section || c.name }));
        setSections(unique.filter(s => s.name));
      } catch (err) {
        console.error('Failed to load sections', err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      // Persist section by creating a lightweight classroom entry with the section set.
      // ClassRoom model requires `grade_level` and `room_code` (non-nullable), so provide safe defaults.
      const safeName = name.trim();
      const payload = {
        name: safeName,
        section: safeName,
        grade_level: 'General',
        room_code: `SEC-${Date.now()}`,
        is_active: true,
      } as any;
      const created: any = await classRoomApi.create(payload);

      // Refresh sections from API (ensure any server-side normalization is reflected)
      const data: any = await classRoomApi.getAll();
      const list = Array.isArray(data) ? data : (data?.results ?? []);
      const unique = Array.from(new Map(list.map((c: any) => [c.section, c])).values()).map((c: any, idx: number) => ({ id: idx + 1, name: c.section || c.name }));
      setSections(unique.filter(s => s.name));
      setName("");
    } catch (err) {
      console.error('Failed to save section', err);
      // fallback to optimistic UI update
      const next = { id: sections.length + 1, name: name.trim() };
      setSections((s) => [next, ...s]);
      setName("");
    }
  };

  return (
    <DashboardLayout
      title="Section"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE SECTION</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Section List</CardTitle>
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
                    <TableHead>Section</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">SELECT</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {sections.length} of {sections.length} entries</div>

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

export default Section;
