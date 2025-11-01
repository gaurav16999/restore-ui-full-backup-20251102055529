import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const IdCard = () => {
  const sidebarItems = getAdminSidebarItems("/admin/admin-section/id-card");

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems([
      { id: 1, title: "fhttfh", role: "Student" },
    ]);
  }, []);

  return (
    <DashboardLayout
      title="Id Card List"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Id Card List</CardTitle>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <div className="flex items-center border-b border-gray-200 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                    </svg>
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" className="border-0 p-0" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1">
                    <button className="text-gray-500">📎</button>
                    <button className="text-gray-500">🖨️</button>
                    <button className="text-gray-500">📄</button>
                    <button className="text-gray-500">▢</button>
                  </div>
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700">+ CREATE ID CARD</Button>
                </div>
              </div>
            </div>
            <CardDescription />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>{it.id}</TableCell>
                    <TableCell className="font-medium">{it.title}</TableCell>
                    <TableCell>{it.role}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">SELECT</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 text-sm text-muted-foreground">Showing 1 to {items.length} of {items.length} entries</div>

            <div className="flex justify-center mt-6">
              <div className="inline-flex items-center gap-4">
                <button className="text-gray-400">‹</button>
                <div className="bg-purple-600 text-white rounded-md p-2 shadow">1</div>
                <button className="text-gray-400">›</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default IdCard;
