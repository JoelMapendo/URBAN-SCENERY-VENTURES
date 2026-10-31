export const UGX_PER_USD = 3800;

export const CURRENCY_RATES = {
  UGX: 1,
  USD: 1 / UGX_PER_USD,
  EUR: 0.92 / UGX_PER_USD,
  GBP: 0.79 / UGX_PER_USD,
};

/**
 * Normalizes any product price (whether stored in UGX >= 10,000 or USD < 10,000) to UGX.
 */
export function toUGX(n) {
  const num = Number(n) || 0;
  if (num === 0) return 0;
  return num < 10000 ? num * UGX_PER_USD : num;
}

/**
 * Normalizes any product price (whether stored in UGX >= 10,000 or USD < 10,000) to USD.
 */
export function toUSD(n) {
  const num = Number(n) || 0;
  if (num === 0) return 0;
  return num >= 10000 ? num / UGX_PER_USD : num;
}

export function getSelectedCurrency() {
  return (localStorage.getItem('lumen:currency') || 'UGX').toUpperCase();
}

export function setSelectedCurrency(curr) {
  const normalized = String(curr || 'UGX').toUpperCase();
  localStorage.setItem('lumen:currency', normalized);
  window.dispatchEvent(new CustomEvent('lumen:currency_changed', { detail: normalized }));
}

export const formatPrice = (n, currency = getSelectedCurrency()) => {
  const curr = String(currency || 'UGX').toUpperCase();
  const ugxVal = toUGX(n);

  if (curr === 'UGX') {
    return `Ugx ${Math.round(ugxVal).toLocaleString('en-US')}`;
  }

  const usdVal = toUSD(n);
  if (curr === 'EUR') {
    return `€${(usdVal * 0.92).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (curr === 'GBP') {
    return `£${(usdVal * 0.79).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Restart a CSS animation class on an element. */
export function replayAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // force reflow
  el.classList.add(className);
}

/* Reference-counted body scroll lock so stacked overlays behave. */
let locks = 0;
export function lockScroll() {
  if (locks++ === 0) {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  }
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}
