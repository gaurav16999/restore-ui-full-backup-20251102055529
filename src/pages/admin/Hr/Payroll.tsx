import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const Payroll = () => {
  const sidebarItems = getAdminSidebarItems("/admin/hr/payroll");

  const [role, setRole] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleSearch = () => {
    console.log('generate payroll', { role, month, year });
  };

  return (
    <DashboardLayout title="Generate Payroll" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-4">
                <label className="text-xs text-muted-foreground block mb-1">Role *</label>
                <Select value={role} onValueChange={(v) => setRole(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Role *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-4">
                <label className="text-xs text-muted-foreground block mb-1">Month</label>
                <Select value={month} onValueChange={(v) => setMonth(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="january">January</SelectItem>
                    <SelectItem value="february">February</SelectItem>
                    <SelectItem value="march">March</SelectItem>
                    <SelectItem value="october">October</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-4">
                <label className="text-xs text-muted-foreground block mb-1">Year</label>
                <Select value={year} onValueChange={(v) => setYear(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-12 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Payroll;
