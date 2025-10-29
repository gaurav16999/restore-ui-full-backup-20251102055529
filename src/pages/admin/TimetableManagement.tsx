import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, Calendar, User, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import authClient from "@/lib/http";

interface TimeSlot {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  period_name: string;
  is_break: boolean;
}

interface Timetable {
  id: number;
  day_of_week: string;
  time_slot_display: string;
  subject_name: string;
  class_name: string;
  teacher_name: string;
  room_number: string;
}

const TimetableManagement = () => {
  const [activeTab, setActiveTab] = useState("timeslots");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [isTimetableDialogOpen, setIsTimetableDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const { toast } = useToast();

  const [timeSlotForm, setTimeSlotForm] = useState({
    day_of_week: 'monday',
    start_time: '',
    end_time: '',
    period_name: '',
    is_break: false
  });

  const [timetableForm, setTimetableForm] = useState({
    class_assigned: '',
    subject: '',
    teacher: '',
    time_slot: '',
    room_number: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timeSlotsRes, timetablesRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        authClient.get('/api/admin/time-slots/'),
        authClient.get('/api/admin/timetables/'),
        authClient.get('/api/admin/classes/'),
        authClient.get('/api/admin/subjects/'),
        authClient.get('/api/admin/teachers/')
      ]);

      setTimeSlots(Array.isArray(timeSlotsRes.data) ? timeSlotsRes.data : timeSlotsRes.data.results || []);
      setTimetables(Array.isArray(timetablesRes.data) ? timetablesRes.data : timetablesRes.data.results || []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.results || []);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.results || []);
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : teachersRes.data.results || []);
    } catch (error: any) {
      console.error('Failed to fetch timetable data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch timetable data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.post('/api/admin/time-slots/', timeSlotForm);
      toast({
        title: "Success",
        description: "Time slot created successfully",
      });
      setIsTimeSlotDialogOpen(false);
      fetchData();
      setTimeSlotForm({
        day_of_week: 'monday',
        start_time: '',
        end_time: '',
        period_name: '',
        is_break: false
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create time slot",
        variant: "destructive",
      });
    }
  };

  const handleCreateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.post('/api/admin/timetables/', timetableForm);
      toast({
        title: "Success",
        description: "Timetable entry created successfully",
      });
      setIsTimetableDialogOpen(false);
      fetchData();
      setTimetableForm({
        class_assigned: '',
        subject: '',
        teacher: '',
        time_slot: '',
        room_number: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create timetable entry",
        variant: "destructive",
      });
    }
  };

  const fetchClassSchedule = async (classId: string) => {
    try {
      const response = await authClient.get(`/api/admin/timetables/class_schedule/?class_id=${classId}`);
      setTimetables(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch class schedule",
        variant: "destructive",
      });
    }
  };

  const fetchTeacherSchedule = async (teacherId: string) => {
    try {
      const response = await authClient.get(`/api/admin/timetables/teacher_schedule/?teacher_id=${teacherId}`);
      setTimetables(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch teacher schedule",
        variant: "destructive",
      });
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    if (classId) {
      fetchClassSchedule(classId);
    } else {
      fetchData();
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    if (teacherId) {
      fetchTeacherSchedule(teacherId);
    } else {
      fetchData();
    }
  };

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      monday: "bg-blue-100 text-blue-800",
      tuesday: "bg-green-100 text-green-800",
      wednesday: "bg-yellow-100 text-yellow-800",
      thursday: "bg-purple-100 text-purple-800",
      friday: "bg-pink-100 text-pink-800",
      saturday: "bg-orange-100 text-orange-800",
      sunday: "bg-red-100 text-red-800",
    };
    return colors[day.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const sidebarItems = getAdminSidebarItems("/admin/timetable");

  if (loading) {
    return (
      <DashboardLayout
        title="Timetable Management"
        userName="Admin"
        userRole="Administrator"
        sidebarItems={sidebarItems}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Timetable Management"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Timetable Management</h1>
            <p className="text-muted-foreground mt-1">Manage class schedules and time slots</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsTimeSlotDialogOpen(true)} variant="outline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Add Time Slot
            </Button>
            <Button onClick={() => setIsTimetableDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Timetable Entry
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time Slots</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timeSlots.length}</div>
              <p className="text-xs text-muted-foreground">
                {timeSlots.filter(ts => ts.is_break).length} breaks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timetables.length}</div>
              <p className="text-xs text-muted-foreground">
                Total entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-muted-foreground">
                Teaching staff
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
              <p className="text-xs text-muted-foreground">
                Total subjects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeslots">Time Slots</TabsTrigger>
            <TabsTrigger value="class-schedule">Class Schedule</TabsTrigger>
            <TabsTrigger value="teacher-schedule">Teacher Schedule</TabsTrigger>
          </TabsList>

          {/* Time Slots Tab */}
          <TabsContent value="timeslots" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Slots</CardTitle>
                <CardDescription>Manage school time periods and breaks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Period Name</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>
                          <Badge className={getDayColor(slot.day_of_week)}>
                            {slot.day_of_week}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{slot.period_name}</TableCell>
                        <TableCell>{slot.start_time}</TableCell>
                        <TableCell>{slot.end_time}</TableCell>
                        <TableCell>
                          <Badge className={slot.is_break ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                            {slot.is_break ? 'Break' : 'Class'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Schedule Tab */}
          <TabsContent value="class-schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Class Schedule</CardTitle>
                    <CardDescription>View and manage class timetables</CardDescription>
                  </div>
                  <div className="w-64">
                    <Select value={selectedClass} onValueChange={handleClassChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timetables.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge className={getDayColor(entry.day_of_week)}>
                            {entry.day_of_week}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{entry.time_slot_display}</TableCell>
                        <TableCell className="font-medium">{entry.subject_name}</TableCell>
                        <TableCell>{entry.class_name}</TableCell>
                        <TableCell>{entry.teacher_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.room_number || 'N/A'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teacher Schedule Tab */}
          <TabsContent value="teacher-schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Teacher Schedule</CardTitle>
                    <CardDescription>View individual teacher timetables</CardDescription>
                  </div>
                  <div className="w-64">
                    <Select value={selectedTeacher} onValueChange={handleTeacherChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Teachers</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.user ? `${teacher.user.first_name} ${teacher.user.last_name}` : `Teacher ${teacher.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timetables.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge className={getDayColor(entry.day_of_week)}>
                            {entry.day_of_week}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{entry.time_slot_display}</TableCell>
                        <TableCell className="font-medium">{entry.subject_name}</TableCell>
                        <TableCell>{entry.class_name}</TableCell>
                        <TableCell>{entry.teacher_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.room_number || 'N/A'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Time Slot Dialog */}
        <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Time Slot</DialogTitle>
              <DialogDescription>
                Add a new time period for the school schedule
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTimeSlot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week</Label>
                <Select value={timeSlotForm.day_of_week} onValueChange={(value) => setTimeSlotForm({...timeSlotForm, day_of_week: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period-name">Period Name</Label>
                <Input
                  id="period-name"
                  value={timeSlotForm.period_name}
                  onChange={(e) => setTimeSlotForm({...timeSlotForm, period_name: e.target.value})}
                  placeholder="e.g., Period 1, Lunch Break"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={timeSlotForm.start_time}
                    onChange={(e) => setTimeSlotForm({...timeSlotForm, start_time: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={timeSlotForm.end_time}
                    onChange={(e) => setTimeSlotForm({...timeSlotForm, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-break"
                  checked={timeSlotForm.is_break}
                  onChange={(e) => setTimeSlotForm({...timeSlotForm, is_break: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is-break" className="cursor-pointer">
                  This is a break period
                </Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTimeSlotDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Time Slot</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Timetable Dialog */}
        <Dialog open={isTimetableDialogOpen} onOpenChange={setIsTimetableDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timetable Entry</DialogTitle>
              <DialogDescription>
                Schedule a class for a specific time slot
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTimetable} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="time-slot">Time Slot</Label>
                <Select value={timetableForm.time_slot} onValueChange={(value) => setTimetableForm({...timetableForm, time_slot: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.filter(ts => !ts.is_break).map((slot) => (
                      <SelectItem key={slot.id} value={slot.id.toString()}>
                        {slot.day_of_week} - {slot.period_name} ({slot.start_time} - {slot.end_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={timetableForm.class_assigned} onValueChange={(value) => setTimetableForm({...timetableForm, class_assigned: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={timetableForm.subject} onValueChange={(value) => setTimetableForm({...timetableForm, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher</Label>
                <Select value={timetableForm.teacher} onValueChange={(value) => setTimetableForm({...timetableForm, teacher: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.user ? `${teacher.user.first_name} ${teacher.user.last_name}` : `Teacher ${teacher.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room Number (Optional)</Label>
                <Input
                  id="room"
                  value={timetableForm.room_number}
                  onChange={(e) => setTimetableForm({...timetableForm, room_number: e.target.value})}
                  placeholder="e.g., 101, Lab 2"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTimetableDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add to Timetable</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TimetableManagement;
