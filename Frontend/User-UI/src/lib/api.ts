const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api';

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
    // Determine revalidation time based on endpoint
    let revalidate: number | false = 60; // Default 1 minute
    
    if (endpoint.includes('/categories') || endpoint.includes('/cms/sections') || endpoint.includes('/settings') || endpoint.includes('/cms/footer/config')) {
      revalidate = 0; // Disable cache for these to ensure instant updates
    } else if (endpoint.includes('/products')) {
      revalidate = 600; // 10 minutes for products
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: options.cache ?? 'no-store',
      ...options,
      next: (options as any).next || (options.method === 'GET' || !options.method ? { revalidate } : undefined),
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
  login: (identifier: string, password: string) =>
    fetchApi<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  register: (userData: {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
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
  getAll: (params?: { 
    categoryId?: string; 
    search?: string; 
    skip?: number; 
    take?: number;
    featured?: boolean;
    allowCredit?: boolean;
    isWholesaleOnly?: boolean;
    showInactive?: boolean;
  }) => {
    // Build query string with correct parameter names
    const queryParams = new URLSearchParams();
    
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.take !== undefined) queryParams.append('take', String(params.take));
    if (params?.featured !== undefined) queryParams.append('featured', String(params.featured));
    if (params?.allowCredit !== undefined) queryParams.append('allowCredit', String(params.allowCredit));
    if (params?.isWholesaleOnly !== undefined) queryParams.append('isWholesaleOnly', String(params.isWholesaleOnly));
    if (params?.showInactive !== undefined) queryParams.append('showInactive', String(params.showInactive));
    
    const query = queryParams.toString();
    return fetchApi<{ data: any[]; meta: { total: number; skip: number; take: number } }>(`/products${query ? '?' + query : ''}`);
  },

  getById: (id: string) => fetchApi<any>(`/products/${id}`),

  getFeatured: (take?: number) => {
    const query = take ? `?take=${take}` : '';
    return fetchApi<any[]>(`/products/featured${query}`);
  },

  getFlashSales: () => fetchApi<any[]>('/products/flash-sales'),

  getCredit: (params?: { skip?: number; take?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.take !== undefined) queryParams.append('take', String(params.take));
    
    const query = queryParams.toString();
    return fetchApi<{ data: any[]; meta: { total: number; skip: number; take: number } }>(`/products/credit${query ? '?' + query : ''}`);
  },
};

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi<any[]>('/categories'),
  getBySlug: (slug: string) => fetchApi<any>(`/categories/${slug}`),
};

// Brands API
export const brandsApi = {
  getAll: () => fetchApi<any[]>('/brands'),
  getById: (id: string) => fetchApi<any>(`/brands/${id}`),
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

  trackOrder: (orderNumber: string, email: string) =>
    fetchApi<any>(`/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`),
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
  getHomePageSections: () => fetchApi<any[]>('/cms/homepage-sections'),
  getFooter: () => fetchApi<any>('/cms/footer'),
  getFooterConfig: () => fetchApi<any>('/cms/footer/config'),
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
  getMatchingShipping: (countryId?: string, stateId?: string, cityId?: string, manual?: boolean, stateName?: string, cityName?: string) => {
    const params = new URLSearchParams();
    if (countryId) params.append('countryId', countryId);
    if (stateId) params.append('stateId', stateId);
    if (cityId) params.append('cityId', cityId);
    if (manual) params.append('manual', 'true');
    if (stateName) params.append('stateName', stateName);
    if (cityName) params.append('cityName', cityName);
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
