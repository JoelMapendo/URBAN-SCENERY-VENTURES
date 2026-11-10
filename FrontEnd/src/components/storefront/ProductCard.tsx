import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Package, Cpu } from 'lucide-react';
import { ProductOut } from '../../types';
import { formatCurrency, getStatusBadge } from '../../utils/formatters';
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
  const [imgError, setImgError] = useState(false);

  const isAvailable =
    product.status === 'AVAILABLE' && (product.quantity ?? 0) > 0;
  const statusBadge = getStatusBadge(product.status);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/90 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/5 dark:hover:shadow-brand-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        {product.banner_image && !imgError ? (
          <img
            src={product.banner_image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center">
            <Cpu className="w-12 h-12 text-slate-400 group-hover:text-brand-500 transition-colors mb-2" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">
              {product.name.slice(0, 18)}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text}`}
          >
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>

          {product.quantity > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-[10px] font-mono font-semibold shadow-sm">
              {product.quantity} left
            </span>
          )}
        </div>

        {/* Quick View Hover Action */}
        <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/95 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-xl flex items-center gap-1.5 transition-all transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-3.5 h-3.5 text-brand-500" />
            <span>Quick Specs</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-brand-600 dark:text-brand-400 font-mono font-semibold mb-1">
            <Package className="w-3 h-3" />
            <span>ID #{product.id}</span>
          </div>

          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors line-clamp-2 mb-1.5 font-heading">
            {product.name}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {product.description || 'Verified electronics component with standard manufacturer warranty.'}
          </p>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
              Unit Price
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              added
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : isAvailable
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25 hover:scale-105'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700/50'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{isAvailable ? 'Add' : 'Sold Out'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
