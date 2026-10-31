import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Check,
  GraduationCap,
  Menu,
  X,
  Star,
  Clock,
} from 'lucide-react';
import { StudentUser, NotificationItem } from '../types';

interface NavbarProps {
  user: StudentUser | null;
  onOpenProfile: () => void;
  onLogout: () => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
  onToggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenProfile,
  onLogout,
  onOpenSignIn,
  onOpenSignUp,
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationRead,
  activeCategory,
  onSelectCategory,
  onToggleMobileMenu,
  mobileMenuOpen,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        darkMode
          ? 'bg-slate-950/85 border-slate-800/80 text-white'
          : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={onToggleMobileMenu}
            className={`lg:hidden p-2 rounded-xl border transition-colors ${
              darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onSelectCategory('all')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg tracking-tight">SX</span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight font-heading bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Synaps X
              </span>
              <span className="hidden sm:block text-[9px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Student Digital Hub
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 35+ Hub apps, tasks, LeetCode, Synaps AI..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                  : 'bg-slate-100/90 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/30'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl border transition-colors ${
              darkMode
                ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-btn"
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserDropdown(false);
              }}
              className={`relative p-2 rounded-xl border transition-colors ${
                darkMode
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title="Student Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-4 border shadow-2xl z-50 transition-all ${
                  darkMode
                    ? 'glass-panel-dark bg-slate-900/95 border-slate-700 text-white'
                    : 'glass-panel-light bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      Student Alerts & Updates
                    </h4>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        !n.read
                          ? darkMode
                            ? 'bg-indigo-950/30 border-indigo-500/30'
                            : 'bg-indigo-50/70 border-indigo-200'
                          : darkMode
                          ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold">{n.title}</span>
                        <span className="text-[10px] opacity-60 font-mono">{n.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Sign In / Up */}
          {user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                type="button"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all ${
                  darkMode
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-xs'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.avatar || 'S'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-none truncate max-w-[100px]">
                    {user.fullName.split(' ')[0]}
                  </p>
                  <span className="text-[10px] text-slate-400 leading-none">
                    {user.yearOfStudy}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-2xl p-2 border shadow-2xl z-50 ${
                    darkMode
                      ? 'glass-panel-dark bg-slate-900/95 border-slate-700 text-white'
                      : 'glass-panel-light bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="p-2.5 border-b border-slate-700/40 mb-1">
                    <p className="text-xs font-bold truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.college}</p>
                  </div>

                  <button
                    id="menu-open-profile-btn"
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenProfile();
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                      darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>View Profile</span>
                  </button>

                  <button
                    id="menu-logout-btn"
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenSignIn}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={onOpenSignUp}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
