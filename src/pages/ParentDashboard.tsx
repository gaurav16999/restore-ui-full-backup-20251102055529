import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  ClipboardCheck, 
  MessageSquare, 
  Bell,
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { authClient } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface Child {
  id: number;
  name: string;
  roll_no: string;
  class: string;
  attendance_percentage: number;
  recent_grades_count: number;
  pending_fees_count: number;
  is_active: boolean;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_active: boolean;
}

interface Notification {
  type: string;
  child?: string;
  message: string;
  priority: string;
  date?: string;
}

interface DashboardData {
  children_count: number;
  children: Child[];
  notifications: Notification[];
  announcements: Announcement[];
}

interface ChildSummary {
  student_info: {
    id: number;
    name: string;
    roll_no: string;
    class: string;
    is_active: boolean;
  };
  attendance: {
    total_days: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  grades: {
    average_percentage: number;
    total_grades: number;
    recent_grades: any[];
  };
  exams: {
    total_exams: number;
    average_score: number;
  };
  assignments: {
    total_assigned: number;
    submitted: number;
    graded: number;
    pending: number;
  };
  fees: {
    total_fees: number;
    paid: number;
    pending: number;
    status: string;
  };
}

const ParentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childSummary, setChildSummary] = useState<ChildSummary | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildSummary(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchDashboardData = async () => {
    try {
      const response = await authClient.get('/api/parent/dashboard/');
      setDashboardData(response.data);
      if (response.data.children.length > 0) {
        setSelectedChild(response.data.children[0]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChildSummary = async (childId: number) => {
    setSummaryLoading(true);
    try {
      const response = await authClient.get(`/api/parent/children/${childId}/summary/`);
      setChildSummary(response.data);
    } catch (error) {
      console.error('Error fetching child summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to load child details',
        variant: 'destructive',
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await authClient.get('/api/parent/notifications/');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const viewChildDetails = (childId: number) => {
    navigate(`/parent/children/${childId}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome! Track your children's academic progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/parent/notifications')}>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
            {notifications.length > 0 && (
              <Badge className="ml-2" variant="destructive">{notifications.length}</Badge>
            )}
          </Button>
          <Button onClick={() => navigate('/parent/messages')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.children_count}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.notifications.length}</div>
            <p className="text-xs text-muted-foreground">Unread notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.announcements.length}</div>
            <p className="text-xs text-muted-foreground">Recent announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Children List */}
      <Card>
        <CardHeader>
          <CardTitle>My Children</CardTitle>
          <CardDescription>Overview of your children's academic status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => viewChildDetails(child.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Roll No: {child.roll_no} | Class: {child.class}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">Attendance</p>
                    <Badge variant={child.attendance_percentage >= 75 ? 'default' : 'destructive'}>
                      {child.attendance_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Grades</p>
                    <Badge variant="outline">{child.recent_grades_count}</Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Pending Fees</p>
                    <Badge variant={child.pending_fees_count > 0 ? 'destructive' : 'default'}>
                      {child.pending_fees_count}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      {dashboardData.announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Latest updates from school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.announcements.map((announcement) => (
                <div key={announcement.id} className="p-3 border rounded-lg">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentDashboard;
