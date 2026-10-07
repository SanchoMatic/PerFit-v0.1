import React from 'react';
import { Bookmark, ShoppingBag, User, PlusCircle } from 'lucide-react';
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
          <stop offset="0%" stopColor="#db2777" /> {/* pink-600 */}
          <stop offset="55%" stopColor={isLight ? '#f43f5e' : '#818cf8'} /> {/* rose-500 or indigo-400 */}
          <stop offset="100%" stopColor={isLight ? '#fb7185' : '#c084fc'} />
        </linearGradient>
      </defs>
      {/* 3 descending cascading pill bars with non-zero dimensions */}
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
  const { activeTab, setActiveTab, resetActiveTab, cartCount, wishlistItems, userProfile } = useApp();
  const isLight = userProfile.preferences.theme === 'light';

  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number; isLight?: boolean }>;
    badge?: number;
    accentDot?: boolean;
  }> = [
    {
      id: 'swipe',
      label: 'Swipe',
      icon: (props) => <CascadeIcon {...props} isLight={isLight} />,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Bookmark,
      badge: wishlistItems.length > 0 ? wishlistItems.length : undefined,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: PlusCircle,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 ${
        isLight
          ? 'bg-zinc-200/95 border-t border-zinc-300/90 text-zinc-900'
          : 'bg-black/90 border-t border-slate-800 text-white'
      } backdrop-blur-md pb-safe select-none shadow-lg`}
    >
      <div className="w-full max-w-md mx-auto px-1 py-1.5 grid grid-cols-5 items-center justify-items-stretch">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                resetActiveTab(item.id);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
              }}
              className={`w-full relative flex flex-col items-center justify-center py-1 transition-colors duration-150 group ${
                isActive
                  ? isLight
                    ? 'text-pink-600'
                    : 'text-pink-500'
                  : isLight
                  ? 'text-zinc-800 hover:text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div
                  className={`p-1.5 rounded-xl transition-colors duration-150 flex items-center justify-center ${
                    isActive
                      ? isLight
                        ? 'bg-pink-600/15 text-pink-600'
                        : 'bg-pink-600/25 text-pink-500'
                      : isLight
                      ? 'group-hover:bg-zinc-300/80 text-zinc-800 group-hover:text-black'
                      : 'group-hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={isActive ? 2.5 : 2}
                    style={
                      isActive
                        ? { stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }
                        : undefined
                    }
                  />
                </div>

                {item.badge !== undefined && (
                  <span className={`absolute -top-0.5 -right-0.5 ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'} text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm pointer-events-none ring-1 ring-white/20`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] tracking-tight mt-0.5 truncate max-w-full px-0.5 text-center ${
                  isActive
                    ? `${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} font-bold`
                    : isLight
                    ? 'text-zinc-800 font-semibold'
                    : 'text-slate-400 font-medium'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <div className={`absolute -bottom-0.5 w-4 h-0.5 ${isLight ? 'cosmic-gradient-bg-light' : 'cosmic-gradient-bg'} rounded-full shadow-[0_0_8px_rgba(219,39,119,0.8)]`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
