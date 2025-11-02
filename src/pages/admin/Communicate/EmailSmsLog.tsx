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

const EmailSmsLog = () => {
  const sidebarItems = getAdminSidebarItems("/admin/communicate/email-sms-log");

  return (
    <DashboardLayout title="Email/SMS Log List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <Button className="bg-purple-600 text-white">+ SEND EMAIL/SMS</Button>
          </div>
          <div className="w-1/3">
            <Input placeholder="QUICK SEARCH" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email/SMS Log List</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
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
    </DashboardLayout>
  );
};

export default EmailSmsLog;
