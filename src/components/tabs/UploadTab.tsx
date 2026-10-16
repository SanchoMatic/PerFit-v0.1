import React, { useState, useRef, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Bookmark,
  Check,
  Send,
  X,
  Flame,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem } from '../../types';
import { INITIAL_CATALOG } from '../../data/mockCatalog';

type ForYouFeedType = 'new-releases' | 'trending' | 'friends';

interface FeedPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    badge?: string;
  };
  timestamp: string;
  content: string;
  tag?: string;
  item: ClothingItem;
  likes: number;
  comments: number;
  reposts: number;
}

export const UploadTab: React.FC = () => {
  const {
    userProfile,
    addToCart,
    toggleWishlist,
    isItemInWishlist,
    setSendItemModalItem,
    friends,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';

  // Active sub-feed: 'new-releases', 'trending', or 'friends'
  const [activeFeed, setActiveFeed] = useState<ForYouFeedType>('new-releases');
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);

  // Local likes tracking
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});

  const togglePostLike = (postId: string) => {
    setLikedPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Horizontal Twitter-style swipe gesture handling between sub-tabs
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const feedsOrder: ForYouFeedType[] = ['new-releases', 'trending', 'friends'];

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    isHorizontalSwipe.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isHorizontalSwipe.current === false) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy) * 1.2;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isHorizontalSwipe.current !== true) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const currentIndex = feedsOrder.indexOf(activeFeed);

    if (dx < -55 && currentIndex < feedsOrder.length - 1) {
      // Swiped Left -> Advance to next feed
      setActiveFeed(feedsOrder[currentIndex + 1]);
    } else if (dx > 55 && currentIndex > 0) {
      // Swiped Right -> Go to previous feed
      setActiveFeed(feedsOrder[currentIndex - 1]);
    }

    isHorizontalSwipe.current = null;
  };

  // Filter catalog items for feeds
  const catalog = useMemo(() => INITIAL_CATALOG.filter((i) => !i.isBundle), []);

  // 1. Mock Content: New Releases Feed (Chronological fresh drops)
  const newReleasesPosts: FeedPost[] = useMemo(() => {
    return [
      {
        id: 'nr-1',
        author: {
          name: 'Acne Studios',
          handle: 'acnestudios',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: 'Brand Drop',
        },
        timestamp: '18m',
        content: 'Drop 04: The 1996 Distressed Straight Leg. Cut from Japanese selvedge denim with hand-finished stone washing.',
        tag: 'FW26 Capsule',
        item: catalog[0] || INITIAL_CATALOG[0],
        likes: 482,
        comments: 38,
        reposts: 54,
      },
      {
        id: 'nr-2',
        author: {
          name: 'Lemaire Official',
          handle: 'lemaire',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: 'New Release',
        },
        timestamp: '1h',
        content: 'New Arrival: Dry Silk Twisted Collar Shirt. Drapes effortlessly with mother-of-pearl buttons and relaxed drop shoulders.',
        tag: 'Limited Run',
        item: catalog[1] || INITIAL_CATALOG[1],
        likes: 890,
        comments: 67,
        reposts: 112,
      },
      {
        id: 'nr-3',
        author: {
          name: 'Our Legacy Workshop',
          handle: 'ourlegacy',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
          verified: true,
        },
        timestamp: '3h',
        content: 'Just arrived in stores: Brushed Mohair Cardigan in Dusty Olive. Made from custom Italian yarn blend.',
        tag: 'Restock Drop',
        item: catalog[2] || INITIAL_CATALOG[2],
        likes: 1240,
        comments: 94,
        reposts: 180,
      },
      {
        id: 'nr-4',
        author: {
          name: 'Fear of God',
          handle: 'fearofgod',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: 'Official',
        },
        timestamp: '5h',
        content: 'Collection 8 Core Drop: Heavyweight Fleece Hoodie. French terry cotton with silicone brand plaque at hood.',
        tag: 'Core Essentials',
        item: catalog[3] || INITIAL_CATALOG[3],
        likes: 2150,
        comments: 142,
        reposts: 310,
      },
      {
        id: 'nr-5',
        author: {
          name: 'A-COLD-WALL*',
          handle: 'acoldwall',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80',
          verified: true,
        },
        timestamp: '8h',
        content: 'Technical Asymmetrical Utility Vest. Multi-compartment hardware pockets with waterproof taped seams.',
        tag: 'Technical Wear',
        item: catalog[4] || INITIAL_CATALOG[4],
        likes: 980,
        comments: 53,
        reposts: 78,
      },
      {
        id: 'nr-6',
        author: {
          name: 'Maison Margiela',
          handle: 'margiela',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: 'Runway Drop',
        },
        timestamp: '12h',
        content: 'The Replica Low-Top in Paint Splatter Nappa. Finished by hand with paint treatment that wears uniquely with age.',
        tag: 'Iconic',
        item: catalog[5] || INITIAL_CATALOG[5],
        likes: 3420,
        comments: 210,
        reposts: 540,
      },
      {
        id: 'nr-7',
        author: {
          name: 'Kith Classics',
          handle: 'kith',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
          verified: true,
        },
        timestamp: '1d',
        content: 'Winter Palette: Heavy Herringbone Overcoat with satin interior lining and horn buttons.',
        tag: 'Seasonal Drop',
        item: catalog[6] || INITIAL_CATALOG[6],
        likes: 1840,
        comments: 118,
        reposts: 220,
      },
    ];
  }, [catalog]);

  // 2. Mock Content: Trending Feed (Viral fashion moments & hot ranking pieces)
  const trendingPosts: FeedPost[] = useMemo(() => {
    return [
      {
        id: 'trend-1',
        author: {
          name: 'Fashion Intelligence',
          handle: 'fashionintel',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: 'Trend #1',
        },
        timestamp: '2h',
        content: '🔥 Trending #1 this week: Wide pleated wool trousers paired with cropped structured outerwear. Community saves up 340%.',
        tag: 'Top Trend #1',
        item: catalog[7] || catalog[0] || INITIAL_CATALOG[0],
        likes: 5420,
        comments: 312,
        reposts: 890,
      },
      {
        id: 'trend-2',
        author: {
          name: 'Streetwear Daily',
          handle: 'streetweardaily',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: 'Viral Fit',
        },
        timestamp: '4h',
        content: 'The oversized vintage wash bomber silhouette has officially overtaken standard puffers in major cities. Here is the standout piece.',
        tag: 'Viral Piece',
        item: catalog[8] || catalog[1] || INITIAL_CATALOG[1],
        likes: 4180,
        comments: 245,
        reposts: 670,
      },
      {
        id: 'trend-3',
        author: {
          name: 'Curation Bureau',
          handle: 'curationbureau',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: 'Trend #2',
        },
        timestamp: '6h',
        content: 'Gorpcore meets quiet luxury: technical waterproof shells in muted earthy olive tones are the most saved aesthetic this month.',
        tag: 'Most Saved',
        item: catalog[9] || catalog[2] || INITIAL_CATALOG[2],
        likes: 3820,
        comments: 188,
        reposts: 420,
      },
      {
        id: 'trend-4',
        author: {
          name: 'Archive Fashion Hub',
          handle: 'archivehub',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
        },
        timestamp: '10h',
        content: 'Chunky lug-sole derbies and square-toe loafers remain undefeated for transitional styling. Over 2,100 user checkouts this week.',
        tag: 'Footwear Trend',
        item: catalog[10] || catalog[3] || INITIAL_CATALOG[3],
        likes: 2980,
        comments: 140,
        reposts: 330,
      },
      {
        id: 'trend-5',
        author: {
          name: 'Style Forecast',
          handle: 'styleforecast',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          badge: 'Trend #3',
        },
        timestamp: '14h',
        content: 'Mohair blends and open-gauge cardigans are hitting peak engagement on the swipe feed across all age groups.',
        tag: 'Knitwear Surge',
        item: catalog[11] || catalog[4] || INITIAL_CATALOG[4],
        likes: 3670,
        comments: 204,
        reposts: 510,
      },
      {
        id: 'trend-6',
        author: {
          name: 'Aesthetic Index',
          handle: 'aestheticindex',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
        },
        timestamp: '1d',
        content: 'Monochromatic charcoal and espresso brown layered fits are pacing +180% week-over-week. Minimalist luxury is leading the algorithm.',
        tag: 'Palette Trend',
        item: catalog[12] || catalog[5] || INITIAL_CATALOG[5],
        likes: 4890,
        comments: 320,
        reposts: 740,
      },
    ];
  }, [catalog]);

  // 3. Mock Content: Friends Feed (Real-time social style updates from friends)
  const friendsPosts: FeedPost[] = useMemo(() => {
    const friendList = friends && friends.length > 0 ? friends : [
      { id: 'f-1', name: 'Alex Chen', handle: 'alexchen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80' },
      { id: 'f-2', name: 'Mia Tanaka', handle: 'miatanaka', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80' },
      { id: 'f-3', name: 'Jordan Lee', handle: 'jordanlee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80' },
      { id: 'f-4', name: 'Marcus Vance', handle: 'marcusvance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80' },
      { id: 'f-5', name: 'Elena Rostova', handle: 'elenarostova', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80' },
    ];

    return [
      {
        id: 'friend-1',
        author: {
          name: friendList[0]?.name || 'Alex Chen',
          handle: friendList[0]?.handle || 'alexchen',
          avatar: friendList[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          badge: 'Styled Fit',
        },
        timestamp: '25m',
        content: 'Finally unboxed the boxy cropped poplin. The shoulder construction and fabric drape are on another level! ☕️✨',
        tag: 'Wore Today',
        item: catalog[0] || INITIAL_CATALOG[0],
        likes: 42,
        comments: 6,
        reposts: 2,
      },
      {
        id: 'friend-2',
        author: {
          name: friendList[1]?.name || 'Mia Tanaka',
          handle: friendList[1]?.handle || 'miatanaka',
          avatar: friendList[1]?.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
          badge: 'Saved to Wishlist',
        },
        timestamp: '1h',
        content: 'Saved this knit cardigan for fall layering. Should I grab the olive or charcoal colorway?',
        tag: 'Wishlist Pick',
        item: catalog[2] || INITIAL_CATALOG[2],
        likes: 68,
        comments: 14,
        reposts: 3,
      },
      {
        id: 'friend-3',
        author: {
          name: friendList[2]?.name || 'Jordan Lee',
          handle: friendList[2]?.handle || 'jordanlee',
          avatar: friendList[2]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
        },
        timestamp: '3h',
        content: 'Quality check on the selvedge straight legs: 10/10 heavy stiffness with zero break-in discomfort. Highly recommend.',
        tag: 'Review',
        item: catalog[1] || INITIAL_CATALOG[1],
        likes: 95,
        comments: 11,
        reposts: 5,
      },
      {
        id: 'friend-4',
        author: {
          name: friendList[3]?.name || 'Marcus Vance',
          handle: friendList[3]?.handle || 'marcusvance',
          avatar: friendList[3]?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
          badge: 'Added to Cart',
        },
        timestamp: '5h',
        content: 'Copped the heavyweight hoodie during the morning restock before it sells out again. 🔥',
        tag: 'Just Purchased',
        item: catalog[3] || INITIAL_CATALOG[3],
        likes: 124,
        comments: 18,
        reposts: 4,
      },
      {
        id: 'friend-5',
        author: {
          name: friendList[4]?.name || 'Elena Rostova',
          handle: friendList[4]?.handle || 'elenarostova',
          avatar: friendList[4]?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
        },
        timestamp: '9h',
        content: 'Sunday museum fit breakdown: minimalist structured coat paired with pleated trousers and leather Chelsea boots.',
        tag: 'Fit Inspiration',
        item: catalog[4] || INITIAL_CATALOG[4],
        likes: 156,
        comments: 23,
        reposts: 9,
      },
      {
        id: 'friend-6',
        author: {
          name: friendList[0]?.name || 'Alex Chen',
          handle: friendList[0]?.handle || 'alexchen',
          avatar: friendList[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        },
        timestamp: '1d',
        content: 'Dissected an outfit from street fashion week using the camera tool. Matched with these exact trousers.',
        tag: 'Look Dissection',
        item: catalog[5] || INITIAL_CATALOG[5],
        likes: 88,
        comments: 9,
        reposts: 6,
      },
    ];
  }, [catalog, friends]);

  // Current active posts depending on sub-tab
  const currentPosts =
    activeFeed === 'new-releases'
      ? newReleasesPosts
      : activeFeed === 'trending'
      ? trendingPosts
      : friendsPosts;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen pb-32 max-w-md mx-auto select-none"
    >
      {/* Twitter-Style Sticky Top Nav Bar with 3 Horizontal Feeds */}
      <header
        className={`sticky top-0 z-40 ${
          isLight ? 'bg-white/85 border-slate-200' : 'bg-slate-950/85 border-slate-800'
        } backdrop-blur-xl border-b pt-[max(10px,env(safe-area-inset-top))] transition-colors`}
      >
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-base font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              For You
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              isLight ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-pink-950/60 text-pink-400 border border-pink-600/40'
            }`}>
              Feed
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Swipe left / right to switch
          </span>
        </div>

        {/* 3 Horizontal Sub-Tabs: New Releases, Trending, Friends (Twitter style) */}
        <div className="grid grid-cols-3 text-center relative border-t border-slate-800/20">
          <button
            type="button"
            onClick={() => setActiveFeed('new-releases')}
            className={`py-3 text-xs font-black tracking-wide transition-colors relative cursor-pointer ${
              activeFeed === 'new-releases'
                ? isLight
                  ? 'text-slate-950 font-extrabold'
                  : 'text-white font-extrabold'
                : isLight
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>New Releases</span>
            {activeFeed === 'new-releases' && (
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full ${
                isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'
              } shadow-sm animate-in fade-in duration-150`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveFeed('trending')}
            className={`py-3 text-xs font-black tracking-wide transition-colors relative cursor-pointer ${
              activeFeed === 'trending'
                ? isLight
                  ? 'text-slate-950 font-extrabold'
                  : 'text-white font-extrabold'
                : isLight
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Trending</span>
            </span>
            {activeFeed === 'trending' && (
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full ${
                isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'
              } shadow-sm animate-in fade-in duration-150`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveFeed('friends')}
            className={`py-3 text-xs font-black tracking-wide transition-colors relative cursor-pointer ${
              activeFeed === 'friends'
                ? isLight
                  ? 'text-slate-950 font-extrabold'
                  : 'text-white font-extrabold'
                : isLight
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Friends</span>
            {activeFeed === 'friends' && (
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full ${
                isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'
              } shadow-sm animate-in fade-in duration-150`} />
            )}
          </button>
        </div>
      </header>

      {/* Main Twitter-Style Scroll Feed Container */}
      <div className="divide-y divide-slate-800/40">
        {currentPosts.map((post) => {
          const isLiked = Boolean(likedPostIds[post.id]);
          const isWishlisted = isItemInWishlist(post.item.id);

          return (
            <article
              key={post.id}
              className={`p-4 transition-colors hover:bg-slate-900/10 ${
                isLight ? 'border-b border-slate-100 hover:bg-slate-50/70' : 'border-b border-slate-900 hover:bg-slate-900/30'
              }`}
            >
              {/* Author Row */}
              <div className="flex items-start gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-700/60 shadow-sm"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {post.author.name}
                      </span>
                      {post.author.verified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-pink-500 flex items-center justify-center text-white text-[9px] font-black flex-shrink-0">
                          ✓
                        </span>
                      )}
                      <span className="text-xs text-slate-400 truncate">
                        @{post.author.handle}
                      </span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {post.timestamp}
                      </span>
                    </div>

                    {post.author.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${
                        post.author.badge.includes('Trend')
                          ? 'bg-red-950/70 text-red-400 border border-red-500/40'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {post.author.badge}
                      </span>
                    )}
                  </div>

                  {/* Caption / Post Text */}
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    {post.content}
                  </p>

                  {/* Tag Pill if applicable */}
                  {post.tag && (
                    <div className="mt-1.5 mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        isLight ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-pink-950/50 text-pink-400 border border-pink-500/30'
                      }`}>
                        #{post.tag}
                      </span>
                    </div>
                  )}

                  {/* Garment Product Card Attachment (Twitter style embed) */}
                  <div
                    onClick={() => setInspectItem(post.item)}
                    className={`mt-2 rounded-2xl overflow-hidden border ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-md'
                    } cursor-pointer group transition-all`}
                  >
                    <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                      <img
                        src={post.item.image}
                        alt={post.item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Price badge */}
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md font-mono text-xs font-bold text-emerald-400 border border-emerald-400/30 shadow-md">
                        ${post.item.price}
                      </span>

                      {/* Brand badge */}
                      <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLight ? 'cosmic-gradient-bg-light' : 'cosmic-gradient-bg'
                      } text-white shadow-md`}>
                        {post.item.brand}
                      </span>
                    </div>

                    <div className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {post.item.name}
                        </h4>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>
                          {post.item.material} • {post.item.fit}
                        </p>
                      </div>

                      {/* Quick Add To Cart Button with smooth toss and no notification toast banner */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(post.item);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black text-xs font-black transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer flex-shrink-0"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Cart</span>
                      </button>
                    </div>
                  </div>

                  {/* Twitter Action Bar: Comments, Repost, Like, Bookmark, Send */}
                  <div className="flex items-center justify-between mt-3 text-slate-400 max-w-sm">
                    {/* Comments */}
                    <button
                      type="button"
                      onClick={() => setInspectItem(post.item)}
                      className="flex items-center gap-1.5 text-xs hover:text-sky-400 transition-colors group cursor-pointer"
                      title="Comments"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-sky-500/10">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[11px]">{post.comments}</span>
                    </button>

                    {/* Repost / Share */}
                    <button
                      type="button"
                      onClick={() => setSendItemModalItem(post.item)}
                      className="flex items-center gap-1.5 text-xs hover:text-emerald-400 transition-colors group cursor-pointer"
                      title="Share with Friend"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-[11px]">{post.reposts}</span>
                    </button>

                    {/* Like Heart */}
                    <button
                      type="button"
                      onClick={() => togglePostLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors group cursor-pointer ${
                        isLiked ? 'text-pink-500' : 'hover:text-pink-500'
                      }`}
                      title="Like"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-pink-500/10">
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                      </div>
                      <span className="text-[11px]">
                        {post.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>

                    {/* Bookmark / Wishlist */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(post.item)}
                      className={`flex items-center gap-1.5 text-xs transition-colors group cursor-pointer ${
                        isWishlisted ? 'text-pink-500' : 'hover:text-pink-500'
                      }`}
                      title={isWishlisted ? 'In Wishlist' : 'Save to Wishlist'}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-pink-500/10">
                        <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
                      </div>
                    </button>

                    {/* Send via Direct Message */}
                    <button
                      type="button"
                      onClick={() => setSendItemModalItem(post.item)}
                      className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Send via Chat"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
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
