import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Users, BookOpen, BarChart3, DollarSign, UserCog, ClipboardList, FileText, Settings, Clock, GraduationCap, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { getClasses, getClassStats, getSubjects, createClass, createSubject, getTeachers, updateClass, updateSubject, deleteClass, deleteSubject } from "@/lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isClassEditMode, setIsClassEditMode] = useState(false);
  const [isSubjectEditMode, setIsSubjectEditMode] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'class' | 'subject' | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [classFormData, setClassFormData] = useState({
    name: '',
    room: '',
    schedule: '',
    teacher_id: ''
  });

  const [subjectFormData, setSubjectFormData] = useState({
    name: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const [classesData, subjectsData, statsData, teachersData] = await Promise.all([
        getClasses(token),
        getSubjects(token),
        getClassStats(token),
        getTeachers(token)
      ]);

      setClasses(classesData);
      setSubjects(subjectsData);
      setStats(statsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      if (isClassEditMode && editingClassId) {
        await updateClass(token, editingClassId, classFormData);
        toast({
          title: "Success",
          description: "Class updated successfully",
        });
      } else {
        await createClass(token, classFormData);
        toast({
          title: "Success",
          description: "Class created successfully",
        });
      }

      setIsClassDialogOpen(false);
      setIsClassEditMode(false);
      setEditingClassId(null);
      setClassFormData({ name: '', room: '', schedule: '', teacher_id: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isClassEditMode ? 'update' : 'create'} class`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      if (isSubjectEditMode && editingSubjectId) {
        await updateSubject(token, editingSubjectId, subjectFormData);
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        await createSubject(token, subjectFormData);
        toast({
          title: "Success",
          description: "Subject added successfully",
        });
      }

      setIsSubjectDialogOpen(false);
      setIsSubjectEditMode(false);
      setEditingSubjectId(null);
      setSubjectFormData({ name: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isSubjectEditMode ? 'update' : 'add'} subject`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClass = (classItem: any) => {
    setIsClassEditMode(true);
    setEditingClassId(classItem.id);
    setClassFormData({
      name: classItem.name || '',
      room: classItem.room || '',
      schedule: classItem.schedule || '',
      teacher_id: classItem.teacher_id?.toString() || ''
    });
    setIsClassDialogOpen(true);
  };

  const handleEditSubject = (subject: any) => {
    setIsSubjectEditMode(true);
    setEditingSubjectId(subject.id);
    setSubjectFormData({
      name: subject.name || ''
    });
    setIsSubjectDialogOpen(true);
  };

  const handleAddNewClass = () => {
    setIsClassEditMode(false);
    setEditingClassId(null);
    setClassFormData({ name: '', room: '', schedule: '', teacher_id: '' });
    setIsClassDialogOpen(true);
  };

  const handleAddNewSubject = () => {
    setIsSubjectEditMode(false);
    setEditingSubjectId(null);
    setSubjectFormData({ name: '' });
    setIsSubjectDialogOpen(true);
  };

  const openDeleteDialog = (type: 'class' | 'subject', id: number) => {
    setDeleteType(type);
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      if (deleteType === 'class') {
        await deleteClass(token, itemToDelete);
        toast({
          title: "Success",
          description: "Class deleted successfully",
        });
      } else {
        await deleteSubject(token, itemToDelete);
        toast({
          title: "Success",
          description: "Subject deleted successfully",
        });
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${deleteType}`,
        variant: "destructive",
      });
    }
  };

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Students", path: "/admin/students" },
    { icon: BookOpen, label: "Teachers", path: "/admin/teachers" },
    { icon: Calendar, label: "Classes & Subjects", active: true, path: "/admin/classes" },
    { icon: ClipboardList, label: "Attendance", path: "/admin/attendance" },
    { icon: FileText, label: "Grades & Reports" },
    { icon: DollarSign, label: "Fee Management" },
    { icon: UserCog, label: "User Management" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <DashboardLayout
      title="Classes & Subjects"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold mb-2">Classes & Subjects</h2>
            <p className="text-muted-foreground text-lg">Manage class schedules and subject assignments</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="h-12 border-2 hover:border-primary" onClick={handleAddNewSubject}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isSubjectEditMode ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                  <DialogDescription>
                    {isSubjectEditMode ? 'Update subject information' : 'Enter subject information'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubjectSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject_name">Subject Name *</Label>
                      <Input
                        id="subject_name"
                        placeholder="e.g., Advanced Mathematics"
                        value={subjectFormData.name}
                        onChange={(e) => setSubjectFormData({ name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (isSubjectEditMode ? "Updating..." : "Adding...") : (isSubjectEditMode ? "Update Subject" : "Add Subject")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all h-12" onClick={handleAddNewClass}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isClassEditMode ? 'Edit Class' : 'Create New Class'}</DialogTitle>
                  <DialogDescription>
                    {isClassEditMode ? 'Update class information' : 'Enter class information'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleClassSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="class_name">Class Name *</Label>
                      <Input
                        id="class_name"
                        placeholder="e.g., Grade 10A"
                        value={classFormData.name}
                        onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room">Room *</Label>
                      <Input
                        id="room"
                        placeholder="e.g., Room 201"
                        value={classFormData.room}
                        onChange={(e) => setClassFormData({ ...classFormData, room: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule">Schedule</Label>
                      <Input
                        id="schedule"
                        placeholder="e.g., Mon-Fri, 9:00 AM"
                        value={classFormData.schedule}
                        onChange={(e) => setClassFormData({ ...classFormData, schedule: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher">Assign Teacher</Label>
                      <Select 
                        value={classFormData.teacher_id} 
                        onValueChange={(value) => setClassFormData({ ...classFormData, teacher_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teacher (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                              {teacher.name} - {teacher.subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsClassDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (isClassEditMode ? "Updating..." : "Creating...") : (isClassEditMode ? "Update Class" : "Create Class")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
                {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
              <GraduationCap className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : stats.total_classes}</div>
              <p className="text-xs text-muted-foreground">Active this semester</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subjects</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : stats.total_subjects}</div>
              <p className="text-xs text-muted-foreground">Across all grades</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Class Size</CardTitle>
              <Users className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : stats.avg_class_size}</div>
              <p className="text-xs text-muted-foreground">Students per class</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
              <Calendar className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : stats.active_sessions}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "100ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-light rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Active Classes</CardTitle>
                <CardDescription>All classes currently in session</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No classes found</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {classes.map((cls, index) => (
                  <Card key={cls.id} className="shadow-md border-2 hover:shadow-lg hover:border-primary/30 transition-all" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardHeader className="bg-gradient-card">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{cls.name}</CardTitle>
                        <div className="px-3 py-1.5 bg-primary-light rounded-lg">
                          <span className="text-sm font-bold text-primary">{cls.student_count} students</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Class Teacher:</span>
                          <span className="font-bold">{cls.teacher_name || 'Not Assigned'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Room:</span>
                          <span className="font-bold">{cls.room || 'TBA'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Schedule:</span>
                          <span className="font-bold">{cls.schedule || 'TBA'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Subjects:</span>
                          <span className="font-bold">{cls.subject_count} subjects</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-5">
                        <Button variant="outline" size="sm" className="flex-1 border-2 hover:border-primary" onClick={() => handleEditClass(cls)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="border-2 hover:border-destructive hover:bg-destructive-light hover:text-destructive" onClick={() => openDeleteDialog('class', cls.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects Overview */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "150ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-light rounded-lg">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Subject Overview</CardTitle>
                <CardDescription>All subjects across different classes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading subjects...</div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No subjects found</div>
            ) : (
              <div className="grid md:grid-cols-3 gap-5">
                {subjects.map((subject, index) => (
                  <div key={subject.id} className="p-5 bg-primary-light rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-colors">
                    <h3 className="font-bold text-primary text-lg mb-4">{subject.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-white rounded-lg">
                        <span className="text-muted-foreground font-medium">Classes:</span>
                        <span className="font-bold">{subject.class_count || 0}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded-lg">
                        <span className="text-muted-foreground font-medium">Teachers:</span>
                        <span className="font-bold">{subject.teacher_count || 0}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded-lg">
                        <span className="text-muted-foreground font-medium">Students:</span>
                        <span className="font-bold">{subject.student_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 border-2 hover:border-primary" onClick={() => handleEditSubject(subject)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="border-2 hover:border-destructive hover:bg-destructive-light hover:text-destructive" onClick={() => openDeleteDialog('subject', subject.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {deleteType} and remove all associated data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminClasses;
