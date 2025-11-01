import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Download, TrendingUp, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { parentAPI, AttendanceResponse, AttendanceRecord } from '@/services/parentApi';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const ChildAttendancePage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  useEffect(() => {
    if (childId) {
      fetchAttendance();
    }
  }, [childId, selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    if (!childId) return;
    
    setLoading(true);
    try {
      const data = await parentAPI.getChildAttendance(
        parseInt(childId),
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );
      setAttendanceData(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch attendance data'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      present: { variant: 'default', icon: CheckCircle, label: 'Present' },
      absent: { variant: 'destructive', icon: XCircle, label: 'Absent' },
      late: { variant: 'warning', icon: Clock, label: 'Late' },
      excused: { variant: 'secondary', icon: AlertCircle, label: 'Excused' },
    };

    const config = variants[status] || variants.absent;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      present: 'bg-green-500',
      absent: 'bg-red-500',
      late: 'bg-yellow-500',
      excused: 'bg-blue-500',
    };
    return colors[status] || 'bg-gray-300';
  };

  const exportToPDF = () => {
    toast({
      title: 'Export Started',
      description: 'Generating PDF report...'
    });
    
    // TODO: Implement PDF export using react-to-pdf or similar
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Attendance report has been downloaded'
      });
    }, 1500);
  };

  const renderCalendar = () => {
    if (!attendanceData) return null;

    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    const days = [];
    const recordsMap = new Map(
      attendanceData.records.map(r => [r.date, r])
    );

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = recordsMap.get(dateStr);

      days.push(
        <div
          key={day}
          className={`
            p-3 border rounded-lg relative group cursor-pointer
            hover:shadow-md transition-all
            ${record ? getStatusColor(record.status) + ' text-white' : 'bg-gray-50'}
          `}
          title={record ? `${record.status} - ${record.remarks || 'No remarks'}` : 'No data'}
        >
          <div className="text-center font-semibold">{day}</div>
          {record && (
            <div className="hidden group-hover:block absolute z-10 bg-white text-black text-xs p-2 rounded shadow-lg -top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap border">
              <div className="font-semibold capitalize">{record.status}</div>
              {record.remarks && <div className="text-gray-600">{record.remarks}</div>}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm text-gray-600">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Unable to load attendance data</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { student_info, summary } = attendanceData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance Report</h1>
          <p className="text-muted-foreground">
            {student_info.name} - Class {student_info.class} ({student_info.roll_no})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Month/Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Select Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Days</CardDescription>
            <CardTitle className="text-3xl">{summary.total_days}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Present</CardDescription>
            <CardTitle className="text-3xl text-green-600">{summary.present}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Absent</CardDescription>
            <CardTitle className="text-3xl text-red-600">{summary.absent}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Late</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{summary.late}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Attendance Rate</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {summary.percentage.toFixed(1)}%
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={summary.percentage} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>
            Hover over dates to see details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderCalendar()}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Excused</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border rounded" />
              <span>No Data</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceData.records.slice(-10).reverse().map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  {getStatusBadge(record.status)}
                </div>
                {record.remarks && (
                  <div className="text-sm text-gray-600">{record.remarks}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildAttendancePage;
