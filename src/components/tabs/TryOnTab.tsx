import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  Upload as UploadIcon,
  Plus,
  ChevronDown,
  Sparkles,
  Shirt,
  ShoppingBag,
  Heart,
  Send,
  X,
  Check,
  Share2,
  Trash2,
  Edit2,
  Glasses,
  Layers,
  Footprints,
  Watch,
  Smile,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem, SharedOutfit } from '../../types';
import { INITIAL_CATALOG } from '../../data/mockCatalog';
import { Avatar3DView } from '../tryon/Avatar3DView';

// Head-to-toe category definition
interface ApparelCategoryDef {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
}

const APPAREL_CATEGORIES: ApparelCategoryDef[] = [
  {
    id: 'headwear',
    name: 'Headwear',
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || 'w-4 h-4'}>
        <path d="M3 17h18" />
        <path d="M6 17V10a6 6 0 0 1 12 0v7" />
      </svg>
    ),
  },
  {
    id: 'eyewear',
    name: 'Eyewear',
    icon: ({ className }) => <Glasses className={className || 'w-4 h-4'} />,
  },
  {
    id: 'jackets',
    name: 'Jackets',
    icon: ({ className }) => <Layers className={className || 'w-4 h-4'} />,
  },
  {
    id: 'tops',
    name: 'Tops',
    icon: ({ className }) => <Shirt className={className || 'w-4 h-4'} />,
  },
  {
    id: 'pants',
    name: 'Pants',
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || 'w-4 h-4'}>
        <path d="M5 3h14v7l-3 11-4-1-4 1-3-11V3z" />
        <path d="M12 9v12" />
      </svg>
    ),
  },
  {
    id: 'shoes',
    name: 'Shoes',
    icon: ({ className }) => <Footprints className={className || 'w-4 h-4'} />,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: ({ className }) => <Watch className={className || 'w-4 h-4'} />,
  },
];

