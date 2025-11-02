import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { bookApi, BookCategory } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';

const AddBook = () => {
  const sidebarItems = getAdminSidebarItems("/admin/library/add-book");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [bookNo, setBookNo] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [author, setAuthor] = useState("");
  const [rackNumber, setRackNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    (async () => {
      try {
        const payload: Partial<any> = {
          title,
          author,
          isbn,
          category: category || undefined,
          publisher,
          total_copies: quantity ? Number(quantity) : undefined,
          location: rackNumber,
          // price and subject are not modeled on backend yet
        };
        const created = await bookApi.create(payload);
        toast({ title: 'Book created', description: `Created id ${created.id}` });
        // clear form
        setTitle(''); setCategory(''); setSubject(''); setBookNo(''); setIsbn(''); setPublisher(''); setAuthor(''); setRackNumber(''); setQuantity(''); setPrice(''); setDescription('');
      } catch (err) {
        console.error('Failed to create book', err);
        toast({ title: 'Failed to create book', variant: 'destructive', description: err?.response?.data?.detail || 'Failed to create book' });
      }
    })();
  };

  const [categories, setCategories] = useState<BookCategory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await (await import('@/services/adminApi')).bookCategoryApi.getAll();
        const anyRes: any = res;
        const data = Array.isArray(anyRes) ? anyRes : (anyRes && (anyRes.results ?? anyRes.data)) || [];
        if (mounted) setCategories(data as BookCategory[]);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Add Book" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Book</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">BOOK TITLE *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">BOOK CATEGORIES *</label>
                <Select onValueChange={(v) => setCategory(v)} value={category}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Book Category *" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">SUBJECT *</label>
                <Select onValueChange={(v) => setSubject(v)} value={subject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">BOOK NO</label>
                <Input value={bookNo} onChange={(e) => setBookNo(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">ISBN NO</label>
                <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">PUBLISHER NAME</label>
                <Input value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">AUTHOR NAME</label>
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">RACK NUMBER</label>
                <Input value={rackNumber} onChange={(e) => setRackNumber(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">QUANTITY</label>
                <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">BOOK PRICE</label>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="" />
              </div>

              <div className="lg:col-span-4">
                <label className="text-sm text-muted-foreground block mb-1">DESCRIPTION</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md p-2 h-28" />
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <Button onClick={handleSave} className="bg-purple-600 text-white">✓ SAVE BOOK</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-48" />
      </div>
    </DashboardLayout>
  );
};

export default AddBook;
