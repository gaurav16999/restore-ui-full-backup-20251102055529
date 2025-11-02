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

const BankAccount = () => {
  const sidebarItems = getAdminSidebarItems("/admin/accounts/bank-account");

  const rows: Array<any> = []; // intentionally empty to match screenshot

  const formatCurrency = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <DashboardLayout title="Bank Account" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left form (1/3) */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Bank Account</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Bank Name *</Label>
                    <Input placeholder="Bank Name" />
                  </div>

                  <div>
                    <Label>Account Name *</Label>
                    <Input placeholder="Account Name" />
                  </div>

                  <div>
                    <Label>Account Number *</Label>
                    <Input placeholder="Account Number" />
                  </div>

                  <div>
                    <Label>Account Type</Label>
                    <Input placeholder="Account Type" />
                  </div>

                  <div>
                    <Label>Opening Balance *</Label>
                    <Input placeholder="Opening Balance" />
                  </div>

                  <div>
                    <Label>Note</Label>
                    <Textarea rows={4} />
                  </div>

                  <div className="mt-4">
                    <Button className="bg-purple-600 text-white">✓ SAVE ACCOUNT</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right list (2/3) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Bank Account List</CardTitle>
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
                      <TableHead>Bank Name</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Opening Balance</TableHead>
                      <TableHead>Current Balance</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.bankName}</TableCell>
                          <TableCell>{r.accountName}</TableCell>
                          <TableCell>{formatCurrency(r.opening)}</TableCell>
                          <TableCell>{formatCurrency(r.current)}</TableCell>
                          <TableCell>{r.note}</TableCell>
                          <TableCell>
                            <Button variant="ghost" className="rounded-full border border-purple-500 text-purple-600">SELECT ▾</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>

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

export default BankAccount;
