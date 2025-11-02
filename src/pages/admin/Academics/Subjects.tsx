import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { subjectApi, createSubject } from '@/services/adminApi';

const Subjects = () => {
  const sidebarItems = getAdminSidebarItems("/admin/academics/subjects");

  const [name, setName] = useState("");
  const [type, setType] = useState<'Theory' | 'Practical'>('Theory');
  const [code, setCode] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data: any = await subjectApi.getAll();
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        setSubjects(list);
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) return;
  const payload = { code: code.trim(), title: name.trim(), description: '', credit_hours: 1, subject_type: (type === 'Practical' ? 'practical' : 'theory') } as any;
    console.debug('Subjects.handleSave payload ->', payload);
    try {
      if (selectedId) {
        // update
        const updated = await subjectApi.update(selectedId, payload as any);
        setSubjects((s) => s.map((x) => (x.id === selectedId ? updated : x)));
      } else {
        // create
        const created = await createSubject(payload);
        console.debug('Subjects.handleSave created ->', created);
        setSubjects((s) => [created, ...s]);
      }
      // reset form
      setName('');
      setCode('');
      setType('Theory');
      setSelectedId(null);
    } catch (err) {
      console.error('Failed to create/update subject', err);
    }
  };

  const handleSelect = (s: any) => {
    setSelectedId(s.id ?? null);
    setName(s.title ?? s.subject ?? '');
    setCode(s.code ?? s.subject_code ?? '');
    // try to infer type
  if (s.subject_type) setType(s.subject_type === 'practical' ? 'Practical' : 'Theory');
  else if (s.type) setType(s.type === 'Practical' ? 'Practical' : 'Theory');
  else if (s.is_practical !== undefined) setType(s.is_practical ? 'Practical' : 'Theory');
    else setType('Theory');
  };

  return (
    <DashboardLayout
      title="Subject"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>SUBJECT NAME *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                  <Label>TYPE</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="stype" checked={type === 'Theory'} onChange={() => setType('Theory')} />
                      <span>Theory</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="stype" checked={type === 'Practical'} onChange={() => setType('Practical')} />
                      <span>Practical</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>SUBJECT CODE *</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} />
                </div>

                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE SUBJECT</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject List</CardTitle>
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
                    <TableHead>SL</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Subject Type</TableHead>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s, idx) => (
                    <TableRow key={s.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{s.title ?? s.subject}</TableCell>
                      <TableCell>{
                        s.subject_type ? (s.subject_type === 'practical' ? 'Practical' : 'Theory') : (s.type ?? (s.is_practical ? 'Practical' : 'Theory'))
                      }</TableCell>
                      <TableCell>{s.code ?? s.subject_code}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleSelect(s)}>{selectedId === s.id ? 'EDIT' : 'SELECT'}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {subjects.length} of {subjects.length} entries</div>

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

export default Subjects;
