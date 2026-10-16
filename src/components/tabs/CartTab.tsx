import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem, CartItem } from '../../types';

// Interactive swipeable cart item row with Twitter-inbox style swipe actions
const SwipeableCartItemRow: React.FC<{
  ci: CartItem;
  isLight: boolean;
  onInspect: (item: ClothingItem) => void;
  onRemove: (itemId: string, size?: string) => void;
  onSaveForLater: (itemId: string, size?: string) => void;
  onUpdateQty: (itemId: string, delta: number, size?: string) => void;
  onUpdateOptions: (itemId: string, currentSize: string, currentColor: string, newSize?: string, newColor?: string) => void;
}> = ({
  ci,
  isLight,
  onInspect,
  onRemove,
  onSaveForLater,
  onUpdateQty,
  onUpdateOptions,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState<'left' | 'right' | null>(null);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const availableSizes = ci.item.sizes && ci.item.sizes.length > 0 ? ci.item.sizes : ['XS', 'S', 'M', 'L', 'XL'];
  const availableColors = ci.item.colors && ci.item.colors.length > 0 ? ci.item.colors : ['Black', 'White', 'Gray'];

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, select, input, .dropdown-menu')) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startX.current = clientX;
    startY.current = clientY;
    isHorizontalSwipe.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || isExiting) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontalSwipe.current === false) {
      setIsDragging(false);
      return;
    }

    if (isHorizontalSwipe.current) {
      // Damped horizontal translation
      setOffsetX(dx);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || isExiting) return;
    setIsDragging(false);

    if (offsetX > 75) {
      // Swiped right -> Save for Later (Moved back to wishlist)
      setIsExiting('right');
      setTimeout(() => {
        onSaveForLater(ci.item.id, ci.selectedSize);
      }, 220);
    } else if (offsetX < -75) {
      // Swiped left -> Delete from cart
      setIsExiting('left');
      setTimeout(() => {
        onRemove(ci.item.id, ci.selectedSize);
      }, 220);
    } else {
      // Spring back
      setOffsetX(0);
    }
  };

  const isAnyMenuOpen = isSizeMenuOpen || isColorMenuOpen;
  const currentTranslate = isExiting === 'right' ? 360 : isExiting === 'left' ? -360 : offsetX;

  return (
    <div
      className={`relative select-none touch-pan-y my-1.5 rounded-2xl ${
        isAnyMenuOpen ? 'z-50 overflow-visible' : 'z-10 overflow-hidden'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
    >
      {/* Revealed swipe action backgrounds - strictly visible only from the side being slid open (iOS/Twitter style) */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        {/* 1. Left Indicator: Revealed strictly on the left when swiping right -> Save for later / Wishlist */}
        {offsetX > 0 && (
          <div
            style={{
              opacity: Math.min(1, Math.max(0, (offsetX - 6) / 45)),
            }}
            className={`absolute inset-y-0 left-0 w-full flex items-center justify-start pl-5 transition-opacity ${
              offsetX > 75
                ? isLight
                  ? 'cosmic-gradient-bg-light text-white'
                  : 'cosmic-gradient-bg text-white'
                : isLight
                ? 'bg-pink-100 text-pink-700'
                : 'bg-pink-950/90 text-pink-300'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-xs text-white">
              <Bookmark className={`w-5 h-5 text-white transition-transform ${offsetX > 75 ? 'scale-125' : ''}`} />
              <span className="text-white">Save for later</span>
            </div>
          </div>
        )}

        {/* 2. Right Indicator: Revealed strictly on the right when swiping left -> Delete */}
        {offsetX < 0 && (
          <div
            style={{
              opacity: Math.min(1, Math.max(0, (-offsetX - 6) / 45)),
            }}
            className={`absolute inset-y-0 right-0 w-full flex items-center justify-end pr-5 transition-opacity ${
              offsetX < -75
                ? 'bg-red-600 text-white'
                : isLight
                ? 'bg-red-100 text-red-700'
                : 'bg-red-950/90 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-xs text-white">
              <span className="text-white">Delete</span>
              <Trash2 className={`w-5 h-5 text-white transition-transform ${offsetX < -75 ? 'scale-125' : ''}`} />
            </div>
          </div>
        )}
      </div>

      {/* Front interactive row: 100% OPAQUE with rounded-2xl so indicators never shine through the card body */}
      <div
        style={{
          transform: `translate3d(${currentTranslate}px, 0, 0)`,
          transition: isDragging ? 'none' : 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative ${
          isAnyMenuOpen ? 'z-50' : 'z-10'
        } flex items-center justify-between gap-3.5 py-3.5 px-3 rounded-2xl border ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : 'bg-slate-900 border-slate-800 shadow-md text-white'
        }`}
      >
        {/* Garment Image / Thumbnail - ONLY tapping image or title opens inspect info */}
        <div
          onClick={() => onInspect(ci.item)}
          className="w-18 h-22 sm:w-20 sm:h-24 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 relative shadow-md cursor-pointer hover:border-pink-600 hover:scale-[1.02] transition-all"
          title="Tap image to view info"
        >
          <img
            src={ci.item.image}
            alt={ci.item.name}
            className="w-full h-full object-cover block pointer-events-none"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors pointer-events-none" />
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] uppercase font-bold block tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
            {ci.item.brand}
          </span>

          {/* ONLY tapping title opens inspect info */}
          <h3
            onClick={() => onInspect(ci.item)}
            className={`text-xs font-bold ${isLight ? 'text-sky-950' : 'text-white'} truncate mb-1.5 cursor-pointer hover:underline`}
            title="Tap title to view info"
          >
            {ci.item.name}
          </h3>

          {/* Dropdown menus for Size and Color - independent clickable dropdowns with z-index elevation */}
          <div className="flex items-center gap-2 text-[11px] mb-2 relative">
            {/* Size Dropdown */}
            <div className={`relative ${isSizeMenuOpen ? 'z-50' : 'z-20'}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSizeMenuOpen(!isSizeMenuOpen);
                  setIsColorMenuOpen(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
                title="Change Size"
              >
                <span>Size: {ci.selectedSize}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isSizeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSizeMenuOpen(false);
                    }}
                  />
                  <div className={`dropdown-menu absolute top-full left-0 mt-1 w-28 ${
                    isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : 'bg-slate-900 border-slate-700 text-white shadow-2xl'
                  } border rounded-xl shadow-2xl py-1 z-50 max-h-44 overflow-y-auto`}>
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateOptions(ci.item.id, ci.selectedSize, ci.selectedColor, s, undefined);
                          setIsSizeMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left text-xs font-semibold flex items-center justify-between ${
                          s === ci.selectedSize
                            ? isLight ? 'bg-pink-50 text-pink-600 font-bold' : 'bg-pink-950/50 text-pink-400 font-bold'
                            : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{s}</span>
                        {s === ci.selectedSize && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Color Dropdown */}
            <div className={`relative ${isColorMenuOpen ? 'z-50' : 'z-20'}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsColorMenuOpen(!isColorMenuOpen);
                  setIsSizeMenuOpen(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
                title="Change Color"
              >
                <span className="truncate max-w-[80px]">{ci.selectedColor}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isColorMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsColorMenuOpen(false);
                    }}
                  />
                  <div className={`dropdown-menu absolute top-full left-0 mt-1 w-32 ${
                    isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : 'bg-slate-900 border-slate-700 text-white shadow-2xl'
                  } border rounded-xl shadow-2xl py-1 z-50 max-h-44 overflow-y-auto`}>
                    {availableColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateOptions(ci.item.id, ci.selectedSize, ci.selectedColor, undefined, c);
                          setIsColorMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left text-xs font-semibold flex items-center justify-between ${
                          c === ci.selectedColor
                            ? isLight ? 'bg-pink-50 text-pink-600 font-bold' : 'bg-pink-950/50 text-pink-400 font-bold'
                            : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{c}</span>
                        {c === ci.selectedColor && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quantity Stepper & Save for Later (10% larger) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQty(ci.item.id, -1, ci.selectedSize);
                }}
                className={`w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg ${
                  isLight
                    ? 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                } border flex items-center justify-center transition-colors cursor-pointer`}
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} px-1.5 min-w-[20px] text-center`}>
                {ci.quantity}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQty(ci.item.id, 1, ci.selectedSize);
                }}
                className={`w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg ${
                  isLight
                    ? 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                } border flex items-center justify-center transition-colors cursor-pointer`}
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Save for later button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSaveForLater(ci.item.id, ci.selectedSize);
              }}
              className="text-[11px] font-bold text-pink-500 hover:text-pink-400 flex items-center gap-1 transition-colors px-1 py-1 cursor-pointer"
              title="Save to Wishlist"
            >
              <Bookmark className="w-3.5 h-3.5 text-pink-500" />
              <span>Save for later</span>
            </button>
          </div>
        </div>

        {/* Price & Delete Button (10% larger) */}
        <div className="flex flex-col items-end justify-between self-stretch py-1 flex-shrink-0">
          <div className="text-right">
            <span className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} font-mono block`}>
              ${ci.item.price * ci.quantity}
            </span>
            {ci.quantity > 1 && (
              <span className="text-[10px] text-slate-400 block font-mono">
                ${ci.item.price} ea
              </span>
            )}
          </div>

          {/* Trash Button - 10% larger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(ci.item.id, ci.selectedSize);
            }}
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/70 hover:text-red-200 transition-all flex items-center justify-center shadow-sm cursor-pointer"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CartTab: React.FC = () => {
  const {
    cartItems,
    savedForLaterItems,
    removeFromCart,
    updateCartQuantity,
    updateCartItemOptions,
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
      {/* Top Header - Shopping Bag inside a silver circle scaled up HUD */}
      <div className="flex flex-col items-center justify-center my-4">
        {/* Silver-gray circle with shopping bag icon with cosmic gradient */}
        <div className={`w-18 h-18 rounded-full ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800/80 border-slate-600 text-slate-200'} border-2 flex items-center justify-center shadow-lg mb-2.5 relative group`}>
          <ShoppingBag
            className="w-9 h-9"
            style={{ stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }}
            strokeWidth={1.8}
          />
        </div>
        <h1 className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Your Cart</h1>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
          {totalItemsCount > 0
            ? `${totalItemsCount} items selected`
            : 'Your shopping bag is currently empty'}
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div className="mt-4">
          {/* Cart Item List with Sketch-style Line Dividers & Twitter-style swipe actions */}
          <div className={`divide-y-2 ${isLight ? 'divide-slate-200 border-slate-200' : 'divide-slate-800 border-slate-800'} border-y-2`}>
            {cartItems.map((ci) => (
              <SwipeableCartItemRow
                key={`${ci.item.id}-${ci.selectedSize}-${ci.selectedColor}`}
                ci={ci}
                isLight={isLight}
                onInspect={(item) => setInspectItem(item)}
                onRemove={(itemId, size) => removeFromCart(itemId, size)}
                onSaveForLater={(itemId, size) => saveForLater(itemId, size)}
                onUpdateQty={(itemId, delta, size) => updateCartQuantity(itemId, delta, size)}
                onUpdateOptions={(itemId, curSize, curColor, newSize, newColor) =>
                  updateCartItemOptions(itemId, curSize, curColor, newSize, newColor)
                }
              />
            ))}
          </div>

          {/* Promo Code Input */}
          <form onSubmit={handleApplyPromo} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo Code (e.g. AESTHRO20)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-black text-white transition-colors cursor-pointer shadow-sm"
            >
              Apply
            </button>
          </form>

          {/* Order Summary Breakdown */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span className="text-slate-300">Subtotal</span>
              <span className="text-white font-mono font-bold">${cartTotal}</span>
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>VIP Discount (20%)</span>
                <span className="font-mono">-${discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span className="text-slate-300">Estimated Shipping</span>
              <span className="text-white font-mono font-bold">
                {shipping === 0 ? <span className="text-white font-black">FREE</span> : `$${shipping}`}
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-800 flex justify-between items-baseline text-sm">
              <span className="font-black text-white text-base">Total</span>
              <span className="text-xl font-black text-white font-mono">
                ${finalTotal}
              </span>
            </div>
          </div>

          {/* Checkout Button - Vibrant Green */}
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full mt-4 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-base tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-950/40 active:scale-[0.99] border border-emerald-500/50 disabled:opacity-60 cursor-pointer"
          >
            {isCheckingOut ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </div>
            ) : (
              <>
                <span>Secure Checkout • ${finalTotal}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Encrypted Shield in Green - Centered under the checkout button */}
          <div className="mt-3.5 w-full flex items-center justify-center text-center gap-1.5 text-xs text-slate-400 px-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-center font-medium">Encrypted checkout • Free 30-day returns • Guaranteed Authentic</span>
          </div>

          {/* Saved For Later List Under Checkout Button */}
          {savedForLaterItems.length > 0 && (
            <div className="mt-8 pt-6 border-t-2 border-slate-800">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-white" />
                  <h2 className="text-base font-black text-white">
                    Saved for Later
                  </h2>
                </div>
                <span className="text-xs text-slate-300 font-mono font-bold">
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

      {/* Garment Details Modal positioned near top of screen */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-[max(12px,calc(env(safe-area-inset-top)+8px))] overflow-y-auto overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'} border rounded-2xl max-w-sm w-full p-5 pb-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto overscroll-contain cursor-default relative mt-2 sm:mt-4 mb-20`}
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
