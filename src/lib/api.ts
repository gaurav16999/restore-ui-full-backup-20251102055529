import { API_BASE } from './config';
import authClient from './http';

// Enhanced fetch with timeout and better error handling
async function apiRequest(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (e) {
        // If can't parse JSON, use status-based messages
        if (response.status === 404) {
          errorMessage = `Server endpoint not found (${response.status}). Please ensure the backend server is running at ${API_BASE}`;
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please check your credentials.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your internet connection and server status.');
    }
    if (error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE}. Please ensure the backend is running.`);
    }
    throw error;
  }
}

export async function postToken(email: string, password: string) {
  const res = await apiRequest(`${API_BASE}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),  // Send as 'email' field, not 'username'
  });
  return res.json();
}

export async function postRefreshToken(refresh: string) {
  const res = await apiRequest(`${API_BASE}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  return res.json();
}

export async function getProfile(accessToken: string) {
  const res = await authClient.get(`/api/users/profile/`);
  return res.data;
}

export async function getTeacherDashboard(accessToken: string) {
  const res = await authClient.get(`/api/teacher/dashboard/`);
  return res.data;
}

export async function getStudentDashboard(accessToken: string) {
  const res = await authClient.get(`/api/student/dashboard/`);
  return res.data;
}

export async function getStudentCourses() {
  const res = await authClient.get('/api/student/courses/');
  return res.data;
}

export async function getNotifications() {
  const res = await authClient.get('/api/student/notifications/');
  return res.data;
}

export async function markNotificationAsRead(id: string) {
  const res = await authClient.post('/api/student/notifications/', {
    action: 'mark_read',
    id: id
  });
  return res.data;
}

export async function markAllNotificationsAsRead() {
  const res = await authClient.post('/api/student/notifications/', {
    action: 'mark_all_read'
  });
  return res.data;
}

export async function getStudentAssignments(accessToken: string) {
  const res = await apiRequest(`${API_BASE}/api/student/assignments/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export async function getStudentSchedule(accessToken: string) {
  const res = await apiRequest(`${API_BASE}/api/student/schedule/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export async function getStudentGrades(accessToken: string) {
  const res = await apiRequest(`${API_BASE}/api/student/grades/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export async function getStudentAttendance(accessToken: string) {
  const res = await apiRequest(`${API_BASE}/api/student/attendance/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export async function getStudentMessages(accessToken: string) {
  const res = await apiRequest(`${API_BASE}/api/student/messages/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export async function getStudentAchievements(accessToken: string) {
  const res = await apiRequest(`${API_BASE}/api/student/achievements/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

// Admin API functions - using authClient for automatic token refresh
export async function getDashboardStats() {
  const res = await authClient.get(`/api/admin/dashboard/stats/`);
  return res.data;
}

export async function getRecentActivities() {
  const res = await authClient.get(`/api/admin/dashboard/activities/`);
  return res.data;
}

export async function getUpcomingEvents() {
  const res = await authClient.get(`/api/admin/dashboard/events/`);
  return res.data;
}

export async function getStudents() {
  const res = await authClient.get(`/api/admin/students/`);
  return res.data;
}

export async function getStudentStats() {
  const res = await authClient.get(`/api/admin/students/stats/`);
  return res.data;
}

export async function getTeachers() {
  const res = await authClient.get(`/api/admin/teachers/`);
  return res.data;
}

export async function getTeacherStats() {
  const res = await authClient.get(`/api/admin/teachers/stats/`);
  return res.data;
}

export async function getClasses() {
  const res = await authClient.get(`/api/admin/classes/`);
  // Handle paginated response
  return Array.isArray(res.data) ? res.data : (res.data.results || []);
}

export async function getClassRooms() {
  const res = await authClient.get(`/api/admin/classrooms/`);
  return res.data;
}

export async function getClassesStats() {
  const res = await authClient.get(`/api/admin/classes/stats/`);
  return res.data;
}

export async function getSubjects() {
  const res = await authClient.get(`/api/admin/subjects/`);
  // Handle paginated response
  return Array.isArray(res.data) ? res.data : (res.data.results || []);
}

// Create operations
export async function createStudent(accessToken: string, data: any) {
  const res = await authClient.post('/api/admin/students/create/', data);
  return res.data;
}

export async function importStudents(accessToken: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/admin/students/import/`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || error.detail || error.message || 'Failed to import students');
  }
  return res.json();
}

export async function downloadStudentCredentials(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/students/download-credentials/`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || error.detail || error.message || 'Failed to download credentials');
  }
  
  // Return blob for file download
  return res.blob();
}

export async function createTeacher(accessToken: string, data: any) {
  const res = await authClient.post('/api/admin/teachers/create/', data);
  return res.data;
}

export async function createClass(accessToken: string, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/classes/create/`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to create class');
  }
  return res.json();
}

export async function createSubject(accessToken: string, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/subjects/create/`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to create subject');
  }
  return res.json();
}

// Room management functions
export async function getRooms() {
  const res = await authClient.get(`/api/admin/rooms/`);
  return res.data;
}

export async function getRoomStats() {
  const res = await authClient.get(`/api/admin/rooms/stats/`);
  return res.data;
}

export async function createRoom(data: any) {
  const res = await authClient.post(`/api/admin/rooms/create/`, data);
  return res.data;
}

export async function updateRoom(id: number, data: any) {
  const res = await authClient.put(`/api/admin/rooms/${id}/`, data);
  return res.data;
}

export async function deleteRoom(id: number) {
  const res = await authClient.delete(`/api/admin/rooms/${id}/`);
  return res.data;
}

// Update operations
export async function updateStudent(accessToken: string, id: number, data: any) {
  const res = await authClient.put(`/api/admin/students/${id}/`, data);
  return res.data;
}

export async function updateTeacher(accessToken: string, id: number, data: any) {
  const res = await authClient.put(`/api/admin/teachers/${id}/`, data);
  return res.data;
}

export async function updateClass(accessToken: string, id: number, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/classes/${id}/`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to update class');
  }
  return res.json();
}

export async function updateSubject(accessToken: string, id: number, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/subjects/${id}/`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to update subject');
  }
  return res.json();
}

// Delete operations
export async function deleteStudent(accessToken: string, id: number) {
  const res = await authClient.delete(`/api/admin/students/${id}/`);
  return res.data;
}

export async function deleteTeacher(accessToken: string, id: number) {
  const res = await authClient.delete(`/api/admin/teachers/${id}/`);
  return res.data;
}

export async function deleteClass(accessToken: string, id: number) {
  const res = await fetch(`${API_BASE}/api/admin/classes/${id}/`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to delete class');
  }
  return res.ok;
}

export async function deleteSubject(accessToken: string, id: number) {
  const res = await fetch(`${API_BASE}/api/admin/subjects/${id}/`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to delete subject');
  }
  return res.ok;
}

// Status toggle operations
export async function toggleTeacherStatus(accessToken: string, id: number) {
  const res = await authClient.patch(`/api/admin/teachers/${id}/`, { toggle_status: true });
  return res.data;
}

export async function toggleStudentStatus(accessToken: string, id: number) {
  const res = await authClient.patch(`/api/admin/students/${id}/`, { toggle_status: true });
  return res.data;
}

// Grade management functions
export async function getGrades(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/grades/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to fetch grades');
  }
  return res.json();
}

export async function getGradeStats(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/grades/stats/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to fetch grade stats');
  }
  return res.json();
}

export async function createGrade(accessToken: string, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/grades/`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to create grade');
  }
  return res.json();
}

export async function updateGrade(accessToken: string, id: number, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/grades/${id}/`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to update grade');
  }
  return res.json();
}

export async function deleteGrade(accessToken: string, id: number) {
  const res = await fetch(`${API_BASE}/api/admin/grades/${id}/`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to delete grade');
  }
  return res.ok;
}

// Reports and Analytics functions
export async function getReports(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/reports/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to fetch reports');
  }
  return res.json();
}

export async function getClassAnalytics(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/analytics/class/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to fetch class analytics');
  }
  return res.json();
}

export async function getStudentProgress(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/analytics/progress/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to fetch student progress');
  }
  return res.json();
}

export async function getGradeDistribution(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/analytics/distribution/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to fetch grade distribution');
  }
  return res.json();
}

// Attendance Management
export async function getClassStudents(classId: string) {
  const res = await authClient.get(`/api/admin/class-students/?class_id=${classId}`);
  return res.data;
}

export async function getAttendance(classId: string, date: string) {
  const res = await authClient.get(`/api/admin/attendance/?class_id=${classId}&date=${date}`);
  return res.data;
}

export async function saveAttendanceRecords(records: Array<any>) {
  const res = await authClient.post(`/api/admin/attendance/`, records);
  return res.data;
}

// Teacher-specific API functions

export async function getTeacherClasses(accessToken: string) {
  const res = await authClient.get(`/api/teacher/classes/`);
  return res.data;
}

export async function getTeacherStudents(accessToken: string, classId?: string) {
  const res = await authClient.get(`/api/teacher/students/`, { params: classId ? { class_id: classId } : undefined });
  return res.data;
}

export async function getTeacherGrades(accessToken: string, classId?: string) {
  const res = await authClient.get(`/api/teacher/grades/`, { params: classId ? { class_id: classId } : undefined });
  return res.data;
}

export async function getTeacherAssignments(accessToken: string) {
  const res = await authClient.get(`/api/teacher/assignments/`);
  return res.data;
}

export async function createTeacherAssignment(accessToken: string, data: any) {
  const res = await authClient.post(`/api/teacher/assignments/create/`, data);
  return res.data;
}

export async function getTeacherMessages(accessToken: string) {
  const res = await authClient.get(`/api/teacher/messages/`);
  return res.data;
}

export async function sendTeacherMessage(accessToken: string, data: any) {
  const res = await authClient.post(`/api/teacher/messages/send/`, data);
  return res.data;
}

export async function getTeacherResources(accessToken: string) {
  const res = await authClient.get(`/api/teacher/resources/`);
  return res.data;
}

export async function uploadTeacherResource(accessToken: string, formData: FormData) {
  const res = await authClient.post(`/api/teacher/resources/upload/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
}

export async function getTeacherAttendance(accessToken: string, classId: string, date: string) {
  const res = await authClient.get(`/api/teacher/attendance/`, { params: { class_id: classId, date } });
  return res.data;
}

export async function submitTeacherAttendance(accessToken: string, data: any) {
  const res = await authClient.post(`/api/teacher/attendance/submit/`, data);
  return res.data;
}

// Admin Teacher Assignment APIs
export async function getAdminTeacherAssignments() {
  const res = await authClient.get(`/api/admin/teacher-assignments/`);
  return res.data;
}

export async function getAdminTeacherAssignmentById(id: number) {
  const res = await authClient.get(`/api/admin/teacher-assignments/${id}/`);
  return res.data;
}

export async function createAdminTeacherAssignment(data: any) {
  const res = await authClient.post(`/api/admin/teacher-assignments/`, data);
  return res.data;
}

export async function updateAdminTeacherAssignment(id: number, data: any) {
  const res = await authClient.put(`/api/admin/teacher-assignments/${id}/`, data);
  return res.data;
}

export async function deleteAdminTeacherAssignment(id: number) {
  const res = await authClient.delete(`/api/admin/teacher-assignments/${id}/`);
  return res.data;
}

export async function getAdminTeacherAssignmentStats() {
  const res = await authClient.get(`/api/admin/teacher-assignments/stats/`);
  return res.data;
}

export async function getAssignmentsByTeacher(teacherId: number) {
  const res = await authClient.get(`/api/admin/teacher-assignments/by_teacher/`, { params: { teacher_id: teacherId } });
  return res.data;
}

export async function getAssignmentsByClass(classroomId: number) {
  const res = await authClient.get(`/api/admin/teacher-assignments/by_class/`, { params: { classroom_id: classroomId } });
  return res.data;
}

// Class-Subject Management
export async function getAdminClassSubjects() {
  const res = await authClient.get('/api/admin/class-subjects/');
  return res.data;
}

export async function getAdminClassSubjectStats() {
  const res = await authClient.get('/api/admin/class-subjects/stats/');
  return res.data;
}

export async function createAdminClassSubject(data: { class_assigned: number; subject: number; is_compulsory: boolean }) {
  const res = await authClient.post('/api/admin/class-subjects/', data);
  return res.data;
}

export async function deleteAdminClassSubject(id: number) {
  const res = await authClient.delete(`/api/admin/class-subjects/${id}/`);
  return res.data;
}

export async function getSubjectsByClass(classId: number) {
  const res = await authClient.get(`/api/admin/class-subjects/by_class/`, { params: { class_id: classId } });
  return res.data;
}

export async function getClassesBySubject(subjectId: number) {
  const res = await authClient.get(`/api/admin/class-subjects/by_subject/`, { params: { subject_id: subjectId } });
  return res.data;
}

