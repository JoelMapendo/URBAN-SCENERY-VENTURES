import { icon } from '../icons.js';

const VARIANTS = {
  success: { bg: 'bg-emerald-500', icon: 'check' },
  wish: { bg: 'bg-accent-500', icon: 'heart' },
  info: { bg: 'bg-brand-500', icon: 'info' },
};

const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toast-icon');
const toastMsg = document.getElementById('toast-message');
const toastAction = document.getElementById('toast-action');

let hideTimer;
let actionHandler = null;

toastAction.addEventListener('click', () => {
  actionHandler?.();
  hideToast();
});

export function hideToast() {
  toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
}

/**
 * @param {string} message
 * @param {{ variant?: 'success'|'wish'|'info', action?: { label: string, onClick: Function } }} [options]
 */
export function showToast(message, { variant = 'success', action } = {}) {
  const v = VARIANTS[variant] ?? VARIANTS.success;
  toastIcon.className = `grid h-9 w-9 shrink-0 place-items-center rounded-full ${v.bg}`;
  toastIcon.innerHTML = icon(v.icon, 'h-5 w-5', variant === 'wish' ? { fill: 'currentColor' } : {});
  toastMsg.textContent = message;

  actionHandler = action?.onClick ?? null;
  toastAction.textContent = action?.label ?? '';
  toastAction.classList.toggle('hidden', !action);

  toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideToast, action ? 3500 : 2200);
}
