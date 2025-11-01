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

const IncidentWiseReport: React.FC = () => {
  const sidebarItems = getAdminSidebarItems("/admin/behaviour-records/incident-wise-report");
  const [counts, setCounts] = useState<Array<{ incident: string; students: number }>>([]);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const incidentsData = await (await import('@/services/adminApi')).studentIncidentApi.getAll();
      const list = Array.isArray(incidentsData) ? incidentsData : (incidentsData as any)?.results || [];
      const map: Record<string, number> = {};
      // fetch incident types to map ids to titles
      const itData = await (await import('@/services/adminApi')).incidentTypeApi.getAll();
      const itList = Array.isArray(itData) ? itData : (itData as any)?.results || [];
      const itMap: Record<number, string> = {};
      itList.forEach((it: any) => { itMap[it.id] = it.title; });
      list.forEach((it: any) => {
        const name = itMap[it.incident_type] || String(it.incident_type);
        map[name] = (map[name] || 0) + 1;
      });
      const out = Object.entries(map).map(([incident, students]) => ({ incident, students }));
      setCounts(out);
    } catch (err) {
      console.error('Failed to load incident counts', err);
    }
  };

  return (
    <DashboardLayout title="Incident Wise Report" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Incident Wise Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">🔍 SEARCH</div>
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
                  <TableHead>Incidents</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">No data</TableCell>
                  </TableRow>
                ) : (
                  counts.map((r) => (
                    <TableRow key={r.incident}>
                      <TableCell>{r.incident}</TableCell>
                      <TableCell>{r.students}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing {counts.length} entries</div>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <Button variant="ghost" className="rounded-full">←</Button>
                <div className="bg-purple-600 text-white px-3 py-1 rounded">1</div>
                <Button variant="ghost" className="rounded-full">→</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default IncidentWiseReport;
