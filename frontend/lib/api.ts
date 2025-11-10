// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

// Types
export type UserRole = 'employee' | 'manager' | 'finance';

export type ReimbursementStatus = 
  | 'pending' 
  | 'approved_manager' 
  | 'rejected_manager' 
  | 'approved_finance' 
  | 'rejected_finance' 
  | 'completed';

export type ReimbursementCategory = 
  | 'transport' 
  | 'accommodation' 
  | 'meals' 
  | 'office_supply' 
  | 'other';

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Reimbursement {
  id: number;
  employee_id: number;
  employee_name: string;
  title: string;
  description: string;
  category: ReimbursementCategory;
  amount: number;
  receipt_url: string;
  status: ReimbursementStatus;
  submitted_date: string;
  manager_id?: number;
  manager_notes?: string;
  manager_approved?: string;
  finance_id?: number;
  finance_notes?: string;
  finance_approved?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateReimbursementRequest {
  title: string;
  description: string;
  category: ReimbursementCategory;
  amount: number;
  receipt_url: string;
}

export interface UpdateReimbursementRequest {
  title?: string;
  description?: string;
  category?: ReimbursementCategory;
  amount?: number;
  receipt_url?: string;
}

export interface ApprovalRequest {
  action: 'approve' | 'reject';
  notes?: string;
}

export interface ReimbursementStats {
  total_submitted: number;
  total_approved: number;
  total_rejected: number;
  total_pending: number;
  total_amount: number;
}

// API Error
export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new APIError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getProfile: (): Promise<User> => {
    return apiRequest<User>('/profile');
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return getAuthToken() !== null;
  },
};

// Upload API
export const uploadAPI = {
  uploadReceipt: async (file: File): Promise<{ url: string; filename: string; size: number }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('receipt', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/receipt`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new APIError(response.status, error.error || 'Upload failed');
    }

    return response.json();
  },
};

// Reimbursement API
export const reimbursementAPI = {
  getAll: (): Promise<Reimbursement[]> => {
    return apiRequest<Reimbursement[]>('/reimbursements');
  },

  getById: (id: number): Promise<Reimbursement> => {
    return apiRequest<Reimbursement>(`/reimbursements/${id}`);
  },

  create: (data: CreateReimbursementRequest): Promise<Reimbursement> => {
    return apiRequest<Reimbursement>('/reimbursements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number, data: UpdateReimbursementRequest): Promise<Reimbursement> => {
    return apiRequest<Reimbursement>(`/reimbursements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/reimbursements/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: (): Promise<ReimbursementStats> => {
    return apiRequest<ReimbursementStats>('/reimbursements/stats');
  },
};

// Manager API
export const managerAPI = {
  getPending: (): Promise<Reimbursement[]> => {
    return apiRequest<Reimbursement[]>('/manager/pending');
  },

  approve: (id: number, data: ApprovalRequest): Promise<Reimbursement> => {
    return apiRequest<Reimbursement>(`/manager/reimbursements/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Finance API
export const financeAPI = {
  getPending: (): Promise<Reimbursement[]> => {
    return apiRequest<Reimbursement[]>('/finance/pending');
  },

  approve: (id: number, data: ApprovalRequest): Promise<Reimbursement> => {
    return apiRequest<Reimbursement>(`/finance/reimbursements/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: (): Promise<User[]> => {
    return apiRequest<User[]>('/users');
  },
};

// Health check
export const healthAPI = {
  check: (): Promise<{ status: string }> => {
    return apiRequest<{ status: string }>('/health');
  },
};

// Helper function to get full URL for uploaded files
export const getFileUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};
