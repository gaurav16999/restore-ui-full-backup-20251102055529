import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import authClient from '@/lib/http';
import { Calendar as CalendarIcon, Download, RefreshCw, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttendanceSummary {
  type: 'student' | 'staff' | 'class';
  student?: {
    id: number;
    name: string;
    class: string;
  };
  employee?: {
    id: number;
    name: string;
    employee_id: string;
  };
  class?: {
    id: number;
    name: string;
    total_students: number;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_days?: number;
    total_students?: number;
    total_records?: number;
    present?: number;
    present_records?: number;
    absent?: number;
    absent_records?: number;
    leave?: number;
    attendance_percentage?: number;
    percentage?: number;
    overall_percentage?: number;
  };
  daily_breakdown?: Array<{
    date: string;
    total_students?: number;
    present?: number;
    absent?: number;
    percentage?: number;
  }>;
}

export default function AttendanceReports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'student' | 'class' | 'staff'>('class');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedId, setSelectedId] = useState<string>('');
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);

  const fetchAttendanceReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select date range');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });

      if (reportType === 'student' && selectedId) {
        params.append('student_id', selectedId);
      } else if (reportType === 'class' && selectedId) {
        params.append('class_id', selectedId);
      } else if (reportType === 'staff' && selectedId) {
        params.append('teacher_id', selectedId);
      }

      const response = await authClient.get(
        `/api/admin/advanced-reports/attendance_summary/?${params.toString()}`
      );
      setAttendanceSummary(response.data);
      toast.success('Attendance report generated');
    } catch (error: any) {
      console.error('Error fetching attendance report:', error);
      toast.error(error.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Reports</h1>
          <p className="text-muted-foreground">
            Track and analyze attendance patterns
          </p>
        </div>
        <Button className="gap-2" onClick={() => window.print()}>
          <Download className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Attendance Report</CardTitle>
          <CardDescription>Select report type and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Attendance</SelectItem>
                  <SelectItem value="class">Class Attendance</SelectItem>
                  <SelectItem value="staff">Staff Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchAttendanceReport} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {attendanceSummary && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {attendanceSummary.type === 'student' && attendanceSummary.student && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Student</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{attendanceSummary.student.name}</div>
                    <p className="text-xs text-muted-foreground">{attendanceSummary.student.class}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceSummary.summary.total_days}</div>
                    <p className="text-xs text-muted-foreground">School days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceSummary.summary.present}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Absent: {attendanceSummary.summary.absent}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={cn('text-2xl font-bold', getAttendanceColor(attendanceSummary.summary.percentage || 0))}>
                      {(attendanceSummary.summary.percentage || 0).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Attendance percentage</p>
                  </CardContent>
                </Card>
              </>
            )}

            {attendanceSummary.type === 'staff' && attendanceSummary.employee && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Employee</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{attendanceSummary.employee.name}</div>
                    <p className="text-xs text-muted-foreground">ID: {attendanceSummary.employee.employee_id}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceSummary.summary.present}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total: {attendanceSummary.summary.total_days}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {attendanceSummary.summary.leave || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Absent: {attendanceSummary.summary.absent}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={cn('text-2xl font-bold', getAttendanceColor(attendanceSummary.summary.attendance_percentage || 0))}>
                      {(attendanceSummary.summary.attendance_percentage || 0).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Overall attendance</p>
                  </CardContent>
                </Card>
              </>
            )}

            {attendanceSummary.type === 'class' && attendanceSummary.class && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{attendanceSummary.class.name}</div>
                    <p className="text-xs text-muted-foreground">
                      {attendanceSummary.class.total_students} students
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceSummary.summary.total_records}</div>
                    <p className="text-xs text-muted-foreground">Attendance entries</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Records</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceSummary.summary.present_records}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Absent: {attendanceSummary.summary.absent_records}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Rate</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={cn('text-2xl font-bold', getAttendanceColor(attendanceSummary.summary.overall_percentage || 0))}>
                      {(attendanceSummary.summary.overall_percentage || 0).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Class attendance</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Daily Breakdown for Class/School */}
          {attendanceSummary.type === 'class' && attendanceSummary.daily_breakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Attendance Breakdown</CardTitle>
                <CardDescription>Day-by-day attendance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total Students</TableHead>
                      <TableHead className="text-right">Present</TableHead>
                      <TableHead className="text-right">Absent</TableHead>
                      <TableHead className="text-right">Attendance %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceSummary.daily_breakdown.map((day, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {format(new Date(day.date), 'EEE, MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">{day.total_students}</TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          {day.present}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-semibold">
                          {day.absent}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={getAttendanceColor(day.percentage || 0)}>
                            {(day.percentage || 0).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAttendanceBadge(day.percentage || 0)}>
                            {(day.percentage || 0) >= 90 ? 'Excellent' :
                             (day.percentage || 0) >= 75 ? 'Good' :
                             (day.percentage || 0) >= 60 ? 'Average' : 'Poor'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
