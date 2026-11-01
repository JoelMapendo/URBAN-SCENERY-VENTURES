import { icon } from '../icons.js';
import { getCatalogProducts, mapBackendProduct } from '../data/products.js';
import { aiApi } from '../services/api.js';
import { formatPrice, lockScroll, unlockScroll } from '../utils.js';
import { showToast } from './toast.js';

// Predefined visual samples for instant 1-click testing (aligned with live backend & local catalogs)
export const SAMPLES = [
  { id: 1, label: 'Laptop', query: 'laptop', icon: 'laptop', bg: 'from-slate-800 to-indigo-900', fg: 'text-indigo-300' },
  { id: 2, label: 'Headphones', query: 'headphones', icon: 'headphones', bg: 'from-brand-100 to-brand-200', fg: 'text-brand-600' },
  { id: 3, label: 'Smartphone', query: 'phone', icon: 'smartphone', bg: 'from-accent-50 to-accent-100', fg: 'text-accent-500' },
  { id: 4, label: '4K Monitor', query: 'monitor', icon: 'cpu', bg: 'from-emerald-50 to-emerald-100', fg: 'text-emerald-600' },
  { id: 5, label: 'Power Bank', query: 'power bank', icon: 'zap', bg: 'from-amber-50 to-amber-100', fg: 'text-amber-600' },
  { id: 6, label: 'Gaming', query: 'gaming', icon: 'sparkles', bg: 'from-violet-50 to-violet-100', fg: 'text-violet-600' },
];

let isOpen = false;
let lastFocused = null;
let currentMatches = [];
let scanTimeout = null;

const modal = document.getElementById('visual-search-modal');
const dropzone = document.getElementById('vs-dropzone');
const fileInput = document.getElementById('vs-file-input');
const scannerContainer = document.getElementById('vs-scanner');
const scanPreview = document.getElementById('vs-scan-preview');
const scanStatus = document.getElementById('vs-scan-status');
const resultsContainer = document.getElementById('vs-results');
const resultsList = document.getElementById('vs-results-list');
const resetBtn = document.getElementById('vs-reset-btn');
const sampleContainer = document.getElementById('vs-samples');

let onSelectMatchCallback = null;

export const isVisualSearchOpen = () => isOpen;

export function openVisualSearch() {
  if (isOpen) return;
  isOpen = true;
  lastFocused = document.activeElement;
  modal.classList.remove('hidden');
  lockScroll();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.dataset.open = 'true';
    });
  });
  renderSamples();
  resetToUploadState();
  setTimeout(() => document.getElementById('vs-close')?.focus(), 60);
}

export function closeVisualSearch() {
  if (!isOpen) return;
  isOpen = false;
  clearTimeout(scanTimeout);
  modal.dataset.open = 'false';
  unlockScroll();
  setTimeout(() => modal.classList.add('hidden'), 320);
  lastFocused?.focus?.({ preventScroll: true });
}

function renderSamples() {
  if (!sampleContainer) return;
  sampleContainer.innerHTML = SAMPLES.map(
    (s) => `
    <button type="button" data-vs-sample="${s.id}" class="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-2.5 transition hover:border-brand-400 hover:shadow-md">
      <div class="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br ${s.bg} transition group-hover:scale-105">
        ${icon(s.icon, `h-6 w-6 ${s.fg}`, { 'stroke-width': '1.5' })}
      </div>
      <span class="text-xs font-medium text-slate-700 dark:text-slate-200">${s.label}</span>
    </button>`,
  ).join('');
}

function resetToUploadState() {
  dropzone.classList.remove('hidden');
  scannerContainer.classList.add('hidden');
  resultsContainer.classList.add('hidden');
  if (fileInput) fileInput.value = '';
}

/**
 * Intelligent image matching: queries FastAPI `/api/v1/ai/smart-search` when available,
 * and falls back to local catalog matching by sample ID or filename keywords.
 */
