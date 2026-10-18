import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  ArrowLeft,
  Eye,
  CornerDownRight,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClothingItem } from '../../types';
import { INITIAL_CATALOG } from '../../data/mockCatalog';

type ForYouFeedType = 'new-releases' | 'trending' | 'friends';

interface FeedComment {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  timestamp: string;
  text: string;
  likes: number;
}

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
  mockComments?: FeedComment[];
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
  const [isFeedFading, setIsFeedFading] = useState(false);
  const [swipeOpacity, setSwipeOpacity] = useState(1);

  // Single dedicated Post window view
  const [activePostDetail, setActivePostDetail] = useState<FeedPost | null>(null);
  const [detailSwipeX, setDetailSwipeX] = useState(0);
  const [isDetailDismissing, setIsDetailDismissing] = useState(false);
  const [replyInputText, setReplyInputText] = useState('');
  const [localReplies, setLocalReplies] = useState<Record<string, FeedComment[]>>({});

  // Fullscreen media viewer with show/hide minimalist UI (Twitter / Facebook style)
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    name: string;
    brand: string;
    item: ClothingItem;
  } | null>(null);
  const [isViewerUiVisible, setIsViewerUiVisible] = useState(true);

  // Local likes tracking
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  // Local reposts tracking
  const [repostedPostIds, setRepostedPostIds] = useState<Record<string, boolean>>({});

  const togglePostLike = (postId: string) => {
    setLikedPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleRepost = (postId: string) => {
    setRepostedPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Change tab with smooth cross-fade transition
  const switchFeedWithFade = (newFeed: ForYouFeedType) => {
    if (newFeed === activeFeed) return;
    setIsFeedFading(true);
    setSwipeOpacity(0.3);
    setTimeout(() => {
      setActiveFeed(newFeed);
      setSwipeOpacity(1);
      setTimeout(() => {
        setIsFeedFading(false);
      }, 150);
    }, 120);
  };

  // Horizontal Twitter-style swipe gesture handling with gradual fading
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

    if (isHorizontalSwipe.current === true) {
      // Gradually fade out as user drags across feeds in either direction
      const progress = Math.min(1, Math.abs(dx) / 140);
      const calculatedOpacity = Math.max(0.35, 1 - progress * 0.65);
      setSwipeOpacity(calculatedOpacity);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isHorizontalSwipe.current !== true) {
      setSwipeOpacity(1);
      return;
    }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const currentIndex = feedsOrder.indexOf(activeFeed);

    if (dx < -55 && currentIndex < feedsOrder.length - 1) {
      // Swiped Left -> Advance to next feed with smooth fade
      switchFeedWithFade(feedsOrder[currentIndex + 1]);
    } else if (dx > 55 && currentIndex > 0) {
      // Swiped Right -> Go to previous feed with smooth fade
      switchFeedWithFade(feedsOrder[currentIndex - 1]);
    } else {
      // Snap back smoothly
      setSwipeOpacity(1);
    }

    isHorizontalSwipe.current = null;
  };

  // Swipe-back gesture handling for single Post detail window
  const detailTouchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDetailSwipingBack = useRef<boolean | null>(null);

  const handleDetailTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    detailTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
    isDetailSwipingBack.current = null;
  };

  const handleDetailTouchMove = (e: React.TouchEvent) => {
    if (isDetailSwipingBack.current === false) return;
    const touch = e.touches[0];
    const dx = touch.clientX - detailTouchStartRef.current.x;
    const dy = touch.clientY - detailTouchStartRef.current.y;

    if (isDetailSwipingBack.current === null) {
      // Only trigger if starting swipe from left toward right
      if (dx > 10 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        isDetailSwipingBack.current = true;
      } else if (Math.abs(dy) > 10) {
        isDetailSwipingBack.current = false;
      }
    }

    if (isDetailSwipingBack.current === true && dx > 0) {
      setDetailSwipeX(dx);
    }
  };

  const handleDetailTouchEnd = (e: React.TouchEvent) => {
    if (isDetailSwipingBack.current === true) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - detailTouchStartRef.current.x;
      if (dx > 75) {
        // Dismiss and smoothly return to main feed
        setIsDetailDismissing(true);
        setDetailSwipeX(window.innerWidth || 450);
        setTimeout(() => {
          setActivePostDetail(null);
          setDetailSwipeX(0);
          setIsDetailDismissing(false);
        }, 220);
      } else {
        setDetailSwipeX(0);
      }
    }
    isDetailSwipingBack.current = null;
  };

  // Close post detail view smoothly
  const closePostDetail = () => {
    setIsDetailDismissing(true);
    setDetailSwipeX(window.innerWidth || 450);
    setTimeout(() => {
      setActivePostDetail(null);
      setDetailSwipeX(0);
      setIsDetailDismissing(false);
    }, 220);
  };

  // Add local comment in single post view
  const handleAddReply = (postId: string) => {
    if (!replyInputText.trim()) return;
    const newComment: FeedComment = {
      id: `rep-${Date.now()}`,
      author: userProfile.name || 'You',
      handle: userProfile.handle || 'mystyle',
      avatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      timestamp: 'Just now',
      text: replyInputText.trim(),
      likes: 0,
    };
    setLocalReplies((prev) => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])],
    }));
    setReplyInputText('');
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
        mockComments: [
          {
            id: 'c-1',
            author: 'Julian Vance',
            handle: 'julianv',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
            timestamp: '12m',
            text: 'The drape and wash on these are unbelievable in person.',
            likes: 14,
          },
          {
            id: 'c-2',
            author: 'Maya Chen',
            handle: 'mayac',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
            timestamp: '5m',
            text: 'Does this fit true to size or run slightly long?',
            likes: 6,
          },
        ],
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
        mockComments: [
          {
            id: 'c-3',
            author: 'Soren K',
            handle: 'sorenk',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
            timestamp: '42m',
            text: 'Pure luxury fabric. Instantly elevates any minimalist tailoring.',
            likes: 21,
          },
        ],
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
    ];
  }, [catalog]);

  // 2. Mock Content: Trending Feed (Viral community fits)
  const trendingPosts: FeedPost[] = useMemo(() => {
    return [
      {
        id: 'tr-1',
        author: {
          name: 'Kaito Tanaka',
          handle: 'tokyo_curator',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: '#1 Trending Fit',
        },
        timestamp: '2h',
        content: 'Shibuya rainy night aesthetic. Layered relaxed silhouettes with muted hardware. The texture contrast on this leather piece is everything.',
        tag: 'TokyoStreetwear',
        item: catalog[5] || INITIAL_CATALOG[5],
        likes: 5420,
        comments: 310,
        reposts: 742,
        mockComments: [
          {
            id: 'tc-1',
            author: 'Ren Takahashi',
            handle: 'rentakahashi',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
            timestamp: '1h',
            text: 'Masterclass in silhouette balance!',
            likes: 45,
          },
        ],
      },
      {
        id: 'tr-2',
        author: {
          name: 'Sienna Mercer',
          handle: 'siennastyle',
          avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
          verified: true,
          badge: 'Viral',
        },
        timestamp: '4h',
        content: 'Deconstructed wool overcoat styling for sub-zero mornings. Added chunky knitwear underneath for dimensional drape.',
        tag: 'WinterTailoring',
        item: catalog[6] || INITIAL_CATALOG[6],
        likes: 4210,
        comments: 218,
        reposts: 580,
      },
      {
        id: 'tr-3',
        author: {
          name: 'Liam Moreau',
          handle: 'parisian_minimal',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
          verified: false,
          badge: 'Hot Pick',
        },
        timestamp: '6h',
        content: 'Monochrome slate palette. Sometimes the simplest high-gauge knitwear speaks louder than loud graphics.',
        tag: 'QuietLuxury',
        item: catalog[7] || INITIAL_CATALOG[7],
        likes: 3670,
        comments: 184,
        reposts: 420,
      },
    ];
  }, [catalog]);

  // 3. Mock Content: Friends Feed (Activity & styling from friends list)
  const friendsPosts: FeedPost[] = useMemo(() => {
    return [
      {
        id: 'fr-1',
        author: {
          name: 'Marcus Chen',
          handle: 'marcus_fits',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          badge: 'Friend Activity',
        },
        timestamp: '25m',
        content: 'Just tried this on in the 3D studio and pulled the trigger immediately. Such a solid boxy cut for fall layering.',
        tag: 'FriendCopped',
        item: catalog[8] || INITIAL_CATALOG[8],
        likes: 42,
        comments: 8,
        reposts: 3,
        mockComments: [
          {
            id: 'fc-1',
            author: 'You',
            handle: userProfile.handle || 'me',
            avatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
            timestamp: '15m',
            text: 'Need to see how you style this with boots!',
            likes: 2,
          },
        ],
      },
      {
        id: 'fr-2',
        author: {
          name: 'Elena Rostova',
          handle: 'elena_arch',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
          badge: 'Friend Shared',
        },
        timestamp: '3h',
        content: 'Found this while dissecting outfits from the gallery. If anyone is putting together an earth-tone fit, this is it.',
        tag: 'StyleRec',
        item: catalog[0] || INITIAL_CATALOG[0],
        likes: 88,
        comments: 14,
        reposts: 7,
      },
      {
        id: 'fr-3',
        author: {
          name: 'Devon Brooks',
          handle: 'devon_b',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
          badge: 'In Wishlist',
        },
        timestamp: '7h',
        content: 'Added to my wishlist for the holiday drop. Anyone know if the sizing on the sleeves is oversized?',
        tag: 'WishlistDrop',
        item: catalog[2] || INITIAL_CATALOG[2],
        likes: 56,
        comments: 9,
        reposts: 4,
      },
    ];
  }, [catalog, userProfile]);

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
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                isLight ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-pink-950/60 text-pink-400 border border-pink-600/40'
              }`}
            >
              Feed
            </span>
          </div>
          {/* Note: 'Swipe left / right to switch' text removed as requested */}
        </div>

        {/* 3 Horizontal Sub-Tabs: New Releases, Trending, Friends (Twitter style) */}
        <div className="grid grid-cols-3 text-center relative border-t border-slate-800/20">
          <button
            type="button"
            onClick={() => switchFeedWithFade('new-releases')}
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
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full ${
                  isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'
                } shadow-sm animate-in fade-in duration-150`}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => switchFeedWithFade('trending')}
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
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full ${
                  isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'
                } shadow-sm animate-in fade-in duration-150`}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => switchFeedWithFade('friends')}
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
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full ${
                  isLight ? 'cosmic-gradient-bg-light shadow-pink-600/30' : 'cosmic-gradient-bg shadow-pink-600/50'
                } shadow-sm animate-in fade-in duration-150`}
              />
            )}
          </button>
        </div>
      </header>

      {/* Main Twitter-Style Scroll Feed Container with Smooth Gradual Fading Transitions */}
      <div
        key={activeFeed}
        style={{
          opacity: swipeOpacity,
          transition: isFeedFading ? 'opacity 180ms ease-in-out' : 'opacity 80ms ease-out',
        }}
        className="divide-y divide-slate-800/40"
      >
        {currentPosts.map((post) => {
          const isLiked = Boolean(likedPostIds[post.id]);
          const isReposted = Boolean(repostedPostIds[post.id]);
          const isWishlisted = isItemInWishlist(post.item.id);

          return (
            <article
              key={post.id}
              onClick={() => setActivePostDetail(post)}
              className={`p-4 transition-colors cursor-pointer ${
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
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${
                          post.author.badge.includes('Trend') || post.author.badge.includes('#1')
                            ? 'bg-red-950/70 text-red-400 border border-red-500/40'
                            : isLight
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
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
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          isLight ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-pink-950/50 text-pink-400 border border-pink-500/30'
                        }`}
                      >
                        #{post.tag}
                      </span>
                    </div>
                  )}

                  {/* Garment Product Card Attachment (Twitter style embed) */}
                  <div
                    className={`mt-2 rounded-2xl overflow-hidden border ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-md'
                    } group transition-all`}
                  >
                    {/* Tapping on image directly opens fullscreen image viewer */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenImage({
                          url: post.item.image,
                          name: post.item.name,
                          brand: post.item.brand,
                          item: post.item,
                        });
                        setIsViewerUiVisible(true);
                      }}
                      className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden cursor-zoom-in"
                      title="Tap to view fullscreen photo"
                    >
                      <img
                        src={post.item.image}
                        alt={post.item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Tap to expand hint */}
                      <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>

                      {/* Price badge */}
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md font-mono text-xs font-bold text-emerald-400 border border-emerald-400/30 shadow-md">
                        ${post.item.price}
                      </span>

                      {/* Brand badge */}
                      <span
                        className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isLight ? 'cosmic-gradient-bg-light' : 'cosmic-gradient-bg'
                        } text-white shadow-md`}
                      >
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

                      {/* Quick Add To Cart Button */}
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

                  {/* Twitter Action Bar:
                      Slot 1: Comments
                      Slot 2: Likes (Moved to 2nd slot as requested)
                      Slot 3: Reposts / Shares (tapping toggles repost count; NO send to friends prompt!)
                      Slot 4: Bookmark / Wishlist
                      Slot 5 (bottom right): Send button (ONLY this prompts send to friends!)
                  */}
                  <div className="flex items-center justify-between mt-3 text-slate-400 max-w-sm">
                    {/* Slot 1: Comments */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePostDetail(post);
                      }}
                      className="flex items-center gap-1.5 text-xs hover:text-sky-400 transition-colors group cursor-pointer"
                      title="Comments"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-sky-500/10">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[11px]">
                        {post.comments + (localReplies[post.id]?.length || 0)}
                      </span>
                    </button>

                    {/* Slot 2: Likes (moved to 2nd slot as requested) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePostLike(post.id);
                      }}
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

                    {/* Slot 3: Repost / Shares (NO send to friends prompt; only toggles repost!) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRepost(post.id);
                      }}
                      className={`flex items-center gap-1.5 text-xs transition-colors group cursor-pointer ${
                        isReposted ? 'text-emerald-400' : 'hover:text-emerald-400'
                      }`}
                      title={isReposted ? 'Reposted' : 'Repost'}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                        <Share2 className={`w-4 h-4 ${isReposted ? 'stroke-[2.5]' : ''}`} />
                      </div>
                      <span className="text-[11px]">
                        {post.reposts + (isReposted ? 1 : 0)}
                      </span>
                    </button>

                    {/* Slot 4: Bookmark / Wishlist */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(post.item);
                      }}
                      className={`flex items-center gap-1.5 text-xs transition-colors group cursor-pointer ${
                        isWishlisted ? 'text-pink-500' : 'hover:text-pink-500'
                      }`}
                      title={isWishlisted ? 'In Wishlist' : 'Save to Wishlist'}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-pink-500/10">
                        <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
                      </div>
                    </button>

                    {/* Slot 5: Send via Direct Message to Friends (ONLY this prompts send to friends) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSendItemModalItem(post.item);
                      }}
                      className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Send post to friends"
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

      {/* ============================================================
          SINGLE DEDICATED POST WINDOW:
          - Opened by tapping anywhere on the card
          - Transitions in smoothly from the right
          - User can swipe back (drag right) or tap Back Arrow to return to main feed
         ============================================================ */}
      {activePostDetail && (
        <div
          onTouchStart={handleDetailTouchStart}
          onTouchMove={handleDetailTouchMove}
          onTouchEnd={handleDetailTouchEnd}
          style={{
            transform: `translate3d(${detailSwipeX}px, 0, 0)`,
            transition: isDetailDismissing
              ? 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)'
              : detailSwipeX > 0
              ? 'none'
              : 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className={`fixed inset-0 z-50 overflow-y-auto ${
            isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
          } animate-in slide-in-from-right duration-250`}
        >
          {/* Top Sticky Header with Back Button */}
          <header
            className={`sticky top-0 z-20 ${
              isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-950/90 border-slate-800'
            } backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between pt-[max(12px,env(safe-area-inset-top))]`}
          >
            <button
              type="button"
              onClick={closePostDetail}
              className={`p-2 -ml-2 rounded-full ${
                isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
              } flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Feed</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-400">
              Post Details
            </span>

            <button
              type="button"
              onClick={() => setSendItemModalItem(activePostDetail.item)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              title="Send to Friends"
            >
              <Send className="w-4 h-4" />
            </button>
          </header>

          <main className="max-w-md mx-auto p-4 pb-28 space-y-4">
            {/* Author Profile Header */}
            <div className="flex items-center gap-3">
              <img
                src={activePostDetail.author.avatar}
                alt={activePostDetail.author.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-700/80 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm">{activePostDetail.author.name}</h3>
                  {activePostDetail.author.verified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-pink-500 flex items-center justify-center text-white text-[9px] font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">@{activePostDetail.author.handle} · {activePostDetail.timestamp}</p>
              </div>

              {activePostDetail.author.badge && (
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isLight ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-pink-950/60 text-pink-400 border border-pink-500/30'
                  }`}
                >
                  {activePostDetail.author.badge}
                </span>
              )}
            </div>

            {/* Post Caption */}
            <p className="text-sm leading-relaxed">{activePostDetail.content}</p>

            {/* Garment Embed with tap to view photo */}
            <div
              className={`rounded-2xl overflow-hidden border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              } shadow-lg`}
            >
              <div
                onClick={() => {
                  setFullscreenImage({
                    url: activePostDetail.item.image,
                    name: activePostDetail.item.name,
                    brand: activePostDetail.item.brand,
                    item: activePostDetail.item,
                  });
                  setIsViewerUiVisible(true);
                }}
                className="relative aspect-[16/10] w-full bg-slate-900 cursor-zoom-in"
              >
                <img
                  src={activePostDetail.item.image}
                  alt={activePostDetail.item.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md font-mono text-xs font-bold text-emerald-400 border border-emerald-400/30 shadow-md">
                  ${activePostDetail.item.price}
                </span>
                <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Tap image to expand
                </span>
              </div>

              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
                    {activePostDetail.item.brand}
                  </span>
                  <h4 className="text-sm font-black truncate">{activePostDetail.item.name}</h4>
                  <p className="text-xs text-slate-400">{activePostDetail.item.material} • {activePostDetail.item.fit}</p>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(activePostDetail.item)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>

            {/* Interaction Bar on Single Post (Same order: Comments, Likes 2nd, Repost 3rd, Bookmark 4th, Send 5th) */}
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'} flex items-center justify-between`}>
              {/* Slot 1: Comments */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MessageCircle className="w-4 h-4" />
                <span>{activePostDetail.comments + (localReplies[activePostDetail.id]?.length || 0)} replies</span>
              </div>

              {/* Slot 2: Likes */}
              <button
                type="button"
                onClick={() => togglePostLike(activePostDetail.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                  likedPostIds[activePostDetail.id] ? 'text-pink-500 font-bold' : 'text-slate-400 hover:text-pink-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedPostIds[activePostDetail.id] ? 'fill-pink-500 text-pink-500' : ''}`} />
                <span>{activePostDetail.likes + (likedPostIds[activePostDetail.id] ? 1 : 0)}</span>
              </button>

              {/* Slot 3: Repost */}
              <button
                type="button"
                onClick={() => toggleRepost(activePostDetail.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                  repostedPostIds[activePostDetail.id] ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>{activePostDetail.reposts + (repostedPostIds[activePostDetail.id] ? 1 : 0)}</span>
              </button>

              {/* Slot 4: Bookmark */}
              <button
                type="button"
                onClick={() => toggleWishlist(activePostDetail.item)}
                className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                  isItemInWishlist(activePostDetail.item.id) ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isItemInWishlist(activePostDetail.item.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
              </button>

              {/* Slot 5: Send to Friends */}
              <button
                type="button"
                onClick={() => setSendItemModalItem(activePostDetail.item)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Send post to friends"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Comments Thread Section */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Community Discussion
              </h4>

              {/* Reply Input Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyInputText}
                  onChange={(e) => setReplyInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddReply(activePostDetail.id);
                  }}
                  placeholder="Post your reply..."
                  className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs outline-none border ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-pink-500' : 'bg-slate-900 border-slate-700 text-white focus:border-pink-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleAddReply(activePostDetail.id)}
                  disabled={!replyInputText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                >
                  Reply
                </button>
              </div>

              {/* Combined Comments List (local user replies + mock comments) */}
              <div className="space-y-2.5 pt-1">
                {(localReplies[activePostDetail.id] || []).map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-2xl border ${
                      isLight ? 'bg-pink-50/50 border-pink-200' : 'bg-pink-950/20 border-pink-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={c.avatar} alt={c.author} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-xs font-bold">{c.author}</span>
                        <span className="text-[10px] text-slate-400">@{c.handle}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                    </div>
                    <p className="text-xs mt-1.5 pl-8 leading-relaxed">{c.text}</p>
                  </div>
                ))}

                {(activePostDetail.mockComments || []).map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-2xl border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={c.avatar} alt={c.author} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-xs font-bold">{c.author}</span>
                        <span className="text-[10px] text-slate-400">@{c.handle}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                    </div>
                    <p className="text-xs mt-1.5 pl-8 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ============================================================
          FULLSCREEN SOCIAL MEDIA IMAGE VIEWER (Twitter / Facebook style):
          - Opened by tapping on any post image
          - Tapping anywhere toggles showing/hiding minimalist UI
         ============================================================ */}
      {fullscreenImage && (
        <div
          onClick={() => setIsViewerUiVisible((prev) => !prev)}
          className="fixed inset-0 z-[100] bg-black flex flex-col justify-between items-center select-none cursor-pointer"
        >
          {/* Minimalist Top Bar (Show/Hide on tap) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md px-4 py-3 flex items-center justify-between z-20 pt-[max(12px,env(safe-area-inset-top))] transition-opacity duration-200 ${
              isViewerUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              type="button"
              onClick={() => setFullscreenImage(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-xs font-black text-white">{fullscreenImage.brand}</p>
              <p className="text-[10px] text-slate-400">1 of 1</p>
            </div>

            <button
              type="button"
              onClick={() => setSendItemModalItem(fullscreenImage.item)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer transition-colors"
              title="Send to Friends"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Centered Image View (Full view unobstructed) */}
          <div className="flex-1 w-full flex items-center justify-center p-2 relative overflow-hidden">
            <img
              src={fullscreenImage.url}
              alt={fullscreenImage.name}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
            />
          </div>

          {/* Minimalist Bottom Bar (Show/Hide on tap) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md px-4 pb-8 pt-3 flex items-center justify-between z-20 pb-[max(20px,env(safe-area-inset-bottom))] transition-opacity duration-200 ${
              isViewerUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="min-w-0 flex-1 mr-3">
              <p className="text-xs font-bold text-white truncate">{fullscreenImage.name}</p>
              <p className="text-[10px] font-mono text-emerald-400">${fullscreenImage.item.price}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(fullscreenImage.item)}
                className={`p-2.5 rounded-full border border-white/20 backdrop-blur-md cursor-pointer ${
                  isItemInWishlist(fullscreenImage.item.id) ? 'bg-pink-600 text-white' : 'bg-black/50 text-white'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isItemInWishlist(fullscreenImage.item.id) ? 'fill-white' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(fullscreenImage.item);
                  setFullscreenImage(null);
                }}
                className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
