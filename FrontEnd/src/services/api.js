/**
 * FastAPI Backend Client & Shared Auth Session Service
 * Connects the Urban Scenery Ventures Storefront and Seller Central to `/api/v1/*`.
 */

const ENV_API_BASE = import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '')
  : null;

const FALLBACK_DIRECT_API = 'http://127.0.0.1:8000/api/v1';
const AUTH_STORAGE_KEY = 'urban:auth_session';
const RECENT_ORDERS_KEY = 'urban:recent_order_ids';

let resolvedApiBase = ENV_API_BASE || '/api/v1';
let backendOnline = false;
const authListeners = new Set();
const connectionListeners = new Set();

function setBackendOnline(online) {
  const changed = backendOnline !== online;
  backendOnline = online;
  if (changed) {
    connectionListeners.forEach((fn) => fn(online));
    window.dispatchEvent(new CustomEvent('urban:backend_status', { detail: { online } }));
  }
}

export const isBackendOnline = () => backendOnline;

export function subscribeBackendStatus(fn) {
  connectionListeners.add(fn);
  return () => connectionListeners.delete(fn);
}

/* ============================================================
   Auth Session Persistence (shared across index.html & seller.html)
   ============================================================ */

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.accessToken && parsed.user) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export const getAccessToken = () => getAuthSession()?.accessToken || null;
export const getCurrentUser = () => getAuthSession()?.user || null;
export const isAuthenticated = () => Boolean(getAccessToken() && getCurrentUser());
export const isAdmin = () => getCurrentUser()?.role === 'ADMIN';

function emitAuthChange(session) {
  authListeners.forEach((fn) => fn(session));
  window.dispatchEvent(new CustomEvent('urban:auth_changed', { detail: session }));
}

export function saveAuthSession(tokenOut) {
  if (!tokenOut?.access_token) return null;
  const session = {
    accessToken: tokenOut.access_token,
    tokenType: tokenOut.token_type || 'bearer',
    user: tokenOut.user || null,
  };
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore private storage restrictions */
  }
  emitAuthChange(session);
  return session;
}

export function updateStoredUser(user) {
  const existing = getAuthSession();
  if (!existing) return null;
  const updated = { ...existing, user };
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
  emitAuthChange(updated);
  return updated;
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  emitAuthChange(null);
}

export function subscribeAuth(fn) {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}

/* ============================================================
   Core Fetch Wrapper with Proxy -> Direct Fallback & Error Parsing
   ============================================================ */

function formatApiError(data, fallbackMsg) {
  if (!data) return fallbackMsg;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : 'Field';
        return `${field ? `${field}: ` : ''}${item.msg}`;
      })
      .join('; ');
  }
  if (typeof data.message === 'string') return data.message;
  return fallbackMsg;
}

