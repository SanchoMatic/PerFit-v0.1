import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, X, AlertCircle } from 'lucide-react';

export const Toasts: React.FC = () => {
  const { toasts, removeToast, userProfile } = useApp();
  const isLight = userProfile.preferences.theme === 'light';

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-[max(12px,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 w-auto max-w-[300px] px-2 pointer-events-none">
      {toasts.map((toast) => {
        const isRed = toast.type === 'red';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-2.5 py-1.5 px-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
              isRed
                ? 'bg-black/95 border border-red-500/80 text-white shadow-red-950/40'
                : 'bg-black/95 border-2 border-emerald-500 text-white shadow-emerald-950/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-shrink-0 flex items-center justify-center">
                {isRed ? (
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <ShoppingBag
                    className="w-3.5 h-3.5"
                    strokeWidth={2.4}
                    style={{ stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-tight text-white truncate leading-tight">
                  {toast.message}
                </p>
                {toast.subtext && (
                  <p className="text-[9px] text-slate-300 line-clamp-1 leading-tight">
                    {toast.subtext}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-full transition-colors flex-shrink-0"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
