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

const Supplier = () => {
  const sidebarItems = getAdminSidebarItems("/admin/inventory/supplier");

  return (
    <DashboardLayout title="Supplier List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add Supplier */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Supplier</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>Company Address *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>CONTACT PERSON NAME *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>CONTACT PERSON MOBILE *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>CONTACT PERSON EMAIL *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>DESCRIPTION</Label>
                    <Textarea rows={4} />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button className="bg-purple-600 text-white">✓ SAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Supplier List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Supplier List</CardTitle>
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
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Company Address</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
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

export default Supplier;
