import { icon } from '../icons.js';
import {
  authApi,
  ordersApi,
  paymentsApi,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  getRecentOrderIds,
  recordRecentOrderId,
  subscribeAuth,
} from '../services/api.js';
import { formatPrice, lockScroll, unlockScroll } from '../utils.js';
import { showToast } from './toast.js';

let isOpen = false;
let activeTab = 'auth'; // 'auth' | 'register' | 'orders'
let loadedOrders = [];
let loadingOrders = false;
let lastFocused = null;

export const isAccountModalOpen = () => isOpen;

function ensureModalElement() {
  let modal = document.getElementById('account-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'account-modal';
  modal.className = 'fixed inset-0 z-[97] hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'account-modal-title');
  modal.innerHTML = `
    <div data-account-close class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6">
      <div id="account-modal-panel" class="pointer-events-auto relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl">
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function orderStatusBadge(status) {
  const map = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  };
  return map[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function paymentStatusBadge(status) {
  if (status === 'PAID') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  if (status === 'FAILED') return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
}

async function fetchRelevantOrders() {
  loadingOrders = true;
  renderAccountModal();

  const byId = new Map();
  try {
    if (isAuthenticated()) {
      const userOrders = await ordersApi.list({ offset: 0, limit: 50 });
      (userOrders || []).forEach((o) => byId.set(o.id, o));
    } else {
      const guestIds = getRecentOrderIds().slice(0, 12);
      const results = await Promise.allSettled(guestIds.map((id) => ordersApi.get(id)));
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.id) {
          byId.set(r.value.id, r.value);
        }
      });
    }
  } catch {
    /* ignore network or auth fetch errors; user can still search by ID */
  }

  loadedOrders = [...byId.values()].sort((a, b) => b.id - a.id);
  loadingOrders = false;
  renderAccountModal();
}

function renderOrdersListHtml() {
  if (loadingOrders) {
    return `
      <div class="py-10 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
        ${icon('refresh-cw', 'h-4 w-4 animate-spin text-brand-500')}
        <span>Loading live orders from FastAPI…</span>
      </div>`;
  }

  if (!loadedOrders.length) {
    return `
      <div class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 py-10 px-4 text-center">
        <span class="mx-auto grid h-11 w-11 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          ${icon('package', 'h-5 w-5')}
        </span>
        <p class="mt-3 text-sm font-bold text-slate-800 dark:text-white">No orders found yet</p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Place an order from your cart or look up an Order #ID above.</p>
      </div>`;
  }

  return `
    <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
      ${loadedOrders
        .map((o) => {
          const prodName = o.product?.name || `Product #${o.product_id}`;
          const dateStr = o.ordered_at ? new Date(o.ordered_at).toLocaleString() : '';
          const unpaid = o.payment_status !== 'PAID' && o.order_status !== 'CANCELLED';
          return `
            <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-mono text-xs font-extrabold text-brand-600 dark:text-brand-400">ORDER #${o.id}</span>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-bold ${orderStatusBadge(o.order_status)}">${o.order_status}</span>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-bold ${paymentStatusBadge(o.payment_status)}">${o.payment_status}</span>
                </div>
                <p class="mt-1 text-sm font-bold text-slate-900 dark:text-white truncate">${o.quantity} × ${prodName}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${o.address} · ${o.contacs || ''}</p>
                ${dateStr ? `<p class="text-[11px] text-slate-400 mt-0.5">${dateStr}</p>` : ''}
              </div>
              <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <span class="text-sm font-extrabold text-slate-900 dark:text-white">${formatPrice(Number(o.total_price))}</span>
                ${
                  unpaid
                    ? `<button type="button" data-pay-order="${o.id}" class="inline-flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition">
                        ${icon('credit-card', 'h-3 w-3')}
                        <span>Pay Now</span>
                       </button>`
                    : `<span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">${icon('check', 'h-3 w-3')} Settled</span>`
                }
              </div>
            </div>`;
        })
        .join('')}
    </div>`;
}

function renderAccountModal() {
  const panel = document.getElementById('account-modal-panel');
  if (!panel) return;

  const user = getCurrentUser();

  if (user) {
    panel.innerHTML = `
      <div class="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <span class="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-500/20">
            ${icon('user', 'h-5 w-5')}
          </span>
          <div>
            <div class="flex items-center gap-2">
              <h3 id="account-modal-title" class="text-lg font-bold text-slate-900 dark:text-white">${user.name}</h3>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-bold ${
                user.role === 'ADMIN'
                  ? 'bg-accent-100 dark:bg-accent-500/20 text-accent-800 dark:text-accent-300'
                  : 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300'
              }">${user.role}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">${user.email}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${
            isAdmin()
              ? `<a href="seller.html#dashboard" class="inline-flex items-center gap-1.5 rounded-full bg-brand-500 hover:bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition">
                  ${icon('store', 'h-3.5 w-3.5')}
                  <span>Seller Central</span>
                 </a>`
              : ''
          }
          <button type="button" id="account-logout-btn" class="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-300 transition">
            ${icon('log-out', 'h-3.5 w-3.5')}
            <span>Sign out</span>
          </button>
          <button type="button" data-account-close class="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition" aria-label="Close account modal">
            ${icon('x', 'h-5 w-5')}
          </button>
        </div>
      </div>

      <!-- Profile Contact Update -->
      <form id="account-profile-form" class="mt-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div class="flex-1">
          <label for="profile-name" class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Display Name</label>
          <input id="profile-name" type="text" required minlength="2" maxlength="32" value="${user.name || ''}"
            class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
        </div>
        <div class="flex-1">
          <label for="profile-contact" class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Default Contact Phone</label>
          <input id="profile-contact" type="tel" maxlength="16" value="${user.contact || ''}" placeholder="+256701234567"
            class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
        </div>
        <button type="submit" class="rounded-xl bg-slate-900 dark:bg-brand-500 hover:bg-brand-600 px-4 py-2 text-xs font-bold text-white transition shrink-0">
          Save Profile
        </button>
      </form>

      <!-- Orders Section -->
      <div class="mt-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            ${icon('truck', 'h-4 w-4 text-brand-500')}
            <span>${isAdmin() ? 'All Marketplace Orders (Admin View)' : 'Your Orders & Delivery Status'}</span>
          </h4>
          <div class="flex items-center gap-2">
            <form id="order-lookup-form" class="flex items-center gap-1.5">
              <input id="order-lookup-id" type="number" min="1" placeholder="Order #ID"
                class="w-28 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
              <button type="submit" class="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 transition">
                Find
              </button>
            </form>
            <button type="button" id="orders-refresh-btn" class="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              ${icon('refresh-cw', 'h-3.5 w-3.5')} Refresh
            </button>
          </div>
        </div>

        ${renderOrdersListHtml()}
      </div>
    `;
  } else {
    // Signed out view: Sign In / Create Account / Track Guest Order
    panel.innerHTML = `
      <div class="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-brand-500">
            ${icon('user', 'h-5 w-5')}
          </span>
          <div>
            <h3 id="account-modal-title" class="text-lg font-bold text-slate-900 dark:text-white">Customer Account & Order Tracking</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Sign in, register, or track any order live</p>
          </div>
        </div>
        <button type="button" data-account-close class="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition" aria-label="Close">
          ${icon('x', 'h-5 w-5')}
        </button>
      </div>

      <!-- Tabs -->
      <div class="mt-5 flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
        <button type="button" data-acc-tab="auth" class="flex-1 rounded-xl py-2 transition ${
          activeTab === 'auth' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
        }">Sign In</button>
        <button type="button" data-acc-tab="register" class="flex-1 rounded-xl py-2 transition ${
          activeTab === 'register' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
        }">Create Account</button>
        <button type="button" data-acc-tab="orders" class="flex-1 rounded-xl py-2 transition ${
          activeTab === 'orders' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
        }">Track Order</button>
      </div>

      ${
        activeTab === 'auth'
          ? `
        <form id="customer-login-form" class="mt-5 space-y-4">
          <div class="flex items-center justify-between rounded-xl bg-brand-50/70 dark:bg-brand-500/10 border border-brand-200/70 dark:border-brand-500/20 px-3.5 py-2.5 text-xs">
            <span class="text-slate-600 dark:text-slate-300">Quick demo shopper credentials:</span>
            <button type="button" id="fill-demo-customer" class="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Use Demo Customer
            </button>
          </div>
          <div>
            <label for="cust-login-email" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input id="cust-login-email" type="email" required placeholder="customer@example.com"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label for="cust-login-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <input id="cust-login-password" type="password" required placeholder="••••••••"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
          </div>
          <div id="acc-form-error" class="hidden rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300"></div>
          <button type="submit" id="cust-login-submit" class="w-full rounded-full bg-brand-500 hover:bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition">
            Sign In
          </button>
          <p class="text-center text-xs text-slate-500 dark:text-slate-400">
            Are you a merchant or admin? <a href="seller.html" class="font-bold text-brand-600 dark:text-brand-400 hover:underline">Open Seller Central</a>
          </p>
        </form>`
          : activeTab === 'register'
          ? `
        <form id="customer-register-form" class="mt-5 space-y-3.5">
          <div class="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label for="cust-reg-name" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <input id="cust-reg-name" type="text" required minlength="2" maxlength="32" placeholder="Jane Doe"
                class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label for="cust-reg-contact" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Phone (Optional)</label>
              <input id="cust-reg-contact" type="tel" maxlength="16" placeholder="+256701234567"
                class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label for="cust-reg-email" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input id="cust-reg-email" type="email" required placeholder="you@example.com"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label for="cust-reg-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password (min 6 characters)</label>
            <input id="cust-reg-password" type="password" required minlength="6" placeholder="At least 6 characters"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
          </div>
          <div id="acc-form-error" class="hidden rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300"></div>
          <button type="submit" id="cust-reg-submit" class="w-full rounded-full bg-brand-500 hover:bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition">
            Create Customer Account
          </button>
        </form>`
          : `
        <div class="mt-5 space-y-4">
          <form id="order-lookup-form" class="flex items-center gap-2">
            <input id="order-lookup-id" type="number" min="1" required placeholder="Enter Order #ID (e.g. 1)"
              class="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none" />
            <button type="submit" class="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition">
              ${icon('search', 'h-3.5 w-3.5')}
              <span>Track Order</span>
            </button>
          </form>
          ${renderOrdersListHtml()}
        </div>`
      }
    `;
  }

  bindModalEvents(panel);
}

function bindModalEvents(panel) {
  // Tab switching
  panel.querySelectorAll('[data-acc-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.accTab;
      if (activeTab === 'orders') {
        fetchRelevantOrders();
      } else {
        renderAccountModal();
      }
    });
  });

  // Fill demo customer
  document.getElementById('fill-demo-customer')?.addEventListener('click', () => {
    const emailEl = document.getElementById('cust-login-email');
    const passEl = document.getElementById('cust-login-password');
    if (emailEl) emailEl.value = 'customer@example.com';
    if (passEl) passEl.value = 'customer123';
  });

  // Login submit
  document.getElementById('customer-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('acc-form-error');
    const submitBtn = document.getElementById('cust-login-submit');
    const email = document.getElementById('cust-login-email')?.value.trim();
    const password = document.getElementById('cust-login-password')?.value;

    if (errEl) errEl.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in…';
    }
    try {
      const session = await authApi.login({ email, password });
      showToast(`Welcome back, ${session.user?.name || 'Shopper'}!`, { variant: 'success' });
      await fetchRelevantOrders();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message || 'Invalid credentials.';
        errEl.classList.remove('hidden');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    }
  });

  // Register submit
  document.getElementById('customer-register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('acc-form-error');
    const submitBtn = document.getElementById('cust-reg-submit');
    const name = document.getElementById('cust-reg-name')?.value.trim();
    const contact = document.getElementById('cust-reg-contact')?.value.trim();
    const email = document.getElementById('cust-reg-email')?.value.trim();
    const password = document.getElementById('cust-reg-password')?.value;

    if (errEl) errEl.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account…';
    }
    try {
      const session = await authApi.register({ name, email, password, contact, role: 'CUSTOMER' });
      showToast(`Account created! Welcome, ${session.user?.name || name}!`, { variant: 'success' });
      await fetchRelevantOrders();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message || 'Could not register account.';
        errEl.classList.remove('hidden');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Customer Account';
      }
    }
  });

  // Profile update
  document.getElementById('account-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user?.public_id) return;
    const name = document.getElementById('profile-name')?.value.trim();
    const contact = document.getElementById('profile-contact')?.value.trim();
    try {
      await authApi.updateProfile(user.public_id, { name, contact });
      showToast('Profile updated!', { variant: 'success' });
      renderAccountModal();
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', { variant: 'error' });
    }
  });

  // Logout
  document.getElementById('account-logout-btn')?.addEventListener('click', () => {
    authApi.logout();
    loadedOrders = [];
    activeTab = 'auth';
    showToast('Signed out', { variant: 'info' });
    renderAccountModal();
  });

  // Refresh orders
  document.getElementById('orders-refresh-btn')?.addEventListener('click', () => {
    fetchRelevantOrders();
  });

  // Lookup single Order by #ID
  document.getElementById('order-lookup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idVal = Number(document.getElementById('order-lookup-id')?.value);
    if (!idVal) return;
    try {
      const order = await ordersApi.get(idVal);
      if (order?.id) {
        recordRecentOrderId(order.id);
        loadedOrders = [order, ...loadedOrders.filter((o) => o.id !== order.id)];
        renderAccountModal();
        showToast(`Loaded Order #${order.id}`, { variant: 'success' });
      }
    } catch (err) {
      showToast(err.message || `Order #${idVal} not found or belongs to another account.`, { variant: 'error' });
    }
  });

  // Pay unpaid order
  panel.querySelectorAll('[data-pay-order]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const orderId = Number(btn.dataset.payOrder);
      const ord = loadedOrders.find((o) => o.id === orderId);
      if (!ord) return;
      btn.disabled = true;
      btn.textContent = 'Paying…';
      try {
        await paymentsApi.pay({
          order_id: ord.id,
          payment_method: ord.payment_method || 'MOBILE MONEY',
          amount: ord.total_price,
        });
        showToast(`Payment settled for Order #${ord.id}!`, { variant: 'success' });
        await fetchRelevantOrders();
      } catch (err) {
        showToast(err.message || 'Payment failed.', { variant: 'error' });
        btn.disabled = false;
        btn.textContent = 'Pay Now';
      }
    });
  });
}

export function openAccountModal(tab = 'auth') {
  const modal = ensureModalElement();
  activeTab = tab;
  if (!isOpen) {
    isOpen = true;
    lastFocused = document.activeElement;
    modal.classList.remove('hidden');
    lockScroll();
  }
  if (isAuthenticated() || activeTab === 'orders') {
    fetchRelevantOrders();
  } else {
    renderAccountModal();
  }
}

export function closeAccountModal() {
  if (!isOpen) return;
  const modal = document.getElementById('account-modal');
  isOpen = false;
  modal?.classList.add('hidden');
  unlockScroll();
  lastFocused?.focus?.({ preventScroll: true });
}

export function initAccountModal() {
  const modal = ensureModalElement();
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-account-close]')) {
      closeAccountModal();
    }
  });
  subscribeAuth(() => {
    if (isOpen) renderAccountModal();
  });
}

