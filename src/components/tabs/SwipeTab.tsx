import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  SlidersHorizontal,
  ThumbsDown,
  ThumbsUp,
  RotateCcw,
  Sparkles,
  Check,
  ShoppingBag,
  Heart,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem } from '../../types';
import { TRENDING_AESTHETICS_25 } from '../../data/aesthetics';

export const SwipeTab: React.FC = () => {
  const {
    filteredCatalog,
    swipe,
    undoLastSwipe,
    canUndo,
    resetDeck,
    brandFilter,
    setBrandFilter,
    categoryFilter,
    setCategoryFilter,
    aestheticFilter,
    setAestheticFilter,
    genderFilter,
    setGenderFilter,
    itemTypeFilter,
    setItemTypeFilter,
    sizeFilter,
    setSizeFilter,
    priceRangeFilter,
    setPriceRangeFilter,
    swipesToday,
    swipeLimitBypassed,
    bypassSwipeLimit,
    userProfile,
    addToCart,
    isItemInWishlist,
    toggleWishlist,
    setActiveTab,
    activeTab,
    tabResetTimestamp,
  } = useApp();

  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [tossState, setTossState] = useState<'like' | 'dislike' | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);

  // Reset any modals/menus when tapping the Swipe tab
  useEffect(() => {
    setInspectItem(null);
    setIsFilterModalOpen(false);
    setIsBrandMenuOpen(false);
  }, [activeTab, tabResetTimestamp]);

  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentItem = filteredCatalog[0];
  const nextItem = filteredCatalog[1];

  // Check if daily swipe limit is active and reached
  const hasReachedDailyLimit =
    userProfile.preferences.dailySwipeLimit !== null &&
    swipesToday >= userProfile.preferences.dailySwipeLimit &&
    !swipeLimitBypassed;

  // Comprehensive brand list including athletic, casual, retro, and vintage thrift
  const availableBrands = [
    'all',
    "Arc'teryx",
    'Acne Studios',
    'Issey Miyake',
    'Salomon',
    'Jil Sander',
    'Rick Owens',
    'Prada',
    'Jacquemus',
    'Stüssy',
    'Maison Margiela',
    'Carhartt WIP',
    'Kith',
    'Nike ACG',
    'Nike',
    'Adidas',
    'Champion',
    'New Balance',
    'Lululemon',
    'Under Armour',
    'Uniqlo',
    'GAP',
    "Levi's",
    'Zara',
    'Coogi',
    'Kappa',
    'Sergio Tacchini',
    'Tommy Jeans',
    'Fila',
    'Goodwill Vintage',
    'Thrifted Archive',
    'Russell Athletic',
    'Screen Stars',
    'Military Surplus',
    'Vintage Carhartt',
  ];

  const categories = ['all', 'Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories', 'Dresses'];
  const aesthetics = ['all', ...TRENDING_AESTHETICS_25];
  const sizes = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'M Tall', 'L Tall'];

  // Toss animations for Like and Dislike (smooth Tinder-like toss)
  const triggerLike = () => {
    if (!currentItem || hasReachedDailyLimit || tossState) return;
    setTossState('like');
    setTimeout(() => {
      swipe('like', currentItem);
      setTossState(null);
      setDragOffset({ x: 0, y: 0 });
    }, 280);
  };

  const triggerDislike = () => {
    if (!currentItem || hasReachedDailyLimit || tossState) return;
    setTossState('dislike');
    setTimeout(() => {
      swipe('dislike', currentItem);
      setTossState(null);
      setDragOffset({ x: 0, y: 0 });
    }, 280);
  };

  const handleUndo = () => {
    if (!canUndo || tossState !== null) return;
    setIsUndoing(true);
    undoLastSwipe();
    setTimeout(() => {
      setIsUndoing(false);
    }, 700);
  };

  // Drag handlers for desktop and mobile
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (hasReachedDailyLimit || tossState) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || hasReachedDailyLimit || tossState) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - startPos.current.x,
      y: clientY - startPos.current.y,
    });
  };

  const handleTouchEnd = () => {
    if (!isDragging || tossState) return;
    setIsDragging(false);

    if (dragOffset.x > 80) {
      triggerLike();
    } else if (dragOffset.x < -80) {
      triggerDislike();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const rotation = tossState === 'like' ? 22 : tossState === 'dislike' ? -22 : dragOffset.x * 0.08;
  const effectiveLikeOpacity = tossState === 'like' ? 1 : Math.min(1, Math.max(0, dragOffset.x / 80));
  const effectiveDislikeOpacity = tossState === 'dislike' ? 1 : Math.min(1, Math.max(0, -dragOffset.x / 80));

  const cardTranslateX = tossState === 'like' ? 440 : tossState === 'dislike' ? -440 : dragOffset.x;
  const cardTranslateY = tossState ? -25 : dragOffset.y;
  const cardOpacity = tossState ? 0.15 : 1;

  return (
    <div className="relative h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden flex flex-col justify-between pb-20 px-4 pt-2 max-w-md mx-auto select-none">
      {/* Dynamic Gradual Gradient Glow matching Like (green), Dislike (red), or Undo (goldish yellow lower-middle) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-200 ease-out"
        style={{
          opacity: isUndoing
            ? 0.95
            : Math.max(effectiveLikeOpacity, effectiveDislikeOpacity) * 0.85,
          background: isUndoing
            ? 'radial-gradient(ellipse at 50% 68%, rgba(245, 158, 11, 0.7) 0%, rgba(217, 119, 6, 0.3) 45%, transparent 75%)'
            : effectiveLikeOpacity > 0.05 || tossState === 'like' || dragOffset.x > 0
            ? `radial-gradient(ellipse at 70% 40%, rgba(16, 185, 129, ${effectiveLikeOpacity * 0.65}) 0%, rgba(16, 185, 129, 0.2) 45%, transparent 75%)`
            : `radial-gradient(ellipse at 30% 40%, rgba(239, 68, 68, ${effectiveDislikeOpacity * 0.65}) 0%, rgba(239, 68, 68, 0.2) 45%, transparent 75%)`,
        }}
      />

      {/* Top Header - Exact sketch layout with Brands pill in center & Filter icon on right */}
      <header className="flex items-center justify-between z-20 mb-2">
        <div className="flex items-center min-w-[70px]">
          {/* Brand logo/mark updated to PerFit - larger font matching the reach/height of Brands pill */}
          <span className="text-xl font-black tracking-wider text-emerald-400 font-mono leading-none flex items-center">
            PerFit
          </span>
        </div>

        {/* Center "Brands" Pill dropdown (updated to say Brands as requested) */}
        <div className="relative">
          <button
            onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-700 bg-black/80 text-white text-sm font-semibold tracking-wide shadow-sm hover:border-slate-500 transition-colors"
          >
            <span>{brandFilter === 'all' ? 'Brands' : brandFilter}</span>
            <ChevronDown className="w-4 h-4 text-emerald-400" />
          </button>

          {isBrandMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsBrandMenuOpen(false)}
              />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-40 max-h-64 overflow-y-auto">
                {availableBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBrandFilter(b);
                      setIsBrandMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-800 transition-colors flex items-center justify-between ${
                      brandFilter === b ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span>{b === 'all' ? 'All Brands' : b}</span>
                    {brandFilter === b && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filter Sliders Button (matching sketch 1 top right) */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`p-2 rounded-full border transition-colors relative ${
            categoryFilter !== 'all' || aestheticFilter !== 'all' || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active
              ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
              : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white'
          }`}
          title="Filter Preferences"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {(categoryFilter !== 'all' || aestheticFilter !== 'all' || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active) && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-black" />
          )}
        </button>
      </header>

      {/* Main Tinder Card Deck Canvas - Hard limit on height so it never overlaps buttons or header */}
      <div className="relative flex-1 flex items-center justify-center my-auto z-10 w-full max-h-[min(54vh,460px)] min-h-[350px]">
        {currentItem ? (
          <div className="relative w-full h-full max-h-[min(54vh,460px)] flex items-center justify-center">
            {/* Background Card Preview for depth */}
            {nextItem && (
              <div className="absolute w-[92%] h-[94%] rounded-3xl bg-slate-900/60 border border-slate-800 transform translate-y-3 scale-95 opacity-60 overflow-hidden pointer-events-none">
                <img
                  src={nextItem.image}
                  alt={nextItem.name}
                  className="w-full h-full object-cover grayscale-30"
                />
              </div>
            )}

            {/* Active Front Card - Highlighting product only without human model focus */}
            <div
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: `translate3d(${cardTranslateX}px, ${cardTranslateY}px, 0) rotate(${rotation}deg)`,
                opacity: cardOpacity,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: tossState
                  ? 'transform 280ms cubic-bezier(0.18, 0.89, 0.32, 1.15), opacity 280ms ease-out'
                  : isDragging
                  ? 'none'
                  : 'transform 200ms ease-out, opacity 200ms ease-out',
                borderColor:
                  effectiveLikeOpacity > 0.2
                    ? `rgba(16, 185, 129, ${effectiveLikeOpacity})`
                    : effectiveDislikeOpacity > 0.2
                    ? `rgba(239, 68, 68, ${effectiveDislikeOpacity})`
                    : 'rgb(51 65 85)',
              }}
              className="relative w-full h-full max-h-[min(54vh,460px)] rounded-3xl overflow-hidden border-2 bg-slate-950 shadow-2xl select-none flex flex-col justify-between"
            >
              {/* Garment Image Area (Focused directly on clothing item) */}
              <div className="relative flex-1 w-full min-h-0 overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />

                {/* Dark Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                {/* LIKE Stamp on Drag Right / Like Click */}
                <div
                  style={{
                    opacity: effectiveLikeOpacity,
                    transform: `scale(${effectiveLikeOpacity > 0.1 ? 1 : 0.8}) rotate(12deg)`,
                  }}
                  className="absolute top-6 right-6 border-4 border-emerald-400 bg-emerald-950/70 backdrop-blur-sm text-emerald-400 font-black text-2xl px-4 py-1 rounded-2xl tracking-wider pointer-events-none z-30 shadow-lg shadow-emerald-950/60 transition-transform duration-150"
                >
                  LIKE
                </div>

                {/* PASS Stamp on Drag Left / Pass Click */}
                <div
                  style={{
                    opacity: effectiveDislikeOpacity,
                    transform: `scale(${effectiveDislikeOpacity > 0.1 ? 1 : 0.8}) -rotate-12`,
                  }}
                  className="absolute top-6 left-6 border-4 border-red-500 bg-red-950/70 backdrop-blur-sm text-red-400 font-black text-2xl px-4 py-1 rounded-2xl tracking-wider pointer-events-none z-30 shadow-lg shadow-red-950/60 transition-transform duration-150"
                >
                  PASS
                </div>

                {/* UNDO Stamp in lower middle portion under the card */}
                {isUndoing && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 border-4 border-amber-400 bg-amber-950/85 backdrop-blur-md text-amber-300 font-black text-2xl px-6 py-1.5 rounded-2xl tracking-wider pointer-events-none z-30 shadow-2xl shadow-amber-950/90 animate-in zoom-in-90 fade-in duration-200">
                    UNDO
                  </div>
                )}

                {/* Item Type & Match Score Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    {currentItem.isBundle ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black tracking-wider uppercase shadow-md">
                        Outfit Bundle
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider uppercase">
                        {currentItem.category}
                      </span>
                    )}
                  </div>

                  {currentItem.matchScore && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold shadow-md">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>{currentItem.matchScore}% Match</span>
                    </div>
                  )}
                </div>

                {/* Brand & Garment Headline Overlay */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 drop-shadow">
                      {currentItem.brand}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-white font-mono drop-shadow">
                        ${currentItem.price}
                      </span>
                      {currentItem.originalPrice && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ${currentItem.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-lg font-extrabold text-white leading-tight drop-shadow mb-2">
                    {currentItem.name}
                  </h2>

                  {/* Aesthetic tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {currentItem.aesthetics.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-slate-700/80 text-[10px] text-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Bar */}
              <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-medium">Fit: {currentItem.fit}</span>
                  <span>•</span>
                  <span className="text-slate-300">{currentItem.material.split(' ')[0]}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(currentItem);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold hover:bg-emerald-500 hover:text-black transition-colors flex items-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Cart</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Deck State */
          <div className="w-full h-96 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-emerald-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">You've reached the end!</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              You've swiped all current pieces matching your active filters. Reset your deck or clear brand/style filters.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={resetDeck}
                className="px-5 py-2.5 rounded-full bg-emerald-500 text-black font-bold text-xs tracking-wide hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Shuffle & Reset Deck
              </button>
              {(brandFilter !== 'all' || categoryFilter !== 'all' || aestheticFilter !== 'all' || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active) && (
                <button
                  onClick={() => {
                    setBrandFilter('all');
                    setCategoryFilter('all');
                    setAestheticFilter('all');
                    setItemTypeFilter('single');
                    setSizeFilter('all');
                    setPriceRangeFilter({ min: 0, max: 600, active: false });
                  }}
                  className="px-4 py-2.5 rounded-full border border-slate-700 text-slate-300 text-xs font-medium hover:text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Swiping Controls - Exact matching sketch 1 left:
          - Red hatching corner with thumbs down
          - Center circle with lines (inspect item details / undo)
          - Green hatching corner with thumbs up
      */}
      <div className="relative z-20 flex items-center justify-between px-2 pt-1 flex-shrink-0">
        {/* Red Dislike Corner Button */}
        <button
          onClick={triggerDislike}
          disabled={!currentItem || hasReachedDailyLimit || tossState !== null}
          className="relative group p-4 rounded-3xl bg-red-950/40 border-2 border-red-500/80 text-red-400 hover:bg-red-900/60 hover:text-red-300 hover:border-red-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-red-950/60 flex items-center justify-center disabled:opacity-40"
          title="Pass / Dislike (Swipe Left)"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-25">
            <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#ef4444_0,#ef4444_2px,transparent_0,transparent_8px)]" />
          </div>
          <ThumbsDown className="w-7 h-7 relative z-10" strokeWidth={2.2} />
        </button>

        {/* Center Controls: Circular details button + Undo */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo || tossState !== null}
            className={`p-3 rounded-full border transition-all duration-300 shadow-md ${
              canUndo
                ? 'border-amber-400 bg-amber-950/50 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.7)] hover:border-amber-300 hover:text-amber-200 hover:scale-105 active:scale-95 animate-pulse'
                : 'border-slate-800 bg-slate-900/60 text-slate-500 opacity-30 pointer-events-none'
            }`}
            title="Undo last swipe"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => currentItem && setInspectItem(currentItem)}
            disabled={!currentItem || tossState !== null}
            className="p-3.5 rounded-full border-2 border-slate-600 bg-slate-950 text-white hover:border-slate-400 hover:scale-105 transition-all shadow-md flex items-center justify-center group"
            title="Inspect garment details"
          >
            <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
              <span className="w-4 h-0.5 bg-slate-300 rounded-full group-hover:bg-white transition-colors" />
              <span className="w-3 h-0.5 bg-slate-300 rounded-full group-hover:bg-white transition-colors" />
              <span className="w-4 h-0.5 bg-slate-300 rounded-full group-hover:bg-white transition-colors" />
            </div>
          </button>
        </div>

        {/* Green Like Corner Button */}
        <button
          onClick={triggerLike}
          disabled={!currentItem || hasReachedDailyLimit || tossState !== null}
          className="relative group p-4 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-300 hover:border-emerald-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-950/60 flex items-center justify-center disabled:opacity-40"
          title="Like & Save to Wishlist (Swipe Right)"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-25">
            <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#10b981_0,#10b981_2px,transparent_0,transparent_8px)]" />
          </div>
          <ThumbsUp className="w-7 h-7 relative z-10" strokeWidth={2.2} />
        </button>
      </div>

      {/* Daily Swipe Limit Modal (When user reaches their configured limit) */}
      {hasReachedDailyLimit && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-emerald-500/50 rounded-3xl max-w-sm w-full p-6 text-white text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400">
              <TrendingUp className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Daily Goal Reached
              </span>
              <h3 className="text-lg font-black text-white mt-1">Daily Swipe Limit Reached</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You've curated <span className="text-emerald-400 font-bold">{swipesToday} pieces</span> today (your daily limit is set to {userProfile.preferences.dailySwipeLimit}).
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={bypassSwipeLimit}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Bypass Limit & Keep Swiping
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className="w-full py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs hover:text-white"
              >
                Review Saved Wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl animate-in slide-in-from-bottom-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-base">Filters & Preferences</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item Type: Single Items (default) vs Bundles */}
            <div className="mb-4">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2 block">
                Item Presentation
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'single', label: 'Single Items' },
                  { id: 'all', label: 'All Items' },
                  { id: 'bundles', label: 'Bundles Only' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setItemTypeFilter(t.id as typeof itemTypeFilter)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
                      itemTypeFilter === t.id
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Default shows single garments; bundles and outfits can be toggled on.
              </p>
            </div>

            {/* Size Filter (Off by default) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Size Filter
                </label>
                <span className="text-[10px] text-slate-500">
                  {sizeFilter === 'all' ? 'Off (All Sizes)' : sizeFilter}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSizeFilter(s)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                      sizeFilter === s
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {s === 'all' ? 'All (Off)' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender / Target Fit Filter */}
            <div className="mb-4">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2 block">
                Target Fit / Gender
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'men', label: 'Men' },
                  { id: 'women', label: 'Women' },
                  { id: 'unisex', label: 'Unisex' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenderFilter(g.id as typeof genderFilter)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                      genderFilter === g.id
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter ($1 to Unlimited Slider) */}
            <div className="mb-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-300 tracking-wider block">
                    Price Range Slider
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {priceRangeFilter.active
                      ? priceRangeFilter.max === null
                        ? '$1 to Unlimited'
                        : `$1 to $${priceRangeFilter.max}`
                      : 'Off ($1 - Unlimited)'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setPriceRangeFilter({
                      ...priceRangeFilter,
                      active: !priceRangeFilter.active,
                    })
                  }
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    priceRangeFilter.active
                      ? 'bg-emerald-500 text-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {priceRangeFilter.active ? 'Filter Active' : 'Off (All Prices)'}
                </button>
              </div>

              {/* Interactive Range Slider from $1 to Unlimited */}
              <div className="space-y-2 mt-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono text-emerald-400 font-bold">
                  <span>$1</span>
                  <span>
                    {priceRangeFilter.max === null || (priceRangeFilter.max && priceRangeFilter.max >= 500)
                      ? 'Unlimited (∞)'
                      : `$${priceRangeFilter.max}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  step="10"
                  value={priceRangeFilter.max === null ? 500 : priceRangeFilter.max}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setPriceRangeFilter({
                      min: 1,
                      max: val >= 500 ? null : val,
                      active: true,
                    });
                  }}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>$1</span>
                  <span>$50</span>
                  <span>$150</span>
                  <span>$300</span>
                  <span>Unlimited</span>
                </div>
              </div>
            </div>

            {/* Category selection */}
            <div className="mb-4">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      categoryFilter === c
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetic selection (25 Trending Aesthetics Bank) */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider block">
                  Aesthetic Vibe (25 Trends)
                </label>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {aestheticFilter === 'all' ? 'All Aesthetics' : aestheticFilter}
                </span>
              </div>
              <div className="max-h-44 overflow-y-auto pr-1 flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {aesthetics.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAestheticFilter(a)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      aestheticFilter === a
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {a === 'all' ? 'All Aesthetics' : a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setAestheticFilter('all');
                  setGenderFilter('all');
                  setItemTypeFilter('single');
                  setSizeFilter('all');
                  setPriceRangeFilter({ min: 1, max: null, active: false });
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Garment Details Modal (When tapping center inspector button) */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                  {inspectItem.brand}
                </span>
                <h3 className="text-lg font-black text-white">{inspectItem.name}</h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 rounded-full bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={inspectItem.image}
                alt={inspectItem.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 font-mono text-sm font-bold text-emerald-400">
                ${inspectItem.price}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {inspectItem.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Material</span>
                <span className="font-semibold text-white">{inspectItem.material}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Silhouette Fit</span>
                <span className="font-semibold text-white">{inspectItem.fit}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  addToCart(inspectItem);
                  setInspectItem(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart (${inspectItem.price})</span>
              </button>
              <button
                onClick={() => {
                  toggleWishlist(inspectItem);
                  setInspectItem(null);
                }}
                className={`p-3 rounded-xl border transition-colors ${
                  isItemInWishlist(inspectItem.id)
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
