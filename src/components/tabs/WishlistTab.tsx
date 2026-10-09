import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  ShoppingBag,
  Trash2,
  ArrowUpDown,
  ExternalLink,
  X,
  Check,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem } from '../../types';

export const WishlistTab: React.FC = () => {
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

  // Return to main wishlist page when tab is tapped
  useEffect(() => {
    setIsSettingsOpen(false);
    setSelectedItemForAction(null);
  }, [activeTab, tabResetTimestamp]);

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

  return (
    <div className="min-h-[calc(100vh-64px)] pb-24 px-4 pt-[max(8px,env(safe-area-inset-top))] max-w-md mx-auto">
      {/* Action toolbar with Filters button & Add All to Cart - Shifted upward to top, enlarged for mobile */}
      <div className="flex items-center justify-between px-1 mb-2 pt-1 text-xs">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
          } border text-xs font-bold transition-colors shadow-sm min-h-[42px]`}
          title="Wishlist Filters"
        >
          <SlidersHorizontal className={`w-4 h-4 ${isLight ? 'text-slate-800' : 'text-slate-300'}`} />
          <span>Filters{categoryFilter.length > 0 ? ` (${categoryFilter.join(', ')})` : ''}</span>
        </button>

        {wishlistItems.length > 0 && (
          <button
            onClick={addAllWishlistToCart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors shadow-sm min-h-[42px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All to Cart</span>
          </button>
        )}
      </div>

      {/* Spacer maintaining exact spacing between header and cards without gradient underline */}
      <div className="mb-4 h-0" />

      {/* 3x3 Grid matching the exact sketch from IMG_0313 (right) with silver border frames! */}
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

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                {/* Price tag in bottom right of image */}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-slate-800 text-[10px] font-mono font-bold text-white">
                  ${item.price}
                </div>

                {/* Match score pill in top left */}
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

                {/* Quick Add to Cart Button */}
                <div className={`mt-2 pt-1 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'} flex items-center justify-between`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                      showToast(`Added ${item.name} to cart`, `$${item.price} • ${item.brand}`, 'green');
                    }}
                    className="w-full py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold flex items-center justify-center gap-1 transition-colors shadow-sm active:scale-95"
                  >
                    <ShoppingBag className="w-2.5 h-2.5" />
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
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} mb-1`}>Your wishlist is empty</h3>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-4 max-w-xs mx-auto`}>
            Swipe right on clothes you love in the Swipe tab to save them here.
          </p>
          <button
            onClick={() => setActiveTab('swipe')}
            className="px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-black transition-colors shadow-lg shadow-pink-600/25"
          >
            Start Swiping
          </button>
        </div>
      )}

      {/* Item Action Modal (When tapping an item in the 3x3 grid) */}
      {selectedItemForAction && (
        <div
          onClick={() => setSelectedItemForAction(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
                : 'bg-slate-950 border-slate-700 text-white shadow-2xl'
            } border rounded-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto overscroll-contain my-auto cursor-default relative`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setSelectedItemForAction(null)}
              className={`sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              } border backdrop-blur-md shadow-lg transition-all`}
              title="Close window"
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

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  addToCart(selectedItemForAction);
                  setSelectedItemForAction(null);
                  showToast(`Added ${selectedItemForAction.name} to cart`, 'Ready for checkout', 'green');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart (${selectedItemForAction.price})</span>
              </button>

              <button
                onClick={() => {
                  setSendItemModalItem(selectedItemForAction);
                  setSelectedItemForAction(null);
                }}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isLight
                    ? 'border-slate-300 bg-white text-slate-700 hover:text-pink-600 hover:border-pink-600'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-pink-400 hover:border-pink-500'
                }`}
                title="Send to Friend via Chat"
              >
                <Send className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  removeItemFromWishlist(selectedItemForAction.id);
                  setSelectedItemForAction(null);
                }}
                className="p-2.5 rounded-xl border border-red-500/40 bg-red-950/20 text-red-400 hover:bg-red-950/40 transition-colors"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Settings Modal */}
      {isSettingsOpen && (
        <div
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
                : 'bg-slate-950 border-slate-700 text-white shadow-2xl'
            } border rounded-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto overscroll-contain my-auto cursor-default relative`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setIsSettingsOpen(false)}
              className={`sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              } border backdrop-blur-md shadow-lg transition-all`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`flex items-center pb-2 border-b ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'} pr-10`}>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" style={{ stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }} />
                <span>Wishlist Filters</span>
              </h3>
            </div>

            {/* Category Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Category
                </label>
                <span className="text-[10px] font-mono font-bold text-pink-600">
                  {categoryFilter.length === 0 ? 'All Categories' : categoryFilter.join(', ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'outerwear', 'tops', 'bottoms', 'knitwear', 'footwear', 'accessories'].map((cat) => {
                  const isAll = cat === 'all';
                  const isSelected = isAll
                    ? categoryFilter.length === 0
                    : categoryFilter.some((c) => c.toLowerCase() === cat.toLowerCase());

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                        isSelected
                          ? isLight
                            ? 'border-pink-600 bg-pink-50 text-pink-600 font-bold shadow-sm'
                            : 'border-pink-600 bg-pink-950/60 text-pink-600 font-bold'
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
                          ? 'border-pink-600 bg-pink-50 text-pink-600 font-bold shadow-sm'
                          : 'border-pink-600 bg-pink-950/60 text-pink-600 font-bold'
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
