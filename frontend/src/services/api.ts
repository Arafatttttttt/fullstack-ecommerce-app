import axios from 'axios';
import { User, Product, Cart, Order, AuthResponse, Review, ProductReviewsResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
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

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getProductById: async (id: string): Promise<{ success: boolean; data: Product }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  getCategories: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/products/categories');
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  getCart: async (): Promise<{ success: boolean; data: Cart }> => {
    const response = await api.get('/cart');
    return response.data;
  },
  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },
  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },
  removeFromCart: async (itemId: string) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getOrders: async (): Promise<{ success: boolean; data: Order[] }> => {
    const response = await api.get('/orders');
    return response.data;
  },
  getOrderById: async (id: string): Promise<{ success: boolean; data: Order }> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  createOrder: async (orderData: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    paymentIntentId?: string;
    paymentMethod?: string;
    upiId?: string;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  createPaymentIntent: async (amount?: number) => {
    const response = await api.post('/orders/payment-intent', { amount });
    return response.data;
  },
  cancelOrder: async (orderId: string, reason: string) => {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: async (productId: string): Promise<{
    success: boolean;
    data: ProductReviewsResponse;
  }> => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },
  createReview: async (productId: string, rating: number, comment?: string) => {
    const response = await api.post(`/reviews/product/${productId}`, { rating, comment });
    return response.data;
  },
  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default api;
