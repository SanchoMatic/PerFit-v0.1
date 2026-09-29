import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AestheticQuizModal } from '../quiz/AestheticQuizModal';
import { INITIAL_CATALOG } from '../../data/mockCatalog';
import { ClothingItem } from '../../types';

type ProfileSubView =
  | 'none'
  | 'menu'
  | 'friends'
  | 'stats'
  | 'data'
  | 'collections'
  | 'settings'
  | 'account'
  | 'help';

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
    addToCart,
    toggleWishlist,
    isItemInWishlist,
    showToast,
    activeTab,
    setActiveTab,
    tabResetTimestamp,
    setGenderFilter,
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

  // Friends mock data with rich Pinterest/Instagram style profiles
  const friends = [
    {
      id: 'f-1',
      name: 'Julian Vance',
      handle: '@julian_arch',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      matchScore: 94,
      favoriteBrand: "Arc'teryx",
      styleArchetype: 'Gorpcore & Techwear',
      bio: 'Pacific Northwest storm shell archivist. Layering technical ripstop, Salomon chassis footwear & utilitarian packs.',
      sharedItems: 12,
      outfitsCount: 18,
      friendsCount: 42,
      joinedDate: 'Jan 2024',
      moodboards: [
        {
          title: 'Alpine Technical Storm Shells',
          description: '3-layer Gore-Tex and taped seam garments',
          items: [
            INITIAL_CATALOG.find((i) => i.id === 'item-1') || INITIAL_CATALOG[0],
            INITIAL_CATALOG.find((i) => i.id === 'item-4') || INITIAL_CATALOG[3],
            INITIAL_CATALOG.find((i) => i.id === 'item-45') || INITIAL_CATALOG[5],
            INITIAL_CATALOG.find((i) => i.id === 'item-51') || INITIAL_CATALOG[6],
          ],
        },
        {
          title: 'Trail Footwear Vault',
          description: 'Aggressive Contagrip lugs & all-weather sneakers',
          items: [
            INITIAL_CATALOG.find((i) => i.id === 'item-4') || INITIAL_CATALOG[3],
            INITIAL_CATALOG.find((i) => i.id === 'item-53') || INITIAL_CATALOG[2],
          ],
        },
      ],
    },
    {
      id: 'f-2',
      name: 'Maya Chen',
      handle: '@chen_archive',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      matchScore: 89,
      favoriteBrand: 'Acne Studios',
      styleArchetype: 'Minimalist & Quiet Luxury',
      bio: 'Sculptural architectural draping, brushed mohair sweaters, and subdued monochromatic tones.',
      sharedItems: 8,
      outfitsCount: 24,
      friendsCount: 58,
      joinedDate: 'Aug 2023',
      moodboards: [
        {
          title: 'Soft Mohair & Sculptural Pleats',
          description: 'Permanent pleats and fuzzy oversized knitwear',
          items: [
            INITIAL_CATALOG.find((i) => i.id === 'item-2') || INITIAL_CATALOG[1],
            INITIAL_CATALOG.find((i) => i.id === 'item-3') || INITIAL_CATALOG[2],
            INITIAL_CATALOG.find((i) => i.id === 'item-46') || INITIAL_CATALOG[7],
            INITIAL_CATALOG.find((i) => i.id === 'item-60') || INITIAL_CATALOG[8],
          ],
        },
      ],
    },
    {
      id: 'f-3',
      name: 'Darius Thorne',
      handle: '@darius_fit',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      matchScore: 82,
      favoriteBrand: 'Rick Owens',
      styleArchetype: 'Avant-Garde & Dark Sartorial',
      bio: 'Heavy pod shorts, lugged commando soles, and brutalist geometric silhouettes.',
      sharedItems: 5,
      outfitsCount: 14,
      friendsCount: 31,
      joinedDate: 'Nov 2023',
      moodboards: [
        {
          title: 'Dark Brutalist Uniform',
          description: 'Drop crotch jersey and spazzolato leather derbies',
          items: [
            INITIAL_CATALOG.find((i) => i.id === 'item-62') || INITIAL_CATALOG[0],
            INITIAL_CATALOG.find((i) => i.id === 'item-66') || INITIAL_CATALOG[1],
            INITIAL_CATALOG.find((i) => i.id === 'item-47') || INITIAL_CATALOG[2],
          ],
        },
      ],
    },
  ];

  // Settings menu sections in requested order: settings, account, data, stats, help
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
      description: 'Security, email, address & visibility',
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
    createCollection(newCollectionTitle.trim(), newCollectionDesc.trim());
    setNewCollectionTitle('');
    setNewCollectionDesc('');
    setIsCreatingCollection(false);
    showToast('Collection created', '', 'green');
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
              <div>
                <span className="text-[10px] font-mono uppercase text-pink-300 font-bold block">
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
                  ? 'bg-pink-300 text-black border-pink-400'
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

          {/* Description or Edit Form */}
          {isEditingOutfit ? (
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
              className={`p-4 rounded-2xl ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-700'
              } border space-y-3`}
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Outfit Title
                </label>
                <input
                  type="text"
                  value={editOutfitTitle}
                  onChange={(e) => setEditOutfitTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  } border focus:outline-none focus:border-pink-400`}
                  placeholder="Outfit title"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Aesthetic Style
                </label>
                <input
                  type="text"
                  value={editOutfitAesthetic}
                  onChange={(e) => setEditOutfitAesthetic(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  } border focus:outline-none focus:border-pink-400`}
                  placeholder="e.g. Minimalist Sartorial"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Description / Styling Notes
                </label>
                <input
                  type="text"
                  value={editOutfitDesc}
                  onChange={(e) => setEditOutfitDesc(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  } border focus:outline-none focus:border-pink-400`}
                  placeholder="Styling notes..."
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-300 text-black text-xs font-bold hover:bg-pink-200 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingOutfit(false)}
                  className={`px-3 py-2 rounded-xl border ${
                    isLight ? 'border-slate-300 text-slate-600' : 'border-slate-700 text-slate-400 hover:text-white'
                  } text-xs`}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            selectedOutfitDetail.description && (
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                {selectedOutfitDetail.description}
              </p>
            )
          )}

          {/* All contents of this outfit */}
          <div className="space-y-3">
            {selectedOutfitDetail.items.map((item) => (
              <div
                key={item.id}
                onClick={() => setInspectItem(item)}
                className={`p-3 rounded-2xl ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200' : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800'
                } border flex items-center justify-between cursor-pointer group transition-all shadow-sm`}
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
                    <span className="text-[10px] font-mono uppercase text-pink-300 font-bold block">
                      {item.brand}
                    </span>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} line-clamp-1`}>
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {item.category} • {item.fit}
                    </p>
                    <span className="text-xs font-mono font-bold text-pink-300">
                      ${item.price}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {isEditingOutfit && selectedOutfitDetail.items.length > 1 && (
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
              <div>
                <h2 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedMoodboardDetail.title}
                </h2>
                <span className="text-[11px] text-pink-300 font-mono font-medium">
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
                    ? 'bg-pink-300 text-black border-pink-400'
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
                  } border focus:outline-none focus:border-pink-400`}
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
                  } border focus:outline-none focus:border-pink-400`}
                  placeholder="Aesthetic description..."
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-300 text-black text-xs font-bold hover:bg-pink-200 transition-colors shadow-sm"
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
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center mt-4">
                  <FolderHeart className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white mb-1">No items in this moodboard</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mb-4">
                    Add items by liking pieces in the Swipe tab or from your saved pieces.
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
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono font-bold text-pink-300 border border-pink-400/30">
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

            {/* Upload Header Background Image Option */}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-2.5 right-3 px-2.5 py-1 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md z-10 hover:border-pink-300 hover:text-pink-300"
              title="Change Banner Photo"
            >
              <Camera className="w-3 h-3 text-pink-300" />
              <span>Change Banner</span>
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

                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-pink-300 ring-2 ring-black flex items-center justify-center shadow-md">
                  <Camera className="w-3.5 h-3.5 text-black" />
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
                } border hover:border-pink-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm`}
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-300" />
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
              <p className="text-xs font-mono text-pink-300 font-medium">{userProfile.handle}</p>

              {/* Style archetype in italics right under @handle with pastel pink tune button and wrench right next to it */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-xs italic text-pink-300 font-medium">
                  {userProfile.styleArchetype || 'Minimal Utilitarian / Gorpcore'}
                </span>
                <button
                  onClick={() => setActiveSubView('data')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-400/15 text-pink-300 hover:bg-pink-400/25 border border-pink-400/30 text-[11px] font-bold transition-colors shadow-sm"
                  title="Tune Algorithm Weights"
                >
                  <Wrench className="w-3 h-3" />
                  <span>Tune</span>
                </button>
              </div>
            </div>

            {/* Bio text */}
            {userProfile.bio && (
              <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} mt-2 leading-relaxed`}>
                {userProfile.bio}
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
                <Users className="w-3.5 h-3.5 text-pink-300" />
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
                        color: proximity > 0.4 ? '#f472b6' : isLight ? '#64748b' : '#94a3b8',
                        textShadow:
                          proximity > 0.3
                            ? `0 0 ${proximity * 14}px rgba(244, 114, 182, ${proximity * 0.95})`
                            : 'none',
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className="w-4 h-4 transition-transform duration-150"
                          style={{
                            filter:
                              proximity > 0.3
                                ? `drop-shadow(0 0 ${proximity * 6}px rgba(244,114,182,0.85))`
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
                className={`absolute bottom-0 h-0.5 bg-pink-300 rounded-full shadow-[0_0_12px_rgba(244,114,182,0.95)] ${
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
                        const pool = [...wishlistItems, ...purchasedItems, ...INITIAL_CATALOG];
                        const selectedGarments = pool.slice(0, 3);
                        const newFit = {
                          id: `fit-${Date.now()}`,
                          title: newOutfitTitle.trim(),
                          aesthetic: newOutfitAesthetic.trim() || 'Curated Aesthetic',
                          description: newOutfitDesc.trim() || 'Custom styled ensemble curated from your wardrobe.',
                          items: selectedGarments,
                        };
                        setOutfitsList([newFit, ...outfitsList]);
                        setIsCreatingOutfit(false);
                        setNewOutfitTitle('');
                        setNewOutfitAesthetic('');
                        setNewOutfitDesc('');
                        showToast(`Created outfit "${newFit.title}"`, '', 'green');
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
                          className="px-4 py-2 rounded-xl bg-pink-300 text-black text-xs font-bold hover:bg-pink-200 transition-colors shadow-sm"
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

                  {/* Greyed-out "New Outfit" card with little + symbol */}
                  <div
                    onClick={() => setIsCreatingOutfit(true)}
                    className={`p-4 rounded-2xl border-2 border-dashed ${
                      isLight
                        ? 'border-slate-300 bg-slate-100/60 hover:bg-slate-200/60 text-slate-500'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 text-slate-400'
                    } hover:border-pink-300/60 transition-all cursor-pointer group flex flex-col items-center justify-center text-center py-6 shadow-sm`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-pink-300 group-hover:border-pink-300/60 transition-colors mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold group-hover:text-pink-300 transition-colors">
                      New Outfit
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Curate pieces into a look
                    </span>
                  </div>

                  {/* Outfit cards */}
                  {outfitsList.map((outfit) => {
                    const totalOutfitPrice = outfit.items.reduce((acc, it) => acc + it.price, 0);
                    return (
                      <div
                        key={outfit.id}
                        onClick={() => setSelectedOutfitDetail(outfit)}
                        className={`p-3.5 rounded-2xl ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200' : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800'
                        } border shadow-sm space-y-3 cursor-pointer group transition-all`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-pink-300 font-bold block">
                              {outfit.aesthetic}
                            </span>
                            <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} group-hover:text-pink-300 transition-colors`}>
                              {outfit.title}
                            </h4>
                            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5 line-clamp-1`}>
                              {outfit.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-pink-300">
                              ${totalOutfitPrice}
                            </span>
                            <span className="text-[10px] text-slate-500 block">Total Look</span>
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
                              className="group/item rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-1 flex flex-col justify-between cursor-pointer hover:border-pink-300 transition-colors"
                              title={`View ${item.name}`}
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 mb-1 relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200"
                                />
                                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-pink-300">
                                  ${item.price}
                                </span>
                              </div>
                              <p className={`text-[10px] font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                                {item.name}
                              </p>
                              <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>
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
                      <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                        New Moodboard Collection
                      </h4>
                      <input
                        type="text"
                        placeholder="Collection Name (e.g. Winter Gorpcore)"
                        value={newCollectionTitle}
                        onChange={(e) => setNewCollectionTitle(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        } border text-xs focus:outline-none focus:border-pink-400`}
                      />
                      <input
                        type="text"
                        placeholder="Aesthetic notes / description"
                        value={newCollectionDesc}
                        onChange={(e) => setNewCollectionDesc(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        } border text-xs focus:outline-none focus:border-pink-400`}
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-pink-300 text-black text-xs font-bold hover:bg-pink-200 transition-colors"
                        >
                          Save Moodboard
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreatingCollection(false)}
                          className={`px-3 py-2 rounded-xl border ${
                            isLight ? 'border-slate-300 text-slate-600' : 'border-slate-700 text-slate-400 hover:text-white'
                          } text-xs`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Moodboards Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Greyed-out "New Moodboard" card with little + symbol */}
                    <div
                      onClick={() => setIsCreatingCollection(true)}
                      className={`p-3 rounded-2xl border-2 border-dashed ${
                        isLight
                          ? 'border-slate-300 bg-slate-100/60 hover:bg-slate-200/60 text-slate-500'
                          : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 text-slate-400'
                      } hover:border-pink-300/60 transition-all cursor-pointer group flex flex-col items-center justify-center aspect-square text-center shadow-sm`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-pink-300 group-hover:border-pink-300/60 transition-colors mb-2">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold group-hover:text-pink-300 transition-colors">
                        New Moodboard
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Organize saves
                      </span>
                    </div>

                    {collections.map((col) => {
                      const colItems = wishlistItems.filter((i) => col.itemIds.includes(i.id));
                      const displayItems = colItems.length > 0 ? colItems : INITIAL_CATALOG.slice(0, 4);
                      return (
                        <div
                          key={col.id}
                          onClick={() => setSelectedMoodboardDetail(col)}
                          className={`p-3 rounded-2xl ${
                            isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800'
                          } border transition-all cursor-pointer group flex flex-col justify-between space-y-2.5 shadow-sm`}
                        >
                          {/* 4-Image Mosaic Preview */}
                          <div className="grid grid-cols-2 gap-1 aspect-square rounded-xl overflow-hidden bg-slate-950/80 p-1">
                            {displayItems.slice(0, 4).map((item, idx) => (
                              <div
                                key={idx}
                                className={`rounded-lg overflow-hidden bg-slate-800 relative ${
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
                            <h4
                              className={`text-xs font-bold ${
                                isLight ? 'text-slate-900' : 'text-white'
                              } group-hover:text-pink-300 transition-colors line-clamp-1`}
                            >
                              {col.title}
                            </h4>
                            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} line-clamp-1`}>
                              {col.description}
                            </p>
                            <span className="text-[10px] text-pink-300 font-mono font-semibold mt-1 inline-block">
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
                            isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800'
                          } border transition-all cursor-pointer group flex flex-col justify-between`}
                        >
                          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 mb-2 relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono font-bold text-pink-300 border border-pink-400/30">
                              ${item.price}
                            </span>
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-pink-400/20 backdrop-blur-md text-[9px] font-extrabold text-pink-300 border border-pink-400/40">
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

                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[9px] text-pink-300 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-pink-300" />
                              <span>In Wardrobe</span>
                            </span>
                            <button
                              onClick={() => {
                                addToCart(item);
                                showToast(`Added ${item.name} to cart`, 'Ready to reorder', 'green');
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold transition-colors shadow-sm active:scale-95"
                            >
                              Buy Again
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
                      <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-white mb-1">No purchased items yet</p>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Pieces you check out with on PerFit will automatically appear in your collection tab.
                      </p>
                      <button
                        onClick={() => setActiveTab('swipe')}
                        className="px-4 py-1.5 rounded-xl bg-pink-300 text-black text-xs font-bold"
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
                if (['settings', 'account', 'data', 'stats', 'help'].includes(activeSubView)) {
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
                      className="px-4 py-2 rounded-xl bg-pink-300 text-black text-xs font-bold hover:bg-pink-200 transition-colors"
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
                {/* Greyed-out "New Moodboard" card with little + symbol */}
                <div
                  onClick={() => setIsCreatingCollection(true)}
                  className={`p-4 rounded-2xl border-2 border-dashed ${
                    isLight
                      ? 'border-slate-300 bg-slate-100/60 hover:bg-slate-200/60 text-slate-500'
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 text-slate-400'
                  } hover:border-pink-300/60 transition-all cursor-pointer group flex flex-col items-center justify-center text-center py-6 shadow-sm`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-pink-300 group-hover:border-pink-300/60 transition-colors mb-2">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold group-hover:text-pink-300 transition-colors">
                    New Moodboard
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Organize saves
                  </span>
                </div>

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
                  className="px-3 py-1.5 rounded-xl bg-pink-300 text-black text-xs font-bold flex items-center gap-1.5 hover:bg-pink-200 transition-colors shadow-sm"
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
                          showToast(`Sent fit recommendation to ${f.name}!`, '', 'green');
                        }}
                        className="text-[10px] text-slate-400 hover:text-pink-300 mt-1 underline"
                      >
                        Send Fit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-pink-300 hover:bg-pink-200 active:scale-[0.98] text-black font-black text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-300/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Whats my Aesthetic? Quiz</span>
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

          {/* SUBVIEW: SETTINGS (Includes Privacy Section, Sizing, Daily Limit, Theme) */}
          {activeSubView === 'settings' && (
            <div className="space-y-4">
              {/* Privacy & Profile Visibility Section (Created as requested with visibility controls) */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-pink-300" />
                    <span>Privacy & Profile Visibility</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Control who can view your profile tabs, style archetype, and account security
                  </p>
                </div>

                {/* 1. Outfits Visibility Configuration */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-300 font-semibold">Outfits Tab Visibility</label>
                    <span className="text-[10px] text-pink-300 font-bold capitalize">
                      {userProfile.preferences.outfitsVisibility === 'none'
                        ? 'No One (Private)'
                        : userProfile.preferences.outfitsVisibility === 'friends'
                        ? 'Friends Only'
                        : 'Anyone (Public)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    {[
                      { id: 'anyone', label: 'Anyone' },
                      { id: 'friends', label: 'Friends Only' },
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
                          showToast(`Outfits visibility set to ${opt.label}`, '', 'green');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          (userProfile.preferences.outfitsVisibility || 'anyone') === opt.id
                            ? 'bg-pink-300 text-black shadow-md shadow-pink-300/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Moodboards Visibility Configuration */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-300 font-semibold">Moodboards Tab Visibility</label>
                    <span className="text-[10px] text-pink-300 font-bold capitalize">
                      {userProfile.preferences.moodboardsVisibility === 'none'
                        ? 'No One (Private)'
                        : userProfile.preferences.moodboardsVisibility === 'friends'
                        ? 'Friends Only'
                        : 'Anyone (Public)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    {[
                      { id: 'anyone', label: 'Anyone' },
                      { id: 'friends', label: 'Friends Only' },
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
                          showToast(`Moodboards visibility set to ${opt.label}`, '', 'green');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          (userProfile.preferences.moodboardsVisibility || 'anyone') === opt.id
                            ? 'bg-pink-300 text-black shadow-md shadow-pink-300/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Collection Visibility Configuration */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-300 font-semibold">Collection Tab Visibility</label>
                    <span className="text-[10px] text-pink-300 font-bold capitalize">
                      {userProfile.preferences.collectionsVisibility === 'none'
                        ? 'No One (Private)'
                        : userProfile.preferences.collectionsVisibility === 'friends'
                        ? 'Friends Only'
                        : 'Anyone (Public)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    {[
                      { id: 'anyone', label: 'Anyone' },
                      { id: 'friends', label: 'Friends Only' },
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
                          showToast(`Collection visibility set to ${opt.label}`, '', 'green');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          (userProfile.preferences.collectionsVisibility || 'anyone') === opt.id
                            ? 'bg-pink-300 text-black shadow-md shadow-pink-300/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Moved from Account: Style Archetype Public Visibility Toggle */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                    <div>
                      <p className="font-semibold text-white">Show My Style Archetype on Profile</p>
                      <p className="text-[10px] text-slate-400">Allow style archetype badge to be displayed on your profile</p>
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
                      showToast(e.target.checked ? 'Archetype shown publicly' : 'Archetype hidden from profile', '', 'green');
                    }}
                    className="accent-pink-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 5. Moved from Account: Two-Factor Security (2FA) */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-pink-300" />
                    <div>
                      <p className="font-semibold text-white">Two-Factor Authentication (2FA)</p>
                      <p className="text-[10px] text-slate-400">Require SMS confirmation on new device logins</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => {
                      setTwoFactorAuth(e.target.checked);
                      showToast(e.target.checked ? '2FA Enabled' : '2FA Disabled', '', 'green');
                    }}
                    className="accent-pink-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 6. Profile Search Discoverability */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-300 font-semibold">Profile Search Discoverability</label>
                    <span className="text-[10px] text-pink-300 font-bold capitalize">
                      {userProfile.preferences.profileDiscoverability || 'public'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
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
                          showToast(`Profile discoverability set to ${disc.label}`, '', 'green');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          (userProfile.preferences.profileDiscoverability || 'public') === disc.id
                            ? 'bg-pink-300 text-black shadow-md shadow-pink-300/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {disc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
                    <Mail className="w-3.5 h-3.5 text-pink-300" />
                    <span>Account Email & Communication</span>
                  </h3>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Primary email address associated with your PerFit account and order receipts
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
                    <span className="flex items-center gap-1 text-[10px] text-pink-300 bg-pink-400/15 px-2 py-0.5 rounded-full border border-pink-400/30 font-semibold">
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
                      className="w-full mt-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Mail className="w-3 h-3 text-pink-300" />
                      <span>Change Email Address</span>
                    </button>
                  ) : (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} block`}>
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        placeholder="e.g. yourname@example.com"
                        className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'} border text-xs focus:outline-none focus:border-pink-400`}
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
                          className="flex-1 py-2 rounded-lg bg-pink-300 hover:bg-pink-200 text-black font-extrabold text-[11px] transition-all shadow-sm"
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
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div>
                    <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider flex items-center gap-1.5`}>
                      <CreditCard className="w-3.5 h-3.5 text-pink-300" />
                      <span>Payment Options & Methods</span>
                    </h3>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Manage your default payment card and 1-tap mobile wallets
                    </p>
                  </div>

                  {/* Active Default Card Preview */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-7 rounded-md bg-pink-950/60 border border-pink-400/40 flex items-center justify-center text-pink-300 font-mono font-black text-[10px]">
                        VISA
                      </div>
                      <div>
                        <span className="font-mono font-bold text-white block">
                          {cardNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {cardHolder} • Exp {cardExpiry}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingPayment(!isEditingPayment)}
                      className="text-[10px] text-pink-300 hover:text-pink-200 font-bold px-2 py-1 rounded bg-pink-400/10 border border-pink-400/20"
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
                          className={`w-full px-3 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-400`}
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
                          className={`w-full px-3 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-400`}
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
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-400`}
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
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-400`}
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
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-400`}
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
                        className="w-full mt-1 py-2 rounded-lg bg-pink-300 hover:bg-pink-200 text-black font-extrabold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-pink-300/20"
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
                      className="accent-pink-400 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Other Basic Account Setup: Phone & Shipping Address */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div>
                    <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider flex items-center gap-1.5`}>
                      <MapPin className="w-3.5 h-3.5 text-pink-300" />
                      <span>Delivery & Setup Details</span>
                    </h3>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Shipping address, delivery phone, and account security
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5 mb-1`}>
                      <Phone className="w-3 h-3 text-pink-300" />
                      <span>Phone Number (SMS order & drop tracking)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={`flex-1 px-3 py-1.5 rounded-lg ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-400 font-mono`}
                      />
                      <button
                        onClick={() => {
                          updateUserProfile({ phone: phoneInput });
                          showToast('Phone number saved', '', 'green');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-300 font-bold text-[11px] border border-slate-700"
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
                        className="text-[10px] text-pink-300 hover:underline font-semibold"
                      >
                        {isEditingAddress ? 'Cancel' : 'Edit Address'}
                      </button>
                    </div>

                    {!isEditingAddress ? (
                      <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'} border text-xs`}>
                        <p className="font-semibold text-white">{streetAddress}</p>
                        <p className="text-[11px] text-slate-400">
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
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-400`}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">City</label>
                            <input
                              type="text"
                              value={cityAddress}
                              onChange={(e) => setCityAddress(e.target.value)}
                              className={`w-full px-2 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-400`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">State</label>
                            <input
                              type="text"
                              value={stateAddress}
                              onChange={(e) => setStateAddress(e.target.value)}
                              className={`w-full px-2 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-400`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">ZIP</label>
                            <input
                              type="text"
                              value={zipAddress}
                              onChange={(e) => setZipAddress(e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-pink-400`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Country</label>
                          <select
                            value={countryAddress}
                            onChange={(e) => setCountryAddress(e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-pink-400`}
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
                          className="w-full mt-1 py-2 rounded-lg bg-pink-300 hover:bg-pink-200 text-black font-extrabold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-pink-300/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Delivery Address</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Two-Factor Authentication toggle */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-pink-300" />
                      <div>
                        <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Two-Factor Security (2FA)</p>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Require SMS verification on new logins</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactorAuth}
                      onChange={(e) => {
                        setTwoFactorAuth(e.target.checked);
                        showToast(e.target.checked ? '2FA Enabled' : '2FA Disabled', '', 'green');
                      }}
                      className="accent-pink-400 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* Style Archetype Public Visibility toggle */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                      <div>
                        <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Show My Style Archetype on Profile</p>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Allow or disallow archetype badge to be displayed publicly on your profile page</p>
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
                        showToast(e.target.checked ? 'Archetype shown publicly' : 'Archetype hidden from profile', '', 'green');
                      }}
                      className="accent-pink-400 w-4 h-4 cursor-pointer"
                    />
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
                    {userProfile.name} • <span className="font-mono text-pink-300">{userProfile.handle}</span>
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
                  className="px-3 py-1.5 rounded-xl bg-pink-300 text-black text-xs font-bold hover:bg-pink-200 transition-colors flex-shrink-0 shadow-sm"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
          {activeSubView === 'help' && (
            <div className="space-y-4 text-xs">
              {/* Simplified Overview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-400/20 text-pink-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">How PerFit Works</h3>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  PerFit learns your fashion taste in real-time. Upload street style outfits to dissect garments, or swipe through pieces to refine your 25 aesthetic affinities.
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
                  <HelpCircle className="w-3.5 h-3.5 text-pink-300" />
                  <span>Frequently Asked Questions</span>
                </h3>

                {[
                  {
                    q: 'How does swiping right (Like) or left (Pass) affect my future feed?',
                    a: 'Swiping right tells PerFit to surface more pieces matching that garment’s cut, brand, silhouette, and aesthetic tags. Swiping left gently downweights those traits. Your recommendations get noticeably more tailored every 5–10 swipes.',
                  },
                  {
                    q: 'What is the difference between Single Items and Outfit Bundles?',
                    a: 'By default, the Swipe tab suggests single pieces so you can curate individual wardrobe staples. You can toggle "Bundles Only" or "All Items" in the filter menu to explore complete pre-coordinated outfit sets.',
                  },
                  {
                    q: 'How does the "Hot Right Now" carousel work on the Upload page?',
                    a: 'It automatically tracks the most loved, saved, and purchased pieces across all PerFit members in real-time, giving you quick access to community favorites.',
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
                    a: 'Upload or snap any street-style photo, and PerFit’s computer vision engine breaks the photo down into individual garments (jackets, tops, pants, shoes) and finds matching marketplace pieces.',
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
                          <ChevronUp className="w-4 h-4 text-pink-300 flex-shrink-0" />
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-pink-300 hover:bg-pink-200 text-black font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-300/20 active:scale-[0.98]"
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 relative cursor-default max-h-[92vh] overflow-y-auto"
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
                  <div className="p-1.5 rounded-xl bg-pink-400/20 text-pink-300">
                    <MessageSquarePlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">App Feedback</h3>
                    <p className="text-[10px] text-slate-400">Help us refine and perfect PerFit</p>
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
                            ? 'border-pink-300 bg-pink-950/60 shadow-md shadow-pink-300/20 scale-105'
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
                            ? 'bg-pink-300 text-black shadow-sm'
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackSubmitted(true);
                    showToast('Thank you for your feedback!', 'Your input helps improve PerFit', 'green');
                  }}
                  className="w-full py-3 rounded-2xl bg-pink-300 hover:bg-pink-200 text-black font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-pink-300/25 active:scale-[0.98]"
                >
                  Submit Feedback
                </button>
              </>
            ) : (
              /* Thank You State */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-400/20 border border-pink-400/60 flex items-center justify-center mx-auto text-pink-300">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Thank You for Your Feedback!</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    We truly appreciate you taking the time to share your thoughts. Your feedback directly guides how we train recommendations and build new features for PerFit!
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-950 border-slate-700 text-white'
            } relative cursor-default max-h-[92vh] overflow-y-auto`}
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
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4 pr-10">
              <Edit3 className="w-4 h-4 text-pink-300" />
              <h3 className="font-extrabold text-base">Edit Profile</h3>
            </div>

            {/* Avatar & Photo Change */}
            <div className="flex items-center gap-3.5 mb-5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-400/60 bg-slate-800 flex-shrink-0 relative">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-pink-300 hover:bg-pink-200 text-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
                <p className="text-[10px] text-slate-400 mt-1">Tap to upload a new profile picture</p>
              </div>
            </div>

            {/* Form Fields: Name, Handle, Bio */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-pink-400 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Username Handle
                </label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-pink-300 focus:outline-none focus:border-pink-400 font-mono font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Bio & Style Philosophy
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a short bio about your personal style..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-pink-400 resize-none font-medium leading-relaxed"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateUserProfile({
                    name: editName.trim() || userProfile.name,
                    handle: editHandle.trim() || userProfile.handle,
                    bio: editBio.trim(),
                  });
                  setIsEditProfileOpen(false);
                  showToast('Profile updated!', '', 'green');
                }}
                className="flex-1 py-2.5 rounded-xl bg-pink-300 hover:bg-pink-200 text-black text-xs font-black transition-colors shadow-lg shadow-pink-300/25"
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border ${
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
                src={selectedFriend.coverImage}
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
                    showToast(`Fit recommendation sent to ${selectedFriend.name}!`, '', 'green');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-pink-300 hover:bg-pink-200 text-black text-xs font-bold transition-colors shadow-sm"
                >
                  Send Fit
                </button>
              </div>

              {/* Friend Info: Style archetype in italics under @handle */}
              <div>
                <h3 className="text-lg font-black">{selectedFriend.name}</h3>
                <p className="text-xs font-mono text-pink-300">{selectedFriend.handle}</p>
                <p className="text-xs italic text-pink-300 font-medium pt-0.5">
                  {selectedFriend.styleArchetype}
                </p>
                <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} mt-2 leading-relaxed`}>
                  {selectedFriend.bio}
                </p>
              </div>

              {/* Subheader Counts & Stats */}
              <div className="grid grid-cols-4 gap-1.5 my-3.5 text-center">
                <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'} border`}>
                  <span className="text-xs font-bold text-pink-300 block font-mono">
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
                {selectedFriend.moodboards.map((mb: any, idx: number) => (
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
                    className={`p-3 rounded-2xl ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800'} border space-y-2 cursor-pointer transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{mb.title}</h5>
                      <span className="text-[10px] text-pink-300 font-mono">{mb.items.length} pieces</span>
                    </div>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{mb.description}</p>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {mb.items.map((item: ClothingItem, iIdx: number) => (
                        <div
                          key={iIdx}
                          onClick={() => setInspectItem(item)}
                          className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative cursor-pointer group hover:border-pink-300 transition-colors"
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl p-5 border ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
            } shadow-2xl space-y-4 relative cursor-default max-h-[92vh] overflow-y-auto`}
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
              <span className="text-[10px] uppercase font-mono tracking-widest text-pink-300 font-bold">
                {inspectItem.brand}
              </span>
              <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {inspectItem.name}
              </h3>
            </div>

            <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={inspectItem.image}
                alt={inspectItem.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 font-mono text-sm font-bold text-pink-300 border border-pink-400/30">
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

            <div className="flex gap-2 pt-2">
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
                  toggleWishlist(inspectItem);
                }}
                className={`p-3 rounded-xl border transition-colors ${
                  isItemInWishlist(inspectItem.id)
                    ? 'border-pink-300 bg-pink-950/60 text-pink-300 shadow-md shadow-pink-300/20'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
                title="Toggle Wishlist"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
