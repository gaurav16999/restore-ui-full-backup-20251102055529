import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { studentApi, classApi } from '@/services/adminApi';

const ClassTests = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const location = useLocation();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [stRes, clsRes]: any = await Promise.all([studentApi.getAll(), classApi.getAll()]);
        const norm = (r: any) => Array.isArray(r) ? r : (r && (r.results ?? r.data)) || [];
        if (!mounted) return;
        setStudents(norm(stRes));
        setClasses(norm(clsRes));
      } catch (err) {
        console.error('Failed to load students/classes', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const p = location.pathname || '';
    if (p.endsWith('/manage-marks')) setActiveTab('manage');
    else if (p.endsWith('/result')) setActiveTab('result');
    else setActiveTab('manage');
  }, [location]);

  const sidebarItems = getAdminSidebarItems('/admin/class-tests');

  return (
    <DashboardLayout
      title="Class Tests"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Class Tests</h1>
            <p className="text-muted-foreground">Manage class-level tests and view results</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="manage">Manage Test Marks</TabsTrigger>
            <TabsTrigger value="result">Test Result</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Test Marks</h2>
              <div className="flex items-center gap-2">
                <Button onClick={() => toast({ title: 'Import', description: 'Import marks (CSV) - to be implemented' })}>Import CSV</Button>
                <Button onClick={() => toast({ title: 'Export', description: 'Export template - to be implemented' })}>Export</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Marks Entry</CardTitle>
                <CardDescription>Enter or update marks for tests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">UI for selecting class/test and entering marks will be implemented here. For now this is a placeholder.</p>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Marks Obtained</TableHead>
                        <TableHead>Max Marks</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>001</TableCell>
                        <TableCell>John Doe</TableCell>
                        <TableCell>--</TableCell>
                        <TableCell>100</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Test Results</h2>
              <div>
                <Button onClick={() => toast({ title: 'Generate', description: 'Generate test results (PDF) - to be implemented' })}>Generate PDF</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>View test results and grades</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Result table and filters will appear here.</p>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>001</TableCell>
                        <TableCell>John Doe</TableCell>
                        <TableCell>85</TableCell>
                        <TableCell>85%</TableCell>
                        <TableCell>A</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClassTests;
