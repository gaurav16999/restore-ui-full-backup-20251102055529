import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const NoticeBoard = () => {
  const sidebarItems = getAdminSidebarItems("/admin/communicate/notice-board");
  const today = new Date().toLocaleDateString();

  return (
    <DashboardLayout title="Add Notice" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <div>
                    <Label>TITLE *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>NOTICE</Label>
                    <Textarea rows={6} />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="published" />
                    <label htmlFor="published" className="text-sm">Is Published Web Site</label>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-4">
                  <div>
                    <Label>NOTICE DATE *</Label>
                    <Input placeholder={today} />
                  </div>

                  <div>
                    <Label>PUBLISH ON *</Label>
                    <Input placeholder={today} />
                  </div>

                  <div>
                    <Label>MESSAGE TO</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        'Super admin','Student','Parents','Teacher','Admin','Accountant','Receptionist','Librarian','Driver','Num','Security','maxamed'
                      ].map((role) => (
                        <div key={role} className="flex items-center">
                          <input type="radio" name="messageTo" />
                          <span className="ml-2 text-sm">{role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button className="bg-purple-600 text-white">✓ SAVE CONTENT</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NoticeBoard;
