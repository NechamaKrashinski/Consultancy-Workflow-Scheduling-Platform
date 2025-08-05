

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
  status: string;
  service?: {
    name: string;
  };
  client?: {
    name: string;
    email: string;
  };
  notes?: string;
}


export interface Service {
  id: number | undefined;
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
export interface BusinessConsultantState {
  id: number; // מזהה ייחודי
  name: string; // שם היועץ
  password: string; // סיסמת היועץ
  email: string; // דוא"ל היועץ
  role: 'manager' | 'consultant'; // תפקיד היועץ
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
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface UpdateMeetingData {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date?: string;
  time?: string;
  notes?: string;
}

export interface CreateServiceData {

  id: number | undefined;
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
