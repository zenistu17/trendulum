import axios from 'axios';
import { 
  User, 
  CreatorProfile, 
  ContentIdea, 
  MonetizationIdea,
  AnalysisResponse,
  ContentGenerationResponse,
  MonetizationGenerationResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: async (email: string, username: string, password: string): Promise<User> => {
    const response = await api.post('/register', { email, username, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<{ access_token: string; token_type: string }> => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/me');
    return response.data;
  },
};

// Creator profile endpoints
export const creatorProfileAPI = {
  create: async (profile: Partial<CreatorProfile>): Promise<CreatorProfile> => {
    const response = await api.post('/creator-profiles', profile);
    return response.data;
  },

  getAll: async (): Promise<CreatorProfile[]> => {
    const response = await api.get('/creator-profiles');
    return response.data;
  },

  getById: async (id: number): Promise<CreatorProfile> => {
    const response = await api.get(`/creator-profiles/${id}`);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/creator-profiles/${id}`);
    return response.data;
  },
  update: async (id: number, data: Partial<CreatorProfile>): Promise<CreatorProfile> => {
    const response = await api.put(`/creator-profiles/${id}`, data);
    return response.data;
  },
};

// Analysis endpoints
export const analysisAPI = {
  analyzeAudience: async (creatorProfileId: number, additionalContext?: string): Promise<AnalysisResponse> => {
    const response = await api.post('/analyze-audience', {
      creator_profile_id: creatorProfileId,
      additional_context: additionalContext,
    });
    return response.data;
  },
};

// Content generation endpoints
export const contentAPI = {
  deleteIdea: async (ideaId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/content-ideas/${ideaId}`);
    return response.data;
  },
  generateIdeas: async (
    creatorProfileId: number,
    contentType: string,
    additionalConstraints?: string
  ): Promise<ContentGenerationResponse> => {
    const response = await api.post('/generate-content', {
      creator_profile_id: creatorProfileId,
      content_type: contentType,
      additional_constraints: additionalConstraints,
    });
    return response.data;
  },

  getAll: async (): Promise<ContentIdea[]> => {
    const response = await api.get('/content-ideas');
    return response.data;
  },

  getSaved: async (): Promise<ContentIdea[]> => {
    const response = await api.get('/content-ideas?saved=true');
    return response.data;
  },

  saveIdea: async (ideaId: number): Promise<{ message: string }> => {
    const response = await api.put(`/content-ideas/${ideaId}/save`);
    return response.data;
  },
};

// Monetization endpoints
export const monetizationAPI = {
  generateIdeas: async (
    creatorProfileId: number,
    collaborationType?: string
  ): Promise<MonetizationGenerationResponse> => {
    const response = await api.post('/generate-monetization', {
      creator_profile_id: creatorProfileId,
      collaboration_type: collaborationType,
    });
    return response.data;
  },

  getAll: async (): Promise<MonetizationIdea[]> => {
    const response = await api.get('/monetization-ideas');
    return response.data;
  },

  getSaved: async (): Promise<MonetizationIdea[]> => {
    const response = await api.get('/monetization-ideas?saved=true');
    return response.data;
  },

  saveIdea: async (ideaId: number): Promise<MonetizationIdea> => {
    const response = await api.put(`/monetization-ideas/${ideaId}/save`);
    return response.data;
  },
  deleteIdea: async (ideaId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/monetization-ideas/${ideaId}`);
    return response.data;
  },
};

export default api; 