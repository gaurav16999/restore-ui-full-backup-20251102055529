import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DueFeesLoginPermission = () => {
  const sidebarItems = getAdminSidebarItems("/admin/role-permission/due-fees-login-permission");

  const [cls, setCls] = useState("");
  const [section, setSection] = useState("");
  const [name, setName] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");

  const handleSearch = () => {
    console.log("search due-fees login permission", { cls, section, name, admissionNo });
  };

  return (
    <DashboardLayout title="Fees Due User Login Permission" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-3">
                <label className="text-xs text-muted-foreground block mb-1">CLASS</label>
                <Select value={cls} onValueChange={(v) => setCls(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class1">Class 1</SelectItem>
                    <SelectItem value="class2">Class 2</SelectItem>
                    <SelectItem value="class3">Class 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-3">
                <label className="text-xs text-muted-foreground block mb-1">SECTION</label>
                <Select value={section} onValueChange={(v) => setSection(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">A</SelectItem>
                    <SelectItem value="b">B</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-4">
                <label className="text-xs text-muted-foreground block mb-1">SEARCH BY NAME</label>
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">ADMISSION NO</label>
                <Input placeholder="Admission No" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} />
              </div>

              <div className="lg:col-span-12 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {/* Empty content area for results - matches screenshot */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DueFeesLoginPermission;
