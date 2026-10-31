import React from 'react';
import {
  Sparkles,
  Search,
  Star,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  GraduationCap,
  MessageSquare,
  Share2,
  CreditCard,
  PlayCircle,
  Bot,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AppItem, AppCategory, StudentUser, RecentlyUsedItem, StudentTask } from '../types';
import { CATEGORIES, CategoryMeta } from '../data/appsData';
import { AppCard } from './AppCard';
import { YouTubeSection } from './YouTubeSection';
import { PaymentSecurityNotice } from './PaymentSecurityNotice';
import { ExpenseTrackerCard } from './ExpenseTrackerCard';
import { AppIcon } from './AppIcon';

interface DashboardViewProps {
  user: StudentUser;
  apps: AppItem[];
  favorites: string[];
  recentlyUsed: RecentlyUsedItem[];
  tasks?: StudentTask[];
  onToggleFavorite: (id: string) => void;
  onOpenApp: (app: AppItem) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onNavigateToTasks?: () => void;
  onNavigateToAI?: (prompt?: string) => void;
  darkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  apps,
  favorites,
  recentlyUsed,
  tasks = [],
  onToggleFavorite,
  onOpenApp,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  onNavigateToTasks,
  onNavigateToAI,
  darkMode,
}) => {
  // Favorite App Objects
  const favoriteApps = apps.filter((app) => favorites.includes(app.id));

  // Recently used apps with resolved objects and time strings
  const resolvedRecentlyUsed = recentlyUsed
    .map((item) => {
      const found = apps.find((a) => a.id === item.appId);
      if (!found) return null;
      const minutesAgo = Math.max(1, Math.round((Date.now() - item.timestamp) / (1000 * 60)));
      const timeString =
        minutesAgo < 2
          ? 'Just now'
          : minutesAgo < 60
          ? `${minutesAgo}m ago`
          : `${Math.round(minutesAgo / 60)}h ago`;
      return { app: found, timeString };
    })
    .filter(Boolean) as { app: AppItem; timeString: string }[];

  // Filter apps based on search query or active category
  const filteredApps = apps.filter((app) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeCategory === 'favorites') {
      return favorites.includes(app.id);
    }
    if (activeCategory === 'recent') {
      return recentlyUsed.some((r) => r.appId === app.id);
    }
    if (activeCategory === 'all') {
      return true;
    }
    return app.category === activeCategory;
  });

  const getCategoryTitle = (catId: string) => {
    if (catId === 'all') return 'All Student Applications';
    if (catId === 'favorites') return 'My Pinned Favorites';
    if (catId === 'recent') return 'Recently Used Applications';
    const found = CATEGORIES.find((c) => c.id === catId);
    return found ? `${found.emoji} ${found.label}` : 'Applications';
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Hero Banner */}
      <section
        id="welcome-banner"
        className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden transition-all duration-300 ${
          darkMode
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800 shadow-xl'
            : 'bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/70 border-slate-200/80 shadow-md shadow-indigo-500/5'
        }`}
      >
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{user.college}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading mb-2">
              Welcome back, {user.fullName.split(' ')[0]} 👋
            </h1>

            <p
              className={`text-sm max-w-2xl ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Everything you need for your academic and digital life. Select any tool below for instant, official redirection.
            </p>
          </div>

          {/* Student Status Stats Pills */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div
              className={`px-4 py-3 rounded-2xl border text-center flex-1 sm:flex-initial ${
                darkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <span className="text-xl font-black text-indigo-500">{apps.length}</span>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                Total Hub Apps
              </p>
            </div>

            <div
              className={`px-4 py-3 rounded-2xl border text-center flex-1 sm:flex-initial cursor-pointer hover:border-amber-400 transition-colors ${
                darkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-xs'
              }`}
              onClick={() => onSelectCategory('favorites')}
            >
              <span className="text-xl font-black text-amber-400">{favorites.length}</span>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                Favorites
              </p>
            </div>

            <div
              className={`px-4 py-3 rounded-2xl border text-center flex-1 sm:flex-initial ${
                darkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <span className="text-xl font-black text-cyan-400">{user.yearOfStudy.split(' ')[0]}</span>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                Semester/Yr
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence & Task Hub Quick Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Synaps AI Card */}
        <div
          onClick={() => onNavigateToAI && onNavigateToAI()}
          className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-101 relative overflow-hidden group ${
            darkMode
              ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/60 shadow-lg'
              : 'bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 border-indigo-200 hover:border-indigo-400 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm font-heading block">Synaps AI Copilot</span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  Centralized Orchestrator
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950">
              SMART
            </span>
          </div>

          <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Generate tailored 7-day DSA sprints, software engineering interview plans, or daily timetables coordinating your hub tools.
          </p>

          <div className="flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
            <span>Open Synaps AI Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Task Manager Card */}
        <div
          onClick={() => onNavigateToTasks && onNavigateToTasks()}
          className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-101 relative overflow-hidden group ${
            darkMode
              ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/20 border-slate-800 hover:border-cyan-500/50 shadow-lg'
              : 'bg-gradient-to-br from-white via-slate-50 to-cyan-50/60 border-slate-200 hover:border-cyan-400 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-600/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm font-heading block">Smart Task Manager</span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Local Tracking
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400">
              {tasks.filter((t) => t.status !== 'completed').length} Pending
            </span>
          </div>

          <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Track your assignments, milestones, and practice sets. Subtask checklists with deadlines and zero external credentials needed.
          </p>

          <div className="flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
            <span>View Tasks Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Category Quick Selector Chips */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Explore Categories
          </h2>
          {activeCategory !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Reset to All Apps
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeCategory === 'all'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : darkMode
                ? 'glass-panel-dark border-slate-800 hover:border-slate-700 text-slate-300'
                : 'glass-panel-light border-slate-200 hover:border-indigo-300 text-slate-700 shadow-xs'
            }`}
          >
            <span className="text-lg">🏠</span>
            <p className="text-xs font-bold mt-1 truncate">All Apps</p>
            <span className="text-[10px] opacity-70">{apps.length} tools</span>
          </button>

          {CATEGORIES.map((cat) => {
            const count = apps.filter((a) => a.category === cat.id).length;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-card-${cat.id}`}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : darkMode
                    ? 'glass-panel-dark border-slate-800 hover:border-slate-700 text-slate-300'
                    : 'glass-panel-light border-slate-200 hover:border-indigo-300 text-slate-700 shadow-xs'
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <p className="text-xs font-bold mt-1 truncate">{cat.label.split(' ')[0]}</p>
                <span className="text-[10px] opacity-70">{count} apps</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recently Used Section (when in All or Recent view) */}
      {(activeCategory === 'all' || activeCategory === 'recent') &&
        resolvedRecentlyUsed.length > 0 &&
        !searchQuery && (
          <section id="recently-used-section" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold tracking-tight">Recently Used</h3>
              </div>
              <span className="text-xs text-slate-400">Fast resumption</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {resolvedRecentlyUsed.slice(0, 6).map(({ app, timeString }) => (
                <div
                  key={app.id}
                  onClick={() => onOpenApp(app)}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-102 ${
                    darkMode
                      ? 'glass-panel-dark border-slate-800 hover:border-cyan-500/40'
                      : 'glass-panel-light border-slate-200 hover:border-cyan-400 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`p-2 rounded-xl ${app.color.bg} ${app.color.text}`}>
                      <AppIcon name={app.iconName} className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{app.name}</p>
                      <span className="text-[10px] text-cyan-400 font-medium block">
                        {timeString}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}

      {/* YouTube Interactive Hub (Shown in All or Entertainment category) */}
      {(activeCategory === 'all' || activeCategory === 'entertainment') && !searchQuery && (
        <section className="pt-2">
          <YouTubeSection
            darkMode={darkMode}
            onTrackAction={(name) => {
              const youtubeApp = apps.find((a) => a.id === 'youtube-main');
              if (youtubeApp) onOpenApp(youtubeApp);
            }}
          />
        </section>
      )}

      {/* Payments Security Notice & Opt-in Expenditure Monitor (Shown in All or Payments category) */}
      {(activeCategory === 'all' || activeCategory === 'payments') && !searchQuery && (
        <section className="pt-2 space-y-4">
          <PaymentSecurityNotice darkMode={darkMode} />
          <ExpenseTrackerCard
            user={user}
            darkMode={darkMode}
            onNavigateToAI={onNavigateToAI}
          />
        </section>
      )}

      {/* Main Apps Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/80 pb-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight font-heading">
              {searchQuery ? `Search Results for "${searchQuery}"` : getCategoryTitle(activeCategory)}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredApps.length} student services
            </p>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              Clear Search
            </button>
          )}
        </div>

        {filteredApps.length === 0 ? (
          <div
            className={`p-12 rounded-3xl border text-center space-y-3 ${
              darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold">No applications found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No applications matched your search "{searchQuery}". Try searching for categories like
              "Study", "Code", "Paytm", "AI", or "GitHub".
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              View All Applications
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isFavorite={favorites.includes(app.id)}
                onToggleFavorite={onToggleFavorite}
                onOpenApp={onOpenApp}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
