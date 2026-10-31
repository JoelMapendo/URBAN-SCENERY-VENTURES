import { icon } from '../icons.js';
import { showToast } from './toast.js';

const STORAGE_KEY = 'lumen:hide_welcome_modal';
const PROMO_CODE = 'URBAN15';

export function initWelcomeModal({ onExploreDeals } = {}) {
  const modal = document.getElementById('welcome-popup-modal');
  if (!modal) return;

  const closeBtns = modal.querySelectorAll('[data-welcome-close]');
  const claimBtn = document.getElementById('welcome-claim-btn');
  const copyCodeBtn = document.getElementById('welcome-copy-code-btn');
  const dontShowAgainCheckbox = document.getElementById('welcome-dont-show');

  function openWelcomeModal() {
    modal.classList.remove('hidden');
    modal.setAttribute('data-open', 'true');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  }

  function closeWelcomeModal() {
    modal.setAttribute('data-open', 'false');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);

    if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        // ignore
      }
    }
  }

  // Close triggers
  closeBtns.forEach((btn) => {
    btn.addEventListener('click', closeWelcomeModal);
  });

  // Claim Promo & Shop
  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
      try {
        navigator.clipboard.writeText(PROMO_CODE);
      } catch (e) {
        // fallback
      }
      closeWelcomeModal();
      showToast(`Promo code ${PROMO_CODE} copied! 15% off applied at checkout.`, { variant: 'success' });
      if (typeof onExploreDeals === 'function') {
        onExploreDeals();
      }
    });
  }

  // Copy code directly
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      try {
        navigator.clipboard.writeText(PROMO_CODE);
        showToast(`Copied ${PROMO_CODE} to clipboard!`, { variant: 'info' });
      } catch (e) {
        showToast(`Code: ${PROMO_CODE}`, { variant: 'info' });
      }
    });
  }

  // Keyboard Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('data-open') === 'true') {
      closeWelcomeModal();
    }
  });

  // Re-trigger from buttons with [data-open-welcome-modal]
  document.querySelectorAll('[data-open-welcome-modal]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openWelcomeModal();
    });
  });

  // Auto-pop on first visit after 1000ms delay
  const isHidden = localStorage.getItem(STORAGE_KEY) === 'true';
  if (!isHidden) {
    setTimeout(() => {
      openWelcomeModal();
    }, 1100);
  }

  return {
    open: openWelcomeModal,
    close: closeWelcomeModal,
  };
}
