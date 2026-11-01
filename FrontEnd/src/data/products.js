import { productsApi } from '../services/api.js';

export const defaultProducts = [
  {
    id: 101,
    title: 'Hp Laptop 15" · Apex Carbon Pro Studio 15',
    category: 'Computers',
    shopId: 'apex-tech',
    shopName: 'Apex Tech Lab',
    price: 2000000.0,
    oldPrice: 6000000.0,
    rating: 4.9,
    reviews: 418,
    icon: 'laptop',
    badge: 'Featured',
    bg: 'from-slate-900 to-indigo-950',
    fg: 'text-indigo-400',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80',
    description:
      'Engineered for creators and power users. Featuring a 15.6" 3K OLED anti-glare display, aerospace-grade carbon fiber chassis, 32GB LPDDR5X RAM, and 18-hour battery longevity.',
    features: ['15.6" 3K OLED 120Hz Display', 'Intel Core Ultra 9 / 32GB RAM', 'Full-Day 18h Battery Life', 'Aerospace Carbon Fiber Body'],
  },
  {
    id: 102,
    title: 'Artistic Paintings · Metropolitan Canvas Art',
    category: 'Home & Living',
    shopId: 'atelier-terra',
    shopName: 'Atelier Terra Gallery',
    price: 100000.0,
    oldPrice: 150000.0,
    rating: 4.9,
    reviews: 94,
    icon: 'image',
    badge: 'Trending',
    bg: 'from-amber-50 to-amber-100',
    fg: 'text-amber-700',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
    description:
      'Original hand-embellished gallery canvas painting depicting urban morning light. Framed in sustainably sourced natural Scandinavian oak.',
    features: ['Hand-stretched linen canvas', 'Archival UV-resistant pigment', 'Solid oak floating frame included'],
  },
  {
    id: 103,
    title: 'Itel Mobile Phone & Long Battery Companion',
    category: 'Phones & Tablets',
    shopId: 'apex-tech',
    shopName: 'Apex Electronics',
    price: 35000.0,
    oldPrice: 50000.0,
    rating: 4.6,
    reviews: 284,
    icon: 'smartphone',
    badge: 'Best Value',
    bg: 'from-slate-100 to-slate-200',
    fg: 'text-slate-800',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
    description:
      'Ultra-reliable rugged mobile device with dual-SIM standby, crystal-clear FM wireless radio, powerful 30-day standby battery, and built-in LED torch.',
    features: ['30-day extended standby battery', 'Dual SIM 4G connectivity', 'Shatter-resistant polycarbonate chassis'],
  },
  {
    id: 104,
    title: 'Necklace · Titanium Bar Geometric Pendant',
    category: 'Jewelry',
    shopId: 'solaris-optics',
    shopName: 'Solaris Studio',
    price: 60000.0,
    oldPrice: 85000.0,
    rating: 4.8,
    reviews: 138,
    icon: 'sparkles',
    badge: 'Trending',
    bg: 'from-slate-200 to-slate-300',
    fg: 'text-slate-800',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
    description:
      'Precision machined from hypoallergenic grade-5 titanium with a subtle brushed satin finish. Suspended on a 22-inch adjustable box chain.',
    features: ['Grade-5 pure titanium', 'Tarnish & waterproof', 'Adjustable 22" box chain'],
  },
  {
    id: 105,
    title: 'Wall Painting · Vibrant Sunrise Acrylic on Canvas',
    category: 'Home & Living',
    shopId: 'atelier-terra',
    shopName: 'Atelier Terra Gallery',
    price: 80000.0,
    oldPrice: 120000.0,
    rating: 4.8,
    reviews: 73,
    icon: 'image',
    badge: 'Popular',
    bg: 'from-amber-100 to-amber-200',
    fg: 'text-amber-800',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
    description: 'Textured contemporary wall painting featuring sunrise hues over cityscape architecture.',
    features: ['High-texture acrylic', 'Gallery wrapped', 'Hardware mounted'],
  },
  {
    id: 106,
    title: 'Ice Watch Patekphilippe Luxury Diamond Edition',
    category: 'Jewelry',
    shopId: 'solaris-optics',
    shopName: 'Solaris Studio',
    price: 80000.0,
    oldPrice: 130000.0,
    rating: 4.9,
    reviews: 112,
    icon: 'watch',
    badge: 'Hot Deal',
    bg: 'from-slate-800 to-slate-900',
    fg: 'text-slate-200',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
    description: 'Precision luxury iced timepiece with baguette crystal bezel, automatic movement, and stainless bracelet.',
    features: ['Iced crystal bezel', 'Automatic mechanical movement', 'Stainless steel folding clasp'],
  },
  {
    id: 1,
    title: 'Aurora Spatial Wireless Studio Headphones',
    category: 'Audio & Sound',
    shopId: 'urban-acoustics',
    shopName: 'Urban Scenery Acoustics',
    price: 490000.0,
    oldPrice: 680000.0,
    rating: 4.8,
    reviews: 324,
    icon: 'headphones',
    badge: 'Sale',
    bg: 'from-brand-100 to-brand-200',
    fg: 'text-brand-600',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    description:
      'Immersive over-ear headphones with adaptive noise cancellation, plush memory-foam cushions and a 40-hour battery that keeps up with your longest days.',
    features: ['Adaptive noise cancellation', '40-hour battery life', 'Multipoint Bluetooth 5.4'],
  },
  {
    id: 2,
    title: 'Nimbus Titan Smart Watch',
    category: 'Wearables',
    shopId: 'apex-tech',
    shopName: 'Apex Wearables',
    price: 750000.0,
    oldPrice: 950000.0,
    rating: 4.7,
    reviews: 211,
    icon: 'watch',
    badge: 'New',
    bg: 'from-accent-50 to-accent-100',
    fg: 'text-accent-500',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    description:
      'A featherlight smartwatch with an always-on AMOLED display, clinical-grade ECG & SpO2 biometric sensors, and up to 14 days of battery reserve.',
    features: ['Always-on Sapphire AMOLED', 'Heart-rate & SpO2 Tracking', 'Water resistant to 50m / 5 ATM'],
  },
  {
    id: 3,
    title: 'Drift Carbon Running Sneakers',
    category: 'Footwear',
    shopId: 'acro-kinetic',
    shopName: 'Acro Kinetic Lab',
    price: 340000.0,
    oldPrice: 420000.0,
    rating: 4.6,
    reviews: 158,
    icon: 'footprints',
    badge: 'Sale',
    bg: 'from-emerald-50 to-emerald-100',
    fg: 'text-emerald-600',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
    description:
      'Responsive nitrogen-infused supercritical foam midsole paired with a carbon propulsion plate. Built for marathon training, city miles and all-day speed.',
    features: ['Supercritical foam midsole', 'Full-length 3D carbon plate', 'Breathable monomesh upper'],
  },
  {
    id: 4,
    title: 'Haven Weatherproof Canvas Backpack',
    category: 'Computer Accessories',
    shopId: 'urban-carry',
    shopName: 'Urban Carry Co.',
    price: 245000.0,
    oldPrice: 360000.0,
    rating: 4.9,
    reviews: 402,
    icon: 'backpack',
    badge: 'Popular',
    bg: 'from-amber-50 to-amber-100',
    fg: 'text-amber-600',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
    description:
      'Crafted from weatherproof waxed canvas with Aquaguard zippers, a suspended 16" laptop sleeve, and magnetic quick-release Fidlock hardware.',
    features: ['Padded 16" laptop suspension', 'Waterproof waxed duck canvas', 'Magnetic Fidlock buckles'],
  },
  {
    id: 5,
    title: 'Lumi Minimalist Arc Touch Desk Lamp',
    category: 'Office Supplies',
    shopId: 'nordic-studio',
    shopName: 'Nordic Light Studio',
    price: 185000.0,
    oldPrice: 299000.0,
    rating: 4.5,
    reviews: 97,
    icon: 'lamp-desk',
    badge: null,
    bg: 'from-sky-50 to-sky-100',
    fg: 'text-sky-600',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    description:
      'Flicker-free 98+ CRI LED illumination with 5 color temperatures, smooth stepless touch dimmer, and integrated 15W Qi2 wireless phone charging base.',
    features: ['98+ CRI eye-care illumination', 'Stepless touch dimmer', 'Integrated 15W wireless charger'],
  },
  {
    id: 6,
    title: 'Terra Ceramic Mug & Pour-Over Set',
    category: 'Beauty & Personal Care',
    shopId: 'atelier-terra',
    shopName: 'Atelier Terra',
    price: 130000.0,
    oldPrice: 160000.0,
    rating: 4.8,
    reviews: 186,
    icon: 'coffee',
    badge: 'Sale',
    bg: 'from-rose-50 to-rose-100',
    fg: 'text-rose-500',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    description:
      'Hand-thrown artisanal stoneware mugs and dripper finished with natural wood-ash glazes. Keeps beverages hot and feels tactile in your hands.',
    features: ['Set of 2 + dripper', 'Hand-thrown natural stoneware', 'Dishwasher & microwave safe'],
  },
  {
    id: 7,
    title: 'Pulse 360° Waterproof Studio Speaker',
    category: 'Audio & Sound',
    shopId: 'urban-acoustics',
    shopName: 'Urban Scenery Acoustics',
    price: 300000.0,
    oldPrice: 415000.0,
    rating: 4.7,
    reviews: 263,
    icon: 'speaker',
    badge: 'New',
    bg: 'from-violet-50 to-violet-100',
    fg: 'text-violet-600',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
    description:
      'Room-filling 360° cylindrical audio in an IP67 waterproof machined aluminum shell. True stereo wireless linking with 20-hour battery life.',
    features: ['360° acoustic spatial dispersion', 'IP67 submersible waterproof', '20-hour playtime'],
  },
  {
    id: 8,
    title: 'Vista Japanese Polarized Sunglasses',
    category: 'Consumer Electronics',
    shopId: 'solaris-optics',
    shopName: 'Solaris Optics',
    price: 225000.0,
    oldPrice: 340000.0,
    rating: 4.6,
    reviews: 139,
    icon: 'glasses',
    badge: null,
    bg: 'from-slate-100 to-slate-200',
    fg: 'text-slate-600',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
    description:
      'Handcrafted Italian bio-acetate frames fitted with Japanese polarized UV400 lenses that eliminate glare while preserving true color fidelity.',
    features: ['Japanese polarized UV400 lenses', 'Hand-polished bio-acetate', 'Includes leather carry case'],
  },
];

