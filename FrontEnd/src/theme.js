import { icon } from './icons.js';

const THEME_KEY = 'urban:theme';

/**
 * Returns 'dark' or 'light'.
 * Checks localStorage first, then active class on <html>, then system preference.
 */
export function getTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (e) {}

  if (document.documentElement.classList.contains('dark')) return 'dark';
  if (document.documentElement.classList.contains('light')) return 'light';

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Applies 'dark' or 'light' mode across documentElement and updates all toggle buttons.
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === 'dark';

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  // Update theme meta color
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.setAttribute('name', 'theme-color');
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', isDark ? '#0B0F19' : '#FFFFFF');

  // Update all theme toggle buttons across the page
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');

    // In Dark Mode: Show bright Sun icon to switch to light mode
    // In Light Mode: Show dark Moon icon to switch to dark mode
    if (isDark) {
      btn.innerHTML = `${icon('sun', 'h-4 w-4 sm:h-5 sm:w-5 text-amber-400 fill-amber-400/20 transition-transform duration-300 hover:rotate-45')} <span class="sr-only">Switch to light mode</span>`;
    } else {
      btn.innerHTML = `${icon('moon', 'h-4 w-4 sm:h-5 sm:w-5 text-slate-700 fill-slate-700/20 transition-transform duration-300 hover:-rotate-12')} <span class="sr-only">Switch to dark mode</span>`;
    }
  });

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('urban:theme_changed', { detail: { theme, isDark } }));
}

/**
 * Toggles the current theme between 'dark' and 'light'.
 */
export function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  const next = isCurrentlyDark ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

let isThemeListenerAttached = false;

/**
 * Initialize theme and setup persistent click listeners.
 */
export function initTheme() {
  const initial = getTheme();
  applyTheme(initial);

  if (!isThemeListenerAttached) {
    isThemeListenerAttached = true;

    // Use capturing listener so theme toggle responds without interference
    document.addEventListener(
      'click',
      (e) => {
        const btn = e.target.closest('[data-theme-toggle]');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          toggleTheme();
        }
      },
      true
    );

    // Watch OS system preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const explicit = localStorage.getItem(THEME_KEY);
        if (!explicit) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
}

// Auto-run on import so buttons and DOM are immediately synced
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTheme());
  } else {
    initTheme();
  }
}
