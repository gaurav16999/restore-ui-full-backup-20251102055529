/**
 * Centralized Admin API Service
 * Provides CRUD operations for all admin entities with proper error handling
 */

import authClient from '@/lib/http';
import { API_BASE } from '@/lib/config';

// ==================== TYPE DEFINITIONS ====================

export interface Student {
  id: number;
  name: string;
  roll_no: string;
  class_name: string;
  phone?: string;
  email: string;
  attendance_percentage: number;
  status: string;
  enrollment_date: string;
  date_of_birth?: string;
  parent_contact?: string;
  address?: string;
  user?: number;
}

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  classes_count: number;
  students_count: number;
  phone?: string;
  email: string;
  status: string;
  join_date: string;
  employee_id?: string;
  qualification?: string;
  experience_years?: number;
  user?: number;
}

export interface Class {
  id: number;
  name: string;
  students_count: number;
  subjects_count: number;
  section?: string;
  teacher_name?: string;
  teacher?: number;
  room: string;
  schedule?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  day_of_week?: string;
  calendar_type?: string;
  is_active: boolean;
}

export interface ClassRoom {
  id: number;
  name: string;
  grade_level: string;
  section: string;
  room_code: string;
  assigned_teacher?: number;
  students_count: number;
  subjects_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: number;
  code: string;
  title: string;
  description?: string;
  classes_count: number;
  teachers_count: number;
  students_count: number;
  is_active: boolean;
  credit_hours: number;
}

export interface Grade {
  id: number;
  student: number;
  subject: number;
  student_name: string;
  student_roll_no: string;
  subject_name: string;
  grade_type: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  notes?: string;
  date_recorded: string;
  created_at: string;
}

export interface Attendance {
  id: number;
  student: number;
  class_assigned: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  marked_by?: number;
}

export interface Enrollment {
  id: number;
  student: number;
  classroom: number;
  enrollment_date: string;
  is_active: boolean;
}

export interface TeacherAssignment {
  id: number;
  teacher: number;
  class_assigned: number;
  subject: number;
  assigned_date: string;
  is_active: boolean;
}

