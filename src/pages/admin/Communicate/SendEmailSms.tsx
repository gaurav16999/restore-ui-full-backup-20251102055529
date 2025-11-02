import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SendEmailSms = () => {
  const sidebarItems = getAdminSidebarItems("/admin/communicate/send-email-sms");
  const roles = ['Student','Parents','Teacher','Admin','Accountant','Receptionist','Librarian','Driver','Nam','Security','maxamed'];
  return (
    <DashboardLayout title="Send Email/SMS" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Email/SMS</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>TITLE *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>SEND THROUGH</Label>
                    <div className="mt-2 flex items-center space-x-4">
                      <label className="inline-flex items-center space-x-2">
                        <input type="radio" name="sendThrough" defaultChecked />
                        <span className="ml-1">Email</span>
                      </label>
                      <label className="inline-flex items-center space-x-2">
                        <input type="radio" name="sendThrough" />
                        <span className="ml-1">SMS</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>DESCRIPTION *</Label>
                    <Textarea rows={6} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>&nbsp;</CardTitle>
                <CardDescription>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 rounded-t bg-slate-100">GROUP</button>
                    <button className="px-4 py-2 rounded-t bg-slate-200">INDIVIDUAL</button>
                    <button className="px-4 py-2 rounded-t bg-slate-100">CLASS</button>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>MESSAGE TO *</Label>
                    <div className="mt-2 space-y-2">
                      {roles.map((r) => (
                        <div key={r} className="flex items-center">
                          <input type="radio" name="messageTo" />
                          <span className="ml-2 text-sm">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded">
          <div className="text-sm">For Sending Email / Sms, It may take some seconds. So please take patience.</div>
        </div>

        <div>
          <Card>
            <CardContent>
              <div className="flex justify-center">
                <Button className="bg-purple-600 text-white">✓ SEND</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SendEmailSms;
