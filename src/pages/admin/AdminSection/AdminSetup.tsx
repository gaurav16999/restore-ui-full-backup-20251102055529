import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AdminSetup = () => {
  const sidebarItems = getAdminSidebarItems("/admin/admin-section/admin-setup");

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [items, setItems] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    setItems([
      { id: 1, name: "Complaint Type" },
      { id: 2, name: "Source" },
      { id: 3, name: "Reference" },
      { id: 4, name: "Purpose" },
    ]);
  }, []);

  const handleSave = () => {
    if (!name) return;
    const next = { id: items.length + 1, name };
    setItems((s) => [next, ...s]);
    setName("");
    setDescription("");
    setType("");
  };

  return (
    <DashboardLayout
      title="Admin Setup"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Admin Setup</CardTitle>
              <CardDescription>Use this form to create a new admin setup item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>TYPE *</Label>
                  <Select onValueChange={(v) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="type2">Type 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>NAME *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>DESCRIPTION</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex justify-center">
                  <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✓ SAVE SETUP</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Setup List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="h-4 w-4 rounded-full border-2 border-white inline-block" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div>
                      <button className="text-white text-xl font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSetup;
