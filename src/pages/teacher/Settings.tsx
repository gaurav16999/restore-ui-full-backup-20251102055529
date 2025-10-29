import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCog, 
  faUser, 
  faBell, 
  faShield, 
  faEnvelope,
  faPalette,
  faLanguage,
  faCalendar,
  faClock,
  faSave,
  faRotateLeft,
  faKey,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { getTeacherSidebarItems } from "@/lib/teacherSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const TeacherSettings = () => {
  const [profileInfo, setProfileInfo] = useState({
    firstName: "Michael",
    lastName: "Anderson",
    email: "michael.anderson@school.edu",
    phone: "+1 (555) 123-4567",
    department: "Mathematics & Physics",
    bio: "Senior teacher with 15+ years of experience in mathematics and physics education. Passionate about helping students discover the beauty of science and mathematics.",
    office: "Room 204, Science Building",
    officeHours: "Mon-Fri 2:00-4:00 PM",
    avatar: ""
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    assignmentReminders: true,
    gradeAlerts: true,
    parentMessages: true,
    adminNotifications: true,
    calendarReminders: true
  });

  const [preferences, setPreferences] = useState({
    timezone: "America/New_York",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    theme: "light",
    autoSave: true,
    defaultGradeFormat: "percentage",
    classListView: "grid",
    emailSignature: "Best regards,\nProf. Michael Anderson\nMathematics & Physics Department"
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "30",
    lastPasswordChange: "2024-09-15"
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();
  const sidebarItems = getTeacherSidebarItems("/teacher/settings");

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved successfully.",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences Updated",
      description: "Your application preferences have been saved successfully.",
    });
  };

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation password do not match.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    
    setSecurity({
      ...security,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <DashboardLayout
      title="Settings"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground">Manage your account preferences and settings</p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileInfo.firstName}
                      onChange={(e) => setProfileInfo({ ...profileInfo, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileInfo.lastName}
                      onChange={(e) => setProfileInfo({ ...profileInfo, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileInfo.email}
                      onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileInfo.phone}
                      onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profileInfo.department}
                      onChange={(e) => setProfileInfo({ ...profileInfo, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="office">Office Location</Label>
                    <Input
                      id="office"
                      value={profileInfo.office}
                      onChange={(e) => setProfileInfo({ ...profileInfo, office: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officeHours">Office Hours</Label>
                  <Input
                    id="officeHours"
                    value={profileInfo.officeHours}
                    onChange={(e) => setProfileInfo({ ...profileInfo, officeHours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileInfo.bio}
                    onChange={(e) => setProfileInfo({ ...profileInfo, bio: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Input id="avatar" type="file" accept="image/*" />
                    <Button variant="outline">Upload Photo</Button>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">
                    <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBell} />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how you receive notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
                    </div>
                    <Switch 
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch 
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Assignment Reminders</h4>
                      <p className="text-sm text-muted-foreground">Reminders for assignment due dates</p>
                    </div>
                    <Switch 
                      checked={notifications.assignmentReminders}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, assignmentReminders: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Grade Alerts</h4>
                      <p className="text-sm text-muted-foreground">Notify when grades need attention</p>
                    </div>
                    <Switch 
                      checked={notifications.gradeAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, gradeAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Parent Messages</h4>
                      <p className="text-sm text-muted-foreground">Notify for new parent messages</p>
                    </div>
                    <Switch 
                      checked={notifications.parentMessages}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, parentMessages: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Administrative Notifications</h4>
                      <p className="text-sm text-muted-foreground">Important school announcements</p>
                    </div>
                    <Switch 
                      checked={notifications.adminNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, adminNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Calendar Reminders</h4>
                      <p className="text-sm text-muted-foreground">Upcoming events and meetings</p>
                    </div>
                    <Switch 
                      checked={notifications.calendarReminders}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, calendarReminders: checked })}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">
                    <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveNotifications}>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faPalette} />
                  Application Preferences
                </CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={preferences.timezone} onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => setPreferences({ ...preferences, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={preferences.theme} onValueChange={(value) => setPreferences({ ...preferences, theme: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradeFormat">Default Grade Format</Label>
                    <Select value={preferences.defaultGradeFormat} onValueChange={(value) => setPreferences({ ...preferences, defaultGradeFormat: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (85%)</SelectItem>
                        <SelectItem value="letter">Letter Grade (B+)</SelectItem>
                        <SelectItem value="points">Points (85/100)</SelectItem>
                        <SelectItem value="gpa">GPA (3.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classView">Class List View</Label>
                    <Select value={preferences.classListView} onValueChange={(value) => setPreferences({ ...preferences, classListView: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid View</SelectItem>
                        <SelectItem value="list">List View</SelectItem>
                        <SelectItem value="table">Table View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Auto-save</h4>
                    <p className="text-sm text-muted-foreground">Automatically save your work</p>
                  </div>
                  <Switch 
                    checked={preferences.autoSave}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, autoSave: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailSignature">Email Signature</Label>
                  <Textarea
                    id="emailSignature"
                    value={preferences.emailSignature}
                    onChange={(e) => setPreferences({ ...preferences, emailSignature: e.target.value })}
                    rows={4}
                  />
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">
                    <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                    Reset
                  </Button>
                  <Button onClick={handleSavePreferences}>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faShield} />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Change Password</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={security.currentPassword}
                          onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={security.newPassword}
                          onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleChangePassword} className="w-fit">
                      <FontAwesomeIcon icon={faKey} className="mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch 
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last password change: {security.lastPasswordChange}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeacherSettings;