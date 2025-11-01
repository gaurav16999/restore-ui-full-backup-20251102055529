import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const MarksRegister = () => {
  const sidebarItems = getAdminSidebarItems("/admin/examination/marks-register");

  const [exam, setExam] = useState("");
  const [klass, setKlass] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");

  const handleSearch = () => {
    console.log('search marks register', { exam, klass, subject, section });
  };

  const handleAddMarks = () => {
    console.log('add marks');
  };

  return (
    <DashboardLayout title="Marks Register" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between w-full">
                  <CardTitle>Select Criteria</CardTitle>
                  <div className="ml-4">
                    <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleAddMarks}>＋ ADD MARKS</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
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
                    <Select value={subject} onValueChange={(v) => setSubject(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Subject *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="social">Social studies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <Select value={section} onValueChange={(v) => setSection(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="ml-4">
                      <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-12">
            <div className="h-64 border border-dashed rounded bg-muted" />
          </div>
        </div>

        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
};

export default MarksRegister;