async function rawFetch(baseUrl, path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const reqHeaders = { Accept: 'application/json', ...headers };
  if (body !== undefined && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    reqHeaders['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getAccessToken();
    if (token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const payload =
    body === undefined
      ? undefined
      : body instanceof FormData || body instanceof URLSearchParams || typeof body === 'string'
      ? body
      : JSON.stringify(body);

  return fetch(`${baseUrl}${path}`, {
    method,
    headers: reqHeaders,
    body: payload,
  });
}

export async function apiRequest(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let res;

  try {
    res = await rawFetch(resolvedApiBase, normalizedPath, options);
    const contentType = res.headers.get('content-type') || '';

    // If served via a static server without /api proxy (returns SPA HTML fallback or 404 HTML),
    // automatically switch to direct FastAPI origin.
    if (!ENV_API_BASE && resolvedApiBase === '/api/v1' && contentType.includes('text/html')) {
      resolvedApiBase = FALLBACK_DIRECT_API;
      res = await rawFetch(resolvedApiBase, normalizedPath, options);
    }
  } catch (networkErr) {
    if (!ENV_API_BASE && resolvedApiBase === '/api/v1') {
      try {
        resolvedApiBase = FALLBACK_DIRECT_API;
        res = await rawFetch(resolvedApiBase, normalizedPath, options);
      } catch (fallbackErr) {
        setBackendOnline(false);
        const err = new Error('Unable to reach FastAPI backend on port 8000.');
        err.cause = fallbackErr;
        err.isNetworkError = true;
        throw err;
      }
    } else {
      setBackendOnline(false);
      const err = new Error('Unable to reach FastAPI backend.');
      err.cause = networkErr;
      err.isNetworkError = true;
      throw err;
    }
  }

  setBackendOnline(true);

  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = formatApiError(data, `Request failed (${res.status})`);
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function checkBackendHealth() {
  try {
    const rootBase = resolvedApiBase.replace(/\/api\/v1$/, '');
    const res = await fetch(`${rootBase || ''}/health`, { headers: { Accept: 'application/json' } });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const json = await res.json();
      const healthy = json?.status === 'healthy' || json?.status === 'online';
      setBackendOnline(healthy);
      return healthy;
    }
    if (!ENV_API_BASE) {
      const directRes = await fetch('http://127.0.0.1:8000/health', { headers: { Accept: 'application/json' } });
      if (directRes.ok) {
        resolvedApiBase = FALLBACK_DIRECT_API;
        setBackendOnline(true);
        return true;
      }
    }
  } catch {
    if (!ENV_API_BASE) {
      try {
        const directRes = await fetch('http://127.0.0.1:8000/health', { headers: { Accept: 'application/json' } });
        if (directRes.ok) {
          resolvedApiBase = FALLBACK_DIRECT_API;
          setBackendOnline(true);
          return true;
        }
      } catch {
        /* offline */
      }
    }
  }
  setBackendOnline(false);
  return false;
}

/* ============================================================
   1. Authentication & Users API (/api/v1/auth, /api/v1/users)
   ============================================================ */

export const authApi = {
  async login({ email, password }) {
    const tokenOut = await apiRequest('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: String(email).trim(), password },
    });
    saveAuthSession(tokenOut);
    return tokenOut;
  },

  async register({ name, email, password, contact, role = 'CUSTOMER' }) {
    // Backend UserBase enforces name: min_length=2, max_length=32
    const cleanName = String(name || 'Customer').trim().slice(0, 32);
    const cleanEmail = String(email).trim();
    const payload = {
      name: cleanName.length >= 2 ? cleanName : `${cleanName} User`,
      email: cleanEmail,
      password,
      role: role === 'GUEST' ? 'GUEST' : 'CUSTOMER',
    };
    if (contact && String(contact).trim()) {
      payload.contact = String(contact).trim().slice(0, 64);
    }

    await apiRequest('/auth/register', {
      method: 'POST',
      auth: false,
      body: payload,
    });

    // Automatically exchange credentials for JWT session
    return this.login({ email: cleanEmail, password });
  },

  async me() {
    if (!getAccessToken()) return null;
    try {
      const user = await apiRequest('/auth/me');
      if (user) updateStoredUser(user);
      return user;
    } catch (err) {
      if (err.status === 401) {
        clearAuthSession();
      }
      throw err;
    }
  },

  async updateProfile(publicId, { name, contact }) {
    const body = {};
    if (name !== undefined) body.name = String(name).trim().slice(0, 32);
    if (contact !== undefined) body.contact = contact ? String(contact).trim().slice(0, 64) : null;
    const updated = await apiRequest(`/users/${publicId}`, {
      method: 'PUT',
      body,
    });
    if (updated && getCurrentUser()?.public_id === updated.public_id) {
      updateStoredUser(updated);
    }
    return updated;
  },

  logout() {
    clearAuthSession();
  },
};

/* ============================================================
   2. Products API (/api/v1/products)
   ============================================================ */

export const productsApi = {
  async list({ search, minPrice, maxPrice, status, offset = 0, limit = 100 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (minPrice !== undefined && minPrice !== null) params.set('min_price', String(minPrice));
    if (maxPrice !== undefined && maxPrice !== null) params.set('max_price', String(maxPrice));
    if (status) params.set('status', status);
    params.set('offset', String(offset));
    params.set('limit', String(limit));
    const qs = params.toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },

  async get(productId) {
    return apiRequest(`/products/${productId}`, { auth: false });
  },

  async create({ name, price, description, banner_image, quantity = 0, status }) {
    const qty = Math.max(0, Number(quantity) || 0);
    return apiRequest('/products', {
      method: 'POST',
      body: {
        name: String(name).trim().slice(0, 128),
        price: Number(Number(price).toFixed(2)),
        description: description || null,
        banner_image: banner_image || null,
        quantity: qty,
        status: status || (qty > 0 ? 'AVAILABLE' : 'EMPTY'),
      },
    });
  },

  async update(productId, updates) {
    const body = { ...updates };
    if (body.name !== undefined) body.name = String(body.name).trim().slice(0, 128);
    if (body.price !== undefined) body.price = Number(Number(body.price).toFixed(2));
    if (body.quantity !== undefined) body.quantity = Math.max(0, Math.round(Number(body.quantity)));
    return apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body,
    });
  },

  async remove(productId) {
    return apiRequest(`/products/${productId}`, {
      method: 'DELETE',
    });
  },
};

/* ============================================================
   3. Orders API (/api/v1/orders)
   ============================================================ */

export function normalizeContactPhone(raw) {
  // Backend OrderCreate requires contact: min_length=5, max_length=16
  const cleaned = String(raw || '').replace(/[^\d+]/g, '').slice(0, 16);
  return cleaned.length >= 5 ? cleaned : String(raw || '').trim().slice(0, 16);
}

export function recordRecentOrderId(orderId) {
  try {
    const existing = getRecentOrderIds();
    const next = [Number(orderId), ...existing.filter((id) => id !== Number(orderId))].slice(0, 25);
    localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getRecentOrderIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '[]');
    return Array.isArray(raw) ? raw.map(Number).filter((n) => Number.isInteger(n) && n > 0) : [];
  } catch {
    return [];
  }
}

