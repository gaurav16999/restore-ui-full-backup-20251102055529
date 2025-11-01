import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GenerateIdCard = () => {
  const sidebarItems = getAdminSidebarItems("/admin/admin-section/generate-id-card");

  const [role, setRole] = useState("");
  const [idCard, setIdCard] = useState("");
  const [gridGap, setGridGap] = useState("10");
  const [classVal, setClassVal] = useState("");
  const [section, setSection] = useState("");

  const handleSearch = () => {
    // Placeholder: would call API to populate students for selected criteria
    console.log("search id cards", { role, idCard, gridGap, classVal, section });
  };

  return (
    <DashboardLayout
      title="Generate ID Card"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">ROLE *</label>
                <Select onValueChange={(v) => setRole(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">ID CARD *</label>
                <Select onValueChange={(v) => setIdCard(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID Card" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fhttfh">fhttfh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">GRID GAP (PX) *</label>
                <Input value={gridGap} onChange={(e) => setGridGap(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">CLASS</label>
                <Select onValueChange={(v) => setClassVal(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="PRIMARY TWO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary-two">PRIMARY TWO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SECTION</label>
                <Select onValueChange={(v) => setSection(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="A" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end justify-end">
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GenerateIdCard;
