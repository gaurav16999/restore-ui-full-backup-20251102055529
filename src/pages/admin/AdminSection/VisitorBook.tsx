import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAdminSidebarItems } from '@/lib/adminSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { visitorBookApi, type VisitorBook } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const VisitorBookPage = () => {
  const sidebarItems = getAdminSidebarItems('/admin/admin-section/visitor-book');
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<VisitorBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await visitorBookApi.getAll();
      if (Array.isArray(data)) {
        setVisitors(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setVisitors((data as any).results);
      } else {
        console.error('Expected array but got:', data);
        setVisitors([]);
      }
    } catch (error) {
      console.error('Error loading visitor book:', error);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title='Visitor Book' userName='Admin' userRole='Administrator' sidebarItems={sidebarItems}>
      <Card>
        <CardHeader><CardTitle>Visitor Book</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center py-12'><Loader2 className='h-8 w-8 animate-spin' /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>No of Person</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>In Time</TableHead>
                  <TableHead>Out Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(visitors) && visitors.length > 0 ? (
                  visitors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.purpose}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.phone}</TableCell>
                      <TableCell>{v.no_of_person}</TableCell>
                      <TableCell>{v.date}</TableCell>
                      <TableCell>{v.in_time}</TableCell>
                      <TableCell>{v.out_time}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No visitors found
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

export default VisitorBookPage;
