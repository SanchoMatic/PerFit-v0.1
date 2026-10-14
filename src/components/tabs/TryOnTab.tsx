import React from 'react';
import { Sparkles, Shirt } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TryOnTab: React.FC = () => {
  const { userProfile } = useApp();
  const isLight = userProfile.preferences.theme === 'light';

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 pt-[max(16px,env(safe-area-inset-top))] pb-28 max-w-md mx-auto text-center select-none">
      <div className="relative mb-6">
        <div className={`w-20 h-20 rounded-3xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'} flex items-center justify-center text-white shadow-xl`}>
          <Shirt className="w-10 h-10 text-white" strokeWidth={1.8} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-black/80 border border-white/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
        </div>
      </div>

      <span className={`text-[11px] font-mono uppercase font-bold tracking-widest px-3 py-1 rounded-full ${
        isLight ? 'cosmic-gradient-border-light text-slate-800' : 'cosmic-gradient-border text-white'
      } mb-3`}>
        Virtual Fitting Room
      </span>

      <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} mb-2`}>
        Try On
      </h1>

      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} max-w-xs leading-relaxed`}>
        Interactive AI virtual try-on and wardrobe styling preview will be available here soon.
      </p>
    </div>
  );
};
