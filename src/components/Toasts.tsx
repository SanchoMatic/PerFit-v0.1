import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Sparkles, X, AlertCircle } from 'lucide-react';

export const Toasts: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isGreen = toast.type === 'green';
        const isRed = toast.type === 'red';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-2xl backdrop-blur-lg border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              isGreen
                ? 'bg-black/95 border-emerald-500/50 text-white shadow-emerald-950/40'
                : isRed
                ? 'bg-black/95 border-red-500/50 text-white shadow-red-950/40'
                : 'bg-black/95 border-slate-700 text-white shadow-black/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-xl ${
                  isGreen
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isRed
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isGreen ? (
                  <Sparkles className="w-4 h-4" />
                ) : isRed ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide">{toast.message}</p>
                {toast.subtext && (
                  <p className="text-[11px] text-slate-400 line-clamp-1">{toast.subtext}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
