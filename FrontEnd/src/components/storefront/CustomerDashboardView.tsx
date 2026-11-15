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
  Eye,
  CheckCircle2,
  Lock,
  User,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency } from '../../utils/formatters';
import { ProductOut } from '../../types';

interface CustomerDashboardViewProps {
  onViewOrderDetails: (orderId: number) => void;
  onNavigateToShop: () => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  onViewOrderDetails,
  onNavigateToShop,
}) => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'favorite' | 'payment' | 'notifications' | 'settings'>('dashboard');

  // Profile form state (Matching Image 8)
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || 'Courtney');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || 'Henry');
  const [displayName, setDisplayName] = useState(user?.name || 'Courtney Henry');
  const [email, setEmail] = useState(user?.email || 'courtney.henry@example.com');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Demo Orders List (Matching Image 5)
  const [orders] = useState([
    {
      id: 44322,
      product: 'PlayStation Game Console',
      date: '05/27/24',
      status: 'Delivered',
      statusColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200',
      total: 320.0,
      itemsCount: 2,
    },
    {
      id: 62639,
      product: 'Zackpot Portable Speaker',
      date: '01/31/24',
      status: 'Processing',
      statusColor: 'text-brand-600 bg-brand-50 dark:bg-brand-500/10 border-brand-200',
      total: 800.0,
      itemsCount: 1,
    },
    {
      id: 14355,
      product: 'Philips Air Fryer XL',
      date: '04/04/24',
      status: 'Canceled',
      statusColor: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-200',
      total: 800.0,
      itemsCount: 1,
    },
  ]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice('Profile and security details updated successfully.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="bg-white dark:bg-urban-darker min-h-screen text-slate-900 dark:text-white transition-colors py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-center mb-10 tracking-tight font-heading">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: Avatar & Navigation Menu (Matching Image 5 & 8) */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            {/* User Profile Capsule */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-black p-1 shadow-md mb-3 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
                  alt="Customer Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {displayName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{email}</p>
            </div>

            {/* Navigation Menu */}
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
                <span>Favorite (4)</span>
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
          {/* RIGHT MAIN AREA: Tab Views (Dashboard vs Settings vs Favorites) */}
          {/* ========================================================================= */}
          <main className="lg:col-span-8 space-y-6">
            {/* VIEW 1: DASHBOARD METRICS & ORDERS (Matching Image 5) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in">
                {/* 3 Metric Cards */}
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

                {/* Orders Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                        <tr>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
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
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ord.statusColor}`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">
                              {formatCurrency(ord.total)}
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                for {ord.itemsCount} items
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => onViewOrderDetails(ord.id)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-black hover:text-white dark:bg-slate-800 text-[11px] font-bold transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: SETTINGS / PROFILE CHANGE (Matching Image 8) */}
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

                {/* Section 1: Account Details */}
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-4">
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Section 2: Password Change */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-4">
                    Password Change
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
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

            {/* VIEW 3: FAVORITES WISHLIST */}
            {activeTab === 'favorite' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in">
                <h3 className="text-base font-bold text-slate-950 dark:text-white mb-2">
                  My Wishlist (4 Items)
                </h3>
                <p className="text-xs text-slate-400">Items saved for your upcoming purchases.</p>
                <div className="pt-4">
                  <button
                    onClick={onNavigateToShop}
                    className="py-2.5 px-4 rounded-xl bg-black text-white text-xs font-bold"
                  >
                    Explore Electronics Catalog
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
