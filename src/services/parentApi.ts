/**
 * Parent Portal API Service
 * Handles all parent-specific API calls
 */

import { authClient } from '@/lib/api';

export interface Child {
  id: number;
  name: string;
  roll_no: string;
  class: string;
  attendance_percentage: number;
  recent_grades_count: number;
  pending_fees_count: number;
  is_active: boolean;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks: string;
}

export interface AttendanceResponse {
  student_info: {
    id: number;
    name: string;
    roll_no: string;
    class: string;
  };
  month: number;
  year: number;
  records: AttendanceRecord[];
  summary: {
    total_days: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  };
}

export interface Grade {
  id: number;
  subject: {
    id: number;
    title: string;
  };
  grade_letter: string;
  grade_percentage: number;
  marks_obtained: number;
  total_marks: number;
  exam_date: string;
  created_at: string;
  remarks: string;
}

export interface GradesResponse {
  student_info: {
    id: number;
    name: string;
    class: string;
  };
  grades: Grade[];
  average_percentage: number;
  total_grades: number;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  subject: {
    id: number;
    title: string;
  };
  due_date: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submission_date: string | null;
  grade: number | null;
  feedback: string | null;
  attachment_url: string | null;
}

export interface Fee {
  id: number;
  fee_type: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  paid_date: string | null;
  payment_method: string | null;
  receipt_url: string | null;
}

export interface FeeResponse {
  student_info: {
    id: number;
    name: string;
    class: string;
  };
  fees: Fee[];
  summary: {
    total_fees: number;
    paid: number;
    pending: number;
    status: string;
  };
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  avatar_url: string | null;
}

export interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
  };
  recipient: {
    id: number;
    name: string;
  };
  subject: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Notification {
  id: number;
  type: 'fee' | 'exam' | 'assignment' | 'announcement' | 'attendance';
  child?: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  is_read: boolean;
  created_at: string;
}

export interface ExamResult {
  id: number;
  exam_name: string;
  exam_date: string;
  subject: {
    id: number;
    title: string;
  };
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  rank: number | null;
}

class ParentAPIService {
  /**
   * Get dashboard data
   */
  async getDashboard() {
    const response = await authClient.get('/parent/dashboard/');
    return response.data;
  }

  /**
   * Get child summary
   */
  async getChildSummary(childId: number) {
    const response = await authClient.get(`/parent/children/${childId}/summary/`);
    return response.data;
  }

  /**
   * Get child attendance
   */
  async getChildAttendance(childId: number, month?: number, year?: number): Promise<AttendanceResponse> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await authClient.get(`/parent/children/${childId}/attendance/?${params.toString()}`);
    return response.data;
  }

  /**
   * Get child grades
   */
  async getChildGrades(childId: number, subject?: string, semester?: string): Promise<GradesResponse> {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (semester) params.append('semester', semester);
    
    const response = await authClient.get(`/parent/children/${childId}/grades/?${params.toString()}`);
    return response.data;
  }

  /**
   * Get child assignments
   */
  async getChildAssignments(childId: number, status?: string): Promise<{ assignments: Assignment[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await authClient.get(`/parent/children/${childId}/assignments/?${params.toString()}`);
    return response.data;
  }

  /**
   * Get child fees
   */
  async getChildFees(childId: number): Promise<FeeResponse> {
    const response = await authClient.get(`/parent/children/${childId}/fees/`);
    return response.data;
  }

  /**
   * Get child exam results
   */
  async getChildExamResults(childId: number, examName?: string): Promise<{ results: ExamResult[] }> {
    const params = new URLSearchParams();
    if (examName) params.append('exam_name', examName);
    
    const response = await authClient.get(`/parent/children/${childId}/exam-results/?${params.toString()}`);
    return response.data;
  }

  /**
   * Get teachers list
   */
  async getTeachers(): Promise<{ teachers: Teacher[] }> {
    const response = await authClient.get('/parent/teachers/');
    return response.data;
  }

  /**
   * Get messages
   */
  async getMessages(): Promise<{ messages: Message[] }> {
    const response = await authClient.get('/parent/messages/');
    return response.data;
  }

  /**
   * Send message
   */
  async sendMessage(data: { recipient_id: number; subject: string; content: string }) {
    const response = await authClient.post('/parent/messages/send/', data);
    return response.data;
  }

  /**
   * Get notifications
   */
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const response = await authClient.get('/parent/notifications/');
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: number) {
    const response = await authClient.post(`/parent/notifications/${notificationId}/mark-read/`);
    return response.data;
  }

  /**
   * Create payment intent (Stripe)
   */
  async createPaymentIntent(feeId: number) {
    const response = await authClient.post('/parent/payments/create-intent/', { fee_id: feeId });
    return response.data;
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId: string) {
    const response = await authClient.post('/parent/payments/confirm/', { payment_intent_id: paymentIntentId });
    return response.data;
  }
}

export const parentAPI = new ParentAPIService();
