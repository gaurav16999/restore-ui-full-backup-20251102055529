import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const ExamSetup = () => {
  const sidebarItems = getAdminSidebarItems("/admin/examination/setup");

  const [system, setSystem] = useState("");
  const [examMark, setExamMark] = useState<number | "">(0);
  const [distributions, setDistributions] = useState<{ title: string; mark: number }[]>([
    { title: "", mark: 0 },
  ]);

  const handleAddDistribution = () => {
    setDistributions((d) => [...d, { title: "", mark: 0 }]);
  };

  const handleRemoveDistribution = (index: number) => {
    setDistributions((d) => d.filter((_, i) => i !== index));
  };

  const handleDistributionChange = (index: number, key: 'title' | 'mark', value: any) => {
    setDistributions((d) => d.map((row, i) => i === index ? { ...row, [key]: key === 'mark' ? Number(value) : value } : row));
  };

  const handleSave = () => {
    console.log('save exam setup', { system, examMark, distributions });
  };

  const rows = [
    { title: 'half', class: 'TOP CLASS', section: 'B', subject: 'SOCIAL studies', total: 50, dist: 0 },
    { title: 'EVALUACION DE PROYECTO', class: '1A', section: 'Primero', subject: 'INGLES', total: 5, dist: 0 },
    { title: 'Final Term 2025', class: 'PRIMARY TWO', section: 'A', subject: 'SOCIAL studies', total: 50, dist: 'Final Term 2025' },
  ];

  const totalDistribution = distributions.reduce((s, r) => s + (Number(r.mark) || 0), 0);

  return (
    <DashboardLayout title="Exam Setup" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add Exam</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">EXAM SYSTEM *</label>
                    <Select onValueChange={(v) => setSystem(v)} value={system}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Exam System *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system_a">Exam System A</SelectItem>
                        <SelectItem value="system_b">Exam System B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">EXAM MARK *</label>
                    <Input type="number" value={examMark} onChange={(e: any) => setExamMark(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">Add Mark Distributions
                  <Button variant="ghost" className="rounded-full" onClick={handleAddDistribution}>＋</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm text-muted-foreground">EXAM TITLE</div>
                    <div className="text-sm text-muted-foreground">EXAM MARK</div>
                    <div className="text-sm text-muted-foreground">ACTION</div>
                  </div>

                  {distributions.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                      <Input value={row.title} onChange={(e: any) => handleDistributionChange(idx, 'title', e.target.value)} />
                      <Input type="number" value={row.mark} onChange={(e: any) => handleDistributionChange(idx, 'mark', e.target.value)} />
                      <div>
                        <Button variant="ghost" className="rounded-full" onClick={() => handleRemoveDistribution(idx)}>🗑️</Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Total</div>
                    <div>
                      <Input value={totalDistribution} readOnly />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent>
                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Exam List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 text-center text-sm text-muted-foreground">🔍 SEARCH</div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" className="border rounded-full">📄</Button>
                    <Button variant="ghost" className="border rounded-full">📥</Button>
                    <Button variant="ghost" className="border rounded-full">📤</Button>
                    <Button variant="ghost" className="border rounded-full">🖨️</Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Exam Title</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Total Mark</TableHead>
                      <TableHead>Mark Distribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell>{r.class}</TableCell>
                        <TableCell>{r.section}</TableCell>
                        <TableCell>{r.subject}</TableCell>
                        <TableCell>{r.total}</TableCell>
                        <TableCell>{r.dist}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {rows.length} of {rows.length} entries</div>
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center space-x-2">
                    <Button variant="ghost" className="rounded-full">←</Button>
                    <div className="bg-purple-600 text-white px-3 py-1 rounded">1</div>
                    <Button variant="ghost" className="rounded-full">→</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
};

export default ExamSetup;
