import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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

const PendingReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/teacher-evaluation/pending-report");

  const [klass, setKlass] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const [teacher, setTeacher] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");

  const handleSearch = () => {
    console.log('search pending evaluation', { klass, subject, section, teacher, submittedBy });
  };

  const rows: any[] = [];

  return (
    <DashboardLayout title="Teacher Pending Evaluation Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teacher Pending Evaluation Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">CLASS *</label>
                <Select value={klass} onValueChange={v => setKlass(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one">Class 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">SUBJECT</label>
                <Select value={subject} onValueChange={v => setSubject(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Math</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">SECTION</label>
                <Select value={section} onValueChange={v => setSection(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">TEACHER</label>
                <Select value={teacher} onValueChange={v => setTeacher(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t1">Teacher 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">SUBMITTED BY</label>
                <Select value={submittedBy} onValueChange={v => setSubmittedBy(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Submitted By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hod">HOD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-12 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="text-sm text-muted-foreground">🔍 SEARCH</div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff id</TableHead>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Class(Section)</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : rows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.submittedBy}</TableCell>
                    <TableCell>{r.classSection}</TableCell>
                    <TableCell>{r.rating}</TableCell>
                    <TableCell>{r.comment}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>
                      <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to {rows.length} of {rows.length} entries</div>
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
    </DashboardLayout>
  );
};

export default PendingReport;
