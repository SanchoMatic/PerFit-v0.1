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
    wishlistItems,
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
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [activeCollectionDetailId, setActiveCollectionDetailId] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);

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
    setIsQuizOpen(false);
    setIsFeedbackOpen(false);
    setIsEditProfileOpen(false);
    setShowResetConfirm(false);
    setSelectedFriend(null);
    setInspectItem(null);
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
      joinedDate: 'Joined Jan 2024',
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
      joinedDate: 'Joined Aug 2023',
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
      joinedDate: 'Joined Nov 2023',
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

      {activeSubView === 'none' ? (
        <div className="page-slide-forward -mx-4 -mt-4">
          {/* 1. Header Background Banner Image (Pinterest / Instagram profile mix) */}
          <div className="relative h-44 w-full overflow-hidden bg-slate-900 border-b border-slate-800">
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
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-emerald-400 hover:border-emerald-400 transition-all shadow-lg z-10"
              title="Settings & Menu"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Upload Header Background Image Option */}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3.5 px-2.5 py-1 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md z-10"
              title="Change Banner Photo"
            >
              <Camera className="w-3 h-3 text-emerald-400" />
              <span>Change Banner</span>
            </button>
          </div>

          <div className="px-4">
            {/* 2. Avatar Overlapping Cover & Edit Profile Button */}
            <div className="flex items-end justify-between -mt-12 mb-3">
              {/* Interactive Circular Avatar */}
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="relative cursor-pointer group"
                title="Tap to change profile photo"
              >
                <div
                  className={`w-24 h-24 rounded-full ${
                    isLight ? 'bg-slate-200 border-white ring-slate-300' : 'bg-slate-800 border-black ring-slate-800'
                  } border-4 ring-2 group-hover:ring-emerald-400 flex items-center justify-center overflow-hidden shadow-2xl transition-all`}
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

                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-400 ring-2 ring-black flex items-center justify-center shadow-md">
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
                } border hover:border-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm`}
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* 3. User Name & Handle (Removed actual header saying 'Profile') */}
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
              <p className="text-xs font-mono text-emerald-400 font-medium">{userProfile.handle}</p>
            </div>

            {/* Bio text */}
            {userProfile.bio && (
              <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} mt-2 leading-relaxed`}>
                {userProfile.bio}
              </p>
            )}

            {/* 4. Subheader Basic Counts: Friends (button), Outfits, Joined Date */}
            <div className="flex items-center gap-2 mt-3.5 pb-4 border-b border-slate-800/80">
              {/* Friends button like a regular social media account that opens friends window */}
              <button
                onClick={() => setActiveSubView('friends')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
                } border transition-all text-xs group`}
                title="View Friends"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
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
                <span className="font-extrabold font-mono">24</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Outfits</span>
              </div>

              {/* Month/Year Joined App */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                  isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                } border text-xs`}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-medium">{userProfile.joinedDate || 'Joined May 2024'}</span>
              </div>
            </div>

            {/* 5. My Style Archetype (Changed title; toggleable via Account settings) */}
            {userProfile.preferences.showArchetypePublicly !== false && (
              <div
                className={`my-4 p-3.5 rounded-2xl ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                } border flex items-center justify-between shadow-sm`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      My Style Archetype
                    </p>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Minimal Utilitarian / Gorpcore
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSubView('data')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  } border text-xs font-bold transition-colors shadow-sm`}
                  title="Tune Algorithm Weights"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Tune</span>
                </button>
              </div>
            )}

            {/* 6. MAIN CONTENT: Collections / Moodboards (Pinterest & Instagram Style) */}
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-sm font-black tracking-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    } flex items-center gap-1.5`}
                  >
                    <FolderHeart className="w-4 h-4 text-emerald-400" />
                    <span>Moodboards & Collections</span>
                  </h2>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Curated aesthetic capsules and outfits
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingCollection(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Moodboard</span>
                </button>
              </div>

              {/* Inline Create Moodboard Form */}
              {isCreatingCollection && (
                <form
                  onSubmit={handleCreateCollectionSubmit}
                  className={`p-4 rounded-2xl ${
                    isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-700'
                  } border space-y-3 animate-in fade-in duration-150`}
                >
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    New Moodboard Collection
                  </h4>
                  <input
                    type="text"
                    placeholder="Collection Name (e.g. Winter Gorpcore)"
                    value={newCollectionTitle}
                    onChange={(e) => setNewCollectionTitle(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    } border text-xs focus:outline-none focus:border-emerald-500`}
                  />
                  <input
                    type="text"
                    placeholder="Aesthetic notes / description"
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    } border text-xs focus:outline-none focus:border-emerald-500`}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors"
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

              {/* Pinterest-style Moodboards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {collections.map((col) => {
                  const colItems = wishlistItems.filter((i) => col.itemIds.includes(i.id));
                  const displayItems = colItems.length > 0 ? colItems : INITIAL_CATALOG.slice(0, 4);
                  return (
                    <div
                      key={col.id}
                      onClick={() => {
                        setActiveCollectionDetailId(col.id);
                        setActiveSubView('collections');
                      }}
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
                          } group-hover:text-emerald-400 transition-colors line-clamp-1`}
                        >
                          {col.title}
                        </h4>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} line-clamp-1`}>
                          {col.description}
                        </p>
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold mt-1 inline-block">
                          {colItems.length} pieces
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Saved Aesthetic Pins Gallery */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className={`text-xs font-bold uppercase ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    } tracking-wider flex items-center gap-1.5`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved Pins ({wishlistItems.length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className="text-[10px] text-emerald-400 hover:underline font-bold"
                  >
                    View All in Wishlist →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {wishlistItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setInspectItem(item)}
                      className={`p-2 rounded-2xl ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800'
                      } border transition-all cursor-pointer group`}
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 mb-2 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-mono font-bold text-emerald-400">
                          ${item.price}
                        </span>
                      </div>
                      <p className={`text-[11px] font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                        {item.name}
                      </p>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>
                        {item.brand}
                      </p>
                    </div>
                  ))}
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
                          ? 'bg-slate-200 text-slate-700 group-hover:text-emerald-600'
                          : 'bg-slate-800 text-slate-300 group-hover:text-emerald-400'
                      } transition-colors`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span
                        className={`text-sm font-extrabold ${
                          isLight
                            ? 'text-slate-900 group-hover:text-emerald-600'
                            : 'text-white group-hover:text-emerald-300'
                        } transition-colors block`}
                      >
                        {item.title}
                      </span>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-tight`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Your Moodboards</h3>
                  <p className="text-[11px] text-slate-400">
                    Organize saved pieces into aesthetic collections
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingCollection(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold flex items-center gap-1 hover:bg-emerald-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Moodboard</span>
                </button>
              </div>

              {/* Create Collection Modal */}
              {isCreatingCollection && (
                <form
                  onSubmit={handleCreateCollectionSubmit}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3"
                >
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    New Collection
                  </h4>
                  <input
                    type="text"
                    placeholder="Collection Name (e.g. Winter Layers)"
                    value={newCollectionTitle}
                    onChange={(e) => setNewCollectionTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Description / Aesthetic note"
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400"
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
                {collections.map((col) => {
                  const colItems = wishlistItems.filter((i) => col.itemIds.includes(i.id));
                  return (
                    <div
                      key={col.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{col.title}</h4>
                          <p className="text-xs text-slate-400">{col.description}</p>
                          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 inline-block">
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
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-400"
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
                    className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-emerald-400 transition-colors"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-black" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
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
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40 font-mono block">
                        {f.matchScore}% Match
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast(`Sent fit recommendation to ${f.name}!`, '', 'green');
                        }}
                        className="text-[10px] text-slate-400 hover:text-emerald-400 mt-1 underline"
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
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-center">
                  <span className="text-2xl font-black text-emerald-400 font-mono block">
                    {algorithmProfile.likeCount}
                  </span>
                  <span className="text-[10px] text-emerald-300 uppercase font-bold">Liked</span>
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
                <span className="text-lg font-black text-emerald-400 font-mono">
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
                          <span className="text-emerald-400 font-mono font-bold">{weight}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${weight}%` }}
                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
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
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-lg shadow-emerald-950/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
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
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Whats my Aesthetic? Quiz</span>
                </button>
              </div>

              {/* Aesthetic Sliders */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
                  <span>Aesthetic Weight Sliders (25 Trends)</span>
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {Object.entries(algorithmProfile.aestheticWeights).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-200">{key}</span>
                        <span className="font-mono text-emerald-400 font-bold">{value}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={value}
                        onChange={(e) =>
                          updateAlgorithmWeight('aesthetic', key, parseInt(e.target.value, 10))
                        }
                        className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
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
                        <span className="font-mono text-emerald-400 font-bold">{value}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={value}
                        onChange={(e) =>
                          updateAlgorithmWeight('color', key, parseInt(e.target.value, 10))
                        }
                        className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
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

          {/* SUBVIEW: SETTINGS (Includes Tall Tops, Full US/EU Shoe Sizes, and Daily Swipe Limit) */}
          {activeSubView === 'settings' && (
            <div className="space-y-4">
              {/* Daily Swipe Limit Configuration */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Daily Swipe Limit</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Set a personal daily curation goal (can be bypassed anytime)
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
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
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
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
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
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
                              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
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
                    <span className="text-[10px] text-emerald-400 font-semibold">
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
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
                    <span className="text-[10px] text-emerald-400 font-medium capitalize">
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
                              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
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
                    className="accent-emerald-400 w-4 h-4 cursor-pointer"
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
                    className="accent-emerald-400 w-4 h-4 cursor-pointer"
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
                    className="accent-emerald-400 w-4 h-4 cursor-pointer"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
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
                    className="accent-emerald-400 w-4 h-4 cursor-pointer"
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
                    className="accent-emerald-400 w-4 h-4 cursor-pointer"
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
                    className="accent-emerald-400 w-4 h-4 cursor-pointer"
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
                    <span className="text-xs font-black text-emerald-400">
                      {userProfile.membership}
                    </span>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Unlimited AI outfit dissections & priority marketplace drops
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
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
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
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
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
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
                      <Mail className="w-3 h-3 text-emerald-400" />
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
                        className={`w-full px-3 py-2 rounded-xl ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'} border text-xs focus:outline-none focus:border-emerald-500`}
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
                          className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] transition-all shadow-sm"
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
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Payment Options & Methods</span>
                    </h3>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Manage your default payment card and 1-tap mobile wallets
                    </p>
                  </div>

                  {/* Active Default Card Preview */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-7 rounded-md bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-black text-[10px]">
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
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20"
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
                          className={`w-full px-3 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-emerald-500`}
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
                          className={`w-full px-3 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-emerald-500`}
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
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-emerald-500`}
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
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-emerald-500`}
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
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-emerald-500`}
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
                        className="w-full mt-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] transition-all flex items-center justify-center gap-1.5"
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
                      className="accent-emerald-400 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Other Basic Account Setup: Phone & Shipping Address */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div>
                    <h3 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider flex items-center gap-1.5`}>
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Delivery & Setup Details</span>
                    </h3>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Shipping address, delivery phone, and account security
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5 mb-1`}>
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Phone Number (SMS order & drop tracking)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={`flex-1 px-3 py-1.5 rounded-lg ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-emerald-500 font-mono`}
                      />
                      <button
                        onClick={() => {
                          updateUserProfile({ phone: phoneInput });
                          showToast('Phone number saved', '', 'green');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] border border-slate-700"
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
                        className="text-[10px] text-emerald-400 hover:underline font-semibold"
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
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-emerald-500`}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">City</label>
                            <input
                              type="text"
                              value={cityAddress}
                              onChange={(e) => setCityAddress(e.target.value)}
                              className={`w-full px-2 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-emerald-500`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">State</label>
                            <input
                              type="text"
                              value={stateAddress}
                              onChange={(e) => setStateAddress(e.target.value)}
                              className={`w-full px-2 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-emerald-500`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">ZIP</label>
                            <input
                              type="text"
                              value={zipAddress}
                              onChange={(e) => setZipAddress(e.target.value)}
                              className={`w-full px-2 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs font-mono focus:outline-none focus:border-emerald-500`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Country</label>
                          <select
                            value={countryAddress}
                            onChange={(e) => setCountryAddress(e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border text-xs focus:outline-none focus:border-emerald-500`}
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
                          className="w-full mt-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] transition-all flex items-center justify-center gap-1.5"
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
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
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
                      className="accent-emerald-400 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* Style Archetype Public Visibility toggle */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
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
                      className="accent-emerald-400 w-4 h-4 cursor-pointer"
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
                    {userProfile.name} • <span className="font-mono text-emerald-400">{userProfile.handle}</span>
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
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors flex-shrink-0"
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
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
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
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
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
                          <ChevronUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {!feedbackSubmitted ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <MessageSquarePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">App Feedback</h3>
                      <p className="text-[10px] text-slate-400">Help us refine and perfect PerFit</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFeedbackOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
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
                            ? 'border-emerald-500 bg-emerald-950/60 shadow-md shadow-emerald-500/20 scale-105'
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
                            ? 'bg-emerald-500 text-black shadow-sm'
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackSubmitted(true);
                    showToast('Thank you for your feedback!', 'Your input helps improve PerFit', 'green');
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                >
                  Submit Feedback
                </button>
              </>
            ) : (
              /* Thank You State */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-950 border-slate-700 text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-base">Edit Profile</h3>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar & Photo Change */}
            <div className="flex items-center gap-3.5 mb-5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500/60 bg-slate-800 flex-shrink-0 relative">
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
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 font-medium"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono font-medium"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 resize-none font-medium leading-relaxed"
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
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-colors shadow-lg shadow-emerald-500/25"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friend Profile Modal / Page */}
      {selectedFriend && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 page-slide-forward">
          <div
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
            } shadow-2xl relative scrollbar-none`}
          >
            {/* Friend Cover Banner */}
            <div className="relative h-36 w-full overflow-hidden bg-slate-900">
              <img
                src={selectedFriend.coverImage}
                alt={selectedFriend.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              <button
                onClick={() => setSelectedFriend(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm border border-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-6">
              {/* Avatar overlapping banner */}
              <div className="flex items-end justify-between -mt-10 mb-2">
                <div className="w-20 h-20 rounded-full border-4 border-black overflow-hidden bg-slate-800 shadow-xl">
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
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors shadow-sm"
                >
                  Send Fit
                </button>
              </div>

              {/* Friend Info */}
              <div>
                <h3 className="text-lg font-black">{selectedFriend.name}</h3>
                <p className="text-xs font-mono text-emerald-400">{selectedFriend.handle}</p>
                <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} mt-2 leading-relaxed`}>
                  {selectedFriend.bio}
                </p>
              </div>

              {/* Subheader Counts & Stats */}
              <div className="grid grid-cols-4 gap-1.5 my-3.5 text-center">
                <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'} border`}>
                  <span className="text-xs font-bold text-emerald-400 block font-mono">
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

              {/* Style Archetype Badge */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block">Style Archetype</span>
                    <span className="text-xs font-bold text-white">{selectedFriend.styleArchetype}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Fav: {selectedFriend.favoriteBrand}</span>
              </div>

              {/* Friend's Curated Moodboards */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} tracking-wider`}>
                  Curated Moodboards ({selectedFriend.moodboards.length})
                </h4>
                {selectedFriend.moodboards.map((mb: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'} border space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{mb.title}</h5>
                      <span className="text-[10px] text-emerald-400 font-mono">{mb.items.length} pieces</span>
                    </div>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{mb.description}</p>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {mb.items.map((item: ClothingItem, iIdx: number) => (
                        <div
                          key={iIdx}
                          onClick={() => setInspectItem(item)}
                          className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative cursor-pointer group"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 page-slide-forward">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
            } shadow-2xl space-y-4`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                  {inspectItem.brand}
                </span>
                <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {inspectItem.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 rounded-full bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 relative">
              <img
                src={inspectItem.image}
                alt={inspectItem.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 font-mono text-sm font-bold text-emerald-400">
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
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
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
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
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
