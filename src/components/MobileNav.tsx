import React from 'react';
import {
  Home,
  GraduationCap,
  MessageSquare,
  Share2,
  CreditCard,
  PlayCircle,
  Zap,
  Bot,
  Star,
  Clock,
  User,
  X,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  favoritesCount: number;
  recentlyUsedCount: number;
  pendingTasksCount?: number;
  onOpenProfile: () => void;
  darkMode: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  favoritesCount,
  recentlyUsedCount,
  pendingTasksCount = 0,
  onOpenProfile,
  darkMode,
}) => {
  const CORE_ITEMS = [
    { id: 'all', label: 'Home', icon: Home, emoji: '🏠' },
    { id: 'synaps-ai', label: 'Central AI', icon: Sparkles, emoji: '🤖', badge: 'ORCHESTRATOR' },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare, emoji: '📋', count: pendingTasksCount },
  ];

  const CATEGORY_ITEMS = [
    { id: 'study', label: 'Study & Learning', icon: GraduationCap, emoji: '📚' },
    { id: 'communication', label: 'Communication', icon: MessageSquare, emoji: '💬' },
    { id: 'social', label: 'Social', icon: Share2, emoji: '🌐' },
    { id: 'payments', label: 'Payments', icon: CreditCard, emoji: '💳' },
    { id: 'entertainment', label: 'Entertainment', icon: PlayCircle, emoji: '▶️' },
    { id: 'productivity', label: 'Productivity', icon: Zap, emoji: '⚡' },
    { id: 'ai', label: 'AI Tools', icon: Bot, emoji: '✨' },
  ];

  return (
    <>
      {/* Mobile Drawer (When Open) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <div
            className={`relative w-4/5 max-w-xs h-full p-5 flex flex-col justify-between overflow-y-auto z-10 border-r ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/40">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                    SX
                  </div>
                  <span className="font-black text-lg font-heading">Synaps X</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Core Hubs */}
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                Intelligence & Workspaces
              </span>

              <nav className="space-y-1 mb-4">
                {CORE_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      activeCategory === item.id
                        ? 'bg-indigo-600 text-white'
                        : darkMode
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-400 text-slate-950">
                        {item.badge}
                      </span>
                    )}
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                Application Categories
              </span>

              <nav className="space-y-1">
                {CATEGORY_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                      activeCategory === item.id
                        ? 'bg-indigo-600 text-white'
                        : darkMode
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-4 mt-4 border-t border-slate-700/40 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('favorites');
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    activeCategory === 'favorites' ? 'bg-amber-500 text-black font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>My Favorites</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-400">
                    {favoritesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('recent');
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    activeCategory === 'recent' ? 'bg-cyan-600 text-white' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Recently Used</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-400/20 text-cyan-400">
                    {recentlyUsedCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenProfile();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Student Profile</span>
                </button>
              </div>
            </div>

            <div className="pt-4 text-[10px] text-slate-400 text-center border-t border-slate-700/40">
              Synaps X — One Hub. Every Student Need.
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Navigation Bar */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-2 py-1.5 flex items-center justify-around ${
          darkMode ? 'bg-slate-950/90 border-slate-800 text-slate-400' : 'bg-white/90 border-slate-200 text-slate-600'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            activeCategory === 'all' ? 'text-indigo-500 font-bold' : ''
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory('synaps-ai')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            activeCategory === 'synaps-ai' ? 'text-indigo-500 font-bold' : ''
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-indigo-400" />
          <span>Synaps AI</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory('tasks')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold relative ${
            activeCategory === 'tasks' ? 'text-indigo-500 font-bold' : ''
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5" />
          <span>Tasks</span>
          {pendingTasksCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory('favorites')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold relative ${
            activeCategory === 'favorites' ? 'text-amber-400 font-bold' : ''
          }`}
        >
          <Star className="w-4 h-4 mb-0.5" />
          <span>Favorites</span>
          {favoritesCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold"
        >
          <User className="w-4 h-4 mb-0.5" />
          <span>Profile</span>
        </button>
      </div>
    </>
  );
};
