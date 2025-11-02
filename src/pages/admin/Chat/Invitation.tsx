import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { chatInvitationApi } from "@/services/adminApi";

const Invitation = () => {
  const sidebarItems = getAdminSidebarItems("/admin/chat/invitation");
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await chatInvitationApi.getAll();
        if (!mounted) return;
        setInvitations(data || []);
      } catch (err) {
        console.error('Failed to load chat invitations', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const myRequests = invitations.filter(i => i.from_user);
  const receivedRequests = invitations.filter(i => i.to_user);
  const connected = invitations.filter(i => i.status === 'accepted');

  return (
    <DashboardLayout title="Invitation" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Request</CardTitle>
            </CardHeader>
            <CardContent>
              {myRequests.length === 0 ? (
                <div className="text-muted-foreground">No Connection Request Found!</div>
              ) : (
                <div className="space-y-2">
                  {myRequests.map(r => (
                    <div key={r.id} className="p-2 border rounded">
                      <div className="text-sm">{r.message || 'Invitation sent'}</div>
                      <div className="text-xs text-muted-foreground">{r.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>People Request You To Connect</CardTitle>
            </CardHeader>
            <CardContent>
              {receivedRequests.length === 0 ? (
                <div className="text-muted-foreground">No Connection Request Found!</div>
              ) : (
                <div className="space-y-2">
                  {receivedRequests.map(r => (
                    <div key={r.id} className="p-2 border rounded">
                      <div className="text-sm">{r.message || 'Wants to connect'}</div>
                      <div className="text-xs text-muted-foreground">{r.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Connection Connected With You</CardTitle>
            </CardHeader>
            <CardContent>
              {connected.length === 0 ? (
                <div className="text-muted-foreground">No Connection Connected Request Found!</div>
              ) : (
                <div className="space-y-2">
                  {connected.map(r => (
                    <div key={r.id} className="p-2 border rounded">
                      <div className="text-sm">{r.message || 'Connected'}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invitation;
