import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Toasts } from './components/Toasts';
import { CosmicSkyBackground } from './components/CosmicSkyBackground';
import { SwipeTab } from './components/tabs/SwipeTab';
import { WishlistTab } from './components/tabs/WishlistTab';
import { CartTab } from './components/tabs/CartTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { UploadTab } from './components/tabs/UploadTab';

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
  const { userProfile } = useApp();
  const isLight = userProfile.preferences.theme === 'light';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col font-sans antialiased relative overflow-x-hidden ${
        isLight
          ? 'text-slate-900 selection:bg-pink-300 selection:text-black'
          : 'text-white selection:bg-pink-300 selection:text-black'
      }`}
    >
      {/* Non-invasive cosmic night sky theme (dark) and day sky cosmic theme (light) */}
      <CosmicSkyBackground isLight={isLight} />
      <Toasts />
      <MainContent />
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