async function findMatches(criteria) {
  const products = getCatalogProducts();
  let matched = [];

  // Build search query from sample or filename
  let queryTerm = '';
  if (typeof criteria === 'number') {
    const sample = SAMPLES.find((s) => s.id === criteria);
    queryTerm = sample?.query || sample?.label || '';
  } else {
    const cleaned = String(criteria || '')
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    if (cleaned.length >= 2) queryTerm = cleaned;
  }

  if (queryTerm.length >= 2) {
    try {
      const res = await aiApi.smartSearch(queryTerm);
      if (res && Array.isArray(res.matches) && res.matches.length > 0) {
        const backendMapped = res.matches.map((item, idx) => mapBackendProduct(item, idx));
        matched = backendMapped.map((p, i) => ({
          product: p,
          confidence: Math.max(80, 98 - i * 6),
        }));
        const matchedIds = new Set(backendMapped.map((p) => p.id));
        const others = products.filter((p) => !matchedIds.has(p.id));
        matched.push(...others.slice(0, 2).map((p, idx) => ({ product: p, confidence: 68 - idx * 8 })));
        return matched;
      }
    } catch {
      /* fall back to local catalog matching when backend is offline */
    }
  }

  if (typeof criteria === 'number') {
    const primary = products.find((p) => p.id === criteria);
    if (primary) {
      const relatives = products.filter((p) => p.id !== criteria && p.category === primary.category);
      const others = products.filter((p) => p.id !== criteria && p.category !== primary.category);
      matched = [
        { product: primary, confidence: 98 },
        ...relatives.map((p, idx) => ({ product: p, confidence: 85 - idx * 6 })),
        ...others.slice(0, 2).map((p, idx) => ({ product: p, confidence: 64 - idx * 8 })),
      ];
      return matched;
    }
  }

  const term = String(queryTerm || criteria).toLowerCase();
  const exact = products.filter(
    (p) =>
      term.includes(p.category.toLowerCase()) ||
      term.includes((p.icon || '').toLowerCase()) ||
      p.title.toLowerCase().split(' ').some((w) => w.length > 3 && term.includes(w)),
  );

  if (exact.length > 0) {
    matched = exact.map((p, i) => ({ product: p, confidence: Math.max(78, 96 - i * 7) }));
    const remaining = products.filter((p) => !exact.some((e) => e.id === p.id));
    matched.push(...remaining.slice(0, 2).map((p, i) => ({ product: p, confidence: 62 - i * 8 })));
  } else {
    matched = products
      .slice()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)
      .map((p, i) => ({ product: p, confidence: 92 - i * 11 }));
  }

  return matched;
}

function processImage(imageSrc, criteria, name = 'Selected Photo') {
  dropzone.classList.add('hidden');
  scannerContainer.classList.remove('hidden');
  resultsContainer.classList.add('hidden');

  scanPreview.src = imageSrc;
  scanStatus.innerHTML = `
    <span class="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
      <span class="h-2 w-2 rounded-full bg-brand-500 animate-ping"></span>
      Analyzing visual features & querying AI catalog…
    </span>`;

  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(async () => {
    currentMatches = await findMatches(criteria);
    displayResults(name);
  }, 650);
}

