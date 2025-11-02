import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClipboardCheck, 
  faCheckCircle, 
  faTimesCircle, 
  faCalendar,
  faShield,
  faUsers,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getTeacherSidebarItems } from "@/lib/teacherSidebar";
import { useAuth } from "@/lib/auth";
import { getTeacherAttendance, getTeacherClasses, submitTeacherAttendance } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const TeacherAttendance = () => {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<{ [key: string]: 'present' | 'absent' }>({});
  const [classOptions, setClassOptions] = useState<Array<{ id: string; name: string; students?: number }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; rollNo: string; class: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sidebarItems = getTeacherSidebarItems("/teacher/attendance");

  // Load teacher classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!accessToken) return;
      try {
        const cls = await getTeacherClasses(accessToken);
        setClassOptions((cls || []).map((c: any) => ({ id: String(c.id), name: c.name, students: c.student_count })));
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "Failed to load classes", variant: "destructive" });
      }
    };
    loadClasses();
  }, [accessToken]);

  // Load attendance when class/date changes
  useEffect(() => {
    const loadAttendance = async () => {
      if (!accessToken || !selectedClass) return;
      setLoading(true);
      try {
        const data = await getTeacherAttendance(accessToken, selectedClass, selectedDate);
        const list = (data?.attendance || []).map((s: any) => ({
          id: String(s.student_id),
          name: s.student_name,
          rollNo: String(s.roll_no),
          class: data?.class_name || "",
        }));
        setStudents(list);
        // Initialize attendance state from API (ignore 'not_marked')
        const mapped: { [key: string]: 'present' | 'absent' } = {};
        for (const s of data?.attendance || []) {
          if (s.status === 'present' || s.status === 'absent') {
            mapped[String(s.student_id)] = s.status;
          }
        }
        setAttendance(mapped);
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "Failed to load attendance", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [accessToken, selectedClass, selectedDate]);

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

  const saveAttendance = async () => {
    try {
      if (!accessToken || !selectedClass) return;
      const records = students
        .filter((s) => attendance[s.id])
        .map((s) => ({ student_id: Number(s.id), status: attendance[s.id] }));

      await submitTeacherAttendance(accessToken, {
        class_id: Number(selectedClass),
        date: selectedDate,
        attendance: records,
      });

      const presentCount = Object.values(attendance).filter(status => status === 'present').length;
      const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
      toast({
        title: "Attendance Saved",
        description: `${presentCount} present, ${absentCount} absent. Attendance recorded for ${selectedDate}.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save attendance", variant: "destructive" });
    }
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
                  <FontAwesomeIcon icon={faCalendar} className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Attendance Control Panel</CardTitle>
                  <CardDescription>Select class and manage attendance records</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light rounded-lg">
                <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Secure Session</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-primary" />
                  Select Class
                </label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-11 border-2 hover:border-primary transition-colors">
                    <SelectValue placeholder="Choose a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          {cls.name} • {cls.students ?? ""} students
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-primary" />
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
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1.5" />
                    All Present
                  </Button>
                  <Button 
                    onClick={markAllAbsent} 
                    variant="outline" 
                    className="flex-1 h-11 border-2 hover:border-destructive hover:bg-destructive-light hover:text-destructive transition-all"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1.5" />
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
                    <FontAwesomeIcon icon={faUsers} className="w-7 h-7 text-primary" />
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
                    <FontAwesomeIcon icon={faCheckCircle} className="w-7 h-7 text-success" />
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
                    <FontAwesomeIcon icon={faTimesCircle} className="w-7 h-7 text-destructive" />
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
                    <FontAwesomeIcon icon={faChartLine} className="w-7 h-7 text-white" />
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
                    <FontAwesomeIcon icon={faClipboardCheck} className="w-5 h-5 text-primary" />
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
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border-2 bg-card border-border">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-xl" />
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-11 w-28 rounded-md" />
                          <Skeleton className="h-11 w-28 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <>
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
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                          attendance[student.id] === 'present'
                            ? 'bg-success text-white'
                            : attendance[student.id] === 'absent'
                            ? 'bg-destructive text-white'
                            : 'bg-primary-light text-primary'
                        }`}
                      >
                        {student.rollNo}
                      </div>
                      <div>
                        <p className="font-semibold text-base">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Roll No: {student.rollNo} • Class {student.class}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="lg"
                        variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                        onClick={() => {
                          setAttendance((prev) => ({ ...prev, [student.id]: 'present' }));
                        }}
                        className={`min-w-[120px] font-semibold transition-all ${
                          attendance[student.id] === 'present'
                            ? 'bg-success hover:bg-success/90 border-success shadow-md'
                            : 'border-2 hover:border-success hover:bg-success-light hover:text-success'
                        }`}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 mr-2" />
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
                        <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5 mr-2" />
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
                </>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between p-6 bg-primary-light rounded-xl border-2 border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <FontAwesomeIcon icon={faShield} className="w-6 h-6 text-primary" />
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
                  <FontAwesomeIcon icon={faClipboardCheck} className="w-5 h-5 mr-2" />
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
                <FontAwesomeIcon icon={faClipboardCheck} className="w-12 h-12 text-primary" />
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
