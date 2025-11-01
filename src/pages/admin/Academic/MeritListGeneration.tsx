import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { authClient } from '@/lib/api';
import { Trophy, Medal, Award, Send, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MeritList {
  id: number;
  academic_year: {
    name: string;
  };
  class_name: string;
  term: string;
  generated_date: string;
  generated_by_name: string;
  is_published: boolean;
  entries_count: number;
  entries: MeritListEntry[];
}

interface MeritListEntry {
  id: number;
  rank: number;
  student_name: string;
  roll_no: string;
  total_marks: number;
  percentage: number;
  gpa: number;
}

interface AcademicYear {
  id: number;
  name: string;
  is_current: boolean;
}

const MeritListGeneration: React.FC = () => {
  const [meritLists, setMeritLists] = useState<MeritList[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedMeritList, setSelectedMeritList] = useState<MeritList | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generation form
  const [academicYearId, setAcademicYearId] = useState('');
  const [className, setClassName] = useState('');
  const [term, setTerm] = useState('');

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
    fetchAcademicYears();
    fetchMeritLists();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await authClient.get('/api/admin/academic-years/');
      setAcademicYears(response.data.results || response.data);
      
      // Auto-select current academic year
      const current = (response.data.results || response.data).find((y: AcademicYear) => y.is_current);
      if (current) {
        setAcademicYearId(current.id.toString());
      }
    } catch (error: any) {
      toast.error('Failed to fetch academic years');
    }
  };

  const fetchMeritLists = async () => {
    try {
      setLoading(true);
      const response = await authClient.get('/api/admin/merit-lists/');
      setMeritLists(response.data.results || response.data);
    } catch (error: any) {
      toast.error('Failed to fetch merit lists');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!academicYearId || !className || !term) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await authClient.post('/api/admin/merit-lists/generate/', {
        academic_year_id: parseInt(academicYearId),
        class_name: className,
        term: term
      });

      toast.success(`Merit list generated with ${response.data.entries_count} entries`);
      fetchMeritLists();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate merit list');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (listId: number) => {
    try {
      await authClient.post(`/api/admin/merit-lists/${listId}/publish/`);
      toast.success('Merit list published');
      fetchMeritLists();
      if (selectedMeritList?.id === listId) {
        setDetailDialogOpen(false);
      }
    } catch (error: any) {
      toast.error('Failed to publish merit list');
    }
  };

  const viewMeritList = (list: MeritList) => {
    setSelectedMeritList(list);
    setDetailDialogOpen(true);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-700" />;
    return <span className="font-bold text-lg">{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Merit List Generation</h1>
        <p className="text-gray-600 mt-1">Generate and publish merit lists based on student performance</p>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Merit List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Academic Year *</label>
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
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
            <div>
              <label className="block text-sm font-medium mb-2">Class *</label>
              <Select value={className} onValueChange={setClassName}>
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
              <label className="block text-sm font-medium mb-2">Term *</label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {termOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={loading || !academicYearId || !className || !term}
                className="w-full"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Generate Merit List
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Merit lists are generated from published progress cards. Make sure progress cards are published before generating.
          </p>
        </CardContent>
      </Card>

      {/* Merit Lists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Merit Lists</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : meritLists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No merit lists found. Generate one above!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Academic Year</th>
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Term</th>
                    <th className="text-left p-2">Total Students</th>
                    <th className="text-left p-2">Generated Date</th>
                    <th className="text-left p-2">Generated By</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meritLists.map((list) => (
                    <tr key={list.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{list.academic_year.name}</td>
                      <td className="p-2">{list.class_name}</td>
                      <td className="p-2">Term {list.term}</td>
                      <td className="p-2">{list.entries_count}</td>
                      <td className="p-2">
                        {new Date(list.generated_date).toLocaleDateString()}
                      </td>
                      <td className="p-2">{list.generated_by_name}</td>
                      <td className="p-2">
                        {list.is_published ? (
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
                            onClick={() => viewMeritList(list)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {!list.is_published && (
                            <Button
                              size="sm"
                              onClick={() => handlePublish(list.id)}
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

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Merit List - {selectedMeritList?.class_name} (Term {selectedMeritList?.term})</DialogTitle>
          </DialogHeader>
          {selectedMeritList && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Academic Year</p>
                  <p className="font-semibold">{selectedMeritList.academic_year.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="font-semibold">{selectedMeritList.entries_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {selectedMeritList.is_published ? (
                    <Badge className="bg-green-100 text-green-800">Published</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                  )}
                </div>
              </div>

              {/* Top 3 Students Highlight */}
              <div className="grid grid-cols-3 gap-4">
                {selectedMeritList.entries.slice(0, 3).map((entry) => (
                  <Card key={entry.id} className={`border-2 ${
                    entry.rank === 1 ? 'border-yellow-400 bg-yellow-50' :
                    entry.rank === 2 ? 'border-gray-400 bg-gray-50' :
                    'border-orange-400 bg-orange-50'
                  }`}>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {getRankIcon(entry.rank)}
                      </div>
                      <p className="font-bold text-lg">{entry.student_name}</p>
                      <p className="text-sm text-gray-600">{entry.roll_no}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm">
                          <span className="font-semibold">Percentage:</span> {entry.percentage.toFixed(2)}%
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">GPA:</span> {entry.gpa.toFixed(2)}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Marks:</span> {entry.total_marks}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Full Merit List Table */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Complete Merit List</h3>
                <div className="max-h-96 overflow-y-auto border rounded">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 border-b">Rank</th>
                        <th className="text-left p-3 border-b">Roll No</th>
                        <th className="text-left p-3 border-b">Student Name</th>
                        <th className="text-right p-3 border-b">Total Marks</th>
                        <th className="text-right p-3 border-b">Percentage</th>
                        <th className="text-right p-3 border-b">GPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMeritList.entries.map((entry) => (
                        <tr
                          key={entry.id}
                          className={`border-b hover:bg-gray-50 ${
                            entry.rank <= 3 ? getRankBadge(entry.rank) : ''
                          }`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {entry.rank <= 3 && getRankIcon(entry.rank)}
                              {entry.rank > 3 && <span className="font-semibold">#{entry.rank}</span>}
                            </div>
                          </td>
                          <td className="p-3 font-mono">{entry.roll_no}</td>
                          <td className="p-3 font-medium">{entry.student_name}</td>
                          <td className="p-3 text-right">{entry.total_marks}</td>
                          <td className="p-3 text-right font-semibold">
                            {entry.percentage.toFixed(2)}%
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {entry.gpa.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {!selectedMeritList.is_published && (
                  <Button onClick={() => handlePublish(selectedMeritList.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Publish Merit List
                  </Button>
                )}
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeritListGeneration;
