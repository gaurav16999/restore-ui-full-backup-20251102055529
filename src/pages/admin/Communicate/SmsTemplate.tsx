import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const templates = [
  "Student Admission",
  "Student Admission For Parent",
  "Exam Schedule For Student",
  "Exam Schedule For Parent",
  "User Login Permission",
  "Student Promote",
  "Communicate sms",
  "Student Attendance",
  "Student Attendance For Parent",
  "Student Absent",
  "Student Absent For Parent",
  "Student Late",
  "Student Late For Parent",
  "Student leave application",
  "Student Leave Approve",
  "Parent leave application for student",
  "Parent Leave Approve For Student",
  "Student Library Book Issue",
  "Parent Library Book Issue",
  "Student Return Issue Book",
  "Parent Return Issue Book",
  "Exam Mark Student",
  "Exam Mark Parent",
  "Student Fees Due",
  "Student Fees Due For Parent",
  "Staff Credentials",
  "Staff Attendance",
  "Staff Absent",
  "Staff Late",
  "Staff leave application",
  "Staff Leave Approve",
  "Holiday",
  "Student Birthday",
  "Staff Birthday",
  "Student Dues Fees",
  "Student Dues Fees For Parent",
  "Student Absent Notification",
  "Two Factor Code",
];

const SmsTemplate = () => {
  const sidebarItems = getAdminSidebarItems("/admin/communicate/sms-template");

  return (
    <DashboardLayout title="Sms Template" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left list */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {templates.map((t, i) => (
                    <a key={i} className={`block px-3 py-2 rounded hover:bg-muted ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} href="#">
                      {t}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right editor */}
          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Sms Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Variables: [student_name], [user_name], [password], [school_name]</div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="form-checkbox text-purple-600" />
                        <span className="text-sm">Enable</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>BODY</Label>
                    <Textarea rows={4} defaultValue={"Dear [student_name], Your Admission Is Completed You Can Login To Your Account Using username:[user_name] Password:[password], Thank You [school_name]"} />
                  </div>

                  <div className="flex justify-center">
                    <Button className="bg-purple-600 text-white">✓ UPDATE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmsTemplate;
