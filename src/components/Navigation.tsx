import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingBag, User, Heart, Shirt } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';

// Simple 3-line cascade icon with the same color gradient as the wishlist underline
const CascadeIcon: React.FC<{ className?: string; strokeWidth?: number; isLight?: boolean }> = ({
  className,
  isLight = false,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || 'w-5 h-5'}
    >
      <defs>
        <linearGradient
          id="navWishlistCascadeGrad"
          gradientUnits="userSpaceOnUse"
          x1="3"
          y1="0"
          x2="21"
          y2="0"
        >
          <stop offset="0%" stopColor="#db2777" />
          <stop offset="55%" stopColor={isLight ? '#f43f5e' : '#818cf8'} />
          <stop offset="100%" stopColor={isLight ? '#fb7185' : '#c084fc'} />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="5"
        width="18"
        height="2.5"
        rx="1.25"
        fill="url(#navWishlistCascadeGrad)"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="2.5"
        rx="1.25"
        fill="url(#navWishlistCascadeGrad)"
      />
      <rect
        x="7"
        y="17"
        width="10"
        height="2.5"
        rx="1.25"
        fill="url(#navWishlistCascadeGrad)"
      />
    </svg>
  );
};

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, resetActiveTab, cartCount, userProfile } = useApp();
  const isLight = userProfile.preferences.theme === 'light';

  // Tab order: swipe, for you, cart, try on, profile
  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{
      className?: string;
      strokeWidth?: number;
      isLight?: boolean;
      style?: React.CSSProperties;
    }>;
    badge?: number;
  }> = [
    {
      id: 'swipe',
      label: 'Swipe',
      icon: (props) => <CascadeIcon {...props} isLight={isLight} />,
    },
    {
      id: 'upload',
      label: 'For You',
      icon: Heart,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'try-on',
      label: 'Try On',
      icon: Shirt,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  // Instagram-style scroll-responsive shrink state (shrinks to 75% from bottom up)
  const [isShrunk, setIsShrunk] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || document.documentElement.scrollTop;
          const delta = currentY - lastScrollY.current;

          if (currentY > 60 && delta > 8) {
            // Scrolling down -> shrink to 75% from bottom up
            setIsShrunk(true);
          } else if (delta < -8 || currentY <= 30) {
            // Scrolling up or near top -> restore
            setIsShrunk(false);
          }
          lastScrollY.current = Math.max(0, currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Frictionless draggable selector & mathematically centered smooth snapping onto icons
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPixelX, setDragPixelX] = useState<number | null>(null);
  const [gridWidth, setGridWidth] = useState(0);

  const activeIndex = navItems.findIndex((it) => it.id === activeTab);
  const safeActiveIndex = activeIndex !== -1 ? activeIndex : 0;

  useEffect(() => {
    const updateWidth = () => {
      if (gridRef.current) {
        setGridWidth(gridRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const colWidth = gridWidth > 0 ? gridWidth / navItems.length : 0;

  // Compute hovered/highlighted index based on finger position during drag
  const currentHoverIndex =
    dragPixelX !== null && colWidth > 0
      ? Math.max(0, Math.min(navItems.length - 1, Math.floor(dragPixelX / colWidth)))
      : safeActiveIndex;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gridRef.current) return;
    setIsDragging(true);
    const rect = gridRef.current.getBoundingClientRect();
    const relX = e.touches[0].clientX - rect.left;
    setGridWidth(rect.width);
    setDragPixelX(relX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !gridRef.current) return;
    if (e.cancelable) e.preventDefault();
    const rect = gridRef.current.getBoundingClientRect();
    const relX = e.touches[0].clientX - rect.left;
    setDragPixelX(relX);
  };

  const handleTouchEnd = () => {
    if (isDragging && dragPixelX !== null && colWidth > 0) {
      const finalIdx = Math.max(
        0,
        Math.min(navItems.length - 1, Math.floor(dragPixelX / colWidth))
      );
      const selectedItem = navItems[finalIdx];
      if (selectedItem) {
        if (selectedItem.id === activeTab) {
          resetActiveTab(selectedItem.id);
        } else {
          setActiveTab(selectedItem.id);
        }
      }
    }
    setIsDragging(false);
    setDragPixelX(null);
  };

  // Selector pill geometry: perfectly centered horizontally and vertically over the icon
  const pillWidthPx = colWidth > 0 ? Math.min(54, colWidth - 6) : 48;
  const targetIconCenterX = (safeActiveIndex + 0.5) * colWidth;
  const snappedPillLeft = targetIconCenterX - pillWidthPx / 2;

  const draggedPillLeft =
    dragPixelX !== null && gridWidth > 0
      ? Math.max(3, Math.min(gridWidth - pillWidthPx - 3, dragPixelX - pillWidthPx / 2))
      : snappedPillLeft;

  return (
    <div
      className={`fixed bottom-6 sm:bottom-8 left-0 right-0 z-[60] pointer-events-none flex justify-center px-4 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) origin-bottom ${
        isShrunk ? 'scale-[0.75] -translate-y-4' : 'scale-100 translate-y-0'
      }`}
    >
      <nav
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`pointer-events-auto relative w-full max-w-sm sm:max-w-md ${
          isLight
            ? 'bg-white/94 border-slate-200/90 text-zinc-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.12),inset_0_1px_1px_0_rgba(255,255,255,0.95)]'
            : 'bg-neutral-950/92 border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.65),inset_0_1px_1px_0_rgba(255,255,255,0.22)]'
        } border rounded-full backdrop-blur-3xl backdrop-saturate-150 p-1 select-none touch-none transition-shadow`}
      >
        <div
          ref={gridRef}
          className="relative grid grid-cols-5 items-center justify-items-stretch z-10 w-full"
        >
          {/* Liquid glass floating highlight selector pill:
              Mathematically centered on the icon inside each tab button */}
          <div
            className={`absolute rounded-full pointer-events-none ${
              isLight
                ? 'bg-white/90 border border-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_2px_8px_rgba(0,0,0,0.08)]'
                : 'bg-white/20 border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md'
            }`}
            style={{
              width: `${pillWidthPx}px`,
              height: '42px',
              top: '2px',
              left: `${dragPixelX !== null ? draggedPillLeft : snappedPillLeft}px`,
              transition:
                dragPixelX !== null
                  ? 'none' // 0 friction free sliding while dragging
                  : 'left 280ms cubic-bezier(0.16, 1, 0.3, 1), width 280ms cubic-bezier(0.16, 1, 0.3, 1)', // Smooth snap
            }}
          />

          {navItems.map((item, idx) => {
            const isTabActive = activeTab === item.id;
            const isHighlighted = currentHoverIndex === idx;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === activeTab) {
                    resetActiveTab(item.id);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full relative flex flex-col items-center justify-center py-1 transition-transform active:scale-95 duration-150 cursor-pointer ${
                  isHighlighted || isTabActive
                    ? isLight
                      ? 'text-pink-600'
                      : 'text-white'
                    : isLight
                    ? 'text-zinc-600 hover:text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <Icon
                    className="w-5 h-5 transition-transform duration-150"
                    strokeWidth={isHighlighted || isTabActive ? 2.5 : 2}
                    style={
                      (isHighlighted || isTabActive) && item.id !== 'swipe'
                        ? { stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }
                        : undefined
                    }
                  />

                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-0.5 -right-0.5 ${
                        isLight
                          ? 'cosmic-gradient-bg-light shadow-pink-600/30'
                          : 'cosmic-gradient-bg shadow-pink-600/50'
                      } text-white font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-sm pointer-events-none ring-1 ring-white/30`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-tight truncate max-w-full px-0.5 text-center transition-colors ${
                    isHighlighted || isTabActive
                      ? `${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} font-bold`
                      : isLight
                      ? 'text-zinc-600 font-medium'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

