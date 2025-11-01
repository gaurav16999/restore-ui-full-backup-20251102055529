import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const PreviousResult = () => {
  const sidebarItems = getAdminSidebarItems("/admin/reports/exam/previous-result");

  const records = ["Select Record *", "Record 1", "Record 2"];

  return (
    <DashboardLayout title="Previous Result" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
              <div>
                <Label className="text-xs">ADMISSION NUMBER *</Label>
                <input className="w-full border rounded px-3 py-2" placeholder="" />
              </div>

              <div className="flex flex-col items-end">
                <div className="w-full">
                  <Label className="text-xs">SELECT RECORD *</Label>
                  <select className="w-full border rounded px-3 py-2">
                    {records.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-3">
                  <Button className="bg-purple-600 text-white">🔍 SEARCH</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6" />
      </div>
    </DashboardLayout>
  );
};

export default PreviousResult;
