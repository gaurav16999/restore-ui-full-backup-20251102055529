import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAdminSidebarItems } from '@/lib/adminSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { phoneCallLogApi, type PhoneCallLog } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const PhoneCallLogPage = () => {
  const sidebarItems = getAdminSidebarItems('/admin/admin-section/phone-call-log');
  const { toast } = useToast();
  const [logs, setLogs] = useState<PhoneCallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await phoneCallLogApi.getAll();
      if (Array.isArray(data)) {
        setLogs(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setLogs((data as any).results);
      } else {
        console.error('Expected array but got:', data);
        setLogs([]);
      }
    } catch (error) {
      console.error('Error loading phone call logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title='Phone Call Log' userName='Admin' userRole='Administrator' sidebarItems={sidebarItems}>
      <Card>
        <CardHeader><CardTitle>Phone Call Log</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center py-12'><Loader2 className='h-8 w-8 animate-spin' /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Call Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(logs) && logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.name}</TableCell>
                      <TableCell>{log.phone}</TableCell>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.call_duration}</TableCell>
                      <TableCell>{log.call_type}</TableCell>
                      <TableCell>{log.description}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No phone call logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PhoneCallLogPage;
