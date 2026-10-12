import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Toasts } from './components/Toasts';
import { CosmicSkyBackground } from './components/CosmicSkyBackground';
import { InboxModal } from './components/chat/InboxModal';
import { SendItemModal } from './components/chat/SendItemModal';
import { SwipeTab } from './components/tabs/SwipeTab';
import { WishlistTab } from './components/tabs/WishlistTab';
import { CartTab } from './components/tabs/CartTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { UploadTab } from './components/tabs/UploadTab';

// Universal SVG gradient definitions matching wishlist underline / swipe icon colors
const CosmicGradientSvgDefs: React.FC = () => {
  return (
    <svg
      className="absolute pointer-events-none w-0 h-0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* Dark theme diagonal cascading gradient */}
        <linearGradient id="cosmicCascadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#db2777">
            <animate attributeName="stop-color" values="#db2777;#818cf8;#c084fc;#db2777" dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="#818cf8">
            <animate attributeName="stop-color" values="#818cf8;#c084fc;#db2777;#818cf8" dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#c084fc">
            <animate attributeName="stop-color" values="#c084fc;#db2777;#818cf8;#c084fc" dur="6s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* Light theme diagonal cascading gradient */}
        <linearGradient id="cosmicCascadeGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#db2777">
            <animate attributeName="stop-color" values="#db2777;#f43f5e;#fb7185;#db2777" dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="#f43f5e">
            <animate attributeName="stop-color" values="#f43f5e;#fb7185;#db2777;#f43f5e" dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#fb7185">
            <animate attributeName="stop-color" values="#fb7185;#db2777;#f43f5e;#fb7185" dur="6s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main key={activeTab} className="flex-1 w-full overflow-x-hidden animate-page-enter relative z-10">
      {activeTab === 'swipe' && <SwipeTab />}
      {activeTab === 'wishlist' && <WishlistTab />}
      {activeTab === 'cart' && <CartTab />}
      {activeTab === 'upload' && <UploadTab />}
      {activeTab === 'profile' && <ProfileTab />}
    </main>
  );
};

// Enforce portrait mode app-wide, but allow screen rotation whenever user is in the chat screen
const PortraitModeOrientationHandler: React.FC = () => {
  const { isInboxOpen } = useApp();
  const [isMobileLandscape, setIsMobileLandscape] = React.useState(false);

  useEffect(() => {
    // If in chat screen, allow orientation to rotate freely
    if (isInboxOpen) {
      try {
        if ('orientation' in screen && 'unlock' in (screen.orientation as any)) {
          (screen.orientation as any).unlock();
        }
      } catch (e) {}
      setIsMobileLandscape(false);
      return;
    }

    // App-wide outside chat: lock rotation in portrait mode
    try {
      if ('orientation' in screen && 'lock' in (screen.orientation as any)) {
        (screen.orientation as any).lock('portrait').catch(() => {});
      }
    } catch (e) {}

    const handleOrientationChange = () => {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 700;
      setIsMobileLandscape(isTouch && isLandscape);
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isInboxOpen]);

  if (!isMobileLandscape || isInboxOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-3xl cosmic-gradient-border flex items-center justify-center mb-4 animate-pulse">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#cosmicCascadeGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      </div>
      <h2 className="text-base font-black tracking-wider text-white mb-2 uppercase">
        Portrait Mode Locked
      </h2>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-3">
        Please rotate your device back to portrait orientation to continue exploring clothes.
      </p>
      <span className="text-[11px] font-mono cosmic-gradient-text font-bold">
        ✦ Screen rotation is enabled in Chat ✦
      </span>
    </div>
  );
};

const AppShell: React.FC = () => {
  const { userProfile, activeTab, tabResetTimestamp } = useApp();
  const isLight = userProfile.preferences.theme === 'light';

  // Always scroll to the top of the tab whenever switched or reset
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab, tabResetTimestamp]);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col font-sans antialiased relative overflow-x-hidden ${
        isLight
          ? 'text-slate-900 selection:bg-pink-600 selection:text-white'
          : 'text-white selection:bg-pink-600 selection:text-white'
      }`}
    >
      <CosmicGradientSvgDefs />
      <PortraitModeOrientationHandler />
      {/* Non-invasive cosmic night sky theme (dark) and day sky cosmic theme (light) */}
      <CosmicSkyBackground isLight={isLight} />
      <Toasts />
      <MainContent />
      <InboxModal />
      <SendItemModal />
      {/* Toolbar stays the exact same fixed dark navigation bar */}
      <Navigation />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
