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

const ExamType = () => {
  const sidebarItems = getAdminSidebarItems("/admin/examination/type");

  const [name, setName] = useState("");
  const [isAveragePassing, setIsAveragePassing] = useState(false);

  const handleSave = () => {
    console.log("save exam type", { name, isAveragePassing });
  };

  const rows = [
    { name: "half", average: "No", avgMark: "0.00" },
    { name: "March paper", average: "No", avgMark: "0.00" },
    { name: "EVALUACION DE PROYECTO", average: "Yes", avgMark: "3.50" },
    { name: "Final Term 2025", average: "No", avgMark: "0.00" },
  ];

  return (
    <DashboardLayout title="Exam Type" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add Exam Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Exam Name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Average Passing Examination</label>
                    <div className="flex items-center gap-3 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="avgPass" checked={isAveragePassing} onChange={() => setIsAveragePassing(true)} />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="avgPass" checked={!isAveragePassing} onChange={() => setIsAveragePassing(false)} />
                        <span className="text-sm">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE EXAM TYPE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Exam Type List</CardTitle>
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
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Is Average Passing Exam</TableHead>
                      <TableHead>Average Mark</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.average}</TableCell>
                        <TableCell>{r.avgMark}</TableCell>
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

export default ExamType;
