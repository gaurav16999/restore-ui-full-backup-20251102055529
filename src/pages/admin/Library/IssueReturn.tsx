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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const IssueReturn = () => {
  const sidebarItems = getAdminSidebarItems("/admin/library/issue-return");

  const [rows, setRows] = useState<any[]>([]);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [bookIdInput, setBookIdInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await (await import('@/services/adminApi')).libraryMemberApi.getAll();
        const anyRes: any = res;
        const data = Array.isArray(anyRes) ? anyRes : (anyRes && (anyRes.results ?? anyRes.data)) || [];
        if (mounted) setRows(data as any[]);
      } catch (err) {
        console.error('Failed to load members', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Issue Books" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center text-sm text-muted-foreground">🔍 SEARCH</div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="border rounded-full">📄</Button>
                <Button variant="ghost" className="border rounded-full">📥</Button>
                <Button variant="ghost" className="border rounded-full">📤</Button>
                <Button variant="ghost" className="border rounded-full">🖨️</Button>
                <Button variant="ghost" className="border rounded-full">📑</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Member Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.name ?? '-'}</TableCell>
                      <TableCell>{r.member_type ?? r.type ?? '-'}</TableCell>
                      <TableCell>{r.phone ?? '-'}</TableCell>
                      <TableCell>{r.email ?? '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setSelectedMember(r);
                            setBookIdInput('');
                            setDueDateInput('');
                            setIssueDialogOpen(true);
                          }}
                        >
                          ISSUE
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <Button variant="ghost" className="rounded-full">←</Button>
                <div className="bg-white text-gray-500 px-3 py-1 rounded">1</div>
                <Button variant="ghost" className="rounded-full">→</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issue Dialog */}
        <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Issue Book to {selectedMember?.name ?? selectedMember?.id}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Book ID *</label>
                <Input value={bookIdInput} onChange={(e) => setBookIdInput(e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Due Date (YYYY-MM-DD)</label>
                <Input value={dueDateInput} onChange={(e) => setDueDateInput(e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  const svc = (await import('@/services/adminApi')).bookIssueApi;
                  const payload: any = {
                    book: Number(bookIdInput),
                    member: selectedMember.id,
                    issue_date: new Date().toISOString().slice(0,10),
                  };
                  if (dueDateInput) payload.due_date = dueDateInput;
                  const created = await svc.create(payload);
                  toast({ title: 'Book issued', description: `id ${created.id}` });
                  setIssueDialogOpen(false);
                } catch (err: any) {
                  console.error('Issue failed', err);
                  toast({ title: 'Failed to issue book', variant: 'destructive', description: err?.response?.data?.detail || 'Issue failed' });
                }
              }}>Issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default IssueReturn;
