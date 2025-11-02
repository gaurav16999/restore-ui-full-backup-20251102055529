import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faComments, 
  faPlus,
  faSearch,
  faReply,
  faEnvelope,
  faEnvelopeOpen,
  faUsers,
  faUser,
  faPaperclip,
  faInbox,
  faPaperPlane,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getTeacherSidebarItems } from "@/lib/teacherSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const TeacherMessages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const sidebarItems = getTeacherSidebarItems("/teacher/messages");

  // Mock data for messages
  const messages = [
    {
      id: 1,
      from: "Mary Smith (Parent)",
      to: "Prof. Anderson",
      subject: "Question about John's Math Assignment",
      content: "Dear Prof. Anderson, I wanted to ask about John's recent math assignment. He seems to be struggling with quadratic equations. Could you provide some additional resources or schedule a meeting to discuss his progress?",
      timestamp: "2024-10-16 09:30 AM",
      read: false,
      type: "Parent",
      priority: "Normal",
      attachments: []
    },
    {
      id: 2,
      from: "Dr. Sarah Wilson (Admin)",
      to: "Prof. Anderson",
      subject: "Faculty Meeting - October 20th",
      content: "This is a reminder about the upcoming faculty meeting on October 20th at 3:00 PM in the conference room. We'll be discussing the new grading policies and semester planning.",
      timestamp: "2024-10-15 02:15 PM",
      read: true,
      type: "Admin",
      priority: "High",
      attachments: ["meeting_agenda.pdf"]
    },
    {
      id: 3,
      from: "Emma Johnson (Student)",
      to: "Prof. Anderson",
      subject: "Physics Lab Report Clarification",
      content: "Hello Professor, I have a question about the pendulum motion lab report. Could you clarify what format you'd like for the data analysis section? Thank you!",
      timestamp: "2024-10-15 11:45 AM",
      read: true,
      type: "Student",
      priority: "Normal",
      attachments: []
    },
    {
      id: 4,
      from: "David Brown (Parent)",
      to: "Prof. Anderson",
      subject: "Michael's Chemistry Performance",
      content: "Hi Prof. Anderson, I noticed Michael's recent chemistry grades have been lower than usual. Is there anything we can do at home to help support his learning?",
      timestamp: "2024-10-14 04:20 PM",
      read: false,
      type: "Parent",
      priority: "Normal",
      attachments: []
    }
  ];

  const sentMessages = [
    {
      id: 5,
      from: "Prof. Anderson",
      to: "All Students - 10A Math",
      subject: "Reminder: Assignment Due Tomorrow",
      content: "This is a friendly reminder that your quadratic equations assignment is due tomorrow. Please make sure to show all your work and double-check your answers.",
      timestamp: "2024-10-15 08:00 AM",
      type: "Broadcast",
      recipients: 32
    },
    {
      id: 6,
      from: "Prof. Anderson",
      to: "Lisa Brown (Parent)",
      subject: "Re: Michael's Chemistry Performance",
      content: "Thank you for reaching out. I'd like to schedule a meeting to discuss Michael's progress and create a plan to help him improve. Please let me know your availability.",
      timestamp: "2024-10-14 06:30 PM",
      type: "Individual",
      recipients: 1
    }
  ];

  const unreadCount = messages.filter(msg => !msg.read).length;

  const filteredMessages = messages.filter(message =>
    message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "Parent": return "bg-blue-100 text-blue-800";
      case "Student": return "bg-green-100 text-green-800";
      case "Admin": return "bg-purple-100 text-purple-800";
      case "Broadcast": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Normal": return "bg-gray-100 text-gray-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout
      title="Messages"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Messages</h2>
            <p className="text-muted-foreground">Communicate with students, parents, and staff</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
                <DialogDescription>Send a message to students, parents, or colleagues</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recipient" className="text-right">To</Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select recipient(s)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-10a">All Students - 10A Math</SelectItem>
                      <SelectItem value="all-11b">All Students - 11B Physics</SelectItem>
                      <SelectItem value="all-parents">All Parents</SelectItem>
                      <SelectItem value="individual">Individual Recipient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">Subject</Label>
                  <Input id="subject" className="col-span-3" placeholder="Message subject" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">Priority</Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="message" className="text-right">Message</Label>
                  <Textarea id="message" className="col-span-3" placeholder="Type your message here..." rows={6} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="attachment" className="text-right">Attachment</Label>
                  <Input id="attachment" type="file" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Save Draft</Button>
                <Button type="submit">
                  <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">Need your attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <FontAwesomeIcon icon={faInbox} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentMessages.length}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <FontAwesomeIcon icon={faReply} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">Messages replied</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="inbox" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inbox">
              <FontAwesomeIcon icon={faInbox} className="mr-2" />
              Inbox ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              Sent ({sentMessages.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Messages List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {filteredMessages.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${!message.read ? 'border-blue-200 bg-blue-50' : ''} ${selectedMessage === message.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedMessage(message.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {!message.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                          <h4 className="font-semibold text-sm">{message.from}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className={getMessageTypeColor(message.type)}>
                            {message.type}
                          </Badge>
                          {message.priority === "High" && (
                            <Badge variant="secondary" className={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h5 className="font-medium text-sm mb-1">{message.subject}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        {message.attachments.length > 0 && (
                          <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Message Detail */}
              <div className="lg:sticky lg:top-4">
                {selectedMessage ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Message Details</CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <FontAwesomeIcon icon={faReply} className="mr-1 w-3 h-3" />
                            Reply
                          </Button>
                          <Button size="sm" variant="outline">
                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const message = messages.find(m => m.id === selectedMessage);
                        if (!message) return <p>Message not found</p>;
                        
                        return (
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{message.subject}</h4>
                                <div className="flex gap-1">
                                  <Badge variant="secondary" className={getMessageTypeColor(message.type)}>
                                    {message.type}
                                  </Badge>
                                  {message.priority === "High" && (
                                    <Badge variant="secondary" className={getPriorityColor(message.priority)}>
                                      {message.priority}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">From: {message.from}</p>
                              <p className="text-sm text-muted-foreground">To: {message.to}</p>
                              <p className="text-sm text-muted-foreground">Date: {message.timestamp}</p>
                            </div>
                            
                            <div className="border-t pt-4">
                              <p className="text-sm">{message.content}</p>
                            </div>

                            {message.attachments.length > 0 && (
                              <div className="border-t pt-4">
                                <h5 className="font-medium mb-2">Attachments:</h5>
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3" />
                                    <span>{attachment}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FontAwesomeIcon icon={faEnvelope} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select a message</h3>
                      <p className="text-muted-foreground">Choose a message from the list to view its content</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <div className="space-y-3">
              {sentMessages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{message.subject}</h4>
                      <Badge variant="secondary" className={getMessageTypeColor(message.type)}>
                        {message.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">To: {message.to}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      <span className="text-xs text-muted-foreground">
                        {message.recipients} recipient{message.recipients > 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <div className="space-y-3">
              {messages.filter(msg => !msg.read).map((message) => (
                <Card key={message.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <h4 className="font-semibold text-sm">{message.from}</h4>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className={getMessageTypeColor(message.type)}>
                          {message.type}
                        </Badge>
                        {message.priority === "High" && (
                          <Badge variant="secondary" className={getPriorityColor(message.priority)}>
                            {message.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h5 className="font-medium text-sm mb-1">{message.subject}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      <Button size="sm">
                        <FontAwesomeIcon icon={faEnvelopeOpen} className="mr-1 w-3 h-3" />
                        Mark as Read
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeacherMessages;