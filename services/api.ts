const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const getAuthHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

const getFetchOptions = (method: string = "GET", token?: string, body?: any) => ({
  method,
  headers: getAuthHeaders(token),
  cache: 'no-store' as RequestCache,
  ...(body && { body: JSON.stringify(body) }),
});

const appendDateFilters = (params: URLSearchParams, year?: string, month?: string) => {
  if (year && year !== "all") params.append("year", year);
  if (month && month !== "all") params.append("month", month);
};

export const api = {
  // Auth
  register: async (data: { firstName: string; lastName: string; email: string; password: string }) =>
    fetch(`${API_BASE_URL}/auth/register`, getFetchOptions("POST", undefined, data)).then((r) => r.json()),

  login: async (data: { email: string; password: string }) =>
    fetch(`${API_BASE_URL}/auth/login`, getFetchOptions("POST", undefined, data)).then((r) => r.json()),

  // Accounts
  getAccounts: async (token: string, year?: string, month?: string, accountId?: string) => {
    const params = new URLSearchParams();
    if (accountId) params.append("accountId", accountId);
    appendDateFilters(params, year, month);
    const query = params.toString();
    const url = query ? `${API_BASE_URL}/accounts?${query}` : `${API_BASE_URL}/accounts`;
    return fetch(url, getFetchOptions("GET", token)).then((r) => r.json());
  },

  syncAccounts: async (token: string, stripeKeyId: number) =>
    fetch(`${API_BASE_URL}/accounts/sync`, getFetchOptions("POST", token, { stripeKeyId })).then((r) => r.json()),

  getAccountsByKey: async (token: string, keyId: number) =>
    fetch(`${API_BASE_URL}/accounts/by-key/${keyId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  // Keys
  getKeys: async (token: string) =>
    fetch(`${API_BASE_URL}/keys`, getFetchOptions("GET", token)).then((r) => r.json()),

  createKey: async (token: string, data: { name: string; apiKey: string }) =>
    fetch(`${API_BASE_URL}/keys`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  checkKeys: async (token: string) =>
    fetch(`${API_BASE_URL}/keys/check`, getFetchOptions("GET", token)).then((r) => r.json()),

  updateKey: async (token: string, id: number, data: { name?: string; apiKey?: string }) =>
    fetch(`${API_BASE_URL}/keys/${id}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  deleteKey: async (token: string, id: number) =>
    fetch(`${API_BASE_URL}/keys/${id}`, getFetchOptions("DELETE", token)).then((r) => r.json()),

  // Roles
  getRoles: async (token: string) =>
    fetch(`${API_BASE_URL}/roles`, getFetchOptions("GET", token)).then((r) => r.json()),

  createRole: async (token: string, data: { name: string; permissions?: string[] }) =>
    fetch(`${API_BASE_URL}/roles`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updateRole: async (token: string, id: number, data: { name?: string; permissions?: string[] }) =>
    fetch(`${API_BASE_URL}/roles/${id}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  deleteRole: async (token: string, id: number) =>
    fetch(`${API_BASE_URL}/roles/${id}`, getFetchOptions("DELETE", token)).then((r) => r.json()),

  // Permissions
  getPermissions: async (token: string) =>
    fetch(`${API_BASE_URL}/permissions`, getFetchOptions("GET", token)).then((r) => r.json()),

  createPermission: async (token: string, data: { name: string; description?: string; resource?: string }) =>
    fetch(`${API_BASE_URL}/permissions`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updatePermission: async (token: string, id: number, data: { name?: string; description?: string; resource?: string }) =>
    fetch(`${API_BASE_URL}/permissions/${id}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  deletePermission: async (token: string, id: number) =>
    fetch(`${API_BASE_URL}/permissions/${id}`, getFetchOptions("DELETE", token)).then((r) => r.json()),

  // User Settings
  getUserSettings: async (token: string) =>
    fetch(`${API_BASE_URL}/user-settings`, getFetchOptions("GET", token)).then((r) => r.json()),

  getUserSettingsDetailed: async (token: string) =>
    fetch(`${API_BASE_URL}/user-settings/detailed`, getFetchOptions("GET", token)).then((r) => r.json()),

  upsertUserSetting: async (token: string, data: { settingId: number; value: string; metadata?: Record<string, unknown> }) =>
    fetch(`${API_BASE_URL}/user-settings/upsert`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  // Notifications
  getNotifications: async (token: string, page = 1, pageSize = 10, unreadOnly = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (unreadOnly) params.append("unread_only", "true");
    return fetch(`${API_BASE_URL}/notifications?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  updateNotificationRead: async (token: string, id: number, isRead: boolean) =>
    fetch(`${API_BASE_URL}/notifications/${id}/read`, getFetchOptions("PATCH", token, { isRead })).then((r) => r.json()),

  // Tax Settings
  getTaxSettings: async (token: string, accountId: number) =>
    fetch(`${API_BASE_URL}/tax-settings/${accountId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  upsertTaxSettings: async (
    token: string,
    accountId: number,
    data: {
      taxEnabled?: boolean;
      automaticTax?: boolean;
      taxIdCollection?: boolean;
      defaultTaxBehavior?: "exclusive" | "inclusive" | "unspecified";
      taxRates?: Array<{
        percentage: number;
        country: string;
        state?: string;
        description: string;
      }>;
      taxMode?: "automatic" | "manual";
      defaultTaxCode?: string;
      requireAddress?: boolean;
      taxRate?: number;
    }
  ) =>
    fetch(`${API_BASE_URL}/tax-settings/${accountId}`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  // Dashboard & Analytics
  getDashboard: async (token: string, accountId?: string, year?: string) => {
    const params = new URLSearchParams();
    if (accountId) params.append("accountId", accountId);
    if (year && year !== "all") params.append("year", year);

    const query = params.toString();
    const url = query
      ? `${API_BASE_URL}/dashboard?${query}`
      : `${API_BASE_URL}/dashboard`;
    return fetch(url, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getAnalyticsSummary: async (token: string, accountId?: string, year?: string, month?: string) => {
    const params = new URLSearchParams();
    if (accountId) params.append("accountId", accountId);
    appendDateFilters(params, year, month);

    const query = params.toString();
    const url = query
      ? `${API_BASE_URL}/analytics/summary?${query}`
      : `${API_BASE_URL}/analytics/summary`;
    return fetch(url, getFetchOptions("GET", token)).then((r) => r.json());
  },

  // Payments
  getPayments: async (token: string, page = 1, pageSize = 20, query = '', sort = '', year?: string, month?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/payments?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getPayment: async (token: string, paymentId: string) =>
    fetch(`${API_BASE_URL}/payments/${paymentId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createPayment: async (token: string, data: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    description?: string;
  }) =>
    fetch(`${API_BASE_URL}/payments`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updatePayment: async (token: string, paymentId: string, data: any) =>
    fetch(`${API_BASE_URL}/payments/${paymentId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  refundPayment: async (token: string, paymentId: string, data: {
    amount?: number;
    reason?: string;
  }) =>
    fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  // Payouts
  getPayouts: async (token: string, page = 1, pageSize = 20, query = '', sort = '', year?: string, month?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/payouts?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getPayout: async (token: string, payoutId: string) =>
    fetch(`${API_BASE_URL}/payouts/${payoutId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  // Refunds
  getRefunds: async (token: string, page = 1, pageSize = 20, query = '', sort = '', year?: string, month?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/refunds?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getRefund: async (token: string, refundId: string) =>
    fetch(`${API_BASE_URL}/refunds/${refundId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createRefund: async (token: string, data: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }) =>
    fetch(`${API_BASE_URL}/refunds`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  // Disputes
  getDisputes: async (token: string, page = 1, pageSize = 20, query = '', sort = '', year?: string, month?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/disputes?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getDispute: async (token: string, disputeId: string) =>
    fetch(`${API_BASE_URL}/disputes/${disputeId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  updateDispute: async (token: string, disputeId: string, data: {
    evidence?: any;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/disputes/${disputeId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  getDisputeInsights: async (token: string, accountId: string) =>
    fetch(`${API_BASE_URL}/disputes/${accountId}/insights`, getFetchOptions("GET", token)).then((r) => r.json()),

  // Customers
  getCustomers: async (token: string, createdGte?: string) =>
    fetch(`${API_BASE_URL}/customers${createdGte ? `?created[gte]=${createdGte}` : ''}`, getFetchOptions("GET", token)).then((r) => r.json()),

  getCustomersList: async (token: string, page = 1, pageSize = 20, query = '', sort = '', year?: string, month?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/customers?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getCustomer: async (token: string, customerId: string) =>
    fetch(`${API_BASE_URL}/customers/${customerId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createCustomer: async (token: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    description?: string;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/customers`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updateCustomer: async (token: string, customerId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    description?: string;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/customers/${customerId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  deleteCustomer: async (token: string, customerId: string) =>
    fetch(`${API_BASE_URL}/customers/${customerId}`, getFetchOptions("DELETE", token)).then((r) => r.json()),

  getCustomerPayments: async (token: string, customerId: string, page = 1, pageSize = 20) =>
    fetch(`${API_BASE_URL}/payments?customer=${customerId}&page=${page}&pageSize=${pageSize}`, getFetchOptions("GET", token)).then((r) => r.json()),

  getCustomerSubscriptions: async (token: string, customerId: string, page = 1, pageSize = 20) =>
    fetch(`${API_BASE_URL}/subscriptions?page=${page}&pageSize=${pageSize}&query=customer:${customerId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  getCustomerInsights: async (token: string, customerId: string, stripeAccountId: number) =>
    fetch(`${API_BASE_URL}/customers/${customerId}/insights?stripeAccountId=${stripeAccountId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  // Subscriptions
  getSubscriptions: async (token: string, page = 1, pageSize = 20, query = '', sort = '', year?: string, month?: string, accountId?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    if (accountId) params.append('accountId', accountId);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/subscriptions?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getSubscription: async (token: string, subscriptionId: string) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createSubscription: async (token: string, data: {
    customerId: string;
    priceId: string;
    quantity?: number;
    trialPeriodDays?: number;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/subscriptions`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updateSubscription: async (token: string, subscriptionId: string, data: {
    prorationBehavior?: string;
    items?: any[];
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  cancelSubscription: async (token: string, subscriptionId: string, data: {
    atPeriodEnd?: boolean;
    cancellationReason?: string;
  }) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  pauseSubscription: async (token: string, subscriptionId: string) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/pause`, getFetchOptions("POST", token)).then((r) => r.json()),

  resumeSubscription: async (token: string, subscriptionId: string) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/resume`, getFetchOptions("POST", token)).then((r) => r.json()),

  // Products
  getProducts: async (token: string, page = 1, pageSize = 20, query = '', sort = '', year?: string, month?: string, accountId?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    if (accountId) params.append('accountId', accountId);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/products?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getProduct: async (token: string, productId: string) =>
    fetch(`${API_BASE_URL}/products/${productId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createProduct: async (token: string, data: {
    name: string;
    description?: string;
    images?: string[];
    metadata?: any;
    url?: string;
  }) =>
    fetch(`${API_BASE_URL}/products`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updateProduct: async (token: string, productId: string, data: {
    name?: string;
    description?: string;
    images?: string[];
    metadata?: any;
    url?: string;
    active?: boolean;
  }) =>
    fetch(`${API_BASE_URL}/products/${productId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  deleteProduct: async (token: string, productId: string) =>
    fetch(`${API_BASE_URL}/products/${productId}`, getFetchOptions("DELETE", token)).then((r) => r.json()),

  // Prices (for products)
  getPrices: async (token: string, productId?: string, page = 1, pageSize = 20, year?: string, month?: string, accountId?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (productId) params.append('product', productId);
    if (accountId) params.append('accountId', accountId);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/prices?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getPrice: async (token: string, priceId: string) =>
    fetch(`${API_BASE_URL}/prices/${priceId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createPrice: async (token: string, data: {
    productId: string;
    unitAmount: number;
    currency: string;
    recurring?: {
      interval: 'day' | 'week' | 'month' | 'year';
      intervalCount?: number;
    };
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/prices`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updatePrice: async (token: string, priceId: string, data: {
    active?: boolean;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/prices/${priceId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  // Coupons
  getCoupons: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/coupons?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getCoupon: async (token: string, couponId: string) =>
    fetch(`${API_BASE_URL}/coupons/${couponId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createCoupon: async (token: string, data: {
    name: string;
    amountOff?: number;
    percentOff?: number;
    currency?: string;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths?: number;
    maxRedemptions?: number;
    redeemBy?: string;
  }) =>
    fetch(`${API_BASE_URL}/coupons`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updateCoupon: async (token: string, couponId: string, data: {
    name?: string;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/coupons/${couponId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  deleteCoupon: async (token: string, couponId: string) =>
    fetch(`${API_BASE_URL}/coupons/${couponId}`, getFetchOptions("DELETE", token)).then((r) => r.json()),

  // Invoices
  getInvoices: async (token: string, page = 1, pageSize = 20, query = '', sort = '', year?: string, month?: string, accountId?: string) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    if (accountId) params.append('accountId', accountId);
    appendDateFilters(params, year, month);
    
    return fetch(`${API_BASE_URL}/invoices?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getInvoice: async (token: string, invoiceId: string) =>
    fetch(`${API_BASE_URL}/invoices/${invoiceId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createInvoice: async (token: string, data: {
    customerId: string;
    description?: string;
    metadata?: any;
    dueDate?: string;
  }) =>
    fetch(`${API_BASE_URL}/invoices`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updateInvoice: async (token: string, invoiceId: string, data: {
    description?: string;
    metadata?: any;
    dueDate?: string;
  }) =>
    fetch(`${API_BASE_URL}/invoices/${invoiceId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  payInvoice: async (token: string, invoiceId: string, data: {
    paymentMethodId?: string;
  }) =>
    fetch(`${API_BASE_URL}/invoices/${invoiceId}/pay`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  voidInvoice: async (token: string, invoiceId: string) =>
    fetch(`${API_BASE_URL}/invoices/${invoiceId}/void`, getFetchOptions("POST", token)).then((r) => r.json()),

  // User Management
  getUsers: async (token: string) =>
    fetch(`${API_BASE_URL}/users`, getFetchOptions("GET", token)).then((r) => r.json()),

  getUsersList: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/users?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  getUser: async (token: string, userId: string) =>
    fetch(`${API_BASE_URL}/users/${userId}`, getFetchOptions("GET", token)).then((r) => r.json()),

  createUser: async (token: string, data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    status?: string;
  }) =>
    fetch(`${API_BASE_URL}/users`, getFetchOptions("POST", token, data)).then((r) => r.json()),

  updateUser: async (token: string, userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: string;
  }) =>
    fetch(`${API_BASE_URL}/users/${userId}`, getFetchOptions("PUT", token, data)).then((r) => r.json()),

  deleteUser: async (token: string, userId: string) =>
    fetch(`${API_BASE_URL}/users/${userId}`, getFetchOptions("DELETE", token)).then((r) => r.json()),

  // Balance
  getBalanceTransactions: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/balance/transactions?${params.toString()}`, getFetchOptions("GET", token)).then((r) => r.json());
  },

  // Additional endpoints from Swagger
  getPayoutsByAccount: async (token: string, accountId: string) =>
    fetch(`${API_BASE_URL}/payouts/${accountId}`, getFetchOptions("GET", token)).then((r) => r.json()),
};
