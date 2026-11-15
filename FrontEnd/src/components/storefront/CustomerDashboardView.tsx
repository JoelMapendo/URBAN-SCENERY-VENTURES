import React, { useState } from 'react';
import {
  LayoutDashboard,
  Heart,
  CreditCard,
  Bell,
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
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/formatters';
import { ProductOut } from '../../types';

interface CustomerDashboardViewProps {
  onViewOrderDetails: (orderId: number) => void;
  onNavigateToShop: () => void;
  onOpenProductDetail?: (product: ProductOut) => void;
  initialTab?: 'dashboard' | 'favorite' | 'payment' | 'notifications' | 'settings';
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  onViewOrderDetails,
  onNavigateToShop,
  onOpenProductDetail,
  initialTab = 'dashboard',
}) => {
  const { user, logout } = useAuthStore();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'favorite' | 'payment' | 'notifications' | 'settings'>(initialTab);

  // Profile form state (Matching Image 8)
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || 'Courtney');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || 'Henry');
  const [displayName, setDisplayName] = useState(user?.name || 'Courtney Henry');
  const [email, setEmail] = useState(user?.email || 'courtney.henry@example.com');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Checkbox state for orders table
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // Demo Orders List (Matching Image 3: 5/27/15, 1/31/14, 4/4/18)
  const [orders] = useState([
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
        <h1 className="text-3xl font-black text-center mb-10 tracking-tight font-heading">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: Avatar & Navigation Menu (Matching Images 2, 3, 5 & 8) */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            {/* User Profile Capsule */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 shadow-sm mb-3 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
                  alt="Courtney Henry"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {displayName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{email}</p>
            </div>

            {/* Navigation Menu (Matching Image 2 & 3) */}
            <nav className="space-y-1.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
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
                onClick={() => setActiveTab('payment')}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                  activeTab === 'payment'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Payment</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Bell className="w-4 h-4 text-slate-400" />
                <span>Notifications</span>
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

              <button
                onClick={() => logout()}
                className="w-full py-2.5 px-4 rounded-xl flex items-center gap-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors pt-3"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </nav>
          </aside>

          {/* ========================================================================= */}
          {/* RIGHT MAIN AREA: Dynamic Views (Image 3 Dashboard / Image 2 Favorite) */}
          {/* ========================================================================= */}
          <main className="lg:col-span-8 space-y-6">
            {/* ========================================================================= */}
            {/* VIEW 1: DASHBOARD (Matching Image 3: 3 Metric Cards + Orders Table) */}
            {/* ========================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in">
                {/* 3 Metric Cards (Matching Image 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>Orders</span>
                    </span>
                    <span className="text-3xl font-black text-slate-950 dark:text-white mt-3 font-mono">
                      3
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
            {/* VIEW 2: FAVORITE (Matching Image 2: Remove All Button + 4 Cards Grid) */}
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
                            src={prod.banner_image}
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
                      className="py-2 px-4 rounded-xl bg-black text-white text-xs font-bold"
                    >
                      Browse All Products
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: PAYMENT METHODS */}
            {/* ========================================================================= */}
            {activeTab === 'payment' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  Payment Methods & Multi-Rail Gateway
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Bank Wire Transfer</span>
                      <Building className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 font-mono">Account Ending in •••• 4092</p>
                    <span className="text-[10px] text-emerald-600 font-bold block">Verified Active</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Mobile Money Wallet</span>
                      <Smartphone className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 font-mono">+1 (555) ••••-5678</p>
                    <span className="text-[10px] text-emerald-600 font-bold block">Verified Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: NOTIFICATIONS */}
            {/* ========================================================================= */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in">
                <h3 className="text-base font-bold text-slate-950 dark:text-white mb-2">
                  Order & Delivery Notifications
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <Clock className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Order #62639 is in processing</h4>
                      <p className="text-slate-500 mt-0.5">Your Zackpot Speaker is packaged and awaiting courier dispatch.</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">Today at 10:45 AM</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Order #44322 successfully delivered</h4>
                      <p className="text-slate-500 mt-0.5">PlayStation Game Console signed at 8080 Railroad St.</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 5: SETTINGS / PROFILE CHANGE (Matching Image 8) */}
            {/* ========================================================================= */}
            {activeTab === 'settings' && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in"
              >
                {savedNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savedNotice}</span>
                  </div>
                )}

                {/* Section 1: Account Details (Matching Image 8) */}
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-4">
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Section 2: Password Change (Matching Image 8) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-4">
                    Password Change
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-black hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-md"
                >
                  Save Profile Settings
                </button>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
