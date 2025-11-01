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
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserPlus,
  Search,
  Download,
  Filter,
} from 'lucide-react';

interface AdmissionApplication {
  id: number;
  application_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  applying_for_class: string;
  previous_school: string;
  previous_grade: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_occupation: string;
  status: string;
  priority: string;
  applied_date: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  review_notes?: string;
  admission_date?: string;
  student_id?: number;
  birth_certificate?: string;
  report_card?: string;
  transfer_certificate?: string;
  medical_records?: string;
  photo?: string;
}

interface Statistics {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  waitlisted: number;
  admitted: number;
  by_class: Record<string, number>;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-orange-100 text-orange-800',
  admitted: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const AdmissionManagement: React.FC = () => {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchStatistics();
  }, [statusFilter, classFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.class = classFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await authClient.get('/api/admin/admission-applications/', { params });
      setApplications(response.data.results || response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await authClient.get('/api/admin/admission-applications/statistics/');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleSearch = () => {
    fetchApplications();
  };

  const openReviewDialog = (application: AdmissionApplication) => {
    setSelectedApplication(application);
    setReviewStatus('');
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const openDetailDialog = (application: AdmissionApplication) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedApplication || !reviewStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await authClient.post(`/api/admin/admission-applications/${selectedApplication.id}/review/`, {
        status: reviewStatus,
        review_notes: reviewNotes,
      });
      
      toast.success(`Application ${reviewStatus}`);
      setReviewDialogOpen(false);
      fetchApplications();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to review application');
    }
  };

  const handleAdmit = async (applicationId: number) => {
    if (!confirm('Are you sure you want to admit this student? This will create a student account.')) {
      return;
    }

    try {
      const response = await authClient.post(`/api/admin/admission-applications/${applicationId}/admit/`);
      toast.success(`Student admitted successfully! Roll No: ${response.data.roll_no}`);
      fetchApplications();
      fetchStatistics();
      setDetailDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to admit student');
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admission Management</h1>
          <p className="text-gray-600 mt-1">Review and manage admission applications</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{statistics.under_review}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{statistics.waitlisted}</div>
              <div className="text-sm text-gray-600">Waitlisted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{statistics.admitted}</div>
              <div className="text-sm text-gray-600">Admitted</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, email, or application number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="admitted">Admitted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {statistics?.by_class && Object.keys(statistics.by_class).map((className) => (
                  <SelectItem key={className} value={className}>
                    {className} ({statistics.by_class[className]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('');
                setClassFilter('');
                setSearchQuery('');
                fetchApplications();
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No applications found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Application #</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Contact</th>
                    <th className="text-left p-2">Applied Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Priority</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">{application.application_number}</td>
                      <td className="p-2">
                        {application.first_name} {application.last_name}
                      </td>
                      <td className="p-2">{application.applying_for_class}</td>
                      <td className="p-2">
                        <div className="text-sm">{application.email}</div>
                        <div className="text-xs text-gray-500">{application.phone}</div>
                      </td>
                      <td className="p-2 text-sm">
                        {new Date(application.applied_date).toLocaleDateString()}
                      </td>
                      <td className="p-2">{getStatusBadge(application.status)}</td>
                      <td className="p-2">
                        <Badge variant={application.priority === 'high' ? 'destructive' : 'secondary'}>
                          {application.priority}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailDialog(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {application.status === 'pending' || application.status === 'under_review' ? (
                            <Button
                              size="sm"
                              onClick={() => openReviewDialog(application)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          ) : null}
                          {application.status === 'approved' && !application.student_id ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAdmit(application.id)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Admit
                            </Button>
                          ) : null}
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

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Applicant: {selectedApplication.first_name} {selectedApplication.last_name}</p>
                <p className="text-sm text-gray-600">Application #: {selectedApplication.application_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Decision</label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_review">Move to Under Review</SelectItem>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                    <SelectItem value="waitlisted">Add to Waitlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Review Notes</label>
                <Textarea
                  placeholder="Enter review notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Application Number</label>
                    <p className="font-mono">{selectedApplication.application_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Full Name</label>
                    <p>{selectedApplication.first_name} {selectedApplication.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date of Birth</label>
                    <p>{new Date(selectedApplication.date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Gender</label>
                    <p>{selectedApplication.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p>{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <p>{selectedApplication.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Address</label>
                    <p>{selectedApplication.address}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Applying for Class</label>
                    <p>{selectedApplication.applying_for_class}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Previous School</label>
                    <p>{selectedApplication.previous_school || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Previous Grade</label>
                    <p>{selectedApplication.previous_grade || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Parent/Guardian Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Parent Name</label>
                    <p>{selectedApplication.parent_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Parent Email</label>
                    <p>{selectedApplication.parent_email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Parent Phone</label>
                    <p>{selectedApplication.parent_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Parent Occupation</label>
                    <p>{selectedApplication.parent_occupation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Review Information */}
              {selectedApplication.reviewed_at && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Review Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Reviewed By</label>
                      <p>{selectedApplication.reviewed_by_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Reviewed At</label>
                      <p>{new Date(selectedApplication.reviewed_at).toLocaleString()}</p>
                    </div>
                    {selectedApplication.review_notes && (
                      <div className="col-span-2">
                        <label className="text-sm text-gray-600">Review Notes</label>
                        <p className="whitespace-pre-wrap">{selectedApplication.review_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedApplication.status === 'approved' && !selectedApplication.student_id && (
                  <Button onClick={() => handleAdmit(selectedApplication.id)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Admit Student
                  </Button>
                )}
                {(selectedApplication.status === 'pending' || selectedApplication.status === 'under_review') && (
                  <Button onClick={() => {
                    setDetailDialogOpen(false);
                    openReviewDialog(selectedApplication);
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Review Application
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

export default AdmissionManagement;
