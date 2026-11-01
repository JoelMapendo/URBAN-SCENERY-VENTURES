import { icon } from '../icons.js';
import {
  subscribe,
  getCartItems,
  getCartCount,
  getCartTotals,
  setQty,
  removeFromCart,
  clearCart,
  FREE_SHIPPING_THRESHOLD,
} from '../store.js';
import { formatPrice, toUGX, lockScroll, unlockScroll } from '../utils.js';
import { showToast } from './toast.js';

const overlay = document.getElementById('cart-overlay');
const drawer = document.getElementById('cart-drawer');
const list = document.getElementById('cart-items');
const countLabel = document.getElementById('cart-drawer-count');
const footer = document.getElementById('cart-footer');
const shipping = document.getElementById('cart-shipping');
const shippingText = document.getElementById('cart-shipping-text');
const shippingBar = document.getElementById('cart-shipping-bar');
const subtotalEl = document.getElementById('cart-subtotal');
const shippingEl = document.getElementById('cart-shipping-cost');
const totalEl = document.getElementById('cart-total');

let isOpen = false;
let lastFocused = null;

export const isCartOpen = () => isOpen;

export function openCart() {
  if (isOpen) return;
  isOpen = true;
  lastFocused = document.activeElement;
  drawer.inert = false;
  drawer.setAttribute('aria-hidden', 'false');
  drawer.classList.remove('translate-x-full');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  lockScroll();
  setTimeout(() => document.getElementById('cart-close').focus(), 50);
}

export function closeCart() {
  if (!isOpen) return;
  isOpen = false;
  drawer.classList.add('translate-x-full');
  overlay.classList.add('opacity-0', 'pointer-events-none');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.inert = true;
  unlockScroll();
  lastFocused?.focus?.({ preventScroll: true });
}

function cartItem({ product: p, qty }) {
  const maxQty = p.fromBackend ? Math.max(1, Math.min(99, Number(p.stock ?? 99))) : 99;
  return `
    <li class="flex gap-4 py-4 first:pt-0 dark:border-slate-800" data-cart-item="${p.id}">
      <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        ${
          p.image
            ? `<img src="${p.image}" alt="${p.title}" class="h-full w-full object-cover" />`
            : icon(p.icon || 'package', `h-9 w-9 ${p.fg || 'text-slate-600'}`)
        }
      </div>
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">${p.category}</p>
            <h3 class="truncate text-sm font-semibold text-slate-900 dark:text-white">${p.title}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">${formatPrice(p.price)} each</p>
          </div>
          <button type="button" data-cart-remove="${p.id}" id="cart-remove-${p.id}"
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition"
            aria-label="Remove ${p.title} from cart">
            ${icon('trash-2', 'h-4 w-4')}
          </button>
        </div>
        <div class="mt-auto flex items-center justify-between pt-2">
          <div class="qty-stepper">
            <button type="button" class="qty-btn" data-cart-dec="${p.id}" id="cart-dec-${p.id}" aria-label="Decrease quantity">${icon('minus', 'h-4 w-4')}</button>
            <span class="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white" aria-live="polite">${qty}</span>
            <button type="button" class="qty-btn" data-cart-inc="${p.id}" id="cart-inc-${p.id}" aria-label="Increase quantity" ${qty >= maxQty ? 'disabled' : ''}>${icon('plus', 'h-4 w-4')}</button>
          </div>
          <p class="text-sm font-bold text-slate-900 dark:text-white">${formatPrice(toUGX(p.price) * qty)}</p>
        </div>
      </div>
    </li>`;
}

const emptyState = `
  <li class="flex h-full flex-col items-center justify-center py-16 text-center">
    <div class="h-20 w-20 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden mb-3">
      <img src="/urban-scenery-logo.png" alt="Urban Scenery" class="h-full w-full object-contain" />
    </div>
    <p class="text-lg font-bold text-slate-900 dark:text-white">Your cart is empty</p>
    <p class="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">Discover authentic goods uploaded by trusted sellers.</p>
    <button type="button" data-cart-shop id="cart-start-shopping"
      class="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition">
      Start shopping ${icon('arrow-right', 'h-4 w-4')}
    </button>
  </li>`;

function render() {
  const items = getCartItems();
  const count = getCartCount();
  const { subtotal, shipping: shippingCost, total } = getCartTotals();

  countLabel.textContent = `(${count})`;
  list.innerHTML = items.length ? items.map(cartItem).join('') : emptyState;
  list.classList.toggle('divide-y', items.length > 0);
  footer.classList.toggle('hidden', items.length === 0);
  shipping.classList.toggle('hidden', items.length === 0);

  // Free-shipping progress
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  shippingBar.style.width = `${progress}%`;
  shippingBar.classList.toggle('bg-emerald-500', remaining === 0);
  shippingBar.classList.toggle('bg-brand-500', remaining > 0);
  shippingText.innerHTML =
    remaining === 0
      ? `${icon('truck', 'h-4 w-4 text-emerald-600 dark:text-emerald-400')}<span><strong class="text-emerald-700 dark:text-emerald-400">You've unlocked free shipping!</strong></span>`
      : `${icon('truck', 'h-4 w-4 text-brand-600 dark:text-brand-400')}<span>You're <strong class="text-slate-900 dark:text-white">${formatPrice(remaining)}</strong> away from free shipping</span>`;

  subtotalEl.textContent = formatPrice(subtotal);
  shippingEl.textContent = shippingCost === 0 ? 'Free' : formatPrice(shippingCost);
  shippingEl.classList.toggle('text-emerald-600', shippingCost === 0);
  totalEl.textContent = formatPrice(total);
}

export function initCartDrawer({ onShop, onCheckout } = {}) {
  drawer.inert = true;

  overlay.addEventListener('click', closeCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-continue').addEventListener('click', closeCart);

  document.getElementById('cart-clear').addEventListener('click', () => {
    clearCart();
    showToast('Your cart has been cleared', { variant: 'info' });
  });

  document.getElementById('cart-checkout').addEventListener('click', () => {
    closeCart();
    if (onCheckout) {
      onCheckout();
    } else {
      const orderNum = `US-${Math.floor(100000 + Math.random() * 900000)}`;
      const { total } = getCartTotals();
      clearCart();
      showToast(`Order #${orderNum} confirmed (${formatPrice(total)})! Preparing dispatch.`, { variant: 'success' });
    }
  });

  list.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    const items = getCartItems();
    const findQty = (id) => items.find((i) => i.product.id === Number(id))?.qty ?? 0;

    if (target.dataset.cartInc) setQty(target.dataset.cartInc, findQty(target.dataset.cartInc) + 1);
    else if (target.dataset.cartDec) setQty(target.dataset.cartDec, findQty(target.dataset.cartDec) - 1);
    else if (target.dataset.cartRemove) {
      const item = items.find((i) => i.product.id === Number(target.dataset.cartRemove));
      removeFromCart(target.dataset.cartRemove);
      if (item) showToast(`${item.product.title} removed`, { variant: 'info' });
    } else if ('cartShop' in target.dataset) {
      closeCart();
      onShop?.();
    }
  });

  subscribe((change) => change.type === 'cart' && render());
  window.addEventListener('lumen:currency_changed', render);
  window.addEventListener('lumen:products_updated', render);
  render();
}
