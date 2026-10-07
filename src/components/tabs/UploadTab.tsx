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
  X,
  HelpCircle,
  Send,
  Sparkles,
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
    activeTab,
    tabResetTimestamp,
    userProfile,
    setSendItemModalItem,
    breakdownHistoryItems,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const breakdownCarouselRef = useRef<HTMLDivElement>(null);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);
  const [showLookupInfo, setShowLookupInfo] = useState(false);

  const isLight = userProfile.preferences.theme === 'light';

  const scrollBreakdownCarousel = (direction: 'left' | 'right') => {
    if (breakdownCarouselRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      breakdownCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Return to main upload view when tab is clicked
  useEffect(() => {
    setInspectItem(null);
  }, [activeTab, tabResetTimestamp]);

  // Trending items for "Hot Right Now" carousel based on likes, wishlists, and purchases
  const trendingItems = useMemo(() => {
    const dept = userProfile.preferences.preferredDepartment || 'both';
    return [...INITIAL_CATALOG]
      .filter((i) => !i.isBundle)
      .filter((item) => {
        if (dept === 'men') return item.gender !== 'women';
        if (dept === 'women') return item.gender !== 'men';
        return true;
      })
      .sort((a, b) => {
        const scoreA = (a.likeCount || 0) + (a.savedCount || 0) * 1.4 + (a.purchaseCount || 0) * 2;
        const scoreB = (b.likeCount || 0) + (b.savedCount || 0) * 1.4 + (b.purchaseCount || 0) * 2;
        return scoreB - scoreA;
      });
  }, [userProfile.preferences.preferredDepartment]);

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

      {/* Screen Header - Simplified and clean */}
      <div className="text-center mb-5">
        <h1 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Outfit Breakdown</h1>
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
          scan photo to find clothing items
        </p>
      </div>

      {!currentDissection && !isAnalyzing ? (
        <div className="mt-2 space-y-3">
          <div
            onClick={handleTriggerUpload}
            className={`group relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed ${
              isLight
                ? 'border-slate-300 bg-white hover:border-pink-600 shadow-sm'
                : 'border-slate-700 bg-slate-900/60 hover:border-pink-600 hover:bg-slate-900/90 shadow-xl shadow-black/50'
            } transition-all duration-200 cursor-pointer text-center`}
          >
            {/* '?' Help Button on Upload Card */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLookupInfo((prev) => !prev);
              }}
              className={`absolute top-3.5 right-3.5 p-2 rounded-full ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-pink-600 border-slate-700'
              } text-xs font-bold transition-all shadow-md z-10`}
              title="How outfit lookup works"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Expandable Explanation of How Outfit Lookup Works */}
            {showLookupInfo && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full mb-4 p-3.5 rounded-2xl ${
                  isLight
                    ? 'bg-white border-pink-600/40 text-slate-800'
                    : 'bg-slate-950/95 border-pink-600/40 text-slate-300'
                } border text-left text-xs space-y-1.5 shadow-xl animate-in zoom-in-95 duration-150`}
              >
                <div className={`flex items-center justify-between pb-1 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className="font-extrabold text-pink-600 text-[11px] uppercase tracking-wider">
                    How Outfit Lookup Works
                  </span>
                  <button
                    onClick={() => setShowLookupInfo(false)}
                    className={`p-1 rounded-full ${isLight ? 'text-slate-500 hover:text-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className={`space-y-1 ${isLight ? 'text-slate-700' : 'text-slate-300'} text-[11px] pt-0.5`}>
                  <p>1. Upload or drop any full-outfit photo</p>
                  <p>2. AI identifies each garment in the fit</p>
                  <p>3. Match with catalog pieces to save or cart</p>
                </div>
              </div>
            )}

            {/* Top Plus Icon */}
            <div className={`w-14 h-14 rounded-2xl ${
              isLight
                ? 'bg-slate-100 border-2 border-slate-300 text-slate-700 group-hover:border-pink-600 group-hover:text-pink-600'
                : 'bg-slate-800 border-2 border-slate-600 text-slate-300 group-hover:border-pink-600 group-hover:text-pink-600'
            } group-hover:scale-105 flex items-center justify-center transition-all duration-200 shadow-inner mb-4`}>
              <Plus className="w-8 h-8" strokeWidth={2.5} />
            </div>

            {/* Prominent Upload Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerUpload();
              }}
              className={`relative w-full max-w-xs py-3.5 px-6 rounded-2xl ${
                isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'
              } text-white active:scale-[0.98] font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl transition-all duration-200`}
            >
              <UploadIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span>Upload</span>
            </button>
          </div>

          {/* Middle: "Previously Found Items" Carousel (Breakdown Tool History) */}
          <div className={`mt-6 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black flex items-center gap-1.5 tracking-tight text-pink-600">
                  <Sparkles className="w-4 h-4 text-pink-600" />
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
                  } border transition-colors`}
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
                  } border transition-colors`}
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Previously Found Items Carousel Track */}
            <div
              ref={breakdownCarouselRef}
              className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {breakdownHistoryItems.map((item) => (
                <div
                  key={`breakdown-${item.id}`}
                  onClick={() => setInspectItem(item)}
                  className={`w-36 flex-shrink-0 snap-start rounded-2xl ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-md'
                  } border overflow-hidden cursor-pointer group hover:border-pink-600 transition-all`}
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
                    <div className="flex items-center justify-between pt-1 gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                          showToast(`Added ${item.name} to cart`, `$${item.price} • ${item.brand}`, 'green');
                        }}
                        className="flex-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold flex items-center justify-center gap-1 transition-colors shadow-sm active:scale-95"
                      >
                        <ShoppingBag className="w-2.5 h-2.5" />
                        <span>Cart</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSendItemModalItem(item);
                        }}
                        className={`p-1 rounded-lg border ${
                          isLight
                            ? 'border-slate-300 text-slate-700 hover:text-pink-600'
                            : 'border-slate-700 text-slate-400 hover:text-pink-400'
                        } transition-colors`}
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

          {/* Lower Half: "Hot Right Now" Rotating Carousel with Red Text and Fire Emoji */}
          <div className={`mt-8 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
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
                  className={`p-1.5 rounded-full ${isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'} border transition-colors`}
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className={`p-1.5 rounded-full ${isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'} border transition-colors`}
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
                  onClick={() => setInspectItem(item)}
                  className={`w-36 flex-shrink-0 snap-start rounded-2xl ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-md'
                  } border p-2 flex flex-col justify-between hover:scale-[1.02] transition-all group cursor-pointer`}
                  title="Click to view more info"
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
                    <span className={`text-[9px] uppercase font-bold block truncate ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                      {item.brand}
                    </span>
                    <p className={`text-[11px] font-bold ${isLight ? 'text-sky-950' : 'text-white'} truncate leading-tight`}>
                      {item.name}
                    </p>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
                          ? 'border-pink-600 bg-pink-600/15 text-pink-600'
                          : isLight
                          ? 'border-slate-300 text-slate-500 hover:text-black'
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
          <div className="relative w-48 h-64 rounded-2xl overflow-hidden border-2 border-pink-600 mb-5 shadow-2xl shadow-pink-950/40">
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Analyzing outfit"
                className="w-full h-full object-cover grayscale-40"
              />
            )}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-pink-600 to-transparent shadow-[0_0_15px_rgba(219,39,119,1)] animate-bounce" />
          </div>

          <div className="flex items-center gap-2 text-pink-600 mb-2">
            <div className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
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
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-bold hover:text-white hover:border-pink-600 flex items-center gap-1.5 shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5 text-pink-600" />
              <span>Change Photo</span>
            </button>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider block">
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
                        ? 'border-pink-600 bg-pink-600/20 text-white font-bold shadow-md shadow-pink-600/20'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-600" />
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
                  <span className="text-[10px] font-black uppercase text-pink-600 tracking-wider">
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
                  <span className="text-xs font-mono font-bold text-pink-600 bg-pink-950 px-2 py-0.5 rounded-md border border-pink-600/40">
                    {Math.round(selectedGarment.confidence * 100)}% Match
                  </span>
                </div>
              </div>

              {/* Add to Algorithm Button */}
              <div className="p-3 rounded-2xl bg-black/60 border border-pink-600/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-pink-600" />
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
                      ? 'bg-pink-950 text-pink-600 border border-pink-600/50 cursor-default'
                      : 'bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/20 active:scale-95'
                  }`}
                >
                  {selectedGarment.addedToAlgorithm ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-pink-600" />
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
                    <ShoppingBag className="w-3.5 h-3.5 text-pink-600" />
                    <span>Similar Styles in Marketplace</span>
                  </h4>
                  <span className="text-[10px] text-pink-600 font-semibold">Available to Buy</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {selectedGarment.marketplaceMatches.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col justify-between p-1.5 hover:border-pink-600 transition-colors"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-1.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-bold text-pink-600">
                          ${item.price}
                        </span>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase font-bold text-pink-600 truncate">
                          {item.brand}
                        </p>
                        <p className="text-[10px] font-bold text-white truncate leading-tight">
                          {item.name}
                        </p>
                      </div>

                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold transition-colors shadow-sm active:scale-95"
                        >
                          Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(item)}
                          className={`p-1 rounded-lg border ${
                            isItemInWishlist(item.id)
                              ? 'border-pink-600 bg-pink-600/20 text-pink-600'
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
                <ArrowRight className="w-3.5 h-3.5 text-pink-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Garment Details Modal (With Floating X, rounded-2xl corners, tap outside to close) */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
                : 'bg-slate-950 border-slate-700 text-white shadow-2xl'
            } border rounded-2xl max-w-sm w-full p-5 pb-5 space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto overscroll-contain cursor-default relative my-auto`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setInspectItem(null)}
              className={`sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              } border backdrop-blur-md shadow-lg transition-all`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-10">
              <span className={`text-[10px] font-extrabold uppercase ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} tracking-wider block`}>
                {inspectItem.brand}
              </span>
              <h3 className={`text-lg font-black ${isLight ? 'text-sky-950' : 'text-white'}`}>{inspectItem.name}</h3>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={inspectItem.image}
                alt={inspectItem.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-sm font-mono text-sm font-bold text-white border border-white/20 shadow-md">
                ${inspectItem.price}
              </span>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} leading-relaxed`}>
              {inspectItem.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase font-bold block`}>Material</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inspectItem.material}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase font-bold block`}>Silhouette Fit</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inspectItem.fit}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  addToCart(inspectItem);
                  setInspectItem(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart (${inspectItem.price})</span>
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
                title="Toggle Wishlist"
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