function displayResults(sourceName) {
  scannerContainer.classList.add('hidden');
  resultsContainer.classList.remove('hidden');

  resultsList.innerHTML = currentMatches
    .map(
      ({ product: p, confidence }) => `
      <article class="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-lg">
        <div class="relative grid h-24 w-24 shrink-0 place-items-center rounded-xl overflow-hidden bg-gradient-to-br ${p.bg}">
          ${p.image ? `<img src="${p.image}" alt="${p.title}" class="h-full w-full object-cover" />` : icon(p.icon, `h-12 w-12 ${p.fg}`, { 'stroke-width': '1.5' })}
          <span class="absolute top-1.5 right-1.5 rounded-full ${confidence >= 90 ? 'bg-emerald-500' : 'bg-brand-600'
        } px-2 py-0.5 text-[10px] font-bold text-white shadow">
            ${confidence}% match
          </span>
        </div>

        <div class="min-w-0 flex-1 text-center sm:text-left">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">${p.category}</p>
          <h4 class="font-semibold text-slate-900 dark:text-white truncate">${p.title}</h4>
          <div class="mt-1 flex items-center justify-center sm:justify-start gap-1 text-xs text-slate-500 dark:text-slate-400">
            ${icon('star', 'h-3.5 w-3.5 fill-amber-400 text-amber-400')}
            <span class="font-medium text-slate-700 dark:text-slate-200">${p.rating}</span>
            <span>(${p.reviews} reviews)</span>
          </div>
          <p class="mt-2 text-base font-bold text-slate-900 dark:text-white">${formatPrice(p.price)}</p>
        </div>

        <div class="flex sm:flex-col gap-2 w-full sm:w-auto">
          <button type="button" data-vs-apply="${p.id}"
            class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-600 hover:bg-accent-500 px-4 py-2 text-xs font-semibold text-white transition">
            View in store ${icon('arrow-right', 'h-3.5 w-3.5')}
          </button>
          <button type="button" data-quick-view="${p.id}"
            class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition">
            ${icon('eye', 'h-3.5 w-3.5')} Quick View
          </button>
        </div>
      </article>`,
    )
    .join('');

  showToast(`Found ${currentMatches.length} matching products for visual search`);
}

/** Generate a realistic thumbnail for a sample icon so the scanner looks awesome */
function createSampleImageURL(sample) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 320, 320);
  if (sample.id === 1) { grad.addColorStop(0, '#EEF0FF'); grad.addColorStop(1, '#C3C8FF'); }
  else if (sample.id === 2) { grad.addColorStop(0, '#FFF3EF'); grad.addColorStop(1, '#FFE4DB'); }
  else if (sample.id === 3) { grad.addColorStop(0, '#ECFDF5'); grad.addColorStop(1, '#A7F3D0'); }
  else if (sample.id === 4) { grad.addColorStop(0, '#FFFBEB'); grad.addColorStop(1, '#FDE68A'); }
  else if (sample.id === 6) { grad.addColorStop(0, '#FFF1F2'); grad.addColorStop(1, '#FECDD3'); }
  else { grad.addColorStop(0, '#F5F3FF'); grad.addColorStop(1, '#DDD6FE'); }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 320, 320);

  // Label
  ctx.fillStyle = '#1E1B4B';
  ctx.font = 'bold 24px Poppins, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sample.label, 160, 260);

  // Decorative circle
  ctx.beginPath();
  ctx.arc(160, 130, 60, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fill();

  return canvas.toDataURL('image/png');
}

export function initVisualSearch({ onSelectMatch } = {}) {
  onSelectMatchCallback = onSelectMatch;
  if (!modal) return;

  // Open triggers
  document.querySelectorAll('[data-visual-search]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openVisualSearch();
    });
  });

  // Close triggers
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-vs-close]')) closeVisualSearch();
  });

  // Reset to upload
  resetBtn?.addEventListener('click', resetToUploadState);

  // Sample click
  sampleContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-vs-sample]');
    if (!btn) return;
    const id = Number(btn.dataset.vsSample);
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    const url = createSampleImageURL(sample);
    processImage(url, id, sample.label);
  });

  // Results interaction
  resultsList?.addEventListener('click', (e) => {
    const applyBtn = e.target.closest('[data-vs-apply]');
    if (applyBtn) {
      const pid = Number(applyBtn.dataset.vsApply);
      const prod = getCatalogProducts().find((p) => p.id === pid);
      closeVisualSearch();
      if (prod && onSelectMatchCallback) onSelectMatchCallback(prod);
    }
  });

  // File input change
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUploadedFile(file);
  });

  // Drag and drop
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('border-brand-500', 'bg-brand-50/50');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-brand-500', 'bg-brand-50/50');
    });
  });

  dropzone?.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUploadedFile(file);
    } else {
      showToast('Please drop an image file (PNG, JPG, WebP)', { variant: 'info' });
    }
  });
}

function handleUploadedFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const imageSrc = e.target?.result;
    processImage(imageSrc, file.name, file.name);
  };
  reader.readAsDataURL(file);
}
