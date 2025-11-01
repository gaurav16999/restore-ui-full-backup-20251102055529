import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GenerateCertificate = () => {
  const sidebarItems = getAdminSidebarItems("/admin/admin-section/generate-certificate");

  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");
  const [certificate, setCertificate] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // start empty as in screenshot
    setStudents([]);
  }, []);

  const handleSearch = () => {
    // placeholder local behavior — would call API to load students for class/section/certificate
    // currently leave empty to match screenshot "No Data Available In Table"
  };

  const handleGenerate = () => {
    // placeholder: would generate certificates for selected students
    // For now show a console message
    console.log("Generate certificates", { classVal, section, certificate });
  };

  return (
    <DashboardLayout
      title="Generate Certificate"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
            <CardDescription />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select onValueChange={(v) => setClassVal(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="CLASS *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary-one">PRIMARY ONE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="SECTION" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">Select Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select onValueChange={(v) => setCertificate(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="CERTIFICATE *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="malachi">Malachi Mccray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>SEARCH</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Student List</CardTitle>
              <div className="flex items-center gap-4">
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleGenerate}>GENERATE</Button>
              </div>
            </div>
            <CardDescription>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" className="border-0 p-0" />
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                  <button className="text-gray-500">📎</button>
                  <button className="text-gray-500">🖨️</button>
                  <button className="text-gray-500">📄</button>
                  <button className="text-gray-500">▢</button>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>All</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class (Sec.)</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Date Of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Mobile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">No Data Available In Table</TableCell>
                  </TableRow>
                )}
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{/* checkbox placeholder */}</TableCell>
                    <TableCell>{s.admission}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell>{s.father}</TableCell>
                    <TableCell>{s.dob}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>{s.mobile}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to {students.length} of {students.length} entries</div>

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

export default GenerateCertificate;
