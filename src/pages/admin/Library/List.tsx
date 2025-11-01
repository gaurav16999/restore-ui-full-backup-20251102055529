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

import adminApi, { Book, bookApi } from '@/services/adminApi';

const BookList = () => {
  const sidebarItems = getAdminSidebarItems("/admin/library/list");

  const [rows, setRows] = useState<Book[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await bookApi.getAll();
        const anyRes: any = res;
        const data = Array.isArray(anyRes) ? anyRes : (anyRes && (anyRes.results ?? anyRes.data)) || [];
        if (mounted) setRows(data as Book[]);
      } catch (err) {
        console.error('Failed to load books', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardLayout title="Book List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Book List</CardTitle>
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
                  <TableHead>SL</TableHead>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Book No</TableHead>
                  <TableHead>ISBN No</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Publisher Name</TableHead>
                  <TableHead>Author Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.isbn}</TableCell>
                      <TableCell>{r.category_title ?? '-'}</TableCell>
                      <TableCell>{r.publisher ?? '-'}</TableCell>
                      <TableCell>{r.author ?? '-'}</TableCell>
                      <TableCell>{r.total_copies ?? r.available_copies ?? '-'}</TableCell>
                      <TableCell>{'-'}</TableCell>
                      <TableCell>
                        <Button variant="outline" className="rounded-full">SELECT ▾</Button>
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

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default BookList;
