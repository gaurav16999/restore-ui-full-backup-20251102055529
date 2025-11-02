import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { authClient } from '@/lib/api';
import { UserCheck, Users, ArrowRight } from 'lucide-react';

interface Student {
  id: number;
  user: {
    first_name: string;
    last_name: string;
  };
  roll_no: string;
  class_name: string;
}

interface AcademicYear {
  id: number;
  name: string;
  is_current: boolean;
}

const StudentPromotion: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [toAcademicYearId, setToAcademicYearId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const classList = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12'
  ];

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (fromClass) {
      fetchStudents();
    }
  }, [fromClass]);

  const fetchAcademicYears = async () => {
    try {
      const response = await authClient.get('/api/admin/academic-years/');
      setAcademicYears(response.data.results || response.data);
    } catch (error: any) {
      toast.error('Failed to fetch academic years');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await authClient.get('/api/admin/students/', {
        params: { class_name: fromClass }
      });
      setStudents(response.data.results || response.data);
    } catch (error: any) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleBulkPromote = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    if (!toClass || !toAcademicYearId) {
      toast.error('Please select target class and academic year');
      return;
    }

    if (fromClass === toClass) {
      toast.error('Target class must be different from current class');
      return;
    }

    try {
      setLoading(true);
      await authClient.post('/api/admin/student-promotions/bulk_promote/', {
        student_ids: selectedStudents,
        from_class: fromClass,
        to_class: toClass,
        to_academic_year_id: parseInt(toAcademicYearId),
        remarks: remarks
      });

      toast.success(`Successfully promoted ${selectedStudents.length} students`);
      
      // Reset form
      setSelectedStudents([]);
      setRemarks('');
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to promote students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Student Promotion</h1>
        <p className="text-gray-600 mt-1">Promote students to the next class</p>
      </div>

      {/* Promotion Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Class</label>
              <Select value={fromClass} onValueChange={setFromClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select current class" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Class</label>
              <Select value={toClass} onValueChange={setToClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target class" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Academic Year</label>
              <Select value={toAcademicYearId} onValueChange={setToAcademicYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.name} {year.is_current && '(Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Remarks (Optional)</label>
            <Textarea
              placeholder="Enter promotion remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual representation */}
      {fromClass && toClass && (
        <div className="flex items-center justify-center gap-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{fromClass}</span>
            </div>
            <p className="mt-2 font-semibold">Current Class</p>
          </div>
          <ArrowRight className="w-12 h-12 text-blue-600" />
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{toClass}</span>
            </div>
            <p className="mt-2 font-semibold">Target Class</p>
          </div>
        </div>
      )}

      {/* Student Selection */}
      {fromClass && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Select Students from {fromClass}
                {selectedStudents.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({selectedStudents.length} selected)
                  </span>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found in {fromClass}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedStudents.includes(student.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) =>
                        handleSelectStudent(student.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {student.user.first_name} {student.user.last_name}
                      </p>
                      <p className="text-sm text-gray-600">Roll No: {student.roll_no}</p>
                    </div>
                    {selectedStudents.includes(student.id) && (
                      <UserCheck className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {fromClass && students.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Ready to promote students?</p>
                <p className="text-sm text-gray-600">
                  {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} will be promoted from {fromClass} to {toClass}
                </p>
              </div>
              <Button
                onClick={handleBulkPromote}
                disabled={loading || selectedStudents.length === 0 || !toClass || !toAcademicYearId}
                size="lg"
              >
                <Users className="h-5 w-5 mr-2" />
                Promote {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentPromotion;
