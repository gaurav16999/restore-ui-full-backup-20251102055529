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

const ProfitLoss = () => {
  const sidebarItems = getAdminSidebarItems("/admin/accounts/profit-loss");

  const rows = [
    { time: "All", income: 69000, expense: 0 },
  ];

  const formatCurrency = (v: number) => {
    return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  return (
    <DashboardLayout title="Profit & Loss" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Select Criteria Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
            <CardDescription>
              <div className="flex flex-col items-center">
                <div className="w-full md:w-1/3">
                  <Input placeholder="10/23/2025 - 10/30/2025" />
                </div>

                <div className="mt-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-center">
                  <div className="w-1/3">
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
                  <TableHead>Time</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Expense</TableHead>
                  <TableHead>Profit/Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.time}</TableCell>
                    <TableCell>{formatCurrency(r.income)}</TableCell>
                    <TableCell>{formatCurrency(r.expense)}</TableCell>
                    <TableCell>{formatCurrency(r.income - r.expense)}</TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 1 to 1 of 1 entries</div>

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
    </DashboardLayout>
  );
};

export default ProfitLoss;
