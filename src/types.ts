export type TabType = 'swipe' | 'wishlist' | 'cart' | 'upload' | 'profile';

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: 'Tops' | 'Outerwear' | 'Bottoms' | 'Footwear' | 'Accessories' | 'Knitwear' | 'Dresses';
  subcategory: string;
  image: string;
  description: string;
  aesthetics: string[];
  colors: string[];
  sizes: string[];
  material: string;
  fit: string;
  matchScore?: number;
  inStock: boolean;
  isBundle?: boolean;
  collectionId?: string;
  likedAt?: number;
}

export interface DissectedGarment {
  id: string;
  name: string;
  category: string;
  color: string;
  material: string;
  aesthetic: string;
  fit?: string;
  tags: string[];
  searchKeywords: string;
  confidence: number;
  box?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
  marketplaceMatches: ClothingItem[];
  addedToAlgorithm: boolean;
}

export interface DissectionResult {
  overallAesthetic: string;
  colorPalette: string[];
  items: DissectedGarment[];
}

export interface AlgorithmProfile {
  aestheticWeights: Record<string, number>;
  colorWeights: Record<string, number>;
  brandWeights: Record<string, number>;
  categoryWeights: Record<string, number>;
  totalSwipes: number;
  likeCount: number;
  dislikeCount: number;
  dissectedOutfitsLearned: number;
  recentLearnedStyles: Array<{
    style: string;
    source: string;
    timestamp: number;
    delta: number;
  }>;
}

export interface CartItem {
  item: ClothingItem;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface WishlistCollection {
  id: string;
  title: string;
  description: string;
  itemIds: string[];
  coverImage?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  membership: string;
  preferences: {
    topSize: string;
    bottomSize: string;
    shoeSize: string;
    currency: string;
    hapticFeedback: boolean;
    priceDropAlerts: boolean;
    dailySwipeLimit: number | null;
  };
}