export interface ClassSubject {
  id: number;
  class_assigned: number;
  subject: number;
  is_compulsory: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Room {
  id: number;
  room_number: string;
  name?: string;
  room_type: string;
  capacity: number;
  floor?: string;
  building?: string;
  has_projector: boolean;
  has_computer: boolean;
  has_whiteboard: boolean;
  is_active: boolean;
}

export interface FeeStructure {
  id: number;
  name: string;
  amount: number;
  due_date: string;
  class_assigned?: number;
  description?: string;
  is_active: boolean;
}

export interface FeePayment {
  id: number;
  student: number;
  fee_structure: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  status: string;
}

export interface Exam {
  id: number;
  name: string;
  exam_type: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  class_assigned: number;
  total_marks: number;
  passing_marks: number;
  instructions?: string;
  is_published: boolean;
}

export interface ExamSchedule {
  id: number;
  exam: number;
  subject: number;
  date: string;
  start_time: string;
  end_time: string;
  room?: number;
  invigilator?: number;
  max_marks: number;
  duration_minutes: number;
}


export interface ExamResult {
  id: number;
  student: number;
  exam: number;
  subject: number;
  marks_obtained: number;
  max_marks: number;
  grade?: string;
  remarks?: string;
  is_absent: boolean;
  percentage: number;
  passed: boolean;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  assignment_type?: string;
  subject: number;
  subject_name?: string;
  class_assigned: number;
  class_name?: string;
  teacher?: number;
  teacher_name?: string;
  assigned_date?: string;
  due_date?: string;
  max_marks?: number;
  status?: string;
  attachment_url?: string;
  instructions?: string;
  total_submissions?: number;
  pending_submissions?: number;
}

export interface AssignmentSubmission {
  id: number;
  assignment: number;
  assignment_title?: string;
  student: number;
  student_name?: string;
  submission_date?: string;
  submission_text?: string;
  attachment_url?: string;
  status?: string;
  marks_obtained?: number;
  feedback?: string;
  graded_by?: number;
  graded_by_name?: string;
}

// Admin Section Interfaces
export interface AdmissionQuery {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  source: string;
  description?: string;
  query_date: string;
  last_follow_up_date?: string;
  next_follow_up_date?: string;
  assigned?: string;
  reference?: string;
  class?: string;
  number_of_child?: number;
  status?: string;
  created_at?: string;
}

export interface VisitorBook {
  id: number;
  purpose: string;
  name: string;
  phone?: string;
  id_number?: string;
  no_of_person: number;
  date: string;
  in_time: string;
  out_time?: string;
  file_attachment?: string;
  created_by?: string;
  created_at?: string;
}

export interface Complaint {
  id: number;
  complaint_by: string;
  complaint_type: string;
  source: string;
  phone?: string;
  date: string;
  actions_taken?: string;
  assigned?: string;
  description?: string;
  file_attachment?: string;
  status?: string;
  created_at?: string;
}

export interface PostalReceive {
  id: number;
  from_title: string;
  reference_no: string;
  address: string;
  note?: string;
  to_title: string;
  date: string;
  file_attachment?: string;
  created_at?: string;
}

export interface PostalDispatch {
  id: number;
  to_title: string;
  reference_no: string;
  address: string;
  note?: string;
  from_title: string;
  date: string;
  file_attachment?: string;
  created_at?: string;
}

export interface PhoneCallLog {
  id: number;
  name: string;
  phone: string;
  date: string;
  description?: string;
  next_follow_up_date?: string;
  call_duration?: string;
  call_type?: string;
  created_at?: string;
}

export interface AdminSetupItem {
  id: number;
  name: string;
  type: string;
  value?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

// Behaviour / Incident interfaces
export interface IncidentType {
  id: number;
  title: string;
  point: number;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface StudentIncident {
  id: number;
  student: number;
  incident_type: number;
  date: string;
  points: number;
  notes?: string;
  recorded_by?: number;
  created_at?: string;
}

export interface BehaviourSetting {
  id: number;
  comment_option: 'student' | 'parent';
  view_option: 'student' | 'parent';
  created_at?: string;
  updated_at?: string;
}

// ==================== Library Interfaces ====================
export interface BookCategory {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface LibraryMember {
  id: number;
  name: string;
  member_type: string; // student / teacher / external
  roll_no?: string;
  class_assigned?: number;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  created_at?: string;
  user?: number;
}

export interface Book {
  id: number;
  title: string;
  author?: string;
  isbn?: string;
  category?: number;
  category_title?: string;
  publisher?: string;
  publication_year?: number;
  total_copies?: number;
  available_copies?: number;
  location?: string;
  is_reference?: boolean;
  created_at?: string;
}

export interface BookIssue {
  id: number;
  book: number;
  book_title?: string;
  member: number;
  member_name?: string;
  issue_date: string;
  due_date?: string;
  return_date?: string;
  fine_amount?: number;
  status?: string;
  created_at?: string;
}

// ==================== Transport Interfaces ====================
export interface TransportRoute {
  id: number;
  title: string;
  fare: number;
  is_active: boolean;
}

export interface TransportVehicle {
  id: number;
  vehicle_no: string;
  registration_no?: string;
  vehicle_type?: string;
  driver_name?: string;
  driver_mobile?: string;
  capacity?: number;
  is_active: boolean;
}

export interface VehicleAssignment {
  id: number;
  route: number;
  vehicle: number;
  assigned_at: string;
}

// ==================== Dormitory Interfaces ====================
export interface DormRoomType {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
}

export interface DormRoom {
  id: number;
  room_number: string;
  room_type?: number;
  capacity?: number;
  is_active: boolean;
}

export interface DormitoryAssignment {
  id: number;
  room: number;
  student: number;
  assigned_date: string;
  vacated_date?: string;
}

// ==================== HR / Leave / RolePermission Interfaces ====================
export interface Designation {
  id: number;
  title: string;
  description?: string;
  created_at?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Employee {
  id: number;
  user?: number;
  name: string;
  employee_id?: string;
  designation?: number;
  department?: number;
  phone?: string;
  email?: string;
  is_active: boolean;
  join_date?: string;
  created_at?: string;
}

export interface StaffAttendance {
  id: number;
  employee: number;
  date: string;
  status: 'present' | 'absent' | 'on_leave';
  notes?: string;
  recorded_by?: number;
  created_at?: string;
}

export interface PayrollRecord {
  id: number;
  employee: number;
  month: number;
  year: number;
  basic: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  created_at?: string;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  is_paid: boolean;
  created_at?: string;
}

export interface LeaveDefine {
  id: number;
  role?: string;
  leave_type: number;
  days_allowed: number;
  created_at?: string;
}

export interface LeaveApplication {
  id: number;
  applicant: number;
  leave_type: number;
  from_date: string;
  to_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at?: string;
  approved_by?: number;
  approved_at?: string;
}

export interface RoleItem {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface LoginPermission {
  id: number;
  user: number;
  can_login: boolean;
  reason?: string;
  created_at?: string;
}

export interface DueFeesLoginPermission {
  id: number;
  user: number;
  allowed_when_due: boolean;
  threshold_amount: number;
  created_at?: string;
}

// ==================== Wallet / Accounts / Inventory Interfaces ====================
export interface WalletAccount {
  id: number;
  user?: number;
  name: string;
  balance: number;
  is_active?: boolean;
  created_at?: string;
}

export interface WalletTransaction {
  id: number;
  wallet: number;
  transaction_type: string;
  amount: number;
  reference?: string;
  status?: string;
  notes?: string;
  created_at?: string;
}

export interface WalletDepositRequest {
  id: number;
  wallet: number;
  amount: number;
  file_receipt?: string;
  status?: string;
  created_at?: string;
}

export interface WalletRefundRequest {
  id: number;
  transaction: number;
  amount: number;
  reason?: string;
  status?: string;
  created_at?: string;
}

export interface ChartOfAccount {
  id: number;
  code: string;
  name: string;
  account_type: string;
  balance: number;
  created_at?: string;
}

export interface AccountTransaction {
  id: number;
  account: number;
  amount: number;
  is_credit: boolean;
  reference?: string;
  notes?: string;
  created_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  email?: string;
  created_at?: string;
}

export interface ItemCategory {
  id: number;
  title: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Item {
  id: number;
  name: string;
  category?: number;
  description?: string;
  total_in_stock?: number;
  created_at?: string;
}

export interface ItemReceive {
  id: number;
  item: number;
  supplier?: number;
  quantity: number;
  received_at?: string;
}

export interface ItemIssue {
  id: number;
  item: number;
  issued_to: string;
  quantity: number;
  issued_at?: string;
}

// ==================== BASE API CLASS ====================

class BaseAPIService<T> {
  constructor(protected endpoint: string) {}

