import React, { useState, useRef } from 'react';
import {
  Upload as UploadIcon,
  Sparkles,
  Shirt,
  ShoppingBag,
  Heart,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DissectedGarment, ClothingItem } from '../../types';

export const TryOnTab: React.FC = () => {
  const {
    currentDissection,
    isAnalyzing,
    uploadedImageUrl,
    dissectImage,
    addDissectedStyleToAlgorithm,
    addToCart,
    toggleWishlist,
    isItemInWishlist,
    setActiveTab,
    userProfile,
    setSendItemModalItem,
    breakdownHistoryItems,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const breakdownCarouselRef = useRef<HTMLDivElement>(null);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);
  const [showLookupInfo, setShowLookupInfo] = useState(false);

  const isLight = userProfile.preferences.theme === 'light';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      dissectImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const scrollBreakdownCarousel = (direction: 'left' | 'right') => {
    if (breakdownCarouselRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      breakdownCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const selectedGarment: DissectedGarment | undefined =
    currentDissection?.items.find((g) => g.id === selectedGarmentId) ||
    currentDissection?.items[0];

  return (
    <div className="min-h-[calc(100vh-64px)] pb-32 px-4 pt-[max(16px,env(safe-area-inset-top))] max-w-md mx-auto select-none">
      {/* Hidden file input for outfit breakdown upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Screen Header with Top-Right Upload Button for Outfit Dissection */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div>
          <span
            className={`text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
              isLight
                ? 'cosmic-gradient-border-light text-slate-800'
                : 'cosmic-gradient-border text-white'
            } inline-block mb-1`}
          >
            Virtual Fitting & Dissection
          </span>
          <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Try On
          </h1>
        </div>

        {/* Upload Image for Outfit Dissection Button in Top Right Corner */}
        <button
          type="button"
          onClick={handleTriggerUpload}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl ${
            isLight
              ? 'cosmic-gradient-bg-light shadow-pink-600/25 hover:shadow-pink-600/40'
              : 'cosmic-gradient-bg shadow-pink-600/40 hover:shadow-pink-600/60'
          } text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer`}
          title="Upload image for outfit dissection"
        >
          <UploadIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
          <span>Upload Fit</span>
        </button>
      </div>

      {/* Analyzing Animation State */}
      {isAnalyzing && (
        <div className="mb-6 flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-slate-800 bg-slate-950 text-center min-h-[340px] animate-in fade-in duration-200">
          <div className="relative w-44 h-56 rounded-2xl overflow-hidden border-2 border-pink-500 mb-4 shadow-2xl shadow-pink-950/50">
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Analyzing outfit"
                className="w-full h-full object-cover grayscale-40"
              />
            )}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_15px_rgba(219,39,119,1)] animate-bounce" />
          </div>

          <div className="flex items-center gap-2 text-pink-400 mb-1.5">
            <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-black tracking-wide">Dissecting Outfit Pieces...</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            Isolating cuts, fabric textures, and matching with catalog pieces.
          </p>
        </div>
      )}

      {/* Active Dissection Results Deep Dive (When an outfit is analyzed) */}
      {currentDissection && !isAnalyzing && (
        <div className="mb-6 space-y-4 animate-in fade-in duration-300">
          <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-xl max-h-[260px]">
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Analyzed outfit"
                className="w-full h-[240px] object-cover object-top"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent pointer-events-none" />

            <button
              onClick={handleTriggerUpload}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-bold hover:text-white hover:border-pink-500 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-pink-400" />
              <span>Change Photo</span>
            </button>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
                  Aesthetic
                </span>
                <p className="text-sm font-extrabold text-white">
                  {currentDissection.overallAesthetic}
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700">
                {currentDissection.colorPalette.map((col, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-slate-200">
                    {col}
                    {idx < currentDissection.colorPalette.length - 1 && ' • '}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Garments Dissected Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Dissected Garments ({currentDissection.items.length})
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {currentDissection.items.map((garment) => {
                const isSelected = garment.id === selectedGarment?.id;
                return (
                  <button
                    key={garment.id}
                    onClick={() => setSelectedGarmentId(garment.id)}
                    className={`px-3 py-2 rounded-2xl border text-xs text-left whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'cosmic-gradient-bg-light text-white font-bold shadow-md shadow-pink-600/25 border-transparent'
                          : 'cosmic-gradient-bg text-white font-bold shadow-md shadow-pink-600/30 border-transparent'
                        : isLight
                        ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    <div>
                      <p className="text-[10px] opacity-80 uppercase font-bold leading-none">
                        {garment.category}
                      </p>
                      <p className="text-xs font-bold truncate max-w-[130px] leading-snug">
                        {garment.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Dissected Garment Deep Dive */}
          {selectedGarment && (
            <div className={`p-4 rounded-3xl ${isLight ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-900 border-slate-700 shadow-xl'} border-2 space-y-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-black uppercase ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} tracking-wider`}>
                    {selectedGarment.category} • {selectedGarment.aesthetic}
                  </span>
                  <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} mt-0.5`}>
                    {selectedGarment.name}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
                    Color: <span className="font-semibold">{selectedGarment.color}</span> • Fabric:{' '}
                    <span className="font-semibold">{selectedGarment.material}</span>
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-pink-400 bg-pink-950/70 px-2 py-0.5 rounded-md border border-pink-500/40">
                  {Math.round(selectedGarment.confidence * 100)}% Match
                </span>
              </div>

              {/* Add to Algorithm Button */}
              <div className={`p-3 rounded-2xl ${isLight ? 'bg-slate-50 border-pink-200' : 'bg-black/60 border-pink-600/30'} border flex items-center justify-between`}>
                <div>
                  <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-1.5`}>
                    <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
                    <span>Train Algorithm</span>
                  </p>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Boosts {selectedGarment.aesthetic} styles in your feed
                  </p>
                </div>

                <button
                  onClick={() => addDissectedStyleToAlgorithm(selectedGarment)}
                  disabled={selectedGarment.addedToAlgorithm}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedGarment.addedToAlgorithm
                      ? 'bg-pink-950 text-pink-400 border border-pink-500/50 cursor-default'
                      : isLight
                      ? 'cosmic-gradient-bg-light text-white shadow-md active:scale-95'
                      : 'cosmic-gradient-bg text-white shadow-md active:scale-95'
                  }`}
                >
                  {selectedGarment.addedToAlgorithm ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Feed</span>
                    </>
                  )}
                </button>
              </div>

              {/* Similar Styles In Marketplace */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} flex items-center gap-1.5`}>
                    <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                    <span>Matched Pieces in Catalog</span>
                  </h4>
                  <span className="text-[10px] text-pink-500 font-semibold">Available</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {selectedGarment.marketplaceMatches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setInspectItem(item)}
                      className={`group relative rounded-2xl overflow-hidden border ${
                        isLight ? 'border-slate-200 bg-white hover:border-pink-400' : 'border-slate-700 bg-slate-950 hover:border-pink-500'
                      } flex flex-col justify-between p-1.5 transition-colors cursor-pointer`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-1.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-bold text-pink-400">
                          ${item.price}
                        </span>
                      </div>

                      <div>
                        <p className={`text-[9px] uppercase font-bold ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} truncate`}>
                          {item.brand}
                        </p>
                        <p className={`text-[10px] font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate leading-tight`}>
                          {item.name}
                        </p>
                      </div>

                      <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold transition-colors shadow-sm active:scale-95"
                        >
                          Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(item)}
                          className={`p-1 rounded-lg border transition-colors ${
                            isItemInWishlist(item.id)
                              ? isLight ? 'cosmic-gradient-bg-light text-white' : 'cosmic-gradient-bg text-white'
                              : isLight ? 'border-slate-300 text-slate-600' : 'border-slate-700 text-slate-300'
                          }`}
                        >
                          <Heart className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Previously Found Items Carousel (Outfit Breakdown History) */}
      <div className={`mb-6 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black flex items-center gap-1.5 tracking-tight text-pink-500">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Previously Found Items</span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isLight
                  ? 'bg-pink-50 text-pink-700 border border-pink-200'
                  : 'bg-pink-950/60 text-pink-400 border border-pink-600/40'
              }`}
            >
              {breakdownHistoryItems.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollBreakdownCarousel('left')}
              className={`p-1.5 rounded-full ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              } border transition-colors cursor-pointer`}
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBreakdownCarousel('right')}
              className={`p-1.5 rounded-full ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              } border transition-colors cursor-pointer`}
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div
          ref={breakdownCarouselRef}
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {breakdownHistoryItems.map((item) => (
            <div
              key={`breakdown-tryon-${item.id}`}
              onClick={() => setInspectItem(item)}
              className={`w-36 flex-shrink-0 snap-start rounded-2xl ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-md'
              } border overflow-hidden cursor-pointer group hover:border-pink-500 transition-all`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-pink-500/30 text-[9px] font-mono font-bold text-pink-400">
                  Breakdown
                </div>
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-sm border border-slate-800 text-[10px] font-mono font-bold text-emerald-400">
                  ${item.price}
                </div>
              </div>
              <div className="p-2 space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} truncate`}>
                  {item.brand}
                </p>
                <p className={`text-[11px] font-bold ${isLight ? 'text-sky-950' : 'text-white'} truncate leading-tight`}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between pt-1 gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="flex-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold flex items-center justify-center gap-1 transition-colors shadow-sm active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-2.5 h-2.5" />
                    <span>Cart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendItemModalItem(item)}
                    className={`p-1 rounded-lg border ${
                      isLight
                        ? 'border-slate-300 text-slate-700 hover:text-pink-600'
                        : 'border-slate-700 text-slate-400 hover:text-pink-400'
                    } transition-colors cursor-pointer`}
                    title="Send via chat"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Fitting Room Preview */}
      <div className={`p-6 rounded-3xl ${isLight ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-900/90 border-slate-800 shadow-xl'} border flex flex-col items-center text-center relative overflow-hidden`}>
        <div className="relative mb-4">
          <div className={`w-16 h-16 rounded-3xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/25' : 'cosmic-gradient-bg shadow-pink-600/40'} flex items-center justify-center text-white shadow-xl`}>
            <Shirt className="w-8 h-8 text-white" strokeWidth={1.8} />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          </div>
        </div>

        <h3 className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} mb-1`}>
          Virtual Fitting Room
        </h3>
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} max-w-xs leading-relaxed mb-4`}>
          Try on complete fits on your 3D avatar or photo model. Tap &apos;Upload Fit&apos; above to dissect pieces from any style image.
        </p>

        <button
          type="button"
          onClick={handleTriggerUpload}
          className={`w-full max-w-xs py-3 px-5 rounded-2xl ${
            isLight ? 'cosmic-gradient-border-light text-slate-800 bg-slate-50 hover:bg-white' : 'cosmic-gradient-border text-white bg-slate-950/80 hover:bg-slate-900'
          } font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer`}
        >
          <UploadIcon className="w-4 h-4 text-pink-500" />
          <span>Upload Image for Outfit Dissection</span>
        </button>
      </div>

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl ${isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'} border border-slate-700 p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 cursor-default`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                  {inspectItem.brand}
                </span>
                <h3 className="text-base font-extrabold">{inspectItem.name}</h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 relative">
              <img src={inspectItem.image} alt={inspectItem.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 font-mono text-sm font-bold text-white">
                ${inspectItem.price}
              </span>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
              {inspectItem.description}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  addToCart(inspectItem);
                  setInspectItem(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => {
                  setSendItemModalItem(inspectItem);
                  setInspectItem(null);
                }}
                className={`p-3 rounded-xl border ${isLight ? 'border-slate-300 text-slate-700' : 'border-slate-700 text-slate-300'} hover:text-pink-500 cursor-pointer`}
                title="Send via Chat"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(inspectItem)}
                className={`p-3 rounded-xl border ${
                  isItemInWishlist(inspectItem.id)
                    ? isLight ? 'cosmic-gradient-bg-light text-white' : 'cosmic-gradient-bg text-white'
                    : isLight ? 'border-slate-300 text-slate-700' : 'border-slate-700 text-slate-300'
                } cursor-pointer`}
                title="Wishlist"
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
