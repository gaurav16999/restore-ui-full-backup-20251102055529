import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const sidebarItems = getAdminSidebarItems("/admin/behaviour-records/settings");

  const [commentOption, setCommentOption] = useState<"student" | "parent">("parent");
  const [viewOption, setViewOption] = useState<"student" | "parent">("student");
  const [settingId, setSettingId] = useState<number | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await (await import('@/services/adminApi')).behaviourSettingsApi.getAll();
      const list = Array.isArray(data) ? data : (data as any)?.results || [];
      if (list.length) {
        const s = list[0];
        setSettingId(s.id);
        setCommentOption(s.comment_option || 'parent');
        setViewOption(s.view_option || 'student');
      }
    } catch (err) {
      console.error('Failed to load behaviour settings', err);
    }
  };

  const saveSettings = async () => {
    try {
      const api = (await import('@/services/adminApi')).behaviourSettingsApi;
      const payload = { comment_option: commentOption, view_option: viewOption };
      if (settingId) {
        await api.update(settingId, payload);
      } else {
        const created = await api.create(payload as any);
        setSettingId(created.id);
      }
      alert('Saved');
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings');
    }
  };

  const saveComment = () => {
    console.log("save comment option", commentOption);
  };

  const saveView = () => {
    console.log("save view option", viewOption);
  };

  return (
    <DashboardLayout title="Setting" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Comment Setting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="comment"
                      value="student"
                      checked={commentOption === "student"}
                      onChange={() => setCommentOption("student")}
                    />
                    <span className="text-sm text-muted-foreground">Student Comment</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="comment"
                      value="parent"
                      checked={commentOption === "parent"}
                      onChange={() => setCommentOption("parent")}
                    />
                    <span className="text-sm text-muted-foreground">Parent Comment</span>
                  </label>
                </div>

                <div>
                  <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={saveComment}>SAVE</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incident View Setting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="view"
                      value="student"
                      checked={viewOption === "student"}
                      onChange={() => setViewOption("student")}
                    />
                    <span className="text-sm text-muted-foreground">Student View</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="view"
                      value="parent"
                      checked={viewOption === "parent"}
                      onChange={() => setViewOption("parent")}
                    />
                    <span className="text-sm text-muted-foreground">Parent View</span>
                  </label>
                </div>

                <div>
                  <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={saveView}>SAVE</Button>
                </div>
                <div className="mt-4">
                  <Button className="bg-gray-600 border-transparent text-white hover:bg-gray-700" onClick={saveSettings}>Save Behaviour Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default Settings;
