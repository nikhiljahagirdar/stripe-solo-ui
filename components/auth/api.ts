const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const getAuthHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

export const api = {
  // Auth
  register: async (data: { firstName: string; lastName: string; email: string; password: string }) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  login: async (data: { email: string; password: string }) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Accounts
  getAccounts: async (token: string) =>
    fetch(`${API_BASE_URL}/accounts`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  syncAccounts: async (token: string, stripeKeyId: number) =>
    fetch(`${API_BASE_URL}/accounts/sync`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ stripeKeyId }),
    }).then((r) => r.json()),

  // Keys
  getKeys: async (token: string) =>
    fetch(`${API_BASE_URL}/keys`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createKey: async (token: string, data: { name: string; apiKey: string }) =>
    fetch(`${API_BASE_URL}/keys`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  checkKeys: async (token: string) =>
    fetch(`${API_BASE_URL}/keys/check`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  updateKey: async (token: string, id: number, data: { name?: string; apiKey?: string }) =>
    fetch(`${API_BASE_URL}/keys/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteKey: async (token: string, id: number) =>
    fetch(`${API_BASE_URL}/keys/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Roles
  getRoles: async (token: string) =>
    fetch(`${API_BASE_URL}/roles`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createRole: async (token: string, data: { name: string; permissions?: string[] }) =>
    fetch(`${API_BASE_URL}/roles`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateRole: async (token: string, id: number, data: { name?: string; permissions?: string[] }) =>
    fetch(`${API_BASE_URL}/roles/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteRole: async (token: string, id: number) =>
    fetch(`${API_BASE_URL}/roles/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Permissions
  getPermissions: async (token: string) =>
    fetch(`${API_BASE_URL}/permissions`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createPermission: async (token: string, data: { name: string; description?: string; resource?: string }) =>
    fetch(`${API_BASE_URL}/permissions`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updatePermission: async (token: string, id: number, data: { name?: string; description?: string; resource?: string }) =>
    fetch(`${API_BASE_URL}/permissions/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deletePermission: async (token: string, id: number) =>
    fetch(`${API_BASE_URL}/permissions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Tax Settings
  getTaxSettings: async (token: string, accountId: number) =>
    fetch(`${API_BASE_URL}/tax-settings/${accountId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  upsertTaxSettings: async (token: string, accountId: number, data: { taxMode: string }) =>
    fetch(`${API_BASE_URL}/tax-settings/${accountId}`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Dashboard
  getDashboard: async (token: string) =>
    fetch(`${API_BASE_URL}/dashboard`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  getV1Accounts: async (token: string) =>
    fetch(`${API_BASE_URL}/accounts`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  getBalance: async (token: string, accountId: string) =>
    fetch(`${API_BASE_URL}/balance/${accountId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  getHealth: async () =>
    fetch(`${API_BASE_URL}/health`).then((r) => r.json()),

  getSummary: async (token: string, accountId: string) =>
    fetch(`${API_BASE_URL}/${accountId}/summary`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Payments
  getPayments: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/payments?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getPayment: async (token: string, paymentId: string) =>
    fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createPayment: async (token: string, data: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    description?: string;
  }) =>
    fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updatePayment: async (token: string, paymentId: string, data: any) =>
    fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  refundPayment: async (token: string, paymentId: string, data: {
    amount?: number;
    reason?: string;
  }) =>
    fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Payouts
  getPayouts: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/payouts?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getPayout: async (token: string, payoutId: string) =>
    fetch(`${API_BASE_URL}/payouts/${payoutId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Refunds
  getRefunds: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/refunds?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getRefund: async (token: string, refundId: string) =>
    fetch(`${API_BASE_URL}/refunds/${refundId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createRefund: async (token: string, data: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }) =>
    fetch(`${API_BASE_URL}/refunds`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Disputes
  getDisputes: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/disputes?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getDispute: async (token: string, disputeId: string) =>
    fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  updateDispute: async (token: string, disputeId: string, data: {
    evidence?: any;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getDisputeInsights: async (token: string, accountId: string) =>
    fetch(`${API_BASE_URL}/disputes/${accountId}/insights`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Customers
  getCustomers: async (token: string, createdGte?: string) =>
    fetch(`${API_BASE_URL}/customers${createdGte ? `?created[gte]=${createdGte}` : ''}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  getCustomersList: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/customers?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getCustomer: async (token: string, customerId: string) =>
    fetch(`${API_BASE_URL}/customers/${customerId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createCustomer: async (token: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    description?: string;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/customers`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateCustomer: async (token: string, customerId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    description?: string;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteCustomer: async (token: string, customerId: string) =>
    fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  getCustomerPayments: async (token: string, customerId: string, page = 1, pageSize = 20) =>
    fetch(`${API_BASE_URL}/payments?customer=${customerId}&page=${page}&pageSize=${pageSize}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  getCustomerSubscriptions: async (token: string, customerId: string, page = 1, pageSize = 20) =>
    fetch(`${API_BASE_URL}/subscriptions?page=${page}&pageSize=${pageSize}&query=customer:${customerId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  getCustomerInsights: async (token: string, customerId: string, stripeAccountId: number) =>
    fetch(`${API_BASE_URL}/customers/${customerId}/insights?stripeAccountId=${stripeAccountId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Subscriptions
  getSubscriptions: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/subscriptions?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getSubscription: async (token: string, subscriptionId: string) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createSubscription: async (token: string, data: {
    customerId: string;
    priceId: string;
    quantity?: number;
    trialPeriodDays?: number;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/subscriptions`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateSubscription: async (token: string, subscriptionId: string, data: {
    prorationBehavior?: string;
    items?: any[];
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  cancelSubscription: async (token: string, subscriptionId: string, data: {
    atPeriodEnd?: boolean;
    cancellationReason?: string;
  }) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  pauseSubscription: async (token: string, subscriptionId: string) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/pause`, {
      method: "POST",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  resumeSubscription: async (token: string, subscriptionId: string) =>
    fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/resume`, {
      method: "POST",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Products
  getProducts: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/products?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getProduct: async (token: string, productId: string) =>
    fetch(`${API_BASE_URL}/products/${productId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createProduct: async (token: string, data: {
    name: string;
    description?: string;
    images?: string[];
    metadata?: any;
    url?: string;
  }) =>
    fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateProduct: async (token: string, productId: string, data: {
    name?: string;
    description?: string;
    images?: string[];
    metadata?: any;
    url?: string;
    active?: boolean;
  }) =>
    fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteProduct: async (token: string, productId: string) =>
    fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Prices (for products)
  getPrices: async (token: string, productId?: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (productId) params.append('product', productId);
    
    return fetch(`${API_BASE_URL}/prices?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getPrice: async (token: string, priceId: string) =>
    fetch(`${API_BASE_URL}/prices/${priceId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

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
    fetch(`${API_BASE_URL}/prices`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updatePrice: async (token: string, priceId: string, data: {
    active?: boolean;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/prices/${priceId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Coupons
  getCoupons: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/coupons?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getCoupon: async (token: string, couponId: string) =>
    fetch(`${API_BASE_URL}/coupons/${couponId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

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
    fetch(`${API_BASE_URL}/coupons`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateCoupon: async (token: string, couponId: string, data: {
    name?: string;
    metadata?: any;
  }) =>
    fetch(`${API_BASE_URL}/coupons/${couponId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteCoupon: async (token: string, couponId: string) =>
    fetch(`${API_BASE_URL}/coupons/${couponId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Invoices
  getInvoices: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/invoices?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getInvoice: async (token: string, invoiceId: string) =>
    fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createInvoice: async (token: string, data: {
    customerId: string;
    description?: string;
    metadata?: any;
    dueDate?: string;
  }) =>
    fetch(`${API_BASE_URL}/invoices`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateInvoice: async (token: string, invoiceId: string, data: {
    description?: string;
    metadata?: any;
    dueDate?: string;
  }) =>
    fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  payInvoice: async (token: string, invoiceId: string, data: {
    paymentMethodId?: string;
  }) =>
    fetch(`${API_BASE_URL}/invoices/${invoiceId}/pay`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  voidInvoice: async (token: string, invoiceId: string) =>
    fetch(`${API_BASE_URL}/invoices/${invoiceId}/void`, {
      method: "POST",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // User Management
  getUsers: async (token: string) =>
    fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  getUsersList: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/users?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  getUser: async (token: string, userId: string) =>
    fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  createUser: async (token: string, data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    status?: string;
  }) =>
    fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateUser: async (token: string, userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: string;
  }) =>
    fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteUser: async (token: string, userId: string) =>
    fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),

  // Balance
  getBalanceTransactions: async (token: string, page = 1, pageSize = 20, query = '', sort = '') => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (query) params.append('query', query);
    if (sort) params.append('sort', sort);
    
    return fetch(`${API_BASE_URL}/balance/transactions?${params.toString()}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json());
  },

  // Additional endpoints from Swagger
  getPayoutsByAccount: async (token: string, accountId: string) =>
    fetch(`${API_BASE_URL}/payouts/${accountId}`, {
      headers: getAuthHeaders(token),
    }).then((r) => r.json()),
};
