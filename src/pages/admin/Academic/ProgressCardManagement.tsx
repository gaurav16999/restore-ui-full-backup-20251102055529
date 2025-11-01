import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { authClient } from '@/lib/api';
import {
  FileText,
  Eye,
  Send,
  Plus,
  Trash,
  CheckCircle,
  Calculator,
} from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Student {
  id: number;
  user: {
    first_name: string;
    last_name: string;
  };
  roll_no: string;
  class_name: string;
}

interface ProgressCard {
  id: number;
  student: {
    user: {
      first_name: string;
      last_name: string;
    };
    roll_no: string;
  };
  academic_year: {
    name: string;
  };
  class_name: string;
  term: string;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  gpa: number;
  grade: string;
  rank: number | null;
  is_published: boolean;
  subject_marks: Array<{
    subject_name: string;
    subject_code: string;
    marks: number;
    percentage: number;
    grade: string;
  }>;
}

interface SubjectMark {
  subject_id: number;
  marks: number;
  teacher_remarks: string;
}

const ProgressCardManagement: React.FC = () => {
  const [progressCards, setProgressCards] = useState<ProgressCard[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCard, setSelectedCard] = useState<ProgressCard | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');

  // Create form
  const [formData, setFormData] = useState({
    student_id: '',
    class_name: '',
    term: '',
    total_days: '',
    days_present: '',
    class_teacher_remarks: '',
    principal_remarks: '',
  });
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>([]);

  const classList = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12'
  ];

  const termOptions = [
    { value: '1', label: 'Term 1' },
    { value: '2', label: 'Term 2' },
    { value: '3', label: 'Term 3' },
    { value: 'final', label: 'Final' },
  ];

  useEffect(() => {
    fetchProgressCards();
    fetchSubjects();
  }, [classFilter, termFilter, publishedFilter]);

  const fetchProgressCards = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (classFilter) params.class = classFilter;
      if (termFilter) params.term = termFilter;
      if (publishedFilter) params.is_published = publishedFilter;

      const response = await authClient.get('/api/admin/progress-cards/', { params });
      setProgressCards(response.data.results || response.data);
    } catch (error: any) {
      toast.error('Failed to fetch progress cards');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (className: string) => {
    try {
      const response = await authClient.get('/api/admin/students/', {
        params: { class_name: className }
      });
      setStudents(response.data.results || response.data);
    } catch (error: any) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await authClient.get('/api/admin/subjects/');
      setSubjects(response.data.results || response.data);
      
      // Initialize subject marks with all subjects
      const initialMarks = (response.data.results || response.data).map((subject: Subject) => ({
        subject_id: subject.id,
        marks: 0,
        teacher_remarks: ''
      }));
      setSubjectMarks(initialMarks);
    } catch (error: any) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleClassChange = (className: string) => {
    setFormData({ ...formData, class_name: className });
    fetchStudents(className);
  };

  const updateSubjectMark = (subjectId: number, field: string, value: any) => {
    setSubjectMarks(marks =>
      marks.map(mark =>
        mark.subject_id === subjectId ? { ...mark, [field]: value } : mark
      )
    );
  };

  const handleCreate = async () => {
    if (!formData.student_id || !formData.class_name || !formData.term) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await authClient.post('/api/admin/progress-cards/', {
        ...formData,
        student_id: parseInt(formData.student_id),
        total_days: parseInt(formData.total_days),
        days_present: parseInt(formData.days_present),
        subjects: subjectMarks.map(mark => ({
          subject: mark.subject_id,
          marks: mark.marks,
          teacher_remarks: mark.teacher_remarks
        }))
      });

      toast.success('Progress card created successfully');
      setCreateDialogOpen(false);
      fetchProgressCards();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create progress card');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (cardId: number) => {
    try {
      await authClient.post(`/api/admin/progress-cards/${cardId}/publish/`);
      toast.success('Progress card published');
      fetchProgressCards();
      if (selectedCard?.id === cardId) {
        setDetailDialogOpen(false);
      }
    } catch (error: any) {
      toast.error('Failed to publish progress card');
    }
  };

  const handleCalculateRanks = async () => {
    if (!classFilter || !termFilter) {
      toast.error('Please select class and term filters first');
      return;
    }

    try {
      await authClient.post('/api/admin/progress-cards/calculate_ranks/', {
        academic_year_id: 1, // You may want to make this dynamic
        class_name: classFilter,
        term: termFilter
      });
      toast.success('Ranks calculated successfully');
      fetchProgressCards();
    } catch (error: any) {
      toast.error('Failed to calculate ranks');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      class_name: '',
      term: '',
      total_days: '',
      days_present: '',
      class_teacher_remarks: '',
      principal_remarks: '',
    });
    fetchSubjects();
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-600',
      'A': 'bg-green-500',
      'B+': 'bg-blue-600',
      'B': 'bg-blue-500',
      'C+': 'bg-yellow-600',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-500',
    };
    return colors[grade] || 'bg-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Progress Card Management</h1>
          <p className="text-gray-600 mt-1">Create and manage student progress cards</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Progress Card
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classList.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Terms</SelectItem>
                {termOptions.map((term) => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={publishedFilter} onValueChange={setPublishedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Publication status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cards</SelectItem>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Unpublished</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleCalculateRanks}
              disabled={!classFilter || !termFilter}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Ranks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : progressCards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No progress cards found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Roll No</th>
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Term</th>
                    <th className="text-left p-2">Marks</th>
                    <th className="text-left p-2">Percentage</th>
                    <th className="text-left p-2">GPA</th>
                    <th className="text-left p-2">Grade</th>
                    <th className="text-left p-2">Rank</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {progressCards.map((card) => (
                    <tr key={card.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {card.student.user.first_name} {card.student.user.last_name}
                      </td>
                      <td className="p-2">{card.student.roll_no}</td>
                      <td className="p-2">{card.class_name}</td>
                      <td className="p-2">Term {card.term}</td>
                      <td className="p-2">
                        {card.marks_obtained}/{card.total_marks}
                      </td>
                      <td className="p-2">{card.percentage.toFixed(2)}%</td>
                      <td className="p-2">{card.gpa.toFixed(2)}</td>
                      <td className="p-2">
                        <Badge className={`${getGradeColor(card.grade)} text-white`}>
                          {card.grade}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {card.rank ? `#${card.rank}` : '-'}
                      </td>
                      <td className="p-2">
                        {card.is_published ? (
                          <Badge className="bg-green-100 text-green-800">Published</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCard(card);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!card.is_published && (
                            <Button
                              size="sm"
                              onClick={() => handlePublish(card.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Publish
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Progress Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class *</label>
                <Select value={formData.class_name} onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
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
                <label className="block text-sm font-medium mb-2">Student *</label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                  disabled={!formData.class_name}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.user.first_name} {student.user.last_name} ({student.roll_no})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Term *</label>
                <Select
                  value={formData.term}
                  onValueChange={(value) => setFormData({ ...formData, term: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {termOptions.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attendance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Total Days</label>
                <Input
                  type="number"
                  value={formData.total_days}
                  onChange={(e) => setFormData({ ...formData, total_days: e.target.value })}
                  placeholder="Enter total days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Days Present</label>
                <Input
                  type="number"
                  value={formData.days_present}
                  onChange={(e) => setFormData({ ...formData, days_present: e.target.value })}
                  placeholder="Enter days present"
                />
              </div>
            </div>

            {/* Subject Marks */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Subject Marks</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {subjects.map((subject) => {
                  const mark = subjectMarks.find(m => m.subject_id === subject.id);
                  return (
                    <div key={subject.id} className="grid grid-cols-3 gap-3 p-3 border rounded">
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-xs text-gray-600">{subject.code}</p>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Marks"
                          value={mark?.marks || 0}
                          onChange={(e) =>
                            updateSubjectMark(subject.id, 'marks', parseFloat(e.target.value) || 0)
                          }
                          max={100}
                          min={0}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Teacher remarks"
                          value={mark?.teacher_remarks || ''}
                          onChange={(e) =>
                            updateSubjectMark(subject.id, 'teacher_remarks', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium mb-2">Class Teacher Remarks</label>
              <Textarea
                value={formData.class_teacher_remarks}
                onChange={(e) =>
                  setFormData({ ...formData, class_teacher_remarks: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Principal Remarks</label>
              <Textarea
                value={formData.principal_remarks}
                onChange={(e) => setFormData({ ...formData, principal_remarks: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              Create Progress Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Progress Card Details</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Student Name</label>
                  <p className="font-semibold">
                    {selectedCard.student.user.first_name} {selectedCard.student.user.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Roll Number</label>
                  <p className="font-semibold">{selectedCard.student.roll_no}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Class</label>
                  <p className="font-semibold">{selectedCard.class_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Term</label>
                  <p className="font-semibold">Term {selectedCard.term}</p>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedCard.percentage.toFixed(2)}%</p>
                  <p className="text-sm text-gray-600">Percentage</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedCard.gpa.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">GPA</p>
                </div>
                <div className="text-center">
                  <Badge className={`${getGradeColor(selectedCard.grade)} text-white text-xl px-4 py-2`}>
                    {selectedCard.grade}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Grade</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {selectedCard.rank ? `#${selectedCard.rank}` : '-'}
                  </p>
                  <p className="text-sm text-gray-600">Rank</p>
                </div>
              </div>

              {/* Subject Marks */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Subject-wise Performance</h3>
                <div className="space-y-2">
                  {selectedCard.subject_marks.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{subject.subject_name}</p>
                        <p className="text-xs text-gray-600">{subject.subject_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{subject.marks}/100</p>
                        <p className="text-sm text-gray-600">{subject.percentage.toFixed(2)}%</p>
                      </div>
                      <Badge className={`${getGradeColor(subject.grade)} text-white`}>
                        {subject.grade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {!selectedCard.is_published && (
                <div className="flex justify-end">
                  <Button onClick={() => handlePublish(selectedCard.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Publish Progress Card
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgressCardManagement;
