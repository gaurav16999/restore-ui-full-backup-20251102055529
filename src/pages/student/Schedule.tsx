import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faClock, faMapMarkerAlt, faUser, faVideo, faCalendarWeek, faCalendarDay, faBook, faChartLine, faFileText, faUsers, faComments, faAward, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentSidebarItems } from "@/lib/studentSidebar";
import { useLocation } from "react-router-dom";

const StudentSchedule = () => {
  const location = useLocation();
  const sidebarItems = getStudentSidebarItems(location.pathname);

  const todaySchedule = [
    {
      id: 1,
      subject: "Mathematics",
      time: "9:00 AM - 10:00 AM",
      room: "Room 201",
      teacher: "Mr. Smith",
      type: "Lecture",
      status: "upcoming",
      color: "bg-blue-500"
    },
    {
      id: 2,
      subject: "Physics",
      time: "10:30 AM - 11:30 AM",
      room: "Lab 3",
      teacher: "Dr. Johnson",
      type: "Lab",
      status: "current",
      color: "bg-green-500"
    },
    {
      id: 3,
      subject: "Chemistry",
      time: "2:00 PM - 3:00 PM",
      room: "Lab 2",
      teacher: "Ms. Davis",
      type: "Practical",
      status: "upcoming",
      color: "bg-purple-500"
    },
    {
      id: 4,
      subject: "English Literature",
      time: "3:30 PM - 4:30 PM",
      room: "Room 105",
      teacher: "Prof. Williams",
      type: "Discussion",
      status: "upcoming",
      color: "bg-orange-500"
    }
  ];

  const weeklySchedule = {
    Monday: [
      { subject: "Mathematics", time: "9:00-10:00", room: "201", teacher: "Mr. Smith", color: "bg-blue-500" },
      { subject: "Physics", time: "10:30-11:30", room: "Lab 3", teacher: "Dr. Johnson", color: "bg-green-500" },
      { subject: "Chemistry", time: "2:00-3:00", room: "Lab 2", teacher: "Ms. Davis", color: "bg-purple-500" },
      { subject: "English", time: "3:30-4:30", room: "105", teacher: "Prof. Williams", color: "bg-orange-500" }
    ],
    Tuesday: [
      { subject: "Physics", time: "9:00-10:00", room: "Lab 3", teacher: "Dr. Johnson", color: "bg-green-500" },
      { subject: "Mathematics", time: "10:30-11:30", room: "201", teacher: "Mr. Smith", color: "bg-blue-500" },
      { subject: "History", time: "2:00-3:00", room: "204", teacher: "Mr. Brown", color: "bg-red-500" },
      { subject: "Art", time: "3:30-4:30", room: "Studio A", teacher: "Ms. White", color: "bg-pink-500" }
    ],
    Wednesday: [
      { subject: "Chemistry", time: "9:00-10:00", room: "Lab 2", teacher: "Ms. Davis", color: "bg-purple-500" },
      { subject: "English", time: "10:30-11:30", room: "105", teacher: "Prof. Williams", color: "bg-orange-500" },
      { subject: "Mathematics", time: "2:00-3:00", room: "201", teacher: "Mr. Smith", color: "bg-blue-500" },
      { subject: "PE", time: "3:30-4:30", room: "Gym", teacher: "Coach Lee", color: "bg-green-600" }
    ],
    Thursday: [
      { subject: "Physics", time: "9:00-10:00", room: "Lab 3", teacher: "Dr. Johnson", color: "bg-green-500" },
      { subject: "History", time: "10:30-11:30", room: "204", teacher: "Mr. Brown", color: "bg-red-500" },
      { subject: "Chemistry", time: "2:00-3:00", room: "Lab 2", teacher: "Ms. Davis", color: "bg-purple-500" },
      { subject: "Music", time: "3:30-4:30", room: "Music Room", teacher: "Ms. Garcia", color: "bg-yellow-500" }
    ],
    Friday: [
      { subject: "Mathematics", time: "9:00-10:00", room: "201", teacher: "Mr. Smith", color: "bg-blue-500" },
      { subject: "English", time: "10:30-11:30", room: "105", teacher: "Prof. Williams", color: "bg-orange-500" },
      { subject: "Free Period", time: "2:00-3:00", room: "-", teacher: "-", color: "bg-gray-400" },
      { subject: "Study Hall", time: "3:30-4:30", room: "Library", teacher: "Ms. Jones", color: "bg-gray-500" }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge className="bg-green-100 text-green-800">Current</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Student Portal"
      userName="Alex Thompson"
      userRole="Grade 10 Student"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Class Schedule</h2>
            <p className="text-muted-foreground">Your daily and weekly class timetable</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Today: {todaySchedule.length} Classes
            </Badge>
          </div>
        </div>

        {/* Schedule Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDay} className="w-4 h-4" />
              Today's Schedule
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarWeek} className="w-4 h-4" />
              Weekly Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarDay} className="w-5 h-5" />
                  Today - October 16, 2025
                </CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySchedule.map((class_item, index) => (
                  <div
                    key={class_item.id}
                    className={`p-4 rounded-lg border-l-4 ${class_item.color} border-l-4 ${
                      class_item.status === 'current' ? 'bg-green-50 border-green-500' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{class_item.subject}</h3>
                          <Badge variant="outline">{class_item.type}</Badge>
                          {getStatusBadge(class_item.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                            <span>{class_item.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                            <span>{class_item.room}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                            <span>{class_item.teacher}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {class_item.status === 'current' && (
                          <Button className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faVideo} className="w-4 h-4" />
                            Join Class
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FontAwesomeIcon icon={faVideo} className="w-6 h-6" />
                    <span>Join Next Class</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FontAwesomeIcon icon={faCalendarWeek} className="w-6 h-6" />
                    <span>View Full Week</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-6 h-6" />
                    <span>Room Locations</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FontAwesomeIcon icon={faUser} className="w-6 h-6" />
                    <span>Contact Teachers</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Your complete weekly timetable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {Object.entries(weeklySchedule).map(([day, classes]) => (
                    <div key={day} className="space-y-3">
                      <h3 className="font-semibold text-lg text-center p-2 bg-muted rounded-lg">
                        {day}
                      </h3>
                      <div className="space-y-2">
                        {classes.map((class_item, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${class_item.color} text-sm`}
                          >
                            <div className="font-medium">{class_item.subject}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                                {class_item.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                                {class_item.room}
                              </div>
                              <div className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faUser} className="w-3 h-3" />
                                {class_item.teacher}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentSchedule;