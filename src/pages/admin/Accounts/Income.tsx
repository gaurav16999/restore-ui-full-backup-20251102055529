import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const sampleRows = [
  { si: 1, name: "Fees Collect", method: "Cash", date: "28th Oct, 2025", head: "Fees Collection", amount: 9000 },
  { si: 2, name: "Fund Transfer", method: "Cheque", date: "27th Oct, 2025", head: "-", amount: 5000 },
  { si: 3, name: "Naeem", method: "Cash", date: "21st Oct, 2025", head: "10-Donations/Grant 2", amount: 50000 },
  { si: 4, name: "Fees Collect", method: "Cash", date: "17th Oct, 2025", head: "Fees Collection", amount: 5000 },
  { si: 5, name: "Josefa", method: "Cash", date: "15th Oct, 2025", head: "Fees Collection", amount: 5000 },
];

const formatCurrency = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD" });

const Income = () => {
  const sidebarItems = getAdminSidebarItems("/admin/accounts/income");

  return (
    <DashboardLayout title="Add Income" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left form (1/3) */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Income</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input placeholder="Name" />
                  </div>

                  <div>
                    <Label>A/C Head *</Label>
                    <div className="relative">
                      <Input placeholder="A/C Head *" />
                    </div>
                  </div>

                  <div>
                    <Label>Payment Method *</Label>
                    <Input placeholder="Payment Method *" />
                  </div>

                  <div>
                    <Label>Date</Label>
                    <Input placeholder="10/30/2025" />
                  </div>

                  <div>
                    <Label>Amount ($) *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>File</Label>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <Input placeholder="File" />
                      </div>
                      <div className="ml-3">
                        <Button className="bg-purple-600 text-white">BROWSE</Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">(PDF, DOC, DOCX, JPG, JPEG, PNG are allowed for upload)</p>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea rows={4} />
                  </div>

                  <div className="mt-4">
                    <Button className="bg-purple-600 text-white">✓ SAVE INCOME</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right list (2/3) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Income List</CardTitle>
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-center">
                      <div className="w-1/2">
                        <Input placeholder="QUICK SEARCH" />
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
                      <TableHead>Si</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>A/C Head</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleRows.map((r) => (
                      <TableRow key={r.si}>
                        <TableCell>{r.si}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.method}</TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.head}</TableCell>
                        <TableCell>{formatCurrency(r.amount)}</TableCell>
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

export default Income;
