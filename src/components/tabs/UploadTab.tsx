import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Upload as UploadIcon,
  Plus,
  ShoppingBag,
  Heart,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DissectedGarment, ClothingItem } from '../../types';
import { INITIAL_CATALOG } from '../../data/mockCatalog';

export const UploadTab: React.FC = () => {
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
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);

  // Trending items for "Hot Right Now" carousel based on likes, wishlists, and purchases
  const trendingItems = useMemo(() => {
    return [...INITIAL_CATALOG]
      .filter((i) => !i.isBundle)
      .sort((a, b) => {
        const scoreA = (a.likeCount || 0) + (a.savedCount || 0) * 1.4 + (a.purchaseCount || 0) * 2;
        const scoreB = (b.likeCount || 0) + (b.savedCount || 0) * 1.4 + (b.purchaseCount || 0) * 2;
        return scoreB - scoreA;
      });
  }, []);

  // Automatic gentle rotation of trending items carousel
  useEffect(() => {
    const timer = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 160, behavior: 'smooth' });
        }
      }
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -170 : 170;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WEBP)', '', 'red');
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

  const selectedGarment: DissectedGarment | undefined =
    currentDissection?.items.find((g) => g.id === selectedGarmentId) ||
    currentDissection?.items[0];

  return (
    <div className="min-h-[calc(100vh-64px)] pb-28 px-4 pt-4 max-w-md mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Screen Header - Simple and clean without fluff */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-black tracking-tight text-white">Outfit Dissection</h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload any outfit photo to dissect garments and find matching marketplace styles.
        </p>
      </div>

      {!currentDissection && !isAnalyzing ? (
        /* Empty / Initial State - Matching sketch from IMG_0314 (left) purely and simply:
           - Large `+` icon
           - Simple prompt lines
           - Big green "Upload" button
        */
        <div className="mt-4">
          <div
            onClick={handleTriggerUpload}
            className="group relative flex flex-col items-center justify-center p-10 rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/60 hover:border-emerald-500 hover:bg-slate-900/90 transition-all duration-200 cursor-pointer text-center shadow-xl shadow-black/50"
          >
            {/* Top Plus Icon */}
            <div className="w-16 h-16 rounded-3xl bg-slate-800 border-2 border-slate-600 group-hover:border-emerald-400 group-hover:scale-105 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-all duration-200 shadow-inner mb-6">
              <Plus className="w-9 h-9" strokeWidth={2.5} />
            </div>

            {/* Simple prompt */}
            <div className="space-y-1.5 mb-8">
              <p className="text-sm text-white font-bold">
                Select or drop an outfit photo
              </p>
              <p className="text-xs text-slate-400">
                AI will extract tops, pants, shoes, and accessories
              </p>
            </div>

            {/* Prominent Green "Upload" Button matching sketch */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerUpload();
              }}
              className="relative w-full max-w-xs py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all duration-200"
            >
              <UploadIcon className="w-5 h-5" strokeWidth={2.5} />
              <span>Upload</span>
            </button>
          </div>

          {/* Lower Half: "Hot Right Now" Rotating Carousel with Red Text and Fire Emoji */}
          <div className="mt-8 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-red-500 flex items-center gap-1.5 tracking-tight">
                  <span className="text-base animate-pulse">🔥</span>
                  <span>Hot Right Now</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rotating Carousel Track */}
            <div
              ref={carouselRef}
              className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {trendingItems.map((item) => (
                <div
                  key={item.id}
                  className="w-36 flex-shrink-0 snap-start rounded-2xl bg-slate-950 border border-slate-800 p-2 flex flex-col justify-between hover:border-slate-600 transition-all shadow-md group"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono font-bold text-white">
                      ${item.price}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 mb-2">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block truncate">
                      {item.brand}
                    </span>
                    <p className="text-[11px] font-bold text-white truncate leading-tight">
                      {item.name}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold transition-colors"
                    >
                      Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className={`p-1 rounded-lg border transition-colors ${
                        isItemInWishlist(item.id)
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : 'border-slate-800 text-slate-400 hover:text-white'
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
      ) : isAnalyzing ? (
        /* Analyzing State */
        <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-slate-800 bg-slate-950 text-center min-h-[380px]">
          <div className="relative w-48 h-64 rounded-2xl overflow-hidden border-2 border-emerald-500/80 mb-5 shadow-2xl shadow-emerald-500/20">
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Analyzing outfit"
                className="w-full h-full object-cover grayscale-40"
              />
            )}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] animate-bounce" />
          </div>

          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-black tracking-wide">Dissecting Garments...</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            Isolating cuts, fabric textures, and matching with catalog pieces.
          </p>
        </div>
      ) : (
        /* Dissection Results View */
        <div className="space-y-4">
          {/* Top Dissected Image Banner */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-xl max-h-[280px]">
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Analyzed outfit"
                className="w-full h-[260px] object-cover object-top"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

            <button
              onClick={handleTriggerUpload}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-bold hover:text-white hover:border-emerald-400 flex items-center gap-1.5 shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Change Photo</span>
            </button>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Aesthetic
                </span>
                <p className="text-sm font-extrabold text-white">
                  {currentDissection?.overallAesthetic}
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700">
                {currentDissection?.colorPalette.map((col, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-slate-200">
                    {col}
                    {idx < (currentDissection.colorPalette.length - 1) && ' • '}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Garments Dissected Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Dissected Items ({currentDissection?.items.length})
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {currentDissection?.items.map((garment) => {
                const isSelected = garment.id === selectedGarment?.id;
                return (
                  <button
                    key={garment.id}
                    onClick={() => setSelectedGarmentId(garment.id)}
                    className={`px-3 py-2 rounded-2xl border text-xs text-left whitespace-nowrap transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/60 text-white font-bold shadow-md'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">
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
            <div className="p-4 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    {selectedGarment.category} • {selectedGarment.aesthetic}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    {selectedGarment.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Color: <span className="text-slate-200">{selectedGarment.color}</span> • Fabric:{' '}
                    <span className="text-slate-200">{selectedGarment.material}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800/60">
                    {Math.round(selectedGarment.confidence * 100)}% Match
                  </span>
                </div>
              </div>

              {/* Add to Algorithm Button */}
              <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Train Algorithm</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Boosts {selectedGarment.aesthetic} in recommendations
                  </p>
                </div>

                <button
                  onClick={() => addDissectedStyleToAlgorithm(selectedGarment)}
                  disabled={selectedGarment.addedToAlgorithm}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedGarment.addedToAlgorithm
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  {selectedGarment.addedToAlgorithm ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Algorithm</span>
                    </>
                  )}
                </button>
              </div>

              {/* Similar Styles Across Marketplace */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Similar Styles in Marketplace</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">Available to Buy</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {selectedGarment.marketplaceMatches.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col justify-between p-1.5 hover:border-emerald-400 transition-colors"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-1.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-bold text-emerald-400">
                          ${item.price}
                        </span>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase font-bold text-emerald-400 truncate">
                          {item.brand}
                        </p>
                        <p className="text-[10px] font-bold text-white truncate leading-tight">
                          {item.name}
                        </p>
                      </div>

                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-1 py-1 rounded-lg bg-emerald-500 text-black text-[10px] font-bold hover:bg-emerald-400"
                        >
                          Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(item)}
                          className={`p-1 rounded-lg border ${
                            isItemInWishlist(item.id)
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-slate-700 text-slate-300'
                          }`}
                        >
                          <Heart className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check Swipe Feed button */}
              <button
                onClick={() => setActiveTab('swipe')}
                className="w-full py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-white hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Check Swipe Feed with Updated Weights</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
