import { useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyCheckAlt, faFileInvoice, faFileAlt, faChartPie, faPlus } from "@fortawesome/free-solid-svg-icons";

const Salary = () => {
  const location = useLocation();
  const sidebarItems = getAdminSidebarItems("/admin/salary");

  // choose default tab based on path
  const path = location.pathname || "";
  let defaultTab = 'pay';
  if (path.endsWith('/paid-slip')) defaultTab = 'paid';
  else if (path.endsWith('/sheet')) defaultTab = 'sheet';
  else if (path.endsWith('/report')) defaultTab = 'report';

  const [search, setSearch] = useState('');

  return (
    <DashboardLayout
      title="Salary"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Salary Management</h2>
            <p className="text-muted-foreground">Pay salaries and manage payroll reports</p>
          </div>
          <div className="flex gap-3">
            <Button>
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Payment
            </Button>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pay">Pay Salary</TabsTrigger>
            <TabsTrigger value="paid">Salary Paid Slip</TabsTrigger>
            <TabsTrigger value="sheet">Salary Sheet</TabsTrigger>
            <TabsTrigger value="report">Salary Report</TabsTrigger>
          </TabsList>

          <TabsContent value="pay">
            <Card>
              <CardHeader>
                <CardTitle>Pay Salary</CardTitle>
                <CardDescription>Record salary payments for employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input placeholder="Search employee" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Input placeholder="Month" type="month" />
                  <Input placeholder="Amount" type="number" />
                </div>
                <div className="flex justify-end">
                  <Button>
                    <FontAwesomeIcon icon={faMoneyCheckAlt} className="mr-2" /> Pay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid">
            <Card>
              <CardHeader>
                <CardTitle>Salary Paid Slip</CardTitle>
                <CardDescription>View and print salary slips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border p-4">
                  <p className="text-muted-foreground">Search and select a payment to view the slip.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sheet">
            <Card>
              <CardHeader>
                <CardTitle>Salary Sheet</CardTitle>
                <CardDescription>Generate monthly salary sheets for payroll</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="month" />
                  <Button>Generate Sheet</Button>
                </div>
                <div className="mt-4 rounded-md border p-4">
                  <p className="text-muted-foreground">Generated sheets will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Salary Report</CardTitle>
                <CardDescription>Export salary reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input placeholder="From date" type="date" />
                  <Input placeholder="To date" type="date" />
                  <Input placeholder="Department / All" />
                </div>
                <div className="flex justify-end">
                  <Button>
                    <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Salary;
