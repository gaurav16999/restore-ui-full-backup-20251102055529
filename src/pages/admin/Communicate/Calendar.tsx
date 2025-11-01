import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Calendar = () => {
  const sidebarItems = getAdminSidebarItems("/admin/communicate/calendar");
  const categoriesLeft = [
    "ADMISSION QUERY",
    "HOMEWORK",
    "EXAM",
    "LEAVE",
    "HOLIDAY",
    "LIBRARY",
  ];

  const categoriesMiddle = [
    "FONT COLOR",
    "FONT COLOR",
    "FONT COLOR",
    "FONT COLOR",
    "FONT COLOR",
    "FONT COLOR",
  ];

  const categoriesRight = [
    "LESSON PLAN",
    "STUDY MATERIAL",
    "ONLINE EXAM",
    "NOTICE BOARD",
    "EVENT",
  ];

  return (
    <DashboardLayout title="Calendar" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Settings</CardTitle>
            <CardDescription />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left column: radios */}
              <div>
                <div className="space-y-6">
                  {categoriesLeft.map((c) => (
                    <div key={c} className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">{c}</div>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center space-x-2">
                          <input type="radio" name={c} defaultChecked className="form-radio text-purple-600" />
                          <span className="text-sm">Yes</span>
                        </label>
                        <label className="inline-flex items-center space-x-2">
                          <input type="radio" name={c} className="form-radio" />
                          <span className="text-sm">No</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle-left: font color inputs and background swatches */}
              <div>
                <div className="space-y-4">
                  {categoriesMiddle.map((_, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                      <div className="col-span-2">
                        <Label className="text-xs">FONT COLOR *</Label>
                        <Input placeholder="" />
                      </div>
                      <div className="h-9 w-full rounded-sm overflow-hidden">
                        <div className={`h-9 w-full`} style={{ background: ["#117c00", "#ff0000", "#07106a", "#118a86", "#8b8b8b", "#6f0007"][idx] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle-right: more font/background pairs (mirrors design columns) */}
              <div>
                <div className="space-y-4">
                  {categoriesMiddle.slice(0, 6).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                      <div className="col-span-2">
                        <Label className="text-xs">FONT COLOR *</Label>
                        <Input placeholder="" />
                      </div>
                      <div className="h-9 w-full rounded-sm overflow-hidden">
                        <div className={`h-9 w-full`} style={{ background: ["#bfbfbf", "#5f0076", "#7b7b00", "#00f0ff", "#7b0000", "#7b0000"][idx] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column: yes/no radios for other items and Update button */}
              <div>
                <div className="space-y-6">
                  {categoriesRight.map((c) => (
                    <div key={c} className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">{c}</div>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center space-x-2">
                          <input type="radio" name={c} defaultChecked className="form-radio text-purple-600" />
                          <span className="text-sm">Yes</span>
                        </label>
                        <label className="inline-flex items-center space-x-2">
                          <input type="radio" name={c} className="form-radio" />
                          <span className="text-sm">No</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="mt-8 flex justify-center">
                    <Button className="bg-purple-600 text-white">✓ UPDATE</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
