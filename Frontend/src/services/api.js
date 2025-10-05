import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔐 API Request interceptor:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'None'
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No auth token found in localStorage');
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.warn('🔑 Token expired or invalid, redirecting to login');
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendCode: (email, type = 'signin') => api.post('/auth/send-code', { email, type }),
  signup: (data) => api.post('/auth/signup', data),
  signin: (data) => api.post('/auth/signin', data),
  getMe: () => api.get('/auth/me'),
  githubAuth: () => `${API_BASE_URL}/auth/github`,
};

// Boards API
export const boardsAPI = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  invite: (id, data) => api.post(`/boards/${id}/invite`, data),
  acceptInvitation: (data) => api.post('/boards/invitations/accept', data),
};

// Cards API
export const cardsAPI = {
  getAll: (boardId) => api.get(`/boards/${boardId}/cards`),
  create: (boardId, data) => api.post(`/boards/${boardId}/cards`, data),
  update: (boardId, cardId, data) => api.put(`/boards/${boardId}/cards/${cardId}`, data),
  delete: async (boardId, cardId) => {
    const url = `/boards/${boardId}/cards/${cardId}`;
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🗑️ CardsAPI.delete called:', { 
      boardId, 
      cardId, 
      url,
      fullUrl: `${API_BASE_URL}${url}`,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'None',
      hasUser: !!user,
      userData: user ? JSON.parse(user) : null,
      baseURL: API_BASE_URL 
    });

    // Check if we have authentication
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('Authentication required. Please login.');
    }
    
    try {
      console.log('📡 Making DELETE request to:', `${API_BASE_URL}${url}`);
      const response = await api.delete(url);
      console.log('✅ CardsAPI.delete success:', response);
      return response;
    } catch (error) {
      console.error('❌ CardsAPI.delete error:', {
        url: `${API_BASE_URL}${url}`,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          headers: error.config?.headers
        }
      });
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this card.');
      } else if (error.response?.status === 404) {
        throw new Error('Card not found or already deleted.');
      } else if (!error.response) {
        throw new Error('Network error. Check if backend server is running.');
      }
      
      throw error;
    }
  },
};

// Tasks API
export const tasksAPI = {
  getAll: (boardId, cardId) => api.get(`/boards/${boardId}/cards/${cardId}/tasks`),
  create: (boardId, cardId, data) => api.post(`/boards/${boardId}/cards/${cardId}/tasks`, data),
  update: (boardId, cardId, taskId, data) => api.put(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`, data),
  delete: (boardId, cardId, taskId) => api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`),
  addMember: (boardId, cardId, taskId, data) => api.post(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/members`, data),
  removeMember: (boardId, cardId, taskId, memberId) => api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/members/${memberId}`),
};

// GitHub API
export const githubAPI = {
  getRepoInfo: (repoId) => api.get(`/repositories/${repoId}/github-info`),
  createAttachment: (data) => api.post('/github/attachments', data),
};

export default api;