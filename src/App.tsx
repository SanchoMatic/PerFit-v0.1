import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Toasts } from './components/Toasts';
import { SwipeTab } from './components/tabs/SwipeTab';
import { WishlistTab } from './components/tabs/WishlistTab';
import { CartTab } from './components/tabs/CartTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { UploadTab } from './components/tabs/UploadTab';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 w-full overflow-x-hidden">
      {activeTab === 'swipe' && <SwipeTab />}
      {activeTab === 'wishlist' && <WishlistTab />}
      {activeTab === 'cart' && <CartTab />}
      {activeTab === 'upload' && <UploadTab />}
      {activeTab === 'profile' && <ProfileTab />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black flex flex-col font-sans antialiased">
        <Toasts />
        <MainContent />
        <Navigation />
      </div>
    </AppProvider>
  );
}
