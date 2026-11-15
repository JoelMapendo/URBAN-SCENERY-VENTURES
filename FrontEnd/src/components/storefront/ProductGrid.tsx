import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Sparkles,
  ShoppingBag,
  Check,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { ProductOut } from '../../types';
import { api } from '../../services/api';
import { ProductCard } from './ProductCard';
import { ProductQuickView } from './ProductQuickView';
import { useCartStore } from '../../store/useCartStore';
import { DEFAULT_PRODUCTS } from '../../data/defaultProducts';
import { formatCurrency } from '../../utils/formatters';

interface ProductGridProps {
  initialSearchQuery?: string;
  onClearInitialSearch?: () => void;
  onOpenShoppingAssistant?: (topic?: string) => void;
  onOpenProductDetail?: (product: ProductOut) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  initialSearchQuery = '',
  onClearInitialSearch,
  onOpenShoppingAssistant,
  onOpenProductDetail,
}) => {
  const [products, setProducts] = useState<ProductOut[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [search, setSearch] = useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState<string>('All Products');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [selectedWarranty, setSelectedWarranty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'newest'>('default');

  // Mobile drawer states
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // QuickView modal
  const [selectedProduct, setSelectedProduct] = useState<ProductOut | null>(null);

  const { addItem } = useCartStore();
  const [promoAdded, setPromoAdded] = useState(false);

  // Categories matching Reference Image ("Electro mart")
  const sidebarCategories = [
    { name: 'All Products', query: '' },
    { name: 'Smart Phones', query: 'phone' },
    { name: 'Laptops & Tablets', query: 'laptop' },
    { name: 'Audio & Video', query: 'audio' },
    { name: 'Gaming Accessories', query: 'gaming' },
    { name: 'Smart Tech', query: 'smart' },
    { name: 'Accessories', query: 'accessories' },
  ];

  const brandOptions = [
    { name: 'Apple', count: 8 },
    { name: 'Sony', count: 6 },
    { name: 'Samsung', count: 7 },
    { name: 'Bose', count: 4 },
    { name: 'Dell', count: 5 },
    { name: 'Lenovo', count: 4 },
    { name: 'Xiaomi', count: 3 },
    { name: 'Logitech', count: 5 },
  ];

  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF', border: true },
    { name: 'Pink', hex: '#E6007E' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Silver', hex: '#94A3B8' },
    { name: 'Midnight', hex: '#1E293B' },
  ];

  // Sync external search query
  useEffect(() => {
    if (initialSearchQuery !== undefined && initialSearchQuery !== search) {
      setSearch(initialSearchQuery);
      setCurrentPage(1);
    }
  }, [initialSearchQuery]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const catObj = sidebarCategories.find((c) => c.name === activeCategory);
    let effectiveSearch = search.trim();
    if (catObj && catObj.query && !effectiveSearch) {
      effectiveSearch = catObj.query;
    }

    try {
      const res = await api.listProducts({
        search: effectiveSearch || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        offset: 0,
        limit: 100, // Fetch pool to sort & paginate cleanly on client
      });
      if (res && res.length > 0) {
        setProducts(res);
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch (err: any) {
      console.warn('Using verified stock catalog fallback:', err);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side brand filter and sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by Brand if selected
    if (selectedBrands.length > 0) {
      list = list.filter((p) =>
        selectedBrands.some((b) =>
          p.name.toLowerCase().includes(b.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(b.toLowerCase()))
        )
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [products, selectedBrands, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const toggleBrand = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
    setCurrentPage(1);
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    setMaxPrice(priceRange.toString());
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setActiveCategory('All Products');
    setSelectedBrands([]);
    setSelectedColor(null);
    setMinPrice('');
    setMaxPrice('');
    setPriceRange(3000);
    setSelectedWarranty(null);
    setCurrentPage(1);
    if (onClearInitialSearch) onClearInitialSearch();
  };

  return (
    <div className="bg-white dark:bg-urban-darker min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Breadcrumb & Main Header Title ("All Products" as seen in Electro Mart Reference) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Home</span>
              <span>/</span>
              <span>Shop</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium">{activeCategory}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeCategory}
            </h1>
          </div>

          {/* Quick Active Filters tags if any */}
          {(selectedBrands.length > 0 || maxPrice || search) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Active:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  "{search}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                </span>
              )}
              {selectedBrands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                >
                  {b}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleBrand(b)} />
                </span>
              ))}
              <button
                onClick={handleClearFilters}
                className="text-xs text-brand-500 hover:underline font-semibold ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container: 2-Column Desktop Layout (Sidebar + Products Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter & Category Trigger Buttons (Reference Mobile View) */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <button
            onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-between border border-slate-200 dark:border-slate-700"
          >
            <span>Category: {activeCategory}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Mobile Dropdown for Categories */}
        {mobileCategoryOpen && (
          <div className="lg:hidden mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1 animate-in fade-in">
            {sidebarCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setCurrentPage(1);
                  setMobileCategoryOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat.name
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: Categories, Filters, Promo Card (Reference Image Layout) */}
          {/* ========================================================================= */}
          <aside
            className={`${
              mobileFilterOpen
                ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-y-auto block'
                : 'hidden lg:block'
            } w-full lg:w-64 flex-shrink-0 space-y-7`}
          >
            {mobileFilterOpen && (
              <div className="lg:hidden flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Filter Products</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* 1. Categories Block */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                Categories
              </h3>
              <ul className="space-y-1.5 text-xs">
                {sidebarCategories.map((cat) => {
                  const isActive = activeCategory === cat.name;
                  return (
                    <li key={cat.name}>
                      <button
                        onClick={() => {
                          setActiveCategory(cat.name);
                          setCurrentPage(1);
                          if (mobileFilterOpen) setMobileFilterOpen(false);
                        }}
                        className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                          isActive
                            ? 'text-brand-600 dark:text-brand-400 font-bold bg-brand-50/50 dark:bg-brand-500/10'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 2. Filter by Brand */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                Brand
              </h3>
              <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
                {brandOptions.map((brand) => {
                  const isChecked = selectedBrands.includes(brand.name);
                  return (
                    <label
                      key={brand.name}
                      className="flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brand.name)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                        />
                        <span className={isChecked ? 'font-bold text-slate-900 dark:text-white' : ''}>
                          {brand.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">({brand.count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Filter by Color Swatches */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                Color
              </h3>
              <div className="flex items-center gap-2.5 flex-wrap">
                {colorOptions.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(isSelected ? null : c.name)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        c.border ? 'border border-slate-300 dark:border-slate-600' : ''
                      } ${isSelected ? 'scale-125 ring-2 ring-brand-500 ring-offset-2' : 'hover:scale-110'}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* 4. Price Slider Filter */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Price
              </h3>
              <form onSubmit={handleApplyPrice} className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span>Price: $0 - ${priceRange}</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 rounded-lg bg-black hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Apply
                </button>
              </form>
            </div>

            {/* 5. Warranty Filter */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Warranty
              </h3>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {['1 Year (12)', '2 Year (8)'].map((w) => (
                  <label key={w} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWarranty === w}
                      onChange={() => setSelectedWarranty(selectedWarranty === w ? null : w)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                    />
                    <span>{w}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 6. Promotional Banner Card (Matching Samsung Galaxy Buds card in Reference Image) */}
            <div className="rounded-2xl p-5 bg-gradient-to-b from-brand-50/70 via-white to-pink-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-brand-200/60 dark:border-slate-800 text-center shadow-sm relative overflow-hidden">
              <span className="text-[10px] font-bold tracking-widest text-brand-600 dark:text-brand-400 uppercase font-mono block mb-1">
                Featured Deal
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 leading-tight">
                Galaxy Buds Pro
              </h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-3">
                Starting at $149*
              </p>
              <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80"
                  alt="Galaxy Buds Pro"
                  className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">
                Free wireless charger pad on orders today.
              </p>
              <button
                type="button"
                onClick={() => {
                  addItem({
                    id: 999,
                    name: 'Samsung Galaxy Buds Pro',
                    price: '149.00',
                    quantity: 15,
                    status: 'AVAILABLE',
                    category: 'Audio',
                    banner_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80',
                  });
                  setPromoAdded(true);
                  setTimeout(() => setPromoAdded(false), 1500);
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                  promoAdded
                    ? 'bg-emerald-500 text-white'
                    : 'bg-black hover:bg-brand-600 text-white hover:scale-102'
                }`}
              >
                {promoAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to cart</span>
                  </>
                )}
              </button>
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-brand-500 text-white text-xs font-bold"
              >
                Apply & View Products
              </button>
            )}
          </aside>

          {/* ========================================================================= */}
          {/* RIGHT MAIN AREA: Products Count, Sort Dropdown, 4-Col Grid, Pagination */}
          {/* ========================================================================= */}
          <main className="flex-1">
            {/* Products Sub-Header Bar (Matching Reference Image) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Products
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({filteredProducts.length} items)
                </span>
              </div>

              {/* Sort By Dropdown (Reference Image: "Sort By: Default / Price / Newest") */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="default">Featured / Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold">Unable to load catalog</h4>
                  <p className="text-xs mt-0.5 text-rose-600 dark:text-rose-300/90">{error}</p>
                </div>
                <button
                  onClick={() => fetchProducts()}
                  className="px-3 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 space-y-3 animate-pulse"
                  >
                    <div className="aspect-square w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* 4-Column Product Grid (Matching Reference Image) */}
            {!loading && paginatedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => {
                      if (onOpenProductDetail) {
                        onOpenProductDetail(p);
                      } else {
                        setSelectedProduct(p);
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && paginatedProducts.length === 0 && !error && (
              <div className="text-center py-16 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  No products found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Try clearing your brand or price filters to see more electronics.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl bg-black hover:bg-brand-600 text-white text-xs font-bold transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Numbered Pagination (Matching Reference Image `1 2 3 ... 10`) */}
            {!loading && filteredProducts.length > itemsPerPage && (
              <div className="mt-10 flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;

                  // Render first 3, last, or nearby
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-black text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="px-1 text-slate-400 text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Related Products Section (Matching Reference Image 5) */}
        <section className="mt-16 pt-12 border-t border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight font-heading">
                Related Products
              </h3>
              <p className="text-xs text-slate-500 mt-1">Recommendations For Your Lifestyle.</p>
            </div>
            <button
              onClick={() => {
                setActiveCategory('All Products');
                setSelectedBrands([]);
                setSelectedColor(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 flex items-center gap-1 transition-colors"
            >
              <span>View All Product</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenProductDetail && onOpenProductDetail(item)}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-950/60 p-4 flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src={item.banner_image}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1 mb-2">
                    {item.name}
                  </h4>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono font-bold text-slate-950 dark:text-white">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(item, 1);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onViewDetails={onOpenProductDetail}
        />
      )}
    </div>
  );
};
