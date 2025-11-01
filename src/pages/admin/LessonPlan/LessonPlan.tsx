import { useState, useMemo, useEffect } from "react";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function formatShortDate(d: Date) {
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
}

function getWeekStartSaturday(ref: Date) {
  // find previous (or same) Saturday
  const day = ref.getDay(); // 0 Sun, 6 Sat
  // distance to saturday (6): if day===6 -> 0, if day===0 -> -1 (previous sat), etc.
  const diff = ((day === 6) ? 0 : day === 0 ? -1 : (6 - day));
  const saturday = new Date(ref);
  saturday.setDate(ref.getDate() + diff);
  // if diff negative we moved backwards; ensure we have saturday of current week
  return saturday;
}

function getWeekDatesFromSaturday(sat: Date) {
  const arr: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sat);
    d.setDate(sat.getDate() + i);
    arr.push(d);
  }
  return arr;
}

const days = ["SATURDAY","SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"];

const LessonPlan = () => {
  const sidebarItems = getAdminSidebarItems("/admin/lesson-plan/lesson-plan");
  const [teacher, setTeacher] = useState("");
  const [refDate, setRefDate] = useState(new Date());
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const { toast } = useToast();

  const weekStart = useMemo(() => getWeekStartSaturday(refDate), [refDate]);
  const weekDates = useMemo(() => getWeekDatesFromSaturday(weekStart), [weekStart]);

  const handlePrevWeek = () => {
    const prev = new Date(refDate);
    prev.setDate(refDate.getDate() - 7);
    setRefDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(refDate);
    next.setDate(refDate.getDate() + 7);
    setRefDate(next);
  };

  const handleSearch = () => {
    fetchPlans();
  };

  const fetchPlans = async () => {
    try {
      const params: any = {};
      if (teacher) params.teacher = teacher;
      // fetch plans for the teacher
      const res = await authClient.get('/api/admin/lesson-plans/', { params });
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setPlans(items);
    } catch (error: any) {
      console.error('Failed to fetch lesson plans', error);
      toast({ title: 'Error', description: 'Failed to fetch lesson plans', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const res = await authClient.get('/api/admin/teachers/');
        setTeachersList(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (error: any) {
        console.error('Failed to load teachers', error);
        toast({ title: 'Error', description: 'Failed to load teachers', variant: 'destructive' });
      }
    };
    loadTeachers();
  }, []);

  const weekNumber = (() => {
    // ISO week number approximation for display — not critical to be exact here
    const oneJan = new Date(weekStart.getFullYear(),0,1);
    const daysSince = Math.floor((weekStart.getTime() - oneJan.getTime()) / (24*60*60*1000));
    return Math.ceil((daysSince + oneJan.getDay()+1)/7);
  })();

  return (
    <DashboardLayout title="Lesson Plan Create" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground block mb-1">TEACHER *</label>
                <Select onValueChange={(v) => setTeacher(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersList.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.user?.first_name} {t.user?.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end justify-end">
                <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSearch}>🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Week {weekNumber} | {weekStart.getFullYear()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-2">
              <button className="text-gray-400 mr-4" onClick={handlePrevWeek}>‹</button>
              <div className="text-sm text-purple-600">&lt; Week {weekNumber} | {weekStart.getFullYear()} &gt;</div>
              <button className="text-gray-400 ml-4" onClick={handleNextWeek}>›</button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground bg-gray-50 rounded p-4">
              {weekDates.map((d, idx) => (
                <div key={idx} className="py-3">
                  <div className="font-semibold text-[11px]">{days[idx]}</div>
                  <div className="text-[11px] mt-1">{formatShortDate(d)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlan;
