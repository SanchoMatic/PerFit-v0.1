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
