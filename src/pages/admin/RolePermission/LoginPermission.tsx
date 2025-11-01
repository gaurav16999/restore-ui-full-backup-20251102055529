import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const LoginPermission = () => {
  const sidebarItems = getAdminSidebarItems("/admin/role-permission/login-permission");

  const [role, setRole] = useState("");

  const handleSearch = () => {
    console.log("search login permission for role", role);
  };

  return (
    <DashboardLayout title="Login Permission" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-11">
                <Select value={role} onValueChange={(v) => setRole(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Role *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1 flex justify-end">
                <Button className="bg-purple-600 border-transparent text-white" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {/* Empty content area matching screenshot */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LoginPermission;
