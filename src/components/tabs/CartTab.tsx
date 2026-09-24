import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartTab: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    showToast,
    setActiveTab,
    userProfile,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const shipping = cartTotal > 200 || cartTotal === 0 ? 0 : 15;
  const discountAmount = Math.round(cartTotal * promoDiscount);
  const finalTotal = Math.max(0, cartTotal - discountAmount + shipping);
  const totalItemsCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'GREEN20' || code === 'PERFIT20' || code === 'KLOSET20') {
      setPromoDiscount(0.2);
      showToast('Promo Applied: 20% Off!', 'PerFit VIP discount active', 'green');
    } else if (code === 'FREESHIP') {
      setPromoDiscount(0.05);
      showToast('Free Express Shipping Applied', '', 'green');
    } else {
      showToast('Invalid promo code', 'Try code GREEN20 for 20% off', 'red');
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
      setOrderComplete(true);
      setIsCheckingOut(false);
      clearCart();
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pb-28 px-4 pt-3 max-w-md mx-auto">
      {/* Top Header - Exact match to sketch: Shopping Bag inside a silver circle */}
      <div className="flex flex-col items-center justify-center my-3">
        {/* Silver-gray circle with shopping bag icon */}
        <div className={`w-16 h-16 rounded-full ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800/80 border-slate-600 text-slate-200'} border-2 flex items-center justify-center shadow-md mb-2 relative group`}>
          <ShoppingBag className="w-8 h-8 text-emerald-500" strokeWidth={1.8} />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
              {cartItems.reduce((acc, c) => acc + c.quantity, 0)}
            </span>
          )}
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
                {/* Garment Image / Icon - Fixed sizing so image displays clearly */}
                <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 relative shadow-md">
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
                  <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-500 block tracking-wider">
                    {ci.item.brand}
                  </span>
                  <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate mb-1`}>
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

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartQuantity(ci.item.id, -1, ci.selectedSize)}
                      className={`w-5 h-5 rounded-md ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'} border flex items-center justify-center transition-colors`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} px-1`}>
                      {ci.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(ci.item.id, 1, ci.selectedSize)}
                      className={`w-5 h-5 rounded-md ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'} border flex items-center justify-center transition-colors`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Price */}
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

                {/* Red Square Trash Button */}
                <button
                  onClick={() => removeFromCart(ci.item.id, ci.selectedSize)}
                  className="w-9 h-9 rounded-xl border-2 border-red-500/80 bg-red-950/30 text-red-400 hover:bg-red-900/60 hover:text-red-200 hover:border-red-400 transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2.2} />
                </button>
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
                placeholder="Promo Code (e.g. GREEN20)"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 hover:bg-slate-700 transition-colors"
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
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>VIP Discount (20%)</span>
                <span className="font-mono">-${discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Estimated Shipping</span>
              <span className="text-white font-mono">
                {shipping === 0 ? <span className="text-emerald-400 font-semibold">FREE</span> : `$${shipping}`}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm">
              <span className="font-extrabold text-white">Total</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                ${finalTotal}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full mt-4 py-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 active:scale-[0.99] disabled:opacity-60"
          >
            {isCheckingOut ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted checkout • Free 30-day returns • Guaranteed Authentic</span>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center mt-6">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <ShoppingBag className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Your cart is empty</h3>
          <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
            Swipe through clothes or explore your collection wishlist to add statement pieces to your bag.
          </p>
          <button
            onClick={() => setActiveTab('swipe')}
            className="px-5 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Start Swiping Clothes
          </button>
        </div>
      )}

      {/* Order Complete Modal */}
      {orderComplete && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
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
                <span className="text-white font-semibold">PerFit Global Hub</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taste Profile</span>
                <span className="text-emerald-400 font-semibold">+25 XP Style Boost</span>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderComplete(false);
                setActiveTab('swipe');
              }}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
