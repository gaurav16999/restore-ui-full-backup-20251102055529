import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const StudentTransportReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/transport");

  const classes = ["Select Class *", "Primary One", "Primary Two"];
  const sections = ["Select Section *", "A", "B"];
  const routes = ["Select Route *", "Route 1", "Route 2"];
  const vehicles = ["Select Vehicle *", "Vehicle 1", "Vehicle 2"];

  return (
    <DashboardLayout title="Student Transport Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
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
                  {routes.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="w-full border rounded px-3 py-2">
                  {vehicles.map((v) => (
                    <option key={v}>{v}</option>
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
            <CardTitle>Student Transport Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <Input placeholder="QUICK SEARCH" />
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
                    <TableHead>Sl</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Father Name</TableHead>
                    <TableHead>Father Phone</TableHead>
                    <TableHead>Route Title</TableHead>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Driver Contact</TableHead>
                    <TableHead>Fare($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
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

export default StudentTransportReport;
