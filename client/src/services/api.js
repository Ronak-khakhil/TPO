const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('cp_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('cp_token', token);
  else localStorage.removeItem('cp_token');
};

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  // Auth & System
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),
  resetSeedData: () => request('/auth/seed-demo', { method: 'POST' }),

  // Drives
  getDrives: () => request('/drives'),
  getDriveById: (id) => request(`/drives/${id}`),
  createDrive: (data) => request('/drives', { method: 'POST', body: JSON.stringify(data) }),
  updateDrive: (id, data) => request(`/drives/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  approveDrive: (id, remarks) => request(`/drives/${id}/approve`, { method: 'POST', body: JSON.stringify({ remarks }) }),
  rejectDrive: (id, reason) => request(`/drives/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  publishDrive: (id) => request(`/drives/${id}/publish`, { method: 'POST' }),
  checkEligibility: (id) => request(`/drives/${id}/check-eligibility`),

  // Applications
  applyToDrive: (driveId, data = {}) => request(`/drives/${driveId}/applications`, { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: () => request('/applications/me'),
  getDriveApplicants: (driveId) => request(`/drives/${driveId}/applications`),
  updateApplicationStatus: (appId, data) => request(`/applications/${appId}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  batchUpdateApplicationStatus: (payload) => request('/applications/batch-status', { method: 'POST', body: JSON.stringify(payload) }),

  // Results & Offers
  getResults: () => request('/results'),
  publishResult: (data) => request('/results', { method: 'POST', body: JSON.stringify(data) }),
  respondToOffer: (id, response) => request(`/results/${id}/respond`, { method: 'POST', body: JSON.stringify({ response }) }),

  // Reports
  getPlacementStats: () => request('/reports/placements'),
  getExportCSVUrl: () => `${BASE_URL}/reports/export-csv`,

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),

  // Audit Logs
  getAuditLogs: () => request('/audit-logs'),

  // Profiles
  updateStudentProfile: (data) => request('/students/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  updateCompanyProfile: (data) => request('/companies/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  getAllStudents: () => request('/students'),
  getAllCompanies: () => request('/companies'),

  // Resume Operations
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const token = getAuthToken();
    return fetch(`${BASE_URL}/students/resume`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Resume upload failed');
      return data;
    });
  },
  deleteResume: () => request('/students/resume', { method: 'DELETE' }),
  getResumeViewUrl: () => {
    const token = getAuthToken();
    return `${BASE_URL}/students/resume${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  getStudentResumeUrl: (studentId) => {
    const token = getAuthToken();
    return `${BASE_URL}/students/${studentId}/resume${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // Recruiter Verification (TPO)
  verifyRecruiter: (companyId, remarks) => request(`/companies/${companyId}/verify`, { method: 'POST', body: JSON.stringify({ remarks }) }),
  rejectRecruiter: (companyId, reason) => request(`/companies/${companyId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  createRecruiter: (data) => request('/companies/create', { method: 'POST', body: JSON.stringify(data) })
};
