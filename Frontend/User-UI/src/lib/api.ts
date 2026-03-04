const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) =>
    fetchApi<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => fetchApi<any>('/auth/me'),

  refreshToken: () =>
    fetchApi<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
    }),
};

// Products API
export const productsApi = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi<{ products: any[]; total: number }>(`/products?${query}`);
  },

  getById: (id: string) => fetchApi<any>(`/products/${id}`),

  getFeatured: () => fetchApi<any[]>('/products/featured'),

  getFlashSales: () => fetchApi<any[]>('/products/flash-sales'),
};

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi<any[]>('/categories'),
  getBySlug: (slug: string) => fetchApi<any>(`/categories/${slug}`),
};

// Orders API
export const ordersApi = {
  create: (orderData: any) =>
    fetchApi<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getMyOrders: () => fetchApi<any[]>('/orders/my-orders'),

  getById: (id: string) => fetchApi<any>(`/orders/${id}`),
};

// Credit API
export const creditApi = {
  apply: (creditData: any) =>
    fetchApi<any>('/credit/apply', {
      method: 'POST',
      body: JSON.stringify(creditData),
    }),

  getMyCredits: () => fetchApi<any[]>('/credit/my-credits'),

  getPlans: () => fetchApi<any[]>('/credit/plans'),
};

// Wallet API
export const walletApi = {
  getBalance: () => fetchApi<any>('/wallet/balance'),

  getTransactions: () => fetchApi<any[]>('/wallet/transactions'),

  deposit: (amount: number) =>
    fetchApi<any>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
};

export default fetchApi;
