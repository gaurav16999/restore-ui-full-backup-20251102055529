import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import authClient from "@/lib/http";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UploadContent = () => {
  const sidebarItems = getAdminSidebarItems("/admin/study-material/upload-content");

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [availableFor, setAvailableFor] = useState("all");
  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");
  const [date, setDate] = useState(() => new Date().toLocaleDateString());
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [rows, setRows] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [annRes, classesRes] = await Promise.all([
          authClient.get('/api/admin/announcements/'),
          authClient.get('/api/admin/classes/')
        ]);

        const announcements = Array.isArray(annRes.data) ? annRes.data : annRes.data.results || [];
        setRows(announcements.map((a: any, idx: number) => ({
          id: a.id || idx + 1,
          title: a.title,
          type: a.announcement_type || 'general',
          date: a.publish_date || a.created_at,
          availableFor: a.target_audience,
          classSection: a.target_class_name || '',
          raw: a
        })));

        const classesList = Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.results || [];
        setClasses(classesList);
      } catch (error: any) {
        console.error('Failed loading announcements/classes', error);
        toast({ title: 'Error', description: 'Failed to load content', variant: 'destructive' });
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) return;

    // NOTE: backend Announcement expects attachment_url (string). File upload
    // endpoint isn't implemented here, so prefer providing a Source URL.
    if (file && !sourceUrl) {
      toast({ title: 'Info', description: 'File uploads are not supported via this UI. Please provide a Source URL or leave file empty.', variant: 'destructive' });
      return;
    }

    const payload: any = {
      title: title.trim(),
      content: description,
      announcement_type: 'general',
      target_audience: availableFor,
      target_class: classVal || null,
      attachment_url: sourceUrl || ''
    };

    try {
      const res = await authClient.post('/api/admin/announcements/', payload);
      const created = res.data;
      const next = {
        id: created.id,
        title: created.title,
        type: created.announcement_type || 'general',
        date: created.publish_date || created.created_at,
        availableFor: created.target_audience,
        classSection: created.target_class_name || '',
        raw: created
      };

      setRows((s) => [next, ...s]);
      toast({ title: 'Success', description: 'Content uploaded' });

      // clear form
      setTitle("");
      setType("");
      setAvailableFor("all");
      setClassVal("");
      setSection("");
      setDescription("");
      setSourceUrl("");
      setFile(null);
    } catch (error: any) {
      console.error('failed create announcement', error);
      toast({ title: 'Error', description: error?.response?.data?.detail || 'Failed to upload content', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Upload Content List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Content Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div>
                  <Label>Content Type *</Label>
                  <Select onValueChange={(v) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Content Type *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="syllabus">Syllabus</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Available For *</Label>
                  <div className="mt-2 space-y-1">
                    <label className="flex items-center gap-2"><input type="radio" checked={availableFor==="all"} onChange={() => setAvailableFor("all")} /> <span>All Admin</span></label>
                    <label className="flex items-center gap-2"><input type="radio" checked={availableFor==="student"} onChange={() => setAvailableFor("student")} /> <span>Student</span></label>
                    <label className="flex items-center gap-2 text-gray-400"><input type="radio" disabled /> <span>Available for all classes</span></label>
                  </div>
                </div>

                <div>
                  <Label>Class</Label>
                  <Select onValueChange={(v) => setClassVal(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topclass">TOP CLASS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Section</Label>
                  <Select onValueChange={(v) => setSection(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date</Label>
                  <Input value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded p-2" />
                </div>

                <div>
                  <Label>Source URL</Label>
                  <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
                </div>

                <div>
                  <Label>File</Label>
                  <div className="flex items-center gap-2">
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">(jpg,png,jpeg,pdf,doc,docx,mp4,mp3,txt are allowed for upload)</div>
                </div>

                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Content List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <input placeholder="QUICK SEARCH" className="w-full border-0 p-0" />
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
                    <TableHead>SL</TableHead>
                    <TableHead>Content Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Available For</TableHead>
                    <TableHead>Class(Section)</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.availableFor}</TableCell>
                      <TableCell>{r.classSection}</TableCell>
                      <TableCell><Button variant="outline" size="sm">SELECT</Button></TableCell>
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
      </div>
    </DashboardLayout>
  );
};

export default UploadContent;
