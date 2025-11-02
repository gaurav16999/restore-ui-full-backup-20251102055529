import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BulkCertificate = () => {
  const sidebarItems = getAdminSidebarItems("/admin/bulk-print/certificate");

  const [classId, setClassId] = useState("");
  const [certificate, setCertificate] = useState("");
  const [gridGap, setGridGap] = useState("");

  const handleSearch = () => {
    console.log("bulk print certificate search", { classId, certificate, gridGap });
  };

  return (
    <DashboardLayout title="Certificate" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Select Class</label>
                <Select onValueChange={(v) => setClassId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select</SelectItem>
                    <SelectItem value="class-1">Class 1</SelectItem>
                    <SelectItem value="class-2">Class 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">CERTIFICATE *</label>
                <Select onValueChange={(v) => setCertificate(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Certificate *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Certificate</SelectItem>
                    <SelectItem value="transfer">Transfer Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground block mb-1">GRID GAP(PX)</label>
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

export default BulkCertificate;
