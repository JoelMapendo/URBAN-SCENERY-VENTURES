import React, { useState } from 'react';
import {
  X,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  Maximize2,
  CheckCircle2,
  Code2,
  Globe,
  Sliders,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

export interface UiInterfaceItem {
  id: string;
  number: string;
  name: string;
  category: 'Storefront' | 'Funnel' | 'AI' | 'Admin';
  image: string;
  component: string;
  endpoints: string[];
  description: string;
  actionType:
    | 'theme_dark'
    | 'theme_light'
    | 'scroll_catalog'
    | 'open_ai_recommend'
    | 'open_cart'
    | 'open_checkout'
    | 'open_auth'
    | 'open_ai_assistant'
    | 'admin_gate'
    | 'admin_overview'
    | 'admin_products'
    | 'admin_customers'
    | 'admin_orders'
    | 'admin_payments'
    | 'admin_ai_studio'
    | 'admin_platforms';
}

export const UI_INTERFACES: UiInterfaceItem[] = [
  {
    id: '01',
    number: '01',
    name: 'Storefront Home (Light Mode)',
    category: 'Storefront',
    image: '/screenshots/01_storefront_home_light.png',
    component: 'src/components/storefront/HeroBanner.tsx',
    endpoints: ['GET /api/v1/products'],
    description: 'Hero split banner, brand header, gadget mosaic, 5 quick-jump category cards, 4 trust guarantee pillars.',
    actionType: 'theme_light',
  },
  {
    id: '02',
    number: '02',
    name: 'Storefront Home (Dark Mode)',
    category: 'Storefront',
    image: '/screenshots/02_storefront_home_dark.png',
    component: 'src/store/useThemeStore.ts',
    endpoints: ['Client theme state (localStorage)'],
    description: 'High-contrast dark mode variant styled with brand Magenta (#E6007E) and Gold (#FFB800) accents.',
    actionType: 'theme_dark',
  },
  {
    id: '03',
    number: '03',
    name: 'Product Catalog Grid & Filters',
    category: 'Storefront',
    image: '/screenshots/03_product_catalog.png',
    component: 'src/components/storefront/ProductGrid.tsx',
    endpoints: ['GET /api/v1/products?search=...'],
    description: 'Live keyword search, category filter pills, price range sliders, stock badges, and QuickView modals.',
    actionType: 'scroll_catalog',
  },
  {
    id: '04',
    number: '04',
    name: 'AI Hardware Recommendation Modal',
    category: 'AI',
    image: '/screenshots/04_ai_recommendation_modal.png',
    component: 'src/components/storefront/AiRecommendationModal.tsx',
    endpoints: ['POST /api/v1/ai/recommend'],
    description: 'Natural language advisor form querying live inventory with max budget and category constraints.',
    actionType: 'open_ai_recommend',
  },
  {
    id: '05',
    number: '05',
    name: 'Slide-Over Cart Drawer',
    category: 'Funnel',
    image: '/screenshots/05_cart_drawer.png',
    component: 'src/components/storefront/CartDrawer.tsx',
    endpoints: ['GET /api/v1/products (cross-sells)'],
    description: 'Slide-over drawer with item increment/decrement, live stock verification, and dynamic cross-sell suggestions.',
    actionType: 'open_cart',
  },
  {
    id: '06',
    number: '06',
    name: 'Multi-Rail Checkout & Payment Modal',
    category: 'Funnel',
    image: '/screenshots/06_checkout_modal.png',
    component: 'src/components/storefront/CheckoutModal.tsx',
    endpoints: ['POST /api/v1/orders', 'POST /api/v1/payments/pay'],
    description: '2-step checkout wizard collecting delivery details and supporting Mobile Money, Bank Transfer, and Crypto rails.',
    actionType: 'open_checkout',
  },
  {
    id: '07',
    number: '07',
    name: 'Customer & Admin Authentication Modal',
    category: 'Funnel',
    image: '/screenshots/07_auth_modal.png',
    component: 'src/components/auth/AuthModal.tsx',
    endpoints: ['POST /api/v1/auth/login', 'POST /api/v1/auth/register'],
    description: 'Dual-tab login and registration dialog with role-based JWT token persistence.',
    actionType: 'open_auth',
  },
  {
    id: '08',
    number: '08',
    name: 'Floating AI Shopping Assistant',
    category: 'AI',
    image: '/screenshots/08_ai_shopping_assistant.png',
    component: 'src/components/storefront/AiShoppingAssistant.tsx',
    endpoints: ['POST /api/v1/ai/agents/customer-shopping-assistant'],
    description: 'Autonomous hardware consultation chat drawer with quick prompts and inline add-to-cart cards.',
    actionType: 'open_ai_assistant',
  },
  {
    id: '09',
    number: '09',
    name: 'Admin Authentication Security Gate',
    category: 'Admin',
    image: '/screenshots/09_admin_auth_gate.png',
    component: 'src/components/admin/AdminDashboard.tsx',
    endpoints: ['Client auth guard & role verification'],
    description: 'Security gate preventing unauthorized access to executive operations and analytics.',
    actionType: 'admin_gate',
  },
  {
    id: '10',
    number: '10',
    name: 'Admin Dashboard: Overview',
    category: 'Admin',
    image: '/screenshots/10_admin_overview.png',
    component: 'src/components/admin/AdminDashboard.tsx (OVERVIEW)',
    endpoints: ['GET /api/v1/orders', 'GET /api/v1/products', 'GET /api/v1/payments'],
    description: 'Executive KPIs, dual-curve SVG sales chart (Revenue vs Orders), top product leaderboard, CSV export.',
    actionType: 'admin_overview',
  },
  {
    id: '11',
    number: '11',
    name: 'Admin Dashboard: Products Inventory',
    category: 'Admin',
    image: '/screenshots/11_admin_products.png',
    component: 'src/components/admin/AdminDashboard.tsx (PRODUCTS)',
    endpoints: ['GET/POST/PUT/DELETE /api/v1/products'],
    description: 'Full CRUD inventory console with Add/Edit modal, stock status toggles, and live price adjustments.',
    actionType: 'admin_products',
  },
  {
    id: '12',
    number: '12',
    name: 'Admin Dashboard: Customers Management',
    category: 'Admin',
    image: '/screenshots/12_admin_customers.png',
    component: 'src/components/admin/AdminDashboard.tsx (CUSTOMERS)',
    endpoints: ['GET/PUT/DELETE /api/v1/users'],
    description: 'User roster, public IDs, assigned roles (admin/customer), account status toggles, deletion.',
    actionType: 'admin_customers',
  },
  {
    id: '13',
    number: '13',
    name: 'Admin Dashboard: Orders Fulfillment',
    category: 'Admin',
    image: '/screenshots/13_admin_orders.png',
    component: 'src/components/admin/AdminDashboard.tsx (ORDERS)',
    endpoints: ['GET /api/v1/orders', 'PATCH /api/v1/orders/{id}/status'],
    description: 'Order pipeline with customer delivery address, contact normalization, and 1-click status progression.',
    actionType: 'admin_orders',
  },
  {
    id: '14',
    number: '14',
    name: 'Admin Dashboard: Multi-Rail Payments',
    category: 'Admin',
    image: '/screenshots/14_admin_payments.png',
    component: 'src/components/admin/AdminDashboard.tsx (PAYMENTS)',
    endpoints: ['GET /api/v1/payments'],
    description: 'Financial ledger displaying settled transactions, amounts, rails (Mobile Money, Bank, Crypto), timestamps.',
    actionType: 'admin_payments',
  },
  {
    id: '15',
    number: '15',
    name: 'Admin Dashboard: AI Enterprise Studio',
    category: 'Admin',
    image: '/screenshots/15_admin_ai_studio.png',
    component: 'src/components/admin/AdminDashboard.tsx (AI_STUDIO)',
    endpoints: ['POST /api/v1/ai/agents/*'],
    description: 'Autonomous business agents: BI, Growth Optimization, Marketing Copywriter, and Image Studio/Renderer.',
    actionType: 'admin_ai_studio',
  },
  {
    id: '16',
    number: '16',
    name: 'Admin Dashboard: Multichannel Hub',
    category: 'Admin',
    image: '/screenshots/16_admin_platforms.png',
    component: 'src/components/admin/AdminDashboard.tsx (PLATFORM_PARTNER)',
    endpoints: ['GET /api/v1/platforms/status', 'POST /api/v1/platforms/*'],
    description: 'Omnichannel social broadcast (Facebook, Instagram, TikTok) and direct WhatsApp Business API messaging.',
    actionType: 'admin_platforms',
  },
];

interface UiShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction: (actionType: UiInterfaceItem['actionType']) => void;
}

