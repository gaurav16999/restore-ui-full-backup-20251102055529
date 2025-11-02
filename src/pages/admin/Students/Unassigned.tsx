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

const UnassignedStudent = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/unassigned");
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    loadUnassignedStudents();
  }, []);

  const loadUnassignedStudents = async () => {
    try {
      const res = await authClient.get('/api/admin/students/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      
      // Filter students without class assignment (empty class_name or null)
      const unassigned = items.filter((s: any) => !s.class_name || s.class_name.trim() === '');
      
      setRows(unassigned.map((s: any) => ({
        id: s.id,
        admissionNo: s.id, // Using ID as admission number
        rollNo: s.roll_no,
        name: s.name,
        fatherName: s.parent_contact || "",
        dob: s.date_of_birth || s.enrollment_date,
        gender: "",
        type: "",
        phone: s.phone || "",
      })));
    } catch (error: any) {
      console.error('Failed to load unassigned students', error);
      toast({
        title: 'Error',
        description: 'Failed to load unassigned students',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Unassigned Student List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-1/3">
                <div className="flex items-center border-b border-gray-200 pb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                  </svg>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="QUICK SEARCH" className="w-full border-0 p-0" />
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Date Of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.admissionNo}</TableCell>
                    <TableCell>{r.rollNo}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.fatherName}</TableCell>
                    <TableCell>{r.dob}</TableCell>
                    <TableCell>{r.gender}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <button className="px-4 py-1 rounded-full border border-purple-600 text-purple-600 hover:bg-purple-50">SELECT ↓</button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {rows.length} of {rows.length} entries</div>

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

export default UnassignedStudent;
