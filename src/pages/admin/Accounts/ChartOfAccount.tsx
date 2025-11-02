import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const sampleRows = [
  { name: "09-Donations/Grant 1", type: "Income" },
  { name: "10-Donations/Grant 2", type: "Income" },
  { name: "Books Fees", type: "Income" },
  { name: "Fees Collection", type: "Income" },
  { name: "Tuition fee", type: "Income" },
];

const ChartOfAccount = () => {
  const sidebarItems = getAdminSidebarItems("/admin/accounts/chart-of-account");

  return (
    <DashboardLayout title="Chart Of Account" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left form (1/3) */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Chart Of Account</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Head *</Label>
                    <Input placeholder="Head" />
                  </div>
                  <div>
                    <Label>Type *</Label>
                    <Input placeholder="Type *" />
                  </div>
                  <div className="mt-4">
                    <Button className="bg-purple-600 text-white">✓ SAVE HEAD</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right list (2/3) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chart Of Account List</CardTitle>
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-center">
                      <div className="w-1/2">
                        <Input placeholder="SEARCH" />
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-2">
                      <Button variant="outline">⎘</Button>
                      <Button variant="outline">⎙</Button>
                      <Button variant="outline">▣</Button>
                      <Button variant="outline">🖨️</Button>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleRows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.type}</TableCell>
                        <TableCell>
                          <Button variant="ghost" className="rounded-full border border-purple-500 text-purple-600">SELECT ▾</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 1 to 5 of 5 entries</div>

                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center space-x-2">
                    <Button variant="ghost" className="rounded-full">←</Button>
                    <Button className="bg-purple-600 text-white shadow-lg rounded">1</Button>
                    <Button variant="ghost" className="rounded-full">→</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChartOfAccount;
