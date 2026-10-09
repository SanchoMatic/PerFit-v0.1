import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Plus,
  ArrowLeft,
  Send,
  Check,
  CheckCheck,
  Search,
  Users,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  SlidersHorizontal,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Friend, Conversation, ChatMessage, ClothingItem, SharedOutfit } from '../../types';

export const InboxModal: React.FC = () => {
  const {
    isInboxOpen,
    setIsInboxOpen,
    conversations,
    messages,
    friends,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    createConversation,
    updateConversationAvatar,
    wishlistItems,
    userProfile,
    addToCart,
    showToast,
    chatOnlineStatus,
    setChatOnlineStatus,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';

  // Navigation inside inbox: 'list' (all inboxes), 'thread' (open conversation), 'new' (compose)
  const [viewState, setViewState] = useState<'list' | 'thread' | 'new'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'read' | 'unread' | 'groups'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isAttachingItem, setIsAttachingItem] = useState(false);
  const [selectedAttachmentItem, setSelectedAttachmentItem] = useState<ClothingItem | null>(null);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  // New message state
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [groupNameInput, setGroupNameInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const groupPhotoInputRef = useRef<HTMLInputElement>(null);

  // When activeConversationId changes from outside (e.g. sent fit or open chat)
  useEffect(() => {
    if (activeConversationId) {
      setViewState('thread');
    }
  }, [activeConversationId]);

  // Scroll to bottom of message thread
  useEffect(() => {
    if (viewState === 'thread') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [viewState, messages, activeConversationId]);

  if (!isInboxOpen) return null;

  const currentConv = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Helper to format seen timestamps
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  // Get participant friends for a conversation
  const getParticipants = (conv: Conversation): Friend[] => {
    return conv.participantIds
      .map((id) => friends.find((f) => f.id === id))
      .filter((f): f is Friend => Boolean(f));
  };

  const getConvTitle = (conv: Conversation): string => {
    if (conv.name) return conv.name;
    const parts = getParticipants(conv);
    return parts.map((p) => p.name).join(', ') || 'Chat';
  };

  const getConvAvatar = (conv: Conversation): string | undefined => {
    if (conv.avatar) return conv.avatar;
    const parts = getParticipants(conv);
    return parts[0]?.avatar;
  };

  const handleSendMessage = () => {
    if (!activeConversationId) return;
    if (!messageInput.trim() && !selectedAttachmentItem) return;

    sendMessage(
      activeConversationId,
      messageInput.trim() || undefined,
      selectedAttachmentItem || undefined
    );

    setMessageInput('');
    setSelectedAttachmentItem(null);
    setIsAttachingItem(false);
  };

  const handleStartChat = () => {
    if (selectedFriendIds.length === 0) return;
    const convId = createConversation(
      selectedFriendIds,
      selectedFriendIds.length > 1 && groupNameInput.trim() ? groupNameInput.trim() : undefined
    );
    setActiveConversationId(convId);
    setViewState('thread');
    setSelectedFriendIds([]);
    setGroupNameInput('');
  };

  const handleGroupPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeConversationId) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateConversationAvatar(activeConversationId, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      onClick={() => setIsInboxOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md h-[600px] max-h-[92vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col cursor-default ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
        }`}
      >
        {/* ============================================================
            VIEW 1: INBOX LIST (Twitter / Facebook style inboxes)
           ============================================================ */}
        {viewState === 'list' && (
          <div className="flex flex-col h-full">
            {/* Header - Optimized horizontal layout with extra space for title & status */}
            <div
              className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
                isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-850 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-black text-base leading-tight flex-shrink-0">Messages</h2>
                {/* Online Appearance Pill Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowStatusOptions(!showStatusOptions)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex-shrink-0 ${
                    chatOnlineStatus === 'online'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/25'
                      : chatOnlineStatus === 'busy'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 hover:bg-amber-500/25'
                      : 'bg-slate-500/15 border-slate-500/30 text-slate-400 hover:bg-slate-500/25'
                  }`}
                  title="Toggle Online Appearance (Online, Busy, Offline)"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      chatOnlineStatus === 'online'
                        ? 'bg-emerald-500 animate-pulse'
                        : chatOnlineStatus === 'busy'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="capitalize">{chatOnlineStatus}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Filter Button (Filters by All, Read, Unread, Groups) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFilterDropdown(!showFilterDropdown);
                      setShowStatusOptions(false);
                    }}
                    className={`p-2 rounded-full border transition-all ${
                      messageFilter !== 'all'
                        ? isLight
                          ? 'border-pink-600 bg-pink-50 text-pink-600'
                          : 'border-pink-500 bg-pink-950/40 text-pink-400'
                        : isLight
                        ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:text-white shadow-sm'
                    }`}
                    title={`Filter messages: ${messageFilter}`}
                  >
                    <SlidersHorizontal
                      className={`w-3.5 h-3.5 ${
                        messageFilter !== 'all'
                          ? isLight
                            ? 'text-pink-600'
                            : 'text-pink-400'
                          : isLight
                          ? 'text-slate-800'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>

                  {/* Filter Dropdown Menu */}
                  {showFilterDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowFilterDropdown(false)}
                      />
                      <div
                        className={`absolute right-0 top-full mt-2 w-36 rounded-2xl border shadow-2xl py-1.5 z-40 ${
                          isLight
                            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
                            : 'bg-slate-900 border-slate-700 text-white shadow-black/80'
                        } animate-in fade-in zoom-in-95 duration-150`}
                      >
                        <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-pink-500 border-b border-inherit mb-1">
                          Filter By
                        </div>
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'unread', label: 'Unread' },
                          { id: 'read', label: 'Read' },
                          { id: 'groups', label: 'Groups' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setMessageFilter(opt.id as any);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors ${
                              messageFilter === opt.id
                                ? isLight
                                  ? 'bg-pink-50 text-pink-600 font-bold'
                                  : 'bg-pink-950/50 text-pink-400 font-bold'
                                : isLight
                                ? 'hover:bg-slate-100 text-slate-700'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {messageFilter === opt.id && (
                              <Check className="w-3 h-3 text-pink-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* New Message Button */}
                <button
                  onClick={() => setViewState('new')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                    isLight ? 'cosmic-gradient-bg-light shadow-pink-600/25' : 'cosmic-gradient-bg shadow-pink-600/35'
                  } hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm`}
                  title="New message"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New</span>
                </button>

                {/* Exit X Button with full clearance */}
                <button
                  onClick={() => setIsInboxOpen(false)}
                  className={`p-2 rounded-full ${
                    isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
                  } transition-colors flex-shrink-0`}
                  title="Close messages"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Online Appearance Options Panel */}
            {showStatusOptions && (
              <div
                className={`p-3 border-b shadow-md animate-in slide-in-from-top-2 duration-150 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-pink-600">
                    Online Appearance Settings
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowStatusOptions(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Done
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'online',
                      label: 'Online',
                      desc: 'Active now',
                      color: 'bg-emerald-500',
                      activeStyle: isLight
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-400 font-bold'
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/60 font-bold',
                    },
                    {
                      id: 'busy',
                      label: 'Busy',
                      desc: 'Do not disturb',
                      color: 'bg-amber-500',
                      activeStyle: isLight
                        ? 'bg-amber-50 text-amber-700 border-amber-400 font-bold'
                        : 'bg-amber-950/40 text-amber-400 border-amber-500/60 font-bold',
                    },
                    {
                      id: 'offline',
                      label: 'Offline',
                      desc: 'Appear invisible',
                      color: 'bg-slate-400',
                      activeStyle: isLight
                        ? 'bg-slate-200 text-slate-800 border-slate-400 font-bold'
                        : 'bg-slate-800/80 text-slate-200 border-slate-600 font-bold',
                    },
                  ].map((opt) => {
                    const isSelected = chatOnlineStatus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setChatOnlineStatus(opt.id as 'online' | 'busy' | 'offline');
                          showToast('Appearance Updated', `Chat status set to ${opt.label}`, 'green');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? opt.activeStyle
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${opt.color} ${
                              opt.id === 'online' ? 'animate-pulse' : ''
                            }`}
                          />
                          <span className="text-xs">{opt.label}</span>
                        </div>
                        <p className="text-[9px] opacity-75 leading-tight">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search Inboxes */}
            <div className="p-3 border-b border-inherit">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <Search className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  placeholder="Search direct messages & groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Indicator pill */}
            {messageFilter !== 'all' && (
              <div className={`px-4 py-1.5 flex items-center justify-between text-[11px] border-b border-inherit ${
                isLight ? 'bg-pink-50/70 text-pink-700' : 'bg-pink-950/30 text-pink-300'
              }`}>
                <span>Showing: <strong className="capitalize">{messageFilter}</strong> conversations</span>
                <button
                  type="button"
                  onClick={() => setMessageFilter('all')}
                  className="text-[10px] font-bold text-pink-500 hover:underline"
                >
                  Show All
                </button>
              </div>
            )}

            {/* Conversation Threads List */}
            <div className="flex-1 overflow-y-auto divide-y divide-inherit">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                  <p className="text-xs font-semibold">No messages yet</p>
                  <p className="text-[11px] text-slate-500">
                    Connect with friends or share pieces to start a chat
                  </p>
                </div>
              ) : (
                conversations
                  .filter((c) => {
                    const title = getConvTitle(c).toLowerCase();
                    const matchesSearch = title.includes(searchQuery.toLowerCase());
                    if (!matchesSearch) return false;
                    if (messageFilter === 'unread') return (c.unreadCount || 0) > 0;
                    if (messageFilter === 'read') return (c.unreadCount || 0) === 0;
                    if (messageFilter === 'groups') return c.type === 'group';
                    return true;
                  })
                  .map((conv) => {
                    const title = getConvTitle(conv);
                    const avatar = getConvAvatar(conv);
                    const isGroup = conv.type === 'group';
                    const lastMsg = conv.lastMessage;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          setViewState('thread');
                        }}
                        className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {isGroup ? (
                            conv.avatar ? (
                              <img
                                src={conv.avatar}
                                alt={title}
                                className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-700/60 shadow-md"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                            )
                          ) : avatar ? (
                            <img
                              src={avatar}
                              alt={title}
                              className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-700/60"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
                              {title.charAt(0)}
                            </div>
                          )}
                          {/* Online status indicator */}
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                        </div>

                        {/* Thread Preview */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h3 className="font-extrabold text-xs truncate leading-tight flex items-center gap-1.5">
                              <span>{title}</span>
                              {isGroup && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                  Group
                                </span>
                              )}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                              {conv.updatedAt ? formatRelativeTime(conv.updatedAt) : ''}
                            </span>
                          </div>

                          <p
                            className={`text-[11px] truncate ${
                              conv.unreadCount > 0
                                ? 'font-bold text-pink-600'
                                : isLight
                                ? 'text-slate-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {lastMsg?.sharedOutfit
                              ? `Shared outfit: ${lastMsg.sharedOutfit.name}`
                              : lastMsg?.sharedItem
                              ? `Shared piece: ${lastMsg.sharedItem.name}`
                              : lastMsg?.text || 'Started a conversation'}
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            VIEW 2: COMPOSE NEW MESSAGE (Single or Group to Friends Only)
           ============================================================ */}
        {viewState === 'new' && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-850 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewState('list');
                    setSelectedFriendIds([]);
                    setGroupNameInput('');
                  }}
                  className={`p-1.5 rounded-full ${
                    isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-black text-sm leading-tight">New Message</h3>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Single or Group Chat with Friends
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInboxOpen(false)}
                className={`p-1.5 rounded-full ${
                  isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Group Name input if 2 or more friends selected */}
            {selectedFriendIds.length > 1 && (
              <div className="p-3 border-b border-inherit">
                <input
                  type="text"
                  placeholder="Group Name (e.g. Gorpcore Archive Squad)..."
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border font-medium focus:outline-none focus:border-pink-600 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>
            )}

            {/* Friend Selector */}
            <div className="p-3 border-b border-inherit">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Select Friends ({selectedFriendIds.length} chosen)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {friends.map((f) => {
                const isSelected = selectedFriendIds.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFriendIds((prev) =>
                        prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                      );
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'border-pink-600 bg-pink-600/10'
                        : isLight
                        ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        : 'border-slate-850 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={f.avatar}
                        alt={f.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700/60 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{f.name}</p>
                        <p className="text-[10px] text-pink-600 font-mono truncate">{f.handle}</p>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate mt-0.5`}>
                          {f.styleArchetype}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
                        isSelected
                          ? 'bg-pink-600 border-pink-600 text-white'
                          : isLight
                          ? 'border-slate-300 bg-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Start Chat Button */}
            <div
              className={`p-4 border-t flex items-center gap-2 ${
                isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-850 bg-slate-900/80'
              }`}
            >
              <button
                disabled={selectedFriendIds.length === 0}
                onClick={handleStartChat}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white transition-all shadow-md ${
                  selectedFriendIds.length > 0
                    ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/30'
                    : 'bg-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {selectedFriendIds.length === 0
                    ? 'Select friends to start chat'
                    : selectedFriendIds.length === 1
                    ? 'Start Direct Chat'
                    : `Start Group Chat (${selectedFriendIds.length} friends)`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            VIEW 3: CONVERSATION THREAD (Twitter / Facebook Messenger Style)
           ============================================================ */}
        {viewState === 'thread' && currentConv && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div
              className={`p-3.5 border-b flex items-center justify-between ${
                isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-850 bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setViewState('list')}
                  className={`p-1.5 rounded-full ${
                    isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative flex-shrink-0">
                  {currentConv.type === 'group' ? (
                    <div
                      onClick={() => groupPhotoInputRef.current?.click()}
                      className="relative cursor-pointer group/groupavatar"
                      title="Tap to change group contact photo"
                    >
                      {currentConv.avatar ? (
                        <img
                          src={currentConv.avatar}
                          alt={getConvTitle(currentConv)}
                          className="w-9 h-9 rounded-2xl object-cover ring-1 ring-slate-700/60 group-hover/groupavatar:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-600 to-indigo-600 flex items-center justify-center text-white group-hover/groupavatar:opacity-80 transition-opacity">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {/* Tap to edit group photo camera badge */}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-pink-600 flex items-center justify-center text-white ring-1 ring-slate-950 shadow-sm group-hover/groupavatar:scale-110 transition-transform">
                        <Camera className="w-2.5 h-2.5 text-white" />
                      </span>
                      <input
                        ref={groupPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGroupPhotoChange}
                      />
                    </div>
                  ) : (
                    <img
                      src={getConvAvatar(currentConv)}
                      alt={getConvTitle(currentConv)}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700/60"
                    />
                  )}
                  {currentConv.type !== 'group' && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs truncate leading-tight">
                    {getConvTitle(currentConv)}
                  </h3>
                  <p className="text-[10px] text-emerald-500 font-medium">Active now</p>
                </div>
              </div>

              <button
                onClick={() => setIsInboxOpen(false)}
                className={`p-1.5 rounded-full ${
                  isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {currentMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-1.5">
                  <p className="text-xs font-semibold">Start the conversation</p>
                  <p className="text-[11px] text-slate-500">
                    Send a message, clothing item, or curated outfit!
                  </p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isUser = msg.senderId === 'user';
                  const senderFriend = !isUser ? friends.find((f) => f.id === msg.senderId) : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender label for group chat */}
                      {currentConv.type === 'group' && !isUser && senderFriend && (
                        <span className="text-[10px] text-slate-400 font-medium ml-2 mb-1">
                          {senderFriend.name.split(' ')[0]}
                        </span>
                      )}

                      <div className="flex items-end gap-2 max-w-[85%]">
                        {/* Friend Avatar */}
                        {!isUser && senderFriend && (
                          <img
                            src={senderFriend.avatar}
                            alt={senderFriend.name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700/50 mb-1 flex-shrink-0"
                          />
                        )}

                        <div className="space-y-1">
                          {/* Shared Item Card if attached */}
                          {msg.sharedItem && (
                            <div
                              className={`p-3 rounded-2xl border shadow-md space-y-2 ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                              }`}
                            >
                              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950">
                                <img
                                  src={msg.sharedItem.image}
                                  alt={msg.sharedItem.name}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-pink-400 text-[10px] font-mono font-bold border border-pink-500/30">
                                  {msg.sharedItem.brand}
                                </span>
                              </div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-bold leading-tight">
                                    {msg.sharedItem.name}
                                  </h4>
                                  <p className="text-xs font-black font-mono text-emerald-500 mt-0.5">
                                    ${msg.sharedItem.price}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    addToCart(msg.sharedItem!);
                                    showToast(`Added ${msg.sharedItem!.name} to cart`, '', 'green');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>Bag</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Shared Outfit Card if attached */}
                          {msg.sharedOutfit && (
                            <div
                              className={`p-3 rounded-2xl border shadow-md space-y-2.5 ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 font-mono">
                                  Curated Fit
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-600/10 text-pink-600 font-bold border border-pink-600/20">
                                  {msg.sharedOutfit.aesthetic}
                                </span>
                              </div>

                              <h4 className="text-xs font-black leading-tight">
                                {msg.sharedOutfit.name}
                              </h4>

                              {/* Mini pieces grid */}
                              <div className="grid grid-cols-4 gap-1.5">
                                {msg.sharedOutfit.items.map((it) => (
                                  <div
                                    key={it.id}
                                    className="aspect-square rounded-lg overflow-hidden bg-slate-800 relative group"
                                  >
                                    <img
                                      src={it.image}
                                      alt={it.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-mono font-black text-emerald-500">
                                  ${msg.sharedOutfit.items.reduce((acc, it) => acc + it.price, 0)} total
                                </span>
                                <button
                                  onClick={() => {
                                    msg.sharedOutfit!.items.forEach((it) => addToCart(it));
                                    showToast(
                                      `Added all ${msg.sharedOutfit!.items.length} outfit pieces to cart!`,
                                      '',
                                      'green'
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold transition-colors shadow-sm"
                                >
                                  Add Outfit to Bag
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Message Text Bubble */}
                          {msg.text && (
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                isUser
                                  ? 'bg-pink-600 text-white font-medium rounded-br-sm shadow-sm'
                                  : isLight
                                  ? 'bg-slate-100 text-slate-900 rounded-bl-sm border border-slate-200'
                                  : 'bg-slate-900 text-slate-100 rounded-bl-sm border border-slate-800'
                              }`}
                            >
                              {msg.text}
                            </div>
                          )}

                          {/* Message Delivery Status Indicator */}
                          <div
                            className={`flex items-center gap-1 text-[10px] font-mono ${
                              isUser ? 'justify-end text-slate-400' : 'justify-start text-slate-500'
                            }`}
                          >
                            <span>{formatTime(msg.timestamp)}</span>

                            {isUser && (
                              <div className="flex items-center gap-0.5 ml-1">
                                {msg.status === 'sent' && (
                                  <span className="flex items-center gap-0.5 text-slate-400">
                                    <Check className="w-3 h-3" />
                                    <span>Sent</span>
                                  </span>
                                )}
                                {msg.status === 'delivered' && (
                                  <span className="flex items-center gap-0.5 text-slate-400">
                                    <CheckCheck className="w-3 h-3" />
                                    <span>Delivered</span>
                                  </span>
                                )}
                                {msg.status === 'seen' && (
                                  <span className="flex items-center gap-0.5 text-pink-500 font-bold">
                                    <CheckCheck className="w-3 h-3 text-pink-500" />
                                    <span>
                                      Seen {msg.seenTimestamp ? formatTime(msg.seenTimestamp) : ''}
                                    </span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Item Attachment Preview (if user selected an item to attach) */}
            {selectedAttachmentItem && (
              <div
                className={`p-2.5 mx-3 mb-2 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={selectedAttachmentItem.image}
                    alt={selectedAttachmentItem.name}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate leading-tight">
                      {selectedAttachmentItem.name}
                    </p>
                    <p className="text-[10px] text-pink-600 font-mono">
                      ${selectedAttachmentItem.price}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAttachmentItem(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Item Picker from Wishlist Drawer */}
            {isAttachingItem && (
              <div
                className={`p-3 border-t max-h-44 overflow-y-auto space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
                    Attach Item from Wishlist
                  </span>
                  <button
                    onClick={() => setIsAttachingItem(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                {wishlistItems.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">Wishlist is empty</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedAttachmentItem(item);
                          setIsAttachingItem(false);
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border cursor-pointer transition-all ${
                          isLight
                            ? 'bg-white border-slate-200 hover:border-pink-600'
                            : 'bg-slate-950 border-slate-850 hover:border-pink-600'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold truncate leading-tight">{item.name}</p>
                          <p className="text-[9px] text-emerald-500 font-mono">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Message Input Bar */}
            <div
              className={`p-3 border-t flex items-center gap-2 ${
                isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-850 bg-slate-900/90'
              }`}
            >
              {/* Attach Item button */}
              <button
                onClick={() => setIsAttachingItem(!isAttachingItem)}
                className={`p-2 rounded-xl border transition-colors ${
                  isAttachingItem || selectedAttachmentItem
                    ? 'border-pink-600 text-pink-600 bg-pink-600/10'
                    : isLight
                    ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
                title="Attach piece from wishlist"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Start a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-pink-600 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />

              <button
                disabled={!messageInput.trim() && !selectedAttachmentItem}
                onClick={handleSendMessage}
                className={`p-2.5 rounded-xl text-white transition-all shadow-md ${
                  messageInput.trim() || selectedAttachmentItem
                    ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/30'
                    : 'bg-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
