import { useEffect, useState } from "react";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Syllabus = () => {
  const sidebarItems = getAdminSidebarItems("/admin/study-material/syllabus");
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authClient.get('/api/admin/announcements/', { params: { search: 'syllabus' } });
        const items = Array.isArray(res.data) ? res.data : res.data.results || [];
        setRows(items.map((a: any) => ({
          id: a.id,
          title: a.title,
          type: a.announcement_type || 'general',
          date: a.publish_date || a.created_at,
          availableFor: a.target_audience,
          classSection: a.target_class_name || '',
          raw: a
        })));
      } catch (error: any) {
        console.error('Failed to load syllabus', error);
        toast({ title: 'Error', description: 'Failed to load syllabus', variant: 'destructive' });
      }
    };

    load();
  }, [search]);

  return (
    <DashboardLayout title="Syllabus List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Syllabus List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center border-b border-gray-200 pb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                  </svg>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="QUICK SEARCH" className="w-full border-0 p-0" />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                <button className="text-gray-500">📎</button>
                <button className="text-gray-500">🖨️</button>
                <button className="text-gray-500">📄</button>
                <button className="text-gray-500">▢</button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Available For</TableHead>
                  <TableHead>Class (Section)</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.availableFor}</TableCell>
                    <TableCell>{r.classSection}</TableCell>
                    <TableCell>
                      <button className="rounded-full border px-3 py-1 text-sm text-purple-600">SELECT</button>
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

export default Syllabus;
