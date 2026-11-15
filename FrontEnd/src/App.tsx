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
import { AiShoppingAssistant } from './components/storefront/AiShoppingAssistant';
import { AiRecommendationModal } from './components/storefront/AiRecommendationModal';
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
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false);
  const [uiShowcaseOpen, setUiShowcaseOpen] = useState(false);

  // Active product for detail page
  const [selectedProduct, setSelectedProduct] = useState<ProductOut>(DEFAULT_PRODUCTS[0]);
  const [trackingOrderId, setTrackingOrderId] = useState<number>(44322);

  const { setIsOpen: setCartOpen, addItem } = useCartStore();
  const { setTheme } = useThemeStore();
  const { setAuth, logout, isAuthenticated } = useAuthStore();

  // Search state passed between header & shop
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantPrompt, setAssistantPrompt] = useState<string | undefined>(undefined);

  const handleNavigate = (view: ViewMode) => {
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
      case 'open_ai_recommend':
        setRecommendationModalOpen(true);
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
      case 'open_ai_assistant':
        setAssistantPrompt('What flagship hardware do you recommend under $500?');
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
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onFocusSearch={handleFocusSearch}
        onSelectCategory={handleNavigateToShop}
        onOpenAiRecommendations={() => setRecommendationModalOpen(true)}
        onOpenUiShowcase={() => setUiShowcaseOpen(true)}
      />

      {/* Main Dynamic View Router */}
      <main className="flex-1">
        {/* 1. HOME VIEW (Matching Image 1: Audio Card + Scooters + Entertainment + Category Circles + Popular) */}
        {currentView === 'home' && (
          <HomeView
            products={DEFAULT_PRODUCTS}
            onNavigateToShop={handleNavigateToShop}
            onOpenProductDetail={handleOpenProductDetail}
          />
        )}

        {/* 2. SHOP / COLLECTION VIEW (Matching Image 3: Left Sidebar Filters + 4-Col Grid + Pagination) */}
        {currentView === 'shop' && (
          <ProductGrid
            initialSearchQuery={searchQuery}
            onClearInitialSearch={() => setSearchQuery('')}
            onOpenShoppingAssistant={(prompt) => setAssistantPrompt(prompt)}
            onOpenProductDetail={handleOpenProductDetail}
          />
        )}

        {/* 3. PRODUCT DETAIL VIEW (Matching Image 6: Gallery, Tabs, Specs, Buy Now) */}
        {currentView === 'product-detail' && (
          <ProductDetailView
            product={selectedProduct}
            onBack={() => handleNavigate('shop')}
            onDirectBuyNow={handleDirectBuyNow}
          />
        )}

        {/* 4. CART & CHECKOUT FLOW (Matching Image 2 & 4: Stepper, Billing, Confirmation) */}
        {currentView === 'checkout' && (
          <CheckoutView
            products={DEFAULT_PRODUCTS}
            onOpenProductDetail={handleOpenProductDetail}
            onNavigateToOrderTracking={handleTrackOrder}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {/* 5. ORDER TRACKING & STATUS (Matching Image 7: Stepper + Shipping Info + Interactive Map) */}
        {currentView === 'order-status' && (
          <OrderStatusView
            orderId={trackingOrderId}
            onBackToShop={() => handleNavigate('shop')}
          />
        )}

        {/* 6. CUSTOMER DASHBOARD & SETTINGS (Matching Image 5 & 8: Metrics, Orders, Wishlist, Profile) */}
        {currentView === 'dashboard' && (
          <CustomerDashboardView
            onViewOrderDetails={handleTrackOrder}
            onNavigateToShop={() => handleNavigate('shop')}
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

      {/* Persistent AI Shopping Assistant Agent */}
      <AiShoppingAssistant
        initialPrompt={assistantPrompt}
        onClearInitialPrompt={() => setAssistantPrompt(undefined)}
      />

      {/* AI Recommendation Modal */}
      <AiRecommendationModal
        isOpen={recommendationModalOpen}
        onClose={() => setRecommendationModalOpen(false)}
      />

      {/* Auth Modal (Sign In / Register) */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      {/* 16 Interfaces Interactive UI Showcase Modal */}
      <UiShowcaseModal
        isOpen={uiShowcaseOpen}
        onClose={() => setUiShowcaseOpen(false)}
        onTriggerAction={handleTriggerUiAction}
      />

      {/* Solid Black Footer (Matching Electro Mart Reference) */}
      <Footer onOpenUiShowcase={() => setUiShowcaseOpen(true)} />
    </div>
  );
};

export default App;
