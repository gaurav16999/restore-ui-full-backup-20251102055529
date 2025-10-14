export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function postToken(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Authentication failed');
  }
  return res.json();
}

export async function getProfile(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/users/profile/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function getTeacherDashboard(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/teacher/dashboard/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch teacher dashboard');
  return res.json();
}

// Admin API functions
export async function getDashboardStats(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/dashboard/stats/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function getRecentActivities(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/dashboard/activities/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}

export async function getUpcomingEvents(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/dashboard/events/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function getStudents(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/students/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function getStudentStats(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/students/stats/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch student stats');
  return res.json();
}

export async function getTeachers(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/teachers/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return res.json();
}

export async function getTeacherStats(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/teachers/stats/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch teacher stats');
  return res.json();
}

export async function getClasses(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/classes/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch classes');
  return res.json();
}

export async function getClassStats(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/classes/stats/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch class stats');
  return res.json();
}

export async function getSubjects(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/admin/subjects/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

// Create operations
export async function createStudent(accessToken: string, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/students/create/`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to create student');
  }
  return res.json();
}

export async function createTeacher(accessToken: string, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/teachers/create/`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to create teacher');
  }
  return res.json();
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

// Update operations
export async function updateStudent(accessToken: string, id: number, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/students/${id}/`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to update student');
  }
  return res.json();
}

export async function updateTeacher(accessToken: string, id: number, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/teachers/${id}/`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to update teacher');
  }
  return res.json();
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
  const res = await fetch(`${API_BASE}/api/admin/students/${id}/`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to delete student');
  }
  return res.ok;
}

export async function deleteTeacher(accessToken: string, id: number) {
  const res = await fetch(`${API_BASE}/api/admin/teachers/${id}/`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Failed to delete teacher');
  }
  return res.ok;
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

