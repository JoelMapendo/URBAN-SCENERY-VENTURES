import React, { useState } from 'react';
import {
  LayoutDashboard,
  Heart,
  CreditCard,
  Settings,
  LogOut,
  Package,
  Clock,
  XCircle,
  ArrowRight,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Building,
  Smartphone,
  Wallet,
  ShoppingBag,
  PlusCircle,
  Upload,
  Layers,
  MapPin,
  Tag,
  DollarSign,
  UserCheck,
  Store,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/formatters';
import { ProductOut } from '../../types';
import { DEFAULT_PRODUCTS } from '../../data/defaultProducts';

interface CustomerDashboardViewProps {
  onViewOrderDetails: (orderId: number) => void;
  onNavigateToShop: () => void;
  onOpenProductDetail?: (product: ProductOut) => void;
  initialTab?: 'dashboard' | 'favorite' | 'payment' | 'notifications' | 'settings' | 'upload_products' | 'buyer_orders';
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  onViewOrderDetails,
  onNavigateToShop,
  onOpenProductDetail,
  initialTab = 'dashboard',
}) => {
  const { user, isAdmin, setRole, logout } = useAuthStore();
  const { addItem } = useCartStore();

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>(
    !isAdmin && initialTab === 'dashboard' ? 'buyer_orders' : initialTab
  );

  // Profile form state (Matching media_1794773121647_58752c4f.png)
  const defaultFirstName = isAdmin ? 'Urban' : user?.name?.split(' ')[0] || 'Courtney';
  const defaultLastName = isAdmin ? 'Scenery' : user?.name?.split(' ')[1] || 'Henry';
  const defaultDisplayName = isAdmin ? 'Urban Scenery Admin' : user?.name || 'Courtney Henry';
  const defaultEmail = isAdmin ? 'admin@urbanventures.com' : user?.email || 'courtney.henry@example.com';

  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [email, setEmail] = useState(defaultEmail);
  const [currentPassword, setCurrentPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Checkbox state for admin orders fulfillment table
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // Demo Orders List (Matching Image 3: 5/27/15, 1/31/14, 4/4/18)
  const [orders, setOrders] = useState([
    {
      id: 44322,
      product: 'PlayStation Game Console',
      date: '5/27/15',
      status: 'Delivered',
      statusColor: 'text-emerald-600 dark:text-emerald-400',
      total: 320.0,
      itemsCount: 2,
    },
    {
      id: 62639,
      product: 'Zackpot Speaker',
      date: '1/31/14',
      status: 'Processing',
      statusColor: 'text-blue-600 dark:text-blue-400',
      total: 800.0,
      itemsCount: 1,
    },
    {
      id: 14355,
      product: 'Philips Air Fryer',
      date: '4/4/18',
      status: 'Canceled',
      statusColor: 'text-rose-600 dark:text-rose-400',
      total: 800.0,
      itemsCount: 1,
    },
  ]);

  // Favorite Items (Matching Image 2: PlayStation, Zackpot, Philips, Nuarb)
  const [favoriteItems, setFavoriteItems] = useState<ProductOut[]>([
    {
      id: 2,
      name: 'PlayStation Game Console',
      price: '120.00',
      description: 'DualSense edition game console system.',
      banner_image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500&q=80',
      quantity: 15,
      status: 'AVAILABLE',
      category: 'Gaming Accessories',
      created_at: new Date().toISOString(),
    },
    {
      id: 9,
      name: 'Zackpot Speaker',
      price: '120.00',
      description: 'Portable Bluetooth speaker with deep bass.',
      banner_image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
      quantity: 20,
      status: 'AVAILABLE',
      category: 'Audio & Video',
      created_at: new Date().toISOString(),
    },
    {
      id: 10,
      name: 'Philips Air Fryer',
      price: '120.00',
      description: 'RapidAir healthy smart kitchen fryer.',
      banner_image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
      quantity: 10,
      status: 'AVAILABLE',
      category: 'Smart Tech',
      created_at: new Date().toISOString(),
    },
    {
      id: 11,
      name: "Nuarb Men's Trimmer",
      price: '120.00',
      description: 'Precision electric cordless grooming trimmer.',
      banner_image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&q=80',
      quantity: 25,
      status: 'AVAILABLE',
      category: 'Accessories',
      created_at: new Date().toISOString(),
    },
  ]);

  // Seller Product Upload State (Urban Scenery Ventures seller feature)
  const [sellerProducts, setSellerProducts] = useState<ProductOut[]>(DEFAULT_PRODUCTS.slice(0, 6));
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Smart Phones');
  const [newProductPrice, setNewProductPrice] = useState('120.00');
  const [newProductStock, setNewProductStock] = useState('25');
  const [newProductImage, setNewProductImage] = useState(
    'https://images.unsplash.com/photo-1511707171634-5f897ff025a0?w=500&q=80'
  );
  const [newProductDesc, setNewProductDesc] = useState('');
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  const handleUploadProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const createdProduct: ProductOut = {
      id: Date.now(),
      name: newProductName.trim(),
      category: newProductCategory,
      price: parseFloat(newProductPrice).toFixed(2),
      quantity: parseInt(newProductStock, 10) || 1,
      banner_image: newProductImage.trim(),
      description: newProductDesc.trim() || 'Verified hardware product listed by Urban Scenery Ventures seller.',
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
    };

    setSellerProducts((prev) => [createdProduct, ...prev]);
    // Also push to DEFAULT_PRODUCTS so buyer catalog immediately reflects it
    DEFAULT_PRODUCTS.unshift(createdProduct);

    setUploadSuccessNotice(`"${createdProduct.name}" has been published to Urban Scenery Ventures!`);
    setNewProductName('');
    setNewProductDesc('');
    setTimeout(() => setUploadSuccessNotice(null), 4000);
  };

  const handleDeleteListing = (id: number) => {
    setSellerProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleSelectOrder = (id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const handleClearFavorites = () => {
    setFavoriteItems([]);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice('Profile and password changes saved successfully.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  return (
    <div className="bg-slate-50/70 dark:bg-urban-darker min-h-screen text-slate-900 dark:text-white transition-colors py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Header with Role Indicator */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight font-heading">
            Dashboard
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider uppercase border ${
                isAdmin
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isAdmin ? <Store className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              <span>{isAdmin ? 'Seller / Admin Portal' : 'Customer / Buyer Portal'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: Avatar & Navigation Menu (Matching media_1794773121647_58752c4f.png) */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            {/* User Profile Capsule */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 shadow-sm mb-3 flex items-center justify-center border-2 border-black dark:border-slate-700">
                <img
                  src={
                    isAdmin
                      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80'
                      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
                  }
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {displayName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{email}</p>
              <span className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                {isAdmin ? 'Role: Seller / Merchant' : 'Role: Buyer / Shopper'}
              </span>
            </div>

            {/* Navigation Menu (Role-tailored: Diagrams for Admin, Short for Buyer) */}
            <nav className="space-y-1.5 text-xs font-semibold">
              {isAdmin ? (
                <>
                  {/* ADMIN / SELLER NAVIGATION */}
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-500" />
                    <span>Dashboard & Diagrams</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('upload_products')}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                      activeTab === 'upload_products'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-500" />
                    <span>Upload Products</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                      activeTab === 'payment'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Payouts & Balance</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                </>
              ) : (
                <>
                  {/* BUYER NAVIGATION (The "Short One") */}
                  <button
                    onClick={() => setActiveTab('buyer_orders')}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                      activeTab === 'buyer_orders'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-brand-500" />
                    <span>My Purchases (Short)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('favorite')}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                      activeTab === 'favorite'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-brand-500" />
                    <span>Favorite ({favoriteItems.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                </>
              )}

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="w-full py-2.5 px-4 rounded-xl flex items-center gap-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors pt-3 border-t border-slate-100 dark:border-slate-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </nav>

            {/* Quick Role Switcher Pill (Lets user switch between Seller & Buyer) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    Switch Active Role
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isAdmin ? 'Admin' : 'Buyer'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mb-2.5">
                  {isAdmin
                    ? 'Currently in Seller mode with full diagrams & inventory upload.'
                    : 'Currently in Buyer mode with a short, clean purchase history.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const nextRole = isAdmin ? 'buyer' : 'admin';
                    setRole(nextRole);
                    setActiveTab(nextRole === 'admin' ? 'dashboard' : 'buyer_orders');
                  }}
                  className="w-full py-2 rounded-xl bg-black hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAdmin ? 'Switch to Buyer (Short View)' : 'Switch to Seller / Admin'}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* RIGHT MAIN AREA: Dynamic Views */}
          {/* ========================================================================= */}
          <main className="lg:col-span-8 space-y-6">
            {/* ========================================================================= */}
            {/* VIEW 1: ADMIN DIAGRAMS & ORDERS (Only for Admins/Sellers) */}
            {/* ========================================================================= */}
            {activeTab === 'dashboard' && isAdmin && (
              <div className="space-y-6 animate-in fade-in">
                {/* 3 Metric Cards (Matching Image 3: Orders, Active Orders, Cancel Orders) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>Orders</span>
                    </span>
                    <span className="text-3xl font-black text-slate-950 dark:text-white mt-3 font-mono">
                      {orders.length}
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>Active Orders</span>
                    </span>
                    <span className="text-3xl font-black text-slate-950 dark:text-white mt-3 font-mono">
                      1
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Cancel Orders</span>
                    </span>
                    <span className="text-3xl font-black text-slate-950 dark:text-white mt-3 font-mono">
                      1
                    </span>
                  </div>
                </div>

                {/* Orders Table (Matching Image 3: Checkboxes, Order ID, Product, Date, Status, Total, Action) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Seller Order Fulfillment Diagram
                      </h3>
                      <p className="text-xs text-slate-400">
                        Manage and verify customer orders across Urban Scenery Ventures.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                        <tr>
                          <th className="py-3 px-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectedOrders.length === orders.length}
                              onChange={toggleSelectAllOrders}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                            />
                          </th>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {orders.map((ord) => {
                          const isChecked = selectedOrders.includes(ord.id);
                          return (
                            <tr
                              key={ord.id}
                              className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                                isChecked ? 'bg-slate-50/60 dark:bg-slate-800/20' : ''
                              }`}
                            >
                              <td className="py-3.5 px-4">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelectOrder(ord.id)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                                />
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                #{ord.id}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                {ord.product}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-500">
                                {ord.date}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`font-semibold ${ord.statusColor}`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold">
                                {formatCurrency(ord.total)}
                                <span className="text-[10px] text-slate-400 font-normal ml-1">
                                  for {ord.itemsCount}items
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => onViewOrderDetails(ord.id)}
                                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-500 hover:underline transition-colors"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: SELLER PRODUCT UPLOAD (The core feature for sellers/admin!) */}
            {/* ========================================================================= */}
            {activeTab === 'upload_products' && isAdmin && (
              <div className="space-y-6 animate-in fade-in">
                {/* Upload Form Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-brand-500" />
                      <span>Upload Product to Urban Scenery Ventures</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      List your electronics directly for verified buyers across the platform.
                    </p>
                  </div>

                  {uploadSuccessNotice && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{uploadSuccessNotice}</span>
                    </div>
                  )}

                  <form onSubmit={handleUploadProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="e.g. Sony WH-1000XM5 Headphones"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Category *
                        </label>
                        <select
                          value={newProductCategory}
                          onChange={(e) => setNewProductCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                        >
                          <option value="Smart Phones">Smart Phones</option>
                          <option value="Laptops & Tablets">Laptops & Tablets</option>
                          <option value="Audio & Video">Audio & Video</option>
                          <option value="Gaming Accessories">Gaming Accessories</option>
                          <option value="Smart Tech">Smart Tech</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Unit Price ($ USD) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Initial Stock Units *
                        </label>
                        <input
                          type="number"
                          required
                          value={newProductStock}
                          onChange={(e) => setNewProductStock(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Product Banner Image URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={newProductImage}
                        onChange={(e) => setNewProductImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Product Description & Specs
                      </label>
                      <textarea
                        rows={3}
                        value={newProductDesc}
                        onChange={(e) => setNewProductDesc(e.target.value)}
                        placeholder="Detailed hardware specs, warranty term, and key features..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="py-3 px-6 rounded-xl bg-black hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Publish Product to Store</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Currently Uploaded Listings by Seller */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Your Active Electronics Listings ({sellerProducts.length})
                      </h4>
                      <p className="text-xs text-slate-400">
                        Hardware currently live for buyers on the storefront.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3">
                    {sellerProducts.map((p) => (
                      <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={p.banner_image || undefined}
                              alt={p.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                              {p.name}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.category} • {p.quantity} in stock
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(p.price)}
                          </span>
                          <button
                            onClick={() => handleDeleteListing(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Remove listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: BUYER PURCHASES (The "Short One" for Users/Buyers) */}
            {/* ========================================================================= */}
            {activeTab === 'buyer_orders' && !isAdmin && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-slate-950 dark:text-white">
                        My Purchases
                      </h3>
                      <p className="text-xs text-slate-400">
                        Recent hardware bought from Urban Scenery Ventures sellers.
                      </p>
                    </div>
                    <button
                      onClick={onNavigateToShop}
                      className="py-1.5 px-3 rounded-xl bg-black text-white text-xs font-semibold hover:bg-brand-500 transition-colors"
                    >
                      Browse More Hardware
                    </button>
                  </div>

                  {/* Simple card list of orders (No complex admin diagrams!) */}
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 p-1 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
                            <Package className="w-6 h-6 text-brand-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                Order #{ord.id}
                              </span>
                              <span className={`text-[11px] font-semibold ${ord.statusColor}`}>
                                • {ord.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                              {ord.product}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Ordered {ord.date} • Total {formatCurrency(ord.total)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => onViewOrderDetails(ord.id)}
                            className="py-1.5 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-black hover:text-white hover:border-black transition-colors"
                          >
                            Track Package
                          </button>
                          <button
                            onClick={onNavigateToShop}
                            className="py-1.5 px-3.5 rounded-lg bg-black hover:bg-brand-500 text-white text-xs font-bold transition-colors"
                          >
                            Buy Again
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: FAVORITE (Matching Image 2: Remove All Button + 4 Cards Grid) */}
            {/* ========================================================================= */}
            {activeTab === 'favorite' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
                {/* Top Action Bar (Matching Image 2: "Remove All" button in top right) */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white">
                      Favorite ({favoriteItems.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Saved electronics ready for fast checkout.
                    </p>
                  </div>

                  {favoriteItems.length > 0 && (
                    <button
                      onClick={handleClearFavorites}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove All</span>
                    </button>
                  )}
                </div>

                {/* 4 Cards Grid (Matching Image 2) */}
                {favoriteItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {favoriteItems.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => onOpenProductDetail && onOpenProductDetail(prod)}
                        className="group rounded-xl border border-slate-200/90 dark:border-slate-800 p-3 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between bg-white dark:bg-slate-950/40"
                      >
                        <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-950 p-3 flex items-center justify-center overflow-hidden mb-3">
                          <img
                            src={prod.banner_image || undefined}
                            alt={prod.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 min-h-[32px] group-hover:text-brand-500 transition-colors">
                            {prod.name}
                          </h4>
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-950 dark:text-white font-mono">
                              {formatCurrency(prod.price)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addItem(prod, 1);
                              }}
                              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-brand-500 hover:text-white text-slate-600 flex items-center justify-center transition-colors shadow-sm"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xs text-slate-400 mb-3">Your favorites list is currently empty.</p>
                    <button
                      onClick={onNavigateToShop}
                      className="py-2 px-4 rounded-xl bg-black text-white text-xs font-bold hover:bg-brand-500 transition-colors"
                    >
                      Browse All Products
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 5: SETTINGS (Exactly matching screenshot media_1794773121647_58752c4f.png) */}
            {/* ========================================================================= */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in">
                {savedNotice && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{savedNotice}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-8">
                  {/* Section 1: Account Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Account Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {/* Section 2: Password Change */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Password Change
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Save Button (Matching media_1794773121647_58752c4f.png) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="py-3 px-6 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      Save Profile Settings
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 6: PAYMENTS & BALANCES */}
            {/* ========================================================================= */}
            {activeTab === 'payment' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isAdmin ? 'Seller Revenue & Merchant Payouts' : 'Saved Payment Methods'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAdmin
                      ? 'Withdraw sales earnings to your bank account or mobile money.'
                      : 'Saved credit cards and wallets for seamless checkout.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {isAdmin ? 'Available Seller Balance' : 'Primary Card'}
                    </span>
                    <h4 className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                      {isAdmin ? '$4,850.00' : '•••• •••• •••• 4242'}
                    </h4>
                    <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">
                      {isAdmin ? 'Verified Payout Account' : 'Visa Debit • Expires 12/28'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {isAdmin ? 'Pending Settlement' : 'Mobile Money'}
                    </span>
                    <h4 className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                      {isAdmin ? '$800.00' : '+256 700 ••• •••'}
                    </h4>
                    <span className="text-[11px] text-blue-500 font-semibold mt-1 block">
                      {isAdmin ? 'Processing 1 active order' : 'MTN / Airtel Instant'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
