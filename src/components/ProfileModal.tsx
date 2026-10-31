import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  School,
  BookOpen,
  Calendar,
  Star,
  LogOut,
  Edit3,
  KeyRound,
  CheckCircle2,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { StudentUser, AppItem } from '../types';
import { AppIcon } from './AppIcon';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StudentUser;
  onUpdateUser: (updated: StudentUser) => void;
  onLogout: () => void;
  favoriteApps: AppItem[];
  onOpenApp: (app: AppItem) => void;
  onRemoveFavorite: (id: string) => void;
  darkMode: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  favoriteApps,
  onOpenApp,
  onRemoveFavorite,
  darkMode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(user.fullName);
  const [editCollege, setEditCollege] = useState(user.college);
  const [editCourse, setEditCourse] = useState(user.course);
  const [editYear, setEditYear] = useState(user.yearOfStudy);
  const [editBio, setEditBio] = useState(user.bio || '');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      fullName: editName.trim() || user.fullName,
      college: editCollege.trim() || user.college,
      course: editCourse.trim() || user.course,
      yearOfStudy: editYear,
      bio: editBio.trim(),
      avatar: (editName.trim() || user.fullName).charAt(0).toUpperCase(),
    });
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!oldPassword || !newPassword) {
      setPasswordError('Please provide both current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setPasswordSuccess(true);
    setTimeout(() => {
      setShowPasswordChange(false);
      setPasswordSuccess(false);
      setOldPassword('');
      setNewPassword('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl my-8 rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
          darkMode
            ? 'glass-panel-dark border-slate-700 bg-slate-900/95 text-white'
            : 'glass-panel-light border-slate-200 bg-white text-slate-900'
        }`}
      >
        <button
          id="close-profile-modal"
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-colors ${
            darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-200/40 dark:border-slate-800/80 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/30">
              {user.avatar || 'S'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Student Status: Active" />
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black tracking-tight font-heading">
                  {user.fullName}
                </h2>
                <p className="text-xs text-indigo-400 font-medium">{user.email}</p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <button
                  id="edit-profile-toggle-btn"
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    isEditing
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : darkMode
                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>

                <button
                  id="profile-logout-btn"
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            <p className={`text-xs mt-2 italic ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              "{user.bio || 'Focused student leveraging Synaps X for smart academic productivity.'}"
            </p>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 mb-6">
            <h3 className="text-sm font-bold tracking-tight text-indigo-400 uppercase">
              Update Student Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Year of Study</label>
                <select
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="PhD / Research">PhD / Research</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">College / Institution</label>
                <input
                  type="text"
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Course / Major</label>
                <input
                  type="text"
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Bio / Goals</label>
              <textarea
                rows={2}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Share your academic goals or tech interests..."
                className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <button
              id="save-profile-btn"
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Save Profile Changes
            </button>
          </form>
        ) : (
          /* Profile Details Cards */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <School className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Institution</span>
              </div>
              <p className="text-xs font-bold truncate">{user.college}</p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Course</span>
              </div>
              <p className="text-xs font-bold truncate">{user.course}</p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Academic Year</span>
              </div>
              <p className="text-xs font-bold">{user.yearOfStudy}</p>
            </div>
          </div>
        )}

        {/* Change Password Dropdown Panel */}
        <div className="mb-6 pt-2">
          <div className="flex items-center justify-between">
            <button
              id="change-password-toggle"
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <KeyRound className="w-4 h-4" />
              <span>{showPasswordChange ? 'Hide Password Settings' : 'Change Password'}</span>
            </button>
          </div>

          {showPasswordChange && (
            <form onSubmit={handleChangePassword} className={`mt-3 p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'} space-y-3`}>
              {passwordError && (
                <p className="text-xs text-rose-400">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Password updated successfully!
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs border outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
                <input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs border outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Favorite Applications Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <h3 className="text-sm font-bold tracking-tight">
                My Pinned Favorites ({favoriteApps.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Quick Launchpad</span>
          </div>

          {favoriteApps.length === 0 ? (
            <div className={`p-4 rounded-2xl border text-center text-xs ${
              darkMode ? 'border-dashed border-slate-700 text-slate-400' : 'border-dashed border-slate-300 text-slate-500'
            }`}>
              No favorites pinned yet. Click the ⭐ star icon on any application card in your dashboard to pin them here!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {favoriteApps.map((app) => (
                <div
                  key={app.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`p-1.5 rounded-lg ${app.color.bg} ${app.color.text}`}>
                      <AppIcon name={app.iconName} className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{app.name}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{app.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenApp(app)}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                      title="Launch app"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFavorite(app.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-rose-400 text-xs"
                      title="Unpin favorite"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
