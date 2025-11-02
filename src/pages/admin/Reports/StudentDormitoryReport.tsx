import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const StudentDormitoryReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/dormitory");

  const classes = ["Select Class", "Primary One", "Primary Two"];
  const sections = ["Select Section", "A", "B"];
  const dormitories = ["Select Dormitory", "Dorm A", "Dorm B"];

  return (
    <DashboardLayout title="Student Dormitory Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <select className="w-full border rounded px-3 py-2">
                  {classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="w-full border rounded px-3 py-2">
                  {sections.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="w-full border rounded px-3 py-2">
                  {dormitories.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Dormitory Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <Input placeholder="SEARCH" />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">⎘</Button>
                <Button variant="outline">⎙</Button>
                <Button variant="outline">▣</Button>
                <Button variant="outline">🖨️</Button>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class (Section)</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Guardians Phone</TableHead>
                    <TableHead>Dormitory Name</TableHead>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Cost Per Bed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>

            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <Button variant="ghost" className="rounded-full">←</Button>
                <Button variant="ghost" className="rounded-full">→</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDormitoryReport;
