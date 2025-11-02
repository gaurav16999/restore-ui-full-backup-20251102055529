import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Issued = () => {
  const sidebarItems = getAdminSidebarItems("/admin/library/issued");

  const [book, setBook] = useState("");
  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");

  const handleSearch = () => {
    console.log("search issued books", { book, bookId, subject });
  };

  const [rows, setRows] = useState<any[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await (await import('@/services/adminApi')).bookIssueApi.getAll();
        const anyRes: any = res;
        const data = Array.isArray(anyRes) ? anyRes : (anyRes && (anyRes.results ?? anyRes.data)) || [];
        if (mounted) setRows(data as any[]);
      } catch (err) {
        console.error('Failed to load issued books', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Issued Book List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">BOOK</label>
                <Select onValueChange={(v) => setBook(v)} value={book}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Book Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book_1">The Great Gatsby</SelectItem>
                    <SelectItem value="book_2">Mathematics Grade 5</SelectItem>
                    <SelectItem value="book_3">Science Basics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SEARCH BY BOOK ID</label>
                <Input value={bookId} onChange={(e) => setBookId(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SUBJECT</label>
                <Select onValueChange={(v) => setSubject(v)} value={subject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-3 flex justify-end">
                <Button onClick={handleSearch} className="bg-purple-600 text-white">🔍 SEARCH</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Issued Book</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center text-sm text-muted-foreground">🔍 QUICK SEARCH</div>
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
                  <TableHead>Book Title</TableHead>
                  <TableHead>Book No</TableHead>
                  <TableHead>ISBN No</TableHead>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.book_title ?? r.book?.title ?? '-'}</TableCell>
                      <TableCell>{r.book ?? r.book_id ?? '-'}</TableCell>
                      <TableCell>{r.book?.isbn ?? r.isbn ?? '-'}</TableCell>
                      <TableCell>{r.member_name ?? r.member?.name ?? '-'}</TableCell>
                      <TableCell>{r.book?.author ?? r.author ?? '-'}</TableCell>
                      <TableCell>{r.book?.subject ?? '-'}</TableCell>
                      <TableCell>{r.issue_date ?? r.issueDate ?? '-'}</TableCell>
                      <TableCell>{r.return_date ?? r.returnDate ?? '-'}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setSelectedIssue(r);
                            setConfirmDialogOpen(true);
                          }}
                        >
                          RETURN
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

        {/* Confirm Return Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Confirm Return</DialogTitle>
            </DialogHeader>
            <div>
              Are you sure you want to mark the selected book as returned?
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  const svc = (await import('@/services/adminApi')).bookIssueApi;
                  const today = new Date().toISOString().slice(0,10);
                  const updated = await svc.partialUpdate(selectedIssue.id, { return_date: today });
                  setRows(prev => prev.map((it) => (it.id === updated.id ? updated : it)));
                  setConfirmDialogOpen(false);
                  toast({ title: 'Book returned' });
                } catch (err: any) {
                  console.error('Return failed', err);
                  toast({ title: 'Failed to return book', variant: 'destructive', description: err?.response?.data?.detail || 'Return failed' });
                }
              }}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default Issued;
