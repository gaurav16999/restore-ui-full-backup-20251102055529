import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExport, faFilePdf, faPrint } from "@fortawesome/free-solid-svg-icons";

const PayrollReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/staff/payroll");

  const roles = ["Accountant", "Teacher", "Admin"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["2025", "2024", "2023"];

  return (
    <DashboardLayout title="Payroll Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              <div>
                <Label className="text-xs">ROLE</Label>
                <select className="w-full border rounded px-3 py-2">
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">SELECT MONTH</Label>
                <select className="w-full border rounded px-3 py-2">
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-full">
                  <Label className="text-xs">SELECT YEAR</Label>
                  <select className="w-full border rounded px-3 py-2">
                    {years.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-3">
                  <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  <Input placeholder="Search" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><FontAwesomeIcon icon={faFileExport} /></Button>
                <Button variant="outline"><FontAwesomeIcon icon={faFilePdf} /></Button>
                <Button variant="outline"><FontAwesomeIcon icon={faPrint} /></Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Month - Year</TableHead>
                    <TableHead>Payslip #</TableHead>
                    <TableHead>Basic Salary($)</TableHead>
                    <TableHead>Earnings($)</TableHead>
                    <TableHead>Deductions($)</TableHead>
                    <TableHead>Leave Deductions($)</TableHead>
                    <TableHead>Gross Salary($)</TableHead>
                    <TableHead>Tax($)</TableHead>
                    <TableHead>Net Salary($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={12} className="bg-gray-50 text-center">Grand Total</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <Button variant="ghost">←</Button>
              <Button variant="ghost">→</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PayrollReport;
