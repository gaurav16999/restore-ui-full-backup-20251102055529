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

const ItemIssue = () => {
  const sidebarItems = getAdminSidebarItems("/admin/inventory/item-issue");
  const today = new Date().toLocaleDateString();

  return (
    <DashboardLayout title="Issue Item List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Issue a Item form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Issue a Item</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>ROLE *</Label>
                    <Input placeholder="User Type *" />
                  </div>

                  <div>
                    <Label>ISSUE DATE</Label>
                    <Input placeholder={today} />
                  </div>

                  <div>
                    <Label>DUE DATE</Label>
                    <Input placeholder={today} />
                  </div>

                  <div>
                    <Label>CATEGORY *</Label>
                    <Input placeholder="Item Category *" />
                  </div>

                  <div>
                    <Label>NAME *</Label>
                    <Input placeholder="Item Name *" />
                  </div>

                  <div>
                    <Label>QUANTITY *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>NOTE</Label>
                    <Textarea rows={5} />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button className="bg-purple-600 text-white">✓ SAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Issued Item List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Issued Item List</CardTitle>
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-center">
                      <div className="w-1/2">
                        <Input placeholder="SEARCH" />
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-2">
                      <Button variant="outline">⎘</Button>
                      <Button variant="outline">📄</Button>
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
                      <TableHead>SL</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Item Category</TableHead>
                      <TableHead>Issue To</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ItemIssue;
