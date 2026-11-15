import React, { useState } from 'react';
import { Heart, ArrowRight, Eye, Check, Cpu, ShieldCheck } from 'lucide-react';
import { ProductOut } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useCartStore } from '../../store/useCartStore';

interface ProductCardProps {
  product: ProductOut;
  onQuickView: (product: ProductOut) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
}) => {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isAvailable =
    product.status === 'AVAILABLE' && (product.quantity ?? 0) > 0;

  const numericPrice = parseFloat(product.price) || 0;
  const discountPct = ((product.id * 7) % 15) + 10;
  const hasDiscount = product.id % 2 === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full rounded-lg bg-slate-50 dark:bg-slate-950/60 p-4 flex items-center justify-center overflow-hidden">
        {/* Subtle Warranty Badge or Discount Pill (matching reference image) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.id % 3 === 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[9px] font-bold">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>1 Yr</span>
            </span>
          )}
          {hasDiscount && (
            <span className="px-1.5 py-0.5 rounded bg-brand-500 text-white text-[9px] font-extrabold shadow-sm">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleToggleLike}
          aria-label="Wishlist"
          className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            liked
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-brand-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
        </button>

        {product.banner_image && !imgError ? (
          <img
            src={product.banner_image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Cpu className="w-10 h-10 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors mb-1" />
            <span className="text-[10px] font-mono text-slate-400">
              {product.name.slice(0, 14)}
            </span>
          </div>
        )}

        {/* Quick View Pill on Hover */}
        <div className="absolute inset-x-2 bottom-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-1.5 rounded-lg bg-black/85 hover:bg-black text-white text-[11px] font-bold flex items-center justify-center gap-1.5 backdrop-blur-sm transition-all"
          >
            <Eye className="w-3 h-3 text-brand-400" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors min-h-[32px]">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Button (Matching Reference) */}
        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-slate-950 dark:text-white font-mono">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            title={added ? 'Added to Cart' : 'Add to Cart'}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-500 text-white shadow-sm'
                : isAvailable
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white group-hover:border-brand-500 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {added ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
