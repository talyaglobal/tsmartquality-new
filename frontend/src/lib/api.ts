import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/users/register', { name, email, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.patch('/users/me', userData);
    return response.data;
  },
  
  logout: () => {
    Cookies.remove('auth_token');
  }
};

// Products API
export const productsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Quality Checks API
export const qualityChecksAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/quality-checks', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/quality-checks/${id}`);
    return response.data;
  },
  
  getByProductId: async (productId: string) => {
    const response = await api.get(`/quality-checks/product/${productId}`);
    return response.data;
  },
  
  create: async (checkData: any) => {
    const response = await api.post('/quality-checks', checkData);
    return response.data;
  },
  
  update: async (id: string, checkData: any) => {
    const response = await api.put(`/quality-checks/${id}`, checkData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/quality-checks/${id}`);
    return response.data;
  }
};

export default api;