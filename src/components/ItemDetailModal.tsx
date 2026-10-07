import React from 'react';
import { X, ShoppingBag, Heart, Check, Send } from 'lucide-react';
import { ClothingItem } from '../types';
import { useApp } from '../context/AppContext';

interface ItemDetailModalProps {
  item: ClothingItem | null;
  onClose: () => void;
  selectedSize?: string;
  selectedColor?: string;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  selectedSize,
  selectedColor,
}) => {
  const { addToCart, toggleWishlist, isItemInWishlist, userProfile, showToast, setSendItemModalItem } = useApp();
  const isLight = userProfile.preferences.theme === 'light';

  if (!item) return null;

  const inWishlist = isItemInWishlist(item.id);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className={`border rounded-2xl max-w-sm w-full p-5 pb-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto overscroll-contain relative cursor-default my-auto ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className={`sticky top-0 float-right z-30 p-2 rounded-full backdrop-blur-md shadow-lg transition-all ${
            isLight
              ? 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-300'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title="Close window"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pr-8">
          <span className={`text-[10px] font-extrabold uppercase ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} tracking-wider block`}>
            {item.brand}
          </span>
          <h3 className={`text-lg font-black leading-tight ${isLight ? 'text-sky-950' : 'text-white'}`}>
            {item.name}
          </h3>
        </div>

        {/* Product Image */}
        <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-sm font-mono text-sm font-bold text-white border border-white/20 shadow-md">
            ${item.price}
          </span>
          {item.gender && item.gender !== 'unisex' && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-bold text-slate-300 capitalize border border-slate-700">
              {item.gender}&apos;s
            </span>
          )}
        </div>

        {/* Size / Color badge if present */}
        {(selectedSize || selectedColor) && (
          <div className="flex items-center gap-2 text-xs">
            {selectedSize && (
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>
                Size: {selectedSize}
              </span>
            )}
            {selectedColor && (
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>
                Color: {selectedColor}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          {item.description}
        </p>

        {/* Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Material</span>
            <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.material}</span>
          </div>
          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Silhouette Fit</span>
            <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.fit}</span>
          </div>
        </div>

        {/* Category & Aesthetic Tags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            {item.category}
          </span>
          {item.aesthetics?.map((aes) => (
            <span key={aes} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${isLight ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-pink-950/40 border-pink-600/40 text-pink-600'}`}>
              {aes}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              addToCart(item, selectedSize, selectedColor);
              showToast('Added to Cart', `${item.name} ($${item.price})`, 'green');
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart (${item.price})</span>
          </button>
          <button
            onClick={() => {
              setSendItemModalItem(item);
              onClose();
            }}
            className={`p-3 rounded-xl border transition-colors ${
              isLight
                ? 'border-slate-300 bg-white text-slate-700 hover:text-pink-600 hover:border-pink-600'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-pink-400 hover:border-pink-500'
            }`}
            title="Send to Friends via Chat"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              toggleWishlist(item);
            }}
            className={`p-3 rounded-xl border transition-colors ${
              inWishlist
                ? isLight
                  ? 'border-pink-600 bg-pink-50 text-pink-600'
                  : 'border-pink-600 bg-pink-950/60 text-pink-600'
                : isLight
                ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-pink-600 text-pink-600' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
