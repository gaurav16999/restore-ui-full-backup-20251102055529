import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminClassSubjects,
  getAdminClassSubjectStats,
  createAdminClassSubject,
  deleteAdminClassSubject,
  getClasses,
  getSubjects,
} from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faBook, faChalkboardTeacher, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

const ClassSubjects = () => {
  const location = useLocation();
  const sidebarItems = getAdminSidebarItems(location.pathname);
  const queryClient = useQueryClient();
  const accessToken = window.localStorage.getItem('accessToken') || '';

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    class_assigned: "",
    subject: "",
    is_compulsory: true,
  });

  // Fetch class subjects
  const { data: classSubjects = [], isLoading } = useQuery({
    queryKey: ["admin-class-subjects"],
    queryFn: getAdminClassSubjects,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["admin-class-subject-stats"],
    queryFn: getAdminClassSubjectStats,
  });

  // Fetch classes and subjects for dropdowns
  const { data: classes = [] } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => {
      const data = await getClasses();
      console.log("Classes data:", data);
      return data;
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => {
      const data = await getSubjects();
      console.log("Subjects data:", data);
      return data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createAdminClassSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-class-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-class-subject-stats"] });
      setIsAddDialogOpen(false);
      setFormData({ class_assigned: "", subject: "", is_compulsory: true });
      toast.success("Subject assigned to class successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to assign subject to class");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAdminClassSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-class-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-class-subject-stats"] });
      toast.success("Subject removed from class successfully!");
    },
    onError: () => {
      toast.error("Failed to remove subject from class");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class_assigned || !formData.subject) {
      toast.error("Please select both class and subject");
      return;
    }
    createMutation.mutate({
      class_assigned: parseInt(formData.class_assigned),
      subject: parseInt(formData.subject),
      is_compulsory: formData.is_compulsory,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to remove this subject from this class?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredClassSubjects = Array.isArray(classSubjects)
    ? classSubjects.filter((cs: any) =>
        cs.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cs.subject_title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <DashboardLayout
      title="Admin Panel"
      userName="Admin User"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Class Subjects</h2>
            <p className="text-muted-foreground">
              Manage which subjects are taught in each class
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                Add Subject to Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subject to Class</DialogTitle>
                <DialogDescription>
                  Assign a subject to a class
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={formData.class_assigned}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class_assigned: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(classes) &&
                        classes.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(subjects) &&
                        subjects.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.code} - {subject.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_compulsory"
                    checked={formData.is_compulsory}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_compulsory: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="is_compulsory"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Compulsory Subject
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Subject"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FontAwesomeIcon icon={faBook} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_assignments || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Classes with Subjects</CardTitle>
              <FontAwesomeIcon icon={faChalkboardTeacher} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.classes_with_subjects || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Compulsory Subjects</CardTitle>
              <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.compulsory_subjects || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Optional Subjects</CardTitle>
              <FontAwesomeIcon icon={faBook} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.optional_subjects || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Class Subjects</CardTitle>
            <CardDescription>
              List of all subjects assigned to classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search by class or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Class
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Subject Code
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Subject Title
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Type
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="h-24 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredClassSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-24 text-center">
                        No subjects assigned yet
                      </td>
                    </tr>
                  ) : (
                    filteredClassSubjects.map((cs: any) => (
                      <tr key={cs.id} className="border-b">
                        <td className="p-4">{cs.class_name}</td>
                        <td className="p-4">{cs.subject_code}</td>
                        <td className="p-4">{cs.subject_title}</td>
                        <td className="p-4">
                          <Badge
                            variant={cs.is_compulsory ? "default" : "secondary"}
                          >
                            {cs.is_compulsory ? "Compulsory" : "Optional"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cs.id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="h-4 w-4 text-red-600"
                            />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClassSubjects;
