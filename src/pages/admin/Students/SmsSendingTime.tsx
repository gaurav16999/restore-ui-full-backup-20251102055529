import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

const SmsSendingTime = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/sms-sending-time");
  const { toast } = useToast();

  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    loadTimes();
  }, []);

  const loadTimes = async () => {
    try {
      const res = await authClient.get('/api/admin/sms-sending-times/');
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRows(items);
    } catch (error: any) {
      console.error('Failed to load SMS times', error);
      toast({
        title: 'Error',
        description: 'Failed to load SMS sending times',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!startTime || !status) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await authClient.post('/api/admin/sms-sending-times/', {
        start_time: startTime,
        status: status,
      });
      toast({
        title: 'Success',
        description: 'SMS time setup saved successfully',
      });
      setStartTime("");
      setStatus("");
      loadTimes();
    } catch (error: any) {
      console.error('Failed to save time setup', error);
      toast({
        title: 'Error',
        description: 'Failed to save time setup',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="SMS Sending Time" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700">CRON COMMAND</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Time Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">START TIME *</label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Status *</label>
                  <Select onValueChange={(v) => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>Select Status *</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button className="bg-purple-600 border-transparent text-white hover:bg-purple-700" onClick={handleSave}>✅ SAVE TIME SETUP</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Time Setup List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">🔍 SEARCH</div>
                <div className="flex space-x-2">
                  {/* Placeholder action buttons */}
                  <Button variant="ghost" className="border rounded-full">📄</Button>
                  <Button variant="ghost" className="border rounded-full">📥</Button>
                  <Button variant="ghost" className="border rounded-full">🖨️</Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No Data Available</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.start_time}</TableCell>
                        <TableCell className="capitalize">{r.status}</TableCell>
                        <TableCell>
                          <Button variant="outline" className="rounded-full">SELECT ▾</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 text-sm text-muted-foreground">
                Showing {rows.length > 0 ? 1 : 0} to {rows.length} of {rows.length} entries
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default SmsSendingTime;
