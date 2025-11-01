import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import authClient from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

const StudentExport = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/export");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCsv = async () => {
    try {
      setLoading(true);
      const res = await authClient.get('/api/admin/students/', {
        headers: { Accept: 'text/csv' }
      });
      
      // Convert data to CSV
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      const csv = convertToCSV(items);
      
      // Download CSV file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Students exported to CSV successfully',
      });
    } catch (error: any) {
      console.error('Failed to export CSV', error);
      toast({
        title: 'Error',
        description: 'Failed to export to CSV',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePdf = async () => {
    try {
      setLoading(true);
      toast({
        title: 'Info',
        description: 'PDF export feature coming soon',
      });
    } catch (error: any) {
      console.error('Failed to export PDF', error);
      toast({
        title: 'Error',
        description: 'Failed to export to PDF',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = ['ID', 'Name', 'Roll No', 'Class', 'Email', 'Phone', 'Status', 'Enrollment Date'];
    const rows = data.map(s => [
      s.id,
      s.name,
      s.roll_no,
      s.class_name,
      s.email,
      s.phone || '',
      s.status,
      s.enrollment_date
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  return (
    <DashboardLayout title="Student Export" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Student Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-4">
              <div className="flex gap-3">
                <Button 
                  onClick={handleCsv} 
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  {loading ? 'EXPORTING...' : 'EXPORT TO CSV'}
                </Button>
                <Button 
                  onClick={handlePdf} 
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  {loading ? 'EXPORTING...' : 'EXPORT TO PDF'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default StudentExport;
