import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { faEnvelope, faUser, faClock, faReply, faChartLine, faBook, faFileText, faUsers, faComments, faAward, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { useLocation } from "react-router-dom";

const StudentMessages = () => {
  const location = useLocation();
  const sidebarItems = getStudentSidebarItems(location.pathname);

  const messages = [
    {
      id: 1,
      from: "Mr. Smith",
      subject: "Math Assignment Feedback",
      content: "Great work on your calculus assignment! Your understanding of derivatives has improved significantly.",
      timestamp: "2 hours ago",
      read: false,
      type: "feedback"
    },
    {
      id: 2,
      from: "Dr. Johnson",
      subject: "Physics Lab Schedule Change",
      content: "The physics lab scheduled for tomorrow has been moved to Friday 2:00 PM due to equipment maintenance.",
      timestamp: "1 day ago",
      read: true,
      type: "announcement"
    },
    {
      id: 3,
      from: "Ms. Davis",
      subject: "Chemistry Quiz Reminder",
      content: "Don't forget about the organic chemistry quiz next Tuesday. Review chapters 8-10.",
      timestamp: "2 days ago",
      read: true,
      type: "reminder"
    }
  ];

  return (
    <DashboardLayout
      title="Student Portal"
      userName="Alex Thompson"
      userRole="Grade 10 Student"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Messages</h2>
            <p className="text-muted-foreground">Communication with teachers</p>
          </div>
          <Button className="w-full md:w-auto">
            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Message</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`cursor-pointer hover:shadow-lg transition-all ${!message.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm md:text-base">{message.from}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {!message.read && <Badge variant="default" className="text-xs">New</Badge>}
                        <Badge variant="outline" className="text-xs">{message.type}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-base md:text-lg line-clamp-2">{message.subject}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                    <FontAwesomeIcon icon={faClock} className="w-3 h-3 md:w-4 md:h-4" />
                    {message.timestamp}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm md:text-base line-clamp-3">{message.content}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    <FontAwesomeIcon icon={faReply} className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    <span className="hidden sm:inline">Mark as Read</span>
                    <span className="sm:hidden">Mark Read</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentMessages;