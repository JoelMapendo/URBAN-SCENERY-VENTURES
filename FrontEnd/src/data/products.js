import { productsApi } from '../services/api.js';

export const defaultProducts = [
  {
    id: 101,
    title: 'HP Apex Carbon Pro Studio 15 Laptop',
    category: 'Computers',
    shopId: 'apex-tech',
    shopName: 'Apex Quantum Tech Lab',
    price: 2499.0,
    oldPrice: 2899.0,
    rating: 4.9,
    reviews: 418,
    icon: 'laptop',
    badge: 'Featured Flagship',
    bg: 'from-slate-900 to-indigo-950',
    fg: 'text-indigo-400',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80',
    description:
      'Engineered for AI engineers and pro creators. 15.6" 3.2K 120Hz OLED, Intel Core Ultra 9 with dedicated neural NPU, 32GB LPDDR5X RAM, 1TB NVMe Gen4 SSD, and 19-hour battery.',
    features: ['15.6" 3.2K OLED 120Hz Display', 'Intel Core Ultra 9 with AI NPU', '32GB LPDDR5X / 1TB Gen4 SSD', 'Aerospace Carbon Fiber Unibody'],
  },
  {
    id: 102,
    title: 'Samsung Galaxy S24 Ultra 5G AI Phone',
    category: 'Phones & Tablets',
    shopId: 'apex-tech',
    shopName: 'Apex Quantum Tech Lab',
    price: 1299.0,
    oldPrice: 1419.0,
    rating: 4.9,
    reviews: 582,
    icon: 'smartphone',
    badge: 'Best Seller',
    bg: 'from-slate-100 to-slate-200',
    fg: 'text-slate-800',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=80',
    description:
      'Titanium frame flagship with 200MP Quad Telephoto AI camera system, Snapdragon 8 Gen 3 for Galaxy, built-in S-Pen, and live bidirectional translation.',
    features: ['200MP Pro AI Camera System', 'Snapdragon 8 Gen 3 Extreme', 'Integrated Precision S-Pen', 'Armor Titanium Chasis'],
  },
  {
    id: 103,
    title: 'Sony WH-1000XM5 Wireless ANC Headphones',
    category: 'Audio & Sound',
    shopId: 'urban-acoustics',
    shopName: 'Urban Scenery Acoustics',
    price: 399.0,
    oldPrice: 449.0,
    rating: 4.9,
    reviews: 640,
    icon: 'headphones',
    badge: 'Award Winner',
    bg: 'from-slate-900 to-slate-950',
    fg: 'text-brand-300',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    description:
      'Industry-leading active noise canceling powered by dual processors and 8 microphones. LDAC lossless audio, Speak-to-Chat, and 30-hour battery life.',
    features: ['Auto NC Optimizer Dual Processors', 'Integrated V1 & QN1 Audio Chips', 'Hi-Res Lossless Audio LDAC', '30-Hour Ultra Battery'],
  },
  {
    id: 104,
    title: 'Apple MacBook Pro 14 M3 Pro (Space Black)',
    category: 'Computers',
    shopId: 'apex-tech',
    shopName: 'Apex Quantum Tech Lab',
    price: 1999.0,
    oldPrice: 2199.0,
    rating: 5.0,
    reviews: 320,
    icon: 'laptop',
    badge: 'Pro Tier',
    bg: 'from-slate-950 to-neutral-900',
    fg: 'text-slate-200',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    description:
      '14.2-inch Liquid Retina XDR display with ProMotion 120Hz, Apple M3 Pro 12-core CPU / 18-core GPU, 18GB Unified Memory, and hardware-accelerated ray tracing.',
    features: ['Apple M3 Pro 12-Core Silicon', 'Liquid Retina XDR 1600 nits Peak', 'Hardware-Accelerated Ray Tracing', 'Thunderbolt 4 / HDMI / MagSafe 3'],
  },
  {
    id: 105,
    title: 'DJI Mini 4 Pro 4K HDR Camera Drone',
    category: 'Cameras & Drones',
    shopId: 'horizon-drones',
    shopName: 'Horizon Drones & Robotics',
    price: 759.0,
    oldPrice: 859.0,
    rating: 4.9,
    reviews: 214,
    icon: 'navigation',
    badge: 'Trending Drone',
    bg: 'from-cyan-950 to-slate-900',
    fg: 'text-cyan-400',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80',
    description:
      'Ultra-compact sub-249g folding drone with 4K/60fps HDR true vertical video, omnidirectional active obstacle sensing, 20km FHD video transmission, and 34-min flight.',
    features: ['Sub-249g Regulation-Free Fly', '4K/60fps HDR True Vertical Shooting', 'Omnidirectional Active Obstacle Sensing', '20km O4 FHD Video Transmission'],
  },
  {
    id: 106,
    title: 'Meta Quest 3 Mixed Reality VR Headset (512GB)',
    category: 'Gaming & VR',
    shopId: 'hyper-gaming',
    shopName: 'HyperGamer Dynamics',
    price: 649.0,
    oldPrice: 699.0,
    rating: 4.8,
    reviews: 410,
    icon: 'gamepad-2',
    badge: 'VR Innovation',
    bg: 'from-purple-950 to-slate-950',
    fg: 'text-purple-300',
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1000&q=80',
    description:
      'Transform your room with next-gen high-resolution color passthrough. 4K+ Infinite Display, Snapdragon XR2 Gen 2 graphics, and spatial 3D audio.',
    features: ['Full-Color High-Res Passthrough', '4K+ Infinite Display (2064x2208/eye)', 'Snapdragon XR2 Gen 2 Powerhouse', 'TruTouch Haptic Touch Controllers'],
  },
  {
    id: 107,
    title: 'Apple Watch Ultra 2 GPS + Cellular Titanium',
    category: 'Wearables',
    shopId: 'neural-wear',
    shopName: 'NeuralWear Biotech',
    price: 799.0,
    oldPrice: 849.0,
    rating: 4.9,
    reviews: 388,
    icon: 'watch',
    badge: 'Extreme Rugged',
    bg: 'from-amber-950 to-slate-900',
    fg: 'text-amber-400',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    description:
      '49mm aerospace-grade titanium case, 3000-nit Always-On display, S9 SiP with double tap gesture, depth gauge, and precision dual-frequency GPS.',
    features: ['49mm Titanium Case & Sapphire Crystal', '3000-nit Ultra-Bright Retina Display', 'Precision Dual-Frequency L1 & L5 GPS', 'Up to 72 Hours in Low Power Mode'],
  },
  {
    id: 108,
    title: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    category: 'Computer Accessories',
    shopId: 'hyper-gaming',
    shopName: 'HyperGamer Dynamics',
    price: 210.0,
    oldPrice: 245.0,
    rating: 4.9,
    reviews: 196,
    icon: 'keyboard',
    badge: 'Custom Mechanical',
    bg: 'from-slate-800 to-slate-950',
    fg: 'text-sky-300',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    description:
      'Full CNC machined 6063 aluminum body, double-gasket acoustic sound design, hot-swappable switches, QMK/VIA keymap programming, and Bluetooth 5.1.',
    features: ['CNC Machined 6063 Aluminum Chassis', 'Double-Gasket Acoustic Sound Dampening', 'Hot-Swappable Pre-Lubed Switches', 'Mac/Windows Compatible with VIA'],
  },
  {
    id: 109,
    title: 'Sony Alpha a7 IV Full-Frame Mirrorless Cinema Camera',
    category: 'Cameras & Drones',
    shopId: 'vision-optics',
    shopName: 'Visionary Cinema Tech',
    price: 2498.0,
    oldPrice: 2699.0,
    rating: 5.0,
    reviews: 175,
    icon: 'camera',
    badge: 'Pro Cinema',
    bg: 'from-neutral-900 to-slate-950',
    fg: 'text-emerald-300',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    description:
      '33MP back-illuminated Exmor R CMOS sensor, BIONZ XR processing engine, 4K 60p 10-bit 4:2:2 movie recording, S-Cinetone color profile, and 5-axis IBIS.',
    features: ['33MP Full-Frame Exmor R CMOS', '4K 60p 10-bit 4:2:2 S-Cinetone', '759-Point Fast Hybrid Phase AF', '5-Axis In-Body Optical Image Stabilization'],
  },
  {
    id: 110,
    title: 'EcoFlow DELTA 2 Max 2400W Portable Power Station',
    category: 'Power & Charging',
    shopId: 'voltcore-energy',
    shopName: 'VoltCore Energy Tech',
    price: 1899.0,
    oldPrice: 2099.0,
    rating: 4.9,
    reviews: 142,
    icon: 'battery-charging',
    badge: 'Solar Ready',
    bg: 'from-amber-900 to-slate-950',
    fg: 'text-amber-300',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80',
    description:
      '2048Wh expandable LiFePO4 battery with 3000+ cycles to 80%. Powers 99% of heavy electronics with 2400W AC output (3400W X-Boost) and dual 1000W solar input.',
    features: ['2048Wh Expandable LiFePO4 Battery', '2400W AC Output (3400W X-Boost)', '0-80% Ultra-Fast AC Charge in 43 Mins', 'Dual 1000W Max Solar Input Hub'],
  },
  {
    id: 111,
    title: 'Anker 737 GaNPrime 140W Smart Power Bank (24K)',
    category: 'Power & Charging',
    shopId: 'voltcore-energy',
    shopName: 'VoltCore Energy Tech',
    price: 149.0,
    oldPrice: 179.0,
    rating: 4.8,
    reviews: 512,
    icon: 'zap',
    badge: '140W Fast Charge',
    bg: 'from-slate-800 to-zinc-900',
    fg: 'text-cyan-300',
    image: 'https://images.unsplash.com/photo-1609592424364-c78d53b27670?auto=format&fit=crop&w=1000&q=80',
    description:
      'Equipped with Power Delivery 3.1 and bi-directional technology to fast-charge laptops at 140W. Smart digital display shows real-time wattage and battery health.',
    features: ['Ultra-Powerful 140W Two-Way Charging', 'Smart Interactive Digital Display', '24,000mAh Laptop-Grade Capacity', 'GaNPrime ActiveShield 2.0 Protection'],
  },
  {
    id: 112,
    title: 'ASUS ROG Ally X 1TB Gaming Handheld Console',
    category: 'Gaming & VR',
    shopId: 'hyper-gaming',
    shopName: 'HyperGamer Dynamics',
    price: 799.0,
    oldPrice: 849.0,
    rating: 4.9,
    reviews: 280,
    icon: 'gamepad-2',
    badge: '120Hz Handheld',
    bg: 'from-violet-950 to-slate-950',
    fg: 'text-violet-300',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80',
    description:
      'AMD Ryzen Z1 Extreme processor with RDNA 3 graphics, 24GB LPDDR5X RAM, massive 1TB PCIe 4.0 SSD, 80Wh battery, and 7-inch 120Hz FreeSync Premium display.',
    features: ['AMD Ryzen Z1 Extreme (8C/16T)', '24GB 7500MHz Dual-Channel RAM', '7" 120Hz FHD FreeSync Premium Screen', 'Double 80Wh Battery Longevity'],
  },
  {
    id: 113,
    title: 'Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)',
    category: 'Computer Accessories',
    shopId: 'apex-tech',
    shopName: 'Apex Quantum Tech Lab',
    price: 579.0,
    oldPrice: 659.0,
    rating: 4.8,
    reviews: 310,
    icon: 'monitor',
    badge: 'IPS Black Tech',
    bg: 'from-slate-900 to-indigo-950',
    fg: 'text-indigo-300',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
    description:
      'Groundbreaking IPS Black technology with 2000:1 contrast ratio, 98% DCI-P3 color gamut, 4K resolution, RJ45 Ethernet, and 90W USB-C single cable power.',
    features: ['IPS Black 2000:1 Contrast Ratio', '98% DCI-P3 & VESA DisplayHDR 400', '90W USB-C Single-Cable Hub + RJ45', 'Built-in KVM & Picture-by-Picture'],
  },
  {
    id: 114,
    title: 'Philips Hue Matter Smart Home Hub & Gradient Kit',
    category: 'Smart Home & IoT',
    shopId: 'omni-iot',
    shopName: 'OmniHome IoT Automation',
    price: 249.0,
    oldPrice: 289.0,
    rating: 4.8,
    reviews: 265,
    icon: 'home',
    badge: 'Matter Ecosystem',
    bg: 'from-sky-950 to-indigo-950',
    fg: 'text-sky-300',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80',
    description:
      'Matter-certified smart home bridge controller with gradient RGB ambience strip. Syncs seamlessly with TVs, music, gaming, Apple Home, Google Home, and Alexa.',
    features: ['Native Matter & Thread Support', 'Real-time Music & Screen Syncing', '16 Million Vivid RGB Color Gradients', 'Zero-Latency Local Mesh Automation'],
  },
];

