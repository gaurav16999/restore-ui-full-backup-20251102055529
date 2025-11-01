import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const DeleteStudent = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/delete");
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (query) {
      const filtered = rows.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.rollNo.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRows(filtered);
    } else {
      setFilteredRows(rows);
    }
  }, [query, rows]);

  const loadStudents = async () => {
    try {
      const res = await authClient.get('/api/admin/students/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRows(items.map((s: any) => ({
        id: s.id,
        admissionNo: s.id,
        rollNo: s.roll_no,
        name: s.name,
        classSection: s.class_name,
        fatherName: s.parent_contact || "",
        dob: s.date_of_birth || s.enrollment_date,
        phone: s.phone || "",
      })));
    } catch (error: any) {
      console.error('Failed to load students', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }
    try {
      await authClient.delete(`/api/admin/students/${id}/`);
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
      loadStudents();
    } catch (error: any) {
      console.error('Failed to delete student', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Delete Student Record" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delete Student Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-1/3">
                <div className="flex items-center border-b border-gray-200 pb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                  </svg>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="SEARCH" className="w-full border-0 p-0" />
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class (Section)</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Date Of Birth</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.admissionNo}</TableCell>
                      <TableCell>{r.rollNo}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.classSection}</TableCell>
                      <TableCell>{r.fatherName}</TableCell>
                      <TableCell>{r.dob}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="px-4 py-1 rounded-full border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(r.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredRows.length > 0 ? 1 : 0} to {filteredRows.length} of {filteredRows.length} entries
            </div>

            <div className="flex justify-center mt-6">
              <div className="inline-flex items-center gap-4">
                <button className="text-gray-400">‹</button>
                <div className="bg-purple-600 text-white rounded-md p-2 shadow">1</div>
                <button className="text-gray-400">›</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DeleteStudent;
