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
  Bookmark,
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

  const isLight = userProfile.preferences.theme === 'light';

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
  const isMovedRef = useRef<boolean>(false);
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

  const categories = ['all', 'Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories'];
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
    isMovedRef.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || hasReachedDailyLimit || tossState) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startPos.current.x;
    const dy = clientY - startPos.current.y;
    if (Math.hypot(dx, dy) > 8) {
      isMovedRef.current = true;
    }
    setDragOffset({
      x: dx,
      y: dy,
    });
  };

  const handleTouchEnd = () => {
    if (!isDragging || tossState) return;
    setIsDragging(false);

    if (!isMovedRef.current) {
      // Tap detected on the product card: open more info modal
      if (currentItem) {
        setInspectItem(currentItem);
      }
      setDragOffset({ x: 0, y: 0 });
      return;
    }

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

      {/* Top Header - Brands pill perfectly centered in 3-column layout */}
      <header className="grid grid-cols-3 items-center w-full z-20 mb-2">
        <div className="justify-self-start flex items-center">
          {/* Brand logo/mark - Aesthro (blend of astro and aesthetic) */}
          <span className={`text-xl font-black tracking-wider ${isLight ? 'text-pink-600' : 'text-pink-300'} font-mono leading-none flex items-center gap-1`}>
            <span>Aesthro</span>
            <span className={`text-xs ${isLight ? 'text-indigo-600' : 'text-pink-300'} select-none`}>✦</span>
          </span>
        </div>

        {/* Center "Brands" Pill dropdown - Guaranteed centered on header */}
        <div className="justify-self-center relative flex justify-center">
          <button
            onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              isLight
                ? 'border-slate-300 bg-white text-slate-800 hover:border-slate-400'
                : 'border-slate-700 bg-black/80 text-white hover:border-slate-500'
            } text-xs font-semibold tracking-wide shadow-sm transition-colors max-w-[130px]`}
          >
            <span className="truncate">{brandFilter === 'all' ? 'Brands' : brandFilter}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-pink-600' : 'text-pink-300'} flex-shrink-0`} />
          </button>

          {isBrandMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsBrandMenuOpen(false)}
              />
              <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-44 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              } border rounded-2xl shadow-2xl py-2 z-40 max-h-64 overflow-y-auto`}>
                {availableBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBrandFilter(b);
                      setIsBrandMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    } transition-colors flex items-center justify-between ${
                      brandFilter === b
                        ? isLight
                          ? 'text-pink-600 font-bold bg-pink-50'
                          : 'text-pink-300 font-bold bg-slate-800/60'
                        : isLight
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{b === 'all' ? 'All Brands' : b}</span>
                    {brandFilter === b && <Check className={`w-3.5 h-3.5 ${isLight ? 'text-pink-600' : 'text-pink-300'} flex-shrink-0 ml-1`} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filter Sliders Button */}
        <div className="justify-self-end flex items-center">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`p-2 rounded-full border transition-colors relative ${
              categoryFilter !== 'all' || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active
                ? isLight
                  ? 'border-pink-600 bg-pink-50 text-pink-600'
                  : 'border-pink-400 bg-pink-950/60 text-pink-300'
                : isLight
                ? 'border-slate-300 bg-white text-slate-700 hover:text-black hover:border-slate-400'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white'
            }`}
            title="Filter Preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {(categoryFilter !== 'all' || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active) && (
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${isLight ? 'bg-pink-600 ring-white' : 'bg-pink-300 ring-black'} rounded-full ring-2`} />
            )}
          </button>
        </div>
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

            {/* Active Front Card - Highlighting product only without human model focus. Tapping opens more info */}
            <div
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => {
                if (!isMovedRef.current && currentItem) {
                  setInspectItem(currentItem);
                }
              }}
              style={{
                transform: `translate3d(${cardTranslateX}px, ${cardTranslateY}px, 0) rotate(${rotation}deg)`,
                opacity: cardOpacity,
                cursor: isDragging ? 'grabbing' : 'pointer',
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

                {/* LIKE Stamp on Drag Right / Like Click (Restored to Green) */}
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
                      <span className="px-2.5 py-1 rounded-full bg-pink-300 text-black text-[10px] font-black tracking-wider uppercase shadow-md">
                        Outfit Bundle
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider uppercase">
                        {currentItem.category}
                      </span>
                    )}
                  </div>

                  {currentItem.matchScore && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-pink-400/60 text-pink-300 text-xs font-mono font-bold shadow-md">
                      <Sparkles className="w-3 h-3 text-pink-300" />
                      <span>{currentItem.matchScore}% Match</span>
                    </div>
                  )}
                </div>

                {/* Brand & Garment Headline Overlay */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-pink-300 drop-shadow">
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
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-extrabold transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Cart</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Deck State */
          <div className="w-full h-96 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-pink-300">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">You've reached the end!</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              You've swiped all current pieces matching your active filters. Reset your deck or clear brand/style filters.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={resetDeck}
                className="px-5 py-2.5 rounded-full bg-pink-300 text-black font-bold text-xs tracking-wide hover:bg-pink-200 transition-colors shadow-lg shadow-pink-300/20"
              >
                Shuffle & Reset Deck
              </button>
              {(brandFilter !== 'all' || categoryFilter !== 'all' || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active) && (
                <button
                  onClick={() => {
                    setBrandFilter('all');
                    setCategoryFilter('all');
                    setItemTypeFilter('single');
                    setSizeFilter('all');
                    setPriceRangeFilter({ min: 1, max: null, active: false });
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

      {/* Bottom Swiping Controls:
          From Left to Right:
          1. Dislike (Pass / Swipe Left)
          2. Undo (RotateCcw)
          3. Save (Bookmark / Add to Wishlist)
          4. Like (Thumbs Up / Swipe Right in Pastel Pink)
      */}
      <div className="relative z-20 flex items-center justify-between px-2 pt-1 flex-shrink-0">
        {/* 1. Red Dislike Corner Button */}
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

        {/* Center Controls: Undo + Save button */}
        <div className="flex items-center gap-2">
          {/* 2. Undo Button */}
          <button
            onClick={handleUndo}
            disabled={!canUndo || tossState !== null}
            className={`p-3.5 rounded-full border transition-all duration-300 shadow-md ${
              canUndo
                ? 'border-amber-400 bg-amber-950/50 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.7)] hover:border-amber-300 hover:text-amber-200 hover:scale-105 active:scale-95 animate-pulse'
                : 'border-slate-800 bg-slate-900/60 text-slate-500 opacity-30 pointer-events-none'
            }`}
            title="Undo last swipe"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* 3. Save Button (Replaces 3-line button; adds items to wishlist) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentItem) {
                toggleWishlist(currentItem);
              }
            }}
            disabled={!currentItem || tossState !== null}
            className={`p-3.5 rounded-full border-2 transition-all shadow-md flex items-center justify-center group ${
              currentItem && isItemInWishlist(currentItem.id)
                ? 'border-pink-300 bg-pink-950/70 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.5)]'
                : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-pink-300 hover:text-pink-300 hover:scale-105 active:scale-95'
            }`}
            title={currentItem && isItemInWishlist(currentItem.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
          >
            <Bookmark
              className={`w-4 h-4 transition-transform ${
                currentItem && isItemInWishlist(currentItem.id) ? 'fill-pink-300 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* 4. Green Like Corner Button (Restored as requested with green animations & glow) */}
        <button
          onClick={triggerLike}
          disabled={!currentItem || hasReachedDailyLimit || tossState !== null}
          className="relative group p-4 rounded-3xl bg-emerald-950/40 border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-300 hover:border-emerald-300 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-950/60 hover:shadow-[0_0_24px_rgba(16,185,129,0.45)] flex items-center justify-center disabled:opacity-40"
          title="Like & Curate (Swipe Right)"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-25">
            <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#10b981_0,#10b981_2px,transparent_0,transparent_8px)]" />
          </div>
          <ThumbsUp className="w-7 h-7 relative z-10" strokeWidth={2.2} />
        </button>
      </div>

      {/* Daily Swipe Limit Modal (When user reaches their configured limit) */}
      {hasReachedDailyLimit && (
        <div
          onClick={() => bypassSwipeLimit()}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-3 sm:pt-6 pb-16 px-3 sm:px-4 overflow-y-auto animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-pink-400/50 rounded-2xl max-w-sm w-full p-6 text-white text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 cursor-default relative"
          >
            {/* Floating Close Button */}
            <button
              onClick={() => bypassSwipeLimit()}
              className="sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-lg transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-pink-400/20 border border-pink-400/60 flex items-center justify-center mx-auto text-pink-300">
              <TrendingUp className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
                Daily Goal Reached
              </span>
              <h3 className="text-lg font-black text-white mt-1">Daily Swipe Limit Reached</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You've curated <span className="text-pink-300 font-bold">{swipesToday} pieces</span> today (your daily limit is set to {userProfile.preferences.dailySwipeLimit}).
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={bypassSwipeLimit}
                className="w-full py-3 rounded-xl bg-pink-300 text-black font-black text-xs hover:bg-pink-200 transition-colors shadow-lg shadow-pink-300/20"
              >
                Bypass Limit & Keep Swiping
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs hover:text-white"
              >
                Review Saved Wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div
          onClick={() => setIsFilterModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-3 sm:pt-6 pb-16 px-3 sm:px-4 overflow-y-auto animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
                : 'bg-slate-900 border-slate-700 text-white shadow-2xl'
            } border rounded-2xl max-w-sm w-full p-5 animate-in slide-in-from-bottom-6 duration-200 max-h-[85vh] overflow-y-auto cursor-default relative`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className={`sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              } border backdrop-blur-md shadow-lg transition-all`}
              title="Close Filters"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`flex items-center gap-2 pb-3 border-b ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'} mb-3.5 pr-10`}>
              <SlidersHorizontal className={`w-4 h-4 ${isLight ? 'text-pink-600' : 'text-pink-300'}`} />
              <h3 className="font-bold text-base">Filters & Preferences</h3>
            </div>

            {/* 1. Item Presentation Buttons (No title, no summary text) */}
            <div className="mb-3.5">
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
                        ? isLight
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-pink-300 text-black shadow-md shadow-pink-300/20'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Category selection */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Category
                </label>
                <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-pink-600' : 'text-pink-300'}`}>
                  {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      categoryFilter === c
                        ? isLight
                          ? 'bg-pink-600 text-white font-bold shadow-sm'
                          : 'bg-pink-300 text-black font-bold shadow-sm'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Size Filter */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Size Filter
                </label>
                <span className={`text-[10px] ${isLight ? 'text-slate-500 font-medium' : 'text-slate-500'}`}>
                  {sizeFilter === 'all' ? 'Off (All Sizes)' : sizeFilter}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSizeFilter(s)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
                      sizeFilter === s
                        ? isLight
                          ? 'bg-pink-600 text-white font-bold'
                          : 'bg-pink-300 text-black font-bold'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {s === 'all' ? 'All (Off)' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Gender / Target Fit Filter */}
            <div className="mb-3.5">
              <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Target Fit / Gender
              </label>
              <div className={`grid grid-cols-4 gap-1.5 p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
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
                        ? isLight
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-pink-300 text-black shadow-md shadow-pink-300/20'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Simplified Compact Price Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-semibold uppercase tracking-wider text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Max Price
                </span>
                <span className={`font-mono font-bold text-xs ${isLight ? 'text-pink-600' : 'text-pink-300'}`}>
                  {priceRangeFilter.max === null || !priceRangeFilter.active || priceRangeFilter.max >= 500
                    ? 'Any Price ($1 - ∞)'
                    : `Up to $${priceRangeFilter.max}`}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="20"
                value={priceRangeFilter.active && priceRangeFilter.max !== null ? priceRangeFilter.max : 500}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setPriceRangeFilter({
                    min: 1,
                    max: val >= 500 ? null : val,
                    active: val < 500,
                  });
                }}
                className={`w-full ${isLight ? 'accent-pink-600 bg-slate-200' : 'accent-pink-300 bg-slate-800'} cursor-pointer h-1.5 rounded-lg`}
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>$20</span>
                <span>$100</span>
                <span>$250</span>
                <span>Unlimited</span>
              </div>
            </div>

            <div className={`sticky -bottom-5 -mx-5 -mb-5 p-3.5 border-t ${
              isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-slate-800'
            } backdrop-blur-md flex gap-3 z-20`}>
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setGenderFilter('all');
                  setItemTypeFilter('single');
                  setSizeFilter('all');
                  setPriceRangeFilter({ min: 1, max: null, active: false });
                }}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-colors shadow-md ${
                  isLight
                    ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-pink-600/20'
                    : 'bg-pink-300 text-black hover:bg-pink-200 shadow-pink-300/20'
                }`}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Garment Details Modal (Tapping product card opens this) */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center pt-3 sm:pt-6 pb-16 px-3 sm:px-4 overflow-y-auto animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-700 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto cursor-default relative"
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setInspectItem(null)}
              className="sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-lg transition-all"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-10">
              <span className="text-[10px] font-extrabold uppercase text-pink-300 tracking-wider">
                {inspectItem.brand}
              </span>
              <h3 className="text-lg font-black text-white">{inspectItem.name}</h3>
            </div>

            <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={inspectItem.image}
                alt={inspectItem.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 font-mono text-sm font-bold text-pink-300 border border-pink-400/20">
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
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart (${inspectItem.price})</span>
              </button>
              <button
                onClick={() => {
                  toggleWishlist(inspectItem);
                }}
                className={`p-3 rounded-xl border transition-colors ${
                  isItemInWishlist(inspectItem.id)
                    ? 'border-pink-400 bg-pink-950/60 text-pink-300'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isItemInWishlist(inspectItem.id) ? 'fill-pink-300 text-pink-300' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
