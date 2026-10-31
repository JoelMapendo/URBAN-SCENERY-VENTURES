import { icon } from '../icons.js';
import { getProduct } from '../data/products.js';
import { addToCart } from '../store.js';
import { formatPrice, toUGX, lockScroll, unlockScroll } from '../utils.js';
import { badgeClass, wishButton } from './productCard.js';
import { showToast } from './toast.js';

const modal = document.getElementById('quick-view');
const content = document.getElementById('qv-content');

let isOpen = false;
let current = null;
let qty = 1;
let lastFocused = null;
let closeTimer;

export const isQuickViewOpen = () => isOpen;

function stars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    icon('star', `h-4 w-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`),
  ).join('');
}

function template(p) {
  const savings = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return `
    <div class="grid md:grid-cols-2">
      <div class="relative grid aspect-[4/3] place-items-center overflow-hidden bg-slate-900/5 ${p.bg} md:aspect-auto md:min-h-[480px]">
        <span class="absolute left-1/2 top-3 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-slate-900/15 md:hidden"></span>
        ${p.badge ? `<span class="absolute left-5 top-5 z-10 rounded-full ${badgeClass(p.badge)} px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">${p.badge}</span>` : ''}
        ${
          p.image
            ? `<img src="${p.image}" alt="${p.title}" class="h-full w-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';" />
               <div class="hidden h-full w-full place-items-center">${icon(p.icon || 'package', `h-32 w-32 md:h-44 md:w-44 ${p.fg || 'text-slate-600'} drop-shadow-sm`, { 'stroke-width': '1' })}</div>`
            : icon(p.icon || 'package', `h-32 w-32 md:h-44 md:w-44 ${p.fg || 'text-slate-600'} drop-shadow-sm`, { 'stroke-width': '1' })
        }
      </div>

      <div class="flex flex-col p-6 md:p-8 dark:bg-[#0F172A]">
        <p class="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-accent-400">${p.category}</p>
        <h2 id="qv-title" class="mt-2 pr-10 text-2xl font-bold leading-tight text-slate-900 dark:text-white md:text-3xl">${p.title}</h2>

        <div class="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span class="flex">${stars(p.rating)}</span>
          <span class="font-medium text-slate-700 dark:text-slate-200">${p.rating}</span>
          <span>· ${p.reviews} reviews</span>
        </div>

        <div class="mt-5 flex items-baseline gap-3">
          <span class="text-3xl font-bold text-slate-900 dark:text-white">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="text-lg text-slate-400 line-through">${formatPrice(p.oldPrice)}</span>
          <span class="rounded-full bg-accent-100 dark:bg-accent-500/20 px-2.5 py-1 text-xs font-bold text-accent-700 dark:text-accent-300">Save ${savings}%</span>` : ''}
        </div>

        <p class="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">${p.description}</p>

        <ul class="mt-5 space-y-2">
          ${p.features
            .map(
              (f) => `<li class="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span class="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">${icon('check', 'h-3 w-3', { 'stroke-width': '3' })}</span>${f}</li>`,
            )
            .join('')}
        </ul>

        <p class="mt-5 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span> In stock — ships in 1–2 business days
        </p>

        <div class="mt-auto flex items-center gap-3 pt-6">
          <div class="qty-stepper">
            <button type="button" class="qty-btn h-11 w-11" id="qv-dec" aria-label="Decrease quantity" ${qty <= 1 ? 'disabled' : ''}>${icon('minus', 'h-4 w-4')}</button>
            <span id="qv-qty" class="w-8 text-center font-semibold text-slate-900 dark:text-white" aria-live="polite">${qty}</span>
            <button type="button" class="qty-btn h-11 w-11" id="qv-inc" aria-label="Increase quantity">${icon('plus', 'h-4 w-4')}</button>
          </div>
          <button type="button" id="qv-add"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition active:scale-[0.98]">
            ${icon('shopping-cart', 'h-4 w-4')} <span id="qv-add-label">Add to Cart · ${formatPrice(toUGX(p.price) * qty)}</span>
          </button>
          ${wishButton(p, 'h-12 w-12 border border-slate-200 dark:border-slate-700 shrink-0', 'h-5 w-5', 'qv-wishlist')}
        </div>
      </div>
    </div>`;
}

function updateQty(next) {
  qty = Math.max(1, Math.min(99, next));
  document.getElementById('qv-qty').textContent = qty;
  document.getElementById('qv-dec').disabled = qty <= 1;
  document.getElementById('qv-inc').disabled = qty >= 99;
  document.getElementById('qv-add-label').textContent = `Add to Cart · ${formatPrice(toUGX(current.price) * qty)}`;
}

export function openQuickView(id) {
  const p = getProduct(id);
  if (!p) return;
  clearTimeout(closeTimer);
  current = p;
  qty = 1;
  content.innerHTML = template(p);

  if (!isOpen) {
    isOpen = true;
    lastFocused = document.activeElement;
    modal.classList.remove('hidden');
    lockScroll();
    requestAnimationFrame(() => requestAnimationFrame(() => (modal.dataset.open = 'true')));
  }
  setTimeout(() => document.getElementById('qv-close').focus({ preventScroll: true }), 60);
}

export function closeQuickView() {
  if (!isOpen) return;
  isOpen = false;
  modal.dataset.open = 'false';
  unlockScroll();
  closeTimer = setTimeout(() => modal.classList.add('hidden'), 320);
  lastFocused?.focus?.({ preventScroll: true });
}

export function initQuickView({ onAdded } = {}) {
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-qv-close]')) return closeQuickView();
    if (e.target.closest('#qv-dec')) return updateQty(qty - 1);
    if (e.target.closest('#qv-inc')) return updateQty(qty + 1);
    if (e.target.closest('#qv-add')) {
      addToCart(current.id, qty);
      const title = current.title;
      const added = qty;
      closeQuickView();
      showToast(`${added > 1 ? `${added} × ` : ''}${title} added to cart`, {
        action: { label: 'View cart', onClick: () => onAdded?.() },
      });
    }
  });
}
