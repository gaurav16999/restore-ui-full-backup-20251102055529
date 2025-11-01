import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SubjectAttendanceReport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/student/subject-attendance");

  const classes = ["Select Class*", "Primary One", "Primary Two"];
  const sections = ["Select Section *", "A", "B"];
  const months = ["October", "November", "December"];
  const years = ["2025", "2024"];

  return (
    <DashboardLayout title="Subject Attendance Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
              <div>
                <select className="w-full border rounded px-3 py-2">
                  {classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="w-full border rounded px-3 py-2">
                  {sections.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="w-full border rounded px-3 py-2">
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="w-full border rounded px-3 py-2">
                  {years.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Attendance Report</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Empty report area per design */}
            <div className="h-64 flex items-start">
              <div className="w-full text-sm text-muted-foreground">Select criteria and click SEARCH to view attendance.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubjectAttendanceReport;
