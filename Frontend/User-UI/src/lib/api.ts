const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-d68q.onrender.com/api';

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
      cache: options.cache ?? 'no-store',
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

  getCredit: (params?: { skip?: number; take?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi<any>(`/products/credit?${query}`);
  },
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

// CMS API
export const cmsApi = {
  getBanners: () => fetchApi<any[]>('/cms/banners'),
  getSections: () => fetchApi<any[]>('/cms/sections'),
};

// Wishlist API
export const wishlistApi = {
  getMine: () => fetchApi<any[]>('/wishlist'),
  add: (productId: string) =>
    fetchApi<any>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  remove: (productId: string) =>
    fetchApi<any>(`/wishlist/${productId}`, {
      method: 'DELETE',
    }),
};

// Wholesale API
export const wholesaleApi = {
  getAccount: (userId: string) => fetchApi<any>(`/wholesale/${userId}`),
  apply: (data: any) =>
    fetchApi<any>('/wholesale/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Locations & Shipping API
export const locationsApi = {
  getCountries: () => fetchApi<any[]>('/countries'),
  getStates: (countryId: string) => fetchApi<any[]>(`/states?countryId=${countryId}`),
  getCities: (stateId: string) => fetchApi<any[]>(`/cities?stateId=${stateId}`),
  
  getShippingStatus: () => fetchApi<boolean>('/shipping-zones/status'),
  getMatchingShipping: (countryId?: string, stateId?: string, cityId?: string) => {
    const params = new URLSearchParams();
    if (countryId) params.append('countryId', countryId);
    if (stateId) params.append('stateId', stateId);
    if (cityId) params.append('cityId', cityId);
    return fetchApi<any[]>(`/shipping-zones/matching?${params.toString()}`);
  },
};

// Settings API
export const settingsApi = {
  getShippingConfig: () => fetchApi<{ fee: number; threshold: number }>('/settings/shipping'),
  getShippingMethods: () => fetchApi<any[]>('/shipping/active'),
  getAll: () => fetchApi<any[]>('/settings'),
  update: (key: string, value: string) =>
    fetchApi<any>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
};

export default fetchApi;
