import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAdminSidebarItems } from '@/lib/adminSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { admissionQueryApi, type AdmissionQuery } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';

const AdmissionQueryPage = () => {
  const sidebarItems = getAdminSidebarItems('/admin/admin-section/admission-query');
  const { toast } = useToast();
  const [queries, setQueries] = useState<AdmissionQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await admissionQueryApi.getAll();
      // Handle paginated response
      if (Array.isArray(data)) {
        setQueries(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        // Paginated response from Django REST Framework
        setQueries((data as any).results);
      } else {
        console.error('Expected array or paginated response but got:', data);
        setQueries([]);
      }
    } catch (error) {
      console.error('Error loading admission queries:', error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title='Admission Query' userName='Admin' userRole='Administrator' sidebarItems={sidebarItems}>
      <Card>
        <CardHeader><CardTitle>Admission Query</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center py-12'><Loader2 className='h-8 w-8 animate-spin' /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Query Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(queries) && queries.length > 0 ? (
                  queries.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>{q.name}</TableCell>
                      <TableCell>{q.phone}</TableCell>
                      <TableCell>{q.email}</TableCell>
                      <TableCell>{q.source}</TableCell>
                      <TableCell>{q.query_date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No admission queries found
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

export default AdmissionQueryPage;
