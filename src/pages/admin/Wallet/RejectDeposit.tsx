import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RejectDeposit = () => {
  const sidebarItems = getAdminSidebarItems("/admin/wallet/reject-deposit");

  return (
    <DashboardLayout title="Reject Deposit" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-center">
                  <div className="w-1/3">
                    <Input placeholder=" QUICK SEARCH" />
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
                  <TableHead>Name</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Reject Note</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reject Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">Result</TableCell>
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
    </DashboardLayout>
  );
};

export default RejectDeposit;
