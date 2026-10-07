import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Users,
  BarChart3,
  Database,
  FolderHeart,
  Settings as SettingsIcon,
  UserCheck,
  HelpCircle,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Sliders,
  Share2,
  Camera,
  Plus,
  ShoppingBag,
  Trash2,
  Clock,
  Layers,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
  Star,
  Check,
  Mail,
  CreditCard,
  Phone,
  MapPin,
  Shield,
  Lock,
  Wrench,
  X,
  Edit3,
  Calendar,
  Image as ImageIcon,
  Heart,
  Search,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AestheticQuizModal } from '../quiz/AestheticQuizModal';
import { INITIAL_CATALOG } from '../../data/mockCatalog';
import { ClothingItem, Friend, SharedOutfit } from '../../types';

type ProfileSubView =
  | 'none'
  | 'menu'
  | 'friends'
  | 'stats'
  | 'data'
  | 'collections'
  | 'settings'
  | 'account'
  | 'privacy'
  | 'help'
  | 'build-friend-fit';

export const ProfileTab: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    algorithmProfile,
    updateAlgorithmWeight,
    applyQuizResults,
    resetAlgorithm,
    collections,
    createCollection,
    updateCollection,
    deleteCollection,
    wishlistItems,
    purchasedItems,
    cartItems,
    likedItemIds,
    addToCart,
    toggleWishlist,
    isItemInWishlist,
    showToast,
    activeTab,
    setActiveTab,
    tabResetTimestamp,
    setGenderFilter,
    friends,
    sendOutfitToFriend,
    openChatWithFriend,
    setIsInboxOpen,
    totalUnreadMessages,
    setSendItemModalItem,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';

  const [activeSubView, setActiveSubView] = useState<ProfileSubView>('none');
  const [profileTab, setProfileTab] = useState<'outfits' | 'moodboards' | 'collection'>('outfits');
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [activeCollectionDetailId, setActiveCollectionDetailId] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);

  // Search queries for adding items to outfit or moodboard
  const [outfitSearchQuery, setOutfitSearchQuery] = useState('');
  const [moodboardSearchQuery, setMoodboardSearchQuery] = useState('');

  // Pool of all clothing user has liked, saved to wishlist, in cart, or purchased
  const userItemsPool = useMemo(() => {
    const map = new Map<string, ClothingItem>();
    wishlistItems.forEach((i) => map.set(i.id, i));
    cartItems.forEach((ci) => map.set(ci.item.id, ci.item));
    purchasedItems.forEach((i) => map.set(i.id, i));
    likedItemIds.forEach((id) => {
      const found = INITIAL_CATALOG.find((it) => it.id === id);
      if (found) map.set(found.id, found);
    });
    if (map.size < 4) {
      INITIAL_CATALOG.slice(0, 15).forEach((i) => map.set(i.id, i));
    }
    return Array.from(map.values());
  }, [wishlistItems, cartItems, purchasedItems, likedItemIds]);

  // Selected Detail Page for exact moodboard or exact outfit
  const [selectedOutfitDetail, setSelectedOutfitDetail] = useState<{
    id: string;
    title: string;
    aesthetic: string;
    items: ClothingItem[];
    description: string;
  } | null>(null);
  const [selectedMoodboardDetail, setSelectedMoodboardDetail] = useState<any | null>(null);

  // Edit outfit states (when viewing own profile)
  const [isEditingOutfit, setIsEditingOutfit] = useState(false);
  const [editOutfitTitle, setEditOutfitTitle] = useState('');
  const [editOutfitAesthetic, setEditOutfitAesthetic] = useState('');
  const [editOutfitDesc, setEditOutfitDesc] = useState('');

  // Create outfit states
  const [isCreatingOutfit, setIsCreatingOutfit] = useState(false);
  const [newOutfitTitle, setNewOutfitTitle] = useState('');
  const [newOutfitAesthetic, setNewOutfitAesthetic] = useState('');
  const [newOutfitDesc, setNewOutfitDesc] = useState('');

  // Edit moodboard states (when viewing own profile)
  const [isEditingMoodboard, setIsEditingMoodboard] = useState(false);
  const [editMoodboardTitle, setEditMoodboardTitle] = useState('');
  const [editMoodboardDesc, setEditMoodboardDesc] = useState('');

  // Generate curated outfits built out of items from user's saved list (wishlist) and order history (purchasedItems)
  const defaultOutfits = React.useMemo(() => {
    const pool = [...wishlistItems, ...purchasedItems];
    const source = pool.length >= 2 ? pool : [...pool, ...INITIAL_CATALOG.slice(0, 6)];

    return [
      {
        id: 'fit-1',
        title: 'Minimalist Utilitarian Look',
        aesthetic: 'Gorpcore / Technical',
        items: source.slice(0, 3),
        description: 'Weatherproof technical shell paired with responsive footwear and cargo trousers.',
      },
      {
        id: 'fit-2',
        title: 'Clean Monochrome Capsule',
        aesthetic: 'Minimalist Sartorial',
        items: source.slice(2, 5).length >= 2 ? source.slice(2, 5) : source.slice(0, 2),
        description: 'Subtle textural contrasts and relaxed architectural proportions.',
      },
      {
        id: 'fit-3',
        title: 'Everyday Archive Uniform',
        aesthetic: 'Streetwear / Workwear',
        items: source.slice(4, 7).length >= 2 ? source.slice(4, 7) : source.slice(1, 4),
        description: 'Heavyweight loopback jersey, vintage wash denim, and heritage trail sneakers.',
      },
    ];
  }, [wishlistItems, purchasedItems]);

  const [outfitsList, setOutfitsList] = useState<Array<{
    id: string;
    title: string;
    aesthetic: string;
    items: ClothingItem[];
    description: string;
  }>>([]);

  useEffect(() => {
    if (outfitsList.length === 0 && defaultOutfits.length > 0) {
      setOutfitsList(defaultOutfits);
    }
  }, [defaultOutfits]);

  // Swipeable profile tabs gesture state
  const PROFILE_TABS = ['outfits', 'moodboards', 'collection'] as const;
  const activeTabIndex = PROFILE_TABS.indexOf(profileTab);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipingTabs, setIsSwipingTabs] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsSwipingTabs(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const diffX = e.touches[0].clientX - touchStartRef.current.x;
    const diffY = e.touches[0].clientY - touchStartRef.current.y;

    // Do not intercept vertical scrolling
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffX) < 12) {
      return;
    }

    let clamped = diffX;
    if ((activeTabIndex === 0 && diffX > 0) || (activeTabIndex === 2 && diffX < 0)) {
      clamped = diffX * 0.25;
    }
    setSwipeOffset(clamped);
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current) return;
    if (swipeOffset < -50 && activeTabIndex < 2) {
      setProfileTab(PROFILE_TABS[activeTabIndex + 1]);
    } else if (swipeOffset > 50 && activeTabIndex > 0) {
      setProfileTab(PROFILE_TABS[activeTabIndex - 1]);
    }
    setSwipeOffset(0);
    setIsSwipingTabs(false);
    touchStartRef.current = null;
  };

  const containerWidth = tabContentRef.current?.offsetWidth || 380;
  const progressRatio = -swipeOffset / containerWidth;
  const visualProgress = Math.max(0, Math.min(2, activeTabIndex + progressRatio));

  // Edit Profile Popup state (relocated name, handle, bio)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editHandle, setEditHandle] = useState(userProfile.handle);
  const [editBio, setEditBio] = useState(userProfile.bio);

  // Cover background upload ref
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Inspect item modal state
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);

  // Saved scroll position for returning from outfit / moodboard detail pages
  const savedProfileScrollPosRef = useRef<number>(0);

  // New Creation Dropdown State (producing dropdown menu with outfit and moodboard)
  const [isNewCreationMenuOpen, setIsNewCreationMenuOpen] = useState(false);

  // Reset tab to main page whenever activeTab or tabResetTimestamp changes
  useEffect(() => {
    setActiveSubView('none');
    setActiveCollectionDetailId(null);
    setIsCreatingCollection(false);
    setIsCreatingOutfit(false);
    setIsQuizOpen(false);
    setIsFeedbackOpen(false);
    setIsEditProfileOpen(false);
    setShowResetConfirm(false);
    setSelectedFriend(null);
    setInspectItem(null);
    setSelectedOutfitDetail(null);
    setSelectedMoodboardDetail(null);
    setIsEditingOutfit(false);
    setIsEditingMoodboard(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab, tabResetTimestamp]);

  // Reset taste confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Feedback modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState('love');
  const [feedbackCategory, setFeedbackCategory] = useState('Recommendations');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Account setup, email change and payment options state
  const [currentEmail, setCurrentEmail] = useState(userProfile.email || 'sanyiiaga416@gmail.com');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const [cardHolder, setCardHolder] = useState(userProfile.paymentMethod?.cardHolder || 'Sanyi Aga');
  const [cardNumber, setCardNumber] = useState(userProfile.paymentMethod?.cardNumber || '•••• •••• •••• 4128');
  const [cardExpiry, setCardExpiry] = useState(userProfile.paymentMethod?.expiry || '08/28');
  const [cardCvc, setCardCvc] = useState(userProfile.paymentMethod?.cvc || '•••');
  const [billingZip, setBillingZip] = useState(userProfile.paymentMethod?.billingZip || '90210');
  const [applePayActive, setApplePayActive] = useState(userProfile.paymentMethod?.applePay ?? true);

  const [phoneInput, setPhoneInput] = useState(userProfile.phone || '+1 (555) 234-5678');
  const [streetAddress, setStreetAddress] = useState(userProfile.shippingAddress?.street || '420 Fashion Ave, Suite 12B');
  const [cityAddress, setCityAddress] = useState(userProfile.shippingAddress?.city || 'Los Angeles');
  const [stateAddress, setStateAddress] = useState(userProfile.shippingAddress?.state || 'CA');
  const [zipAddress, setZipAddress] = useState(userProfile.shippingAddress?.zip || '90210');
  const [countryAddress, setCountryAddress] = useState(userProfile.shippingAddress?.country || 'United States');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', '', 'red');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateUserProfile({ avatarUrl: base64 });
      showToast('Profile photo updated', '', 'green');
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', '', 'red');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateUserProfile({ coverImageUrl: base64 });
      showToast('Header banner updated', '', 'green');
    };
    reader.readAsDataURL(file);
  };

  // Build Friend Fit state
  const [friendForFit, setFriendForFit] = useState<Friend | null>(null);
  const [customFitTitle, setCustomFitTitle] = useState('');
  const [customFitAesthetic, setCustomFitAesthetic] = useState('Minimalist Streetwear');
  const [customFitItems, setCustomFitItems] = useState<ClothingItem[]>([]);
  const [fitItemCategoryFilter, setFitItemCategoryFilter] = useState<string[]>([]);
  const [fitItemSearch, setFitItemSearch] = useState('');
  const [fitNote, setFitNote] = useState('');

  const handleOpenBuildFitForFriend = (friend: Friend) => {
    setFriendForFit(friend);
    setCustomFitTitle(`Curated Look for ${friend.name.split(' ')[0]}`);
    setCustomFitAesthetic(friend.styleArchetype.split('&')[0]?.trim() || 'Gorpcore');
    setCustomFitItems([]);
    setFitItemCategoryFilter([]);
    setFitItemSearch('');
    setFitNote('');
    setActiveSubView('build-friend-fit');
    setSelectedFriend(null);
  };

  // Settings menu sections in requested order: settings, account, data, stats, privacy, help
  const settingsSections: Array<{
    id: ProfileSubView;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'settings',
      title: 'Settings',
      description: 'Sizing, recommendations & display',
      icon: SettingsIcon,
    },
    {
      id: 'account',
      title: 'Account',
      description: 'Profile info, email & addresses',
      icon: UserCheck,
    },
    {
      id: 'data',
      title: 'Data',
      description: 'Style algorithm weights & quiz',
      icon: Database,
    },
    {
      id: 'stats',
      title: 'Stats',
      description: 'Swipe activity & wardrobe stats',
      icon: BarChart3,
    },
    {
      id: 'privacy',
      title: 'Privacy',
      description: 'Visibility, content sharing & discovery',
      icon: Shield,
    },
    {
      id: 'help',
      title: 'Help',
      description: 'Guides, FAQs & feedback',
      icon: HelpCircle,
    },
  ];

  // Comprehensive shoe sizes with US & EU
  const commonShoeSizes = [
    '6 US (38.5 EU)',
    '6.5 US (39 EU)',
    '7 US (40 EU)',
    '7.5 US (40.5 EU)',
    '8 US (41 EU)',
    '8.5 US (42 EU)',
    '9 US (42.5 EU)',
    '9.5 US (43 EU)',
    '10 US (44 EU)',
    '10.5 US (44.5 EU)',
    '11 US (45 EU)',
    '11.5 US (45.5 EU)',
    '12 US (46 EU)',
    '12.5 US (46.5 EU)',
    '13 US (47.5 EU)',
    '14 US (48.5 EU)',
  ];

  // Top sizes including regular and Tall sizing
  const topSizes = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'S Tall',
    'M Tall',
    'L Tall',
    'XL Tall',
    'XXL Tall',
  ];

  const handleCreateCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;
    const newCol = {
      id: `col-${Date.now()}`,
      title: newCollectionTitle.trim(),
      description: newCollectionDesc.trim(),
      itemIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    createCollection(newCol.title, newCol.description, []);
    setNewCollectionTitle('');
    setNewCollectionDesc('');
    setIsCreatingCollection(false);
    setSelectedMoodboardDetail(newCol);
    setIsEditingMoodboard(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pb-28 px-4 pt-4 max-w-md mx-auto">
      {/* Hidden file input for tapping on profile photo to upload/change */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Hidden file input for header banner background upload */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverChange}
        className="hidden"
      />

      {selectedOutfitDetail ? (
        <div className="page-slide-forward space-y-2.5">
          {/* Header Bar with Back Button and Small Simple Edit Button */}
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedOutfitDetail(null);
                  setIsEditingOutfit(false);
                }}
                className={`p-2 rounded-full ${
                  isLight
                    ? 'bg-slate-200 border-slate-300 text-slate-700 hover:text-black'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                } border transition-colors shadow-sm`}
                title="Back to Outfits"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className={`${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'} px-3 py-1.5 rounded-xl border shadow-sm`}>
                <span className="text-[10px] font-mono uppercase text-pink-600 font-bold block">
                  {selectedOutfitDetail.aesthetic}
                </span>
                <h2 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedOutfitDetail.title}
                </h2>
              </div>
            </div>

            {/* Small simple edit button near the top */}
            <button
              onClick={() => {
                if (!isEditingOutfit) {
                  setEditOutfitTitle(selectedOutfitDetail.title);
                  setEditOutfitAesthetic(selectedOutfitDetail.aesthetic);
                  setEditOutfitDesc(selectedOutfitDetail.description);
                }
                setIsEditingOutfit(!isEditingOutfit);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isEditingOutfit
                  ? 'bg-pink-600 text-white border-pink-600'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title="Edit Outfit"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingOutfit ? 'Done' : 'Edit'}</span>
            </button>
          </div>

          {/* Compact Edit Form (Only shown when editing, with extra text removed to save space) */}
          {isEditingOutfit && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated = {
                  ...selectedOutfitDetail,
                  title: editOutfitTitle.trim() || selectedOutfitDetail.title,
                  aesthetic: editOutfitAesthetic.trim() || selectedOutfitDetail.aesthetic,
                  description: editOutfitDesc.trim() || selectedOutfitDetail.description,
                };
                setSelectedOutfitDetail(updated);
                setOutfitsList((prev) =>
                  prev.map((o) => (o.id === updated.id ? updated : o))
                );
                setIsEditingOutfit(false);
                showToast('Outfit updated', '', 'green');
              }}
              className={`p-2.5 rounded-xl ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-700'
              } border space-y-2`}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editOutfitTitle}
                  onChange={(e) => setEditOutfitTitle(e.target.value)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  } border focus:outline-none focus:border-pink-600`}
                  placeholder="Outfit title"
                />
                <input
                  type="text"
                  value={editOutfitAesthetic}
                  onChange={(e) => setEditOutfitAesthetic(e.target.value)}
                  className={`w-32 px-3 py-1.5 rounded-lg text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  } border focus:outline-none focus:border-pink-600`}
                  placeholder="Aesthetic"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-lg ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-bold transition-all shadow-sm`}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingOutfit(false)}
                  className={`px-3 py-1.5 rounded-lg border ${
                    isLight ? 'border-slate-300 text-slate-600' : 'border-slate-700 text-slate-400 hover:text-white'
                  } text-xs`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Search bar positioned higher up directly below header */}
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={outfitSearchQuery}
                onChange={(e) => setOutfitSearchQuery(e.target.value)}
                placeholder="Search liked, saved & cart pieces to add..."
                className={`w-full pl-8 pr-8 py-2 rounded-xl text-xs ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                } border focus:outline-none focus:border-pink-400`}
              />
              {outfitSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOutfitSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Matching search pieces drop-down list - No extra text when empty */}
            {(() => {
              const query = outfitSearchQuery.trim().toLowerCase();
              if (!query) {
                return null;
              }

              const filteredPool = userItemsPool.filter((item: ClothingItem) => {
                return (
                  item.name.toLowerCase().includes(query) ||
                  item.brand.toLowerCase().includes(query) ||
                  item.category.toLowerCase().includes(query) ||
                  (item.aesthetics && item.aesthetics.some((a: string) => a.toLowerCase().includes(query)))
                );
              });

              if (filteredPool.length === 0) {
                return (
                  <div className={`p-2.5 rounded-xl border text-center ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <p className="text-xs font-semibold">No matching pieces found</p>
                  </div>
                );
              }

              return (
                <div className={`rounded-2xl border shadow-xl overflow-hidden divide-y ${
                  isLight ? 'bg-white border-slate-200 divide-slate-100' : 'bg-slate-900 border-slate-800 divide-slate-800/80'
                } max-h-64 overflow-y-auto`}>
                  <div className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-slate-950/70 text-slate-400'}`}>
                    <span>Results ({filteredPool.length})</span>
                  </div>
                  {filteredPool.map((item: ClothingItem) => {
                    const isAdded = selectedOutfitDetail.items.some((it) => it.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setInspectItem(item)}
                        className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/70'
                        }`}
                        title={`Tap to view ${item.name} details`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-14 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 relative border border-slate-800">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {item.brand} • <span className={`font-mono ${isLight ? 'text-pink-600' : 'text-pink-300'} font-bold`}>${item.price}</span>
                            </p>
                            <span className="text-[9px] text-slate-400 inline-block">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Add / Added Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAdded) {
                              const next = selectedOutfitDetail.items.filter((it) => it.id !== item.id);
                              const updated = { ...selectedOutfitDetail, items: next };
                              setSelectedOutfitDetail(updated);
                              setOutfitsList((prev) =>
                                prev.map((o) => (o.id === updated.id ? updated : o))
                              );
                              showToast(`Removed from ${selectedOutfitDetail.title}`, item.name, 'silver');
                            } else {
                              const next = [...selectedOutfitDetail.items, item];
                              const updated = { ...selectedOutfitDetail, items: next };
                              setSelectedOutfitDetail(updated);
                              setOutfitsList((prev) =>
                                prev.map((o) => (o.id === updated.id ? updated : o))
                              );
                              showToast(`Added to ${selectedOutfitDetail.title}`, item.name, 'green');
                            }
                          }}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                            isAdded
                              ? isLight
                                ? 'bg-pink-600 text-white hover:bg-pink-700'
                                : 'bg-pink-300 text-black hover:bg-pink-200'
                              : isLight
                              ? 'bg-slate-900 hover:bg-slate-800 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* All contents of this outfit */}
          {selectedOutfitDetail.items.length === 0 ? (
            <div className={`p-4 rounded-xl border border-dashed ${isLight ? 'border-slate-300 bg-slate-100/60 text-slate-600' : 'border-slate-800 bg-slate-900/40 text-slate-400'} text-center`}>
              <p className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>No pieces in this outfit yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedOutfitDetail.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setInspectItem(item)}
                  className={`p-3 rounded-2xl ${
                    isLight ? 'bg-white hover:bg-slate-50 border-2 border-slate-200' : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800'
                  } flex items-center justify-between cursor-pointer group transition-all shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-pink-600 font-bold block">
                        {item.brand}
                      </span>
                      <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} line-clamp-1`}>
                        {item.name}
                      </h4>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} capitalize`}>
                        {item.category} • {item.fit}
                      </p>
                      <span className="text-xs font-mono font-bold text-pink-600">
                        ${item.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {isEditingOutfit && (
                      <button
                        onClick={() => {
                          const updatedItems = selectedOutfitDetail.items.filter((it) => it.id !== item.id);
                          const updated = { ...selectedOutfitDetail, items: updatedItems };
                          setSelectedOutfitDetail(updated);
                          setOutfitsList((prev) =>
                            prev.map((o) => (o.id === updated.id ? updated : o))
                          );
                        }}
                        className="p-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white transition-colors shadow-sm"
                        title="Remove piece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        addToCart(item);
                        showToast(`Added ${item.name} to cart`, '', 'green');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center gap-1 transition-colors shadow-sm active:scale-95"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Outfit to Cart Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                selectedOutfitDetail.items.forEach((it) => addToCart(it));
                showToast(`Added ${selectedOutfitDetail.title} to cart!`, `${selectedOutfitDetail.items.length} pieces added`, 'green');
              }}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Outfit to Cart (${selectedOutfitDetail.items.reduce((acc, it) => acc + it.price, 0)})</span>
            </button>
          </div>
        </div>
      ) : selectedMoodboardDetail ? (
        <div className="page-slide-forward space-y-4">
          {/* Header Bar with Back Button and Small Simple Edit Button */}
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedMoodboardDetail(null);
                  setIsEditingMoodboard(false);
                }}
                className={`p-2 rounded-full ${
                  isLight
                    ? 'bg-slate-200 border-slate-300 text-slate-700 hover:text-black'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                } border transition-colors shadow-sm`}
                title="Back to Moodboards"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className={`${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'} px-3 py-1.5 rounded-xl border shadow-sm`}>
                <h2 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedMoodboardDetail.title}
                </h2>
                <span className="text-[11px] text-pink-600 font-mono font-medium">
                  {selectedMoodboardDetail.items?.length || (selectedMoodboardDetail.itemIds ? selectedMoodboardDetail.itemIds.length : 0)} pieces in board
                </span>
              </div>
            </div>

            {/* Small simple edit button near the top (Only on own profile) */}
            {!selectedMoodboardDetail.isFriend && (
              <button
                onClick={() => {
                  if (!isEditingMoodboard) {
                    setEditMoodboardTitle(selectedMoodboardDetail.title);
                    setEditMoodboardDesc(selectedMoodboardDetail.description || '');
                  }
                  setIsEditingMoodboard(!isEditingMoodboard);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  isEditingMoodboard
                    ? 'bg-pink-600 text-white border-pink-600'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
                title="Edit Moodboard"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingMoodboard ? 'Done' : 'Edit'}</span>
              </button>
            )}
          </div>

          {/* Description or Edit Form */}
          {isEditingMoodboard ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCollection(selectedMoodboardDetail.id, {
                  title: editMoodboardTitle.trim() || selectedMoodboardDetail.title,
                  description: editMoodboardDesc.trim(),
                });
                setSelectedMoodboardDetail({
                  ...selectedMoodboardDetail,
                  title: editMoodboardTitle.trim() || selectedMoodboardDetail.title,
                  description: editMoodboardDesc.trim(),
                });
                setIsEditingMoodboard(false);
              }}
              className={`p-4 rounded-2xl ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-700'
              } border space-y-3`}
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Moodboard Title
                </label>
                <input
                  type="text"
                  value={editMoodboardTitle}
                  onChange={(e) => setEditMoodboardTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  } border focus:outline-none focus:border-pink-600`}
                  placeholder="Moodboard title"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Aesthetic Notes
                </label>
                <input
                  type="text"
                  value={editMoodboardDesc}
                  onChange={(e) => setEditMoodboardDesc(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  } border focus:outline-none focus:border-pink-600`}
                  placeholder="Aesthetic description..."
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-500 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingMoodboard(false)}
                  className={`px-3 py-2 rounded-xl border ${
                    isLight ? 'border-slate-300 text-slate-600' : 'border-slate-700 text-slate-400 hover:text-white'
                  } text-xs`}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            selectedMoodboardDetail.description && (
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} italic`}>
                "{selectedMoodboardDetail.description}"
              </p>
            )
          )}

          {/* Search bar to search and add pieces to moodboard */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={moodboardSearchQuery}
                onChange={(e) => setMoodboardSearchQuery(e.target.value)}
                placeholder="Search liked, saved & cart pieces to add..."
                className={`w-full pl-8 pr-8 py-2 rounded-xl text-xs ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                } border focus:outline-none focus:border-pink-600`}
              />
              {moodboardSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMoodboardSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Matching search pieces carousel */}
            {(() => {
              const query = moodboardSearchQuery.trim().toLowerCase();
              const filteredPool = userItemsPool.filter((item: ClothingItem) => {
                if (!query) return true;
                return (
                  item.name.toLowerCase().includes(query) ||
                  item.brand.toLowerCase().includes(query) ||
                  item.category.toLowerCase().includes(query) ||
                  (item.aesthetics && item.aesthetics.some((a: string) => a.toLowerCase().includes(query)))
                );
              });

              if (filteredPool.length === 0) {
                return (
                  <p className="text-[11px] text-slate-500 italic px-1">
                    No matching saved or liked pieces found.
                  </p>
                );
              }

              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {query ? 'Search Results' : 'Add from Your Saved & Liked Wardrobe'}
                    </span>
                    <span className="text-[10px] text-pink-600 font-mono">
                      {filteredPool.length} available
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {filteredPool.slice(0, 15).map((item: ClothingItem) => {
                      const isAdded = (selectedMoodboardDetail.itemIds || []).includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`w-28 flex-shrink-0 p-2 rounded-xl border ${
                            isAdded
                              ? 'border-pink-600/60 bg-pink-950/30'
                              : isLight
                              ? 'border-slate-200 bg-slate-100'
                              : 'border-slate-800 bg-slate-900/90'
                          } flex flex-col justify-between`}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-slate-950 mb-1.5 relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-pink-600">
                              ${item.price}
                            </span>
                          </div>
                          <p className={`text-[10px] font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate leading-tight`}>
                            {item.name}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">
                            {item.brand}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                const nextIds = (selectedMoodboardDetail.itemIds || []).filter((id: string) => id !== item.id);
                                const nextItems = (selectedMoodboardDetail.items || []).filter((it: ClothingItem) => it.id !== item.id);
                                updateCollection(selectedMoodboardDetail.id, { itemIds: nextIds });
                                setSelectedMoodboardDetail({
                                  ...selectedMoodboardDetail,
                                  itemIds: nextIds,
                                  items: nextItems,
                                });
                              } else {
                                const nextIds = [...(selectedMoodboardDetail.itemIds || []), item.id];
                                const nextItems = [...(selectedMoodboardDetail.items || []), item];
                                updateCollection(selectedMoodboardDetail.id, { itemIds: nextIds });
                                setSelectedMoodboardDetail({
                                  ...selectedMoodboardDetail,
                                  itemIds: nextIds,
                                  items: nextItems,
                                });
                              }
                            }}
                            className={`mt-1.5 py-1 px-2 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all ${
                              isAdded
                                ? 'bg-pink-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ONLY the contents of that exact board */}
          {(() => {
            const pool: ClothingItem[] = [...wishlistItems, ...purchasedItems, ...INITIAL_CATALOG];
            const exactItems: ClothingItem[] = (selectedMoodboardDetail.items && selectedMoodboardDetail.items.length > 0)
              ? (selectedMoodboardDetail.items as ClothingItem[])
              : ((selectedMoodboardDetail.itemIds || []) as string[])
                  .map((id: string) => pool.find((item: ClothingItem) => item.id === id))
                  .filter((it: ClothingItem | undefined): it is ClothingItem => Boolean(it));
            if (exactItems.length === 0) {
              return (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center space-y-1 mt-2">
                  <FolderHeart className="w-7 h-7 text-slate-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-white">Blank Moodboard Project</p>
                  <p className="text-[11px] text-slate-400">
                    Search and tap "+ Add" on pieces from your liked, saved, or cart items above to curate this board.
                  </p>
                </div>
              );
            }
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {exactItems.map((item: ClothingItem) => (
                    <div
                      key={item.id}
                      onClick={() => setInspectItem(item)}
                      className={`p-2.5 rounded-2xl ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800'
                      } border transition-all cursor-pointer group flex flex-col justify-between`}
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 mb-2 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono font-bold text-pink-600 border border-pink-600/30">
                          ${item.price}
                        </span>
                        {isEditingMoodboard && !selectedMoodboardDetail.isFriend && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextIds = (selectedMoodboardDetail.itemIds || []).filter((id: string) => id !== item.id);
                              const nextItems = (selectedMoodboardDetail.items || []).filter((it: ClothingItem) => it.id !== item.id);
                              updateCollection(selectedMoodboardDetail.id, { itemIds: nextIds });
                              setSelectedMoodboardDetail({
                                ...selectedMoodboardDetail,
                                itemIds: nextIds,
                                items: nextItems,
                              });
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-red-600/90 hover:bg-red-500 text-white shadow-md transition-colors"
                            title="Remove from moodboard"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className={`text-[11px] font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                          {item.name}
                        </p>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>
                          {item.brand}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            addToCart(item);
                            showToast(`Added ${item.name} to cart`, '', 'green');
                          }}
                          className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold flex items-center justify-center gap-1 transition-colors shadow-sm active:scale-95"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add All Pieces from Moodboard to Cart (Green) */}
                <button
                  onClick={() => {
                    exactItems.forEach((it: ClothingItem) => addToCart(it));
                    showToast(`Added all ${exactItems.length} moodboard pieces to cart!`, '', 'green');
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add All Moodboard Pieces to Cart (${exactItems.reduce((acc: number, it: ClothingItem) => acc + it.price, 0)})</span>
                </button>
              </div>
            );
          })()}
        </div>
      ) : activeSubView === 'none' ? (
        <div className="page-slide-forward -mx-4 -mt-4">
          {/* 1. Header Background Banner Image (Shortened by 25% to h-32, layered z-0 behind avatar) */}
          <div className="relative z-0 h-32 w-full overflow-hidden bg-slate-900 border-b border-slate-800">
            <img
              src={
                userProfile.coverImageUrl ||
                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80'
              }
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
            {/* Elegant vignette gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50" />

            {/* Top Right Gear Icon for Settings & Menu */}
            <button
              onClick={() => setActiveSubView('menu')}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-pink-300 hover:border-pink-300 transition-all shadow-lg z-10"
              title="Settings & Menu"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Chat Button under Settings Gear */}
            <button
              onClick={() => setIsInboxOpen(true)}
              className="absolute top-14 right-3 p-2 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-pink-300 hover:border-pink-300 transition-all shadow-lg z-10 group"
              title="Direct & Group Messages"
            >
              <MessageSquare className="w-4 h-4 text-white group-hover:text-pink-300 transition-colors" />
              {totalUnreadMessages > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'} text-white font-black text-[9px] flex items-center justify-center ring-2 ring-black animate-pulse`}>
                  {totalUnreadMessages}
                </span>
              )}
            </button>
          </div>

          <div className="px-4">
            {/* 2. Avatar Overlapping Cover (Layered in front with z-10) & Edit Profile Button */}
            <div className="flex items-end justify-between -mt-10 mb-3 relative z-10">
              {/* Interactive Circular Avatar */}
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="relative cursor-pointer group"
                title="Tap to change profile photo"
              >
                <div
                  className={`w-20 h-20 rounded-full ${
                    isLight ? 'bg-slate-200 border-white ring-slate-300' : 'bg-slate-800 border-black ring-slate-800'
                  } border-4 ring-2 group-hover:ring-pink-300 flex items-center justify-center overflow-hidden shadow-2xl transition-all`}
                >
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white font-bold text-lg">
                        {userProfile.name.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>

                <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'} ring-2 ring-black flex items-center justify-center shadow-md`}>
                  <Camera className="w-3.5 h-3.5 text-white" />
                </span>
              </div>

              {/* Edit Profile Button (Opens Simple Popup Modal) */}
              <button
                onClick={() => {
                  setEditName(userProfile.name);
                  setEditHandle(userProfile.handle);
                  setEditBio(userProfile.bio);
                  setIsEditProfileOpen(true);
                }}
                className={`px-3.5 py-1.5 rounded-xl ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white'
                } border hover:border-pink-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm`}
              >
                <Edit3 className="w-3.5 h-3.5" style={{ stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* 3. User Name & Handle */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {userProfile.name}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                  } border`}
                >
                  {userProfile.membership}
                </span>
              </div>
              <p className={`text-xs font-mono font-bold ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>{userProfile.handle}</p>
            </div>

            {/* Bio text */}
            {/* Bio text - limited to 30 characters so it is only one line of text */}
            {userProfile.bio && (
              <p className={`text-xs ${isLight ? 'text-slate-800' : 'text-slate-300'} mt-1.5 truncate max-w-full font-medium leading-none`}>
                {userProfile.bio.slice(0, 30)}
              </p>
            )}

            {/* 4. Subheader Basic Counts: Friends (button), Outfits, Joined Date */}
            <div className="flex items-center gap-2 mt-3 pb-3 border-b border-slate-800/80">
              {/* Friends button */}
              <button
                onClick={() => setActiveSubView('friends')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
                } border transition-all text-xs group`}
                title="View Friends"
              >
                <Users className="w-3.5 h-3.5" style={{ stroke: `url(#${isLight ? 'cosmicCascadeGradLight' : 'cosmicCascadeGrad'})` }} />
                <span className="font-extrabold font-mono">{friends.length}</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Friends</span>
              </button>

              {/* Outfits Count */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                  isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                } border text-xs`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-extrabold font-mono">{outfitsList.length}</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Outfits</span>
              </div>

              {/* Month/Year Joined App */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                  isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                } border text-xs`}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-medium">
                  {(userProfile.joinedDate || 'May 2024').replace(/^joined\s*/i, '')}
                </span>
              </div>
            </div>

            {/* 5. Swipable Tabs with Live Glowing Indicator following user swipe */}
            <div className="relative border-b border-slate-800 mt-3 mb-4 select-none">
              <div className="grid grid-cols-3">
                {PROFILE_TABS.map((tab, idx) => {
                  const proximity = Math.max(0, 1 - Math.abs(visualProgress - idx));
                  const Icon = tab === 'outfits' ? Layers : tab === 'moodboards' ? FolderHeart : ShoppingBag;
                  const label = tab === 'outfits' ? 'Outfits' : tab === 'moodboards' ? 'Moodboards' : 'Collection';

                  return (
                    <button
                      key={tab}
                      onClick={() => setProfileTab(tab)}
                      className="pb-2.5 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all relative"
                      style={{
                        color: proximity > 0.4 ? (isLight ? '#db2777' : '#f472b6') : isLight ? '#64748b' : '#94a3b8',
                        textShadow:
                          proximity > 0.3
                            ? `0 0 ${proximity * 14}px rgba(219, 39, 119, ${proximity * 0.95})`
                            : 'none',
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className="w-4 h-4 transition-transform duration-150"
                          style={{
                            filter:
                              proximity > 0.3
                                ? `drop-shadow(0 0 ${proximity * 6}px rgba(219,39,119,0.85))`
                                : 'none',
                            transform: `scale(${1 + proximity * 0.08})`,
                          }}
                        />
                        <span className="capitalize">{label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Glowing active indicator bar tracking user's swipe progression */}
              <div
                className={`absolute bottom-0 h-0.5 ${isLight ? 'cosmic-gradient-bg-light shadow-[0_0_12px_rgba(219,39,119,0.6)]' : 'cosmic-gradient-bg shadow-[0_0_12px_rgba(219,39,119,0.95)]'} rounded-full ${
                  isSwipingTabs ? 'transition-none' : 'transition-transform duration-300 ease-out'
                }`}
                style={{
                  width: '33.333%',
                  transform: `translateX(${visualProgress * 100}%)`,
                }}
              />
            </div>

            {/* TAB CONTENT CAROUSEL WITH SWIPABLE HORIZONTAL GESTURES */}
            <div
              ref={tabContentRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full overflow-hidden"
            >
              <div
                className={`flex w-[300%] ${
                  isSwipingTabs ? 'transition-none' : 'transition-transform duration-300 ease-out'
                }`}
                style={{
                  transform: `translateX(-${(visualProgress / 3) * 100}%)`,
                }}
              >
                {/* 1. OUTFITS TAB */}
                <div className="w-1/3 flex-shrink-0 px-0.5 space-y-3.5">
                  {/* Create Outfit Form */}
                  {isCreatingOutfit && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newOutfitTitle.trim()) return;
                        const newFit = {
                          id: `fit-${Date.now()}`,
                          title: newOutfitTitle.trim(),
                          aesthetic: newOutfitAesthetic.trim() || 'Curated Aesthetic',
                          description: newOutfitDesc.trim() || '',
                          items: [],
                        };
                        setOutfitsList([newFit, ...outfitsList]);
                        setIsCreatingOutfit(false);
                        setNewOutfitTitle('');
                        setNewOutfitAesthetic('');
                        setNewOutfitDesc('');
                        setSelectedOutfitDetail(newFit);
                        setIsEditingOutfit(false);
                      }}
                      className={`p-4 rounded-2xl ${
                        isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-700'
                      } border space-y-3 animate-in fade-in duration-150`}
                    >
                      <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                        New Coordinated Outfit
                      </h4>
                      <input
                        type="text"
                        placeholder="Outfit Name (e.g. Autumn Technical Layers)"
                        value={newOutfitTitle}
                        onChange={(e) => setNewOutfitTitle(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        } border text-xs focus:outline-none focus:border-pink-400`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Aesthetic (e.g. Gorpcore, Minimalist Sartorial)"
                        value={newOutfitAesthetic}
                        onChange={(e) => setNewOutfitAesthetic(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        } border text-xs focus:outline-none focus:border-pink-400`}
                      />
                      <input
                        type="text"
                        placeholder="Styling notes / description"
                        value={newOutfitDesc}
                        onChange={(e) => setNewOutfitDesc(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        } border text-xs focus:outline-none focus:border-pink-400`}
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className={`px-4 py-2 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-bold transition-all shadow-sm`}
                        >
                          Save Outfit
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreatingOutfit(false)}
                          className={`px-3 py-2 rounded-xl border ${
                            isLight ? 'border-slate-300 text-slate-600' : 'border-slate-700 text-slate-400 hover:text-white'
                          } text-xs`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Slim Create Button Card (50% slimmer, produces dropdown menu with Outfit & Moodboard) */}
                  {!isCreatingOutfit && !isCreatingCollection && (
                    <div className="relative">
                      <div
                        onClick={() => setIsNewCreationMenuOpen(!isNewCreationMenuOpen)}
                        className={`w-full py-2 px-3 rounded-xl border-2 border-dashed ${
                          isLight
                            ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
                            : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 text-slate-400'
                        } hover:border-pink-500 transition-all cursor-pointer group flex items-center justify-center gap-2 text-center shadow-sm`}
                        title="Create New Outfit or Moodboard"
                      >
                        <div className={`w-5 h-5 rounded-full ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800/80 border-slate-700/80 text-slate-400'} border flex items-center justify-center group-hover:text-pink-500 group-hover:border-pink-500 transition-colors`}>
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Dropdown Menu with Outfit and Moodboard */}
                      {isNewCreationMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setIsNewCreationMenuOpen(false)}
                          />
                          <div className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-48 ${
                            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xl' : 'bg-slate-900 border-slate-700 text-white shadow-2xl'
                          } border rounded-2xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150`}>
                            <button
                              onClick={() => {
                                setIsNewCreationMenuOpen(false);
                                setIsCreatingOutfit(true);
                              }}
                              className={`w-full px-3.5 py-2 text-xs text-left font-bold flex items-center gap-2.5 transition-colors ${
                                isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                              }`}
                            >
                              <Layers className="w-4 h-4 text-pink-500" />
                              <span>New Outfit</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsNewCreationMenuOpen(false);
                                setProfileTab('moodboards');
                                setIsCreatingCollection(true);
                              }}
                              className={`w-full px-3.5 py-2 text-xs text-left font-bold flex items-center gap-2.5 transition-colors ${
                                isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                              }`}
                            >
                              <FolderHeart className="w-4 h-4 text-pink-500" />
                              <span>New Moodboard</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Outfit cards */}
                  {outfitsList.map((outfit) => {
                    const totalOutfitPrice = outfit.items.reduce((acc, it) => acc + it.price, 0);
                    return (
                      <div
                        key={outfit.id}
                        onClick={() => setSelectedOutfitDetail(outfit)}
                        className={`p-3.5 rounded-2xl ${
                          isLight ? 'bg-slate-900 border-2 border-slate-800 hover:border-slate-700 shadow-md' : 'bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 shadow-sm'
                        } space-y-3 cursor-pointer group transition-all`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-black text-white transition-colors">
                              {outfit.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {outfit.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-white">
                              ${totalOutfitPrice}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Total</span>
                          </div>
                        </div>

                        {/* Coordinated garments row */}
                        <div className="grid grid-cols-3 gap-2">
                          {outfit.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectItem(item);
                              }}
                              className="group/item rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-slate-600 p-1 flex flex-col justify-between cursor-pointer transition-colors"
                              title={`View ${item.name}`}
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 mb-1 relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200"
                                />
                                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/85 font-mono text-[9px] font-bold text-white">
                                  ${item.price}
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-[9px] text-slate-400 truncate">
                                {item.brand}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Add Outfit to Cart Button (Green, labeled 'Add Outfit to Cart') */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            outfit.items.forEach((it) => addToCart(it));
                            showToast(`Added ${outfit.title} to cart!`, `${outfit.items.length} pieces added`, 'green');
                          }}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.99]"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add Outfit to Cart (${totalOutfitPrice})</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 2. MOODBOARDS TAB */}
                <div className="w-1/3 flex-shrink-0 px-0.5 space-y-4">
                  {/* Inline Create Moodboard Form */}
                  {isCreatingCollection && (
                    <form
                      onSubmit={handleCreateCollectionSubmit}
                      className={`p-4 rounded-2xl ${
                        isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-700'
                      } border space-y-3 animate-in fade-in duration-150`}
                    >
                      <h4 className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                        New Moodboard Collection
                      </h4>
                      <input
                        type="text"
                        placeholder="Collection Name (e.g. Winter Gorpcore)"
                        value={newCollectionTitle}
                        onChange={(e) => setNewCollectionTitle(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        } border text-xs focus:outline-none focus:border-pink-600`}
                      />
                      <input
                        type="text"
                        placeholder="Aesthetic notes / description"
                        value={newCollectionDesc}
                        onChange={(e) => setNewCollectionDesc(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        } border text-xs focus:outline-none focus:border-pink-600`}
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className={`px-4 py-2 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-bold transition-all shadow-sm`}
                        >
                          Save Moodboard
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreatingCollection(false)}
                          className={`px-3 py-2 rounded-xl border ${
                            isLight ? 'border-slate-300 text-slate-600 hover:text-black' : 'border-slate-700 text-slate-400 hover:text-white'
                          } text-xs`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Moodboards Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Greyed-out "New Moodboard" card with little + symbol (matching exact size and structure of completed moodboards) */}
                    {!isCreatingCollection && (
                      <div
                        onClick={() => setIsCreatingCollection(true)}
                        className={`p-3 rounded-2xl border-2 border-dashed ${
                          isLight
                            ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
                            : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 text-slate-400'
                        } hover:border-pink-500 transition-all cursor-pointer group flex flex-col justify-between space-y-2.5`}
                      >
                        <div className={`aspect-square rounded-xl ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950/80 border border-slate-800/80'} p-1 flex items-center justify-center`}>
                          <div className={`w-10 h-10 rounded-full ${isLight ? 'bg-white border-slate-300 text-slate-600' : 'bg-slate-800/80 border-slate-700/80 text-slate-400'} border flex items-center justify-center group-hover:text-pink-500 group-hover:border-pink-500 transition-colors shadow-sm`}>
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>

                        <div>
                          <h4 className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'} group-hover:text-pink-500 transition-colors line-clamp-1`}>
                            New Moodboard
                          </h4>
                          <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'} line-clamp-1`}>
                            Create a visual board
                          </p>
                          <span className={`text-[10px] ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} font-mono font-bold mt-1 inline-block`}>
                            + Add Board
                          </span>
                        </div>
                      </div>
                    )}

                    {collections.map((col) => {
                      const colItems = wishlistItems.filter((i) => col.itemIds.includes(i.id));
                      const displayItems = colItems.length > 0 ? colItems : INITIAL_CATALOG.slice(0, 4);
                      return (
                        <div
                          key={col.id}
                          onClick={() => setSelectedMoodboardDetail(col)}
                          className={`p-3 rounded-2xl ${
                            isLight ? 'bg-white border-2 border-slate-200 hover:border-slate-300 shadow-sm' : 'bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 shadow-sm'
                          } transition-all cursor-pointer group flex flex-col justify-between space-y-2.5`}
                        >
                          {/* 4-Image Mosaic Preview */}
                          <div className={`grid grid-cols-2 gap-1 aspect-square rounded-xl overflow-hidden ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950/80'} p-1`}>
                            {displayItems.slice(0, 4).map((item, idx) => (
                              <div
                                key={idx}
                                className={`rounded-lg overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'} relative ${
                                  displayItems.length === 1 ? 'col-span-2 row-span-2' : ''
                                }`}
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ))}
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-white transition-colors line-clamp-1">
                              {col.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {col.description}
                            </p>
                            <span className={`text-[10px] ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} font-mono font-bold mt-1 inline-block`}>
                              {colItems.length} pieces
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. COLLECTION TAB */}
                <div className="w-1/3 flex-shrink-0 px-0.5 space-y-4">
                  {purchasedItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {purchasedItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setInspectItem(item)}
                          className={`p-2.5 rounded-2xl ${
                            isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800'
                          } border transition-all cursor-pointer group flex flex-col justify-between`}
                        >
                          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 mb-2 relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono font-bold text-pink-600 border border-pink-600/30">
                              ${item.price}
                            </span>
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-pink-600/20 backdrop-blur-md text-[9px] font-extrabold text-pink-600 border border-pink-600/40">
                              Purchased
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className={`text-[11px] font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                              {item.name}
                            </p>
                            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>
                              {item.brand}
                            </p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                addToCart(item);
                                showToast(`Added ${item.name} to cart`, 'Ready to reorder', 'green');
                              }}
                              className="w-full py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-extrabold transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Buy Again</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`rounded-2xl border ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-800 bg-slate-900/60'} p-6 text-center`}>
                      <ShoppingBag className={`w-8 h-8 ${isLight ? 'text-slate-400' : 'text-slate-500'} mx-auto mb-2`} />
                      <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} mb-1`}>No purchased items yet</p>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mb-3`}>
                        Pieces you check out with on Aesthro will automatically appear in your collection tab.
                      </p>
                      <button
                        onClick={() => setActiveTab('swipe')}
                        className={`px-4 py-2 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-bold transition-all shadow-sm`}
                      >
                        Browse Swipe Feed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeSubView === 'menu' ? (
        /* Top Right Gear Menu Screen: settings, account, data, stats, help in exact order */
        <div className="page-slide-forward">
          {/* Header */}
          <div
            className={`flex items-center gap-3 mb-5 pb-3 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <button
              onClick={() => setActiveSubView('none')}
              className={`p-2 rounded-full ${
                isLight
                  ? 'bg-slate-200 border-slate-300 text-slate-700 hover:text-black'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              } border`}
              title="Back to Profile"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Settings & Account
              </h2>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Manage preferences, data & app options
              </p>
            </div>
          </div>

          {/* 5 Menu Sections in requested order: settings, account, data, stats, help */}
          <div className="space-y-2">
            {settingsSections.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubView(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-900'
                      : 'bg-slate-900/70 hover:bg-slate-800/90 border-slate-800 text-white'
                  } border transition-all duration-200 group text-left shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isLight
                          ? 'bg-slate-200 text-slate-700 group-hover:text-pink-600'
                          : 'bg-slate-800 text-slate-300 group-hover:text-pink-300'
                      } transition-colors`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span
                        className={`text-sm font-extrabold ${
                          isLight
                            ? 'text-slate-900 group-hover:text-pink-600'
                            : 'text-white group-hover:text-pink-300'
                        } transition-colors block`}
                      >
                        {item.title}
                      </span>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-tight`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Subview Detail Page */
        <div className="page-slide-forward">
          {/* Back Navigation Bar */}
          <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <button
              onClick={() => {
                if (['settings', 'account', 'data', 'stats', 'privacy', 'help'].includes(activeSubView)) {
                  setActiveSubView('menu');
                } else {
                  setActiveSubView('none');
                }
                setActiveCollectionDetailId(null);
              }}
              className={`p-2 rounded-full ${isLight ? 'bg-slate-200 border-slate-300 text-slate-700 hover:text-black' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'} border transition-colors`}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} capitalize`}>
                {activeSubView}
              </h2>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Wardrobe & Style Preferences</p>
            </div>
          </div>

          {/* SUBVIEW: COLLECTIONS (Moved from Wishlist tab as requested) */}
          {activeSubView === 'collections' && (
            <div className="space-y-4">
              {/* Create Collection Modal */}
              {isCreatingCollection && (
                <form
                  onSubmit={handleCreateCollectionSubmit}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3"
                >
                  <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                    New Collection
                  </h4>
                  <input
                    type="text"
                    placeholder="Collection Name (e.g. Winter Layers)"
                    value={newCollectionTitle}
                    onChange={(e) => setNewCollectionTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                  <input
                    type="text"
                    placeholder="Description / Aesthetic note"
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-bold transition-all shadow-sm`}
                    >
                      Save Collection
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCollection(false)}
                      className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Collection Cards List */}
              <div className="space-y-3">
                {/* Greyed-out "New Moodboard" card with little + symbol (hidden while creating) */}
                {!isCreatingCollection && (
                  <div
                    onClick={() => setIsCreatingCollection(true)}
                    className={`p-3.5 rounded-2xl border-2 border-dashed ${
                      isLight
                        ? 'border-slate-300 bg-slate-100/60 hover:bg-slate-200/60 text-slate-500'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 text-slate-400'
                    } hover:border-pink-400 transition-all cursor-pointer group flex flex-col items-center justify-center text-center py-3.5 shadow-sm`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-pink-400 group-hover:border-pink-400 transition-colors mb-1">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold group-hover:text-pink-400 transition-colors">
                      New Moodboard
                    </span>
                  </div>
                )}

                {collections.map((col) => {
                  const colItems = wishlistItems.filter((i) => col.itemIds.includes(i.id));
                  return (
                    <div
                      key={col.id}
                      onClick={() => setSelectedMoodboardDetail(col)}
                      className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 space-y-3 cursor-pointer group transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{col.title}</h4>
                          <p className="text-xs text-slate-400">{col.description}</p>
                          <span className="text-[10px] text-pink-300 font-mono mt-0.5 inline-block">
                            {colItems.length} pieces saved
                          </span>
                        </div>
                      </div>

                      {/* Preview thumbnails */}
                      {colItems.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {colItems.slice(0, 4).map((item) => (
                            <div
                              key={item.id}
                              className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          No items yet. Like items in the Swipe tab to add them.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBVIEW: FRIENDS */}
          {activeSubView === 'friends' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Share Your Style Board</p>
                  <p className="text-[11px] text-slate-400">
                    Invite friends to compare taste compatibility
                  </p>
                </div>
                <button
                  onClick={() => showToast('Share link copied to clipboard!', '', 'green')}
                  className={`px-3 py-1.5 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Style Friends ({friends.length})
              </h3>

              <div className="space-y-2.5">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFriend(f)}
                    className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-pink-400/40 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-pink-300 transition-colors"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-pink-400 ring-2 ring-black" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
                          <span>{f.name}</span>
                          <span className="text-[10px] text-slate-500">→</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">{f.handle}</p>
                        <p className="text-[10px] text-slate-500">
                          Fav: <span className="text-slate-300">{f.favoriteBrand}</span> • {f.sharedItems} saves
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded-md border border-pink-400/40 font-mono block">
                        {f.matchScore}% Match
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBuildFitForFriend(f);
                        }}
                        className="text-[10px] text-pink-600 hover:text-pink-500 font-bold mt-1.5 underline flex items-center justify-end gap-1 ml-auto"
                        title={`Build & send new outfit to ${f.name}`}
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Send Fit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBVIEW: BUILD FRIEND FIT (New Page to build & send outfit to friend via chat) */}
          {activeSubView === 'build-friend-fit' && friendForFit && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubView('friends')}
                    className={`p-1.5 rounded-full ${
                      isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-sm font-black flex items-center gap-1.5">
                      <span>Curate Fit for {friendForFit.name}</span>
                      <span className="text-pink-600 font-mono text-xs">✦</span>
                    </h3>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Build a custom look and dispatch it to their chat
                    </p>
                  </div>
                </div>

                <img
                  src={friendForFit.avatar}
                  alt={friendForFit.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-600/50"
                />
              </div>

              {/* Friend Style Archetype Hint */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                  isLight ? 'bg-pink-50/70 border-pink-200' : 'bg-pink-950/20 border-pink-600/30'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">
                    Target Aesthetic & Vibe
                  </span>
                  <span className="font-extrabold text-xs">{friendForFit.styleArchetype}</span>
                </div>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-pink-600 text-white">
                  {friendForFit.matchScore}% Match
                </span>
              </div>

              {/* Outfit Name & Aesthetic Form */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1`}>
                    Outfit Title
                  </label>
                  <input
                    type="text"
                    value={customFitTitle}
                    onChange={(e) => setCustomFitTitle(e.target.value)}
                    placeholder="Outfit Name (e.g. Winter Mountain Layering)"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-pink-600 ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1`}>
                    Aesthetic Label
                  </label>
                  <input
                    type="text"
                    value={customFitAesthetic}
                    onChange={(e) => setCustomFitAesthetic(e.target.value)}
                    placeholder="Aesthetic Style"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-pink-600 ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Current Outfit Canvas / Pieces Added */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-pink-600">
                    Selected Pieces ({customFitItems.length})
                  </span>
                  {customFitItems.length > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-500">
                      ${customFitItems.reduce((acc, it) => acc + it.price, 0)} total
                    </span>
                  )}
                </div>

                {customFitItems.length === 0 ? (
                  <div
                    className={`p-6 rounded-xl border border-dashed text-center text-xs ${
                      isLight ? 'border-slate-300 text-slate-500 bg-slate-50' : 'border-slate-800 text-slate-400 bg-slate-950/40'
                    }`}
                  >
                    <p className="font-semibold">No pieces added to this outfit yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Select garments from the wardrobe catalog below
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {customFitItems.map((item) => (
                      <div
                        key={item.id}
                        className={`relative rounded-xl border overflow-hidden group ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="aspect-square w-full relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              setCustomFitItems((prev) => prev.filter((it) => it.id !== item.id));
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-red-600 text-white transition-colors shadow-md"
                            title="Remove piece"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-1.5">
                          <p className="text-[10px] font-bold truncate leading-tight">{item.name}</p>
                          <p className="text-[9px] font-mono text-emerald-500 font-bold">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wardrobe Piece Picker with Multi-Category Filter */}
              <div
                className={`p-3.5 rounded-2xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">
                    Add Garments to Fit
                  </span>
                  <span className="text-[10px] text-pink-600 font-mono font-bold">
                    {fitItemCategoryFilter.length === 0 ? 'All Categories' : fitItemCategoryFilter.join(', ')}
                  </span>
                </div>

                {/* Multiple Category Toggle Filter */}
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories'].map((cat) => {
                    const isAll = cat === 'all';
                    const isSelected = isAll
                      ? fitItemCategoryFilter.length === 0
                      : fitItemCategoryFilter.some((c) => c.toLowerCase() === cat.toLowerCase());

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          if (isAll) {
                            setFitItemCategoryFilter([]);
                          } else {
                            setFitItemCategoryFilter((prev) => {
                              const exists = prev.some((c) => c.toLowerCase() === cat.toLowerCase());
                              if (exists) {
                                return prev.filter((c) => c.toLowerCase() !== cat.toLowerCase());
                              } else {
                                return [...prev, cat];
                              }
                            });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-pink-600 border-pink-600 text-white font-bold shadow-sm'
                            : isLight
                            ? 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Search query input */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by brand, piece, or style..."
                    value={fitItemSearch}
                    onChange={(e) => setFitItemSearch(e.target.value)}
                    className="w-full bg-transparent text-xs focus:outline-none placeholder:text-slate-400"
                  />
                  {fitItemSearch && (
                    <button onClick={() => setFitItemSearch('')}>
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>

                {/* Grid of selectable pieces */}
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                  {userItemsPool
                    .filter((item) => {
                      if (fitItemCategoryFilter.length > 0) {
                        const matches = fitItemCategoryFilter.some(
                          (c) =>
                            c.toLowerCase() === item.category.toLowerCase() ||
                            (c.toLowerCase() === 'tops' && item.category.toLowerCase() === 'dresses')
                        );
                        if (!matches) return false;
                      }
                      if (fitItemSearch.trim()) {
                        const q = fitItemSearch.toLowerCase();
                        return (
                          item.name.toLowerCase().includes(q) ||
                          item.brand.toLowerCase().includes(q) ||
                          item.category.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .slice(0, 24)
                    .map((item) => {
                      const isAdded = customFitItems.some((it) => it.id === item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isAdded) {
                              setCustomFitItems((prev) => prev.filter((it) => it.id !== item.id));
                            } else {
                              setCustomFitItems((prev) => [...prev, item]);
                            }
                          }}
                          className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                            isAdded
                              ? 'border-pink-600 ring-2 ring-pink-600/40 bg-pink-600/10'
                              : isLight
                              ? 'border-slate-200 bg-white hover:border-slate-300'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          }`}
                        >
                          <div className="aspect-square w-full relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <div
                              className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                                isAdded
                                  ? 'bg-pink-600 border-pink-600 text-white'
                                  : 'bg-black/60 border-white/40 text-white'
                              }`}
                            >
                              {isAdded ? '✓' : '+'}
                            </div>
                          </div>
                          <div className="p-1.5">
                            <p className="text-[10px] font-bold truncate leading-tight">{item.name}</p>
                            <p className="text-[9px] font-mono text-emerald-500 font-bold">${item.price}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Note for friend */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1`}>
                  Optional Note for {friendForFit.name}
                </label>
                <input
                  type="text"
                  placeholder={`Curated this specifically for your ${friendForFit.styleArchetype.split('&')[0]} rotation!`}
                  value={fitNote}
                  onChange={(e) => setFitNote(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-pink-600 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>

              {/* Big Send Fit Action Button */}
              <button
                disabled={customFitItems.length === 0}
                onClick={() => {
                  const newOutfit: SharedOutfit = {
                    id: `outfit-${Date.now()}`,
                    name: customFitTitle.trim() || `Fit for ${friendForFit.name.split(' ')[0]}`,
                    aesthetic: customFitAesthetic,
                    items: customFitItems,
                    createdAt: Date.now(),
                  };
                  sendOutfitToFriend(
                    friendForFit.id,
                    newOutfit,
                    fitNote.trim() || undefined
                  );
                  setActiveSubView('none');
                }}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white transition-all shadow-lg ${
                  customFitItems.length > 0
                    ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/30 active:scale-[0.99]'
                    : 'bg-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {customFitItems.length === 0
                    ? 'Add at least 1 piece to send'
                    : `Send Fit (${customFitItems.length} pieces) to ${friendForFit.name}`}
                </span>
              </button>
            </div>
          )}

          {/* SUBVIEW: STATS */}
          {activeSubView === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-2xl font-black text-white font-mono block">
                    {algorithmProfile.totalSwipes}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Swipes</span>
                </div>
                <div className="p-3 rounded-2xl bg-pink-950/40 border border-pink-400/40 text-center">
                  <span className="text-2xl font-black text-pink-300 font-mono block">
                    {algorithmProfile.likeCount}
                  </span>
                  <span className="text-[10px] text-pink-200 uppercase font-bold">Liked</span>
                </div>
                <div className="p-3 rounded-2xl bg-red-950/30 border border-red-900/40 text-center">
                  <span className="text-2xl font-black text-red-400 font-mono block">
                    {algorithmProfile.dislikeCount}
                  </span>
                  <span className="text-[10px] text-red-300 uppercase font-bold">Passed</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <p className="text-xs font-bold text-white">Outfits Uploaded</p>
                <span className="text-lg font-black text-pink-300 font-mono">
                  {algorithmProfile.dissectedOutfitsLearned}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Top Aesthetic Affinities
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(algorithmProfile.aestheticWeights)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([aesthetic, weight]) => (
                      <div key={aesthetic}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-white">{aesthetic}</span>
                          <span className="text-pink-300 font-mono font-bold">{weight}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${weight}%` }}
                            className="h-full bg-pink-300 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBVIEW: DATA */}
          {activeSubView === 'data' && (
            <div className="space-y-4">
              {/* What's My Aesthetic? Quiz Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/40 via-slate-900 to-slate-950 border border-pink-400/40 shadow-lg shadow-pink-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-xl bg-pink-400/20 text-pink-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Taste Discovery Engine
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Answer 20 quick questions to automatically calibrate all 25 aesthetic weights
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsQuizOpen(true)}
                  className={`w-full mt-2 py-3 px-4 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} active:scale-[0.98] text-white font-black text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-md`}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Whats My Aesthetic? Quiz</span>
                </button>
              </div>

              {/* Aesthetic Sliders */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
                  <span>Aesthetic Weight Sliders (25 Trends)</span>
                  <Sliders className="w-3.5 h-3.5 text-pink-300" />
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {Object.entries(algorithmProfile.aestheticWeights).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-200">{key}</span>
                        <span className="font-mono text-pink-300 font-bold">{value}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={value}
                        onChange={(e) =>
                          updateAlgorithmWeight('aesthetic', key, parseInt(e.target.value, 10))
                        }
                        className="w-full accent-pink-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Color affinities */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Color Affinity Weights
                </h3>
                <div className="space-y-3">
                  {Object.entries(algorithmProfile.colorWeights).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-200">{key}</span>
                        <span className="font-mono text-pink-300 font-bold">{value}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={value}
                        onChange={(e) =>
                          updateAlgorithmWeight('color', key, parseInt(e.target.value, 10))
                        }
                        className="w-full accent-pink-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Reset Taste Button at Bottom with Confirmation Prompt */}
              <div className="pt-2">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-3 px-4 rounded-2xl border border-red-500/40 bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-300 font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-red-950/20"
                  >
                    <RotateCcw className="w-4 h-4 text-red-400" />
                    <span>Reset Taste</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-3 animate-in fade-in duration-200">
                    <div>
                      <p className="text-xs font-black text-red-300 flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Taste Profile?</span>
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Are you sure you want to reset all 25 aesthetic weights back to neutral starting points? This will recalibrate your recommendations.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          resetAlgorithm();
                          setShowResetConfirm(false);
                          showToast('Taste profile reset to neutral defaults', '', 'green');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition-colors shadow-md shadow-red-900/40"
                      >
                        Yes, Reset Taste
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBVIEW: SETTINGS (Includes Sizing, Daily Limit, Theme & Feed) */}
          {activeSubView === 'settings' && (
            <div className="space-y-4">
              {/* Daily Swipe Limit Configuration */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-pink-300" />
                      <span>Daily Swipe Limit</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Set a personal daily curation goal (can be bypassed anytime)
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-pink-300 font-bold">
                    {userProfile.preferences.dailySwipeLimit
                      ? `${userProfile.preferences.dailySwipeLimit} / day`
                      : 'Unlimited'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Unlimited', val: null },
                    { label: '15 / day', val: 15 },
                    { label: '25 / day', val: 25 },
                    { label: '50 / day', val: 50 },
                    { label: '100 / day', val: 100 },
                  ].map((lim) => (
                    <button
                      key={lim.label}
                      onClick={() =>
                        updateUserProfile({
                          preferences: {
                            ...userProfile.preferences,
                            dailySwipeLimit: lim.val,
                          },
                        })
                      }
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-colors ${
                        userProfile.preferences.dailySwipeLimit === lim.val
                          ? 'border-pink-400 bg-pink-950/60 text-pink-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lim.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wardrobe & Sizing Preferences */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Wardrobe & Sizing
                </h3>

                {/* Recommendation Department Setting (Men's, Women's, or Both) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Recommendation Department</label>
                    <span className="text-[10px] text-pink-300 font-semibold uppercase">
                      {userProfile.preferences.preferredDepartment === 'men'
                        ? "Men's"
                        : userProfile.preferences.preferredDepartment === 'women'
                        ? "Women's"
                        : 'Both'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    {[
                      { id: 'men', label: "Men's" },
                      { id: 'women', label: "Women's" },
                      { id: 'both', label: 'Both' },
                    ].map((dept) => {
                      const isActive = (userProfile.preferences.preferredDepartment || 'both') === dept.id;
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => {
                            updateUserProfile({
                              preferences: {
                                ...userProfile.preferences,
                                preferredDepartment: dept.id as 'men' | 'women' | 'both',
                              },
                            });
                            showToast(`${dept.label} department selected`, 'Swipe feed & recommendations updated', 'green');
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-pink-300 text-black shadow-md shadow-pink-300/20'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {dept.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Filters the swipe feed, recommendations, and drops strictly to your selection.
                  </p>
                </div>

                {/* Tops with Tall sizing options */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-300">Top / Outerwear Size</label>
                    <span className="text-[10px] text-pink-300 font-semibold">
                      Includes Tall Sizing
                    </span>
                  </div>
                  <select
                    value={userProfile.preferences.topSize}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: { ...userProfile.preferences, topSize: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-400"
                  >
                    {topSizes.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bottoms */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Bottoms / Waist</label>
                  <select
                    value={userProfile.preferences.bottomSize}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: { ...userProfile.preferences, bottomSize: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-400"
                  >
                    <option value="28 (XS)">28 (XS)</option>
                    <option value="30 (S)">30 (S)</option>
                    <option value="32 (M)">32 (M)</option>
                    <option value="34 (L)">34 (L)</option>
                    <option value="36 (XL)">36 (XL)</option>
                    <option value="38 (XXL)">38 (XXL)</option>
                  </select>
                </div>

                {/* Vast Majority of Common Shoe Sizes with US and EU */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-300">Shoe Size (US & EU)</label>
                    <span className="text-[10px] text-slate-400 font-mono">Unisex scale</span>
                  </div>
                  <select
                    value={userProfile.preferences.shoeSize}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: { ...userProfile.preferences, shoeSize: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-400"
                  >
                    {commonShoeSizes.map((ss) => (
                      <option key={ss} value={ss}>
                        {ss}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferences Settings */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-pink-300" />
                    <span>Preferences</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Fine-tune your browsing comfort, display theme, and deck controls
                  </p>
                </div>

                {/* Light or Dark Mode Option */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Theme / Appearance</label>
                    <span className="text-[10px] text-pink-300 font-medium capitalize">
                      {userProfile.preferences.theme || 'Dark Mode'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    {[
                      { id: 'dark', label: 'Dark Mode', icon: Moon },
                      { id: 'light', label: 'Light Mode', icon: Sun },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isActive = (userProfile.preferences.theme || 'dark') === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            updateUserProfile({
                              preferences: {
                                ...userProfile.preferences,
                                theme: mode.id as 'dark' | 'light' | 'system',
                              },
                            });
                            showToast(`${mode.label} selected`, '', 'green');
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isActive
                              ? 'bg-pink-300 text-black shadow-md shadow-pink-300/20'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Auto-Advance on Swipes */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <div>
                    <p className="font-semibold text-white">Smooth Auto-Advance</p>
                    <p className="text-[10px] text-slate-400">Instantly reveal next card after swiping</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.preferences.autoAdvance ?? true}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: {
                          ...userProfile.preferences,
                          autoAdvance: e.target.checked,
                        },
                      })
                    }
                    className="accent-pink-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* High-Resolution Textures */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <div>
                    <p className="font-semibold text-white">High-Definition Fabric Textures</p>
                    <p className="text-[10px] text-slate-400">Load full-res garment weaves & stitch details</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.preferences.highResImages ?? true}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: {
                          ...userProfile.preferences,
                          highResImages: e.target.checked,
                        },
                      })
                    }
                    className="accent-pink-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Compact Card View */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <div>
                    <p className="font-semibold text-white">Compact Card Spacing</p>
                    <p className="text-[10px] text-slate-400">Optimized layout margins for smaller viewports</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.preferences.compactCards ?? false}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: {
                          ...userProfile.preferences,
                          compactCards: e.target.checked,
                        },
                      })
                    }
                    className="accent-pink-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Preferred Currency */}
                <div className="pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-300 font-semibold">Display Currency</label>
                    <span className="text-[10px] text-slate-400 font-mono">Real-time fx</span>
                  </div>
                  <select
                    value={userProfile.preferences.currency}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: { ...userProfile.preferences, currency: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-400 font-mono"
                  >
                    <option value="USD ($)">USD ($) - United States Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                    <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                    <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
                  </select>
                </div>

                {/* Show Out of Stock Archive Pieces */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <div>
                    <p className="font-semibold text-white">Browse Archive & Sold-Out Pieces</p>
                    <p className="text-[10px] text-slate-400">Include rare vintage archive garments in feed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.preferences.showOutOfStock ?? false}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: {
                          ...userProfile.preferences,
                          showOutOfStock: e.target.checked,
                        },
                      })
                    }
                    className="accent-pink-400 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              {/* Experience and Alerts */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Experience & Alerts
                </h3>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">Price Drop Alerts</p>
                    <p className="text-[10px] text-slate-400">Notify when saved items go on sale</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.preferences.priceDropAlerts}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: {
                          ...userProfile.preferences,
                          priceDropAlerts: e.target.checked,
                        },
                      })
                    }
                    className="accent-pink-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <div>
                    <p className="font-semibold text-white">Haptic Feedback</p>
                    <p className="text-[10px] text-slate-400">Tactile feel on swipe gestures</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.preferences.hapticFeedback}
                    onChange={(e) =>
                      updateUserProfile({
                        preferences: {
                          ...userProfile.preferences,
                          hapticFeedback: e.target.checked,
                        },
                      })
                    }
                    className="accent-pink-400 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBVIEW: ACCOUNT */}
          {activeSubView === 'account' && (
            <div className="space-y-4">
              {/* 1. Membership Tier Section */}
              <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
                <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider mb-2`}>
                  Membership Tier
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-pink-300">
                      {userProfile.membership}
                    </span>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Unlimited AI outfit dissections & priority marketplace drops
                    </p>
                  </div>
                  <span className="text-[10px] bg-pink-400/20 text-pink-300 px-2.5 py-0.5 rounded-full border border-pink-400/30 font-bold">
                    Active
                  </span>
                </div>
              </div>

              {/* 2. RIGHT BETWEEN MEMBERSHIP TIER AND ACCOUNT DETAILS:
                  - Option to change email address associated with the account
                  - Payment options inputs
                  - Other very basic account setup things (Phone, Shipping Address, Security & 2FA) */}
              <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'} border space-y-4`}>
                <div>
                  <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider flex items-center gap-1.5`}>
                    <Mail className="w-3.5 h-3.5 text-pink-600" />
                    <span>Account Email & Communication</span>
                  </h3>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Primary email address associated with your Aesthro account and order receipts
                  </p>
                </div>

                {/* Current Email Display & Change Option */}
                <div className={`p-3 rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'} border space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                        Current Email
                      </span>
                      <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {currentEmail}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-pink-600 bg-pink-600/15 px-2 py-0.5 rounded-full border border-pink-600/30 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>

                  {!isChangingEmail ? (
                    <button
                      onClick={() => {
                        setIsChangingEmail(true);
                        setNewEmailInput('');
                      }}
                      className={`w-full mt-1 py-1.5 px-3 rounded-lg ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      } font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 border`}
                    >
                      <Mail className="w-3 h-3 text-pink-600" />
                      <span>Change Email Address</span>
                    </button>
                  ) : (
                    <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'} space-y-2 animate-in fade-in duration-150`}>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} block`}>
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        placeholder="e.g. yourname@example.com"
                        className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'} border text-xs focus:outline-none focus:border-pink-600`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const trimmed = newEmailInput.trim();
                            if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
                              showToast('Please enter a valid email address', '', 'red');
                              return;
                            }
                            setCurrentEmail(trimmed);
                            updateUserProfile({ email: trimmed });
                            setIsChangingEmail(false);
                            showToast('Email address updated!', `Confirmation sent to ${trimmed}`, 'green');
                          }}
                          className={`flex-1 py-2 rounded-lg ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white font-extrabold text-[11px] transition-all shadow-sm`}
                        >
                          Confirm & Update Email
                        </button>
                        <button
                          onClick={() => setIsChangingEmail(false)}
                          className={`px-3 py-2 rounded-lg ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400 hover:text-white'} text-[11px] font-medium`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Options Inputs */}
                <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'} space-y-3`}>
                  <div>
                    <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider flex items-center gap-1.5`}>
                      <CreditCard className="w-3.5 h-3.5 text-pink-600" />
                      <span>Payment Options & Methods</span>
                    </h3>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Manage your default payment card and 1-tap mobile wallets
                    </p>
                  </div>

                  {/* Active Default Card Preview */}
                  <div className={`p-3 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-800'} border flex items-center justify-between text-xs`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-7 rounded-md bg-pink-600/20 border border-pink-600/40 flex items-center justify-center text-pink-600 font-mono font-black text-[10px]">
                        VISA
                      </div>
                      <div>
                        <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'} block`}>
                          {cardNumber}
                        </span>
                        <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {cardHolder} • Exp {cardExpiry}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingPayment(!isEditingPayment)}
                      className="text-[10px] text-pink-600 hover:text-pink-700 font-bold px-2 py-1 rounded bg-pink-600/10 border border-pink-600/20"
                    >
                      {isEditingPayment ? 'Close' : 'Update Card'}
                    </button>
                  </div>

                  {/* Payment Inputs Form */}
                  {isEditingPayment && (
                    <div className={`p-3 rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'} border space-y-2.5 animate-in fade-in duration-150`}>
                      <div>
                        <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1`}>
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name on card"
                          className={`w-full px-3 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-600`}
                        />
                      </div>

                      <div>
                        <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1`}>
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4128 •••• •••• ••••"
                          className={`w-full px-3 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-600`}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className={`text-[10px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1`}>
                            Expiry
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-600`}
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1`}>
                            CVC
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="•••"
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-600`}
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1`}>
                            Billing ZIP
                          </label>
                          <input
                            type="text"
                            value={billingZip}
                            onChange={(e) => setBillingZip(e.target.value)}
                            placeholder="90210"
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-600`}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          updateUserProfile({
                            paymentMethod: {
                              cardHolder,
                              cardNumber,
                              expiry: cardExpiry,
                              cvc: cardCvc,
                              billingZip,
                              applePay: applePayActive,
                            },
                          });
                          setIsEditingPayment(false);
                          showToast('Payment method saved', 'Default card updated successfully', 'green');
                        }}
                        className={`w-full mt-1 py-2 rounded-lg ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white font-extrabold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Payment Method</span>
                      </button>
                    </div>
                  )}

                  {/* 1-Tap Apple Pay / Google Pay toggle */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Apple Pay & Express Wallets</p>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Instant biometric checkout without entering card numbers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={applePayActive}
                      onChange={(e) => {
                        setApplePayActive(e.target.checked);
                        updateUserProfile({
                          paymentMethod: {
                            ...(userProfile.paymentMethod || {
                              cardHolder,
                              cardNumber,
                              expiry: cardExpiry,
                              cvc: cardCvc,
                              billingZip,
                            }),
                            applePay: e.target.checked,
                          },
                        });
                        showToast(e.target.checked ? 'Apple Pay enabled' : 'Apple Pay disabled', '', 'green');
                      }}
                      className="accent-pink-600 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Other Basic Account Setup: Phone & Shipping Address */}
                <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'} space-y-3`}>
                  <div>
                    <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider flex items-center gap-1.5`}>
                      <MapPin className="w-3.5 h-3.5 text-pink-600" />
                      <span>Delivery & Setup Details</span>
                    </h3>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Shipping address, delivery phone, and account security
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5 mb-1`}>
                      <Phone className="w-3 h-3 text-pink-600" />
                      <span>Phone Number (SMS order & drop tracking)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={`flex-1 px-3 py-1.5 rounded-lg ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-600 font-mono`}
                      />
                      <button
                        onClick={() => {
                          updateUserProfile({ phone: phoneInput });
                          showToast('Phone number saved', '', 'green');
                        }}
                        className={`px-3 py-1.5 rounded-lg ${
                          isLight
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-pink-600 border-slate-700'
                        } font-bold text-[11px] border`}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Default Delivery Address
                      </label>
                      <button
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                        className="text-[10px] text-pink-600 hover:underline font-semibold"
                      >
                        {isEditingAddress ? 'Cancel' : 'Edit Address'}
                      </button>
                    </div>

                    {!isEditingAddress ? (
                      <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'} border text-xs`}>
                        <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{streetAddress}</p>
                        <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {cityAddress}, {stateAddress} {zipAddress} • {countryAddress}
                        </p>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'} border space-y-2 animate-in fade-in duration-150`}>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Street Address</label>
                          <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-600`}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">City</label>
                            <input
                              type="text"
                              value={cityAddress}
                              onChange={(e) => setCityAddress(e.target.value)}
                              className={`w-full px-2 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-600`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">State</label>
                            <input
                              type="text"
                              value={stateAddress}
                              onChange={(e) => setStateAddress(e.target.value)}
                              className={`w-full px-2 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-600`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">ZIP</label>
                            <input
                              type="text"
                              value={zipAddress}
                              onChange={(e) => setZipAddress(e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-600`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Country</label>
                          <select
                            value={countryAddress}
                            onChange={(e) => setCountryAddress(e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-600`}
                          >
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="European Union">European Union</option>
                            <option value="Japan">Japan</option>
                            <option value="Australia">Australia</option>
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            updateUserProfile({
                              shippingAddress: {
                                street: streetAddress,
                                city: cityAddress,
                                state: stateAddress,
                                zip: zipAddress,
                                country: countryAddress,
                              },
                            });
                            setIsEditingAddress(false);
                            showToast('Delivery address saved', '', 'green');
                          }}
                          className={`w-full mt-1 py-2 rounded-lg ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white font-extrabold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Delivery Address</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Relocated basic account details to popup modal */}
              <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'} border flex items-center justify-between`}>
                <div>
                  <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider`}>
                    Account Details
                  </h3>
                  <p className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'} mt-0.5`}>
                    {userProfile.name} • <span className="font-mono text-pink-600 font-bold">{userProfile.handle}</span>
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} line-clamp-1 mt-0.5`}>
                    {userProfile.bio}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditName(userProfile.name);
                    setEditHandle(userProfile.handle);
                    setEditBio(userProfile.bio);
                    setIsEditProfileOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-bold transition-all flex-shrink-0 shadow-sm`}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* SUBVIEW: PRIVACY (Moved privacy/content sharing configurations into dedicated section) */}
          {activeSubView === 'privacy' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'} border space-y-4`}>
                <div>
                  <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'} tracking-wider flex items-center gap-1.5`}>
                    <Shield className="w-3.5 h-3.5 text-pink-600" />
                    <span>Privacy & Content Sharing</span>
                  </h3>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Control wardrobe visibility, discovery & account authentication
                  </p>
                </div>

                {/* 1. Outfits Visibility */}
                <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                  <div className="flex justify-between items-center">
                    <label className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} font-semibold`}>Outfits Tab Visibility</label>
                    <span className="text-[10px] text-pink-600 font-bold capitalize">
                      {userProfile.preferences.outfitsVisibility === 'none'
                        ? 'No One (Private)'
                        : userProfile.preferences.outfitsVisibility === 'friends'
                        ? 'Friends Only'
                        : 'Anyone (Public)'}
                    </span>
                  </div>
                  <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl ${isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-950 border-slate-800'} border`}>
                    {[
                      { id: 'anyone', label: 'Anyone' },
                      { id: 'friends', label: 'Friends' },
                      { id: 'none', label: 'No One' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          updateUserProfile({
                            preferences: {
                              ...userProfile.preferences,
                              outfitsVisibility: opt.id as 'anyone' | 'friends' | 'none',
                            },
                          });
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          (userProfile.preferences.outfitsVisibility || 'anyone') === opt.id
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                            : isLight ? 'text-slate-600 hover:text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Moodboards Visibility */}
                <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                  <div className="flex justify-between items-center">
                    <label className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} font-semibold`}>Moodboards Tab Visibility</label>
                    <span className="text-[10px] text-pink-600 font-bold capitalize">
                      {userProfile.preferences.moodboardsVisibility === 'none'
                        ? 'No One (Private)'
                        : userProfile.preferences.moodboardsVisibility === 'friends'
                        ? 'Friends Only'
                        : 'Anyone (Public)'}
                    </span>
                  </div>
                  <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl ${isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-950 border-slate-800'} border`}>
                    {[
                      { id: 'anyone', label: 'Anyone' },
                      { id: 'friends', label: 'Friends' },
                      { id: 'none', label: 'No One' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          updateUserProfile({
                            preferences: {
                              ...userProfile.preferences,
                              moodboardsVisibility: opt.id as 'anyone' | 'friends' | 'none',
                            },
                          });
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          (userProfile.preferences.moodboardsVisibility || 'anyone') === opt.id
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                            : isLight ? 'text-slate-600 hover:text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Collection Visibility */}
                <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                  <div className="flex justify-between items-center">
                    <label className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} font-semibold`}>Collections Visibility</label>
                    <span className="text-[10px] text-pink-600 font-bold capitalize">
                      {userProfile.preferences.collectionsVisibility === 'none'
                        ? 'No One (Private)'
                        : userProfile.preferences.collectionsVisibility === 'friends'
                        ? 'Friends Only'
                        : 'Anyone (Public)'}
                    </span>
                  </div>
                  <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl ${isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-950 border-slate-800'} border`}>
                    {[
                      { id: 'anyone', label: 'Anyone' },
                      { id: 'friends', label: 'Friends' },
                      { id: 'none', label: 'No One' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          updateUserProfile({
                            preferences: {
                              ...userProfile.preferences,
                              collectionsVisibility: opt.id as 'anyone' | 'friends' | 'none',
                            },
                          });
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          (userProfile.preferences.collectionsVisibility || 'anyone') === opt.id
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                            : isLight ? 'text-slate-600 hover:text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Profile Discoverability */}
                <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                  <div className="flex justify-between items-center">
                    <label className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} font-semibold`}>Profile Search Discoverability</label>
                    <span className="text-[10px] text-pink-600 font-bold capitalize">
                      {userProfile.preferences.profileDiscoverability || 'public'}
                    </span>
                  </div>
                  <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl ${isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-950 border-slate-800'} border`}>
                    {[
                      { id: 'public', label: 'Public' },
                      { id: 'friends', label: 'Friends' },
                      { id: 'private', label: 'Private' },
                    ].map((disc) => (
                      <button
                        key={disc.id}
                        type="button"
                        onClick={() => {
                          updateUserProfile({
                            preferences: {
                              ...userProfile.preferences,
                              profileDiscoverability: disc.id as 'public' | 'friends' | 'private',
                            },
                          });
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          (userProfile.preferences.profileDiscoverability || 'public') === disc.id
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                            : isLight ? 'text-slate-600 hover:text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {disc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Show Style Archetype on Profile */}
                <div className={`flex items-center justify-between text-xs pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <div>
                      <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Show My Style Archetype on Profile</p>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Display archetype badge publicly on profile</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.preferences.showArchetypePublicly !== false}
                    onChange={(e) => {
                      updateUserProfile({
                        preferences: {
                          ...userProfile.preferences,
                          showArchetypePublicly: e.target.checked,
                        },
                      });
                    }}
                    className="accent-pink-600 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 6. Two-Factor Authentication (2FA) */}
                <div className={`flex items-center justify-between text-xs pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-pink-600" />
                    <div>
                      <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Two-Factor Authentication (2FA)</p>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Require SMS confirmation on new device logins</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="accent-pink-600 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
          {activeSubView === 'help' && (
            <div className="space-y-4 text-xs">
              {/* Simplified Overview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-600/20 text-pink-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">How Aesthro Works</h3>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Aesthro learns your fashion taste in real-time. Upload street style outfits to dissect garments, or swipe through pieces to refine your 25 aesthetic affinities.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-base block mb-0.5">📸</span>
                    <span className="text-[10px] font-bold text-white block">1. Dissect</span>
                    <span className="text-[9px] text-slate-400">Find any item</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-base block mb-0.5">⚡</span>
                    <span className="text-[10px] font-bold text-white block">2. Swipe</span>
                    <span className="text-[9px] text-slate-400">Train your taste</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-base block mb-0.5">🛍️</span>
                    <span className="text-[10px] font-bold text-white block">3. Collect</span>
                    <span className="text-[9px] text-slate-400">Build dream fits</span>
                  </div>
                </div>
              </div>

              {/* FAQs Section - 7 Most Likely Confusing Parts */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-pink-600" />
                  <span>Frequently Asked Questions</span>
                </h3>

                {[
                  {
                    q: 'How does swiping right (Like) or left (Pass) affect my future feed?',
                    a: 'Swiping right tells Aesthro to surface more pieces matching that garment’s cut, brand, silhouette, and aesthetic tags. Swiping left gently downweights those traits. Your recommendations get noticeably more tailored every 5–10 swipes.',
                  },
                  {
                    q: 'What is the difference between Single Items and Outfit Bundles?',
                    a: 'By default, the Swipe tab suggests single pieces so you can curate individual wardrobe staples. You can toggle "Bundles Only" or "All Items" in the filter menu to explore complete pre-coordinated outfit sets.',
                  },
                  {
                    q: 'How does the "Hot Right Now" carousel work on the Upload page?',
                    a: 'It automatically tracks the most loved, saved, and purchased pieces across all Aesthro members in real-time, giving you quick access to community favorites.',
                  },
                  {
                    q: 'Can I bypass the Daily Swipe Limit if I want to keep browsing?',
                    a: 'Yes! The daily swipe limit is purely a personal goal feature to encourage mindful shopping. When prompted, you can simply tap "Bypass Limit & Keep Swiping" anytime.',
                  },
                  {
                    q: 'What does the "Whats my Aesthetic? Quiz" do?',
                    a: 'Located in your Profile > Data section, this 20-question quiz calculates your style leanings and automatically calibrates all 25 aesthetic sliders to match your taste in one go.',
                  },
                  {
                    q: 'How do I organize my saved pieces into Collections?',
                    a: 'Head to Profile > Collections. You can create custom themed capsules (like "Summer Gorpcore" or "Vintage Denim") and assign any of your wishlisted items to them.',
                  },
                  {
                    q: 'How does the AI Outfit Dissection in the Upload tab work?',
                    a: 'Upload or snap any street-style photo, and Aesthro’s computer vision engine breaks the photo down into individual garments (jackets, tops, pants, shoes) and finds matching marketplace pieces.',
                  },
                ].map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 transition-colors hover:border-slate-700"
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left gap-2"
                      >
                        <span className="font-bold text-xs text-white leading-snug">
                          {faq.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-pink-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed animate-in fade-in duration-150">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Feedback Button at Bottom */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setFeedbackSubmitted(false);
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]`}
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Share App Feedback & Suggestions</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 20-Question What's My Aesthetic? Quiz Modal */}
      <AestheticQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={applyQuizResults}
      />

      {/* Feedback Form Modal */}
      {isFeedbackOpen && (
        <div
          onClick={() => setIsFeedbackOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'} border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 relative cursor-default max-h-[85vh] overflow-y-auto overscroll-contain my-auto pb-5`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setIsFeedbackOpen(false)}
              className="sticky top-0 float-right z-30 ml-auto -mr-2 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-lg transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {!feedbackSubmitted ? (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 pr-10">
                  <div className="p-1.5 rounded-xl bg-pink-600/20 text-pink-600">
                    <MessageSquarePlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">App Feedback</h3>
                    <p className="text-[10px] text-slate-400">Help us refine and perfect Aesthro</p>
                  </div>
                </div>

                {/* Simple Ratings Options */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    How would you rate your experience?
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'love', icon: '😍', label: 'Love' },
                      { id: 'great', icon: '🙂', label: 'Great' },
                      { id: 'okay', icon: '😐', label: 'Okay' },
                      { id: 'needs_work', icon: '🙁', label: 'Fair' },
                      { id: 'bug', icon: '🐞', label: 'Bug' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setFeedbackRating(r.id)}
                        className={`py-2 px-1 rounded-xl text-center border transition-all ${
                          feedbackRating === r.id
                            ? 'border-pink-600 bg-pink-600/20 shadow-md shadow-pink-600/20 scale-105 text-white'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base block">{r.icon}</span>
                        <span className="text-[9px] font-bold block mt-0.5">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic / Category */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    What is your feedback about?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Recommendations',
                      'Aesthetic Styles',
                      'Upload & Dissection',
                      'Feature Idea',
                      'Design & Sizing',
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFeedbackCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          feedbackCategory === cat
                            ? 'bg-pink-600 text-white shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Open-ended comments box */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Comments & Suggestions
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Tell us what you're loving, what could be smoother, or features you'd like to see next..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-600 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackSubmitted(true);
                    showToast('Thank you for your feedback!', 'Your input helps improve Aesthro', 'green');
                  }}
                  className={`w-full py-3 rounded-2xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white font-extrabold text-xs tracking-wide transition-all shadow-lg active:scale-[0.98]`}
                >
                  Submit Feedback
                </button>
              </>
            ) : (
              /* Thank You State */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-600/20 border border-pink-600/60 flex items-center justify-center mx-auto text-pink-600">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Thank You for Your Feedback!</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    We truly appreciate you taking the time to share your thoughts. Your feedback directly guides how we train recommendations and build new features for Aesthro!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsFeedbackOpen(false);
                    setFeedbackComments('');
                    setFeedbackSubmitted(false);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Simple Popup Modal */}
      {isEditProfileOpen && (
        <div
          onClick={() => setIsEditProfileOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-950 border-slate-700 text-white'
            } relative cursor-default max-h-[85vh] overflow-y-auto overscroll-contain my-auto pb-5`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="sticky top-0 float-right z-30 ml-auto -mr-2 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-lg transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className={`flex items-center gap-2 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} mb-4 pr-10`}>
              <Edit3 className="w-4 h-4 text-pink-600" />
              <h3 className="font-extrabold text-base">Edit Profile</h3>
            </div>

            {/* 1. Header Banner Cover Change */}
            <div className={`flex items-center gap-3.5 mb-3 p-3 rounded-2xl ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900/60 border border-slate-800'}`}>
              <div className="w-18 h-11 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0 relative">
                <img
                  src={
                    userProfile.coverImageUrl ||
                    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className={`px-3 py-1.5 rounded-xl ${
                    isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  } text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm`}
                >
                  <Camera className="w-3.5 h-3.5 text-pink-600" />
                  <span>Change Banner</span>
                </button>
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1 truncate`}>Update profile background banner</p>
              </div>
            </div>

            {/* 2. Avatar & Photo Change */}
            <div className={`flex items-center gap-3.5 mb-4 p-3 rounded-2xl ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900/60 border border-slate-800'}`}>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-600/60 bg-slate-800 flex-shrink-0 relative">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-base">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className={`px-3 py-1.5 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm`}
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <span>Change Photo</span>
                </button>
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1 truncate`}>Upload new profile picture</p>
              </div>
            </div>

            {/* Form Fields: Name, Handle, Bio */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className={`text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Name"
                  className={`w-full px-3.5 py-2.5 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-pink-600'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-pink-600'
                  } border font-medium`}
                />
              </div>

              <div>
                <label className={`text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'} block mb-1`}>
                  Username Handle
                </label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  placeholder="@handle"
                  className={`w-full px-3.5 py-2.5 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-pink-600 focus:border-pink-600'
                      : 'bg-slate-900 border-slate-700 text-pink-600 focus:border-pink-600'
                  } border font-mono font-medium`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Bio & Style Philosophy (1 Line)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-pink-600">
                    {editBio.length}/30
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={30}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 30))}
                  placeholder="Style bio (max 30 chars)..."
                  className={`w-full px-3.5 py-2.5 rounded-xl ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-pink-600'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-pink-600'
                  } border font-medium`}
                />
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                  Limited to 30 characters so it fits cleanly on one line
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className={`flex gap-2.5 mt-5 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className={`flex-1 py-2.5 rounded-xl border ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                } text-xs font-semibold transition-colors`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateUserProfile({
                    name: editName.trim() || userProfile.name,
                    handle: editHandle.trim() || userProfile.handle,
                    bio: editBio.slice(0, 30).trim(),
                  });
                  setIsEditProfileOpen(false);
                  showToast('Profile updated!', '', 'green');
                }}
                className={`flex-1 py-2.5 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/40'} text-white text-xs font-black transition-all shadow-lg`}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friend Profile Modal / Page */}
      {selectedFriend && (
        <div
          onClick={() => setSelectedFriend(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md max-h-[85vh] overflow-y-auto overscroll-contain my-auto rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
            } shadow-2xl relative scrollbar-none cursor-default`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setSelectedFriend(null)}
              className="sticky top-3 float-right z-30 mr-3 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-lg transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Friend Cover Banner (Shortened by 25% to h-28, layered z-0 behind avatar) */}
            <div className="relative z-0 h-28 w-full overflow-hidden bg-slate-900 -mt-10">
              <img
                src={selectedFriend.coverImage || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'}
                alt={selectedFriend.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            </div>

            <div className="px-5 pb-6">
              {/* Avatar overlapping banner (Layered in front with relative z-10) */}
              <div className="flex items-end justify-between -mt-10 mb-2 relative z-10">
                <div className="w-20 h-20 rounded-full border-4 border-black ring-2 ring-black overflow-hidden bg-slate-800 shadow-xl relative z-10">
                  <img
                    src={selectedFriend.avatar}
                    alt={selectedFriend.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    handleOpenBuildFitForFriend(selectedFriend);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl ${isLight ? 'cosmic-gradient-bg-light shadow-pink-600/25' : 'cosmic-gradient-bg shadow-pink-600/35'} hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5`}
                  title={`Build & send new outfit to ${selectedFriend.name}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Fit</span>
                </button>
              </div>

              {/* Friend Info: Style archetype in italics under @handle */}
              <div>
                <h3 className="text-lg font-black">{selectedFriend.name}</h3>
                <p className={`text-xs font-mono font-bold ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>{selectedFriend.handle}</p>
                <p className={`text-xs italic font-medium pt-0.5 ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                  {selectedFriend.styleArchetype}
                </p>
                <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} mt-2 leading-relaxed`}>
                  {selectedFriend.bio}
                </p>
              </div>

              {/* Subheader Counts & Stats */}
              <div className="grid grid-cols-4 gap-1.5 my-3.5 text-center">
                <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'} border`}>
                  <span className={`text-xs font-bold ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} block font-mono`}>
                    {selectedFriend.matchScore}%
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Match</span>
                </div>
                <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'} border`}>
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} block font-mono`}>
                    {selectedFriend.outfitsCount}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Outfits</span>
                </div>
                <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'} border`}>
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} block font-mono`}>
                    {selectedFriend.friendsCount}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Friends</span>
                </div>
                <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'} border`}>
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} block font-mono`}>
                    {selectedFriend.sharedItems}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Saves</span>
                </div>
              </div>

              {/* Friend's Curated Moodboards */}
              <div className="space-y-3">
                {selectedFriend.moodboards && selectedFriend.moodboards.length > 0 ? (
                  selectedFriend.moodboards.map((mb: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedMoodboardDetail({
                          id: `mb-friend-${idx}`,
                          title: mb.title,
                          description: mb.description,
                          itemIds: mb.items.map((it: ClothingItem) => it.id),
                          items: mb.items,
                          isFriend: true,
                        });
                        setSelectedFriend(null);
                      }}
                      className={`p-3 rounded-2xl ${isLight ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-white'} border space-y-2 cursor-pointer transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <h5 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{mb.title}</h5>
                        <span className={`text-[10px] font-mono font-bold ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>{mb.items.length} pieces</span>
                      </div>
                      <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{mb.description}</p>
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {mb.items.map((item: ClothingItem, iIdx: number) => (
                          <div
                            key={iIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectItem(item);
                            }}
                            className={`aspect-square rounded-xl overflow-hidden ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'} border relative cursor-pointer group hover:border-pink-500 transition-colors`}
                            title={`View ${item.name}`}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`p-4 rounded-2xl border text-center ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                    <p className="text-xs font-semibold">No public moodboards yet</p>
                    <p className="text-[10px] mt-0.5 opacity-80">This friend hasn&apos;t published any curated moodboard collections.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Item Modal with controlled scroll bounds */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl p-5 border ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
            } shadow-2xl space-y-4 relative cursor-default max-h-[85vh] overflow-y-auto overscroll-contain my-auto`}
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setInspectItem(null)}
              className="sticky top-0 float-right z-30 ml-auto -mr-1 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-lg transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-10">
              <span className={`text-[10px] uppercase font-mono tracking-widest ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'} font-bold`}>
                {inspectItem.brand}
              </span>
              <h3 className={`text-base font-black ${isLight ? 'text-sky-950' : 'text-white'}`}>
                {inspectItem.name}
              </h3>
            </div>

            <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={inspectItem.image}
                alt={inspectItem.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-sm text-white font-mono text-sm font-bold border border-white/20">
                ${inspectItem.price}
              </span>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
              {inspectItem.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Material</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inspectItem.material}</span>
              </div>
              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Silhouette Fit</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{inspectItem.fit}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 pb-1">
              <button
                onClick={() => {
                  addToCart(inspectItem);
                  showToast('Added to Cart', `${inspectItem.name} (${inspectItem.brand})`, 'green');
                  setInspectItem(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
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
                    ? isLight ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' : 'border-pink-500 bg-pink-950/60 text-pink-400 shadow-sm'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
                title="Toggle Wishlist"
              >
                <Heart className={`w-4 h-4 ${isItemInWishlist(inspectItem.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
