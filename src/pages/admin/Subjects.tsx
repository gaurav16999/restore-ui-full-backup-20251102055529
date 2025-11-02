import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBookOpen,
  faPlus, 
  faEdit, 
  faTrash,
  faGraduationCap,
  faChartBar
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { getSubjects, createSubject, updateSubject, deleteSubject } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const subjectsData = await getSubjects();
      const subjectsArray = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.results || []);
      setSubjects(subjectsArray);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      if (isEditMode && editingSubjectId) {
        await updateSubject(token, editingSubjectId, formData);
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        await createSubject(token, formData);
        toast({
          title: "Success",
          description: "Subject added successfully",
        });
      }

      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingSubjectId(null);
      setFormData({ name: '', code: '', description: '' });
      fetchSubjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'add'} subject`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (subject: any) => {
    setIsEditMode(true);
    setEditingSubjectId(subject.id);
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingSubjectId(null);
    setFormData({ name: '', code: '', description: '' });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await deleteSubject(token, itemToDelete);
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchSubjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const sidebarItems = getAdminSidebarItems("/admin/subjects");

  return (
    <DashboardLayout
      title="Subjects"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold mb-2">Subjects Management</h2>
            <p className="text-muted-foreground text-lg">Manage all subjects taught in the school</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all h-12" onClick={handleAddNew}>
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>

        {/* Tabs: All | Classes With Subjects | Assign Subjects */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            <TabsTrigger value="classes">Classes With Subjects</TabsTrigger>
            <TabsTrigger value="assign">Assign Subjects</TabsTrigger>
          </TabsList>

          {/* All Subjects (existing content) */}
          <TabsContent value="all" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Total Subjects</CardTitle>
                  <FontAwesomeIcon icon={faBookOpen} className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{subjects.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Active Subjects</CardTitle>
                  <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{subjects.filter(s => s.is_active !== false).length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Subject Categories</CardTitle>
                  <FontAwesomeIcon icon={faChartBar} className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {new Set(subjects.map(s => s.category).filter(Boolean)).size || subjects.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subjects List */}
            <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-xl">All Subjects</CardTitle>
                <CardDescription>Complete list of subjects offered</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading subjects...</div>
                ) : subjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No subjects found. Add your first subject to get started.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {subjects.map((subject, index) => (
                      <div
                        key={subject.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FontAwesomeIcon icon={faBookOpen} className="text-primary" />
                              <h3 className="font-semibold text-lg">{subject.name}</h3>
                              {subject.code && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {subject.code}
                                </span>
                              )}
                            </div>
                            {subject.description && (
                              <p className="text-sm text-muted-foreground ml-7">{subject.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-2 ml-7 text-sm text-muted-foreground">
                              {subject.category && (
                                <span>Category: {subject.category}</span>
                              )}
                              {subject.credits && (
                                <span>Credits: {subject.credits}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(subject)}
                              className="hover:bg-primary/10"
                            >
                              <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(subject.id)}
                              className="hover:bg-destructive/10 text-destructive"
                            >
                              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes With Subjects: simple view showing classes and assigned subjects (mocked) */}
          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Classes With Subjects</CardTitle>
                <CardDescription>View which subjects are assigned to each class</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Select a class to see its subjects.</p>
                {/* Mock list: If real endpoint exists, replace with fetch */}
                <div className="grid gap-3">
                  {/* Example static classes */}
                  {['Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'].map((cls) => (
                    <div key={cls} className="p-3 border rounded-md flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{cls}</div>
                        <div className="text-sm text-muted-foreground">Subjects: Mathematics, English, Science</div>
                      </div>
                      <div>
                        <Button size="sm" variant="ghost">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assign Subjects: allow selecting class and subjects (UI only) */}
          <TabsContent value="assign" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assign Subjects to Class</CardTitle>
                <CardDescription>Choose a class and assign subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <select className="input input-bordered w-full">
                      <option>Grade 6</option>
                      <option>Grade 7</option>
                      <option>Grade 8</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subjects</Label>
                    <select multiple className="input input-bordered w-full h-40">
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button>Save Assignment</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subject
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminSubjects;
