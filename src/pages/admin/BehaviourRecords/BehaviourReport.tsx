import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const BehaviourReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/behaviour-records/behaviour-report");

  const [academicYear, setAcademicYear] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [type, setType] = useState("");
  const [incidents, setIncidents] = useState<Array<any>>([]);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async (filters: any = {}) => {
    try {
      const api = (await import('@/services/adminApi')).studentIncidentApi;
      const data = await api.getAll(filters);
      const list = Array.isArray(data) ? data : (data as any)?.results || [];
      setIncidents(list);
    } catch (err) {
      console.error('Failed to load incidents', err);
    }
  };

  const doSearch = () => {
    const params: any = {};
    if (className) params.class_name = className;
    if (section) params.section = section;
    loadIncidents(params);
  };

  const handleSearch = () => {
    console.log("behaviour report search", { academicYear, className, section, type });
  };

  return (
    <DashboardLayout title="Student Behaviour Rank Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
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
                    <SelectItem value="primary-1">Primary One</SelectItem>
                    <SelectItem value="primary-2">Primary Two</SelectItem>
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
                    <SelectItem value="b">B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">TYPE</label>
                <Select onValueChange={(v) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select Type</SelectItem>
                    <SelectItem value="rank">Rank</SelectItem>
                    <SelectItem value="points">Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={doSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Behaviour Rank List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">🔍 SEARCH</div>
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
                  <TableHead>Rank</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class(Section)</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Points</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  // Aggregate points by student and sort
                  Object.entries(incidents.reduce((acc: any, it: any) => {
                    acc[it.student] = (acc[it.student] || 0) + (it.points || 0);
                    return acc;
                  }, {})).sort((a: any, b: any) => b[1] - a[1]).map(([studentId, totalPoints], idx) => (
                    <TableRow key={studentId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{studentId}</TableCell>
                      <TableCell>{/* Student name not available in payload */}</TableCell>
                      <TableCell>{/* class(section) */}</TableCell>
                      <TableCell>{/* gender */}</TableCell>
                      <TableCell>{/* phone */}</TableCell>
                      <TableCell>{String(totalPoints)}</TableCell>
                      <TableCell>
                        <Button variant="outline" className="rounded-full">View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default BehaviourReport;
