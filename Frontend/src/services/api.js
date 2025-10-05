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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
  removeMember: (boardId, memberId) => api.delete(`/boards/${boardId}/members/${memberId}`),
};

// Cards API
export const cardsAPI = {
  getAll: (boardId) => api.get(`/boards/${boardId}/cards`),
  create: (boardId, data) => api.post(`/boards/${boardId}/cards`, data),
  update: (boardId, cardId, data) => api.put(`/boards/${boardId}/cards/${cardId}`, data),
  delete: async (boardId, cardId) => {
    const url = `/boards/${boardId}/cards/${cardId}`;
    console.log('🌐 API DELETE request:', { boardId, cardId, url });
    
    try {
      const response = await api.delete(url);
      console.log('✅ API DELETE success:', response.status);
      return response;
    } catch (error) {
      console.error('❌ API DELETE error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập lại');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền xóa card này');
      } else if (error.response?.status === 404) {
        throw new Error('Card không tồn tại');
      } else if (!error.response) {
        throw new Error('Lỗi kết nối mạng');
      }
      
      throw error;
    }
  },
  
  // Card members
  addMember: (boardId, cardId, data) => api.post(`/boards/${boardId}/cards/${cardId}/members`, data),
  removeMember: (boardId, cardId, memberId) => api.delete(`/boards/${boardId}/cards/${cardId}/members/${memberId}`),
  
  // Card comments  
  getComments: (boardId, cardId) => api.get(`/boards/${boardId}/cards/${cardId}/comments`),
  createComment: (boardId, cardId, data) => api.post(`/boards/${boardId}/cards/${cardId}/comments`, data),
  deleteComment: (boardId, cardId, commentId) => api.delete(`/boards/${boardId}/cards/${cardId}/comments/${commentId}`),
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