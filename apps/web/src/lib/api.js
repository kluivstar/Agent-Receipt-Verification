const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => request('/health'),
  getNetworkConfig: () => request('/config/network'),
  getMetrics: () => request('/tasks/metrics'),
  
  listTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },
  getTask: (id) => request(`/tasks/${id}`),
  createTask: (data) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTaskStatus: (id, status) => request(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  createSubmission: (data) => request('/submissions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSubmission: (id) => request(`/submissions/${id}`),
  getSubmissionsForTask: (taskId) => request(`/submissions/task/${taskId}`),

  evaluateSubmission: (data) => request('/evaluations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getEvaluation: (id) => request(`/evaluations/${id}`),

  listReceipts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/receipts${query ? `?${query}` : ''}`);
  },
  getReceipt: (id) => request(`/receipts/${id}`),
  exportReceiptJson: async (id) => {
    const res = await fetch(`${API_BASE}/receipts/${id}/export`);
    if (!res.ok) throw new Error('Failed to export receipt');
    return res.json();
  }
};
