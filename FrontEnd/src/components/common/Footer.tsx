import React, { useState } from 'react';
import {
  Send,
  Check,
  ShieldCheck,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Phone,
  Mail,
  MapPin,
  Clock,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: 'home' | 'shop' | 'product-detail' | 'checkout' | 'order-status' | 'dashboard' | 'admin', subSection?: string) => void;
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
  onOpenUiShowcase?: () => void;
}

interface ModalInfo {
  title: string;
  category: string;
  content: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCart,
  onOpenAuth,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalInfo | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const openInfo = (title: string, category: string, content: React.ReactNode) => {
    setActiveModal({ title, category, content });
  };

  return (
    <>
      <footer className="bg-black text-slate-400 text-xs pt-14 pb-8 border-t border-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Newsletter Bar (Matching Reference Image) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-slate-900">
            {/* Logo and Brand Title (Clearly seen) */}
            <div
              onClick={() => onNavigate && onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src="/urban-scenery-logo.png"
                alt="Urban Scenery"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-white tracking-tight font-heading">
                    URBAN <span className="text-brand-500">SCENERY</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curated intelligent electronics and verified consumer hardware.
                </p>
              </div>
            </div>

            {/* Newsletter Input + Submit */}
            <div className="w-full md:w-auto min-w-[320px]">
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Mail"
                  className="w-full pl-4 pr-12 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 p-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-sm"
                >
                  {subscribed ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-emerald-400 mt-1.5 animate-in fade-in">
                  Thank you! You are subscribed for exclusive tech discounts.
                </p>
              )}
            </div>
          </div>

          {/* 5-Column Navigation Grid (Fully Clickable & Linked) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-slate-900">
            {/* Column 1: Shop */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
                Shop
              </h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('shop', 'Accessories')}
                    className="hover:text-brand-500 transition-colors text-left flex items-center gap-1 group"
                  >
                    <span>Accessories</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('shop', 'Gaming Accessories')}
                    className="hover:text-brand-500 transition-colors text-left flex items-center gap-1 group"
                  >
                    <span>Gaming</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('shop', 'Laptops & Tablets')}
                    className="hover:text-brand-500 transition-colors text-left flex items-center gap-1 group"
                  >
                    <span>Laptops & Computer</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('shop', 'Smart Phones')}
                    className="hover:text-brand-500 transition-colors text-left flex items-center gap-1 group"
                  >
                    <span>Smartphones & 5G</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('shop', 'Audio & Video')}
                    className="hover:text-brand-500 transition-colors text-left flex items-center gap-1 group"
                  >
                    <span>Audio & Video</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('shop')}
                    className="hover:text-brand-500 transition-colors text-left flex items-center gap-1 group text-slate-300 font-semibold"
                  >
                    <span>All Products</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Pages */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
                Pages
              </h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('home')}
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Store Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('shop')}
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    All Collections
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('order-status')}
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Track My Order
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('dashboard')}
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Customer Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenAuth && onOpenAuth()}
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Account Sign In
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: About Us */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
                About Us
              </h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Our Hardware Story',
                        'About Urban Scenery',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Urban Scenery was founded to bridge the gap between premium international electronics manufacturing and consumer transparency.
                          </p>
                          <p>
                            Every single product in our catalog undergoes rigorous multi-point hardware verification, battery compliance validation, and serial numbering to eliminate counterfeit devices.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Our Hardware Story
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Verified Inventory',
                        'Authenticity Guarantee',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            We partner directly with authorized distributors and premier original equipment manufacturers (OEMs).
                          </p>
                          <p className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> 100% Genuine Certified Stock
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Verified Inventory
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate && onNavigate('dashboard', 'favorite')}
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Wishlist (Saved Items)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenCart && onOpenCart()}
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Shopping Cart
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Help & Frequently Asked Questions',
                        'Customer FAQ',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white">How long does shipping take?</h5>
                            <p className="text-slate-500 mt-0.5">Express shipping delivers within 2–4 business days worldwide with real-time tracking.</p>
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white">What payment methods are supported?</h5>
                            <p className="text-slate-500 mt-0.5">We accept Visa, MasterCard, Bank Transfer, Mobile Money, and Cash on Delivery.</p>
                          </div>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Help & FAQs
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Regulations */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
                Regulations
              </h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Privacy Policy',
                        'Legal Compliance',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Urban Scenery enforces strict privacy and GDPR/CCPA data handling compliance. We never sell or distribute personal customer data or financial information.
                          </p>
                          <p>
                            All payment credentials are processed with end-to-end 256-bit encryption through certified payment gateways.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Terms & Conditions',
                        'Customer Agreement',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            By placing an order on Urban Scenery, customers receive authentic retail packaging, factory warranties, and full customer service protections.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        '30-Day Return Policy',
                        'Returns & Exchanges',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Eligible items can be returned within 30 days of receipt in original retail packaging with all accessories included for a full refund or exchange.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    30-Day Return Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Hardware Warranty',
                        'Warranty Coverage',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            All electronics are backed by a minimum 1-year manufacturer warranty covering internal defects, power systems, and manufacturing anomalies.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Hardware Warranty
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Security Compliance',
                        'Security Architecture',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Our platform operates with SOC2-compliant data storage, TLS 1.3 encrypted transmission, and automated fraud prevention checks.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Security Compliance
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: Services */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
                Services
              </h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Express Global Shipping',
                        'Fulfillment Logistics',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Direct air express and localized hub distribution across Europe, Americas, Africa, and Asia-Pacific.
                          </p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Free shipping automatically applied on orders over $150.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Express Global Shipping
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        '24/7 Live Support',
                        'Customer Care',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Our customer success desk operates around the clock. Contact us at <span className="font-bold text-slate-900 dark:text-white">support@urbanscenery.com</span> or via live chat.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    24/7 Live Support
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Multi-Rail Payments',
                        'Checkout Rails',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Enjoy seamless payments with Card, Bank Transfer, Mobile Money, and Cash on Delivery with full buyer protection.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Multi-Rail Payments
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Enterprise Procurement',
                        'B2B Solutions',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Bulk business orders, customized hardware provisioning, and dedicated account management for corporate offices and educational institutions.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Enterprise Procurement
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openInfo(
                        'Wholesale Supply',
                        'Partner Distribution',
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            Wholesale pricing tiers for verified electronics retailers and regional dealers.
                          </p>
                        </div>
                      )
                    }
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Wholesale Supply
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Urban Scenery Ventures. All Rights Reserved.</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modal for Clicked Footer Regulations / About / Services */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-brand-500 uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>{activeModal.category}</span>
            </div>

            <h3 className="text-xl font-bold text-slate-950 dark:text-white font-heading">
              {activeModal.title}
            </h3>

            <div className="py-2 border-y border-slate-100 dark:border-slate-800">
              {activeModal.content}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="py-2 px-5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
