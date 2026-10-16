import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  ShoppingBag,
  Trash2,
  ArrowUpDown,
  ExternalLink,
  X,
  Check,
  Send,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem } from '../../types';

interface WishlistTabProps {
  onClose?: () => void;
  isOverlay?: boolean;
  onPullChange?: (pullY: number) => void;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({ onClose, isOverlay = false, onPullChange }) => {
  const {
    wishlistItems,
    removeItemFromWishlist,
    addToCart,
    addAllWishlistToCart,
    setActiveTab,
    activeTab,
    tabResetTimestamp,
    userProfile,
    showToast,
    setSendItemModalItem,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<ClothingItem | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'match'>('match');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // Pull down to exit gesture (Instagram vanish mode DM behavior)
  const [pullY, setPullY] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartY = useRef(0);
  const isPullingDown = useRef<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 70;

  const updatePull = (val: number) => {
    setPullY(val);
    onPullChange?.(val);
  };

  // Return to main wishlist page when tab is tapped
  useEffect(() => {
    setIsSettingsOpen(false);
    setSelectedItemForAction(null);
  }, [activeTab, tabResetTimestamp]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onClose || isDismissing) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    const scrollTop = scrollContainerRef.current ? scrollContainerRef.current.scrollTop : window.scrollY;
    touchStartY.current = scrollTop <= 2 ? touch.clientY : 0;
    isPullingDown.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onClose || isDismissing || touchStartY.current === 0) return;
    const touch = e.touches[0];
    const dy = touch.clientY - touchStartY.current;
    const dx = touch.clientX - touchStartPos.current.x;

    // Only vertical downward pull from top
    if (dy > 8 && dy > Math.abs(dx) * 1.5) {
      isPullingDown.current = true;
      const damped = Math.min(dy * 0.45, 130);
      updatePull(damped);
    } else if (dy <= 0) {
      updatePull(0);
      isPullingDown.current = false;
    }
  };

