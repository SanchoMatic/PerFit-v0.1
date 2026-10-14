import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Send,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem } from '../../types';
import { TRENDING_AESTHETICS_25 } from '../../data/aesthetics';
import { WishlistTab } from './WishlistTab';

export const SwipeTab: React.FC = () => {
  const {
    catalog,
    filteredCatalog,
    swipe,
    undoLastSwipe,
    canUndo,
    resetDeck,
    brandFilter,
    setBrandFilter,
    toggleBrandFilter,
    categoryFilter,
    setCategoryFilter,
    toggleCategoryFilter,
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
    wishlistItems,
    setActiveTab,
    activeTab,
    tabResetTimestamp,
    setSendItemModalItem,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';

  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [tossState, setTossState] = useState<'like' | 'dislike' | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSavedOverlayOpen, setIsSavedOverlayOpen] = useState(false);
  const [isSavingThrow, setIsSavingThrow] = useState(false);
  const [savedButtonBump, setSavedButtonBump] = useState(false);
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Reset any modals/menus when tapping the Swipe tab
  useEffect(() => {
    setInspectItem(null);
    setIsFilterModalOpen(false);
    setIsBrandMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    setIsSavedOverlayOpen(false); // Close saved wishlist overlay when user taps on swipe tab icon
  }, [activeTab, tabResetTimestamp]);

  // Lock scrolling strictly while on main swipe tab, but enable scrolling on wishlist overlay
  useEffect(() => {
    if (activeTab === 'swipe' && !isSavedOverlayOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.touchAction = 'none';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.touchAction = '';
    };
  }, [activeTab, isSavedOverlayOpen]);

  // Swipe gestures and deck state
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMovedRef = useRef<boolean>(false);
  const isSwipingRef = useRef<boolean>(false);
  const currentItem = filteredCatalog[0];
  const nextItem = filteredCatalog[1];

  // Check if daily swipe limit is active and reached
  const hasReachedDailyLimit =
    userProfile.preferences.dailySwipeLimit !== null &&
    swipesToday >= userProfile.preferences.dailySwipeLimit &&
    !swipeLimitBypassed;

  // Alphabetically organized list of brands with 'all' (All Brands) pinned at top
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    // Collect from catalog
    catalog.forEach((item) => {
      if (item.brand && item.brand.trim()) brandSet.add(item.brand.trim());
    });
    // Curated catalog brands
    [
      'Acne Studios',
      'Adidas',
      "Arc'teryx",
      'Carhartt WIP',
      'Champion',
      'Coogi',
      'Fila',
      'GAP',
      'Goodwill Vintage',
      'Issey Miyake',
      'Jacquemus',
      'Jil Sander',
      'Kappa',
      'Kith',
      "Levi's",
      'Lululemon',
      'Maison Margiela',
      'Military Surplus',
      'New Balance',
      'Nike',
      'Nike ACG',
      'Prada',
      'Rick Owens',
      'Russell Athletic',
      'Salomon',
      'Screen Stars',
      'Sergio Tacchini',
      'Stüssy',
      'Thrifted Archive',
      'Tommy Jeans',
      'Under Armour',
      'Uniqlo',
      'Vintage Carhartt',
      'Zara',
    ].forEach((b) => brandSet.add(b));

    const sorted = Array.from(brandSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    return ['all', ...sorted];
  }, [catalog]);

  // Filtered brands matching search bar query
  const searchedBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) return availableBrands;
    const q = brandSearchQuery.toLowerCase().trim();
    return availableBrands.filter((b) => b === 'all' || b.toLowerCase().includes(q));
  }, [availableBrands, brandSearchQuery]);

  const categories = ['all', 'Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories'];
  const aesthetics = ['all', ...TRENDING_AESTHETICS_25];
  const sizes = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'M Tall', 'L Tall'];

  // Toss animations for Like and Dislike (smooth Tinder-like toss, strictly one card at a time)
  const triggerLike = () => {
    if (!currentItem || hasReachedDailyLimit || tossState || isSwipingRef.current) return;
    isSwipingRef.current = true;
    setDragOffset({ x: 0, y: 0 }); // Clear drag offset immediately to prevent next card from jumping
    setTossState('like');
    setTimeout(() => {
      swipe('like', currentItem);
      setTossState(null);
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 60);
    }, 280);
  };

  const triggerDislike = () => {
    if (!currentItem || hasReachedDailyLimit || tossState || isSwipingRef.current) return;
    isSwipingRef.current = true;
    setDragOffset({ x: 0, y: 0 }); // Clear drag offset immediately to prevent next card from jumping
    setTossState('dislike');
    setTimeout(() => {
      swipe('dislike', currentItem);
      setTossState(null);
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 60);
    }, 280);
  };

  const handleUndo = () => {
    if (!canUndo || tossState !== null || isSwipingRef.current || isSavingThrow) return;
    setIsUndoing(true);
    undoLastSwipe();
    setTimeout(() => {
      setIsUndoing(false);
    }, 600);
  };

  // 10 & 15. Save button throws product card to top right Saved button with slowed down, smooth curve
  const triggerSaveThrow = () => {
    if (!currentItem || tossState !== null || isSwipingRef.current || isSavingThrow) return;
    isSwipingRef.current = true;
    setDragOffset({ x: 0, y: 0 });
    setIsSavingThrow(true);

    // Smooth, slowed-down shrink and throw into top-right Saved button (approx 650ms)
    setTimeout(() => {
      setSavedButtonBump(true);
      swipe('like', currentItem);
      toggleWishlist(currentItem);

      setTimeout(() => {
        setSavedButtonBump(false);
      }, 350);
    }, 550);

    setTimeout(() => {
      setIsSavingThrow(false);
      setDragOffset({ x: 0, y: 0 });
      isSwipingRef.current = false;
    }, 680);
  };

  // Drag handlers for desktop and mobile
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (hasReachedDailyLimit || tossState || isSwipingRef.current) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    isMovedRef.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || hasReachedDailyLimit || tossState || isSwipingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startPos.current.x;
    const dy = clientY - startPos.current.y;
    if (Math.hypot(dx, dy) > 8) {
      isMovedRef.current = true;
    }
    setDragOffset({
      x: dx,
      y: dy * 0.4,
    });
  };

  const handleTouchEnd = (e?: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || tossState || isSwipingRef.current) return;
    setIsDragging(false);

    if (e && (e.target as HTMLElement).closest('button')) {
      setDragOffset({ x: 0, y: 0 });
      return;
    }

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
    <div className="relative min-h-[calc(100dvh-64px)] h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-hidden flex flex-col justify-between pb-20 px-4 pt-[max(8px,env(safe-area-inset-top))] max-w-md mx-auto select-none touch-none overscroll-none">
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

      {/* Top Header - Filter on top left, Brands pill in center, Saved on top right */}
      <header className="grid grid-cols-3 items-center w-full z-20 mb-2">
        {/* Top Left: Filter Preferences Button */}
        <div className="justify-self-start flex items-center">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`p-2.5 min-w-[48px] min-h-[48px] rounded-full border transition-colors relative shadow-sm flex items-center justify-center cursor-pointer ${
              categoryFilter.length > 0 || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active
                ? isLight
                  ? 'cosmic-gradient-border-light text-slate-900 bg-white'
                  : 'cosmic-gradient-border text-white bg-slate-950'
                : isLight
                ? 'border-slate-300 bg-white text-slate-800 hover:text-black hover:border-slate-400'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-500'
            }`}
            title="Filter Preferences"
          >
            <SlidersHorizontal
              className="w-5 h-5"
              style={
                categoryFilter.length > 0 || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active
                  ? { stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }
                  : undefined
              }
            />
            {(categoryFilter.length > 0 || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active) && (
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${isLight ? 'cosmic-gradient-bg-light' : 'cosmic-gradient-bg'} ${isLight ? 'ring-white' : 'ring-black'} rounded-full ring-2`} />
            )}
          </button>
        </div>

        {/* Center "Brands" Pill dropdown - Allows multiple brands to be selected at once */}
        <div className="justify-self-center relative flex justify-center">
          <button
            onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isLight
                ? 'cosmic-gradient-border-light text-slate-800 hover:shadow-sm'
                : 'cosmic-gradient-border text-white hover:shadow-sm'
            } text-sm font-bold tracking-wide shadow-sm transition-colors max-w-[160px] min-h-[44px] cursor-pointer`}
          >
            <span className="truncate">
              {brandFilter.length === 0 || brandFilter.includes('all')
                ? 'Brands'
                : brandFilter.length === 1
                ? brandFilter[0]
                : `Brands (${brandFilter.length})`}
            </span>
            <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }} />
          </button>

          {isBrandMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsBrandMenuOpen(false)}
              />
              <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60' : 'bg-slate-900 border-slate-700 text-white shadow-black/80'
              } border rounded-2xl shadow-2xl py-2 z-40 max-h-80 flex flex-col animate-popup`}>
                <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-inherit">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                    Select Brands
                  </span>
                  {brandFilter.length > 0 && !brandFilter.includes('all') && (
                    <button
                      type="button"
                      onClick={() => setBrandFilter('all')}
                      className={`text-[10px] font-bold ${isLight ? 'text-slate-600 hover:text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Simple Brand Search Bar placed right in between Select Brands and All Brands */}
                <div className="px-2.5 py-1.5 border-b border-inherit">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs ${
                      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-800/90 text-white'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      className="w-full bg-transparent outline-none text-xs placeholder:text-slate-500"
                    />
                    {brandSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setBrandSearchQuery('')}
                        className="text-slate-400 hover:text-white cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-y-auto max-h-52 px-1 pt-1">
                  {searchedBrands.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No brands found matching "{brandSearchQuery}"
                    </div>
                  ) : (
                    searchedBrands.map((b) => {
                      const isAll = b === 'all';
                      const isSelected = isAll
                        ? brandFilter.length === 0 || brandFilter.includes('all')
                        : brandFilter.some((x) => x.toLowerCase() === b.toLowerCase());

                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            if (isAll) {
                              setBrandFilter('all');
                            } else {
                              toggleBrandFilter(b);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between mb-0.5 ${
                            isSelected
                              ? isLight
                                ? 'cosmic-gradient-bg-light text-white font-bold shadow-sm shadow-pink-600/30'
                                : 'cosmic-gradient-bg text-white font-bold shadow-sm shadow-pink-600/40'
                              : isLight
                              ? 'hover:bg-slate-100 text-slate-700'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="truncate">{b === 'all' ? 'All Brands' : b}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0 ml-1" />}
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="p-2 border-t border-inherit mt-1">
                  <button
                    type="button"
                    onClick={() => setIsBrandMenuOpen(false)}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isLight ? 'cosmic-gradient-bg-light text-white shadow-sm' : 'cosmic-gradient-bg text-white shadow-sm'
                    }`}
                  >
                    Done {brandFilter.length > 0 ? `(${brandFilter.length})` : ''}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Top Right: Saved / Wishlist button with quantity bubble indicator */}
        <div className="justify-self-end flex items-center">
          <button
            onClick={() => setIsSavedOverlayOpen(true)}
            className={`p-2.5 min-w-[48px] min-h-[48px] rounded-full border transition-transform relative shadow-sm flex items-center justify-center cursor-pointer ${
              savedButtonBump ? 'scale-125 ring-4 ring-pink-500/50' : 'hover:scale-105 active:scale-95'
            } ${
              wishlistItems.length > 0
                ? isLight
                  ? 'cosmic-gradient-border-light text-pink-600 bg-white'
                  : 'cosmic-gradient-border text-pink-400 bg-slate-950'
                : isLight
                ? 'border-slate-300 bg-white text-slate-800 hover:text-black hover:border-slate-400'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-500'
            }`}
            title="Saved Items"
          >
            <Bookmark
              className="w-5 h-5 transition-transform"
              style={
                wishlistItems.length > 0
                  ? { fill: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})`, stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }
                  : undefined
              }
            />
            {wishlistItems.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 ${
                  isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'
                } text-white font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-md ring-2 ring-black/40 ${
                  savedButtonBump ? 'scale-125' : ''
                }`}
              >
                {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Tinder Card Deck Canvas - Hard limit on height so it never overlaps buttons or header */}
      <div className="relative flex-1 flex items-center justify-center my-auto z-10 w-full max-h-[min(54vh,460px)] min-h-[350px]">
        {currentItem ? (
          <div className="relative w-full h-full max-h-[min(54vh,460px)] flex items-center justify-center">
            {/* Background Card Preview for depth with smooth rising/expanding scale transition - Kept perfectly still */}
            {nextItem && (
              <div
                key={nextItem.id}
                style={{
                  transform:
                    tossState || isSavingThrow
                      ? 'translate3d(0, 0, 0) scale(1)'
                      : `translate3d(0, 0, 0) scale(${Math.min(1, 0.94 + (Math.abs(dragOffset.x) / 200) * 0.06)})`,
                  opacity:
                    tossState || isSavingThrow
                      ? 1
                      : Math.min(1, 0.6 + (Math.abs(dragOffset.x) / 160) * 0.4),
                  transition:
                    tossState || isSavingThrow
                      ? 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 280ms ease-out'
                      : isDragging
                      ? 'none'
                      : 'transform 200ms ease-out, opacity 200ms ease-out',
                }}
                className="absolute w-[94%] h-[95%] rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden pointer-events-none"
              >
                <img
                  src={nextItem.image}
                  alt={nextItem.name}
                  className="w-full h-full object-cover grayscale-30"
                />
              </div>
            )}

            {/* Active Front Card - Keyed by currentItem.id so new card is never manipulated prematurely or slides backward */}
            <div
              key={currentItem.id}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                if (!isMovedRef.current && currentItem) {
                  setInspectItem(currentItem);
                }
              }}
              style={{
                transform: isSavingThrow
                  ? 'translate3d(calc(44vw), -55vh, 0) scale(0.1) rotate(16deg)'
                  : isUndoing
                  ? 'translate3d(0, 0, 0) scale(1)'
                  : `translate3d(${cardTranslateX}px, ${cardTranslateY}px, 0) rotate(${rotation}deg)`,
                opacity: isSavingThrow ? 0.05 : cardOpacity,
                cursor: isDragging ? 'grabbing' : 'pointer',
                transition: isSavingThrow
                  ? 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 650ms ease-out'
                  : tossState
                  ? 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 280ms ease-out'
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
              className={`relative w-full h-full max-h-[min(54vh,460px)] rounded-3xl overflow-hidden border-2 bg-slate-950 shadow-2xl select-none flex flex-col justify-between ${
                isUndoing ? 'animate-in zoom-in-95 duration-300 ring-2 ring-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.5)]' : ''
              }`}
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
                      <span className="px-2.5 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black tracking-wider uppercase shadow-md shadow-pink-600/30">
                        Outfit Bundle
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider uppercase">
                        {currentItem.category}
                      </span>
                    )}
                  </div>

                  {currentItem.matchScore && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-mono font-bold shadow-md`}>
                      <Sparkles className="w-3 h-3 text-white" />
                      <span>{currentItem.matchScore}% Match</span>
                    </div>
                  )}
                </div>

                {/* Brand & Garment Headline Overlay */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className={`text-xs font-extrabold uppercase tracking-widest ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} drop-shadow`}>
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

                  <h2 className={`text-lg font-extrabold leading-tight drop-shadow mb-1 ${isLight ? 'text-sky-950' : 'text-white'}`}>
                    {currentItem.name}
                  </h2>
                </div>
              </div>

              {/* Bottom Quick Bar - Big Add to Cart button for simple mobile use, no popup */}
              <div className="px-4 py-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 z-20">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-semibold text-xs">Fit: {currentItem.fit}</span>
                  <span>•</span>
                  <span className="text-slate-300 text-xs">{currentItem.material.split(' ')[0]}</span>
                </div>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    addToCart(currentItem);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(currentItem);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black text-xs font-black transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 min-h-[38px] cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Deck State */
          <div className="w-full h-96 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-pink-600">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">You've reached the end!</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              You've swiped all current pieces matching your active filters. Reset your deck or clear brand/style filters.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={resetDeck}
                className={`px-5 py-2.5 rounded-full ${
                  isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'
                } text-white font-bold text-xs tracking-wide transition-all shadow-lg`}
              >
                Shuffle & Reset Deck
              </button>
              {(brandFilter.length > 0 || categoryFilter.length > 0 || itemTypeFilter !== 'single' || sizeFilter !== 'all' || priceRangeFilter.active) && (
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
          Brought closer to the center, enlarged ~10% for mobile
          1. Dislike (Pass / Swipe Left)
          2. Undo (RotateCcw)
          3. Save (Bookmark - throws card into top right 'saved' button & acts as like for stats)
          4. Like (Thumbs Up / Swipe Right)
      */}
      <div className="relative z-20 flex items-center justify-center gap-3.5 sm:gap-5 px-4 pt-1 pb-1 flex-shrink-0">
        {/* 1. Red Dislike Button - Circular aspect-square & brought closer to center */}
        <button
          onClick={triggerDislike}
          disabled={!currentItem || hasReachedDailyLimit || tossState !== null || isSavingThrow}
          className="relative group w-[76px] h-[76px] min-w-[76px] min-h-[76px] aspect-square rounded-full bg-red-950/20 border-2 border-red-500/80 hover:bg-red-500/15 hover:border-red-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-red-500/15 flex items-center justify-center disabled:opacity-40 cursor-pointer"
          title="Pass / Dislike (Swipe Left)"
        >
          <ThumbsDown className="w-8 h-8 sm:w-9 sm:h-9 relative z-10 fill-red-500 text-red-500 stroke-red-500" strokeWidth={1.5} />
        </button>

        {/* Center Controls: Undo + Save button - 10% larger */}
        <div className="flex items-center gap-3">
          {/* 2. Undo Button */}
          <button
            onClick={handleUndo}
            disabled={!canUndo || tossState !== null || isSavingThrow}
            className={`w-[54px] h-[54px] min-w-[54px] min-h-[54px] aspect-square rounded-full border transition-all duration-300 shadow-md flex items-center justify-center cursor-pointer ${
              canUndo
                ? 'border-amber-400 bg-amber-950/50 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.7)] hover:border-amber-300 hover:text-amber-200 hover:scale-105 active:scale-95 animate-pulse'
                : 'border-slate-800 bg-slate-900/60 text-slate-500 opacity-30 pointer-events-none'
            }`}
            title="Undo last swipe"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* 3. Save Button - Throws card to top right Saved button & treated as like for stats */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSaveThrow();
            }}
            disabled={!currentItem || tossState !== null || isSavingThrow}
            className={`w-[54px] h-[54px] min-w-[54px] min-h-[54px] aspect-square rounded-full transition-all shadow-md flex items-center justify-center group cursor-pointer ${
              currentItem && isItemInWishlist(currentItem.id)
                ? `${isLight ? 'cosmic-gradient-bg-light' : 'cosmic-gradient-bg'} text-white shadow-[0_0_16px_rgba(219,39,119,0.55)] border-2 border-transparent`
                : isLight
                ? 'cosmic-gradient-border-light text-slate-700 hover:text-pink-600 hover:scale-105 active:scale-95'
                : 'cosmic-gradient-border text-slate-300 hover:text-pink-400 hover:scale-105 active:scale-95'
            }`}
            title={currentItem && isItemInWishlist(currentItem.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
          >
            <Bookmark
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                currentItem && isItemInWishlist(currentItem.id) ? 'fill-white text-white scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* 4. Green Like Button - Circular aspect-square & brought closer to center */}
        <button
          onClick={triggerLike}
          disabled={!currentItem || hasReachedDailyLimit || tossState !== null || isSavingThrow}
          className="relative group w-[76px] h-[76px] min-w-[76px] min-h-[76px] aspect-square rounded-full bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-600/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] flex items-center justify-center disabled:opacity-40 cursor-pointer"
          title="Like & Curate (Swipe Right)"
        >
          <ThumbsUp className="w-8 h-8 sm:w-9 sm:h-9 relative z-10 fill-transparent stroke-white text-transparent" strokeWidth={2.4} />
        </button>
      </div>

      {/* Daily Swipe Limit Modal (When user reaches their configured limit) */}
      {hasReachedDailyLimit && (
        <div
          onClick={() => bypassSwipeLimit()}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-4 pt-[max(12px,calc(env(safe-area-inset-top)+8px))] overflow-y-auto overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'} border rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto overscroll-contain cursor-default relative pb-5 mt-2 sm:mt-4 mb-20`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => bypassSwipeLimit()}
              className={`sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'} backdrop-blur-md shadow-lg transition-all`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`w-14 h-14 rounded-full ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'} flex items-center justify-center mx-auto text-white shadow-lg`}>
              <TrendingUp className="w-7 h-7 text-white" />
            </div>

            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                Daily Goal Reached
              </span>
              <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1`}>Daily Swipe Limit Reached</h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} mt-1 leading-relaxed`}>
                You've curated <span className={`font-bold ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>{swipesToday} pieces</span> today (your daily limit is set to {userProfile.preferences.dailySwipeLimit}).
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={bypassSwipeLimit}
                className={`w-full py-3 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white font-black text-xs transition-all shadow-lg active:scale-[0.99]`}
              >
                Bypass Limit & Keep Swiping
              </button>

              <button
                onClick={() => {
                  setIsSavedOverlayOpen(true);
                }}
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-[max(12px,calc(env(safe-area-inset-top)+8px))] overflow-y-auto overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
                : 'bg-slate-900 border-slate-700 text-white shadow-2xl'
            } border rounded-2xl max-w-sm w-full p-5 animate-popup max-h-[88vh] overflow-y-auto overscroll-contain cursor-default relative pb-5 mt-2 sm:mt-4 mb-20`}
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
              <SlidersHorizontal className="w-4 h-4" style={{ stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }} />
              <h3 className="font-bold text-base">Filters & Preferences</h3>
            </div>

            {/* 1. Item Presentation Buttons */}
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
                          ? 'cosmic-gradient-bg-light text-white shadow-md shadow-pink-600/30'
                          : 'cosmic-gradient-bg text-white shadow-md shadow-pink-600/40'
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

            {/* 2. Multiple Category selection */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Category
                </label>
                <span className={`text-[10px] font-mono font-bold ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                  {categoryFilter.length === 0 ? 'All Categories' : categoryFilter.join(', ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => {
                  const isAll = c === 'all';
                  const isSelected = isAll
                    ? categoryFilter.length === 0
                    : categoryFilter.some((cat) => cat.toLowerCase() === c.toLowerCase());

                  return (
                    <button
                      key={c}
                      onClick={() => toggleCategoryFilter(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? isLight
                            ? 'cosmic-gradient-bg-light text-white font-bold shadow-sm shadow-pink-600/30'
                            : 'cosmic-gradient-bg text-white font-bold shadow-sm shadow-pink-600/40'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isAll ? 'All' : c}
                    </button>
                  );
                })}
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
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                      sizeFilter === s
                        ? isLight
                          ? 'cosmic-gradient-bg-light text-white font-bold shadow-sm shadow-pink-600/30'
                          : 'cosmic-gradient-bg text-white font-bold shadow-sm shadow-pink-600/40'
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
                          ? 'cosmic-gradient-bg-light text-white shadow-md shadow-pink-600/30'
                          : 'cosmic-gradient-bg text-white shadow-md shadow-pink-600/40'
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
                <span className={`font-mono font-bold text-xs ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
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
                className="w-full accent-pink-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
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
                className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all shadow-md ${
                  isLight
                    ? 'cosmic-gradient-bg-light text-white shadow-pink-600/30 hover:opacity-95'
                    : 'cosmic-gradient-bg text-white shadow-pink-600/40 hover:opacity-95'
                }`}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Garment Details Modal (Tapping product card opens this) - Positioned near top of screen */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-[max(12px,calc(env(safe-area-inset-top)+8px))] overflow-y-auto overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'} border rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-popup max-h-[88vh] overflow-y-auto overscroll-contain cursor-default relative pb-5 mt-2 sm:mt-4 mb-24`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setInspectItem(null)}
              className={`sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'} backdrop-blur-md shadow-lg transition-all`}
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-10">
              <span className={`text-[10px] font-extrabold uppercase ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} tracking-wider block`}>
                {inspectItem.brand}
              </span>
              <h3 className={`text-lg font-black ${isLight ? 'text-sky-950' : 'text-white'}`}>{inspectItem.name}</h3>
            </div>

            <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={inspectItem.image}
                alt={inspectItem.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-sm font-mono text-sm font-bold text-white border border-white/20 shadow-md">
                ${inspectItem.price}
              </span>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
              {inspectItem.description}
            </p>

            {/* Trending # Qualities reserved for when user taps for more info */}
            {inspectItem.aesthetics && inspectItem.aesthetics.length > 0 && (
              <div className="space-y-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Trending Qualities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectItem.aesthetics.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isLight
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-slate-800/80 text-slate-200 border border-slate-700/80'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Material</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inspectItem.material}</span>
              </div>
              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Silhouette Fit</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inspectItem.fit}</span>
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
                  setSendItemModalItem(inspectItem);
                  setInspectItem(null);
                }}
                className={`p-3 rounded-xl border transition-colors ${
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
                  toggleWishlist(inspectItem);
                }}
                className={`p-3 rounded-xl border transition-colors ${
                  isItemInWishlist(inspectItem.id)
                    ? isLight ? 'cosmic-gradient-bg-light border-pink-400 text-white shadow-sm' : 'cosmic-gradient-bg border-pink-500 text-white shadow-sm'
                    : isLight ? 'border-slate-300 bg-slate-50 text-slate-600 hover:text-black' : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isItemInWishlist(inspectItem.id) ? 'fill-white text-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Saved Overlay (Wishlist) dropping down from top with smooth bouncy animation */}
      {isSavedOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl overflow-y-auto overscroll-contain animate-wishlist-dropdown pb-28">
          <WishlistTab onClose={() => setIsSavedOverlayOpen(false)} isOverlay={true} />
        </div>
      )}
    </div>
  );
};
