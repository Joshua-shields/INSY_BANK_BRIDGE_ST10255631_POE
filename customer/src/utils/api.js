//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import axios from 'axios';

// Base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT auth token
// CSRF token only added for auth routes (login, register, etc.)
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only fetch CSRF token for public auth routes that require it
    const authRoutes = ['/login', '/register', '/forgot-password', '/forgot-username'];
    const isAuthRoute = authRoutes.some(route => config.url?.includes(route));
    
    if (config.method !== 'get' && isAuthRoute) {
      try {
        const csrfInstance = axios.create({
          baseURL: API_BASE_URL,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const csrfResponse = await csrfInstance.get('/csrf-token');
        config.headers['X-CSRF-Token'] = csrfResponse.data.csrfToken;
      } catch (error) {
        console.error('CSRF token fetch error:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't redirect on login failures, MFA failures, or transfer failures
      if (!url.includes('/login') && !url.includes('/mfa/') && !url.includes('/payments/transfer') && !url.includes('/payments/local-transfer')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('accountNumber');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  verifyAccount: async (token) => {
    const response = await api.post('/verify', { token });
    return response.data;
  },

  forgotPassword: async (passwordData) => {
    const response = await api.post('/forgot-password', passwordData);
    return response.data;
  },

  forgotUsername: async (email) => {
    const response = await api.post('/forgot-username', { email });
    return response.data;
  },
};

// Customer API calls
export const customerAPI = {
  getProfile: async () => {
    const response = await api.get('/customer/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/customer/profile', profileData);
    return response.data;
  },
  
  getBalance: async () => {
    const response = await api.get('/customer/balance');
    return response.data;
  },
  
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/customer/transactions?${params}`);
    return response.data;
  },
  
  sendPayment: async (paymentData) => {
    const response = await api.post('/customer/payments', paymentData);
    return response.data;
  },
  
  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/customer/payments/${paymentId}`);
    return response.data;
  },

  transfer: async (transferData) => {
    const response = await api.post('/api/payments/transfer', transferData);
    return response.data;
  },

  localTransfer: async (transferData) => {
    const response = await api.post('/api/payments/local-transfer', transferData);
    return response.data;
  },

  setupMFA: async (accountNumber) => {
    const response = await api.post('/api/mfa/setup', { accountNumber });
    return response.data;
  },

  verifyMFA: async (accountNumber, token) => {
    const response = await api.post('/api/mfa/verify', { accountNumber, token });
    return response.data;
  },
};

// Employee API calls (for employee portal)
export const employeeAPI = {
  login: async (credentials) => {
    const response = await api.post('/employee/login', credentials);
    return response.data;
  },
  
  getCustomers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/employee/customers?${params}`);
    return response.data;
  },
  
  getCustomerDetails: async (customerId) => {
    const response = await api.get(`/employee/customers/${customerId}`);
    return response.data;
  },
  
  verifyPayment: async (paymentId, status) => {
    const response = await api.put(`/employee/payments/${paymentId}/verify`, { status });
    return response.data;
  },
  
  getPendingPayments: async () => {
    const response = await api.get('/employee/payments/pending');
    return response.data;
  },
};

// Utility functions
export const utils = {
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },
  
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
  
  validateAccountNumber: (accountNumber) => {
    return /^\d{10,16}$/.test(accountNumber);
  },
  
   validateSwiftCode: (swiftCode) => {
     return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swiftCode);
   },
  
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      return error.response.data.error || error.response.data.message || 'An error occurred';
    } else if (error.request) {
      // Request was made but no response received
      return 'Network error. Please check your connection.';
    } else {
      // Something else happened
      return 'An unexpected error occurred';
    }
  },
};

export default api;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////
