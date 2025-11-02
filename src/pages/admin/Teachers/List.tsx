import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { teacherApi, classApi, subjectApi, teacherAssignmentApi, type Teacher, type Class, type Subject, type TeacherAssignment } from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Trash2, Eye, UserPlus, BookOpen } from "lucide-react";

const TeacherList = () => {
  const sidebarItems = getAdminSidebarItems("/admin/teachers");
  const navigate = useNavigate();
  const { toast } = useToast();

  // States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Assignment dialog states
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter teachers when filters change
  useEffect(() => {
    filterTeachers();
  }, [teachers, searchName, searchSubject, quickSearch, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersData, classesData, subjectsData] = await Promise.all([
        teacherApi.getAll(),
        classApi.getAll(),
        subjectApi.getAll(),
      ]);
      setTeachers(teachersData);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = [...teachers];

    // Filter by name
    if (searchName) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by subject
    if (searchSubject) {
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(searchSubject.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(t =>
        filterStatus === "active" ? t.status === "Active" : t.status !== "Active"
      );
    }

    // Quick search across all fields
    if (quickSearch) {
      const search = quickSearch.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.subject.toLowerCase().includes(search) ||
        t.email.toLowerCase().includes(search) ||
        (t.employee_id && t.employee_id.toLowerCase().includes(search)) ||
        (t.phone && t.phone.toLowerCase().includes(search))
      );
    }

    setFilteredTeachers(filtered);
  };

  const handleSearch = () => {
    filterTeachers();
  };

  const handleAddTeacher = () => {
    navigate('/admin/teachers/add');
  };

  const handleViewTeacher = (id: number) => {
    navigate(`/admin/teachers/${id}`);
  };

  const handleEditTeacher = (id: number) => {
    navigate(`/admin/teachers/edit/${id}`);
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!confirm("Are you sure you want to delete this teacher?")) {
      return;
    }

    try {
      setActionLoading(id);
      await teacherApi.delete(id);
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignClasses = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setAssignmentDialogOpen(true);
    
    // Load teacher's current assignments
    try {
      const assignments = await teacherAssignmentApi.getAll({ teacher: teacher.id });
      setTeacherAssignments(assignments);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load teacher assignments",
        variant: "destructive",
      });
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedTeacher || !selectedClass || !selectedSubject) {
      toast({
        title: "Error",
        description: "Please select both class and subject",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(selectedTeacher.id);
      await teacherAssignmentApi.create({
        teacher: selectedTeacher.id,
        class_assigned: selectedClass,
        subject: selectedSubject,
        is_active: true,
      });

      toast({
        title: "Success",
        description: "Teacher assigned successfully",
      });

      // Reload assignments
      const assignments = await teacherAssignmentApi.getAll({ teacher: selectedTeacher.id });
      setTeacherAssignments(assignments);
      
      setSelectedClass(null);
      setSelectedSubject(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign teacher",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!confirm("Remove this assignment?")) return;

    try {
      await teacherAssignmentApi.delete(assignmentId);
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });

      // Reload assignments
      if (selectedTeacher) {
        const assignments = await teacherAssignmentApi.getAll({ teacher: selectedTeacher.id });
        setTeacherAssignments(assignments);
      }
      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove assignment",
        variant: "destructive",
      });
    }
  };

  const uniqueSubjects = Array.from(new Set(teachers.map(t => t.subject))).filter(Boolean);

  return (
    <DashboardLayout title="Manage Teachers" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle>Search Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label className="text-xs">SEARCH BY NAME</Label>
                <Input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Teacher name"
                />
              </div>

              <div>
                <Label className="text-xs">SUBJECT</Label>
                <Select onValueChange={(v) => setSearchSubject(v)} value={searchSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {uniqueSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">STATUS</Label>
                <Select onValueChange={(v) => setFilterStatus(v)} value={filterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2 md:col-span-2">
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleAddTeacher}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  ADD TEACHER
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "🔍"} SEARCH
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-1/3">
                <Input
                  placeholder="QUICK SEARCH"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          No teachers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell>{teacher.employee_id || '-'}</TableCell>
                          <TableCell>{teacher.name}</TableCell>
                          <TableCell>{teacher.subject}</TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell>{teacher.phone || '-'}</TableCell>
                          <TableCell>{teacher.classes_count}</TableCell>
                          <TableCell>{teacher.students_count}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              teacher.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {teacher.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTeacher(teacher.id)}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAssignClasses(teacher)}
                                title="Assign Classes"
                              >
                                <BookOpen className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTeacher(teacher.id)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                disabled={actionLoading === teacher.id}
                                title="Delete"
                              >
                                {actionLoading === teacher.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredTeachers.length > 0 ? 1 : 0} to {filteredTeachers.length} of {filteredTeachers.length} entries
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Classes to {selectedTeacher?.name}</DialogTitle>
              <DialogDescription>
                Manage class and subject assignments for this teacher
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current Assignments */}
              <div>
                <Label>Current Assignments</Label>
                {teacherAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignments yet</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {teacherAssignments.map((assignment) => {
                      const assignedClass = classes.find(c => c.id === assignment.class_assigned);
                      const assignedSubject = subjects.find(s => s.id === assignment.subject);
                      return (
                        <div key={assignment.id} className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">
                            {assignedClass?.name} - {assignedSubject?.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add New Assignment */}
              <div className="space-y-4 pt-4 border-t">
                <Label>Add New Assignment</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">CLASS</Label>
                    <Select onValueChange={(v) => setSelectedClass(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">SUBJECT</Label>
                    <Select onValueChange={(v) => setSelectedSubject(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={handleSaveAssignment}
                disabled={!selectedClass || !selectedSubject || actionLoading !== null}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeacherList;