  async getAll(params?: Record<string, any>): Promise<T[]> {
    try {
      const response = await authClient.get(this.endpoint, { params });
      return response.data;
    } catch (err: any) {
      // normalize thrown error if axios interceptor attached normalized info
      if (err?.normalized) throw err.normalized;
      throw err;
    }
  }

  async getById(id: number): Promise<T> {
    try {
      const response = await authClient.get(`${this.endpoint}${id}/`);
      return response.data;
    } catch (err: any) {
      if (err?.normalized) throw err.normalized;
      throw err;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const response = await authClient.post(this.endpoint, data);
      return response.data;
    } catch (err: any) {
      // Some backend endpoints expect POST at a '/create/' subpath (legacy pattern).
      // If server returns 405 Method Not Allowed, retry at endpoint + 'create/'.
      if (err?.response?.status === 405) {
        try {
          const fallbackUrl = this.endpoint.endsWith('/') ? `${this.endpoint}create/` : `${this.endpoint}/create/`;
          const response = await authClient.post(fallbackUrl, data);
          return response.data;
        } catch (err2: any) {
          if (err2?.normalized) throw err2.normalized;
          throw err2;
        }
      }
      if (err?.normalized) throw err.normalized;
      throw err;
    }
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    try {
      const response = await authClient.put(`${this.endpoint}${id}/`, data);
      return response.data;
    } catch (err: any) {
      if (err?.normalized) throw err.normalized;
      throw err;
    }
  }

