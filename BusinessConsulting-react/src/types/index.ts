
// Export filter types first
export * from './filters';

// Import types we need locally
import type { MeetingStatus } from './filters';

// UI Types
export type TabId = 'overview' | 'services' | 'meetings' | 'consultant-linking' | 'upload-files' | 'view-profile';

// Error handling types
export interface ApiErrorResponse {
  message: string;
  status?: number;
  data?: Record<string, unknown>;
}

export interface ApiError {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message: string;
}

// Utility function for type-safe error handling
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    
    // Check for Axios error response
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    
    // Check for general error message
    if (apiError.message) {
      return apiError.message;
    }
  }
  
  return 'An unexpected error occurred';
};

export interface BusinessDetail {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email: string;
  website?: string;
  description?: string;
}


export interface User {
  id: number;
  name: string;
  phone?: string;
  email: string;
  role: 'manager' | 'client';
}

export interface Meeting {
  id: number;
  user_id: number;
  service_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: MeetingStatus;
  service?: {
    name: string;
    price: number;
    duration: number;
  };
  client?: {
    name: string;
    email: string;
  };
  BusinessHour?: {
    business_consultant_id: number;
    BusinessConsultant?: {
      id: number;
      name: string;
      email: string;
    };
  };
  notes?: string;
}


export interface Service {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
}

export interface MeetingState {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
}
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}
export interface CreateMeetingData {
  businessHourId: number;
  serviceId: number;
  clientId: number;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateMeetingData {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date?: string;
  time?: string;
  notes?: string;
}

export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  isActive?: boolean;
}


 

export interface BusinessConsultant {
  id: number; 
  name: string; 
  password: string; 
  email: string; 
  role: 'manager' | 'consultant'; 
}

export interface BusinessConsultantState {
  consultants: BusinessConsultant[];
  isLoading: boolean;
  error: string | null;
}

export interface TimeSlot {
  start: string;
  end: string;
  businessHourId: number;
}

export interface AvailableSlots {
  [consultantId: string]: {
    [date: string]: TimeSlot[];
  };
}
