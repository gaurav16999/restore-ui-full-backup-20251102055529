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

const ItemReceive = () => {
  const sidebarItems = getAdminSidebarItems("/admin/inventory/item-receive");
  const today = new Date().toLocaleDateString();

  return (
    <DashboardLayout title="Item Receive" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Receive Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Receive Details</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>EXPENSE HEAD *</Label>
                    <Input placeholder="Expense Head *" />
                  </div>

                  <div>
                    <Label>PAYMENT METHOD *</Label>
                    <Input placeholder="Payment Method*" />
                  </div>

                  <div>
                    <Label>SUPPLIER *</Label>
                    <Input placeholder="Select Supplier *" />
                  </div>

                  <div>
                    <Label>STORE WAREHOUSE *</Label>
                    <Input placeholder="Select Store/Warehouse *" />
                  </div>

                  <div>
                    <Label>REFERENCE NO</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>RECEIVE DATE</Label>
                    <Input placeholder={today} />
                  </div>

                  <div>
                    <Label>DESCRIPTION</Label>
                    <Textarea rows={5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Item Receive */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Item Receive</CardTitle>
                <CardDescription>
                  <div className="flex items-center justify-end">
                    <Button className="bg-purple-600 text-white">+ ADD</Button>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PRODUCT NAME*</TableHead>
                      <TableHead>UNIT PRICE*</TableHead>
                      <TableHead>QUANTITY*</TableHead>
                      <TableHead>SUB TOTAL</TableHead>
                      <TableHead>ACTION</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Input placeholder="Select Item*" />
                      </TableCell>
                      <TableCell>
                        <Input placeholder="" />
                      </TableCell>
                      <TableCell>
                        <Input placeholder="" />
                      </TableCell>
                      <TableCell>
                        <Input placeholder="0.00" />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" className="rounded-full">🗑️</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                  <div></div>
                  <div className="text-right font-semibold">Total</div>
                  <div>
                    <Input placeholder="0.00" />
                  </div>
                </div>

                <div className="mt-6 bg-transparent p-4 border rounded">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="paid" id="fullPaid" />
                        <label htmlFor="fullPaid">Full Paid</label>
                      </div>
                    </div>
                    <div>
                      <Label>TOTAL PAID</Label>
                      <Input placeholder="0" />
                    </div>
                    <div>
                      <Label>TOTAL DUE</Label>
                      <Input placeholder="0.00" />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button className="bg-purple-600 text-white">✓ RECEIVE</Button>
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

export default ItemReceive;
