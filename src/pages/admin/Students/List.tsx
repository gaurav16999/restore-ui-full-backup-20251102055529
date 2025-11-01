import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
import { studentApi, classRoomApi, type Student, type ClassRoom } from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Trash2, Eye } from "lucide-react";

const StudentList = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/list");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [academicYear, setAcademicYear] = useState("2025");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [quickSearch, setQuickSearch] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter students when filters change
  useEffect(() => {
    filterStudents();
  }, [students, className, section, searchName, searchRoll, quickSearch]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classroomsData] = await Promise.all([
        studentApi.getAll(),
        classRoomApi.getAll()
      ]);
      
      // Extract array from paginated response
      const studentsArray = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.results || [];
      const classroomsArray = Array.isArray(classroomsData) ? classroomsData : (classroomsData as any)?.results || [];
      
      setStudents(studentsArray);
      setClassrooms(classroomsArray);
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

  const filterStudents = () => {
    let filtered = [...students];

    // Filter by class name
    if (className) {
      filtered = filtered.filter(s => 
        s.class_name.toLowerCase().includes(className.toLowerCase())
      );
    }

    // Filter by section (assuming section is part of class_name like "PRIMARY THREE(A)")
    if (section) {
      filtered = filtered.filter(s => 
        s.class_name.toLowerCase().includes(`(${section.toLowerCase()})`)
      );
    }

    // Filter by name
    if (searchName) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by roll number
    if (searchRoll) {
      filtered = filtered.filter(s => 
        s.roll_no.toLowerCase().includes(searchRoll.toLowerCase())
      );
    }

    // Quick search across all fields
    if (quickSearch) {
      const search = quickSearch.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.roll_no.toLowerCase().includes(search) ||
        s.class_name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        (s.phone && s.phone.toLowerCase().includes(search))
      );
    }

    setFilteredStudents(filtered);
  };

  const handleSearch = () => {
    filterStudents();
  };

  const handleAddStudent = () => {
    navigate('/admin/students/add');
  };

  const handleViewStudent = (id: number) => {
    navigate(`/admin/students/${id}`);
  };

  const handleEditStudent = (id: number) => {
    navigate(`/admin/students/edit/${id}`);
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      setActionLoading(id);
      await studentApi.delete(id);
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Extract unique class names for dropdown
  const uniqueClasses = Array.from(new Set((students || []).map(s => {
    const match = s.class_name?.match(/^([^(]+)/);
    return match ? match[1].trim() : s.class_name || '';
  }).filter(Boolean)));

  // Extract unique sections for dropdown
  const uniqueSections = Array.from(new Set((students || []).map(s => {
    const match = s.class_name?.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  }).filter(Boolean)));

  return (
    <DashboardLayout title="Manage Student" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground block mb-1">ACADEMIC YEAR *</label>
                <Select onValueChange={(v) => setAcademicYear(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="2025|2025" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>2025|2025</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground block mb-1">CLASS</label>
                <Select onValueChange={(v) => setClassName(v)} value={className}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueClasses.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground block mb-1">SECTION</label>
                <Select onValueChange={(v) => setSection(v)} value={section}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSections.map((sec) => (
                      <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground block mb-1">SEARCH BY NAME</label>
                <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Name" />
              </div>

              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground block mb-1">SEARCH BY ROLL</label>
                <Input value={searchRoll} onChange={(e) => setSearchRoll(e.target.value)} placeholder="Roll" />
              </div>

              <div className="flex items-end justify-end">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="bg-purple-600 border-transparent text-white hover:bg-purple-700"
                    onClick={handleAddStudent}
                  >
                    + ADD STUDENT
                  </Button>
                  <Button 
                    className="bg-purple-600 border-transparent hover:bg-purple-700" 
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "🔍"} SEARCH
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-1/3">
                <div className="flex items-center border-b border-gray-200 pb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                  </svg>
                  <input 
                    placeholder="QUICK SEARCH" 
                    className="w-full border-0 p-0" 
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                  />
                </div>
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
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Attendance %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.roll_no}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.class_name}</TableCell>
                          <TableCell>{student.phone || '-'}</TableCell>
                          <TableCell>{student.attendance_percentage}%</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              student.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {student.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewStudent(student.id)}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStudent(student.id)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStudent(student.id)}
                                disabled={actionLoading === student.id}
                                title="Delete"
                              >
                                {actionLoading === student.id ? (
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
                  Showing {filteredStudents.length > 0 ? 1 : 0} to {filteredStudents.length} of {filteredStudents.length} entries
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentList;
