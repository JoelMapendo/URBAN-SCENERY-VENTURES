import React, { useState } from 'react';
import { Search, Sparkles, Cpu, Zap, Shield, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onSearch: (query: string) => void;
  onOpenShoppingAssistant: () => void;
  onExploreProducts: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSearch,
  onOpenShoppingAssistant,
  onExploreProducts,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const quickPrompts = [
    'Laptops under $1200',
    'Noise-cancelling headphones',
    'Flagship smartphones',
    'High-resolution 4K monitors',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <section className="relative overflow-hidden py-14 md:py-20 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-slate-50 via-white to-slate-100/70 dark:from-urban-darker dark:via-urban-dark dark:to-urban-darker transition-colors duration-300">
      {/* Signature Logo Glow Orbs in Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-brand-500/10 dark:bg-brand-500/15 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -top-10 right-10 w-80 h-80 bg-accent-500/10 dark:bg-accent-500/12 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-slate-900/90 border border-brand-500/30 text-brand-600 dark:text-brand-300 text-xs font-bold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-accent-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI-Driven Electronics Catalogue & Shopping Agents</span>
          </div>

          {/* Heading with Logo Colors */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6 font-heading">
            Intelligent Tech for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-brand-600 to-accent-500">
              Modern Lifestyle
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover verified electronics with real-time stock, AI semantic search, budget recommendations, and 24/7 autonomous shopping guidance.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative max-w-2xl mx-auto mb-6"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="main-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search phones, laptops, audio gear or ask AI ('budget gaming rig')..."
                className="w-full pl-12 pr-32 py-4 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-xl shadow-brand-500/5 dark:shadow-black/40"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/25 flex items-center gap-1.5 hover:scale-102"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
              <Cpu className="w-3.5 h-3.5 text-brand-500" />
              <span>Try:</span>
            </span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setSearchInput(prompt);
                  onSearch(prompt);
                }}
                className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 transition-all text-xs font-medium shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreProducts}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all shadow-sm flex items-center gap-2"
            >
              <span>Explore All Products</span>
            </button>
            <button
              onClick={onOpenShoppingAssistant}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-accent-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 group hover:scale-102"
            >
              <Sparkles className="w-4 h-4 text-accent-200 group-hover:scale-110 transition-transform" />
              <span>Consult AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Feature Badges Banner */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-slate-200 dark:border-slate-800/60 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <div className="p-2.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">100% Genuine Hardware</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Direct electronics distributor warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <div className="p-2.5 rounded-lg bg-accent-500/10 text-accent-700 dark:text-accent-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Database-Grounded AI</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Accurate specs without hallucinations</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Multi-Rail Payments</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Mobile Money, Bank Transfer & Crypto</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
