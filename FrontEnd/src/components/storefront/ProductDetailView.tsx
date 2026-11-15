import React, { useState } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Share2,
  HelpCircle,
  ArrowLeft,
  Cpu,
} from 'lucide-react';
import { ProductOut } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useCartStore } from '../../store/useCartStore';

interface ProductDetailViewProps {
  product: ProductOut;
  onBack: () => void;
  onDirectBuyNow: (product: ProductOut) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onDirectBuyNow,
}) => {
  const { addItem } = useCartStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');

  const numericPrice = parseFloat(product.price) || 120;
  const originalPrice = numericPrice * 1.15;

  const thumbnails = [
    product.banner_image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
  ];
  const [selectedImg, setSelectedImg] = useState(thumbnails[0]);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-urban-darker min-h-screen text-slate-900 dark:text-white transition-colors py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </button>

        {/* ========================================================================= */}
        {/* PRODUCT TOP SECTION (Matching Image 6: Image Gallery + Specs + Buy) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          {/* Left: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] rounded-2xl bg-slate-50 dark:bg-slate-900 p-6 flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden">
              <img
                src={selectedImg}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-3">
              {thumbnails.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(t)}
                  className={`w-20 h-20 rounded-xl bg-slate-50 dark:bg-slate-900 p-2 border transition-all ${
                    selectedImg === t
                      ? 'border-black dark:border-white ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <img src={t} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Buy Panel */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Urban Scenery Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight leading-tight font-heading">
              {product.name}
            </h1>

            {/* Price & Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-950 dark:text-white font-mono">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatCurrency(originalPrice)}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200">
                IN STOCK
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">5.0</span>
              <span>(18 Reviews)</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
              {product.description ||
                'High-performance electronic hardware featuring premium manufacturing, optimal thermal management, and full brand warranty support.'}
            </p>

            {/* Meta details */}
            <div className="py-3 border-t border-b border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-500">
              <p>
                <strong className="text-slate-900 dark:text-white font-semibold">SKU:</strong>{' '}
                <span className="font-mono">USV-HW-{product.id}903</span>
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white font-semibold">Category:</strong>{' '}
                {product.category || 'High Performance Electronics'}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white font-semibold">Tags:</strong>{' '}
                Bluetooth, Hardware, Wireless, Verified
              </p>
            </div>

            {/* Quantity & Add to Cart Row */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-l-xl font-bold"
                >
                  -
                </button>
                <span className="px-3 font-mono font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-r-xl font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? 'Added to Cart' : 'Add to cart'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className={`p-3 rounded-xl border transition-all ${
                  liked
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now Full-Width Button */}
            <button
              type="button"
              onClick={() => onDirectBuyNow(product)}
              className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Pickup note */}
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Pickup Available at Urban Scenery Hub (Ready in 24 hours)</span>
            </div>

            {/* Guarantee safe checkout badge */}
            <div className="pt-2 text-center text-[11px] text-slate-400">
              <p className="mb-2 font-semibold">Guarantee Safe And Secure Checkout</p>
              <div className="flex items-center justify-center gap-3 opacity-75">
                <span className="px-2 py-0.5 rounded border border-slate-200 font-mono text-[9px] font-bold">
                  VISA
                </span>
                <span className="px-2 py-0.5 rounded border border-slate-200 font-mono text-[9px] font-bold">
                  MASTERCARD
                </span>
                <span className="px-2 py-0.5 rounded border border-slate-200 font-mono text-[9px] font-bold">
                  MOBILE MONEY
                </span>
                <span className="px-2 py-0.5 rounded border border-slate-200 font-mono text-[9px] font-bold">
                  CRYPTO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABS SECTION (Matching Image 6: Description, Specs, Shipping, Reviews) */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-10">
          <div className="flex items-center justify-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 transition-all ${
                activeTab === 'desc'
                  ? 'border-b-2 border-black dark:border-white text-slate-950 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Product Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 transition-all ${
                activeTab === 'specs'
                  ? 'border-b-2 border-black dark:border-white text-slate-950 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Additional Information
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-2 transition-all ${
                activeTab === 'shipping'
                  ? 'border-b-2 border-black dark:border-white text-slate-950 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Shipping & Return
            </button>
          </div>

          <div className="py-8 max-w-3xl mx-auto space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {activeTab === 'desc' && (
              <div className="space-y-4 animate-in fade-in">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {product.name} Specifications & Overview
                </h4>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Flexible, Secure Fit Construction For Long-Term Durability & Stability</li>
                  <li>Auto Play/Pause & Instant Connection Sensors</li>
                  <li>Precision Voice Clarity & Low Latency Performance</li>
                  <li>All-Day Battery Life With Rapid Charging Protocol</li>
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="animate-in fade-in space-y-2">
                <p>Weight: 1.4 kg</p>
                <p>Dimensions: 32 x 22 x 1.8 cm</p>
                <p>Warranty: 1 Year Official Manufacturer Warranty</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="animate-in fade-in space-y-2">
                <p>Fast dispatch within 24 hours of order receipt.</p>
                <p>Standard delivery: 2-4 business days.</p>
                <p>30-Day hassle free returns on sealed items.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
