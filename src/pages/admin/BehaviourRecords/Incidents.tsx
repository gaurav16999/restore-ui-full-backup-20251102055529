import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const Incidents: React.FC = () => {
  const sidebarItems = getAdminSidebarItems("/admin/behaviour-records/incidents");
  const [incidentTypes, setIncidentTypes] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIncidentTypes();
  }, []);

  const loadIncidentTypes = async () => {
    try {
      setLoading(true);
      const data = await (await import('@/services/adminApi')).incidentTypeApi.getAll();
      // If paginated, extract results
      const list = Array.isArray(data) ? data : (data as any)?.results || [];
      setIncidentTypes(list);
    } catch (err: any) {
      console.error('Failed to load incident types', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const title = window.prompt('Incident title (e.g., Fighting)');
    if (!title) return;
    const pointStr = window.prompt('Points (e.g., -1 or 1)');
    const point = pointStr ? parseInt(pointStr, 10) : 0;
    try {
      const api = (await import('@/services/adminApi')).incidentTypeApi;
      await api.create({ title: title.trim(), point, description: '' });
      loadIncidentTypes();
    } catch (err) {
      console.error('Failed to create incident type', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this incident type?')) return;
    try {
      const api = (await import('@/services/adminApi')).incidentTypeApi;
      await api.delete(id);
      loadIncidentTypes();
    } catch (err) {
      console.error('Failed to delete incident type', err);
    }
  };

  return (
    <DashboardLayout title="Incidents" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleAdd} className="bg-purple-600 border-transparent text-white hover:bg-purple-700">+ ADD</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Incident List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3 text-sm text-muted-foreground">🔍 SEARCH</div>
              <div className="flex space-x-2">
                <Button variant="ghost" className="border rounded-full">📄</Button>
                <Button variant="ghost" className="border rounded-full">📥</Button>
                <Button variant="ghost" className="border rounded-full">📤</Button>
                <Button variant="ghost" className="border rounded-full">🖨️</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Point</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidentTypes.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.point}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>
                      <div className="inline-flex space-x-2">
                        <Button variant="outline" className="rounded-full" onClick={() => handleDelete(r.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing {incidentTypes.length} entries</div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default Incidents;
