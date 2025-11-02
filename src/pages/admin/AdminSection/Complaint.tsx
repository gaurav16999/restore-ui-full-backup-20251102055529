import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAdminSidebarItems } from '@/lib/adminSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { complaintApi, type Complaint } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ComplaintPage = () => {
  const sidebarItems = getAdminSidebarItems('/admin/admin-section/complaint');
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await complaintApi.getAll();
      if (Array.isArray(data)) {
        setComplaints(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setComplaints((data as any).results);
      } else {
        console.error('Expected array but got:', data);
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title='Complaint' userName='Admin' userRole='Administrator' sidebarItems={sidebarItems}>
      <Card>
        <CardHeader><CardTitle>Complaints</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center py-12'><Loader2 className='h-8 w-8 animate-spin' /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint By</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(complaints) && complaints.length > 0 ? (
                  complaints.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.complaint_by}</TableCell>
                      <TableCell>{c.complaint_type}</TableCell>
                      <TableCell>{c.source}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{c.date}</TableCell>
                      <TableCell>{c.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No complaints found
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

export default ComplaintPage;
