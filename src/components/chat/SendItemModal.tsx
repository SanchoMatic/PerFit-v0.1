import React, { useState } from 'react';
import { Send, X, Check, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SendItemModal: React.FC = () => {
  const {
    sendItemModalItem,
    setSendItemModalItem,
    friends,
    sendItemToFriends,
    userProfile,
  } = useApp();

  const isLight = userProfile.preferences.theme === 'light';
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [note, setNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!sendItemModalItem) return null;

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.styleArchetype.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedFriendIds.length === 0) return;
    setIsSending(true);
    setTimeout(() => {
      sendItemToFriends(selectedFriendIds, sendItemModalItem, note.trim() || undefined);
      setIsSending(false);
      setSelectedFriendIds([]);
      setNote('');
    }, 300);
  };

  return (
    <div
      onClick={() => {
        setSendItemModalItem(null);
        setSelectedFriendIds([]);
        setNote('');
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-850 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-600/15 flex items-center justify-center text-pink-600">
              <Send className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">Send to Friends</h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Share piece via direct message
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSendItemModalItem(null);
              setSelectedFriendIds([]);
              setNote('');
            }}
            className={`p-1.5 rounded-full ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            } transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Item Card Preview */}
        <div
          className={`p-3.5 mx-4 mt-3 rounded-2xl border flex items-center gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 relative">
            <img
              src={sendItemModalItem.image}
              alt={sendItemModalItem.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'cosmic-gradient-text-light' : 'cosmic-gradient-text'}`}>
              {sendItemModalItem.brand}
            </span>
            <h4 className={`text-xs font-bold truncate leading-tight mt-0.5 ${isLight ? 'text-sky-950' : 'text-white'}`}>
              {sendItemModalItem.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-extrabold font-mono text-white">
                ${sendItemModalItem.price}
              </span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} capitalize`}>
                • {sendItemModalItem.category}
              </span>
            </div>
          </div>
        </div>

        {/* Search Friends */}
        <div className="px-4 mt-3">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search friends..."
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

        {/* Friends Selection List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 min-h-[160px] max-h-[220px]">
          {filteredFriends.length === 0 ? (
            <p className="text-xs text-center py-6 text-slate-400">No friends found</p>
          ) : (
            filteredFriends.map((f) => {
              const isSelected = selectedFriendIds.includes(f.id);
              return (
                <div
                  key={f.id}
                  onClick={() => toggleFriend(f.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'border-pink-600 bg-pink-600/10'
                      : isLight
                      ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      : 'border-slate-850 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700/50 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{f.name}</p>
                      <p className="text-[10px] text-pink-600 font-mono truncate">{f.handle}</p>
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
            })
          )}
        </div>

        {/* Optional Note */}
        <div className="px-4 pt-1 pb-2">
          <input
            type="text"
            placeholder="Add an optional message..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-pink-600 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          />
        </div>

        {/* Send Action Bar */}
        <div
          className={`p-4 border-t flex items-center gap-2 ${
            isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-850 bg-slate-900/80'
          }`}
        >
          <button
            onClick={() => {
              setSendItemModalItem(null);
              setSelectedFriendIds([]);
              setNote('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              isLight
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Cancel
          </button>
          <button
            disabled={selectedFriendIds.length === 0 || isSending}
            onClick={handleSend}
            className={`flex-[2] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white transition-all shadow-md ${
              selectedFriendIds.length > 0 && !isSending
                ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/30'
                : 'bg-slate-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSending
                ? 'Sending...'
                : selectedFriendIds.length === 0
                ? 'Select Friends'
                : `Send to ${selectedFriendIds.length} Friend${selectedFriendIds.length > 1 ? 's' : ''}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
