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
  { purpose: 'van 1 repairing', amount: 5000, from: 'Cash', to: 'Cheque' }
];

const formatCurrency = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const FundTransfer = () => {
  const sidebarItems = getAdminSidebarItems('/admin/accounts/fund-transfer');

  return (
    <DashboardLayout title="Fund Transfer" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Add Information */}
                <div>
                  <h3 className="mb-4 text-lg font-medium">Add Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>AMOUNT *</Label>
                      <Input placeholder="" />
                    </div>
                    <div>
                      <Label>PURPOSE *</Label>
                      <Input placeholder="" />
                    </div>
                    <div className="mt-4">
                      <Button className="bg-purple-600 text-white">✓ FUND TRANSFER</Button>
                    </div>
                  </div>
                </div>

                {/* Middle: From list */}
                <div>
                  <h3 className="mb-4 text-lg font-medium">From</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3"><input type="radio" name="from" /> <span>Cash (64000)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="from" /> <span>Cheque (5000)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="from" /> <span>Bank (0)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="from" /> <span>PayPal (0)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="from" /> <span>Stripe (0)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="from" /> <span>Paystack (0)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="from" /> <span>Wallet (0)</span></label>
                  </div>
                </div>

                {/* Right: To list */}
                <div>
                  <h3 className="mb-4 text-lg font-medium">To</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3"><input type="radio" name="to" /> <span>Cash (64000)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="to" /> <span>Cheque (5000)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="to" /> <span>Bank (0)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="to" /> <span>PayPal (0)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="to" /> <span>Stripe (0)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="to" /> <span>Paystack (0)</span></label>
                    <label className="flex items-center space-x-3"><input type="radio" name="to" /> <span>Wallet (0)</span></label>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amount Transfer List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PURPOSE</TableHead>
                  <TableHead>AMOUNT</TableHead>
                  <TableHead>FROM</TableHead>
                  <TableHead>TO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleRows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.purpose}</TableCell>
                    <TableCell>{r.amount}</TableCell>
                    <TableCell>{r.from}</TableCell>
                    <TableCell>{r.to}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>{formatCurrency(sampleRows.reduce((s, r) => s + r.amount, 0))}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FundTransfer;
