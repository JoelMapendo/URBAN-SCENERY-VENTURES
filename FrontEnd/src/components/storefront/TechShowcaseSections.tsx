import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Gift,
  Mail,
  CheckCircle2,
  Check,
  ShieldCheck,
  Award,
  Star,
  Zap,
} from 'lucide-react';

interface TechShowcaseSectionsProps {
  onSelectIdea: (query: string) => void;
  onExploreDeals: () => void;
}

export const TechShowcaseSections: React.FC<TechShowcaseSectionsProps> = ({
  onSelectIdea,
  onExploreDeals,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const upgradeIdeas = [
    {
      id: 'setup',
      title: 'Tech Setup Ideas',
      count: '128 Ideas',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
      query: 'laptop monitor',
    },
    {
      id: 'travel',
      title: 'Travel Tech Essentials',
      count: '96 Ideas',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
      query: 'wireless charger audio',
    },
    {
      id: 'smart-home',
      title: 'Smart Home Inspiration',
      count: '74 Ideas',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80',
      query: 'smart speaker display',
    },
    {
      id: 'gaming',
      title: 'Gaming Gear',
      count: '155 Ideas',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
      query: 'gaming display 4k',
    },
    {
      id: 'minimal',
      title: 'Minimal Desk Setup',
      count: '87 Ideas',
      image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&q=80',
      query: 'accessories keyboard',
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmailInput('');
      }, 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* ========================================================================= */}
      {/* SECTION 1: IDEAS FOR YOUR NEXT UPGRADE (Matching Reference 2) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              Ideas for Your Next Upgrade
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curated tech concepts, battle-tested workstations, and lifestyle aesthetics
            </p>
          </div>

          <button
            onClick={() => onSelectIdea('setup')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>See more ideas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 5-Column Grid with Curated Photos and Idea Count Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {upgradeIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => onSelectIdea(idea.query)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
            >
              <img
                src={idea.image}
                alt={idea.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Bottom Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-white leading-snug drop-shadow-sm">
                    {idea.title}
                  </h3>
                  <span className="text-[10px] text-white/80 font-mono font-medium">
                    {idea.count}
                  </span>
                </div>

                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-brand-500 transition-colors shadow-sm">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: EXCLUSIVE DEALS BANNER & NEWSLETTER (Matching Reference 2) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Exclusive Deals Promo Card */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-rose-600 p-8 text-white relative overflow-hidden shadow-xl shadow-brand-500/20 flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-accent-300 shadow-sm">
              <Gift className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-accent-200 font-bold">
                Limited Time Promo
              </span>
              <h3 className="text-2xl font-black font-heading mt-1 leading-tight">
                Exclusive Deals <br />for You!
              </h3>
              <p className="text-xs text-brand-100 mt-2 max-w-sm leading-relaxed">
                Save up to 35% on top-rated hardware, AI workstations, and verified flagship audio handpicked by our autonomous agents.
              </p>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={onExploreDeals}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-brand-600 text-xs font-black shadow-lg transition-all flex items-center gap-2 hover:scale-102"
            >
              <span>Shop Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Newsletter Signup with Tech Visual */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-urban-dark border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 text-xs font-bold border border-accent-200 dark:border-accent-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weekly Hardware Drops</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              Get the Latest Tech & Deals
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Join our VIP community. Receive instant notifications when rare electronics drop, plus exclusive coupon codes.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </form>
          </div>

          {/* Envelope & Pin Visual Accent */}
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-brand-500/10 to-accent-500/10 border border-slate-200 dark:border-slate-800 flex items-center justify-center flex-shrink-0 p-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Mail className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: BOTTOM TRUST BADGES (Reference 2) */}
      {/* ========================================================================= */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-brand-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">100% Authentic</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Genuine products only</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-accent-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Trusted by Thousands</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Loved worldwide</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Top Rated Store</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Verified 4.9★ reviews</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Price Match Guarantee</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Best prices, always</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

