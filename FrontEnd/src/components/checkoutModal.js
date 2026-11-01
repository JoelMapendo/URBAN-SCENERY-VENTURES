import { icon } from '../icons.js';
import { getCartItems, clearCart } from '../store.js';
import { syncCatalogFromBackend } from '../data/products.js';
import { retailStores } from '../data/shops.js';
import {
  ordersApi,
  paymentsApi,
  getCurrentUser,
  normalizeContactPhone,
} from '../services/api.js';
import { formatPrice, toUGX, lockScroll, unlockScroll } from '../utils.js';
import { showToast } from './toast.js';

let isOpen = false;
let lastFocused = null;
let selectedPaymentMethod = 'MOBILE MONEY';
let onViewOrdersCallback = null;
let onOpenSignInCallback = null;

export const isCheckoutOpen = () => isOpen;

function ensureModalElement() {
  let modal = document.getElementById('checkout-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'checkout-modal';
  modal.className = 'fixed inset-0 z-[98] hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'checkout-modal-title');
  modal.innerHTML = `
    <div data-checkout-close class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6">
      <div id="checkout-modal-panel" class="pointer-events-auto relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl">
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function getPreferredPickupAddress() {
  try {
    const prefId = localStorage.getItem('lumen:preferred_store');
    const store = retailStores.find((s) => s.id === prefId) || retailStores[0];
    return store ? `Pickup: ${store.name}, ${store.address}` : 'Plot 24 Kampala Road, Kampala, Uganda';
  } catch {
    return 'Plot 24 Kampala Road, Kampala, Uganda';
  }
}

function renderCheckoutForm() {
  const panel = document.getElementById('checkout-modal-panel');
  if (!panel) return;

  const items = getCartItems();
  if (!items.length) {
    closeCheckoutModal();
    return;
  }

  const user = getCurrentUser();
  const prefilledPhone = user?.contact ? normalizeContactPhone(user.contact) : '';
  const subtotalUgx = items.reduce((sum, { product, qty }) => sum + toUGX(product.price) * qty, 0);

  const paymentOptions = [
    {
      value: 'MOBILE MONEY',
      title: 'Mobile Money',
      subtitle: 'MTN MoMo & Airtel Money',
      iconName: 'smartphone',
    },
    {
      value: 'BANK',
      title: 'Card / Bank',
      subtitle: 'Visa, Mastercard & Wire',
      iconName: 'credit-card',
    },
    {
      value: 'CRYPTO',
      title: 'Crypto Pay',
      subtitle: 'USDC, USDT & BTC',
      iconName: 'zap',
    },
  ];

  panel.innerHTML = `
    <div class="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
      <div class="flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-brand-500 shadow-sm">
          ${icon('shield-check', 'h-5 w-5')}
        </span>
        <div>
          <h3 id="checkout-modal-title" class="text-lg font-bold text-slate-900 dark:text-white">Secure Express Checkout</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            ${
              user
                ? `Signed in as <strong class="text-slate-800 dark:text-slate-200">${user.name}</strong> (${user.email})`
                : `Checking out as Guest · <button type="button" id="checkout-signin-link" class="font-semibold text-brand-600 dark:text-brand-400 hover:underline">Sign in to link account</button>`
            }
          </p>
        </div>
      </div>
      <button type="button" id="checkout-close-btn" data-checkout-close class="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition" aria-label="Close checkout">
        ${icon('x', 'h-5 w-5')}
      </button>
    </div>

    <form id="checkout-form" class="mt-6 space-y-5">
      <!-- Order Summary -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-4">
        <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          <span>Order Summary (${items.reduce((s, i) => s + i.qty, 0)} items)</span>
          <span class="text-slate-900 dark:text-white text-sm">${formatPrice(subtotalUgx)}</span>
        </div>
        <ul class="divide-y divide-slate-200/70 dark:divide-slate-800 max-h-36 overflow-y-auto space-y-2">
          ${items
            .map(
              ({ product: p, qty }) => `
            <li class="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2.5 min-w-0">
                <img src="${p.image}" alt="${p.title}" class="h-9 w-9 rounded-lg object-cover shrink-0 bg-slate-200 dark:bg-slate-800" />
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900 dark:text-white truncate">${p.title}</p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Qty: ${qty} × ${formatPrice(p.price)}</p>
                </div>
              </div>
              <span class="font-bold text-slate-900 dark:text-white shrink-0">${formatPrice(toUGX(p.price) * qty)}</span>
            </li>`,
            )
            .join('')}
        </ul>
      </div>

      <!-- Delivery Address & Contact -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <div class="flex items-center justify-between">
            <label for="checkout-address" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Delivery or Pickup Address</label>
            <button type="button" id="checkout-fill-pickup" class="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              ${icon('map-pin', 'h-3 w-3')} Use Flagship Pickup
            </button>
          </div>
          <input id="checkout-address" type="text" required minlength="5" maxlength="128"
            placeholder="e.g. Plot 24 Kampala Road, Nakasero, Kampala"
            class="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>

        <div class="sm:col-span-2">
          <label for="checkout-contact" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Contact Phone Number (SMS / MoMo)</label>
          <input id="checkout-contact" type="tel" required minlength="5" maxlength="16"
            value="${prefilledPhone}"
            placeholder="+256701234567"
            class="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          <p class="mt-1 text-[11px] text-slate-400">5–16 digits (e.g. +256701234567) for dispatch updates.</p>
        </div>
      </div>

      <!-- Payment Method -->
      <div>
        <span class="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Payment Method</span>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="checkout-payment-methods">
          ${paymentOptions
            .map((opt) => {
              const active = opt.value === selectedPaymentMethod;
              return `
                <button type="button" data-pay-method="${opt.value}"
                  class="flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                    active
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-500/15 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 hover:border-brand-300'
                  }">
                  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    active ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }">
                    ${icon(opt.iconName, 'h-4 w-4')}
                  </span>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-900 dark:text-white truncate">${opt.title}</p>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${opt.subtitle}</p>
                  </div>
                </button>`;
            })
            .join('')}
        </div>
      </div>

      <!-- Settle payment immediately toggle -->
      <label class="flex items-start gap-2.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 cursor-pointer select-none">
        <input id="checkout-pay-now" type="checkbox" checked class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 accent-[#E6007E]" />
        <div class="text-xs">
          <span class="font-bold text-emerald-900 dark:text-emerald-300">Pay & Approve Order Immediately</span>
          <p class="text-slate-600 dark:text-slate-400 mt-0.5">Processes instant payment confirmation and advances order status to <strong>APPROVED</strong>. Uncheck to reserve stock and pay later.</p>
        </div>
      </label>

      <div id="checkout-error" class="hidden rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300"></div>

      <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button type="button" data-checkout-close class="rounded-full px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
          Cancel
        </button>
        <button type="submit" id="checkout-submit-btn" class="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition active:scale-95">
          ${icon('lock', 'h-4 w-4')}
          <span>Place Order · ${formatPrice(subtotalUgx)}</span>
        </button>
      </div>
    </form>
  `;

  // Bind events inside panel
  document.getElementById('checkout-fill-pickup')?.addEventListener('click', () => {
    const addrInput = document.getElementById('checkout-address');
    if (addrInput) addrInput.value = getPreferredPickupAddress();
  });

  document.getElementById('checkout-signin-link')?.addEventListener('click', () => {
    closeCheckoutModal();
    onOpenSignInCallback?.();
  });

  panel.querySelectorAll('[data-pay-method]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedPaymentMethod = btn.dataset.payMethod;
      const addrVal = document.getElementById('checkout-address')?.value || '';
      const contactVal = document.getElementById('checkout-contact')?.value || '';
      const payNowVal = document.getElementById('checkout-pay-now')?.checked ?? true;
      renderCheckoutForm();
      const addrNext = document.getElementById('checkout-address');
      const contactNext = document.getElementById('checkout-contact');
      const payNowNext = document.getElementById('checkout-pay-now');
      if (addrNext) addrNext.value = addrVal;
      if (contactNext) contactNext.value = contactVal;
      if (payNowNext) payNowNext.checked = payNowVal;
    });
  });

  document.getElementById('checkout-form')?.addEventListener('submit', handleCheckoutSubmit);
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const errorBox = document.getElementById('checkout-error');
  const submitBtn = document.getElementById('checkout-submit-btn');
  const address = document.getElementById('checkout-address')?.value.trim() || '';
  const rawContact = document.getElementById('checkout-contact')?.value.trim() || '';
  const contact = normalizeContactPhone(rawContact);
  const payImmediately = document.getElementById('checkout-pay-now')?.checked ?? true;

  const showError = (msg) => {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.remove('hidden');
    }
  };

  if (address.length < 5) {
    return showError('Please enter a delivery address of at least 5 characters.');
  }
  if (contact.length < 5 || contact.length > 16) {
    return showError('Please enter a valid contact phone number (5 to 16 digits).');
  }

  const items = getCartItems();
  if (!items.length) return;

  if (errorBox) errorBox.classList.add('hidden');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('refresh-cw', 'h-4 w-4 animate-spin')} <span>Submitting to FastAPI…</span>`;
  }

  const createdOrders = [];
  try {
    for (const { product, qty } of items) {
      const order = await ordersApi.create({
        product_id: product.id,
        quantity: qty,
        address,
        contact,
        payment_method: selectedPaymentMethod,
      });

      let finalOrder = {
        ...order,
        productTitle: order.product?.name || product.title,
      };

      if (payImmediately) {
        await paymentsApi.pay({
          order_id: order.id,
          payment_method: selectedPaymentMethod,
          amount: order.total_price,
        });
        finalOrder.payment_status = 'PAID';
        finalOrder.order_status = 'APPROVED';
      }

      createdOrders.push(finalOrder);
    }

    clearCart();
    await syncCatalogFromBackend().catch(() => null);
    renderOrderReceipt(createdOrders);
    showToast(
      `Order ${createdOrders.map((o) => `#${o.id}`).join(', ')} confirmed!`,
      { variant: 'success' },
    );
  } catch (err) {
    // If partial orders succeeded before an error, refresh stock & show message
    if (createdOrders.length > 0) {
      await syncCatalogFromBackend().catch(() => null);
    }
    showError(err.message || 'Could not place order. Ensure the FastAPI backend is running and items are in stock.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('lock', 'h-4 w-4')} <span>Retry Place Order</span>`;
    }
  }
}

function renderOrderReceipt(createdOrders) {
  const panel = document.getElementById('checkout-modal-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="text-center py-3">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
        ${icon('check-circle-2', 'h-8 w-8')}
      </div>
      <h3 class="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">Order Confirmed!</h3>
      <p class="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        Your order has been recorded in the Urban Scenery Ventures database and inventory has been reserved.
      </p>
    </div>

    <div class="mt-5 space-y-3 max-h-64 overflow-y-auto">
      ${createdOrders
        .map(
          (o) => `
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-extrabold text-brand-600 dark:text-brand-400">ORDER #${o.id}</span>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-bold ${
                o.payment_status === 'PAID'
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              }">${o.payment_status}</span>
              <span class="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">${o.order_status}</span>
            </div>
            <p class="mt-1 text-sm font-bold text-slate-900 dark:text-white">${o.quantity} × ${o.productTitle}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${o.address} · ${o.contacs || ''}</p>
          </div>
          <div class="text-left sm:text-right shrink-0">
            <p class="text-sm font-extrabold text-slate-900 dark:text-white">${formatPrice(Number(o.total_price))}</p>
            <p class="text-[11px] text-slate-400">${o.payment_method}</p>
          </div>
        </div>`,
        )
        .join('')}
    </div>

    <div class="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
      <button type="button" id="receipt-track-btn" class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition">
        ${icon('truck', 'h-4 w-4 text-brand-500')}
        <span>View & Track Orders</span>
      </button>
      <button type="button" data-checkout-close class="inline-flex items-center gap-1.5 rounded-full bg-brand-500 hover:bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition">
        <span>Continue Shopping</span>
        ${icon('arrow-right', 'h-4 w-4')}
      </button>
    </div>
  `;

  document.getElementById('receipt-track-btn')?.addEventListener('click', () => {
    closeCheckoutModal();
    onViewOrdersCallback?.();
  });
}

export function openCheckoutModal() {
  const items = getCartItems();
  if (!items.length) {
    showToast('Your cart is empty', { variant: 'info' });
    return;
  }
  const modal = ensureModalElement();
  if (!isOpen) {
    isOpen = true;
    lastFocused = document.activeElement;
    modal.classList.remove('hidden');
    lockScroll();
  }
  renderCheckoutForm();
  setTimeout(() => document.getElementById('checkout-address')?.focus(), 60);
}

export function closeCheckoutModal() {
  if (!isOpen) return;
  const modal = document.getElementById('checkout-modal');
  isOpen = false;
  modal?.classList.add('hidden');
  unlockScroll();
  lastFocused?.focus?.({ preventScroll: true });
}

export function initCheckoutModal({ onViewOrders, onOpenSignIn } = {}) {
  onViewOrdersCallback = onViewOrders;
  onOpenSignInCallback = onOpenSignIn;
  const modal = ensureModalElement();
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-checkout-close]')) {
      closeCheckoutModal();
    }
  });
}

