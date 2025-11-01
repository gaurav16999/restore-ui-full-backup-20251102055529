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

const MarksGrade = () => {
  const sidebarItems = getAdminSidebarItems("/admin/examination/marks-grade");

  const [gradeName, setGradeName] = useState("");
  const [gpa, setGpa] = useState("");
  const [percentFrom, setPercentFrom] = useState("");
  const [percentTo, setPercentTo] = useState("");
  const [gpaFrom, setGpaFrom] = useState("");
  const [gpaTo, setGpaTo] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    console.log('save grade', { gradeName, gpa, percentFrom, percentTo, gpaFrom, gpaTo, description });
  };

  const rows = [
    { grade: 'Maths', gpa: 7, percent: '0-100%', gpaRange: '1-5' },
    { grade: 'Maths', gpa: 7, percent: '0-100%', gpaRange: '1-5' },
    { grade: 'A+', gpa: 5, percent: '80-100%', gpaRange: '4.01-5' },
    { grade: 'A+', gpa: 5, percent: '80-100%', gpaRange: '4.01-5' },
    { grade: 'A', gpa: 4, percent: '70-79.99%', gpaRange: '4-4.99' },
    { grade: 'A', gpa: 4, percent: '70-79.99%', gpaRange: '4-4.99' },
    { grade: 'A-', gpa: 3.5, percent: '60-69.99%', gpaRange: '3.5-3.99' },
    { grade: 'A-', gpa: 3.5, percent: '60-69.99%', gpaRange: '3.5-3.99' },
    { grade: 'B', gpa: 3, percent: '50-59.99%', gpaRange: '3-3.49' },
    { grade: 'B', gpa: 3, percent: '50-59.99%', gpaRange: '3-3.49' },
  ];

  return (
    <DashboardLayout title="Marks Grade" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Grade Name *</label>
                    <Input value={gradeName} onChange={(e: any) => setGradeName(e.target.value)} placeholder="" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">GPA *</label>
                    <Input value={gpa} onChange={(e: any) => setGpa(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">PERCENT FROM *</label>
                    <Input value={percentFrom} onChange={(e: any) => setPercentFrom(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">PERCENT TO *</label>
                    <Input value={percentTo} onChange={(e: any) => setPercentTo(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">GPA FROM *</label>
                    <Input value={gpaFrom} onChange={(e: any) => setGpaFrom(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">GPA TO *</label>
                    <Input value={gpaTo} onChange={(e: any) => setGpaTo(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border p-2 h-24" />
                  </div>

                  <div>
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE GRADE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Grade List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 text-center text-sm text-muted-foreground">🔍 SEARCH</div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" className="border rounded-full">📄</Button>
                    <Button variant="ghost" className="border rounded-full">📥</Button>
                    <Button variant="ghost" className="border rounded-full">📤</Button>
                    <Button variant="ghost" className="border rounded-full">🖨️</Button>
                    <Button variant="ghost" className="border rounded-full">▦</Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Percent (From-To)</TableHead>
                      <TableHead>GPA (From-To)</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.grade}</TableCell>
                        <TableCell>{r.gpa}</TableCell>
                        <TableCell>{r.percent}</TableCell>
                        <TableCell>{r.gpaRange}</TableCell>
                        <TableCell>
                          <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                        </TableCell>
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

export default MarksGrade;