export const ordersApi = {
  async create({ product_id, quantity = 1, address, contact, payment_method = 'BANK' }) {
    const cleanAddress = String(address || '').trim().slice(0, 128);
    const cleanContact = normalizeContactPhone(contact);
    const order = await apiRequest('/orders', {
      method: 'POST',
      body: {
        product_id: Number(product_id),
        quantity: Math.max(1, Math.round(Number(quantity) || 1)),
        address: cleanAddress,
        contact: cleanContact,
        payment_method,
      },
    });
    if (order?.id) {
      recordRecentOrderId(order.id);
    }
    return order;
  },

  async list({ offset = 0, limit = 50 } = {}) {
    return apiRequest(`/orders?offset=${offset}&limit=${limit}`);
  },

  async get(orderId) {
    return apiRequest(`/orders/${orderId}`);
  },

  async updateStatus(orderId, { order_status, payment_status }) {
    const body = {};
    if (order_status) body.order_status = order_status;
    if (payment_status) body.payment_status = payment_status;
    return apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body,
    });
  },

  async remove(orderId) {
    return apiRequest(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  },
};

/* ============================================================
   4. Payments API (/api/v1/payments)
   ============================================================ */

export const paymentsApi = {
  async pay({ order_id, payment_method, amount }) {
    return apiRequest('/payments/pay', {
      method: 'POST',
      auth: false,
      body: {
        order_id: Number(order_id),
        payment_method,
        // Preserve exact decimal string/number so it matches order.total_price
        amount: typeof amount === 'string' ? amount : Number(Number(amount).toFixed(2)),
      },
    });
  },

  async list({ offset = 0, limit = 50 } = {}) {
    return apiRequest(`/payments?offset=${offset}&limit=${limit}`);
  },

  async getByOrder(orderId) {
    return apiRequest(`/payments/order/${orderId}`);
  },
};

/* ============================================================
   5. AI Assistant & Interaction Logs (/api/v1/ai)
   ============================================================ */

export const aiApi = {
  async recommend({ query, max_budget, preferred_category }) {
    const body = { query: String(query).trim() };
    if (max_budget !== undefined && max_budget !== null && Number(max_budget) > 0) {
      body.max_budget = Number(Number(max_budget).toFixed(2));
    }
    if (preferred_category && preferred_category !== 'all') {
      body.preferred_category = preferred_category;
    }
    return apiRequest('/ai/recommend', {
      method: 'POST',
      auth: false,
      body,
    });
  },

  async smartSearch(q) {
    return apiRequest(`/ai/smart-search?q=${encodeURIComponent(String(q).trim())}`, {
      auth: false,
    });
  },

  async listInteractions({ offset = 0, limit = 50 } = {}) {
    return apiRequest(`/ai/interactions?offset=${offset}&limit=${limit}`);
  },

  async logInteraction({ prompt, response, user_id = null }) {
    return apiRequest('/ai/interactions', {
      method: 'POST',
      body: {
        prompt: String(prompt),
        response: String(response),
        user_id,
      },
    });
  },
};

