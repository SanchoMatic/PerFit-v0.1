import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShoppingBag,
  Trash2,
  ArrowUpDown,
  ExternalLink,
  X,
  Check,
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
  } = useApp();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<ClothingItem | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'match'>('match');

  // Return to main wishlist page when tab is tapped
  useEffect(() => {
    setIsSettingsOpen(false);
    setSelectedItemForAction(null);
  }, [activeTab, tabResetTimestamp]);

  // Sorted items
  const sortedItems = [...wishlistItems].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
    return 0;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Top Header - Exact match to sketch with Gear icon */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Wishlist
          </h1>
        </div>

        {/* Gear Icon (matching sketch 1 right top) */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors shadow-sm"
          title="Wishlist Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Bulk action toolbar - ('curated pieces' text removed as requested) */}
      {wishlistItems.length > 0 && (
        <div className="flex items-center justify-end px-1 mb-3 text-xs">
          <button
            onClick={addAllWishlistToCart}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-[11px] font-bold hover:bg-slate-700 transition-colors"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Add All to Cart</span>
          </button>
        </div>
      )}

      {/* 3x3 Grid matching the exact sketch from IMG_0313 (right) with silver border frames! */}
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemForAction(item)}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 hover:border-slate-400 transition-all duration-200 cursor-pointer shadow-md hover:shadow-black/60"
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
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[9px] font-mono font-bold text-emerald-300">
                    {item.matchScore}%
                  </div>
                )}
              </div>

              {/* Garment Details / Brand Bar (Silver and Black) */}
              <div className="p-2 flex-1 flex flex-col justify-between bg-slate-900/90 border-t border-slate-800">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 truncate">
                    {item.brand}
                  </p>
                  <p className="text-[11px] font-bold text-slate-100 truncate leading-tight mt-0.5">
                    {item.name}
                  </p>
                </div>

                {/* Quick Add to Cart Button */}
                <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="w-full py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold flex items-center justify-center gap-1 transition-colors"
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
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center mt-6">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <ShoppingBag className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
            Swipe right on clothes you love in the Swipe tab to save them here.
          </p>
          <button
            onClick={() => setActiveTab('swipe')}
            className="px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Start Swiping
          </button>
        </div>
      )}

      {/* Item Action Modal (When tapping an item in the 3x3 grid) */}
      {selectedItemForAction && (
        <div
          onClick={() => setSelectedItemForAction(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-700 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                  {selectedItemForAction.brand}
                </span>
                <h3 className="text-base font-extrabold">{selectedItemForAction.name}</h3>
              </div>
              <button
                onClick={() => setSelectedItemForAction(null)}
                className="p-1 rounded-full bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={selectedItemForAction.image}
                alt={selectedItemForAction.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-xs font-mono font-bold text-emerald-400">
                ${selectedItemForAction.price}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedItemForAction.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Fit: {selectedItemForAction.fit}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Fabric: {selectedItemForAction.material.split(' ')[0]}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  addToCart(selectedItemForAction);
                  setSelectedItemForAction(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart (${selectedItemForAction.price})</span>
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-700 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white">Wishlist Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-full bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
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
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-400'
                        : 'border-slate-800 bg-slate-900 text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  addAllWishlistToCart();
                  setIsSettingsOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors"
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
