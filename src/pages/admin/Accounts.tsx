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
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faPlus, faFileInvoiceDollar, faWallet } from "@fortawesome/free-solid-svg-icons";

const Accounts = () => {
  const location = useLocation();
  const [sidebarItems] = useState(() => getAdminSidebarItems("/admin/accounts"));

  // decide default tab based on current path (allow sidebar submenu links to work)
  const path = location.pathname || '';
  let defaultTab = 'chart';
  if (path.endsWith('/add-income')) defaultTab = 'income';
  else if (path.endsWith('/add-expense')) defaultTab = 'expense';
  else if (path.endsWith('/statement')) defaultTab = 'statement';
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const api = (await import('@/services/adminApi')).chartOfAccountApi;
        const data = await api.getAll();
        setAccounts(data || []);
      } catch (err) {
        console.error('load chart of accounts', err);
        toast?.({ title: 'Error', description: 'Unable to load chart of accounts', variant: 'destructive' });
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout
      title="Accounts"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Accounts</h2>
            <p className="text-muted-foreground">Manage chart of accounts, incomes and expenses</p>
          </div>
          <div className="flex gap-3">
            <Button>
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Entry
            </Button>
          </div>
        </div>

        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Chart Of Account</TabsTrigger>
            <TabsTrigger value="income">Add Income</TabsTrigger>
            <TabsTrigger value="expense">Add Expense</TabsTrigger>
            <TabsTrigger value="statement">Account Statement</TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Chart Of Accounts</CardTitle>
                <CardDescription>List of ledger accounts used by the school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Search</Label>
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts" />
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                      <TableBody>
                        {accounts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">No accounts found</TableCell>
                          </TableRow>
                        )}
                        {accounts.map((a, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{a.code}</TableCell>
                            <TableCell>{a.name}</TableCell>
                            <TableCell>{a.account_type}</TableCell>
                            <TableCell>{a.balance}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Add Income</CardTitle>
                <CardDescription>Record other income entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Account</Label>
                    <Input placeholder="Select account" />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input type="number" placeholder="Amount" />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button>Record Income</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expense">
            <Card>
              <CardHeader>
                <CardTitle>Add Expense</CardTitle>
                <CardDescription>Record expenses and link to accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Account</Label>
                    <Input placeholder="Select account" />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input type="number" placeholder="Amount" />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="destructive">Record Expense</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statement">
            <Card>
              <CardHeader>
                <CardTitle>Account Statement</CardTitle>
                <CardDescription>View transaction statements for accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input placeholder="Account" />
                  <Input type="date" />
                  <Input type="date" />
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-muted-foreground">Statement preview will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Accounts;