  const handleTouchEnd = () => {
    if (!onClose || isDismissing) return;

    if (isPullingDown.current && pullY >= PULL_THRESHOLD) {
      // Threshold reached! Confirm vanish mode exit down
      setIsDismissing(true);
      updatePull(140);
      setTimeout(() => {
        onClose();
        updatePull(0);
        setIsDismissing(false);
      }, 220);
    } else {
      // Smoothly spring back
      updatePull(0);
    }

    touchStartY.current = 0;
    isPullingDown.current = false;
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'all') {
      setCategoryFilter([]);
      return;
    }
    setCategoryFilter((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === cat.toLowerCase());
      if (exists) {
        return prev.filter((c) => c.toLowerCase() !== cat.toLowerCase());
      } else {
        return [...prev, cat];
      }
    });
  };

  // Filter and sort items (multi-category support, lumping dresses into tops)
  const filteredItems = wishlistItems.filter((item) => {
    if (categoryFilter.length === 0 || categoryFilter.includes('all')) return true;
    const cat = item.category.toLowerCase() === 'dresses' ? 'tops' : item.category.toLowerCase();
    return categoryFilter.some(
      (c) => c.toLowerCase() === cat || c.toLowerCase() === item.category.toLowerCase()
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
    return 0;
  });

  const pullProgress = Math.min(1, pullY / PULL_THRESHOLD);

  return (
    <div
      ref={scrollContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isDismissing
          ? 'translate3d(0, 100%, 0)'
          : pullY > 0
          ? `translate3d(0, ${pullY}px, 0)`
          : undefined,
        transition: isDismissing
          ? 'transform 200ms ease-out, opacity 200ms ease-out'
          : pullY === 0
          ? 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)'
          : 'none',
        opacity: isDismissing ? 0 : 1,
      }}
      className={`min-h-[calc(100vh-64px)] pb-32 px-4 ${
        isOverlay ? 'pt-3' : 'pt-[max(8px,env(safe-area-inset-top))]'
      } max-w-md mx-auto relative`}
    >
      {/* 1. Instagram Vanish Mode Style Pull-Down Exit Indicator (stays high up, simple exit label) */}
      {isOverlay && (
        <div
          className="sticky top-1 z-30 flex flex-col items-center justify-center pointer-events-none py-0.5 transition-opacity duration-150"
          style={{
            opacity: pullY > 4 ? Math.min(1, (pullY - 4) / 22) : 0,
          }}
        >
          <div
            className={`rounded-full transition-all duration-200 flex items-center justify-center shadow-xl relative ${
              pullY >= PULL_THRESHOLD
                ? 'w-10 h-10 bg-slate-900 border-2 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.7)] scale-105'
                : 'w-9 h-9 bg-slate-950/95 border-2 border-slate-700/80 shadow-md scale-95'
            }`}
            style={{
              transform: `scale(${0.8 + pullProgress * 0.25}) rotate(${pullProgress * 90}deg)`,
            }}
          >
            {/* SVG Circular Fill Progress Meter around the exit X */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r="14"
                fill="none"
                stroke={pullY >= PULL_THRESHOLD ? '#34d399' : '#64748b'}
                strokeWidth="2.5"
                strokeDasharray="88"
                strokeDashoffset={88 - pullProgress * 88}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            </svg>
            <X
              className={`transition-colors relative z-10 ${
                pullY >= PULL_THRESHOLD
                  ? 'w-4 h-4 text-emerald-300 stroke-[3]'
                  : 'w-3.5 h-3.5 text-slate-300 stroke-[2.2]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 transition-colors ${
              pullY >= PULL_THRESHOLD
                ? 'text-emerald-400 font-black drop-shadow'
                : 'text-slate-400'
            }`}
          >
            exit
          </span>
        </div>
      )}


      {/* Action toolbar with Filters button & Add All to Cart */}
      <div className="flex items-center justify-between px-1 mb-2 pt-1 text-xs">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${
            categoryFilter.length > 0
              ? isLight
                ? 'cosmic-gradient-border-light text-slate-800 bg-white'
                : 'cosmic-gradient-border text-white bg-slate-900'
              : isLight
              ? 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
          } border text-xs font-bold transition-all shadow-sm min-h-[44px] cursor-pointer`}
          title="Wishlist Filters"
        >
          <SlidersHorizontal
            className={`w-4 h-4 ${categoryFilter.length === 0 ? (isLight ? 'text-slate-800' : 'text-slate-300') : ''}`}
            style={
              categoryFilter.length > 0
                ? { stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }
                : undefined
            }
          />
          <span>
            Filters
            {categoryFilter.length === 0
              ? ''
              : categoryFilter.length === 1
              ? ` (${categoryFilter[0]})`
              : ` (${categoryFilter.length})`}
          </span>
        </button>

        {wishlistItems.length > 0 && (
          <button
            onClick={addAllWishlistToCart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors shadow-sm min-h-[44px] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All to Cart</span>
          </button>
        )}
      </div>

      <div className="mb-4 h-0" />

      {/* 3x3 Grid matching sketch with silver frames */}
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemForAction(item)}
              className={`group relative flex flex-col rounded-2xl overflow-hidden ${
                isLight
                  ? 'bg-white border-2 border-slate-200 hover:border-slate-400 shadow-sm'
                  : 'bg-slate-950 border-2 border-slate-700 hover:border-slate-400 shadow-md hover:shadow-black/60'
              } transition-all duration-200 cursor-pointer`}
            >
              {/* Product Image Square */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-slate-800 text-[10px] font-mono font-bold text-white">
                  ${item.price}
                </div>

                {item.matchScore && (
                  <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-full ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-[9px] font-mono font-bold text-white shadow-sm`}>
                    {item.matchScore}%
                  </div>
                )}
              </div>

              {/* Garment Details / Brand Bar */}
              <div className={`p-2 flex-1 flex flex-col justify-between ${
                isLight
                  ? 'bg-white border-t border-slate-200'
                  : 'bg-slate-900/90 border-t border-slate-800'
              }`}>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} truncate`}>
                    {item.brand}
                  </p>
                  <p className={`text-[11px] font-bold ${isLight ? 'text-sky-950' : 'text-white'} truncate leading-tight mt-0.5`}>
                    {item.name}
                  </p>
                </div>

                {/* Quick Add to Cart Button - Automatically removes from wishlist since added to cart */}
                <div className={`mt-2 pt-1 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'} flex items-center justify-between`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                      removeItemFromWishlist(item.id);
                    }}
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold flex items-center justify-center gap-1 transition-colors shadow-sm active:scale-95 cursor-pointer min-h-[30px]"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={`rounded-2xl border ${isLight ? 'border-slate-200 bg-slate-100' : 'border-slate-800 bg-slate-900/60'} p-8 text-center mt-6`}>
          <div className={`w-12 h-12 rounded-full ${isLight ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 text-slate-400'} flex items-center justify-center mx-auto mb-3`}>
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} mb-1`}>No saved pieces yet</h3>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-4 max-w-xs mx-auto`}>
            Tap the bookmark ribbon on items in the Swipe tab to save them here.
          </p>
          {onClose ? (
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-full ${
                isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'
              } hover:opacity-95 text-white text-xs font-black transition-all shadow-lg cursor-pointer`}
            >
              Back to Swiping
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('swipe')}
              className={`px-5 py-2.5 rounded-full ${
                isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'
              } hover:opacity-95 text-white text-xs font-black transition-all shadow-lg cursor-pointer`}
            >
              Start Swiping
            </button>
          )}
        </div>
      )}

      {/* Item Action Modal - Positioned near top of screen */}
      {selectedItemForAction && (
        <div
          onClick={() => setSelectedItemForAction(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-[max(12px,calc(env(safe-area-inset-top)+8px))] overflow-y-auto overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
            } border rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative animate-in zoom-in-95 duration-200 cursor-default mt-2 sm:mt-4 mb-20 max-h-[88vh] overflow-y-auto overscroll-contain`}
          >
            <button
              onClick={() => setSelectedItemForAction(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-10">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                {selectedItemForAction.brand}
              </span>
              <h3 className={`text-base font-extrabold ${isLight ? 'text-sky-950' : 'text-white'}`}>{selectedItemForAction.name}</h3>
            </div>

            <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={selectedItemForAction.image}
                alt={selectedItemForAction.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-sm text-xs font-mono font-bold text-white border border-white/20">
                ${selectedItemForAction.price}
              </span>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} leading-relaxed`}>
              {selectedItemForAction.description}
            </p>

            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                Fit: {selectedItemForAction.fit}
              </span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                Fabric: {selectedItemForAction.material.split(' ')[0]}
              </span>
            </div>

            {/* Actions: Add to Cart removes from wishlist */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  addToCart(selectedItemForAction);
                  removeItemFromWishlist(selectedItemForAction.id);
                  setSelectedItemForAction(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer min-h-[42px]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  setSendItemModalItem(selectedItemForAction);
                  setSelectedItemForAction(null);
                }}
                className="px-3 py-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/40 text-xs font-bold flex items-center justify-center gap-1 transition-colors min-h-[42px]"
                title="Send to Friend"
              >
                <Send className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  removeItemFromWishlist(selectedItemForAction.id);
                  setSelectedItemForAction(null);
                }}
                className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors flex items-center justify-center min-h-[42px]"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter / Sort Settings Modal - Positioned near top of screen */}
      {isSettingsOpen && (
        <div
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-[max(12px,calc(env(safe-area-inset-top)+8px))] overflow-y-auto overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
            } border rounded-2xl max-w-sm w-full p-4 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200 cursor-default mt-2 sm:mt-4 mb-20 max-h-[88vh] overflow-y-auto overscroll-contain`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Wishlist Filter & Sort
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className={`p-1.5 rounded-full ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Filter by Category
                </label>
                {categoryFilter.length > 0 && (
                  <button
                    onClick={() => setCategoryFilter([])}
                    className="text-[10px] font-bold text-pink-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Tops', 'Outerwear', 'Bottoms', 'Footwear', 'Accessories', 'Knitwear'].map((cat) => {
                  const isAll = cat === 'All';
                  const isSelected = isAll
                    ? categoryFilter.length === 0
                    : categoryFilter.some((c) => c.toLowerCase() === cat.toLowerCase());

                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat.toLowerCase())}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? isLight
                            ? 'cosmic-gradient-bg-light text-white font-bold shadow-sm shadow-pink-600/30'
                            : 'cosmic-gradient-bg text-white font-bold shadow-sm shadow-pink-600/40'
                          : isLight
                          ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1`}>
                Sort Items By
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'match', label: 'Match Score %' },
                  { id: 'price-asc', label: 'Price: Low to High' },
                  { id: 'price-desc', label: 'Price: High to Low' },
                  { id: 'recent', label: 'Recently Added' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as typeof sortBy)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      sortBy === s.id
                        ? isLight
                          ? 'cosmic-gradient-bg-light text-white font-bold shadow-sm shadow-pink-600/30'
                          : 'cosmic-gradient-bg text-white font-bold shadow-sm shadow-pink-600/40'
                        : isLight
                        ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'border-slate-800 bg-slate-900 text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => {
                  addAllWishlistToCart();
                  setIsSettingsOpen(false);
                  if (onClose) onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
              >
                Move All ({wishlistItems.length}) to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
