import axios from 'axios';
import type {
  User,
  Service,
  LoginCredentials,
  RegisterData,
  CreateServiceData,
  UpdateServiceData,
  CreateMeetingData,
  UpdateMeetingData,
  Meeting,
  BusinessConsultant,
  AvailableSlots,
} from '../types';

const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:3000';

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

// Response interceptor for error handling
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
//פונקציית מעטפת לקריאות api שלא דורשות slice
const apiCallWrapper = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.error('API Error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw error; // אפשר להחזיר את השגיאה כדי שתוכל לטפל בה במקום אחר אם צריך
    }
    throw error;
  }
};
// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post('/login', credentials);
    // השרת מחזיר: { success: true, message: "...", data: { token: "...", loginTime: "..." } }
    return { 
      token: response.data.data.token,
      user: {} as User // נמלא אחר כך מgetProfile
    };
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await api.post('/login/register', data);
    // השרת מחזיר: { success: true, message: "...", data: { token: "...", userType: "..." } }
    return { 
      token: response.data.data.token,
      user: {} as User // נמלא אחר כך מgetProfile
    };
  },

  loginWithGoogle: async (googleToken: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/google', { token: googleToken });
    return response.data;
  },

  refreshToken: async (): Promise<{ user: User; token: string }> => {
    const response = await api.post('/refresh');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/logout');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/profile');
    // נניח שהשרת מחזיר את הפרופיל ישירות או ב-response.data
    return response.data.data || response.data;
  },
};

// Services API
export const servicesAPI = {
  getServices: async (): Promise<Service[]> => {
    const response = await api.get('/services');
    return response.data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  createService: async (data: CreateServiceData): Promise<Service> => {
    const response = await api.post('/services', data);
    return response.data;
  },

  updateService: async (id: number, data: UpdateServiceData): Promise<Service> => {
    const response = await api.put(`/services/${id}`, { ...data, id });
    return response.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};

// MeetingTimeSlots API
export const meetingsAPI = {
  getMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get('/meetings');
    return response.data;
  },

  getMeetingById: async (id: string): Promise<Meeting> => {
    const response = await api.get(`/meetings/${id}`);
    return response.data;
  },

  createMeeting: async (data: CreateMeetingData): Promise<Meeting> => {
    const response = await api.post('/meetings', data);
    return response.data;
  },

  updateMeeting: async (id: string, data: UpdateMeetingData): Promise<Meeting> => {
    const response = await api.put(`/meetings/${id}`, data);
    return response.data;
  },

  deleteMeeting: async (id: string): Promise<void> => {
    await api.delete(`/meetings/${id}`);
  },

  getManagerMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get('/meetings/manager');
    return response.data;
  },

  getClientMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get('/meetings/client');
    return response.data;
  },

  getConsultantsByService: async (serviceId: string): Promise<BusinessConsultant[]> => {
    const response = await api.get(`/meetings/consultants/${serviceId}`);
    return response.data;
  },

 
  getAvailableTimes: async (dates: string[], consultantIds: number[], serviceId?: number): Promise<AvailableSlots> => {
     if (!serviceId) {
    console.warn('Service ID is undefined, cannot fetch available times');
    return {}; // או [], תלוי מה שאתה מצפה לקבל
  }
    const response = await api.post('/meetings/available-times', {
      dates,
      businessConsultantIds: consultantIds,
      serviceId
    });
    return response.data;
  },

};




  // BusinessConsultant API
  export const businessConsultantAPI = {
    createConsultant: async (data: { name: string; password: string; email: string; role: string }): Promise<BusinessConsultant> => {
      const response = await api.post('/business-consultants', data);
      return response.data;
    },
  
    getAllConsultants: async (): Promise<BusinessConsultant[]> => {
      const response = await api.get('/business-consultants');
      return response.data;
    },
  
    getConsultantById: async (id: string): Promise<BusinessConsultant> => {
      const response = await api.get(`/business-consultants/${id}`);
      return response.data;
    },
  
    updateConsultant: async (id: string, data: { name?: string; password?: string; email?: string; role?: string }): Promise<BusinessConsultant> => {
      const response = await api.put(`/business-consultants/${id}`, data);
      return response.data;
    },
  
    deleteConsultant: async (id: string): Promise<void> => {
      await api.delete(`/business-consultants/${id}`);
    },
  };

// ConsultantService API


export const consultantServiceAPI = {
  createConsultantService: async (data: { service_id: string; consultant_id: string }): Promise<void> => {
    return apiCallWrapper(() => api.post('/consultant-service', data));
  },

  deleteConsultantService: async (data: { serviceId: string; consultantId: string }): Promise<void> => {
    return apiCallWrapper(() => api.delete('/consultant-service', { data }));
  },
};


export default api;
