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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-slate-800 text-white pb-safe">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
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
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 transition-all duration-200 group ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-emerald-500/15 text-emerald-400' : 'group-hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>

                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {item.accentDot && !isActive && (
                  <span className="absolute 0 top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
                )}
              </div>

              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="absolute -bottom-1 w-4 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
