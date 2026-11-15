import React, { useState } from 'react';
import { Send, Check, ShieldCheck, Mail } from 'lucide-react';

interface FooterProps {
  onOpenUiShowcase?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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

  return (
    <footer className="bg-black text-slate-400 text-xs pt-14 pb-8 border-t border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter Bar (Matching Electro Mart Reference Image) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight font-heading">
                URBAN SCENERY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curated intelligent electronics and verified consumer hardware.
            </p>
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

        {/* 5-Column Navigation Grid (Matching Electro Mart Reference Image) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-slate-900">
          {/* Column 1: Shop */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Shop
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Laptops & Workstations</li>
              <li className="hover:text-white transition-colors cursor-pointer">Smartphones & 5G</li>
              <li className="hover:text-white transition-colors cursor-pointer">Audio & ANC Headsets</li>
              <li className="hover:text-white transition-colors cursor-pointer">Displays & 4K Monitors</li>
              <li className="hover:text-white transition-colors cursor-pointer">Accessories & Cables</li>
            </ul>
          </div>

          {/* Column 2: Pages */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Pages
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Store Home</li>
              <li className="hover:text-white transition-colors cursor-pointer">All Collections</li>
              <li className="hover:text-white transition-colors cursor-pointer">Deals & Offers</li>
              <li className="hover:text-white transition-colors cursor-pointer">AI Hardware Advisor</li>
              <li className="hover:text-white transition-colors cursor-pointer">Merchant Console</li>
            </ul>
          </div>

          {/* Column 3: About Us */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              About Us
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Our Hardware Story</li>
              <li className="hover:text-white transition-colors cursor-pointer">Verified Inventory</li>
              <li className="hover:text-white transition-colors cursor-pointer">Wishlist Items</li>
              <li className="hover:text-white transition-colors cursor-pointer">Track My Order</li>
              <li className="hover:text-white transition-colors cursor-pointer">Help & FAQs</li>
            </ul>
          </div>

          {/* Column 4: Regulations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Regulations
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</li>
              <li className="hover:text-white transition-colors cursor-pointer">30-Day Return Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Hardware Warranty</li>
              <li className="hover:text-white transition-colors cursor-pointer">Security Compliance</li>
            </ul>
          </div>

          {/* Column 5: Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Services
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Express Global Shipping</li>
              <li className="hover:text-white transition-colors cursor-pointer">24/7 Live Support</li>
              <li className="hover:text-white transition-colors cursor-pointer">Multi-Rail Payments</li>
              <li className="hover:text-white transition-colors cursor-pointer">Enterprise Procurement</li>
              <li className="hover:text-white transition-colors cursor-pointer">Wholesale Supply</li>
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
  );
};
