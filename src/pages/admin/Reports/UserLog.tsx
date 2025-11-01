import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const sampleRows = [
  { user: "admin", role: "Super admin", ip: "2400:1a00:3b4c:cfff:24bd:a5fa:c16d:84fa", time: "Thu, Oct 30, 2025 9:56 PM", agent: "Chrome, Windows" },
  { user: "William Zaif", role: "Admin", ip: "2001:1a10:180a:d400:ed7d:f2cc:c364:db35", time: "Thu, Oct 30, 2025 9:53 PM", agent: "Chrome, Windows" },
  { user: "admin", role: "Super admin", ip: "110.54.209.174", time: "Thu, Oct 30, 2025 9:48 PM", agent: "Chrome, AndroidOS" },
  { user: "admin", role: "Super admin", ip: "41.223.109.56", time: "Thu, Oct 30, 2025 9:15 PM", agent: "Edge, Windows" },
  { user: "admin", role: "Super admin", ip: "186.179.192.14", time: "Thu, Oct 30, 2025 8:14 PM", agent: "Chrome, OS X" },
  { user: "admin", role: "Super admin", ip: "182.60.74.82", time: "Thu, Oct 30, 2025 7:58 PM", agent: "Chrome, Windows" },
  { user: "William Zaif", role: "Admin", ip: "185.146.113.27", time: "Thu, Oct 30, 2025 7:25 PM", agent: "Safari, OS X" },
  { user: "admin", role: "Super admin", ip: "210.18.155.24", time: "Tue, Oct 28, 2025 5:58 PM", agent: "Chrome, Windows" },
];

const UserLog: React.FC = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/user-log");

  return (
    <DashboardLayout title="User Log" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Log Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">&nbsp;</div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">🔍 QUICK SEARCH</div>
                <Input placeholder="Search" className="w-64" />
                <div className="ml-4">
                  <div className="inline-flex items-center space-x-2 border rounded-full px-2 py-1">
                    <button className="px-2">📥</button>
                    <button className="px-2">📄</button>
                    <button className="px-2">🗂️</button>
                    <button className="px-2">🖨️</button>
                    <button className="px-2">▢</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleRows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.user}</TableCell>
                      <TableCell>{r.role}</TableCell>
                      <TableCell>{r.ip}</TableCell>
                      <TableCell>{r.time}</TableCell>
                      <TableCell>{r.agent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-gray-500">Showing 1 to {sampleRows.length} of {sampleRows.length} entries</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserLog;
