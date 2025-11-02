import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const WalletReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/fees/wallet");

  const types = ["Select Type*", "Deposit", "Withdraw"];
  const statuses = ["Select Status", "Pending", "Approved", "Rejected"];

  return (
    <DashboardLayout title="Wallet Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div className="lg:col-span-1">
                <Label className="text-xs">DATE RANGE *</Label>
                <Input value={`10/24/2025 - 10/31/2025`} readOnly />
              </div>

              <div>
                <Label className="text-xs">TYPE *</Label>
                <select className="w-full border rounded px-3 py-2">
                  {types.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">STATUS</Label>
                <select className="w-full border rounded px-3 py-2">
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-end">
                <div className="mt-3">
                  <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Search" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">🔁</Button>
                <Button variant="outline">📄</Button>
                <Button variant="outline">🖨️</Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SL</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Apply Date</TableHead>
                    <TableHead>Approve Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
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

export default WalletReport;
