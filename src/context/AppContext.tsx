import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  TabType,
  ClothingItem,
  WishlistCollection,
  CartItem,
  AlgorithmProfile,
  DissectionResult,
  DissectedGarment,
  UserProfile,
  Friend,
  SharedOutfit,
  ChatMessage,
  Conversation,
} from '../types';
import {
  INITIAL_CATALOG,
  INITIAL_COLLECTIONS,
  INITIAL_WISHLIST_IDS,
  INITIAL_CART_ITEMS,
  DEMO_OUTFIT_PRESETS,
  DemoOutfitPreset,
} from '../data/mockCatalog';
import { INITIAL_FRIENDS, INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from '../data/friendsData';
import { TRENDING_AESTHETICS_25 } from '../data/aesthetics';

interface NotificationToast {
  id: string;
  message: string;
  subtext?: string;
  type: 'green' | 'silver' | 'red';
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tabResetTimestamp: number;
  resetActiveTab: (tab: TabType) => void;

  // Swiping
  catalog: ClothingItem[];
  filteredCatalog: ClothingItem[];
  currentCardIndex: number;
  brandFilter: string;
  setBrandFilter: (brand: string) => void;
  categoryFilter: string[];
  setCategoryFilter: (category: string | string[]) => void;
  toggleCategoryFilter: (category: string) => void;
  aestheticFilter: string;
  setAestheticFilter: (aesthetic: string) => void;
  genderFilter: 'all' | 'men' | 'women' | 'unisex';
  setGenderFilter: (gender: 'all' | 'men' | 'women' | 'unisex') => void;
  itemTypeFilter: 'single' | 'all' | 'bundles';
  setItemTypeFilter: (type: 'single' | 'all' | 'bundles') => void;
  sizeFilter: string;
  setSizeFilter: (size: string) => void;
  priceRangeFilter: { min: number; max: number | null; active: boolean };
  setPriceRangeFilter: (filter: { min: number; max: number | null; active: boolean }) => void;
  swipesToday: number;
  swipeLimitBypassed: boolean;
  bypassSwipeLimit: () => void;
  swipe: (direction: 'like' | 'dislike', item: ClothingItem) => void;
  undoLastSwipe: () => void;
  canUndo: boolean;
  resetDeck: () => void;
  likedItemIds: string[];
  passedItemIds: string[];

  // Wishlist & Collections
  wishlistItems: ClothingItem[];
  collections: WishlistCollection[];
  activeCollectionId: string;
  setActiveCollectionId: (id: string) => void;
  createCollection: (title: string, description: string, itemIds?: string[]) => void;
  updateCollection: (id: string, updates: Partial<WishlistCollection>) => void;
  deleteCollection: (id: string) => void;
  toggleWishlist: (item: ClothingItem) => void;
  isItemInWishlist: (itemId: string) => boolean;
  removeItemFromWishlist: (itemId: string) => void;
  assignItemToCollection: (itemId: string, collectionId: string) => void;
  addAllWishlistToCart: () => void;

  // Cart & Purchases
  cartItems: CartItem[];
  addToCart: (item: ClothingItem, size?: string, color?: string) => void;
  removeFromCart: (itemId: string, size?: string) => void;
  updateCartQuantity: (itemId: string, delta: number, size?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  purchasedItems: ClothingItem[];
  addPurchasedItems: (items: ClothingItem[]) => void;

  // Algorithm & Profile
  algorithmProfile: AlgorithmProfile;
  updateAlgorithmWeight: (type: 'aesthetic' | 'color', key: string, value: number) => void;
  applyQuizResults: (weights: Record<string, number>, primaryAesthetic: string) => void;
  addDissectedStyleToAlgorithm: (garment: DissectedGarment) => void;
  resetAlgorithm: () => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Dissection / Upload
  currentDissection: DissectionResult | null;
  setCurrentDissection: (res: DissectionResult | null) => void;
  isAnalyzing: boolean;
  uploadedImageUrl: string | null;
  setUploadedImageUrl: (url: string | null) => void;
  dissectImage: (base64OrUrl: string, mimeType?: string) => Promise<void>;
  selectPresetOutfit: (preset: DemoOutfitPreset) => void;
  breakdownHistoryItems: ClothingItem[];
  addBreakdownHistoryItems: (items: ClothingItem[]) => void;

  // Friends & Messaging
  friends: Friend[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  isInboxOpen: boolean;
  setIsInboxOpen: (open: boolean) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  chatOnlineStatus: 'online' | 'busy' | 'offline';
  setChatOnlineStatus: (status: 'online' | 'busy' | 'offline') => void;
  sendMessage: (
    conversationId: string,
    text?: string,
    sharedItem?: ClothingItem,
    sharedOutfit?: SharedOutfit
  ) => void;
  createConversation: (participantIds: string[], name?: string) => string;
  updateConversationAvatar: (conversationId: string, avatarUrl: string) => void;
  sendItemToFriends: (friendIds: string[], item: ClothingItem, note?: string) => void;
  sendOutfitToFriend: (friendId: string, outfit: SharedOutfit, note?: string) => void;
  openChatWithFriend: (friendId: string) => void;
  totalUnreadMessages: number;
  sendItemModalItem: ClothingItem | null;
  setSendItemModalItem: (item: ClothingItem | null) => void;

  // Toasts
  toasts: NotificationToast[];
  showToast: (message: string, subtext?: string, type?: 'green' | 'silver' | 'red') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tabs in requested order: 1: swipe, 2: wishlist, 3: cart, 4: profile, 5: upload
  const [activeTab, setActiveTab] = useState<TabType>('swipe');
  const [tabResetTimestamp, setTabResetTimestamp] = useState<number>(Date.now());

  const resetActiveTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setTabResetTimestamp(Date.now());
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Algorithm Profile state with all 25 trending aesthetics
  const [algorithmProfile, setAlgorithmProfile] = useState<AlgorithmProfile>({
    aestheticWeights: {
      'Gorpcore': 84,
      'Minimalist': 86,
      'Streetwear': 78,
      'Quiet Luxury': 80,
      'Avant-Garde': 68,
      'Workwear': 72,
      'Vintage 70s Retro': 65,
      '90s Grunge': 70,
      'Y2K Cyber': 60,
      'Old Money': 74,
      'Dark Academia': 66,
      'Techwear': 75,
      'Punk Rock': 58,
      'Skatecore': 68,
      'Blokecore': 72,
      'Bohemian Indie': 55,
      'Western Americana': 64,
      'Utilitarian Military': 70,
      'Futuristic Cyberpunk': 62,
      'Coquette Softcore': 58,
      'Normcore': 76,
      'Japanese Americana': 80,
      'Rave Acid House': 60,
      'Coastal Grandmillennial': 64,
      'Clean Sartorial': 75,
    },
    colorWeights: {
      'Olive & Earth Greens': 88,
      'Monochrome Black & Charcoal': 92,
      'Slate Silver & Grey': 84,
      'Bone & Off-White': 80,
    },
    brandWeights: {
      "Arc'teryx": 88,
      'Acne Studios': 92,
      'Issey Miyake': 84,
      'Salomon': 89,
      'Jil Sander': 82,
      'Rick Owens': 80,
      'Prada': 86,
      'Jacquemus': 85,
      'Stüssy': 78,
      'Maison Margiela': 87,
      'Carhartt WIP': 72,
      'Kith': 76,
      'Nike ACG': 83,
      'Nike': 82,
      'Adidas': 79,
      'New Balance': 85,
      'Uniqlo': 88,
      "Levi's": 84,
      'Goodwill Vintage': 86,
    },
    categoryWeights: {
      'Outerwear': 85,
      'Knitwear': 80,
      'Bottoms': 75,
      'Footwear': 82,
      'Accessories': 70,
    },
    totalSwipes: 28,
    likeCount: 20,
    dislikeCount: 8,
    dissectedOutfitsLearned: 3,
    recentLearnedStyles: [
      { style: 'Olive Green Knitwear', source: 'Swiping Match', timestamp: Date.now() - 3600000, delta: 12 },
      { style: 'Gorpcore Shells', source: 'Uploaded Photo Dissection', timestamp: Date.now() - 7200000, delta: 18 },
      { style: 'Slate Silver Hardware', source: 'Wishlist Save', timestamp: Date.now() - 14400000, delta: 8 },
    ],
  });

  // Calculate dynamic match scores for catalog items based on algorithm profile
  const catalogWithScores = useMemo(() => {
    return INITIAL_CATALOG.map((item) => {
      let score = 65; // base score

      // Brand contribution
      if (algorithmProfile.brandWeights[item.brand]) {
        score += (algorithmProfile.brandWeights[item.brand] - 50) * 0.15;
      }

      // Aesthetic contribution
      item.aesthetics.forEach((aes) => {
        if (algorithmProfile.aestheticWeights[aes]) {
          score += (algorithmProfile.aestheticWeights[aes] - 50) * 0.2;
        }
      });

      // Color contribution (consolidated affinities)
      item.colors.forEach((col) => {
        const cLower = col.toLowerCase();
        let matchedWeight: number | undefined;
        if (cLower.includes('green') || cLower.includes('olive') || cLower.includes('sage') || cLower.includes('moss') || cLower.includes('emerald')) {
          matchedWeight = algorithmProfile.colorWeights['Olive & Earth Greens'];
        } else if (cLower.includes('black') || cLower.includes('charcoal')) {
          matchedWeight = algorithmProfile.colorWeights['Monochrome Black & Charcoal'];
        } else if (cLower.includes('silver') || cLower.includes('grey') || cLower.includes('slate') || cLower.includes('melange')) {
          matchedWeight = algorithmProfile.colorWeights['Slate Silver & Grey'];
        } else if (cLower.includes('white') || cLower.includes('bone') || cLower.includes('champagne') || cLower.includes('cream')) {
          matchedWeight = algorithmProfile.colorWeights['Bone & Off-White'];
        } else {
          matchedWeight = algorithmProfile.colorWeights[col];
        }
        if (matchedWeight !== undefined) {
          score += (matchedWeight - 50) * 0.15;
        }
      });

      // Category contribution
      if (algorithmProfile.categoryWeights[item.category]) {
        score += (algorithmProfile.categoryWeights[item.category] - 50) * 0.1;
      }

      // Normalize between 72% and 99%
      const clampedScore = Math.min(99, Math.max(72, Math.round(score)));
      return {
        ...item,
        matchScore: clampedScore,
      };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [algorithmProfile]);

  // Swipe Feed State
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilterState] = useState<string[]>([]);

  const setCategoryFilter = useCallback((val: string | string[]) => {
    if (typeof val === 'string') {
      if (val === 'all') {
        setCategoryFilterState([]);
      } else {
        setCategoryFilterState([val]);
      }
    } else {
      setCategoryFilterState(val.filter((c) => c !== 'all'));
    }
  }, []);

  const toggleCategoryFilter = useCallback((cat: string) => {
    if (cat === 'all') {
      setCategoryFilterState([]);
      return;
    }
    setCategoryFilterState((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === cat.toLowerCase());
      if (exists) {
        return prev.filter((c) => c.toLowerCase() !== cat.toLowerCase());
      } else {
        return [...prev, cat];
      }
    });
  }, []);

  const [aestheticFilter, setAestheticFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women' | 'unisex'>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<'single' | 'all' | 'bundles'>('single');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState<{ min: number; max: number | null; active: boolean }>({
    min: 1,
    max: null,
    active: false,
  });
  const [swipesToday, setSwipesToday] = useState<number>(14);
  const [swipeLimitBypassed, setSwipeLimitBypassed] = useState<boolean>(false);

  const bypassSwipeLimit = useCallback(() => {
    setSwipeLimitBypassed(true);
  }, []);

  const [swipedItemIds, setSwipedItemIds] = useState<string[]>([]);
  const [likedItemIds, setLikedItemIds] = useState<string[]>(INITIAL_WISHLIST_IDS);
  const [savedWishlistItemIds, setSavedWishlistItemIds] = useState<string[]>(INITIAL_WISHLIST_IDS);
  const [passedItemIds, setPassedItemIds] = useState<string[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<Array<{ id: string; action: 'like' | 'dislike'; item: ClothingItem }>>([]);

  // Wishlist Collections
  const [collections, setCollections] = useState<WishlistCollection[]>(INITIAL_COLLECTIONS);
  const [activeCollectionId, setActiveCollectionId] = useState<string>('all');

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [purchasedItems, setPurchasedItems] = useState<ClothingItem[]>(() => [
    INITIAL_CATALOG[1], // Arc'teryx Beta LT Jacket
    INITIAL_CATALOG[2], // Salomon XT-6 Expanse
    INITIAL_CATALOG[4], // Issey Miyake Pleats Please
  ]);

  const addPurchasedItems = useCallback((items: ClothingItem[]) => {
    setPurchasedItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      const newlyAdded = items.filter((i) => !existingIds.has(i.id));
      return [...newlyAdded, ...prev];
    });
  }, []);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Sanyi Aga',
    handle: '@sanyi_style',
    email: 'sanyiiaga416@gmail.com',
    phone: '+1 (555) 234-5678',
    avatarUrl: '',
    coverImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    joinedDate: 'May 2024',
    bio: 'Minimalist technical curator',
    membership: 'Pro Style Member',
    styleArchetype: 'Minimal Utilitarian / Gorpcore',
    paymentMethod: {
      cardNumber: '•••• •••• •••• 4128',
      cardHolder: 'Sanyi Aga',
      expiry: '08/28',
      cvc: '•••',
      billingZip: '90210',
      applePay: true,
    },
    shippingAddress: {
      street: '420 Fashion Ave, Suite 12B',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      country: 'United States',
    },
    preferences: {
      topSize: 'L',
      bottomSize: '32 (M)',
      shoeSize: '10.5 US (44 EU)',
      currency: 'USD ($)',
      hapticFeedback: true,
      priceDropAlerts: true,
      dailySwipeLimit: null,
      preferredDepartment: 'both',
      showArchetypePublicly: true,
      outfitsVisibility: 'anyone',
      moodboardsVisibility: 'anyone',
      collectionsVisibility: 'anyone',
      profileDiscoverability: 'public',
      theme: 'dark',
      autoAdvance: true,
      highResImages: true,
      compactCards: false,
      showOutOfStock: false,
    },
  });

  // Dissection State
  const [currentDissection, setCurrentDissection] = useState<DissectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Previously found items using the breakdown tool
  const [breakdownHistoryItems, setBreakdownHistoryItems] = useState<ClothingItem[]>(() => {
    return [
      INITIAL_CATALOG.find((i) => i.id === 'item-2') || INITIAL_CATALOG[1],
      INITIAL_CATALOG.find((i) => i.id === 'item-1') || INITIAL_CATALOG[0],
      INITIAL_CATALOG.find((i) => i.id === 'item-5') || INITIAL_CATALOG[4],
      INITIAL_CATALOG.find((i) => i.id === 'item-4') || INITIAL_CATALOG[3],
      INITIAL_CATALOG.find((i) => i.id === 'item-3') || INITIAL_CATALOG[2],
      INITIAL_CATALOG.find((i) => i.id === 'item-47') || INITIAL_CATALOG[5],
      INITIAL_CATALOG.find((i) => i.id === 'item-48') || INITIAL_CATALOG[6],
      INITIAL_CATALOG.find((i) => i.id === 'item-6') || INITIAL_CATALOG[7],
    ].filter(Boolean);
  });

  const addBreakdownHistoryItems = useCallback((items: ClothingItem[]) => {
    setBreakdownHistoryItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      const newItems = items.filter((i) => !existingIds.has(i.id));
      return [...newItems, ...prev];
    });
  }, []);

  // Online Appearance Status in Chat (online, busy, offline)
  const [chatOnlineStatus, setChatOnlineStatus] = useState<'online' | 'busy' | 'offline'>('online');

  // Toasts
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const showToast = useCallback((message: string, subtext?: string, type: 'green' | 'silver' | 'red' = 'green') => {
    const combined = `${message || ''} ${subtext || ''}`.toLowerCase();
    // Only banner notifications pertaining to adding items to cart or friend interactions are permitted
    const isCartAdd =
      (combined.includes('cart') || combined.includes('checkout')) &&
      (combined.includes('add') || combined.includes('added'));
    const isFriend =
      combined.includes('friend') ||
      combined.includes('fit recommendation') ||
      combined.includes('sent fit') ||
      combined.includes('recommendation sent');

    if (!isCartAdd && !isFriend) {
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, subtext, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Filtered catalog for Swiping Tab
  const filteredCatalog = useMemo(() => {
    return catalogWithScores.filter((item) => {
      // Don't show already swiped items
      if (swipedItemIds.includes(item.id)) return false;

      // Item Type Filter: default 'single' only suggests single items, not bundles/outfits
      if (itemTypeFilter === 'single' && item.isBundle) {
        return false;
      }
      if (itemTypeFilter === 'bundles' && !item.isBundle) {
        return false;
      }

      // Department Setting Filter from Wardrobe & Sizing (Men's, Women's, or Both)
      const dept = userProfile.preferences.preferredDepartment || 'both';
      if (dept === 'men') {
        if (item.gender !== 'men' && item.gender !== 'unisex') {
          return false;
        }
      } else if (dept === 'women') {
        if (item.gender !== 'women' && item.gender !== 'unisex') {
          return false;
        }
      }

      // Men / Women / Unisex Filter (applies to recommendations depending on what is selected)
      if (genderFilter === 'men') {
        if (item.gender !== 'men' && item.gender !== 'unisex') {
          return false;
        }
      } else if (genderFilter === 'women') {
        if (item.gender !== 'women' && item.gender !== 'unisex') {
          return false;
        }
      } else if (genderFilter === 'unisex') {
        if (item.gender !== 'unisex') {
          return false;
        }
      }

      // Brand Filter
      if (brandFilter !== 'all' && item.brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }

      // Multiple Category Filter (allows multiple clothing categories to be selected)
      if (categoryFilter.length > 0 && !categoryFilter.includes('all')) {
        const itemCategory = item.category === 'Dresses' ? 'Tops' : item.category;
        const matchesCategory = categoryFilter.some(
          (c) =>
            c.toLowerCase() === itemCategory.toLowerCase() ||
            c.toLowerCase() === item.category.toLowerCase()
        );
        if (!matchesCategory) {
          return false;
        }
      }

      // Aesthetic Filter (25 trending aesthetics bank)
      if (aestheticFilter !== 'all' && !item.aesthetics.includes(aestheticFilter)) {
        return false;
      }

      // Size Filter (off by default)
      if (sizeFilter !== 'all') {
        const matchesSize = item.sizes.some((s) => s.toLowerCase().includes(sizeFilter.toLowerCase()));
        if (!matchesSize) return false;
      }

      // Price Range Filter ($1 to unlimited slider, off by default)
      if (priceRangeFilter.active) {
        if (item.price < priceRangeFilter.min) {
          return false;
        }
        if (priceRangeFilter.max !== null && item.price > priceRangeFilter.max) {
          return false;
        }
      }

      return true;
    });
  }, [
    catalogWithScores,
    swipedItemIds,
    brandFilter,
    categoryFilter,
    aestheticFilter,
    genderFilter,
    itemTypeFilter,
    sizeFilter,
    priceRangeFilter,
    userProfile.preferences.preferredDepartment,
  ]);

  const currentCardIndex = 0; // Top card is always index 0 of filtered queue

  // Swipe Action
  const swipe = useCallback((direction: 'like' | 'dislike', item: ClothingItem) => {
    if (!item) return;

    setSwipedItemIds((prev) => [...prev, item.id]);
    setSwipeHistory((prev) => [...prev, { id: item.id, action: direction, item }]);
    setSwipesToday((prev) => prev + 1);

    if (direction === 'like') {
      setLikedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));

      // Boost Algorithm Weights
      setAlgorithmProfile((prev) => {
        const nextAesthetics = { ...prev.aestheticWeights };
        item.aesthetics.forEach((aes) => {
          nextAesthetics[aes] = Math.min(100, (nextAesthetics[aes] || 50) + 4);
        });

        const nextColors = { ...prev.colorWeights };
        item.colors.forEach((col) => {
          const cLower = col.toLowerCase();
          let targetKey: string | undefined;
          if (cLower.includes('green') || cLower.includes('olive') || cLower.includes('sage') || cLower.includes('moss') || cLower.includes('emerald')) {
            targetKey = 'Olive & Earth Greens';
          } else if (cLower.includes('black') || cLower.includes('charcoal')) {
            targetKey = 'Monochrome Black & Charcoal';
          } else if (cLower.includes('silver') || cLower.includes('grey') || cLower.includes('slate') || cLower.includes('melange')) {
            targetKey = 'Slate Silver & Grey';
          } else if (cLower.includes('white') || cLower.includes('bone') || cLower.includes('champagne') || cLower.includes('cream')) {
            targetKey = 'Bone & Off-White';
          }
          if (targetKey && nextColors[targetKey] !== undefined) {
            nextColors[targetKey] = Math.min(100, nextColors[targetKey] + 3);
          }
        });

        const nextBrands = { ...prev.brandWeights };
        nextBrands[item.brand] = Math.min(100, (nextBrands[item.brand] || 50) + 4);

        return {
          ...prev,
          aestheticWeights: nextAesthetics,
          colorWeights: nextColors,
          brandWeights: nextBrands,
          totalSwipes: prev.totalSwipes + 1,
          likeCount: prev.likeCount + 1,
          recentLearnedStyles: [
            {
              style: `${item.brand} • ${item.aesthetics[0] || 'Fashion'}`,
              source: 'Swipe Like',
              timestamp: Date.now(),
              delta: 4,
            },
            ...prev.recentLearnedStyles.slice(0, 9),
          ],
        };
      });
    } else {
      setPassedItemIds((prev) => [...prev, item.id]);

      // Slightly lower weights on disliked aesthetic
      setAlgorithmProfile((prev) => {
        const nextAesthetics = { ...prev.aestheticWeights };
        item.aesthetics.forEach((aes) => {
          if (nextAesthetics[aes]) {
            nextAesthetics[aes] = Math.max(10, nextAesthetics[aes] - 2);
          }
        });

        return {
          ...prev,
          aestheticWeights: nextAesthetics,
          totalSwipes: prev.totalSwipes + 1,
          dislikeCount: prev.dislikeCount + 1,
        };
      });
    }
  }, [showToast]);

  const undoLastSwipe = useCallback(() => {
    if (swipeHistory.length === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((prev) => prev.slice(0, -1));
    setSwipedItemIds((prev) => prev.filter((id) => id !== last.id));

    if (last.action === 'like') {
      setLikedItemIds((prev) => prev.filter((id) => id !== last.id));
      showToast('Undid like', last.item.name, 'silver');
    } else {
      setPassedItemIds((prev) => prev.filter((id) => id !== last.id));
      showToast('Undid pass', last.item.name, 'silver');
    }
  }, [swipeHistory, showToast]);

  const resetDeck = useCallback(() => {
    setSwipedItemIds([]);
    setPassedItemIds([]);
    showToast('Feed refreshed', 'Viewing all curated clothes again', 'silver');
  }, [showToast]);

  // Wishlist Items - only added when user taps the save ribbon icon
  const wishlistItems = useMemo(() => {
    const items = catalogWithScores.filter((item) => savedWishlistItemIds.includes(item.id));
    if (activeCollectionId === 'all') return items;
    const collection = collections.find((c) => c.id === activeCollectionId);
    if (!collection) return items;
    return items.filter((item) => collection.itemIds.includes(item.id));
  }, [catalogWithScores, savedWishlistItemIds, activeCollectionId, collections]);

  const isItemInWishlist = useCallback((itemId: string) => {
    return savedWishlistItemIds.includes(itemId);
  }, [savedWishlistItemIds]);

  const toggleWishlist = useCallback((item: ClothingItem) => {
    setSavedWishlistItemIds((prev) => {
      const exists = prev.includes(item.id);
      if (exists) {
        return prev.filter((id) => id !== item.id);
      } else {
        return [...prev, item.id];
      }
    });
  }, []);

  const removeItemFromWishlist = useCallback((itemId: string) => {
    setSavedWishlistItemIds((prev) => prev.filter((id) => id !== itemId));
  }, []);

  const createCollection = useCallback((title: string, description: string, itemIds?: string[]) => {
    const newCol: WishlistCollection = {
      id: `col-${Date.now()}`,
      title,
      description,
      itemIds: itemIds || [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCollections((prev) => [...prev, newCol]);
    showToast(`Created moodboard "${title}"`, `${itemIds?.length || 0} pieces added`, 'green');
  }, [showToast]);

  const updateCollection = useCallback((id: string, updates: Partial<WishlistCollection>) => {
    setCollections((prev) =>
      prev.map((col) => (col.id === id ? { ...col, ...updates } : col))
    );
    showToast('Moodboard updated', '', 'green');
  }, [showToast]);

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => prev.filter((col) => col.id !== id));
    showToast('Moodboard deleted', '', 'red');
  }, [showToast]);

  const assignItemToCollection = useCallback((itemId: string, collectionId: string) => {
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === collectionId) {
          return {
            ...col,
            itemIds: col.itemIds.includes(itemId) ? col.itemIds : [...col.itemIds, itemId],
          };
        }
        return col;
      })
    );
    showToast('Added to Collection', '', 'green');
  }, [showToast]);

  const addAllWishlistToCart = useCallback(() => {
    if (wishlistItems.length === 0) return;
    setCartItems((prev) => {
      const existingIds = new Set(prev.map((ci) => ci.item.id));
      const newItems = wishlistItems
        .filter((item) => !existingIds.has(item.id))
        .map((item) => ({
          item,
          quantity: 1,
          selectedSize: item.sizes[0] || 'M',
          selectedColor: item.colors[0] || 'Black',
        }));
      return [...prev, ...newItems];
    });
    showToast(`Added ${wishlistItems.length} items to Cart!`, 'Ready for checkout', 'green');
    setActiveTab('cart');
  }, [wishlistItems, showToast]);

  // Cart operations
  const addToCart = useCallback((item: ClothingItem, size?: string, color?: string) => {
    const selectedSize = size || item.sizes[0] || 'M';
    const selectedColor = color || item.colors[0] || 'Default';

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (ci) => ci.item.id === item.id && ci.selectedSize === selectedSize && ci.selectedColor === selectedColor
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [...prev, { item, quantity: 1, selectedSize, selectedColor }];
    });
    showToast('Added to Cart', `${item.name} (${selectedSize})`, 'green');
  }, [showToast]);

  const removeFromCart = useCallback((itemId: string, size?: string) => {
    setCartItems((prev) =>
      prev.filter((ci) => {
        if (size) return !(ci.item.id === itemId && ci.selectedSize === size);
        return ci.item.id !== itemId;
      })
    );
    showToast('Removed from Cart', '', 'red');
  }, [showToast]);

  const updateCartQuantity = useCallback((itemId: string, delta: number, size?: string) => {
    setCartItems((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId && (!size || ci.selectedSize === size)) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    showToast('Cart cleared', '', 'silver');
  }, [showToast]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  }, [cartItems]);

  // Algorithm fine tuning
  const updateAlgorithmWeight = useCallback((type: 'aesthetic' | 'color', key: string, value: number) => {
    setAlgorithmProfile((prev) => {
      if (type === 'aesthetic') {
        return {
          ...prev,
          aestheticWeights: { ...prev.aestheticWeights, [key]: value },
        };
      } else {
        return {
          ...prev,
          colorWeights: { ...prev.colorWeights, [key]: value },
        };
      }
    });
  }, []);

  // Apply Quiz Results to adjust all 25 aesthetic weights
  const applyQuizResults = useCallback((weights: Record<string, number>, primaryAesthetic: string) => {
    setAlgorithmProfile((prev) => {
      const updatedAestheticWeights = {
        ...prev.aestheticWeights,
        ...weights,
      };

      return {
        ...prev,
        aestheticWeights: updatedAestheticWeights,
        recentLearnedStyles: [
          {
            style: `${primaryAesthetic} Taste Discovery`,
            source: "What's My Aesthetic? Quiz",
            timestamp: Date.now(),
            delta: 25,
          },
          ...prev.recentLearnedStyles.slice(0, 8),
        ],
      };
    });
    showToast("Taste Profile Updated!", `Calibrated around ${primaryAesthetic} across 25 styles`, 'green');
  }, [showToast]);

  const resetAlgorithm = useCallback(() => {
    const neutralAesthetics: Record<string, number> = {};
    TRENDING_AESTHETICS_25.forEach((aes) => {
      neutralAesthetics[aes] = 50;
    });

    setAlgorithmProfile({
      aestheticWeights: neutralAesthetics,
      colorWeights: {
        'Olive & Earth Greens': 50,
        'Monochrome Black & Charcoal': 50,
        'Slate Silver & Grey': 50,
        'Bone & Off-White': 50,
      },
      brandWeights: {},
      categoryWeights: {},
      totalSwipes: 0,
      likeCount: 0,
      dislikeCount: 0,
      dissectedOutfitsLearned: 0,
      recentLearnedStyles: [],
    });
    showToast('Algorithm reset to neutral baseline', 'Swipe to train fresh preferences', 'silver');
  }, [showToast]);

  // Add dissected garment style to recommendation algorithm
  const addDissectedStyleToAlgorithm = useCallback((garment: DissectedGarment) => {
    setAlgorithmProfile((prev) => {
      const nextAesthetic = { ...prev.aestheticWeights };
      if (garment.aesthetic) {
        nextAesthetic[garment.aesthetic] = Math.min(100, (nextAesthetic[garment.aesthetic] || 50) + 15);
      }

      const nextColors = { ...prev.colorWeights };
      if (garment.color) {
        // match to consolidated color affinity groups
        const cLower = garment.color.toLowerCase();
        let colorKey = 'Slate Silver & Grey';
        if (cLower.includes('green') || cLower.includes('olive') || cLower.includes('sage') || cLower.includes('moss') || cLower.includes('emerald')) {
          colorKey = 'Olive & Earth Greens';
        } else if (cLower.includes('black') || cLower.includes('charcoal')) {
          colorKey = 'Monochrome Black & Charcoal';
        } else if (cLower.includes('silver') || cLower.includes('grey') || cLower.includes('slate') || cLower.includes('melange')) {
          colorKey = 'Slate Silver & Grey';
        } else if (cLower.includes('white') || cLower.includes('bone') || cLower.includes('champagne') || cLower.includes('cream')) {
          colorKey = 'Bone & Off-White';
        }
        nextColors[colorKey] = Math.min(100, (nextColors[colorKey] || 50) + 12);
      }

      const nextCategory = { ...prev.categoryWeights };
      if (garment.category) {
        nextCategory[garment.category] = Math.min(100, (nextCategory[garment.category] || 50) + 10);
      }

      return {
        ...prev,
        aestheticWeights: nextAesthetic,
        colorWeights: nextColors,
        categoryWeights: nextCategory,
        dissectedOutfitsLearned: prev.dissectedOutfitsLearned + 1,
        recentLearnedStyles: [
          {
            style: `${garment.name} (${garment.aesthetic || 'Streetwear'})`,
            source: 'Photo Dissection',
            timestamp: Date.now(),
            delta: 15,
          },
          ...prev.recentLearnedStyles.slice(0, 9),
        ],
      };
    });

    // Mark garment as added
    if (currentDissection) {
      setCurrentDissection({
        ...currentDissection,
        items: currentDissection.items.map((i) =>
          i.id === garment.id ? { ...i, addedToAlgorithm: true } : i
        ),
      });
    }

    showToast(
      'Algorithm Updated!',
      `+15% weight for ${garment.aesthetic || 'this style'} and ${garment.color}`,
      'green'
    );
  }, [currentDissection, showToast]);

  // Helper to find marketplace items similar to a dissected garment
  const findMarketplaceMatches = useCallback((garmentKeywords: string, category: string, aesthetic: string, color: string): ClothingItem[] => {
    const keywords = (garmentKeywords + ' ' + aesthetic + ' ' + color).toLowerCase().split(/\s+/);

    const scored = INITIAL_CATALOG.map((catItem) => {
      let score = 0;
      if (catItem.category.toLowerCase() === category.toLowerCase()) score += 40;
      if (catItem.aesthetics.some((a) => aesthetic.toLowerCase().includes(a.toLowerCase()))) score += 30;
      if (catItem.colors.some((c) => color.toLowerCase().includes(c.toLowerCase()))) score += 20;

      keywords.forEach((kw) => {
        if (kw.length > 2 && (catItem.name.toLowerCase().includes(kw) || catItem.description.toLowerCase().includes(kw))) {
          score += 15;
        }
      });

      return { item: catItem, matchStrength: score };
    });

    scored.sort((a, b) => b.matchStrength - a.matchStrength);
    return scored.slice(0, 3).map((s) => s.item);
  }, []);

  // Preset outfit selection
  const selectPresetOutfit = useCallback((preset: DemoOutfitPreset) => {
    setUploadedImageUrl(preset.image);
    setIsAnalyzing(true);

    setTimeout(() => {
      const dissectedItems: DissectedGarment[] = preset.dissectedItems.map((item, idx) => {
        const matches = findMarketplaceMatches(item.searchKeywords, item.category, item.aesthetic, item.color);
        return {
          id: `dissect-${idx}-${Date.now()}`,
          name: item.name,
          category: item.category,
          color: item.color,
          material: item.material,
          aesthetic: item.aesthetic,
          fit: item.fit,
          tags: item.tags,
          searchKeywords: item.searchKeywords,
          confidence: item.confidence,
          box: item.box,
          marketplaceMatches: matches,
          addedToAlgorithm: false,
        };
      });

      const result: DissectionResult = {
        overallAesthetic: preset.overallAesthetic,
        colorPalette: preset.colorPalette,
        items: dissectedItems,
      };

      setCurrentDissection(result);
      const matches = dissectedItems.flatMap((d) => d.marketplaceMatches);
      if (matches.length > 0) {
        addBreakdownHistoryItems(matches);
      }
      setIsAnalyzing(false);
      showToast(
        `Dissected ${dissectedItems.length} clothing items!`,
        `Identified ${preset.overallAesthetic} style`,
        'green'
      );
    }, 650);
  }, [findMarketplaceMatches, showToast, addBreakdownHistoryItems]);

  // Dissect uploaded image via server or smart computer vision fallback
  const dissectImage = useCallback(async (base64OrUrl: string, mimeType: string = 'image/jpeg') => {
    setIsAnalyzing(true);
    setUploadedImageUrl(base64OrUrl);

    try {
      const response = await fetch('/api/dissect-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64OrUrl, mimeType }),
      });

      const resData = await response.json();

      if (resData.status === 'success' && resData.data && resData.data.items) {
        const geminiItems = resData.data.items;
        const dissectedItems: DissectedGarment[] = geminiItems.map((item: any, idx: number) => {
          const matches = findMarketplaceMatches(
            item.searchKeywords || item.name,
            item.category || 'Tops',
            item.aesthetic || 'Streetwear',
            item.color || 'Black'
          );

          return {
            id: `dissect-${idx}-${Date.now()}`,
            name: item.name,
            category: item.category,
            color: item.color,
            material: item.material || 'Premium Fabric',
            aesthetic: item.aesthetic || resData.data.overallAesthetic || 'Streetwear',
            fit: item.fit || 'Regular',
            tags: item.tags || [item.category, item.color],
            searchKeywords: item.searchKeywords || item.name,
            confidence: 0.94,
            box: item.box || {
              ymin: 15 + idx * 25,
              xmin: 25,
              ymax: 38 + idx * 25,
              xmax: 75,
            },
            marketplaceMatches: matches,
            addedToAlgorithm: false,
          };
        });

        const finalResult: DissectionResult = {
          overallAesthetic: resData.data.overallAesthetic || 'Modern Street & Tech Utilitarian',
          colorPalette: resData.data.colorPalette || ['Olive Green', 'Jet Black', 'Slate Silver'],
          items: dissectedItems,
        };

        setCurrentDissection(finalResult);
        const matches = dissectedItems.flatMap((d) => d.marketplaceMatches);
        if (matches.length > 0) {
          addBreakdownHistoryItems(matches);
        }
        showToast(
          `AI Dissection Complete: Found ${dissectedItems.length} items!`,
          `Analyzed aesthetic: ${finalResult.overallAesthetic}`,
          'green'
        );
      } else {
        // High fidelity fallback dissection with simulated computer vision breakdown
        const fallbackPreset = DEMO_OUTFIT_PRESETS[0];
        const dissectedItems: DissectedGarment[] = fallbackPreset.dissectedItems.map((item, idx) => {
          const matches = findMarketplaceMatches(item.searchKeywords, item.category, item.aesthetic, item.color);
          return {
            id: `dissect-${idx}-${Date.now()}`,
            name: item.name,
            category: item.category,
            color: item.color,
            material: item.material,
            aesthetic: item.aesthetic,
            fit: item.fit,
            tags: item.tags,
            searchKeywords: item.searchKeywords,
            confidence: item.confidence,
            box: item.box,
            marketplaceMatches: matches,
            addedToAlgorithm: false,
          };
        });

        setCurrentDissection({
          overallAesthetic: fallbackPreset.overallAesthetic,
          colorPalette: fallbackPreset.colorPalette,
          items: dissectedItems,
        });

        const matches = dissectedItems.flatMap((d) => d.marketplaceMatches);
        if (matches.length > 0) {
          addBreakdownHistoryItems(matches);
        }

        showToast(
          `Dissected ${dissectedItems.length} clothing items!`,
          'Identified styles & matched with marketplace',
          'green'
        );
      }
    } catch (err) {
      console.warn('Dissection fallback triggered:', err);
      // Fallback preset
      const fallbackPreset = DEMO_OUTFIT_PRESETS[0];
      const dissectedItems: DissectedGarment[] = fallbackPreset.dissectedItems.map((item, idx) => {
        const matches = findMarketplaceMatches(item.searchKeywords, item.category, item.aesthetic, item.color);
        return {
          id: `dissect-${idx}-${Date.now()}`,
          name: item.name,
          category: item.category,
          color: item.color,
          material: item.material,
          aesthetic: item.aesthetic,
          fit: item.fit,
          tags: item.tags,
          searchKeywords: item.searchKeywords,
          confidence: item.confidence,
          box: item.box,
          marketplaceMatches: matches,
          addedToAlgorithm: false,
        };
      });

      setCurrentDissection({
        overallAesthetic: fallbackPreset.overallAesthetic,
        colorPalette: fallbackPreset.colorPalette,
        items: dissectedItems,
      });

      const matches = dissectedItems.flatMap((d) => d.marketplaceMatches);
      if (matches.length > 0) {
        addBreakdownHistoryItems(matches);
      }

      showToast(
        `Dissected ${dissectedItems.length} items from outfit!`,
        'Matched with marketplace catalog',
        'green'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [findMarketplaceMatches, showToast, addBreakdownHistoryItems]);

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
    showToast('Profile updated', '', 'green');
  }, [showToast]);

  // Friends & Chat State
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sendItemModalItem, setSendItemModalItem] = useState<ClothingItem | null>(null);

  const sendMessage = useCallback((
    conversationId: string,
    text?: string,
    sharedItem?: ClothingItem,
    sharedOutfit?: SharedOutfit
  ) => {
    const newMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessage = {
      id: newMsgId,
      conversationId,
      senderId: 'user',
      text: text?.trim() || undefined,
      sharedItem,
      sharedOutfit,
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: newMsg,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    // Realistic delivery & seen transitions
    setTimeout(() => {
      setMessages((prev) => {
        const thread = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: thread.map((m) =>
            m.id === newMsgId && m.status === 'sent' ? { ...m, status: 'delivered' } : m
          ),
        };
      });
    }, 1200);

    setTimeout(() => {
      setMessages((prev) => {
        const thread = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: thread.map((m) =>
            m.id === newMsgId ? { ...m, status: 'seen', seenTimestamp: Date.now() } : m
          ),
        };
      });
    }, 3800);
  }, []);

  const createConversation = useCallback((participantIds: string[], name?: string): string => {
    if (participantIds.length === 1) {
      const existing = conversations.find(
        (c) => c.type === 'direct' && c.participantIds.includes(participantIds[0])
      );
      if (existing) {
        return existing.id;
      }
    }

    const newId = `conv-${Date.now()}`;
    const isGroup = participantIds.length > 1;
    const friend = friends.find((f) => f.id === participantIds[0]);

    const newConv: Conversation = {
      id: newId,
      type: isGroup ? 'group' : 'direct',
      name:
        name ||
        (isGroup
          ? participantIds
              .map((id) => friends.find((f) => f.id === id)?.name.split(' ')[0])
              .filter(Boolean)
              .join(', ') + ' Squad'
          : friend?.name),
      participantIds,
      avatar: !isGroup ? friend?.avatar : undefined,
      unreadCount: 0,
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({ ...prev, [newId]: [] }));
    return newId;
  }, [conversations, friends]);

  const updateConversationAvatar = useCallback((convId: string, avatarUrl: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, avatar: avatarUrl } : c))
    );
    showToast('Group Photo Updated', 'Uploaded new group photo', 'green');
  }, [showToast]);

  const sendItemToFriends = useCallback((friendIds: string[], item: ClothingItem, note?: string) => {
    friendIds.forEach((friendId) => {
      const convId = createConversation([friendId]);
      sendMessage(convId, note || `Sent you ${item.name}!`, item);
    });
    const friendNames = friendIds.map((id) => friends.find((f) => f.id === id)?.name).filter(Boolean).join(', ');
    showToast(`Sent ${item.name} to ${friendNames}!`, 'Check chat inbox in your profile', 'green');
    setSendItemModalItem(null);
  }, [createConversation, sendMessage, friends, showToast]);

  const sendOutfitToFriend = useCallback((friendId: string, outfit: SharedOutfit, note?: string) => {
    const convId = createConversation([friendId]);
    sendMessage(convId, note || `Curated an outfit for you: ${outfit.name}!`, undefined, outfit);
    const friend = friends.find((f) => f.id === friendId);
    showToast(`Outfit sent to ${friend?.name || 'friend'}!`, 'Opening chat...', 'green');
    setActiveConversationId(convId);
    setIsInboxOpen(true);
  }, [createConversation, sendMessage, friends, showToast]);

  const openChatWithFriend = useCallback((friendId: string) => {
    const convId = createConversation([friendId]);
    setActiveConversationId(convId);
    setIsInboxOpen(true);
  }, [createConversation]);

  const totalUnreadMessages = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tabResetTimestamp,
        resetActiveTab,
        catalog: catalogWithScores,
        filteredCatalog,
        currentCardIndex,
        brandFilter,
        setBrandFilter,
        categoryFilter,
        setCategoryFilter,
        toggleCategoryFilter,
        aestheticFilter,
        setAestheticFilter,
        genderFilter,
        setGenderFilter,
        itemTypeFilter,
        setItemTypeFilter,
        sizeFilter,
        setSizeFilter,
        priceRangeFilter,
        setPriceRangeFilter,
        swipesToday,
        swipeLimitBypassed,
        bypassSwipeLimit,
        swipe,
        undoLastSwipe,
        canUndo: swipeHistory.length > 0,
        resetDeck,
        likedItemIds,
        passedItemIds,
        wishlistItems,
        collections,
        activeCollectionId,
        setActiveCollectionId,
        createCollection,
        updateCollection,
        deleteCollection,
        toggleWishlist,
        isItemInWishlist,
        removeItemFromWishlist,
        assignItemToCollection,
        addAllWishlistToCart,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        purchasedItems,
        addPurchasedItems,
        algorithmProfile,
        updateAlgorithmWeight,
        applyQuizResults,
        addDissectedStyleToAlgorithm,
        resetAlgorithm,
        userProfile,
        updateUserProfile,
        currentDissection,
        setCurrentDissection,
        isAnalyzing,
        uploadedImageUrl,
        setUploadedImageUrl,
        dissectImage,
        selectPresetOutfit,
        breakdownHistoryItems,
        addBreakdownHistoryItems,
        friends,
        conversations,
        messages,
        isInboxOpen,
        setIsInboxOpen,
        activeConversationId,
        setActiveConversationId,
        chatOnlineStatus,
        setChatOnlineStatus,
        sendMessage,
        createConversation,
        updateConversationAvatar,
        sendItemToFriends,
        sendOutfitToFriend,
        openChatWithFriend,
        totalUnreadMessages,
        sendItemModalItem,
        setSendItemModalItem,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
