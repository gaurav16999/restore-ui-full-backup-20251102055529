import { useState, useEffect } from "react";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TopicOverview = () => {
  const sidebarItems = getAdminSidebarItems("/admin/lesson-plan/topic-overview");

  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<any[]>([]); // empty by default as screenshot shows no data
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [classesRes, subjectsRes] = await Promise.all([
          authClient.get('/api/admin/classes/'),
          authClient.get('/api/admin/subjects/')
        ]);
        setClassesList(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.results || []);
        setSubjectsList(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.results || []);
      } catch (error: any) {
        console.error('Failed to load topic overview lists', error);
        toast({ title: 'Error', description: 'Failed to load lists', variant: 'destructive' });
      }
    };
    load();
  }, []);

  const handleSearch = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      // If subject selected, try to fetch topics related to lessons of that subject
      if (subject) params.search = subject;
      const res = await authClient.get('/api/admin/topics/', { params });
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRows(items.map((a: any) => ({
        id: a.id,
        lesson: a.lesson?.title || '',
        topic: a.title,
        completedDate: '',
        teacher: a.created_by_name || '',
        status: ''
      })));
    } catch (error: any) {
      console.error('Failed to fetch topics', error);
      toast({ title: 'Error', description: 'Failed to fetch topics', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Topic Overview" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Topic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS</label>
                <Select onValueChange={(v) => setClassVal(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select Class</SelectItem>
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
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end justify-end">
                <div className="w-full">
                  <label className="text-sm text-muted-foreground block mb-1">SUBJECT</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select onValueChange={(v) => setSubject(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subjects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="placeholder" disabled>Select Subject</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-1/2">
                <div className="flex items-center border-b border-gray-200 pb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                  </svg>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" className="w-full border-0 p-0" />
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
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
                  <TableHead>Lesson</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, idx) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.lesson}</TableCell>
                      <TableCell>{r.topic}</TableCell>
                      <TableCell>{r.completedDate}</TableCell>
                      <TableCell>{r.teacher}</TableCell>
                      <TableCell>{r.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to {rows.length} of {rows.length} entries</div>

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

export default TopicOverview;
