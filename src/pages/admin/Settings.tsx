import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCog, 
  faSchool, 
  faBell, 
  faShield, 
  faEnvelope,
  faPalette,
  faLanguage,
  faCalendar,
  faClock,
  faDatabase,
  faDownload,
  faUpload,
  faSave,
  faRotateLeft,
  faGlobe,
  faKey,
  faServer,
  faCloudUpload
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [schoolInfo, setSchoolInfo] = useState({
    name: "EduManage School",
    address: "123 Education Street, Learning City, LC 12345",
    phone: "+1 (555) 123-4567",
    email: "contact@edumanage.school",
    website: "https://edumanage.school",
    principal: "Dr. Sarah Johnson",
    established: "1985",
    logo: ""
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    gradeAlerts: true,
    attendanceAlerts: true,
    paymentReminders: true
  });

  const [systemSettings, setSystemSettings] = useState({
    timezone: "America/New_York",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    academicYear: "2024-2025",
    sessionTimeout: "30",
    maxFileSize: "10",
    backupFrequency: "daily"
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",
    username: "noreply@edumanage.school",
    password: "",
    encryption: "TLS",
    fromName: "EduManage School"
  });

  const { toast } = useToast();
  const sidebarItems = getAdminSidebarItems("/admin/settings");

  const handleSaveSchoolInfo = () => {
    toast({
      title: "School Information Updated",
      description: "School details have been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Notification preferences have been saved successfully.",
    });
  };

  const handleSaveSystemSettings = () => {
    toast({
      title: "System Settings Updated",
      description: "System configuration has been saved successfully.",
    });
  };

  const handleSaveEmailSettings = () => {
    toast({
      title: "Email Settings Updated",
      description: "Email configuration has been saved successfully.",
    });
  };

  const handleBackupDatabase = () => {
    toast({
      title: "Backup Started",
      description: "Database backup is in progress. You will be notified when complete.",
    });
  };

  const handleRestoreDatabase = () => {
    toast({
      title: "Restore Initiated",
      description: "Database restore process has been started.",
    });
  };

  return (
    <DashboardLayout
      title="Settings"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">System Settings</h2>
            <p className="text-muted-foreground">Configure system preferences and school information</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export Settings
            </Button>
            <Button variant="outline">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Import Settings
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="school" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="school">School Info</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="school" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSchool} />
                  School Information
                </CardTitle>
                <CardDescription>Update school details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      value={schoolInfo.name}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="principal">Principal</Label>
                    <Input
                      id="principal"
                      value={schoolInfo.principal}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, principal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={schoolInfo.phone}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={schoolInfo.email}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={schoolInfo.website}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="established">Year Established</Label>
                    <Input
                      id="established"
                      value={schoolInfo.established}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, established: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={schoolInfo.address}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">School Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input id="logo" type="file" accept="image/*" />
                    <Button variant="outline">
                      <FontAwesomeIcon icon={faUpload} className="mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">
                    <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveSchoolInfo}>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCog} />
                  System Configuration
                </CardTitle>
                <CardDescription>Configure system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({ ...systemSettings, timezone: value })}>
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
                    <Label htmlFor="language">Default Language</Label>
                    <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings({ ...systemSettings, language: value })}>
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
                    <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings({ ...systemSettings, dateFormat: value })}>
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
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={systemSettings.academicYear}
                      onChange={(e) => setSystemSettings({ ...systemSettings, academicYear: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maxFileSize: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">
                    <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveSystemSettings}>
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
                <CardDescription>Configure notification preferences and alerts</CardDescription>
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
                      <h4 className="font-semibold">Weekly Reports</h4>
                      <p className="text-sm text-muted-foreground">Automated weekly summary reports</p>
                    </div>
                    <Switch 
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Grade Alerts</h4>
                      <p className="text-sm text-muted-foreground">Notify when grades are updated</p>
                    </div>
                    <Switch 
                      checked={notifications.gradeAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, gradeAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Attendance Alerts</h4>
                      <p className="text-sm text-muted-foreground">Notify for attendance issues</p>
                    </div>
                    <Switch 
                      checked={notifications.attendanceAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, attendanceAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Payment Reminders</h4>
                      <p className="text-sm text-muted-foreground">Automated fee payment reminders</p>
                    </div>
                    <Switch 
                      checked={notifications.paymentReminders}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReminders: checked })}
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

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Email Configuration
                </CardTitle>
                <CardDescription>Configure SMTP settings for sending emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      value={emailSettings.smtpServer}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpServer: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={emailSettings.username}
                      onChange={(e) => setEmailSettings({ ...emailSettings, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={emailSettings.password}
                      onChange={(e) => setEmailSettings({ ...emailSettings, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="encryption">Encryption</Label>
                    <Select value={emailSettings.encryption} onValueChange={(value) => setEmailSettings({ ...emailSettings, encryption: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TLS">TLS</SelectItem>
                        <SelectItem value="SSL">SSL</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <Button variant="outline">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    Test Connection
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                      Reset
                    </Button>
                    <Button onClick={handleSaveEmailSettings}>
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      Save Changes
                    </Button>
                  </div>
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
                <CardDescription>Configure security policies and access controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faShield} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Security Configuration</h3>
                  <p className="text-muted-foreground mb-4">Configure password policies, access controls, and security protocols</p>
                  <Button>
                    <FontAwesomeIcon icon={faKey} className="mr-2" />
                    Configure Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faDatabase} />
                  Backup & Restore
                </CardTitle>
                <CardDescription>Manage database backups and system restore points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCloudUpload} />
                      Create Backup
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">Create a complete backup of the database and system files</p>
                    <Button onClick={handleBackupDatabase} className="w-full">
                      <FontAwesomeIcon icon={faDownload} className="mr-2" />
                      Start Backup
                    </Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUpload} />
                      Restore System
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">Restore system from a previous backup file</p>
                    <div className="space-y-2">
                      <Input type="file" accept=".sql,.zip" />
                      <Button onClick={handleRestoreDatabase} variant="outline" className="w-full">
                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                        Restore Backup
                      </Button>
                    </div>
                  </Card>
                </div>
                
                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Recent Backups</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">backup_2024_10_16.sql</span>
                        <span className="text-sm text-muted-foreground ml-2">Today, 2:00 AM</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FontAwesomeIcon icon={faDownload} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FontAwesomeIcon icon={faUpload} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">backup_2024_10_15.sql</span>
                        <span className="text-sm text-muted-foreground ml-2">Yesterday, 2:00 AM</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FontAwesomeIcon icon={faDownload} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FontAwesomeIcon icon={faUpload} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;