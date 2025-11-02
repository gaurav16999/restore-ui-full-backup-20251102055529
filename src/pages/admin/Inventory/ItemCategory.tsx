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

const ItemCategory = () => {
  const sidebarItems = getAdminSidebarItems("/admin/inventory/item-category");

  return (
    <DashboardLayout title="Item Category List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add Category */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Category</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>CATEGORY NAME *</Label>
                    <Input placeholder="" />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button className="bg-purple-600 text-white">✓ SAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Item Category List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Item Category List</CardTitle>
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
                      <TableHead>SL</TableHead>
                      <TableHead>Category Title</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
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

export default ItemCategory;
