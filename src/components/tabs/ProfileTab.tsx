import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type ProfileSubView =
  | 'none'
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
    resetAlgorithm,
    collections,
    createCollection,
    wishlistItems,
    addToCart,
    showToast,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<ProfileSubView>('none');
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [activeCollectionDetailId, setActiveCollectionDetailId] = useState<string | null>(null);

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

  // Friends mock data
  const friends = [
    {
      id: 'f-1',
      name: 'Julian Vance',
      handle: '@julian_arch',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      matchScore: 94,
      favoriteBrand: "Arc'teryx",
      sharedItems: 12,
    },
    {
      id: 'f-2',
      name: 'Maya Chen',
      handle: '@chen_archive',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      matchScore: 89,
      favoriteBrand: 'Acne Studios',
      sharedItems: 8,
    },
    {
      id: 'f-3',
      name: 'Darius Thorne',
      handle: '@darius_fit',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      matchScore: 82,
      favoriteBrand: 'Rick Owens',
      sharedItems: 5,
    },
  ];

  // Menu items matching sketch in IMG_0317 plus Collections as requested
  const menuItems: Array<{
    id: ProfileSubView;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'collections',
      title: 'Collections',
      description: 'Curated moodboards & wardrobe archives',
      icon: FolderHeart,
    },
    {
      id: 'friends',
      title: 'Friends',
      description: 'Shared closets & style compatibility',
      icon: Users,
    },
    {
      id: 'stats',
      title: 'Stats',
      description: 'Swipe activity & style breakdown',
      icon: BarChart3,
    },
    {
      id: 'data',
      title: 'Data',
      description: 'Recommendation algorithm weights & taste profile',
      icon: Database,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Sizing, tall options & daily limits',
      icon: SettingsIcon,
    },
    {
      id: 'account',
      title: 'Account',
      description: 'Profile details & membership',
      icon: UserCheck,
    },
    {
      id: 'help',
      title: 'Help',
      description: 'AI outfit recognition guide & support',
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

      {activeSubView === 'none' ? (
        <div>
          {/* Top Profile Header - Exact layout as drawn in sketch IMG_0317:
              - Circular avatar on left (now interactive for photo upload)
              - "Profile" title
          */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-slate-800">
            {/* Interactive Circular Avatar */}
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative cursor-pointer group"
              title="Tap to change profile photo"
            >
              <div className="w-20 h-20 rounded-full bg-slate-700/80 border-2 border-slate-500 group-hover:border-emerald-400 flex items-center justify-center overflow-hidden shadow-lg shadow-black/50 transition-colors">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/80 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-slate-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Camera Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>

              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-black flex items-center justify-center">
                <Camera className="w-2.5 h-2.5 text-black" />
              </span>
            </div>

            {/* Profile Title & Handle */}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Profile</span>
              </h1>
              <p className="text-sm font-bold text-emerald-400">{userProfile.name}</p>
              <p className="text-xs text-slate-400 font-mono">{userProfile.handle}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {userProfile.membership}
                </span>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-[10px] text-emerald-400 hover:underline font-semibold"
                >
                  Edit Photo
                </button>
              </div>
            </div>
          </div>

          {/* Taste Archetype preview */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Active Style Archetype</p>
                <p className="text-[11px] text-slate-400">Minimal Utilitarian / Gorpcore</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubView('data')}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
            >
              Tune AI &rarr;
            </button>
          </div>

          {/* Chevron Navigation Menu - Exact match to sketch plus Collections:
              > Collections
              > Friends
              > Stats
              > Data
              > Settings
              > Account
              > Help
          */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubView(item.id)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 transition-all duration-200 group text-left shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:text-emerald-400 group-hover:bg-slate-700/80 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Subview Detail Page */
        <div className="animate-in fade-in slide-in-from-right-4 duration-200">
          {/* Back Navigation Bar */}
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
            <button
              onClick={() => {
                setActiveSubView('none');
                setActiveCollectionDetailId(null);
              }}
              className="p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-extrabold text-white capitalize">
                {activeSubView}
              </h2>
              <p className="text-[11px] text-slate-400">Wardrobe & Style Preferences</p>
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
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={f.avatar}
                        alt={f.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{f.name}</h4>
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
                        onClick={() =>
                          showToast(`Sent fit recommendation to ${f.name}!`, '', 'green')
                        }
                        className="text-[10px] text-slate-400 hover:text-white mt-1 underline"
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
                <div>
                  <p className="text-xs font-bold text-white">Outfits Dissected with AI</p>
                  <p className="text-[10px] text-slate-400">Garments ingested into recommendation model</p>
                </div>
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
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Neural Taste Matrix</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Weights update automatically when you swipe or dissect outfits
                  </p>
                </div>
                <button
                  onClick={resetAlgorithm}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-[10px] text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Aesthetic Sliders */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
                  <span>Aesthetic Weight Sliders</span>
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <div className="space-y-3">
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
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Account Details
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => updateUserProfile({ name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Handle</label>
                  <input
                    type="text"
                    value={userProfile.handle}
                    onChange={(e) => updateUserProfile({ handle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={userProfile.bio}
                    onChange={(e) => updateUserProfile({ bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Membership Tier
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-emerald-400">
                      {userProfile.membership}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Unlimited AI outfit dissections & priority marketplace drops
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUBVIEW: HELP */}
          {activeSubView === 'help' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-white mb-1">How does PerFit AI Dissection work?</h3>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  When you upload an outfit photo in the Upload tab, multimodal computer vision
                  dissects each garment (tops, cargo pants, trail runners, accessories) and searches
                  the live marketplace catalog for matching pieces.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-white mb-1">Recommendation Engine</h3>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Every swipe right (or like) enhances the weighting of that garment's brand,
                  silhouette, color, and aesthetic. You can fine-tune these weights anytime in the Data
                  section.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
