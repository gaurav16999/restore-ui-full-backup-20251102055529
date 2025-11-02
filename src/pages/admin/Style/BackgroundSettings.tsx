import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const BackgroundSettings = () => {
  const sidebarItems = getAdminSidebarItems("/admin/style/background-settings");

  return (
    <DashboardLayout title="BackGround Settings" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Add Style */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add Style</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>STYLE *</Label>
                    <div className="mt-2">
                      <select className="w-full border rounded px-3 py-2">
                        <option>Select Position *</option>
                        <option>Dashboard Background</option>
                        <option>Login Background</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>BACKGROUND TYPE *</Label>
                    <div className="mt-2">
                      <select className="w-full border rounded px-3 py-2">
                        <option>BackGround Type *</option>
                        <option>Image</option>
                        <option>Color</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button className="bg-purple-600 text-white">✓ SAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: View */}
          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-1/3">
                    <Input placeholder="SEARCH" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">⎘</Button>
                    <Button variant="outline">⎙</Button>
                    <Button variant="outline">▣</Button>
                    <Button variant="outline">🖼️</Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Dashboard Background</TableCell>
                      <TableCell>
                        <Button variant="outline">IMAGE</Button>
                      </TableCell>
                      <TableCell>
                        <div className="h-16 w-40 rounded overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button className="bg-purple-600 text-white">ACTIVATED</Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline">DISABLE</Button>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Login Background</TableCell>
                      <TableCell>
                        <Button variant="outline">IMAGE</Button>
                      </TableCell>
                      <TableCell>
                        <div className="h-16 w-40 rounded overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-indigo-900 via-purple-700 to-pink-700" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline">MAKE DEFAULT</Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline">SELECT ⤓</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 1 to 2 of 2 entries</div>

                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center space-x-2">
                    <Button variant="ghost" className="rounded-full">←</Button>
                    <Button className="bg-purple-600 text-white rounded-full">1</Button>
                    <Button variant="ghost" className="rounded-full">→</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BackgroundSettings;
