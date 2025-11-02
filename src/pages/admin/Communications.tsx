import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bell, MessageSquare, Megaphone, Send, Mail } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

interface Announcement {
  id: number;
  title: string;
  content: string;
  announcement_type: string;
  priority: string;
  target_audience: string;
  published_date: string;
  expiry_date: string;
  is_active: boolean;
  created_by_name: string;
}

interface Message {
  id: number;
  subject: string;
  body: string;
  sender_name: string;
  recipient_name: string;
  sent_at: string;
  is_read: boolean;
  parent_message: number | null;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  recipient_name: string;
  is_read: boolean;
  created_at: string;
}

const Communications = () => {
  const [activeTab, setActiveTab] = useState("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const { toast } = useToast();

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    priority: 'medium',
    target_audience: 'all',
    expiry_date: ''
  });

  const [messageForm, setMessageForm] = useState({
    recipient: '',
    subject: '',
    body: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [announcementsRes, messagesRes, notificationsRes, usersRes] = await Promise.all([
        authClient.get('/api/admin/announcements/'),
        authClient.get('/api/admin/messages/'),
        authClient.get('/api/admin/notifications-v2/'),
        authClient.get('/api/admin/users/')
      ]);

      setAnnouncements(Array.isArray(announcementsRes.data) ? announcementsRes.data : announcementsRes.data.results || []);
      setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : messagesRes.data.results || []);
      setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : notificationsRes.data.results || []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.results || []);
    } catch (error: any) {
      console.error('Failed to fetch communication data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch communication data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.post('/api/admin/announcements/', announcementForm);
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      setIsAnnouncementDialogOpen(false);
      fetchData();
      setAnnouncementForm({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'medium',
        target_audience: 'all',
        expiry_date: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const handlePublishAnnouncement = async (id: number) => {
    try {
      await authClient.post(`/api/admin/announcements/${id}/publish/`);
      toast({
        title: "Success",
        description: "Announcement published successfully",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to publish announcement",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.post('/api/admin/messages/', messageForm);
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
      setIsMessageDialogOpen(false);
      fetchData();
      setMessageForm({
        recipient: '',
        subject: '',
        body: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await authClient.post(`/api/admin/messages/${messageId}/mark_read/`);
      fetchData();
    } catch (error: any) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await authClient.post('/api/admin/notifications-v2/mark_all_read/');
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getAnnouncementTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-100 text-gray-800",
      academic: "bg-blue-100 text-blue-800",
      event: "bg-purple-100 text-purple-800",
      emergency: "bg-red-100 text-red-800",
      holiday: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const sidebarItems = getAdminSidebarItems("/admin/communications");

  if (loading) {
    return (
      <DashboardLayout
        title="Communications"
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
      title="Communications"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Communications</h1>
            <p className="text-muted-foreground mt-1">Manage announcements, messages, and notifications</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsMessageDialogOpen(true)} variant="outline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              New Message
            </Button>
            <Button onClick={() => setIsAnnouncementDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
              <p className="text-xs text-muted-foreground">
                {announcements.filter(a => a.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">
                {messages.filter(m => !m.is_read).length} unread
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <p className="text-xs text-muted-foreground">
                {notifications.filter(n => !n.is_read).length} unread
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <Mail className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {announcements.filter(a => a.priority === 'high' && a.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Urgent announcements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Announcements</CardTitle>
                <CardDescription>School-wide announcements and notices</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell className="font-medium">{announcement.title}</TableCell>
                        <TableCell>
                          <Badge className={getAnnouncementTypeBadge(announcement.announcement_type)}>
                            {announcement.announcement_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(announcement.priority)}>
                            {announcement.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{announcement.target_audience}</TableCell>
                        <TableCell>
                          {announcement.published_date ? new Date(announcement.published_date).toLocaleDateString() : 'Not published'}
                        </TableCell>
                        <TableCell>
                          {announcement.expiry_date ? new Date(announcement.expiry_date).toLocaleDateString() : 'No expiry'}
                        </TableCell>
                        <TableCell>
                          <Badge className={announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {announcement.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!announcement.published_date && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePublishAnnouncement(announcement.id)}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Publish
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Internal messaging system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id} className={!message.is_read ? 'bg-blue-50' : ''}>
                        <TableCell className="font-medium">{message.sender_name}</TableCell>
                        <TableCell>{message.recipient_name}</TableCell>
                        <TableCell>
                          {message.subject}
                          {!message.is_read && <Badge className="ml-2 bg-blue-600">New</Badge>}
                        </TableCell>
                        <TableCell>{new Date(message.sent_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={message.is_read ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}>
                            {message.is_read ? 'Read' : 'Unread'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!message.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(message.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>System notifications and alerts</CardDescription>
                </div>
                <Button variant="outline" onClick={handleMarkAllNotificationsRead}>
                  Mark All Read
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id} className={!notification.is_read ? 'bg-yellow-50' : ''}>
                        <TableCell className="font-medium">
                          {notification.title}
                          {!notification.is_read && <Bell className="inline-block w-4 h-4 ml-2 text-yellow-600" />}
                        </TableCell>
                        <TableCell className="max-w-md truncate">{notification.message}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {notification.notification_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{notification.recipient_name}</TableCell>
                        <TableCell>{new Date(notification.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={notification.is_read ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}>
                            {notification.is_read ? 'Read' : 'Unread'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Announcement Dialog */}
        <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Broadcast important information to students, teachers, or parents
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                    placeholder="e.g., School Reopening Notice"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                    placeholder="Write your announcement here..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcement-type">Type</Label>
                  <Select value={announcementForm.announcement_type} onValueChange={(value) => setAnnouncementForm({...announcementForm, announcement_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={announcementForm.priority} onValueChange={(value) => setAnnouncementForm({...announcementForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target Audience</Label>
                  <Select value={announcementForm.target_audience} onValueChange={(value) => setAnnouncementForm({...announcementForm, target_audience: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="teachers">Teachers</SelectItem>
                      <SelectItem value="parents">Parents</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={announcementForm.expiry_date}
                    onChange={(e) => setAnnouncementForm({...announcementForm, expiry_date: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Announcement</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Send Message Dialog */}
        <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>
                Send a direct message to a user
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Select value={messageForm.recipient} onValueChange={(value) => setMessageForm({...messageForm, recipient: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.first_name && user.last_name ? `${user.first_name} ${user.last_name} (${user.email})` : user.email || `User ${user.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                  placeholder="Message subject"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={messageForm.body}
                  onChange={(e) => setMessageForm({...messageForm, body: e.target.value})}
                  placeholder="Type your message here..."
                  rows={5}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Communications;
