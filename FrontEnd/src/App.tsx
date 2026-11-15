import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomeView } from './components/storefront/HomeView';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductDetailView } from './components/storefront/ProductDetailView';
import { CheckoutView } from './components/storefront/CheckoutView';
import { OrderStatusView } from './components/storefront/OrderStatusView';
import { CustomerDashboardView } from './components/storefront/CustomerDashboardView';
import { CartDrawer } from './components/storefront/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { UiShowcaseModal, UiInterfaceItem } from './components/common/UiShowcaseModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';
import { useCartStore } from './store/useCartStore';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { ProductOut } from './types';

type ViewMode = 'home' | 'shop' | 'product-detail' | 'checkout' | 'order-status' | 'dashboard' | 'admin';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [uiShowcaseOpen, setUiShowcaseOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'dashboard' | 'favorite' | 'payment' | 'notifications' | 'settings' | 'upload_products' | 'buyer_orders'>('dashboard');

  // Active product for detail page
  const [selectedProduct, setSelectedProduct] = useState<ProductOut>(DEFAULT_PRODUCTS[0]);
  const [trackingOrderId, setTrackingOrderId] = useState<number>(44322);

  const { setIsOpen: setCartOpen, addItem } = useCartStore();
  const { setTheme } = useThemeStore();
  const { setAuth, logout, isAuthenticated } = useAuthStore();

  // Search state passed between header & shop
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (view: ViewMode, subSection?: string) => {
    if (view === 'dashboard' && subSection && ['dashboard', 'favorite', 'payment', 'notifications', 'settings', 'upload_products', 'buyer_orders'].includes(subSection)) {
      setDashboardTab(subSection as any);
    } else if (view === 'dashboard' && !subSection) {
      setDashboardTab(isAdmin ? 'dashboard' : 'buyer_orders');
    }

    if (view === 'shop' && subSection) {
      setSearchQuery(subSection);
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProductDetail = (product: ProductOut) => {
    setSelectedProduct(product);
    handleNavigate('product-detail');
  };

  const handleDirectBuyNow = (product: ProductOut) => {
    addItem(product, 1);
    handleNavigate('checkout');
  };

  const handleNavigateToShop = (category?: string) => {
    if (category) {
      setSearchQuery(category);
    }
    handleNavigate('shop');
  };

  const handleTrackOrder = (orderId: number) => {
    setTrackingOrderId(orderId);
    handleNavigate('order-status');
  };

  const handleFocusSearch = () => {
    handleNavigate('shop');
  };

  const handleTriggerUiAction = (actionType: UiInterfaceItem['actionType']) => {
    switch (actionType) {
      case 'theme_dark':
        setTheme('dark');
        break;
      case 'theme_light':
        setTheme('light');
        break;
      case 'scroll_catalog':
        handleNavigate('shop');
        break;
      case 'open_cart':
        setCartOpen(true);
        break;
      case 'open_checkout':
        handleNavigate('checkout');
        break;
      case 'open_auth':
        setAuthModalOpen(true);
        break;
      case 'admin_gate':
        logout();
        handleNavigate('admin');
        break;
      case 'admin_overview':
      case 'admin_products':
      case 'admin_customers':
      case 'admin_orders':
      case 'admin_payments':
      case 'admin_ai_studio':
      case 'admin_platforms':
        if (!isAuthenticated) {
          setAuth('demo-admin-token', {
            public_id: 'usr_admin_001',
            name: 'Admin Reviewer',
            email: 'admin@urbanscenery.com',
            role: 'admin',
            created_at: new Date().toISOString(),
          });
        }
        handleNavigate('admin');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-urban-darker text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Global Navigation Header (Logo clearly seen, AI Advisor removed, Wishlist icon active) */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onFocusSearch={handleFocusSearch}
        onSelectCategory={handleNavigateToShop}
        onOpenUiShowcase={() => setUiShowcaseOpen(true)}
      />

      {/* Main Dynamic View Router */}
      <main className="flex-1">
        {/* 1. HOME VIEW (Audio Card + Scooters + Entertainment + Category Circles + Popular) */}
        {currentView === 'home' && (
          <HomeView
            products={DEFAULT_PRODUCTS}
            onNavigateToShop={handleNavigateToShop}
            onOpenProductDetail={handleOpenProductDetail}
          />
        )}

        {/* 2. SHOP / COLLECTION VIEW (Left Sidebar Filters + 4-Col Grid + Pagination) */}
        {currentView === 'shop' && (
          <ProductGrid
            initialSearchQuery={searchQuery}
            onClearInitialSearch={() => setSearchQuery('')}
            onOpenProductDetail={handleOpenProductDetail}
          />
        )}

        {/* 3. PRODUCT DETAIL VIEW (Gallery, Tabs, Specs, Buy Now) */}
        {currentView === 'product-detail' && (
          <ProductDetailView
            product={selectedProduct}
            onBack={() => handleNavigate('shop')}
            onDirectBuyNow={handleDirectBuyNow}
          />
        )}

        {/* 4. CART & CHECKOUT FLOW (Stepper, Billing, Confirmation) */}
        {currentView === 'checkout' && (
          <CheckoutView
            products={DEFAULT_PRODUCTS}
            onOpenProductDetail={handleOpenProductDetail}
            onNavigateToOrderTracking={handleTrackOrder}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {/* 5. ORDER TRACKING & STATUS (Stepper + Shipping Info + Interactive Map) */}
        {currentView === 'order-status' && (
          <OrderStatusView
            orderId={trackingOrderId}
            onBackToShop={() => handleNavigate('shop')}
          />
        )}

        {/* 6. CUSTOMER DASHBOARD & SETTINGS (Orders Metrics, Table with Checkboxes, Favorite (4) Grid) */}
        {currentView === 'dashboard' && (
          <CustomerDashboardView
            key={dashboardTab}
            initialTab={dashboardTab}
            onViewOrderDetails={handleTrackOrder}
            onNavigateToShop={() => handleNavigate('shop')}
            onOpenProductDetail={handleOpenProductDetail}
          />
        )}

        {/* 7. ADMIN & MERCHANT DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard
            onBackToStore={() => handleNavigate('home')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Persistent Slide-Over Cart Drawer */}
      <CartDrawer onOpenCheckout={() => handleNavigate('checkout')} />

      {/* Auth Modal (Sign In / Register) */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      {/* 16 Interfaces Interactive UI Showcase Modal */}
      <UiShowcaseModal
        isOpen={uiShowcaseOpen}
        onClose={() => setUiShowcaseOpen(false)}
        onTriggerAction={handleTriggerUiAction}
      />

      {/* Solid Black Footer (Matching Electro Mart Reference, Logo Clearly Seen, All Lines Clickable & Linked) */}
      <Footer
        onNavigate={handleNavigate}
        onOpenCart={() => setCartOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenUiShowcase={() => setUiShowcaseOpen(true)}
      />
    </div>
  );
};

export default App;
