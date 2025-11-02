import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Certificate = () => {
  const sidebarItems = getAdminSidebarItems("/admin/admin-section/certificate");

  const [name, setName] = useState("");
  const [headerLeft, setHeaderLeft] = useState("");
  const [date, setDate] = useState(() => new Date().toLocaleDateString());
  const [body, setBody] = useState("");
  const [bodyFont, setBodyFont] = useState("");
  const [fontSize, setFontSize] = useState("");
  const [footerLeft, setFooterLeft] = useState("");
  const [footerCenter, setFooterCenter] = useState("");
  const [footerRight, setFooterRight] = useState("");
  const [pageLayout, setPageLayout] = useState("");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [studentPhoto, setStudentPhoto] = useState(true);
  const [imageFileName, setImageFileName] = useState("");

  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    setCerts([
      { id: 1, name: "Malachi Mccray", bg: "/placeholder-bg.png", defaultFor: "Student" },
    ]);
  }, []);

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setImageFileName(f.name);
  };

  const handleSave = () => {
    if (!name) return;
    setCerts((s) => [{ id: s.length + 1, name, bg: imageFileName, defaultFor: "" }, ...s]);
    setName("");
    setHeaderLeft("");
    setBody("");
    setImageFileName("");
  };

  return (
    <DashboardLayout
      title="Certificate"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Certificate Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                  <Label>Header left text</Label>
                  <Input value={headerLeft} onChange={(e) => setHeaderLeft(e.target.value)} />
                </div>

                <div>
                  <Label>Date</Label>
                  <Input value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div>
                  <Label>Body (Max Character length 500)</Label>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
                  <div className="text-sm text-muted-foreground mt-2">
                    [name] [dob] [present_address] [guardian] [created_at] [admission_no] [roll_no] [gender] [admission_date] [category] [cast] [father_name] [mother_name] [religion] [email] [phone] [class] [section]
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Body Font</Label>
                    <Select onValueChange={(v) => setBodyFont(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Body Font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="body">Body Font</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Font Size *</Label>
                    <Input value={fontSize} onChange={(e) => setFontSize(e.target.value)} placeholder="Ex: 2em" />
                  </div>
                </div>

                <div>
                  <Label>Footer left text</Label>
                  <Input value={footerLeft} onChange={(e) => setFooterLeft(e.target.value)} />
                </div>

                <div>
                  <Label>Footer Center text</Label>
                  <Input value={footerCenter} onChange={(e) => setFooterCenter(e.target.value)} />
                </div>

                <div>
                  <Label>Footer Right text</Label>
                  <Input value={footerRight} onChange={(e) => setFooterRight(e.target.value)} />
                </div>

                <div>
                  <Label>PAGE LAYOUT *</Label>
                  <Select onValueChange={(v) => setPageLayout(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Page Layout *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Height (mm)*</Label>
                    <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height" />
                  </div>
                  <div>
                    <Label>Width (mm)*</Label>
                    <Input value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Width" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Label>STUDENT PHOTO</Label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" checked={studentPhoto} onChange={() => setStudentPhoto(true)} />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" checked={!studentPhoto} onChange={() => setStudentPhoto(false)} />
                      <span>None</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Image (1100 X 850)px *</Label>
                    <Input value={imageFileName} readOnly />
                  </div>
                  <div>
                    <label className="inline-flex">
                      <input type="file" className="hidden" onChange={handleBrowse} />
                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                    </label>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE CERTIFICATE</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Certificate List</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <Input placeholder="SEARCH" className="border-0 p-0" />
                  </div>
                  <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                    <button className="text-gray-500">📎</button>
                    <button className="text-gray-500">🖨️</button>
                    <button className="text-gray-500">📄</button>
                    <button className="text-gray-500">▢</button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Background Image</TableHead>
                    <TableHead>Default For</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certs.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>
                        <div className="w-24 h-8 bg-yellow-200 flex items-center justify-center">{c.bg ? <img src={c.bg} alt="bg" className="h-full" /> : <span className="text-xs">No</span>}</div>
                      </TableCell>
                      <TableCell>{c.defaultFor}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">SELECT</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {certs.length} of {certs.length} Entries</div>

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

export default Certificate;
