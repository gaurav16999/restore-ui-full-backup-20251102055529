import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const ItemSell = () => {
  const sidebarItems = getAdminSidebarItems("/admin/inventory/item-sell");

  return (
    <DashboardLayout title="Item Sell List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-medium">Item Sell List</h2>
        <div>
          <Button className="bg-purple-600 text-white">+ NEW ITEM SELL</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Sell List</CardTitle>
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
                <TableHead>Reference No</TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Buyer Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Grand Total</TableHead>
                <TableHead>Total Quantity</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance ($)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
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
    </DashboardLayout>
  );
};

export default ItemSell;
