import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { colorThemeApi } from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";

const ColorTheme = () => {
  const sidebarItems = getAdminSidebarItems("/admin/style/color-theme");
  const [themes, setThemes] = useState<any[]>([]);
  const { toast } = useToast();

  async function loadData() {
    try {
      const data = await colorThemeApi.getAll();
      setThemes(data || []);
    } catch (err) {
      console.error('Failed to load color themes', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleActivate(id: number) {
    try {
      await colorThemeApi.partialUpdate(id, { is_active: true });
      toast({ title: 'Success', description: 'Theme activated' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to activate theme', variant: 'destructive' });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this theme?')) return;
    try {
      await colorThemeApi.delete(id);
      toast({ title: 'Success', description: 'Theme deleted' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete theme', variant: 'destructive' });
    }
  }

  return (
    <DashboardLayout title="Color Theme" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button className="bg-purple-600 text-white">+ ADD NEW THEME</Button>
              </div>

              <div className="flex-1 flex justify-center">
                <div className="w-1/3">
                  <Input placeholder="SEARCH" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline">⎘</Button>
                <Button variant="outline">⎙</Button>
                <Button variant="outline">▣</Button>
                <Button variant="outline">🖼️</Button>
                <Button variant="outline">▦</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Colors</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No themes found
                    </TableCell>
                  </TableRow>
                ) : (
                  themes.map((theme, idx) => (
                    <TableRow key={theme.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{theme.name}</TableCell>
                      <TableCell>{theme.type || 'Standard'}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 rounded" style={{ background: theme.primary_color || '#415094' }} />
                            <div className="text-xs">{theme.primary_color || '#415094'}</div>
                          </div>
                          {theme.secondary_color && (
                            <div className="flex items-center space-x-2">
                              <div className="h-4 w-4 rounded" style={{ background: theme.secondary_color }} />
                              <div className="text-xs">{theme.secondary_color}</div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-10 w-24 bg-gray-100 rounded" />
                      </TableCell>
                      <TableCell>
                        {theme.is_active ? (
                          <Button className="bg-purple-600 text-white" size="sm">ACTIVE</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleActivate(theme.id)}>Activate</Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(theme.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 1 to 1 of 1 entries</div>

            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <Button variant="ghost" className="rounded-full">←</Button>
                <Button className="bg-purple-600 text-white rounded-full">1</Button>
                <Button variant="ghost" className="rounded-full">→</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ColorTheme;