  async partialUpdate(id: number, data: Partial<T>): Promise<T> {
    try {
      const response = await authClient.patch(`${this.endpoint}${id}/`, data);
      return response.data;
    } catch (err: any) {
      if (err?.normalized) throw err.normalized;
      throw err;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await authClient.delete(`${this.endpoint}${id}/`);
    } catch (err: any) {
      if (err?.normalized) throw err.normalized;
      throw err;
    }
  }
}

// ==================== SERVICE INSTANCES ====================

export const studentApi = new BaseAPIService<Student>('/api/admin/students/');
export const teacherApi = new BaseAPIService<Teacher>('/api/admin/teachers/');
export const classApi = new BaseAPIService<Class>('/api/admin/classes/');
export const classRoomApi = new BaseAPIService<ClassRoom>('/api/admin/classrooms/');
export const subjectApi = new BaseAPIService<Subject>('/api/admin/subjects/');
export const gradeApi = new BaseAPIService<Grade>('/api/admin/grades/');
export const attendanceApi = new BaseAPIService<Attendance>('/api/admin/attendance/');
export const enrollmentApi = new BaseAPIService<Enrollment>('/api/admin/enrollments/');
export const teacherAssignmentApi = new BaseAPIService<TeacherAssignment>('/api/admin/teacher-assignments/');
export const classSubjectApi = new BaseAPIService<ClassSubject>('/api/admin/class-subjects/');
export const roomApi = new BaseAPIService<Room>('/api/admin/rooms/');
export const feeStructureApi = new BaseAPIService<FeeStructure>('/api/admin/fee-structures/');
export const feePaymentApi = new BaseAPIService<FeePayment>('/api/admin/fee-payments/');
export const examApi = new BaseAPIService<Exam>('/api/admin/exams/');
export const examScheduleApi = new BaseAPIService<ExamSchedule>('/api/admin/exam-schedules/');
export const examResultApi = new BaseAPIService<ExamResult>('/api/admin/exam-results/');
export const assignmentApi = new BaseAPIService<Assignment>('/api/admin/assignments/');
export const assignmentSubmissionApi = new BaseAPIService<AssignmentSubmission>('/api/admin/assignment-submissions/');
export const incidentTypeApi = new BaseAPIService<IncidentType>('/api/admin/incident-types/');
export const studentIncidentApi = new BaseAPIService<StudentIncident>('/api/admin/student-incidents/');
export const behaviourSettingsApi = new BaseAPIService<BehaviourSetting>('/api/admin/behaviour-settings/');

// Library API services
export const bookCategoryApi = new BaseAPIService<BookCategory>('/api/admin/book-categories/');
export const libraryMemberApi = new BaseAPIService<LibraryMember>('/api/admin/library-members/');
export const bookApi = new BaseAPIService<Book>('/api/admin/books/');
export const bookIssueApi = new BaseAPIService<BookIssue>('/api/admin/book-issues/');
// Library API services were defined above. Transport and Dormitory services are defined later with API_BASE.

// HR / Leave / RolePermission services
export const designationApi = new BaseAPIService<Designation>('/api/admin/designations/');
export const departmentApi = new BaseAPIService<Department>('/api/admin/departments/');
export const employeeApi = new BaseAPIService<Employee>('/api/admin/employees/');
export const staffAttendanceApi = new BaseAPIService<StaffAttendance>('/api/admin/staff-attendance/');
export const payrollApi = new BaseAPIService<PayrollRecord>('/api/admin/payroll-records/');

export const leaveTypeApi = new BaseAPIService<LeaveType>('/api/admin/leave-types/');
export const leaveDefineApi = new BaseAPIService<LeaveDefine>('/api/admin/leave-defines/');
export const leaveApplicationApi = new BaseAPIService<LeaveApplication>('/api/admin/leave-applications/');

export const roleApi = new BaseAPIService<RoleItem>('/api/admin/roles/');
export const loginPermissionApi = new BaseAPIService<LoginPermission>('/api/admin/login-permissions/');
export const dueFeesLoginPermissionApi = new BaseAPIService<DueFeesLoginPermission>('/api/admin/due-fees-login-permissions/');

// Wallet / Accounts / Inventory services
export const walletAccountApi = new BaseAPIService<WalletAccount>('/api/admin/wallet-accounts/');
export const walletTransactionApi = new BaseAPIService<WalletTransaction>('/api/admin/wallet-transactions/');
export const walletDepositApi = new BaseAPIService<WalletDepositRequest>('/api/admin/wallet-deposits/');
export const walletRefundApi = new BaseAPIService<WalletRefundRequest>('/api/admin/wallet-refunds/');

export const chartOfAccountApi = new BaseAPIService<ChartOfAccount>('/api/admin/chart-of-accounts/');
export const accountTransactionApi = new BaseAPIService<AccountTransaction>('/api/admin/account-transactions/');

export const supplierApi = new BaseAPIService<Supplier>('/api/admin/suppliers/');
export const itemCategoryApi = new BaseAPIService<ItemCategory>('/api/admin/item-categories/');
export const itemApi = new BaseAPIService<Item>('/api/admin/items/');
export const itemReceiveApi = new BaseAPIService<ItemReceive>('/api/admin/item-receives/');
export const itemIssueApi = new BaseAPIService<ItemIssue>('/api/admin/item-issues/');

// ==================== Reports Interfaces & Services ====================
export interface ReportItem {
  id: number;
  title?: string;
  report_type?: string;
  student?: number | null;
  classroom?: number | null;
  term?: string | null;
  generated_by?: number | null;
  created_at?: string;
}

export interface ReportAnalytics {
  type: string;
  summary?: Record<string, any>;
  grade_distribution?: Array<{ grade: string; count: number; percentage: number }>;
  generated_at?: string;
}

export const reportApi = new BaseAPIService<ReportItem>('/api/admin/reports/');

export async function generateStudentReport(payload: Record<string, any>) {
  const response = await authClient.post('/api/admin/reports/generate_student_report/', payload);
  return response.data;
}

// ==================== SPECIALIZED API FUNCTIONS ====================

// ==================== Communicate / Chat / Style Interfaces & Services ====================
export interface EmailTemplate {
  id: number;
  name: string;
  subject?: string;
  body?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface SmsTemplate {
  id: number;
  name: string;
  body?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface EmailSmsLog {
  id: number;
  template_type: 'email' | 'sms';
  template?: number | null;
  recipients?: string; // comma separated or JSON depending on backend
  subject?: string;
  body?: string;
  status?: string;
  sent_at?: string;
}

export interface ChatInvitation {
  id: number;
  from_user?: number;
  to_user?: number;
  message?: string;
  status?: string;
  created_at?: string;
}

export interface BlockedChatUser {
  id: number;
  user?: number;
  blocked_user?: number;
  reason?: string;
  created_at?: string;
}

export interface ColorTheme {
  id: number;
  name: string;
  primary_color?: string;
  secondary_color?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface BackgroundSetting {
  id: number;
  name: string;
  background_type?: string; // 'image'|'color' etc
  value?: string; // url or color value
  is_active?: boolean;
  created_at?: string;
}

export const emailTemplateApi = new BaseAPIService<EmailTemplate>('/api/admin/email-templates/');
export const smsTemplateApi = new BaseAPIService<SmsTemplate>('/api/admin/sms-templates/');
export const emailSmsLogApi = new BaseAPIService<EmailSmsLog>('/api/admin/email-sms-logs/');

export const chatInvitationApi = new BaseAPIService<ChatInvitation>('/api/admin/chat-invitations/');
export const chatBlockedUserApi = new BaseAPIService<BlockedChatUser>('/api/admin/chat-blocked-users/');

export const colorThemeApi = new BaseAPIService<ColorTheme>('/api/admin/color-themes/');
export const backgroundSettingApi = new BaseAPIService<BackgroundSetting>('/api/admin/background-settings/');

/**
 * Dashboard Stats
 */
export async function getDashboardStats() {
  const response = await authClient.get('/api/admin/dashboard/stats/');
  return response.data;
}

export async function getRecentActivities() {
  const response = await authClient.get('/api/admin/dashboard/activities/');
  return response.data;
}

export async function getUpcomingEvents() {
  const response = await authClient.get('/api/admin/dashboard/events/');
  return response.data;
}

/**
 * Student-specific operations
 */
export async function getStudentStats() {
  const response = await authClient.get('/api/admin/students/stats/');
  return response.data;
}

export async function importStudents(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await authClient.post('/api/admin/students/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function downloadStudentCredentials() {
  const response = await authClient.get('/api/admin/students/download-credentials/', {
    responseType: 'blob'
  });
  return response.data;
}

/**
 * Teacher-specific operations
 */
export async function getTeacherStats() {
  const response = await authClient.get('/api/admin/teachers/stats/');
  return response.data;
}

export async function assignTeacherToClass(teacherId: number, classId: number, subjectId: number) {
  return teacherAssignmentApi.create({
    teacher: teacherId,
    class_assigned: classId,
    subject: subjectId,
    is_active: true
  });
}

/**
 * Class-specific operations
 */
export async function getClassStats() {
  const response = await authClient.get('/api/admin/classes/stats/');
  return response.data;
}

export async function getClassStudents(classId: number) {
  const response = await authClient.get(`/api/admin/attendance/class-students/?class_id=${classId}`);
  return response.data;
}

export async function assignSubjectToClass(classId: number, subjectId: number, isCompulsory = true) {
  return classSubjectApi.create({
    class_assigned: classId,
    subject: subjectId,
    is_compulsory: isCompulsory,
    is_active: true
  });
}

/**
 * Attendance operations
 */
export async function markAttendance(attendanceData: Partial<Attendance>[]) {
  const response = await authClient.post('/api/admin/attendance/', attendanceData);
  return response.data;
}

export async function getAttendanceByDate(date: string, classId?: number) {
  const params: Record<string, any> = { date };
  if (classId) params.class_id = classId;
  const response = await authClient.get('/api/admin/attendance/', { params });
  return response.data;
}

/**
 * Grade operations
 */
export async function getGradeStats() {
  const response = await authClient.get('/api/admin/grades/stats/');
  return response.data;
}

export async function getStudentGrades(studentId: number) {
  const response = await authClient.get('/api/admin/grades/', {
    params: { student: studentId }
  });
  return response.data;
}

/**
 * Room operations
 */
export async function getRoomStats() {
  const response = await authClient.get('/api/admin/rooms/stats/');
  return response.data;
}

export async function getAvailableRooms(date?: string, startTime?: string, endTime?: string) {
  const params: Record<string, any> = {};
  if (date) params.date = date;
  if (startTime) params.start_time = startTime;
  if (endTime) params.end_time = endTime;
  const response = await authClient.get('/api/admin/rooms/', { params });
  return response.data;
}

/**
 * Report Analytics
 */
export async function getReportAnalytics(reportType: string, filters?: Record<string, any>) {
  const response = await authClient.get(`/api/admin/reports/analytics/?type=${reportType}`, {
    params: filters
  });
  return response.data;
}

/**
 * Enrollment operations
 */
export async function enrollStudent(studentId: number, classroomId: number) {
  return enrollmentApi.create({
    student: studentId,
    classroom: classroomId,
    is_active: true
  });
}

export async function unenrollStudent(enrollmentId: number) {
  return enrollmentApi.delete(enrollmentId);
}

export async function getStudentEnrollments(studentId: number) {
  const response = await authClient.get('/api/admin/enrollments/', {
    params: { student: studentId }
  });
  return response.data;
}

/**
 * Fee operations
 */
export async function getStudentFeeStatus(studentId: number) {
  const response = await authClient.get(`/api/admin/fee-payments/?student=${studentId}`);
  return response.data;
}

export async function recordFeePayment(paymentData: Partial<FeePayment>) {
  return feePaymentApi.create(paymentData);
}

/**
 * Exam operations
 */
export async function publishExam(examId: number) {
  const response = await authClient.post(`/api/admin/exams/${examId}/publish/`);
  return response.data;
}

export async function getExamResults(examId: number) {
  const response = await authClient.get('/api/admin/exam-results/', {
    params: { exam: examId }
  });
  return response.data;
}

export async function getStudentExamPerformance(studentId: number, examId?: number) {
  const params: Record<string, any> = { student: studentId };
  if (examId) params.exam = examId;
  const response = await authClient.get('/api/admin/exam-results/', { params });
  return response.data;
}

// Create subject (backend exposes a separate create endpoint)
export async function createSubject(payload: Partial<Subject>) {
  const response = await authClient.post('/api/admin/subjects/create/', payload);
  return response.data;
}

// Export all as default for convenience
export default {
  student: studentApi,
  teacher: teacherApi,
  class: classApi,
  classRoom: classRoomApi,
  subject: subjectApi,
  grade: gradeApi,
  attendance: attendanceApi,
  enrollment: enrollmentApi,
  teacherAssignment: teacherAssignmentApi,
  classSubject: classSubjectApi,
  room: roomApi,
  feeStructure: feeStructureApi,
  feePayment: feePaymentApi,
  exam: examApi,
  examSchedule: examScheduleApi,
  examResult: examResultApi,
  incidentType: incidentTypeApi,
  studentIncident: studentIncidentApi,
  behaviourSetting: behaviourSettingsApi,
  // Library
  bookCategory: bookCategoryApi,
  libraryMember: libraryMemberApi,
  book: bookApi,
  bookIssue: bookIssueApi,
  // Helper functions
  getDashboardStats,
  getRecentActivities,
  getUpcomingEvents,
  getStudentStats,
  importStudents,
  downloadStudentCredentials,
  getTeacherStats,
  assignTeacherToClass,
  getClassStats,
  getClassStudents,
  assignSubjectToClass,
  markAttendance,
  getAttendanceByDate,
  getGradeStats,
  getStudentGrades,
  getRoomStats,
  getAvailableRooms,
  getReportAnalytics,
  enrollStudent,
  unenrollStudent,
  getStudentEnrollments,
  getStudentFeeStatus,
  recordFeePayment,
  publishExam,
  getExamResults,
  getStudentExamPerformance,
};

// ==================== ADMIN SECTION API SERVICES ====================

export const admissionQueryApi = new BaseAPIService<AdmissionQuery>(`${API_BASE}/api/admin/admission-queries`);
export const visitorBookApi = new BaseAPIService<VisitorBook>(`${API_BASE}/api/admin/visitor-book`);
export const complaintApi = new BaseAPIService<Complaint>(`${API_BASE}/api/admin/complaints`);
export const postalReceiveApi = new BaseAPIService<PostalReceive>(`${API_BASE}/api/admin/postal-receive`);
export const postalDispatchApi = new BaseAPIService<PostalDispatch>(`${API_BASE}/api/admin/postal-dispatch`);
export const phoneCallLogApi = new BaseAPIService<PhoneCallLog>(`${API_BASE}/api/admin/phone-call-logs`);
export const adminSetupApi = new BaseAPIService<AdminSetupItem>(`${API_BASE}/api/admin/setup-items`);
export const dormRoomTypeApi = new BaseAPIService<DormRoomType>(`${API_BASE}/api/admin/dorm-room-types`);
export const dormRoomApi = new BaseAPIService<DormRoom>(`${API_BASE}/api/admin/dorm-rooms`);
export const dormAssignmentApi = new BaseAPIService<DormitoryAssignment>(`${API_BASE}/api/admin/dormitory-assignments`);
export const transportRouteApi = new BaseAPIService<TransportRoute>(`${API_BASE}/api/admin/transport-routes`);
export const transportVehicleApi = new BaseAPIService<TransportVehicle>(`${API_BASE}/api/admin/transport-vehicles`);
export const vehicleAssignmentApi = new BaseAPIService<VehicleAssignment>(`${API_BASE}/api/admin/vehicle-assignments`);
// Re-export transport & dorm services on the default export object for convenience
// (append to default export via the `export default` earlier in file is left unchanged; consumers can import named exports)
