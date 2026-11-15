import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Heart,
  ChevronDown,
  Layers,
  MapPin,
  Mail,
  Headphones,
  Laptop,
  Smartphone,
  Sliders,
  Tag,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useThemeStore } from '../../store/useThemeStore';

interface HeaderProps {
  currentView: 'home' | 'shop' | 'product-detail' | 'checkout' | 'order-status' | 'dashboard' | 'admin';
  onNavigate: (view: 'home' | 'shop' | 'product-detail' | 'checkout' | 'order-status' | 'dashboard' | 'admin', subSection?: string) => void;
  onOpenAuth: () => void;
  onFocusSearch: () => void;
  onSelectCategory?: (category: string) => void;
  onOpenUiShowcase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onFocusSearch,
  onSelectCategory,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { getTotalItems, setIsOpen: setCartOpen } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Products');

  const totalCartItems = getTotalItems();
  const isDark = theme === 'dark';

  const categories = [
    { name: 'All Products', icon: Layers },
    { name: 'Smart Phones', icon: Smartphone },
    { name: 'Laptops & Tablets', icon: Laptop },
    { name: 'Audio & Video', icon: Headphones },
    { name: 'Accessories', icon: Sliders },
    { name: 'Special Deals', icon: Tag, highlight: true },
  ];

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    setCategoryDropdownOpen(false);
    onNavigate('shop');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-urban-darker transition-colors duration-200">
      {/* 1. Top Utility Bar (White & Black with subtle text, as seen in Reference Header) */}
      <div className="bg-slate-50/90 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800 px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>support@urbanscenery.com</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Official Electronics Store & Authorized Retailer</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline font-medium text-slate-600 dark:text-slate-300">
              * Free Worldwide Shipping on Orders Over $150
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden md:inline">|</span>
            <button
              onClick={toggleTheme}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar (Matching Reference Image: Logo + Centered Search + Action Icons) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Brand Logo (Clearly visible wide logo + typography) */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <img
            src="/urban-scenery-logo.png"
            alt="Urban Scenery"
            className="h-10 sm:h-12 w-auto max-w-[170px] sm:max-w-[200px] object-contain transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <div className="font-black text-base sm:text-lg text-slate-950 dark:text-white tracking-tight flex items-center gap-1 font-heading">
              <span>URBAN</span>
              <span className="text-brand-500">SCENERY</span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase -mt-0.5">
              Electronics Store
            </p>
          </div>
        </div>

        {/* Centered Search Bar (White with subtle border & Small Pink Button) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div
            onClick={onFocusSearch}
            className="w-full relative flex items-center cursor-pointer group"
          >
            <input
              type="text"
              readOnly
              placeholder="Search products, brands and tech gadgets..."
              className="w-full pl-4 pr-12 py-2.5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 cursor-pointer transition-all focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-1.5 p-1.5 rounded-lg bg-black hover:bg-brand-500 text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Icons (Wishlist, Account, Cart with Pink Badge) */}
        <div className="flex items-center gap-3">
          {/* Wishlist Button (Matching Electro Mart Header) */}
          <button
            onClick={() => onNavigate('dashboard', 'favorite')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 text-slate-700 dark:text-slate-200 hover:text-brand-500 transition-colors" />
          </button>

          {/* User Account Button & Dropdown */}
          <div className="relative">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-500 uppercase">
                          {isAdmin ? 'Seller' : 'Buyer'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => {
                            onNavigate('dashboard', 'dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-500" />
                          <span>Sales Diagrams & Orders</span>
                        </button>

                        <button
                          onClick={() => {
                            onNavigate('dashboard', 'upload_products');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200"
                        >
                          <Layers className="w-4 h-4 text-emerald-500" />
                          <span>Upload Electronics</span>
                        </button>

                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200"
                        >
                          <Store className="w-4 h-4 text-brand-500" />
                          <span>Merchant Studio</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onNavigate('dashboard', 'buyer_orders');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200"
                        >
                          <User className="w-4 h-4 text-brand-500" />
                          <span>My Purchases (Short)</span>
                        </button>

                        <button
                          onClick={() => {
                            onNavigate('dashboard', 'favorite');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200"
                        >
                          <Heart className="w-4 h-4 text-brand-500" />
                          <span>My Wishlist (4)</span>
                        </button>

                        <button
                          onClick={() => {
                            onNavigate('order-status');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200"
                        >
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span>Track Live Delivery</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all"
              >
                <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>

          {/* Cart Icon with Small Pink Badge (Matching Reference) */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="View Cart"
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm animate-in zoom-in">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Sub-Navigation Bar (Matching Reference Image: All Categories + Nav Links + Shipping note) */}
      <div className="border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-urban-darker px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* "All Categories" Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 py-2 px-3.5 rounded-lg bg-black hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      {cat.highlight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Horizontal Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <button
                onClick={() => onNavigate('home')}
                className={`hover:text-slate-950 dark:hover:text-white transition-colors ${
                  currentView === 'home' ? 'font-bold text-slate-950 dark:text-white' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('shop')}
                className={`hover:text-slate-950 dark:hover:text-white transition-colors ${
                  currentView === 'shop' ? 'font-bold text-slate-950 dark:text-white' : ''
                }`}
              >
                Shop
              </button>
              <button
                onClick={() => handleCategoryClick('Laptops & Tablets')}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Laptops
              </button>
              <button
                onClick={() => handleCategoryClick('Smart Phones')}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Smartphones
              </button>
              <button
                onClick={() => handleCategoryClick('Audio & Video')}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Audio
              </button>
              <button
                onClick={() => onNavigate('order-status')}
                className={`hover:text-slate-950 dark:hover:text-white transition-colors ${
                  currentView === 'order-status' ? 'font-bold text-slate-950 dark:text-white' : ''
                }`}
              >
                Track Order
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`hover:text-slate-950 dark:hover:text-white transition-colors ${
                  currentView === 'dashboard' ? 'font-bold text-slate-950 dark:text-white' : ''
                }`}
              >
                My Account
              </button>
              <button
                onClick={() => handleCategoryClick('Special Deals')}
                className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                Deals
              </button>
            </nav>
          </div>

          {/* Right Announcement Note */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-bold">
              • 100% Genuine Tech Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2 animate-in fade-in">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('shop');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          >
            Shop Catalog
          </button>
          <button
            onClick={() => {
              onNavigate('order-status');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          >
            Track Order
          </button>
          <button
            onClick={() => {
              onNavigate('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          >
            My Account & Orders
          </button>
          <button
            onClick={() => {
              onFocusSearch();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5 text-brand-500" />
            <span>Search Products</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 flex items-center justify-between"
            >
              <span>Merchant Console</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500 text-white font-mono">
                Admin
              </span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
