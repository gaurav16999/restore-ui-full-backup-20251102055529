import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAdminSidebarItems } from '@/lib/adminSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { postalDispatchApi, type PostalDispatch } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const PostalDispatchPage = () => {
  const sidebarItems = getAdminSidebarItems('/admin/admin-section/postal-dispatch');
  const { toast } = useToast();
  const [items, setItems] = useState<PostalDispatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await postalDispatchApi.getAll();
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setItems((data as any).results);
      } else {
        console.error('Expected array but got:', data);
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading postal dispatch:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title='Postal Dispatch' userName='Admin' userRole='Administrator' sidebarItems={sidebarItems}>
      <Card>
        <CardHeader><CardTitle>Postal Dispatch</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center py-12'><Loader2 className='h-8 w-8 animate-spin' /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To Title</TableHead>
                  <TableHead>Reference No</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>From Title</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(items) && items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.to_title}</TableCell>
                      <TableCell>{item.reference_no}</TableCell>
                      <TableCell>{item.address}</TableCell>
                      <TableCell>{item.from_title}</TableCell>
                      <TableCell>{item.date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No postal dispatch records found
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

export default PostalDispatchPage;
