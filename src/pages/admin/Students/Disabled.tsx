import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

const DisabledStudents = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/disabled");
  const { toast } = useToast();

  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchAdmission, setSearchAdmission] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
    loadDisabledStudents();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await authClient.get('/api/admin/classes/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setClasses(items);
    } catch (error: any) {
      console.error('Failed to load classes', error);
      toast({
        title: 'Error',
        description: 'Failed to load classes',
        variant: 'destructive',
      });
    }
  };

  const loadDisabledStudents = async () => {
    try {
      const res = await authClient.get('/api/admin/students/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      // Filter inactive students
      const disabled = items.filter((s: any) => s.status === 'Inactive');
      setRows(disabled.map((s: any) => ({
        id: s.id,
        admissionNo: s.id,
        rollNo: s.roll_no,
        name: s.name,
        classSection: s.class_name,
        fatherName: s.parent_contact || "",
        dob: s.date_of_birth || s.enrollment_date,
        gender: "",
        type: "",
        phone: s.phone || "",
      })));
    } catch (error: any) {
      console.error('Failed to load disabled students', error);
      toast({
        title: 'Error',
        description: 'Failed to load disabled students',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async () => {
    try {
      const params: any = {};
      if (className) params.class_name = className;
      if (searchName) params.search = searchName;
      
      const res = await authClient.get('/api/admin/students/', { params });
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      const disabled = items.filter((s: any) => s.status === 'Inactive');
      
      setRows(disabled.map((s: any) => ({
        id: s.id,
        admissionNo: s.id,
        rollNo: s.roll_no,
        name: s.name,
        classSection: s.class_name,
        fatherName: s.parent_contact || "",
        dob: s.date_of_birth || s.enrollment_date,
        gender: "",
        type: "",
        phone: s.phone || "",
      })));
      
      toast({
        title: 'Success',
        description: `Found ${disabled.length} disabled students`,
      });
    } catch (error: any) {
      console.error('Failed to search', error);
      toast({
        title: 'Error',
        description: 'Failed to search students',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Disabled Students" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS *</label>
                <Select onValueChange={(v) => setClassName(v)} value={className}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class *" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION</label>
                <Select onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select Section</SelectItem>
                    <SelectItem value="a">A</SelectItem>
                    <SelectItem value="b">B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SEARCH BY NAME</label>
                <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SEARCH BY ADMISSION NO</label>
                <Input value={searchAdmission} onChange={(e) => setSearchAdmission(e.target.value)} placeholder="" />
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disabled Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">🔍 QUICK SEARCH</div>
              <div className="flex space-x-2">
                <Button variant="ghost" className="border rounded-full">📄</Button>
                <Button variant="ghost" className="border rounded-full">📥</Button>
                <Button variant="ghost" className="border rounded-full">📤</Button>
                <Button variant="ghost" className="border rounded-full">🖨️</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Date Of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.admissionNo}</TableCell>
                      <TableCell>{r.rollNo}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.classSection}</TableCell>
                      <TableCell>{r.fatherName}</TableCell>
                      <TableCell>{r.dob}</TableCell>
                      <TableCell>{r.gender}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell>
                        <Button variant="outline" className="rounded-full">Enable</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="text-sm text-muted-foreground mt-4">
              Showing {rows.length > 0 ? 1 : 0} to {rows.length} of {rows.length} entries
            </div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default DisabledStudents;
