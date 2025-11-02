import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { chatBlockedUserApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BlockedUser = () => {
  const sidebarItems = getAdminSidebarItems("/admin/chat/blocked-user");
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const { toast } = useToast();

  async function loadData() {
    try {
      const data = await chatBlockedUserApi.getAll();
      setBlockedUsers(data || []);
    } catch (err) {
      console.error('Failed to load blocked users', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUnblock(id: number) {
    try {
      await chatBlockedUserApi.delete(id);
      toast({ title: 'Success', description: 'User unblocked successfully' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to unblock user', variant: 'destructive' });
    }
  }

  return (
    <DashboardLayout title="Blocked User" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Blocked User</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-sm font-medium mb-3">People</h3>
            {blockedUsers.length === 0 ? (
              <div className="mt-2 text-muted-foreground">No User Found!</div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="text-sm font-medium">User #{u.blocked_user}</div>
                      <div className="text-xs text-muted-foreground">{u.reason || 'No reason provided'}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleUnblock(u.id)}>
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BlockedUser;
