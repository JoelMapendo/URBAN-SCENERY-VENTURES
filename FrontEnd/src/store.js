import { getProduct } from './data/products.js';
import { toUGX } from './utils.js';

/**
 * Tiny reactive store for the cart and wishlist.
 * State is persisted to localStorage and automatically reconciles against
 * the live FastAPI backend catalog whenever `lumen:products_updated` fires.
 */

const CART_KEY = 'lumen:cart';
const WISHLIST_KEY = 'lumen:wishlist';
const MAX_QTY = 99;

// Normalized in UGX ($50 free shipping threshold, ~$5.99 flat shipping)
export const FREE_SHIPPING_THRESHOLD = 190000;
export const SHIPPING_FEE = 22800;

function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

const state = {
  cart: load(CART_KEY, []).filter((item) => item && Number(item.id) > 0 && Number(item.qty) > 0),
  wishlist: new Set(load(WISHLIST_KEY, []).map(Number).filter((id) => id > 0)),
};

const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([...state.wishlist]));
  } catch {
    /* storage may be unavailable (private mode) — app still works in-memory */
  }
}

function emit(change) {
  persist();
  listeners.forEach((fn) => fn(change));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Reconciles cart and wishlist items against the active backend catalog:
 * removes stale IDs and caps quantities to available stock.
 */
export function reconcileWithCatalog() {
  let cartChanged = false;
  const nextCart = [];

  for (const item of state.cart) {
    const prod = getProduct(item.id);
    if (!prod) {
      cartChanged = true;
      continue;
    }
    const maxAvail = prod.fromBackend ? Math.min(MAX_QTY, Number(prod.stock ?? MAX_QTY)) : MAX_QTY;
    if (maxAvail <= 0) {
      cartChanged = true;
      continue;
    }
    const clampedQty = Math.min(item.qty, maxAvail);
    if (clampedQty !== item.qty) cartChanged = true;
    nextCart.push({ id: Number(item.id), qty: clampedQty });
  }

  state.cart = nextCart;
  if (cartChanged) {
    emit({ type: 'cart' });
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('lumen:products_updated', () => {
    reconcileWithCatalog();
  });
}

/* ---------------- Cart ---------------- */

export function addToCart(id, qty = 1) {
  id = Number(id);
  const prod = getProduct(id);
  const maxStock = prod?.fromBackend ? Math.min(MAX_QTY, Number(prod.stock ?? MAX_QTY)) : MAX_QTY;
  if (maxStock <= 0) return false;

  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.qty = Math.min(maxStock, existing.qty + qty);
  else state.cart.push({ id, qty: Math.min(maxStock, qty) });
  emit({ type: 'cart' });
  return true;
}

export function setQty(id, qty) {
  id = Number(id);
  if (qty <= 0) return removeFromCart(id);
  const item = state.cart.find((i) => i.id === id);
  if (!item) return;
  const prod = getProduct(id);
  const maxStock = prod?.fromBackend ? Math.min(MAX_QTY, Number(prod.stock ?? MAX_QTY)) : MAX_QTY;
  item.qty = Math.min(maxStock, qty);
  emit({ type: 'cart' });
}

export function removeFromCart(id) {
  id = Number(id);
  state.cart = state.cart.filter((item) => item.id !== id);
  emit({ type: 'cart' });
}

export function clearCart() {
  state.cart = [];
  emit({ type: 'cart' });
}

export function getCartItems() {
  return state.cart
    .map(({ id, qty }) => ({ product: getProduct(id), qty }))
    .filter((item) => Boolean(item.product));
}

export function getCartCount() {
  return getCartItems().reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotals() {
  const subtotal = getCartItems().reduce((sum, { product, qty }) => sum + toUGX(product.price) * qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}

/* ---------------- Wishlist ---------------- */

export function toggleWishlist(id) {
  id = Number(id);
  const added = !state.wishlist.has(id);
  if (added) state.wishlist.add(id);
  else state.wishlist.delete(id);
  emit({ type: 'wishlist', id, added });
  return added;
}

export const isWished = (id) => state.wishlist.has(Number(id));
export const getWishlist = () => [...state.wishlist].filter((id) => Boolean(getProduct(id)));
export const getWishlistCount = () => getWishlist().length;