const PRODUCTS_STORAGE_KEY = 'lumen:catalog_products_v3';
const PRODUCT_UI_META_KEY = 'lumen:product_ui_meta_v3';

let liveCatalogCache = null;

export function loadProductUiMetaMap() {
  try {
    const raw = localStorage.getItem(PRODUCT_UI_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProductUiMeta(productId, meta) {
  try {
    const map = loadProductUiMetaMap();
    map[String(productId)] = { ...(map[String(productId)] || {}), ...meta };
    localStorage.setItem(PRODUCT_UI_META_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Infers rich presentation attributes exclusively for Electronics products.
 */
export function inferProductPresentation(name = '', description = '') {
  const text = `${name} ${description}`.toLowerCase();

  if (/(drone|dji|flight|aerial|uav|quadcopter)/.test(text)) {
    return {
      category: 'Cameras & Drones',
      icon: 'navigation',
      shopId: 'horizon-drones',
      shopName: 'Horizon Drones & Robotics',
      bg: 'from-cyan-900 to-slate-950',
      fg: 'text-cyan-400',
      fallbackImage: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(macbook|laptop|thinkpad|dell|notebook|intel|ryzen|core ultra|desktop|pc|cpu)/.test(text)) {
    return {
      category: 'Computers',
      icon: 'laptop',
      shopId: 'apex-tech',
      shopName: 'Apex Quantum Tech Lab',
      bg: 'from-slate-900 to-indigo-950',
      fg: 'text-indigo-400',
      fallbackImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(headphone|wh-1000|earbud|earphone|speaker|audio|acoustic|sound|anc|microphone|studio)/.test(text)) {
    return {
      category: 'Audio & Sound',
      icon: 'headphones',
      shopId: 'urban-acoustics',
      shopName: 'Urban Scenery Acoustics',
      bg: 'from-brand-900 to-slate-950',
      fg: 'text-brand-400',
      fallbackImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(galaxy|iphone|smartphone|phone|mobile|tablet|ipad|android|s24)/.test(text)) {
    return {
      category: 'Phones & Tablets',
      icon: 'smartphone',
      shopId: 'apex-tech',
      shopName: 'Apex Quantum Tech Lab',
      bg: 'from-slate-900 to-slate-950',
      fg: 'text-slate-200',
      fallbackImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(watch|smartwatch|wearable|tracker|ring|biometric|sensor)/.test(text)) {
    return {
      category: 'Wearables',
      icon: 'watch',
      shopId: 'neural-wear',
      shopName: 'NeuralWear Biotech',
      bg: 'from-accent-950 to-slate-900',
      fg: 'text-accent-400',
      fallbackImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(vr|quest|headset|ps5|playstation|xbox|gaming|console|ally|rog|handheld|gamepad)/.test(text)) {
    return {
      category: 'Gaming & VR',
      icon: 'gamepad-2',
      shopId: 'hyper-gaming',
      shopName: 'HyperGamer Dynamics',
      bg: 'from-purple-950 to-slate-950',
      fg: 'text-purple-300',
      fallbackImage: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(power|ecoflow|battery|generator|anker|gan|charger|solar|power bank|watt)/.test(text)) {
    return {
      category: 'Power & Charging',
      icon: 'battery-charging',
      shopId: 'voltcore-energy',
      shopName: 'VoltCore Energy Tech',
      bg: 'from-amber-950 to-slate-900',
      fg: 'text-amber-400',
      fallbackImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(camera|alpha|sony a7|lens|gimbal|cinema|4k 60p|optics|video)/.test(text)) {
    return {
      category: 'Cameras & Drones',
      icon: 'camera',
      shopId: 'vision-optics',
      shopName: 'Visionary Cinema Tech',
      bg: 'from-emerald-950 to-slate-900',
      fg: 'text-emerald-400',
      fallbackImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(hue|matter|smart home|iot|automation|lightstrip|bridge|homekit)/.test(text)) {
    return {
      category: 'Smart Home & IoT',
      icon: 'home',
      shopId: 'omni-iot',
      shopName: 'OmniHome IoT Automation',
      bg: 'from-sky-950 to-slate-900',
      fg: 'text-sky-300',
      fallbackImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80',
    };
  }
  if (/(keyboard|monitor|mouse|display|usb-c|hub|cable|mechanical|keychron|ultrasharp)/.test(text)) {
    return {
      category: 'Computer Accessories',
      icon: 'keyboard',
      shopId: 'hyper-gaming',
      shopName: 'Apex Quantum Tech Lab',
      bg: 'from-slate-900 to-indigo-950',
      fg: 'text-indigo-300',
      fallbackImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    };
  }

  return {
    category: 'Consumer Electronics',
    icon: 'cpu',
    shopId: 'apex-tech',
    shopName: 'Urban Scenery Electronics Flagship',
    bg: 'from-slate-900 to-violet-950',
    fg: 'text-violet-400',
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
  return ['Verified Genuine Electronics', 'Express Dispatch & Pickup', '1-Year Full Warranty', 'Tested Benchmark Ready'];
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
    ? 'Featured Flagship'
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
    description: apiProd.description || 'Verified electronics gadget available on Urban Scenery Ventures.',
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
  try {
    const apiProducts = await productsApi.list(filters);
    if (Array.isArray(apiProducts) && apiProducts.length > 0) {
      const mapped = apiProducts.map((item, idx) => mapBackendProduct(item, idx));
      liveCatalogCache = mapped;
      saveCatalogProducts(mapped);
      return mapped;
    }
  } catch {
    // fallback to cache or defaultProducts
  }
  return getCatalogProducts();
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
