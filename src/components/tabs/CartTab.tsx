import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  X,
  Sparkles,
  Heart,
  Info,
  Send,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem } from '../../types';

export const CartTab: React.FC = () => {
  const {
    cartItems,
    savedForLaterItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    saveForLater,
    moveToCartFromSaved,
    removeFromSavedForLater,
    cartTotal,
    showToast,
    setActiveTab,
    userProfile,
    addToCart,
    isItemInWishlist,
    toggleWishlist,
    addPurchasedItems,
    activeTab,
    tabResetTimestamp,
    setSendItemModalItem,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);

  // Return to main cart view when tab is clicked
  useEffect(() => {
    setInspectItem(null);
    setOrderComplete(false);
  }, [activeTab, tabResetTimestamp]);

  const shipping = cartTotal > 200 || cartTotal === 0 ? 0 : 15;
  const discountAmount = Math.round(cartTotal * promoDiscount);
  const finalTotal = Math.max(0, cartTotal - discountAmount + shipping);
  const totalItemsCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'PINK20' || code === 'PERFIT20' || code === 'AESTHRO20' || code === 'KLOSET20' || code === 'GREEN20') {
      setPromoDiscount(0.2);
      showToast('Promo Applied: 20% Off!', 'Aesthro VIP discount active', 'green');
    } else if (code === 'FREESHIP') {
      setPromoDiscount(0.05);
      showToast('Free Express Shipping Applied', '', 'green');
    } else {
      showToast('Invalid promo code', 'Try code AESTHRO20 or PINK20 for 20% off', 'red');
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      // Record purchased items in user's collection
      if (cartItems.length > 0) {
        addPurchasedItems(cartItems.map((ci) => ci.item));
      }
      setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
      setOrderComplete(true);
      setIsCheckingOut(false);
      clearCart();
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pb-28 px-4 pt-[max(12px,env(safe-area-inset-top))] max-w-md mx-auto">
      {/* Top Header - Shopping Bag inside a silver circle (number bubble removed as requested) */}
      <div className="flex flex-col items-center justify-center my-3">
        {/* Silver-gray circle with shopping bag icon - Clean, no number bubble */}
        <div className={`w-16 h-16 rounded-full ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800/80 border-slate-600 text-slate-200'} border-2 flex items-center justify-center shadow-md mb-2 relative group`}>
          <ShoppingBag className="w-8 h-8 text-pink-600" strokeWidth={1.8} />
        </div>
        <h1 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Your Cart</h1>
        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {totalItemsCount > 0
            ? `${totalItemsCount} items selected`
            : 'Your shopping bag is currently empty'}
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div className="mt-4">
          {/* Cart Item List with Sketch-style Line Dividers */}
          <div className={`divide-y-2 ${isLight ? 'divide-slate-200 border-slate-200' : 'divide-slate-800 border-slate-800'} border-y-2`}>
            {cartItems.map((ci) => (
              <div
                key={`${ci.item.id}-${ci.selectedSize}-${ci.selectedColor}`}
                className="py-4 flex items-center justify-between gap-3 group"
              >
                {/* Garment Image / Icon - Clickable to open more info */}
                <div
                  onClick={() => setInspectItem(ci.item)}
                  className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 relative shadow-md cursor-pointer hover:border-pink-600 hover:scale-[1.02] transition-all"
                  title="Click to view more info"
                >
                  <img
                    src={ci.item.image}
                    alt={ci.item.name}
                    className="w-full h-full object-cover block"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors" />
                </div>

                {/* Item Details - Clickable to view more info */}
                <div
                  onClick={() => setInspectItem(ci.item)}
                  className="flex-1 min-w-0 cursor-pointer group/details"
                  title="Click to view more info"
                >
                  <span className={`text-[10px] uppercase font-bold block tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                    {ci.item.brand}
                  </span>
                  <h3 className={`text-xs font-bold ${isLight ? 'text-sky-950' : 'text-white'} truncate mb-1`}>
                    {ci.item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className={`${isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800/80 text-slate-300'} px-1.5 py-0.5 rounded text-[10px]`}>
                      Size: {ci.selectedSize}
                    </span>
                    <span className={`truncate ${isLight ? 'text-slate-500' : 'text-slate-400'} text-[10px]`}>
                      {ci.selectedColor}
                    </span>
                  </div>

                  {/* Quantity Stepper & Save for Later */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(ci.item.id, -1, ci.selectedSize);
                        }}
                        className={`w-6 h-6 rounded-md ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'} border flex items-center justify-center transition-colors`}
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} px-1.5 min-w-[18px] text-center`}>
                        {ci.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(ci.item.id, 1, ci.selectedSize);
                        }}
                        className={`w-6 h-6 rounded-md ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'} border flex items-center justify-center transition-colors`}
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Save for later button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveForLater(ci.item.id, ci.selectedSize);
                      }}
                      className="text-[11px] font-semibold text-pink-500 hover:text-pink-400 flex items-center gap-1 transition-colors px-1 py-0.5"
                      title="Save for later"
                    >
                      <Bookmark className="w-3 h-3 text-pink-500" />
                      <span>Save for later</span>
                    </button>
                  </div>
                </div>

                {/* Price & Delete */}
                <div className="flex flex-col items-end justify-between self-stretch py-1">
                  <div className="text-right">
                    <span className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} font-mono block`}>
                      ${ci.item.price * ci.quantity}
                    </span>
                    {ci.quantity > 1 && (
                      <span className="text-[10px] text-slate-400 block">
                        ${ci.item.price} ea
                      </span>
                    )}
                  </div>

                  {/* Trash Button */}
                  <button
                    onClick={() => removeFromCart(ci.item.id, ci.selectedSize)}
                    className="w-8 h-8 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/70 hover:text-red-200 transition-all flex items-center justify-center shadow-sm"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Input */}
          <form onSubmit={handleApplyPromo} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo Code (e.g. AESTHRO20)"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:border-pink-600"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-pink-600 hover:bg-slate-700 transition-colors"
            >
              Apply
            </button>
          </form>

          {/* Order Summary Breakdown */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-white font-mono">${cartTotal}</span>
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between text-pink-600 font-semibold">
                <span>VIP Discount (20%)</span>
                <span className="font-mono">-${discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Estimated Shipping</span>
              <span className="text-white font-mono">
                {shipping === 0 ? <span className="text-pink-600 font-semibold">FREE</span> : `$${shipping}`}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm">
              <span className="font-extrabold text-white">Total</span>
              <span className="text-lg font-black text-pink-600 font-mono">
                ${finalTotal}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className={`w-full mt-4 py-3.5 rounded-2xl ${
              isLight
                ? 'cosmic-gradient-bg-light shadow-pink-600/25'
                : 'cosmic-gradient-bg shadow-pink-600/35'
            } text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-xl active:scale-[0.99] disabled:opacity-60`}
          >
            {isCheckingOut ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </div>
            ) : (
              <>
                <span>Secure Checkout • ${finalTotal}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
            <span>Encrypted checkout • Free 30-day returns • Guaranteed Authentic</span>
          </div>

          {/* Saved For Later List Under Checkout Button */}
          {savedForLaterItems.length > 0 && (
            <div className="mt-8 pt-6 border-t-2 border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-pink-500" />
                  <h2 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Saved for Later
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {savedForLaterItems.length} {savedForLaterItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className={`divide-y ${isLight ? 'divide-slate-200 border-slate-200' : 'divide-slate-800 border-slate-800'} border-y`}>
                {savedForLaterItems.map((sItem) => (
                  <div
                    key={`${sItem.item.id}-${sItem.selectedSize}`}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => setInspectItem(sItem.item)}
                      className="w-14 h-18 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 cursor-pointer shadow-sm"
                    >
                      <img
                        src={sItem.item.image}
                        alt={sItem.item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] uppercase font-bold block ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                        {sItem.item.brand}
                      </span>
                      <h3
                        onClick={() => setInspectItem(sItem.item)}
                        className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate cursor-pointer`}
                      >
                        {sItem.item.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Size: {sItem.selectedSize}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300 font-semibold">${sItem.item.price}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => moveToCartFromSaved(sItem.item.id, sItem.selectedSize)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Move to Cart</span>
                        </button>
                        <button
                          onClick={() => removeFromSavedForLater(sItem.item.id, sItem.selectedSize)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty Cart State */
        <div className="mt-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center mt-3">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ShoppingBag className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Your cart is empty</h3>
            <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
              Swipe through clothes or explore your collection wishlist to add statement pieces to your bag.
            </p>
            <button
              onClick={() => setActiveTab('swipe')}
              className="px-5 py-2.5 rounded-full bg-pink-600 text-white text-xs font-black hover:bg-pink-500 transition-colors shadow-lg shadow-pink-600/20"
            >
              Start Swiping Clothes
            </button>
          </div>

          {/* Saved For Later list displayed even when active cart is empty */}
          {savedForLaterItems.length > 0 && (
            <div className="mt-8 pt-6 border-t-2 border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-pink-500" />
                  <h2 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Saved for Later
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {savedForLaterItems.length} {savedForLaterItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className={`divide-y ${isLight ? 'divide-slate-200 border-slate-200' : 'divide-slate-800 border-slate-800'} border-y`}>
                {savedForLaterItems.map((sItem) => (
                  <div
                    key={`${sItem.item.id}-${sItem.selectedSize}`}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => setInspectItem(sItem.item)}
                      className="w-14 h-18 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 cursor-pointer shadow-sm"
                    >
                      <img
                        src={sItem.item.image}
                        alt={sItem.item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] uppercase font-bold block ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                        {sItem.item.brand}
                      </span>
                      <h3
                        onClick={() => setInspectItem(sItem.item)}
                        className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate cursor-pointer`}
                      >
                        {sItem.item.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Size: {sItem.selectedSize}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300 font-semibold">${sItem.item.price}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => moveToCartFromSaved(sItem.item.id, sItem.selectedSize)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Move to Cart</span>
                        </button>
                        <button
                          onClick={() => removeFromSavedForLater(sItem.item.id, sItem.selectedSize)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Complete Modal */}
      {orderComplete && (
        <div
          onClick={() => {
            setOrderComplete(false);
            setActiveTab('swipe');
          }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-start justify-center pt-3 sm:pt-6 pb-16 px-3 sm:px-4 overflow-y-auto animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-white text-center shadow-2xl animate-in zoom-in-95 duration-200 cursor-default relative"
          >
            {/* Floating Close Button */}
            <button
              onClick={() => {
                setOrderComplete(false);
                setActiveTab('swipe');
              }}
              className="sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-lg transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-full bg-pink-600/20 border border-pink-600/50 flex items-center justify-center mx-auto mb-4 text-pink-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[10px] uppercase font-bold text-pink-600 tracking-wider">
              Payment Successful
            </span>
            <h2 className="text-lg font-extrabold text-white mt-1 mb-1">
              Order Confirmed!
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Tracking #{orderId}
            </p>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5 mb-5">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Arrival</span>
                <span className="text-white font-semibold">3-5 Business Days</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dispatched From</span>
                <span className="text-white font-semibold">Aesthro Global Hub</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taste Profile</span>
                <span className="text-pink-600 font-semibold">+25 XP Style Boost</span>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderComplete(false);
                setActiveTab('swipe');
              }}
              className="w-full py-3 rounded-xl bg-pink-600 text-white font-black text-xs hover:bg-pink-500 transition-colors shadow-lg shadow-pink-600/20"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}

      {/* Garment Details Modal */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'} border rounded-2xl max-w-sm w-full p-5 pb-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto overscroll-contain cursor-default relative my-auto`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setInspectItem(null)}
              className={`sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'} backdrop-blur-md shadow-lg transition-all`}
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-10">
              <span className={`text-[10px] font-extrabold uppercase ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} tracking-wider block`}>
                {inspectItem.brand}
              </span>
              <h3 className={`text-lg font-black ${isLight ? 'text-sky-950' : 'text-white'}`}>{inspectItem.name}</h3>
            </div>

            <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={inspectItem.image}
                alt={inspectItem.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-sm font-mono text-sm font-bold text-white border border-white/20 shadow-md">
                ${inspectItem.price}
              </span>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
              {inspectItem.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Material</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inspectItem.material}</span>
              </div>
              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Silhouette Fit</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inspectItem.fit}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  addToCart(inspectItem);
                  setInspectItem(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Another (${inspectItem.price})</span>
              </button>
              <button
                onClick={() => {
                  setSendItemModalItem(inspectItem);
                  setInspectItem(null);
                }}
                className={`p-3 rounded-xl border transition-colors ${
                  isLight
                    ? 'border-slate-300 bg-white text-slate-700 hover:text-pink-600 hover:border-pink-600'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-pink-400 hover:border-pink-500'
                }`}
                title="Send to Friend via Chat"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  toggleWishlist(inspectItem);
                }}
                className={`p-3 rounded-xl border transition-colors ${
                  isItemInWishlist(inspectItem.id)
                    ? isLight ? 'cosmic-gradient-bg-light border-pink-400 text-white shadow-sm' : 'cosmic-gradient-bg border-pink-500 text-white shadow-sm'
                    : isLight ? 'border-slate-300 bg-slate-50 text-slate-600 hover:text-black' : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isItemInWishlist(inspectItem.id) ? 'fill-white text-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
