import { Friend, Conversation, ChatMessage } from '../types';
import { INITIAL_CATALOG } from './mockCatalog';

export const INITIAL_FRIENDS: Friend[] = [
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
  {
    id: 'f-4',
    name: 'Elena Rostova',
    handle: '@elena_berlin',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    matchScore: 88,
    favoriteBrand: 'Jil Sander',
    styleArchetype: 'Modern Tailoring & Clean Line',
    bio: 'Berlin minimalism, boxy wool overcoats, crisp poplin shirts and muted palettes.',
    sharedItems: 9,
    outfitsCount: 16,
    friendsCount: 47,
    joinedDate: 'Feb 2024',
    moodboards: [
      {
        title: 'Minimalist Architecture & Tailoring',
        description: 'Clean geometry, boxy wool cuts, and monochrome styling',
        items: [
          INITIAL_CATALOG.find((i) => i.id === 'item-2') || INITIAL_CATALOG[1],
          INITIAL_CATALOG.find((i) => i.id === 'item-48') || INITIAL_CATALOG[3],
          INITIAL_CATALOG.find((i) => i.id === 'item-55') || INITIAL_CATALOG[4],
        ],
      },
    ],
  },
];

const now = Date.now();

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm-1-1',
      conversationId: 'conv-1',
      senderId: 'f-1',
      text: 'Yo! Checked your cosmic wishlist and that Gorpcore curation is crazy good.',
      timestamp: now - 3600000 * 4,
      status: 'seen',
      seenTimestamp: now - 3600000 * 3.8,
    },
    {
      id: 'm-1-2',
      conversationId: 'conv-1',
      senderId: 'user',
      text: 'Thanks man! Found this technical shell earlier on the swipe deck, what do you think?',
      sharedItem: INITIAL_CATALOG.find((i) => i.id === 'item-1') || INITIAL_CATALOG[0],
      timestamp: now - 3600000 * 2,
      status: 'seen',
      seenTimestamp: now - 3600000 * 1.5,
    },
    {
      id: 'm-1-3',
      conversationId: 'conv-1',
      senderId: 'f-1',
      text: "Instant grail piece. The Beta LT silhouette with the storm hood is unbeatable. 10/10 cop!",
      timestamp: now - 3600000 * 1.2,
      status: 'seen',
      seenTimestamp: now - 3600000 * 1.1,
    },
  ],
  'conv-2': [
    {
      id: 'm-2-1',
      conversationId: 'conv-2',
      senderId: 'f-2',
      text: 'Hey! Found any cozy mohair pieces for the winter rotation?',
      timestamp: now - 3600000 * 6,
      status: 'seen',
      seenTimestamp: now - 3600000 * 5.5,
    },
    {
      id: 'm-2-2',
      conversationId: 'conv-2',
      senderId: 'user',
      text: 'Just saved this Acne Studios sweater to my vault, thought you would love the texture!',
      sharedItem: INITIAL_CATALOG.find((i) => i.id === 'item-2') || INITIAL_CATALOG[1],
      timestamp: now - 3600000 * 3,
      status: 'seen',
      seenTimestamp: now - 3600000 * 2.5,
    },
    {
      id: 'm-2-3',
      conversationId: 'conv-2',
      senderId: 'f-2',
      text: 'OMG yes! That brushed lilac blend is stunning. Adding it to my moodboard right now ✨',
      timestamp: now - 3600000 * 2,
      status: 'seen',
      seenTimestamp: now - 3600000 * 1.8,
    },
  ],
  'conv-3': [
    {
      id: 'm-3-1',
      conversationId: 'conv-3',
      senderId: 'f-3',
      text: 'Working on a dark avant-garde moodboard for fashion week.',
      timestamp: now - 3600000 * 8,
      status: 'seen',
      seenTimestamp: now - 3600000 * 7,
    },
    {
      id: 'm-3-2',
      conversationId: 'conv-3',
      senderId: 'user',
      text: 'Let me send you an outfit I curated earlier with the Rick Owens cargo pods.',
      timestamp: now - 3600000 * 2,
      status: 'delivered',
    },
  ],
  'conv-4': [
    {
      id: 'm-4-1',
      conversationId: 'conv-4',
      senderId: 'f-1',
      text: 'Welcome to the Style Collective squad! Share any archive gems you find.',
      timestamp: now - 3600000 * 12,
      status: 'seen',
      seenTimestamp: now - 3600000 * 11,
    },
    {
      id: 'm-4-2',
      conversationId: 'conv-4',
      senderId: 'f-2',
      text: 'Excited for this! Looking for clean transitional coats this season.',
      timestamp: now - 3600000 * 8,
      status: 'seen',
      seenTimestamp: now - 3600000 * 7,
    },
  ],
};

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    participantIds: ['f-1'],
    avatar: INITIAL_FRIENDS[0].avatar,
    lastMessage: INITIAL_MESSAGES['conv-1'][INITIAL_MESSAGES['conv-1'].length - 1],
    unreadCount: 0,
    updatedAt: now - 3600000 * 1.2,
  },
  {
    id: 'conv-2',
    type: 'direct',
    participantIds: ['f-2'],
    avatar: INITIAL_FRIENDS[1].avatar,
    lastMessage: INITIAL_MESSAGES['conv-2'][INITIAL_MESSAGES['conv-2'].length - 1],
    unreadCount: 0,
    updatedAt: now - 3600000 * 2,
  },
  {
    id: 'conv-3',
    type: 'direct',
    participantIds: ['f-3'],
    avatar: INITIAL_FRIENDS[2].avatar,
    lastMessage: INITIAL_MESSAGES['conv-3'][INITIAL_MESSAGES['conv-3'].length - 1],
    unreadCount: 0,
    updatedAt: now - 3600000 * 2,
  },
  {
    id: 'conv-4',
    type: 'group',
    name: 'Style Collective',
    participantIds: ['f-1', 'f-2', 'f-3'],
    lastMessage: INITIAL_MESSAGES['conv-4'][INITIAL_MESSAGES['conv-4'].length - 1],
    unreadCount: 0,
    updatedAt: now - 3600000 * 8,
  },
];
