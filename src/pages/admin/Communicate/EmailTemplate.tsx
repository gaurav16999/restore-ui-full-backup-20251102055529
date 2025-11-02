import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { emailTemplateApi } from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";

const EmailTemplate = () => {
  const sidebarItems = getAdminSidebarItems("/admin/communicate/email-template");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();

  async function loadData() {
    try {
      const data = await emailTemplateApi.getAll();
      setTemplates(data || []);
      if (data && data.length > 0) {
        setSelected(data[0]);
        setSubject(data[0].subject || '');
        setBody(data[0].body || '');
        setIsActive(data[0].is_active ?? true);
      }
    } catch (err) {
      console.error('Failed to load email templates', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function selectTemplate(t: any) {
    setSelected(t);
    setSubject(t.subject || '');
    setBody(t.body || '');
    setIsActive(t.is_active ?? true);
  }

  async function handleUpdate() {
    if (!selected) return;
    try {
      await emailTemplateApi.partialUpdate(selected.id, {
        subject,
        body,
        is_active: isActive
      });
      toast({ title: 'Success', description: 'Template updated successfully' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update template', variant: 'destructive' });
    }
  }

  return (
    <DashboardLayout title="Email Template" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left list */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => selectTemplate(t)}
                      className={`block w-full text-left px-3 py-2 rounded hover:bg-muted ${selected?.id === t.id ? 'text-primary bg-muted' : 'text-muted-foreground'}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right editor */}
          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Email Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Variables: [user_name], [school_name]</div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="form-checkbox text-purple-600"
                        />
                        <span className="text-sm">Enable</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>SUBJECT *</Label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>

                  <div>
                    <Label>BODY</Label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={12}
                      placeholder="Enter email body content..."
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button className="bg-purple-600 text-white" onClick={handleUpdate} disabled={!selected}>
                      ✓ UPDATE
                    </Button>
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

export default EmailTemplate;
