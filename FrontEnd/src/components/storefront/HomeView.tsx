import React from 'react';
import {
  ArrowRight,
  Headphones,
  Gamepad2,
  Laptop,
  Smartphone,
  Watch,
  Sparkles,
  Zap,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { ProductOut } from '../../types';
import { ProductCard } from './ProductCard';

interface HomeViewProps {
  products: ProductOut[];
  onNavigateToShop: (category?: string) => void;
  onOpenProductDetail: (product: ProductOut) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onNavigateToShop,
  onOpenProductDetail,
}) => {
  // Category circle icons matching Image 1
  const categoryCircles = [
    { name: 'Super Deals', icon: Zap, query: 'deal', bg: 'bg-rose-50 text-brand-500' },
    { name: 'Gaming', icon: Gamepad2, query: 'gaming', bg: 'bg-blue-50 text-blue-600' },
    { name: 'Laptops', icon: Laptop, query: 'laptop', bg: 'bg-slate-100 text-slate-800' },
    { name: 'Phones', icon: Smartphone, query: 'phone', bg: 'bg-emerald-50 text-emerald-600' },
    { name: 'Watches', icon: Watch, query: 'watch', bg: 'bg-purple-50 text-purple-600' },
    { name: 'Audio', icon: Headphones, query: 'audio', bg: 'bg-amber-50 text-amber-600' },
  ];

  // Take first 4-8 products for the Popular showcase
  const popularProducts = products.slice(0, 8);

  return (
    <div className="bg-white dark:bg-urban-darker min-h-screen text-slate-900 dark:text-white transition-colors">
      {/* ========================================================================= */}
      {/* HERO SECTION (Matching Image 1: Audio Card on Left + 2 Cards on Right) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Big Promo Card: Audio Studio 3 Wireless */}
          <div
            onClick={() => onNavigateToShop('Audio & Video')}
            className="lg:col-span-8 rounded-3xl bg-gradient-to-br from-amber-50/70 via-stone-100 to-amber-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all min-h-[380px]"
          >
            <div className="relative z-10 max-w-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">
                Audio Edition
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.08] font-heading">
                AUDIO <br />
                <span className="text-brand-500">STUDIO 3</span> <br />
                WIRELESS
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-1">
                Hear The Music. Not The Noise. Grounded in active noise cancelling tech.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-full bg-black hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 group-hover:scale-105"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* High-Res Hero Headset Visual */}
            <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-6 w-56 h-56 sm:w-80 sm:h-80 flex items-center justify-center pointer-events-none group-hover:scale-105 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"
                alt="Audio Studio 3 Wireless"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right Column (2 Stacked Promo Cards Matching Image 1) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Right Card 1: Electric Scooters */}
            <div
              onClick={() => onNavigateToShop('Laptops & Tablets')}
              className="flex-1 rounded-3xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex items-center justify-between relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative z-10 max-w-[160px] space-y-1.5">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  New age electric
                </p>
                <h3 className="text-xl font-black text-slate-950 dark:text-white leading-tight">
                  SCOOTERS
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Last call up to <span className="font-mono">$250 OFF</span>
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-bold group-hover:bg-brand-500 transition-colors">
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div className="w-32 h-32 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=350&q=80"
                  alt="Scooter"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right Card 2: Enhance Your Entertainment */}
            <div
              onClick={() => onNavigateToShop('Gaming Accessories')}
              className="flex-1 rounded-3xl bg-black text-white p-6 flex items-center justify-between relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative z-10 max-w-[160px] space-y-1.5">
                <h3 className="text-base font-black leading-tight tracking-tight">
                  ENHANCE YOUR <br />
                  ENTERTAINMENT
                </h3>
                <p className="text-xs text-brand-400 font-bold font-mono">
                  Now at $250
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-bold group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <span>Buy Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div className="w-32 h-32 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=350&q=80"
                  alt="Entertainment"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Circular Quick Links (Matching Image 1 Bottom Bar) */}
        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {categoryCircles.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => onNavigateToShop(cat.query)}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${cat.bg} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow transition-all mb-2.5`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* POPULAR PRODUCTS SECTION (Matching Image 2 & Image 3) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight font-heading">
              Popular Products
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Recommendations For Your Lifestyle. Verified hardware stock.
            </p>
          </div>
          <button
            onClick={() => onNavigateToShop('All Products')}
            className="text-xs font-bold text-slate-900 dark:text-white hover:text-brand-500 flex items-center gap-1 transition-colors"
          >
            <span>View All Product</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {popularProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickView={(prod) => onOpenProductDetail(prod)}
            />
          ))}
        </div>
      </section>

      {/* 3 Trust Pillars Strip (Matching Image 6 Bottom) */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border-t border-b border-slate-200/80 dark:border-slate-800 py-6 my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="p-2.5 rounded-full bg-black text-white">
                <Truck className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Free Worldwide Shipping</h4>
                <p className="text-[11px] text-slate-500">Free delivery on orders over $150</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="p-2.5 rounded-full bg-black text-white">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Flexible & Safe Payment</h4>
                <p className="text-[11px] text-slate-500">Bank, Mobile Money, Cards & Crypto</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="p-2.5 rounded-full bg-black text-white">
                <RotateCcw className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">30-Day Hassle-Free Return</h4>
                <p className="text-[11px] text-slate-500">100% money-back satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
