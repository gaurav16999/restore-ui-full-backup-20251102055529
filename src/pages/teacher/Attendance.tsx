import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle2, XCircle, Calendar, Users, Shield, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BookOpen, Calendar as CalendarIcon, MessageSquare, FileText, BarChart3, Settings, Upload, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const TeacherAttendance = () => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<{ [key: string]: 'present' | 'absent' }>({});

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", path: "/teacher" },
    { icon: CalendarIcon, label: "My Classes" },
    { icon: Users, label: "Students" },
    { icon: ClipboardCheck, label: "Attendance", active: true, path: "/teacher/attendance" },
    { icon: FileText, label: "Grades & Assessments" },
    { icon: Upload, label: "Assignments" },
    { icon: MessageSquare, label: "Messages" },
    { icon: BookOpen, label: "Resources" },
    { icon: Settings, label: "Settings" },
  ];

  const classes = [
    { id: "10a", name: "Grade 10A - Mathematics", students: 32 },
    { id: "11b", name: "Grade 11B - Physics", students: 28 },
    { id: "10b", name: "Grade 10B - Chemistry", students: 30 },
  ];

  const students = [
    { id: "1", name: "Emma Wilson", rollNo: "101", class: "10A" },
    { id: "2", name: "James Chen", rollNo: "102", class: "10A" },
    { id: "3", name: "Sofia Rodriguez", rollNo: "103", class: "10A" },
    { id: "4", name: "Michael Brown", rollNo: "104", class: "10A" },
    { id: "5", name: "Olivia Davis", rollNo: "105", class: "10A" },
    { id: "6", name: "Ethan Martinez", rollNo: "106", class: "10A" },
    { id: "7", name: "Ava Garcia", rollNo: "107", class: "10A" },
    { id: "8", name: "Noah Anderson", rollNo: "108", class: "10A" },
    { id: "9", name: "Isabella Thomas", rollNo: "109", class: "10A" },
    { id: "10", name: "Liam Jackson", rollNo: "110", class: "10A" },
  ];

  const markAllPresent = () => {
    const newAttendance: { [key: string]: 'present' | 'absent' } = {};
    students.forEach(student => {
      newAttendance[student.id] = 'present';
    });
    setAttendance(newAttendance);
    toast({
      title: "All Marked Present",
      description: "All students have been marked as present.",
    });
  };

  const markAllAbsent = () => {
    const newAttendance: { [key: string]: 'present' | 'absent' } = {};
    students.forEach(student => {
      newAttendance[student.id] = 'absent';
    });
    setAttendance(newAttendance);
    toast({
      title: "All Marked Absent",
      description: "All students have been marked as absent.",
    });
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const saveAttendance = () => {
    const presentCount = Object.values(attendance).filter(status => status === 'present').length;
    const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
    
    toast({
      title: "Attendance Saved",
      description: `${presentCount} present, ${absentCount} absent. Attendance recorded for ${selectedDate}.`,
    });
  };

  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
  const totalMarked = Object.keys(attendance).length;

  return (
    <DashboardLayout
      title="Attendance Management"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Attendance Management</h2>
          <p className="text-muted-foreground">Mark and track student attendance</p>
        </div>

        {/* Selection Controls */}
        <Card className="animate-scale-in shadow-lg border-2">
          <CardHeader className="bg-gradient-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Attendance Control Panel</CardTitle>
                  <CardDescription>Select class and manage attendance records</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light rounded-lg">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Secure Session</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Select Class
                </label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-11 border-2 hover:border-primary transition-colors">
                    <SelectValue placeholder="Choose a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          {cls.name} • {cls.students} students
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-11 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm hover:border-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Quick Actions</label>
                <div className="flex gap-2">
                  <Button 
                    onClick={markAllPresent} 
                    variant="outline" 
                    className="flex-1 h-11 border-2 hover:border-success hover:bg-success-light hover:text-success transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    All Present
                  </Button>
                  <Button 
                    onClick={markAllAbsent} 
                    variant="outline" 
                    className="flex-1 h-11 border-2 hover:border-destructive hover:bg-destructive-light hover:text-destructive transition-all"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    All Absent
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedClass && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
            <Card className="shadow-hover border-2 hover:shadow-xl transition-all duration-300 bg-gradient-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary-light flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{students.length}</p>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-hover border-2 border-success/20 hover:shadow-xl hover:border-success/40 transition-all duration-300 bg-gradient-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-success-light flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-success" />
                  </div>
                  <p className="text-3xl font-bold mb-1 text-success">{presentCount}</p>
                  <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-hover border-2 border-destructive/20 hover:shadow-xl hover:border-destructive/40 transition-all duration-300 bg-gradient-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-destructive-light flex items-center justify-center">
                    <XCircle className="w-7 h-7 text-destructive" />
                  </div>
                  <p className="text-3xl font-bold mb-1 text-destructive">{absentCount}</p>
                  <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-hover border-2 border-primary/20 hover:shadow-xl hover:border-primary/40 transition-all duration-300 bg-gradient-primary">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-bold mb-1 text-white">
                    {totalMarked > 0 ? Math.round((presentCount / students.length) * 100) : 0}%
                  </p>
                  <p className="text-sm font-medium text-white/90">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student List */}
        {selectedClass && (
          <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "100ms" }}>
            <CardHeader className="bg-gradient-card border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-light rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Student Attendance</CardTitle>
                    <CardDescription>Mark attendance status for each student</CardDescription>
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {totalMarked}/{students.length} Marked
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {students.map((student, index) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                      attendance[student.id] === 'present' 
                        ? 'bg-success-light border-success/30' 
                        : attendance[student.id] === 'absent' 
                        ? 'bg-destructive-light border-destructive/30' 
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                        attendance[student.id] === 'present'
                          ? 'bg-success text-white'
                          : attendance[student.id] === 'absent'
                          ? 'bg-destructive text-white'
                          : 'bg-primary-light text-primary'
                      }`}>
                        {student.rollNo}
                      </div>
                      <div>
                        <p className="font-semibold text-base">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Roll No: {student.rollNo} • Class {student.class}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="lg"
                        variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                        onClick={() => {
                          setAttendance(prev => ({ ...prev, [student.id]: 'present' }));
                        }}
                        className={`min-w-[120px] font-semibold transition-all ${
                          attendance[student.id] === 'present'
                            ? 'bg-success hover:bg-success/90 border-success shadow-md'
                            : 'border-2 hover:border-success hover:bg-success-light hover:text-success'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Present
                      </Button>
                      <Button
                        size="lg"
                        variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'}
                        onClick={() => {
                          setAttendance(prev => ({ ...prev, [student.id]: 'absent' }));
                        }}
                        className={`min-w-[120px] font-semibold transition-all ${
                          attendance[student.id] === 'absent'
                            ? 'shadow-md'
                            : 'border-2 hover:border-destructive hover:bg-destructive-light hover:text-destructive'
                        }`}
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between p-6 bg-primary-light rounded-xl border-2 border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ready to save attendance?</p>
                    <p className="text-sm text-muted-foreground">All changes will be securely recorded</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={saveAttendance} 
                  disabled={totalMarked === 0}
                  className="min-w-[180px] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  Save Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedClass && (
          <Card className="animate-fade-in shadow-xl border-2">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary-light flex items-center justify-center">
                <ClipboardCheck className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Select a Class to Begin</h3>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Choose a class from the dropdown above to start marking attendance for today
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAttendance;