export const TryOnTab: React.FC = () => {
  const {
    userProfile,
    wishlistItems,
    addToCart,
    toggleWishlist,
    isItemInWishlist,
    dissectImage,
    savedTryOnOutfits,
    saveTryOnOutfit,
    deleteTryOnOutfit,
    pendingTryOnOutfit,
    setPendingTryOnOutfit,
    currentTryOnOutfitName,
    setCurrentTryOnOutfitName,
    friends,
    sendOutfitToFriend,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active head-to-toe category
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('headwear');

  // Draggable category selector state (like the nav bar highlighter selector)
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const [isDraggingCategory, setIsDraggingCategory] = useState(false);
  const [dragPixelY, setDragPixelY] = useState<number | null>(null);
  const [barHeight, setBarHeight] = useState(0);

  useEffect(() => {
    const updateBarHeight = () => {
      if (categoryBarRef.current) {
        setBarHeight(categoryBarRef.current.getBoundingClientRect().height);
      }
    };
    updateBarHeight();
    window.addEventListener('resize', updateBarHeight);
    return () => window.removeEventListener('resize', updateBarHeight);
  }, []);

  const activeCatIndex = APPAREL_CATEGORIES.findIndex((c) => c.id === selectedCategoryId);
  const safeCatIndex = activeCatIndex !== -1 ? activeCatIndex : 0;
  const rowHeight = barHeight > 0 ? barHeight / APPAREL_CATEGORIES.length : 38;

  // Category speech bubble state (appears temporarily for ~1.5s after selection, only one visible, fades out every time)
  const [bubbleInfo, setBubbleInfo] = useState<{
    catId: string;
    name: string;
    fading: boolean;
  } | null>(null);
  const bubbleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleFadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerCategoryBubble = useCallback((category: ApparelCategoryDef) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    if (bubbleFadeTimerRef.current) clearTimeout(bubbleFadeTimerRef.current);

    setBubbleInfo({
      catId: category.id,
      name: category.name,
      fading: false,
    });

    bubbleTimerRef.current = setTimeout(() => {
      setBubbleInfo((prev) => (prev ? { ...prev, fading: true } : null));
      bubbleFadeTimerRef.current = setTimeout(() => {
        setBubbleInfo(null);
      }, 350);
    }, 1500);
  }, []);

  const handleSelectCategory = (cat: ApparelCategoryDef) => {
    setSelectedCategoryId(cat.id);
    triggerCategoryBubble(cat);
  };

  // Pull / Drag up and down on vertical scroll bar exactly like nav bar highlighter
  const handleCategoryTouchStart = (e: React.TouchEvent) => {
    if (!categoryBarRef.current) return;
    setIsDraggingCategory(true);
    const rect = categoryBarRef.current.getBoundingClientRect();
    const relY = e.touches[0].clientY - rect.top;
    setBarHeight(rect.height);
    setDragPixelY(relY);
    const rowH = rect.height / APPAREL_CATEGORIES.length;
    const idx = Math.max(0, Math.min(APPAREL_CATEGORIES.length - 1, Math.floor(relY / rowH)));
    const cat = APPAREL_CATEGORIES[idx];
    if (cat) {
      handleSelectCategory(cat);
    }
  };

  const handleCategoryTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingCategory || !categoryBarRef.current) return;
    if (e.cancelable) e.preventDefault();
    const rect = categoryBarRef.current.getBoundingClientRect();
    const relY = e.touches[0].clientY - rect.top;
    setDragPixelY(relY);
    const rowH = rect.height / APPAREL_CATEGORIES.length;
    const idx = Math.max(0, Math.min(APPAREL_CATEGORIES.length - 1, Math.floor(relY / rowH)));
    const cat = APPAREL_CATEGORIES[idx];
    if (cat && cat.id !== selectedCategoryId) {
      handleSelectCategory(cat);
    }
  };

  const handleCategoryTouchEnd = () => {
    if (isDraggingCategory && dragPixelY !== null && barHeight > 0) {
      const rowH = barHeight / APPAREL_CATEGORIES.length;
      const finalIdx = Math.max(0, Math.min(APPAREL_CATEGORIES.length - 1, Math.floor(dragPixelY / rowH)));
      const cat = APPAREL_CATEGORIES[finalIdx];
      if (cat) {
        handleSelectCategory(cat);
      }
    }
    setIsDraggingCategory(false);
    setDragPixelY(null);
  };

  const handleCategoryMouseDown = (e: React.MouseEvent) => {
    if (!categoryBarRef.current) return;
    setIsDraggingCategory(true);
    const rect = categoryBarRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    setBarHeight(rect.height);
    setDragPixelY(relY);
    const rowH = rect.height / APPAREL_CATEGORIES.length;
    const idx = Math.max(0, Math.min(APPAREL_CATEGORIES.length - 1, Math.floor(relY / rowH)));
    const cat = APPAREL_CATEGORIES[idx];
    if (cat) {
      handleSelectCategory(cat);
    }
  };

  const handleCategoryMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCategory || !categoryBarRef.current) return;
    const rect = categoryBarRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    setDragPixelY(relY);
    const rowH = rect.height / APPAREL_CATEGORIES.length;
    const idx = Math.max(0, Math.min(APPAREL_CATEGORIES.length - 1, Math.floor(relY / rowH)));
    const cat = APPAREL_CATEGORIES[idx];
    if (cat && cat.id !== selectedCategoryId) {
      handleSelectCategory(cat);
    }
  };

  const handleCategoryMouseUp = () => {
    setIsDraggingCategory(false);
    setDragPixelY(null);
  };

  const pillHeightPx = rowHeight > 0 ? Math.min(34, rowHeight - 4) : 32;
  const targetItemCenterY = (safeCatIndex + 0.5) * rowHeight;
  const snappedPillTop = targetItemCenterY - pillHeightPx / 2;

  const draggedPillTop =
    dragPixelY !== null && barHeight > 0
      ? Math.max(2, Math.min(barHeight - pillHeightPx - 2, dragPixelY - pillHeightPx / 2))
      : snappedPillTop;

  // Dropdown for saved outfits
  const [isOutfitDropdownOpen, setIsOutfitDropdownOpen] = useState(false);

  // Selected items in memory (keyed by id so they persist across category changes)
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, ClothingItem>>(() => {
    const defaultTop = INITIAL_CATALOG.find((i) => i.category.toLowerCase().includes('top')) || INITIAL_CATALOG[0];
    const defaultPants = INITIAL_CATALOG.find((i) => i.category.toLowerCase().includes('pant')) || INITIAL_CATALOG[1];
    return {
      [defaultTop.id]: defaultTop,
      [defaultPants.id]: defaultPants,
    };
  });

  // Currently applied items on the 3D avatar (initially empty so plain casual base white clothing displays as requested)
  const [appliedItems, setAppliedItems] = useState<ClothingItem[]>([]);

  const [isApplying, setIsApplying] = useState(false);
  const [avatarSnapshot, setAvatarSnapshot] = useState<string | null>(null);

  // Save outfit dialog state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveOutfitNameInput, setSaveOutfitNameInput] = useState(currentTryOnOutfitName);

  // Share with friends modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareFriendSearch, setShareFriendSearch] = useState('');
  const [shareNote, setShareNote] = useState('');

  // Inspect item modal
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);

  // Auto-load pending shared outfit from chat redirect
  useEffect(() => {
    if (pendingTryOnOutfit) {
      const newMap: Record<string, ClothingItem> = {};
      pendingTryOnOutfit.items.forEach((it) => {
        newMap[it.id] = it;
      });
      setSelectedItemsMap(newMap);
      setAppliedItems(pendingTryOnOutfit.items);
      setCurrentTryOnOutfitName(pendingTryOnOutfit.name);
      setPendingTryOnOutfit(null);
    }
  }, [pendingTryOnOutfit, setCurrentTryOnOutfitName, setPendingTryOnOutfit]);

  // Handle image upload for dissection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      dissectImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Toggle selection for an item (persisting in memory across category tabs)
  const toggleItemSelection = (item: ClothingItem) => {
    setSelectedItemsMap((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = item;
      }
      return next;
    });
  };

  const selectedItemsList = useMemo(() => Object.values(selectedItemsMap), [selectedItemsMap]);

  // Derive current outfit aesthetic based on selected items
  const currentAesthetic = useMemo(() => {
    if (selectedItemsList.length === 0) return 'Minimalist';
    const aestheticCounts: Record<string, number> = {};
    selectedItemsList.forEach((it) => {
      const aesList = it.aesthetics && it.aesthetics.length > 0 ? it.aesthetics : ['Minimalist'];
      aesList.forEach((a) => {
        aestheticCounts[a] = (aestheticCounts[a] || 0) + 1;
      });
    });
    const sorted = Object.entries(aestheticCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'Minimalist';
  }, [selectedItemsList]);

  // Row 1 items: Filtered by the currently selected head-to-toe category
  // Prioritizes user's liked items / wishlist, supplemented with curated catalog
  const row1CategoryItems = useMemo(() => {
    const cat = selectedCategoryId.toLowerCase();

    const matchesCategory = (item: ClothingItem) => {
      const itemCat = item.category.toLowerCase();
      if (cat === 'headwear' || cat === 'hats') return itemCat.includes('hat') || itemCat.includes('beanie') || itemCat.includes('cap') || itemCat.includes('headwear') || itemCat.includes('beret');
      if (cat === 'eyewear') return itemCat.includes('eye') || itemCat.includes('glass') || itemCat.includes('accessory');
      if (cat === 'jackets') return itemCat.includes('jacket') || itemCat.includes('outerwear') || itemCat.includes('coat');
      if (cat === 'tops') return itemCat.includes('top') || itemCat.includes('shirt') || itemCat.includes('hoodie') || itemCat.includes('sweater') || itemCat.includes('tee');
      if (cat === 'pants') return itemCat.includes('pant') || itemCat.includes('bottom') || itemCat.includes('trouser') || itemCat.includes('jean') || itemCat.includes('short');
      if (cat === 'shoes') return itemCat.includes('shoe') || itemCat.includes('sneaker') || itemCat.includes('boot') || itemCat.includes('loafer');
      if (cat === 'accessories') return itemCat.includes('accessory') || itemCat.includes('bag') || itemCat.includes('watch') || itemCat.includes('jewelry');
      return true;
    };

    const fromWishlist = wishlistItems.filter(matchesCategory);
    const fromCatalog = INITIAL_CATALOG.filter((i) => !i.isBundle && matchesCategory(i));

    // Combine with wishlist first, deduplicated
    const combined = [...fromWishlist];
    fromCatalog.forEach((item) => {
      if (!combined.some((w) => w.id === item.id)) {
        combined.push(item);
      }
    });

    return combined.length > 0 ? combined : INITIAL_CATALOG.slice(0, 6);
  }, [selectedCategoryId, wishlistItems]);

  // Row 2 items: Dynamically populated with items that match current aesthetic in real time
  const row2AestheticItems = useMemo(() => {
    const targetAesthetic = currentAesthetic.toLowerCase();

    return INITIAL_CATALOG.filter((i) => !i.isBundle)
      .sort((a, b) => {
        const hasA = (a.aesthetics || []).some((aes) => aes.toLowerCase().includes(targetAesthetic)) ? 1 : 0;
        const hasB = (b.aesthetics || []).some((aes) => aes.toLowerCase().includes(targetAesthetic)) ? 1 : 0;
        return hasB - hasA;
      })
      .slice(0, 12);
  }, [currentAesthetic]);

  // Apply Fit to 3D Avatar with loading transition
  const handleApplyFit = () => {
    setIsApplying(true);
    setTimeout(() => {
      setAppliedItems(selectedItemsList);
      setIsApplying(false);
    }, 380);
  };

  // Create new blank outfit
  const handleCreateNewOutfit = () => {
    const nextNumber = savedTryOnOutfits.length + 1;
    const newName = `Outfit ${nextNumber}`;
    setCurrentTryOnOutfitName(newName);
    setSelectedItemsMap({});
    setAppliedItems([]);
  };

  // Save current applied outfit
  const handleConfirmSaveOutfit = () => {
    if (!saveOutfitNameInput.trim()) return;
    saveTryOnOutfit(saveOutfitNameInput.trim(), appliedItems, currentAesthetic);
    setIsSaveModalOpen(false);
  };

  // Generate fallback SVG avatar graphic for sharing if WebGL snapshot is unavailable
  const getAvatarGraphicForShare = useCallback(() => {
    if (avatarSnapshot) return avatarSnapshot;

    // Stylized SVG representation of the avatar wearing the outfit
    const svgStr = `
      <svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#090d16"/>
            <stop offset="100%" stop-color="#020408"/>
          </linearGradient>
          <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#db2777"/>
            <stop offset="100%" stop-color="#818cf8"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGrad)" rx="24"/>
        <ellipse cx="180" cy="310" rx="90" ry="18" fill="#000" opacity="0.4"/>
        <!-- Stylized Head & Torso -->
        <circle cx="180" cy="85" r="28" fill="#e2e8f0"/>
        <rect x="156" y="90" width="48" height="12" rx="4" fill="#db2777"/>
        <path d="M140 125 Q180 115 220 125 L212 210 Q180 215 148 210 Z" fill="#27272a"/>
        <rect x="146" y="210" width="30" height="85" rx="6" fill="#1e293b"/>
        <rect x="184" y="210" width="30" height="85" rx="6" fill="#1e293b"/>
        <rect x="138" y="290" width="40" height="14" rx="4" fill="#0f172a"/>
        <rect x="182" y="290" width="40" height="14" rx="4" fill="#0f172a"/>
        <text x="180" y="342" fill="#f43f5e" font-size="13" font-family="monospace" font-weight="bold" text-anchor="middle">
          ${currentTryOnOutfitName.toUpperCase()}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
  }, [avatarSnapshot, currentTryOnOutfitName]);

  // Send outfit to selected friend
  const handleSendToFriend = (friendId: string) => {
    const graphic = getAvatarGraphicForShare();
    const outfitToShare: SharedOutfit = {
      id: `shared-outfit-${Date.now()}`,
      name: currentTryOnOutfitName,
      description: `Curated ${currentAesthetic} fit with ${appliedItems.length} pieces`,
      aesthetic: currentAesthetic,
      items: appliedItems.length > 0 ? appliedItems : selectedItemsList,
      createdAt: Date.now(),
      avatarGraphic: graphic,
    };

    sendOutfitToFriend(friendId, outfitToShare, shareNote.trim() || undefined);
    setIsShareModalOpen(false);
    setShareNote('');
  };

  const filteredFriends = useMemo(() => {
    if (!shareFriendSearch.trim()) return friends;
    const q = shareFriendSearch.toLowerCase();
    return friends.filter((f) => f.name.toLowerCase().includes(q) || f.handle.toLowerCase().includes(q));
  }, [friends, shareFriendSearch]);

  return (
    <div className="min-h-screen pb-32 px-3 sm:px-4 pt-[max(12px,env(safe-area-inset-top))] max-w-md mx-auto select-none overflow-x-hidden">
      {/* Hidden file input for outfit breakdown upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ============================================================
          TOP BAR (Reference Image Layout):
          - Top Left: [ Outfit 1 ▾ ] dropdown button
          - Top Right: [ + ] create outfit button, and [ ⇪ ] upload icon bubble
         ============================================================ */}
      <header className="flex items-center justify-between gap-2 mb-3 relative z-30">
        {/* Left: Outfit Selector Dropdown Button (as drawn: 'Outfit 1 v') */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOutfitDropdownOpen(!isOutfitDropdownOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 hover:border-slate-400 shadow-sm'
                : 'bg-slate-900/90 border-slate-700 text-white hover:border-pink-500 shadow-md'
            } font-black text-sm tracking-wide transition-all active:scale-95 cursor-pointer`}
            title="Switch or manage outfits"
          >
            <span className="truncate max-w-[130px] sm:max-w-[160px]">
              {currentTryOnOutfitName}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOutfitDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Outfit Dropdown Menu */}
          {isOutfitDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOutfitDropdownOpen(false)}
              />
              <div
                className={`absolute top-full left-0 mt-1.5 w-60 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800/40 mb-1 flex items-center justify-between">
                  <span>Your Outfits</span>
                  <span className="text-pink-500">{savedTryOnOutfits.length}</span>
                </div>

                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {savedTryOnOutfits.map((outfit) => {
                    const isCurrent = outfit.name === currentTryOnOutfitName;
                    return (
                      <div
                        key={outfit.id}
                        onClick={() => {
                          setCurrentTryOnOutfitName(outfit.name);
                          const newMap: Record<string, ClothingItem> = {};
                          outfit.items.forEach((it) => {
                            newMap[it.id] = it;
                          });
                          setSelectedItemsMap(newMap);
                          setAppliedItems(outfit.items);
                          setIsOutfitDropdownOpen(false);
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                          isCurrent
                            ? isLight
                              ? 'bg-pink-50 text-pink-600 font-bold'
                              : 'bg-pink-950/60 text-pink-400 font-bold'
                            : isLight
                            ? 'hover:bg-slate-100 text-slate-700'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{outfit.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {outfit.items.length} pieces • {outfit.aesthetic}
                          </p>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800/40 mt-1.5 pt-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOutfitDropdownOpen(false);
                      setSaveOutfitNameInput(currentTryOnOutfitName);
                      setIsSaveModalOpen(true);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                      isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Edit2 className="w-3 h-3 text-pink-400" />
                    <span>Save / Rename</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Button Group: '+' new outfit button & upload symbol bubble */}
        <div className="flex items-center gap-2">
          {/* '+' Button: Create new outfit */}
          <button
            type="button"
            onClick={handleCreateNewOutfit}
            className={`w-10 h-10 rounded-full border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:border-pink-500 hover:text-pink-600 shadow-sm'
                : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-pink-500 hover:text-white shadow-md'
            } flex items-center justify-center transition-all active:scale-95 cursor-pointer`}
            title="Create New Outfit"
          >
            <Plus className="w-5 h-5" strokeWidth={2.4} />
          </button>

          {/* Upload Button: Just the upload symbol in the button bubble (no words as requested) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-10 h-10 rounded-full ${
              isLight
                ? 'cosmic-gradient-bg-light shadow-pink-600/30'
                : 'cosmic-gradient-bg shadow-pink-600/40'
            } text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer`}
            title="Upload image for outfit breakdown"
          >
            <UploadIcon className="w-4 h-4 text-white" strokeWidth={2.4} />
          </button>
        </div>
      </header>

      {/* ============================================================
          MAIN STAGE:
          - 3D Avatar (left-ish middle, slightly off-center to left as sketched)
          - Vertical Scroll Bar on right side (head-to-toe category selector with speech bubble)
          - Centered 'Try On' button directly underneath the avatar
         ============================================================ */}
      <div className="relative mb-2">
        <div className="flex items-center">
          {/* Left-ish Avatar Canvas: user can drag & spin 360° */}
          <div className="w-[82%] sm:w-[84%] flex-shrink-0 flex items-center justify-center">
            <Avatar3DView
              appliedItems={appliedItems}
              isApplying={isApplying}
              isLight={isLight}
              onSnapshotReady={setAvatarSnapshot}
            />
          </div>

          {/* Right Side Vertical Apparel Category Selector (Pullable highlighter bar exactly like nav bar) */}
          <div className="w-[18%] sm:w-[16%] flex flex-col items-center justify-center relative py-1">
            {/* The Vertical Pill Strip */}
            <div
              ref={categoryBarRef}
              onTouchStart={handleCategoryTouchStart}
              onTouchMove={handleCategoryTouchMove}
              onTouchEnd={handleCategoryTouchEnd}
              onMouseDown={handleCategoryMouseDown}
              onMouseMove={handleCategoryMouseMove}
              onMouseUp={handleCategoryMouseUp}
              className={`py-2 px-1.5 rounded-full border ${
                isLight
                  ? 'bg-white/90 border-slate-300 shadow-md'
                  : 'bg-slate-900/80 border-slate-700/80 shadow-xl'
              } backdrop-blur-md flex flex-col items-center relative select-none touch-none cursor-ns-resize`}
            >
              {/* Draggable highlighter selector pill (slides smoothly with finger drag or snaps mathematically to category) */}
              <div
                style={{
                  top: `${draggedPillTop}px`,
                  height: `${pillHeightPx}px`,
                  transition: isDraggingCategory ? 'none' : 'top 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className={`absolute left-1 right-1 rounded-full ${
                  isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'
                } shadow-md pointer-events-none z-0`}
              />

              {APPAREL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                const IconComp = cat.icon;

                return (
                  <div key={cat.id} className="relative flex items-center justify-center my-1 z-10">
                    {/* Category title bubble that emerges to the left of the scroll bar for ~1.5s after being selected, then fades out */}
                    {bubbleInfo && bubbleInfo.catId === cat.id && (
                      <div
                        className={`absolute right-full mr-2.5 px-3 py-1.5 rounded-xl pointer-events-none whitespace-nowrap shadow-xl z-50 text-[11px] font-black tracking-wide flex items-center gap-1 transition-all duration-300 ease-out ${
                          bubbleInfo.fading
                            ? 'opacity-0 -translate-x-2'
                            : 'opacity-100 translate-x-0'
                        } ${
                          isLight
                            ? 'bg-slate-900 text-white border border-slate-800'
                            : 'bg-white text-slate-950 border border-slate-200'
                        }`}
                      >
                        <span>{bubbleInfo.name}</span>
                        {/* Speech Bubble Arrow pointing right to the symbol */}
                        <div
                          className={`absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45 ${
                            isLight ? 'bg-slate-900' : 'bg-white'
                          }`}
                        />
                      </div>
                    )}

                    {/* Category symbol button */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-white font-bold'
                          : isLight
                          ? 'text-slate-600 hover:text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={cat.name}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Directly centered under the avatar and above the 1st carousel row: 'Try On' button */}
        <div className="w-[82%] sm:w-[84%] flex items-center justify-center -mt-2 mb-2">
          <button
            type="button"
            onClick={handleApplyFit}
            disabled={isApplying || selectedItemsList.length === 0}
            className={`px-7 py-2.5 rounded-full ${
              isLight
                ? 'cosmic-gradient-bg-light shadow-pink-600/30 hover:shadow-pink-600/50'
                : 'cosmic-gradient-bg shadow-pink-600/40 hover:shadow-pink-600/60'
            } text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isApplying ? 'animate-spin' : ''}`} />
            <span>{isApplying ? 'Fitting...' : 'Try On'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          CAROUSELS UNDERNEATH (Two Horizontal Rows):
          - Row 1: Filtered by active head-to-toe category from liked/wishlist items
          - Row 2: Populated with items matching current aesthetic in real time
          - Both rows have corner selector indicator bubble (fills green on selection)
         ============================================================ */}
      <div className="space-y-4">
        {/* ROW 1 CAROUSEL: Category Filtered Items */}
        <section>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-pink-500 font-mono">
                {APPAREL_CATEGORIES.find((c) => c.id === selectedCategoryId)?.name || 'Category'} Picks
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isLight ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-pink-950/60 text-pink-400 border border-pink-600/40'
                }`}
              >
                {row1CategoryItems.length}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Tap to select
            </span>
          </div>

          <div
            className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {row1CategoryItems.map((item) => {
              const isSelected = Boolean(selectedItemsMap[item.id]);

              return (
                <div
                  key={`r1-${item.id}`}
                  onClick={() => toggleItemSelection(item)}
                  className={`w-32 sm:w-34 flex-shrink-0 snap-start rounded-2xl border ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-md'
                  } overflow-hidden cursor-pointer group transition-all relative flex flex-col justify-between`}
                >
                  {/* Selector indicator bubble in corner (fills green on selection as sketched) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemSelection(item);
                    }}
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full z-20 flex items-center justify-center transition-all shadow-md cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-white ring-2 ring-white/70 scale-105'
                        : isLight
                        ? 'bg-black/40 border border-white/80 hover:bg-black/60'
                        : 'bg-black/70 border border-slate-500 hover:border-white'
                    }`}
                    title={isSelected ? 'Selected' : 'Select item'}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/85 text-[10px] font-mono font-bold text-white">
                      ${item.price}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-2 space-y-0.5">
                    <p className={`text-[9px] uppercase font-bold truncate ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                      {item.brand}
                    </p>
                    <p className={`text-[10px] font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ROW 2 CAROUSEL: Matching Aesthetic Items (Dynamic in real time) */}
        <section>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1">
                <span>Matching Aesthetic:</span>
                <span className="text-white">{currentAesthetic}</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Matches your fit
            </span>
          </div>

          <div
            className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {row2AestheticItems.map((item) => {
              const isSelected = Boolean(selectedItemsMap[item.id]);

              return (
                <div
                  key={`r2-${item.id}`}
                  onClick={() => toggleItemSelection(item)}
                  className={`w-32 sm:w-34 flex-shrink-0 snap-start rounded-2xl border ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-md'
                  } overflow-hidden cursor-pointer group transition-all relative flex flex-col justify-between`}
                >
                  {/* Selector indicator bubble in corner (fills green on selection) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemSelection(item);
                    }}
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full z-20 flex items-center justify-center transition-all shadow-md cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-white ring-2 ring-white/70 scale-105'
                        : isLight
                        ? 'bg-black/40 border border-white/80 hover:bg-black/60'
                        : 'bg-black/70 border border-slate-500 hover:border-white'
                    }`}
                    title={isSelected ? 'Selected' : 'Select item'}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/85 text-[10px] font-mono font-bold text-white">
                      ${item.price}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-2 space-y-0.5">
                    <p className={`text-[9px] uppercase font-bold truncate ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                      {item.brand}
                    </p>
                    <p className={`text-[10px] font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ============================================================
          BOTTOM BIG SHARE BUTTON:
          - Underneath 2nd carousel
          - Opens user's list of friends to send avatar graphic
          - In chat, friend can tap graphic to load onto their avatar in Try On
         ============================================================ */}
      <div className="mt-5 pt-3 border-t border-slate-800/40">
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className={`w-full py-3.5 px-6 rounded-2xl ${
            isLight
              ? 'cosmic-gradient-bg-light shadow-pink-600/30 hover:shadow-pink-600/50'
              : 'cosmic-gradient-bg shadow-pink-600/40 hover:shadow-pink-600/60'
          } text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.98] transition-all cursor-pointer`}
        >
          <Share2 className="w-4 h-4 text-white" strokeWidth={2.4} />
          <span>Share Outfit with Friends</span>
        </button>
      </div>

      {/* ============================================================
          SAVE / RENAME OUTFIT MODAL
         ============================================================ */}
      {isSaveModalOpen && (
        <div
          onClick={() => setIsSaveModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl ${
              isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-950 text-white border-slate-800'
            } border p-5 shadow-2xl space-y-4`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black">Save / Name Outfit</h3>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                Outfit Name
              </label>
              <input
                type="text"
                value={saveOutfitNameInput}
                onChange={(e) => setSaveOutfitNameInput(e.target.value)}
                placeholder="e.g. Minimalist Soho Fit"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-pink-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
                autoFocus
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Includes {appliedItems.length > 0 ? appliedItems.length : selectedItemsList.length} clothing items with {currentAesthetic} aesthetic.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className={`flex-1 py-2.5 rounded-xl border ${
                  isLight ? 'border-slate-300 text-slate-700' : 'border-slate-700 text-slate-300'
                } text-xs font-bold`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveOutfit}
                className={`flex-1 py-2.5 rounded-xl ${
                  isLight ? 'cosmic-gradient-bg-light' : 'cosmic-gradient-bg'
                } text-white text-xs font-black shadow-md shadow-pink-600/30 active:scale-95`}
              >
                Save Outfit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SHARE OUTFIT WITH FRIENDS MODAL
         ============================================================ */}
      {isShareModalOpen && (
        <div
          onClick={() => setIsShareModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl ${
              isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-950 text-white border-slate-800'
            } border p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">Share with Friends</h3>
                <p className="text-xs text-slate-400">
                  Sends your avatar graphic wearing &apos;{currentTryOnOutfitName}&apos;
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Preview Graphic Card */}
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-2 text-center">
              <div className="w-28 h-32 mx-auto overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center relative">
                {avatarSnapshot ? (
                  <img src={avatarSnapshot} alt="Avatar Fit" className="w-full h-full object-contain" />
                ) : (
                  <Shirt className="w-10 h-10 text-pink-400" />
                )}
              </div>
              <p className="text-[11px] font-bold text-white mt-1.5 truncate">
                {currentTryOnOutfitName} ({appliedItems.length} items)
              </p>
            </div>

            {/* Note input */}
            <div>
              <input
                type="text"
                value={shareNote}
                onChange={(e) => setShareNote(e.target.value)}
                placeholder="Add a message... (e.g. Built this fit for you!)"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-pink-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* Friends Search & List */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Select Friend to Send
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {friend.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          @{friend.handle}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendToFriend(friend.id)}
                      className={`px-3 py-1.5 rounded-xl ${
                        isLight ? 'cosmic-gradient-bg-light' : 'cosmic-gradient-bg'
                      } text-white font-black text-xs flex items-center gap-1 shadow-md active:scale-95 cursor-pointer`}
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          INSPECT ITEM MODAL
         ============================================================ */}
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
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
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
