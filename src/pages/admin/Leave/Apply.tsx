import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const ApplyLeave = () => {
  const sidebarItems = getAdminSidebarItems("/admin/leave/apply");

  const [applyDate, setApplyDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [leaveType, setLeaveType] = useState("");
  const [leaveFrom, setLeaveFrom] = useState<string>(new Date().toISOString().slice(0,10));
  const [leaveTo, setLeaveTo] = useState<string>(new Date().toISOString().slice(0,10));
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState("");

  const [rows] = useState<any[]>([]);

  const handleSave = () => {
    console.log("save apply leave", { applyDate, leaveType, leaveFrom, leaveTo, reason, fileName });
  };

  return (
    <DashboardLayout title="Apply Leave" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Remaining Leaves</CardTitle>
            <CardDescription>
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TYPE</TableHead>
                      <TableHead>REMAINING DAYS</TableHead>
                      <TableHead>EXTRA TAKEN</TableHead>
                      <TableHead>LEAVE TAKEN</TableHead>
                      <TableHead>LEAVE DAYS</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Apply Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>APPLY DATE *</Label>
                    <Input type="date" value={applyDate} onChange={(e) => setApplyDate(e.target.value)} />
                  </div>

                  <div>
                    <Label>Leave Type *</Label>
                    <Select onValueChange={(v) => setLeaveType(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Leave Type *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>LEAVE FROM *</Label>
                    <Input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} />
                  </div>

                  <div>
                    <Label>LEAVE TO *</Label>
                    <Input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} />
                  </div>

                  <div>
                    <Label>REASON</Label>
                    <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
                  </div>

                  <div>
                    <Label>File</Label>
                    <div className="flex items-center">
                      <Input value={fileName} readOnly placeholder="" />
                      <label className="ml-3">
                        <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
                        <Button className="ml-2 bg-purple-600 border-transparent text-white">BROWSE</Button>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button className="bg-purple-600 border-transparent text-white w-full" onClick={handleSave}>✓ SAVE APPLY LEAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Leave List</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input placeholder=" SEARCH" className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="inline-flex items-center space-x-2">
                      <Button variant="outline">⎘</Button>
                      <Button variant="outline">⎙</Button>
                      <Button variant="outline">▣</Button>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Apply Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No Data Available In Table</TableCell>
                      </TableRow>
                    ) : rows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{r.type}</TableCell>
                        <TableCell>{r.from}</TableCell>
                        <TableCell>{r.to}</TableCell>
                        <TableCell>{r.applyDate}</TableCell>
                        <TableCell>{r.status}</TableCell>
                        <TableCell>{/* actions */}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 0 to {rows.length} of {rows.length} entries</div>
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center space-x-2">
                    <Button variant="ghost" className="rounded-full">←</Button>
                    <div className="bg-purple-600 text-white px-3 py-1 rounded">1</div>
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

export default ApplyLeave;