export const UiShowcaseModal: React.FC<UiShowcaseModalProps> = ({
  isOpen,
  onClose,
  onTriggerAction,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Storefront', 'Funnel', 'AI', 'Admin'];

  const filteredInterfaces = UI_INTERFACES.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.endpoints.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/85 backdrop-blur-md transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-5xl bg-white dark:bg-urban-dark border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Top Brand Stripe */}
          <div className="h-1.5 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 flex-shrink-0" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-shrink-0 bg-slate-50/80 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                    UI & UX Interface Blueprint
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-[10px] font-bold font-mono">
                    16 Interfaces
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every interface implemented in this codebase, grounded in FastAPI endpoints.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-urban-dark flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {cat === 'All' ? 'All (16)' : cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px] sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search interfaces or endpoints..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Scrollable Interfaces Grid */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInterfaces.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 flex flex-col justify-between hover:border-brand-500/40 transition-all hover:shadow-lg group"
                >
                  <div>
                    {/* Thumbnail Image with Zoom Preview */}
                    <div
                      onClick={() => setPreviewImage(item.image)}
                      className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-3 cursor-zoom-in group/img"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-top group-hover/img:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-sm">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Inspect Screenshot</span>
                        </span>
                      </div>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-900/80 text-white font-mono font-bold text-[10px] backdrop-blur-sm">
                        #{item.number}
                      </span>
                    </div>

                    {/* Title & Category Badge */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                        {item.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-shrink-0">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Component Source File */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-2 bg-slate-50 dark:bg-slate-950/80 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <Code2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                      <span className="truncate">{item.component}</span>
                    </div>

                    {/* Backend Endpoints */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.endpoints.map((ep, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 text-[10px] font-mono font-semibold"
                        >
                          {ep}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewImage(item.image)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Enlarge</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onTriggerAction(item.actionType);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 hover:scale-102"
                    >
                      <span>Launch Live</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Screenshot Zoom Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-6xl max-h-[95vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg transition-transform hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Screenshot Preview"
              className="w-full h-auto max-h-[90vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
