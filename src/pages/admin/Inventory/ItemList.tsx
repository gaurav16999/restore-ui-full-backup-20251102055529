import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const ItemList = () => {
  const sidebarItems = getAdminSidebarItems("/admin/inventory/item-list");

  const [name, setName] = useState('');
  const [category, setCategory] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const api = await import('@/services/adminApi');
        const [cats, its] = await Promise.all([api.itemCategoryApi.getAll(), api.itemApi.getAll()]);
        setCategories(cats || []);
        setItems(its || []);
      } catch (err) {
        console.error('load items', err);
        toast?.({ title: 'Error', description: 'Unable to load items', variant: 'destructive' });
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      const api = (await import('@/services/adminApi')).itemApi;
      const saved = await api.create({ name, category: category || undefined, description });
      setItems((s) => [saved, ...s]);
      setName('');
      setCategory('');
      setDescription('');
      toast?.({ title: 'Saved', description: 'Item created' });
    } catch (err) {
      console.error('save item', err);
      toast?.({ title: 'Error', description: 'Unable to save item', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Item List" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add Item */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Item</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>ITEM NAME *</Label>
                    <Input placeholder="" />
                  </div>

                  <div>
                    <Label>ITEM CATEGORY *</Label>
                    <Input placeholder="Select Item Category *" />
                  </div>

                  <div>
                    <Label>DESCRIPTION</Label>
                    <Textarea rows={4} />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button className="bg-purple-600 text-white">✓ SAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Item List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Item List</CardTitle>
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-center">
                      <div className="w-1/2">
                        <Input placeholder="QUICK SEARCH" />
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-2">
                      <Button variant="outline">⎘</Button>
                      <Button variant="outline">⎙</Button>
                      <Button variant="outline">▣</Button>
                      <Button variant="outline">🖨️</Button>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Total In Stock</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No Data Available In Table</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>

                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center space-x-2">
                    <Button variant="ghost" className="rounded-full">←</Button>
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

export default ItemList;
