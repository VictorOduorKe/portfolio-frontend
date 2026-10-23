const getApiUrl = () => {
  if (import.meta.env.PROD) {
    let url = import.meta.env.VITE_API_URL;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  return '/api';
};

export const API_URL = getApiUrl();

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Strip /api from the end of API_URL
  const baseUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
  return `${baseUrl}${url}`;
};

export const stripBaseUrl = (url) => {
  if (!url) return '';
  const baseUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
  if (baseUrl && url.startsWith(baseUrl)) {
    return url.substring(baseUrl.length);
  }
  return url;
};

const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('api_token');
    const isFormData = options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };
    const res = await fetch(`${API_URL}${url}`, { ...options, headers });
    if (res.status === 401) {
        localStorage.removeItem('api_token');
        if (token) {
            window.location.reload();
        }
    }
    if (!res.ok) {
        let errMessage = 'Request failed';
        let errData = null;
        try {
            errData = await res.json();
            errMessage = errData.error || errMessage;
        } catch {
            // Non-JSON error response from server
        }
        
        const error = new Error(errMessage);
        if (errData && errData.errors) {
            error.errors = errData.errors;
        }
        throw error;
    }
    return res.json();
};

export const login = (email, password) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const verifyOtp = (email, token) => fetchWithAuth('/auth/verify', { method: 'POST', body: JSON.stringify({ email, token }) });
export const uploadImage = (formData) => fetchWithAuth('/upload', { method: 'POST', body: formData });

export const getProjects = () => fetchWithAuth('/projects');
export const createProject = (data) => fetchWithAuth('/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id, data) => fetchWithAuth(`/projects?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id) => fetchWithAuth(`/projects?id=${id}`, { method: 'DELETE' });

export const getSettings = () => fetchWithAuth('/admin/settings');
export const updateSettings = (data) => fetchWithAuth('/admin/settings', { method: 'PUT', body: JSON.stringify(data) });
export const getAdminLogs = () => fetchWithAuth('/admin/logs');

export const generateBackup = () => fetchWithAuth('/admin/backup');

export const getSkills = () => fetchWithAuth('/skills');
export const createSkill = (data) => fetchWithAuth('/skills', { method: 'POST', body: JSON.stringify(data) });
export const updateSkill = (id, data) => fetchWithAuth(`/skills?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSkill = (id) => fetchWithAuth(`/skills?id=${id}`, { method: 'DELETE' });

export const getRoadmaps = () => fetchWithAuth('/roadmaps');
export const createRoadmap = (data) => fetchWithAuth('/roadmaps', { method: 'POST', body: JSON.stringify(data) });
export const updateRoadmap = (id, data) => fetchWithAuth(`/roadmaps?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRoadmap = (id) => fetchWithAuth(`/roadmaps?id=${id}`, { method: 'DELETE' });

export const getNews = () => fetchWithAuth('/news');
export const createNews = (data) => fetchWithAuth('/news', { method: 'POST', body: JSON.stringify(data) });
export const updateNews = (id, data) => fetchWithAuth(`/news?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteNews = (id) => fetchWithAuth(`/news?id=${id}`, { method: 'DELETE' });

export const getTestimonials = () => fetchWithAuth('/testimonials');
export const createTestimonial = (data) => fetchWithAuth('/testimonials', { method: 'POST', body: JSON.stringify(data) });
export const updateTestimonial = (id, data) => fetchWithAuth(`/testimonials?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTestimonial = (id) => fetchWithAuth(`/testimonials?id=${id}`, { method: 'DELETE' });

export const sendChatMessage = (messages, sessionId) => fetchWithAuth('/chat', { 
  method: 'POST', 
  body: JSON.stringify({ messages, session_id: sessionId }) 
});

export const getCsrfToken = () => fetchWithAuth('/csrf-token');
export const submitContact = (data) => fetchWithAuth('/contact', { 
  method: 'POST', 
  body: JSON.stringify(data),
  headers: {
    'X-CSRF-Token': data.csrf_token
  }
});
export const getContactMessages = () => fetchWithAuth('/admin/contacts');
