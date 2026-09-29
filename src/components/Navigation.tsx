import React from 'react';
import { Flame, Bookmark, ShoppingBag, User, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, resetActiveTab, cartCount, wishlistItems } = useApp();

  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badge?: number;
    accentDot?: boolean;
  }> = [
    {
      id: 'swipe',
      label: 'Swipe',
      icon: Flame,
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
      accentDot: true,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-slate-800 text-white pb-safe select-none">
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
              }}
              className={`w-full relative flex flex-col items-center justify-center py-1 transition-colors duration-150 group ${
                isActive ? 'text-pink-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div
                  className={`p-1.5 rounded-xl transition-colors duration-150 flex items-center justify-center ${
                    isActive ? 'bg-pink-400/15 text-pink-300' : 'group-hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>

                {item.badge !== undefined && (
                  <span className="absolute -top-0.5 -right-0.5 bg-pink-300 text-black font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm pointer-events-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {item.accentDot && !isActive && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-300 ring-2 ring-black animate-pulse pointer-events-none" />
                )}
              </div>

              <span
                className={`text-[11px] tracking-tight mt-0.5 truncate max-w-full px-0.5 text-center ${
                  isActive ? 'text-pink-300 font-bold' : 'text-slate-400 font-medium'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="absolute -bottom-0.5 w-4 h-0.5 bg-pink-300 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
