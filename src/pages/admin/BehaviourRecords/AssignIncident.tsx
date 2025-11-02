import { useEffect, useState } from "react";
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

const AssignIncident = () => {
  const sidebarItems = getAdminSidebarItems("/admin/behaviour-records/assign-incident");

  const [academicYear, setAcademicYear] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [students, setStudents] = useState<Array<any>>([]);
  const [incidentTypes, setIncidentTypes] = useState<Array<any>>([]);

  const handleSearch = () => {
    console.log("assign incident search", { academicYear, className, section, searchName, searchRoll });
  };

  useEffect(() => {
    loadIncidentTypes();
  }, []);

  const loadIncidentTypes = async () => {
    try {
      const data = await (await import('@/services/adminApi')).incidentTypeApi.getAll();
      const list = Array.isArray(data) ? data : (data as any)?.results || [];
      setIncidentTypes(list);
    } catch (err) {
      console.error('Failed to load incident types', err);
    }
  };

  const performSearch = async () => {
    try {
      const api = (await import('@/services/adminApi')).studentApi;
      const params: any = {};
      if (className) params.class_name = className;
      if (searchName) params.search = searchName;
      if (searchRoll) params.roll_no = searchRoll;
      const data = await api.getAll(params);
      const list = Array.isArray(data) ? data : (data as any)?.results || [];
      setStudents(list);
    } catch (err) {
      console.error('Failed to load students', err);
    }
  };

  const handleAssign = async (student: any) => {
    if (!incidentTypes.length) {
      alert('No incident types available. Please create one first.');
      return;
    }
    const selection = window.prompt(`Enter incident ID to assign to ${student.user?.first_name || student.name}\nAvailable:\n` +
      incidentTypes.map((it: any) => `${it.id}: ${it.title} (${it.point})`).join('\n')
    );
    if (!selection) return;
    const incidentId = parseInt(selection, 10);
    const chosen = incidentTypes.find((it: any) => it.id === incidentId);
    if (!chosen) {
      alert('Invalid incident id');
      return;
    }
    const date = new Date().toISOString().slice(0,10);
    const notes = window.prompt('Notes (optional)') || '';
    try {
      const api = (await import('@/services/adminApi')).studentIncidentApi;
      await api.create({ student: student.id, incident_type: incidentId, date, points: chosen.point, notes });
      alert('Assigned');
    } catch (err) {
      console.error('Failed to assign incident', err);
      alert('Failed to assign incident');
    }
  };

  const sample = {
    admission: "1",
    name: "NANKYA HAMDIYA",
    class: "PRIMARY THREE(A)",
    gender: "Male",
    phone: "",
    totalPoints: 0,
    totalIncidents: 0,
  };

  return (
    <DashboardLayout title="Assign Incident" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">ACADEMIC YEAR *</label>
                <Select onValueChange={(v) => setAcademicYear(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="2025[2025]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>2025[2025]</SelectItem>
                    <SelectItem value="2024">2024[2025]</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS</label>
                <Select onValueChange={(v) => setClassName(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select Class</SelectItem>
                    <SelectItem value="primary-3">Primary Three</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION</label>
                <Select onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select Section</SelectItem>
                    <SelectItem value="a">A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SEARCH BY NAME</label>
                <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Name" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SEARCH BY ROLL</label>
                <Input value={searchRoll} onChange={(e) => setSearchRoll(e.target.value)} placeholder="Roll" />
              </div>

              <div className="lg:col-span-5 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Incident List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">🔍 QUICK SEARCH</div>
              <div className="flex space-x-2">
                <Button variant="ghost" className="border rounded-full">📄</Button>
                <Button variant="ghost" className="border rounded-full">📥</Button>
                <Button variant="ghost" className="border rounded-full">🖨️</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Points</TableHead>
                  <TableHead>Total Incidents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{sample.admission}</TableCell>
                  <TableCell>{sample.name}</TableCell>
                  <TableCell>{sample.class}</TableCell>
                  <TableCell>{sample.gender}</TableCell>
                  <TableCell>{sample.phone}</TableCell>
                  <TableCell>{sample.totalPoints}</TableCell>
                  <TableCell>{sample.totalIncidents}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 1 to 1 of 1 entries</div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default AssignIncident;
