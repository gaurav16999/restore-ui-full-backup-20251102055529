import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BulkIdCard = () => {
  const sidebarItems = getAdminSidebarItems("/admin/bulk-print/id-card");

  const [role, setRole] = useState("");
  const [idCard, setIdCard] = useState("");
  const [gridGap, setGridGap] = useState("");

  const handleSearch = () => {
    console.log("bulk print id card search", { role, idCard, gridGap });
  };

  return (
    <DashboardLayout title="Generate id Card" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">SELECT ROLE *</label>
                <Select onValueChange={(v) => setRole(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SELECT ID CARD *</label>
                <Select onValueChange={(v) => setIdCard(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Id Card *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground block mb-1">GRID GAP (PX) *</label>
                <Input value={gridGap} onChange={(e) => setGridGap(e.target.value)} placeholder="Grid Gap (px)" />
              </div>

              <div className="flex items-end justify-end">
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BulkIdCard;
