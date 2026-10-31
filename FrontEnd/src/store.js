import { getProduct } from './data/products.js';
import { toUGX } from './utils.js';

/**
 * Tiny reactive store for the cart and wishlist.
 * State is persisted to localStorage so it survives page refreshes.
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
  // [{ id, qty }] — drop anything that no longer exists in the catalog
  cart: load(CART_KEY, []).filter((item) => getProduct(item.id) && item.qty > 0),
  wishlist: new Set(load(WISHLIST_KEY, []).filter((id) => getProduct(id))),
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

/* ---------------- Cart ---------------- */

export function addToCart(id, qty = 1) {
  id = Number(id);
  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
  else state.cart.push({ id, qty: Math.min(MAX_QTY, qty) });
  emit({ type: 'cart' });
}

export function setQty(id, qty) {
  id = Number(id);
  if (qty <= 0) return removeFromCart(id);
  const item = state.cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.min(MAX_QTY, qty);
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
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
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
export const getWishlist = () => [...state.wishlist];
export const getWishlistCount = () => state.wishlist.size;
