import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const SendMarksSms = () => {
  const sidebarItems = getAdminSidebarItems("/admin/examination/send-marks-sms");

  const [exam, setExam] = useState("");
  const [klass, setKlass] = useState("");
  const [receiver, setReceiver] = useState("");

  const handleSend = () => {
    console.log('send marks via sms', { exam, klass, receiver });
  };

  return (
    <DashboardLayout title="Send Marks By Sms" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <Card>
              <CardHeader>
                <CardTitle>Send Marks Via SMS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <Select value={exam} onValueChange={(v) => setExam(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Exam *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="half">half</SelectItem>
                        <SelectItem value="march">March paper</SelectItem>
                        <SelectItem value="final">Final Term 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={klass} onValueChange={(v) => setKlass(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Class *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary_two">PRIMARY TWO</SelectItem>
                        <SelectItem value="top_class">TOP CLASS</SelectItem>
                        <SelectItem value="one_a">1A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={receiver} onValueChange={(v) => setReceiver(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Receiver *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSend}>✅ SEND MARKS VIA SMS</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
};

export default SendMarksSms;
