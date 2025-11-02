import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// simple avatar placeholder (project doesn't have an Avatar component)
import { Textarea } from "@/components/ui/textarea";

const ChatBox = () => {
  const sidebarItems = getAdminSidebarItems("/admin/chat/box");

  return (
    <DashboardLayout title="Chat Box" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chat List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Chat List</CardTitle>
                <CardDescription>
                  <div className="mt-2">
                    <Input placeholder="Search People or Group" />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Group</h3>

                  <div className="flex items-center space-x-3 p-2 rounded hover:bg-muted">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold">e</div>
                    <div className="text-sm">A</div>
                  </div>

                  <div className="text-sm text-success">CREATE GROUP</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Create Group */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Group</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>GROUP NAME *</Label>
                    <Input placeholder="-" />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Label>GROUP PHOTO</Label>
                      <Input placeholder="Group photo" />
                    </div>
                    <div>
                      <Button className="bg-purple-600 text-white">BROWSE</Button>
                    </div>
                  </div>

                  <div>
                    <Label>MEMBER *</Label>
                    <Input placeholder="" />
                  </div>

                  <div className="mt-4">
                    <Button className="bg-purple-600 text-white">CREATE GROUP</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatBox;