export const PRODUCTS_STORAGE_KEY = 'lumen:catalog_products_v2';
export const PRODUCT_META_STORAGE_KEY = 'lumen:product_ui_meta_v1';

let liveCatalogCache = null;

function loadProductUiMetaMap() {
  try {
    const raw = localStorage.getItem(PRODUCT_META_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProductUiMeta(productId, meta) {
  try {
    const map = loadProductUiMetaMap();
    map[String(productId)] = { ...(map[String(productId)] || {}), ...meta };
    localStorage.setItem(PRODUCT_META_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function inferProductPresentation(name = '', description = '') {
  const text = `${name} ${description}`.toLowerCase();

  if (/(macbook|laptop|notebook|thinkpad|ultrabook|pc|workstation|monitor|ultrasharp|display)/.test(text)) {
    return {
      category: 'Computers',
      icon: 'laptop',
      shopId: 'nordic-studio',
      shopName: 'Nordic Light Studio',
      bg: 'from-slate-900 to-indigo-950',
      fg: 'text-indigo-400',
      fallbackImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(headphone|wh-1000|earbud|earphone|speaker|audio|acoustic|sound|anc)/.test(text)) {
    return {
      category: 'Audio & Sound',
      icon: 'headphones',
      shopId: 'urban-acoustics',
      shopName: 'Urban Scenery Acoustics',
      bg: 'from-brand-100 to-brand-200',
      fg: 'text-brand-600',
      fallbackImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(galaxy|iphone|smartphone|phone|mobile|tablet|ipad|android|s24)/.test(text)) {
    return {
      category: 'Phones & Tablets',
      icon: 'smartphone',
      shopId: 'apex-tech',
      shopName: 'Apex Electronics',
      bg: 'from-slate-100 to-slate-200',
      fg: 'text-slate-800',
      fallbackImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(watch|smartwatch|wearable|tracker|ring|biometric)/.test(text)) {
    return {
      category: 'Wearables',
      icon: 'watch',
      shopId: 'apex-tech',
      shopName: 'Apex Wearables',
      bg: 'from-accent-50 to-accent-100',
      fg: 'text-accent-500',
      fallbackImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(power bank|powercore|anker|charger|cable|adapter|hub|usb-c|backpack|bag|sleeve|accessory)/.test(text)) {
    return {
      category: 'Computer Accessories',
      icon: 'zap',
      shopId: 'urban-carry',
      shopName: 'Urban Carry Co.',
      bg: 'from-amber-50 to-amber-100',
      fg: 'text-amber-600',
      fallbackImage: 'https://images.unsplash.com/photo-1609592424364-c78d53b27670?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(shoe|sneaker|runner|footwear|trainer)/.test(text)) {
    return {
      category: 'Footwear',
      icon: 'footprints',
      shopId: 'acro-kinetic',
      shopName: 'Acro Kinetic Lab',
      bg: 'from-emerald-50 to-emerald-100',
      fg: 'text-emerald-600',
      fallbackImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(lamp|desk|office)/.test(text)) {
    return {
      category: 'Office Supplies',
      icon: 'lamp-desk',
      shopId: 'nordic-studio',
      shopName: 'Nordic Light Studio',
      bg: 'from-sky-50 to-sky-100',
      fg: 'text-sky-600',
      fallbackImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    };
  }

  return {
    category: 'Consumer Electronics',
    icon: 'cpu',
    shopId: 'solaris-optics',
    shopName: 'Urban Scenery Flagship',
    bg: 'from-violet-50 to-violet-100',
    fg: 'text-violet-600',
    fallbackImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80',
  };
}

function extractFeatures(description = '', fallbackFeatures) {
  if (Array.isArray(fallbackFeatures) && fallbackFeatures.length > 0) {
    return fallbackFeatures;
  }
  const parts = String(description || '')
    .split(/[,.·;]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6 && s.length <= 65);
  if (parts.length >= 2) {
    return parts.slice(0, 4);
  }
  return ['Verified Authentic Hardware', 'Express Dispatch & Pickup', '1-Year Full Warranty'];
}

/**
 * Maps a FastAPI `ProductOut` record into the rich frontend product format.
 */
export function mapBackendProduct(apiProd, index = 0) {
  const metaMap = loadProductUiMetaMap();
  const meta = metaMap[String(apiProd.id)] || {};
  const inferred = inferProductPresentation(apiProd.name, apiProd.description);
  const price = Number(apiProd.price);
  const quantity = Number(apiProd.quantity ?? 0);
  const isOut = quantity <= 0 || apiProd.status === 'EMPTY';

  let image = apiProd.banner_image || meta.image || inferred.fallbackImage;
  if (image && image.includes('images.unsplash.com/') && !image.includes('?')) {
    image = `${image}?auto=format&fit=crop&w=1000&q=80`;
  }

  const defaultBadge = isOut
    ? 'Out of Stock'
    : index === 0
    ? 'Featured'
    : quantity <= 10
    ? 'Limited Stock'
    : null;

  return {
    id: Number(apiProd.id),
    title: apiProd.name,
    name: apiProd.name,
    category: meta.category || inferred.category,
    shopId: meta.shopId || inferred.shopId,
    shopName: meta.shopName || inferred.shopName,
    price,
    oldPrice: meta.oldPrice && Number(meta.oldPrice) > price ? Number(meta.oldPrice) : null,
    stock: quantity,
    quantity,
    status: apiProd.status || (quantity > 0 ? 'AVAILABLE' : 'EMPTY'),
    rating: meta.rating || Number((4.7 + ((Number(apiProd.id) * 3) % 3) * 0.1).toFixed(1)),
    reviews: meta.reviews || 48 + ((Number(apiProd.id) * 37) % 240),
    icon: meta.icon || inferred.icon,
    badge: isOut ? 'Out of Stock' : meta.badge ?? defaultBadge,
    bg: meta.bg || inferred.bg,
    fg: meta.fg || inferred.fg,
    image,
    description: apiProd.description || 'Verified electronics product available on Urban Scenery Ventures.',
    features: extractFeatures(apiProd.description, meta.features),
    fromBackend: true,
    created_at: apiProd.created_at,
    updated_at: apiProd.updated_at,
  };
}

/**
 * Fetches the authoritative product catalog from the FastAPI backend (`GET /api/v1/products`),
 * updates local cache, and notifies all active UI components.
 */
export async function syncCatalogFromBackend(filters = {}) {
  const apiProducts = await productsApi.list(filters);
  const mapped = (apiProducts || []).map((item, idx) => mapBackendProduct(item, idx));
  liveCatalogCache = mapped;
  saveCatalogProducts(mapped);
  return mapped;
}

/**
 * Loads catalog products synchronously (returns latest backend-synced cache, or default fallback prior to first sync).
 */
export function getCatalogProducts() {
  if (Array.isArray(liveCatalogCache) && liveCatalogCache.length > 0) {
    return liveCatalogCache;
  }
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        liveCatalogCache = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [...defaultProducts];
}

export function saveCatalogProducts(prods) {
  liveCatalogCache = prods;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(prods));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('lumen:products_updated', { detail: prods }));
}

export const products = getCatalogProducts();

export const getProduct = (id) => {
  const current = getCatalogProducts();
  return current.find((p) => p.id === Number(id));
};
