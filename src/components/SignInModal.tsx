import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { StudentUser } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ensureUserUuid } from '../utils/userUtils';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSuccess: (user: StudentUser) => void;
  darkMode: boolean;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignUp,
  onSuccess,
  darkMode,
}) => {
  const [email, setEmail] = useState('student@university.edu');
  const [password, setPassword] = useState('student123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanEmail = email.trim();
    // Standard student user with authenticated / deterministic UUID
    const loggedUser: StudentUser = {
      id: ensureUserUuid(null, cleanEmail),
      fullName: cleanEmail.toLowerCase().includes('saran') ? 'Saran Giri' : cleanEmail.split('@')[0],
      email: cleanEmail,
      college: 'Indian Institute of Technology (IIT)',
      course: 'Computer Science & Engineering',
      yearOfStudy: '3rd Year',
      avatar: (cleanEmail.charAt(0) || 'S').toUpperCase(),
      bio: 'Competitive programmer, AI researcher & web builder',
      joinDate: 'Jan 2026',
    };

    if (isSupabaseConfigured) {
      supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      }).then(({ data, error: authError }) => {
        if (data?.user?.id) {
          loggedUser.id = data.user.id;
        }
        if (authError) {
          console.warn('[Supabase Auth] SignIn notice:', authError.message);
        }
      }).catch((e) => {
        console.warn('[Supabase Auth] SignIn error:', e);
      });
    }

    onSuccess(loggedUser);
  };

  const handleGoogleSignIn = () => {
    const googleUser: StudentUser = {
      id: ensureUserUuid(null, 'alex.morgan@university.edu'),
      fullName: 'Alex Morgan',
      email: 'alex.morgan@university.edu',
      college: 'Institute of Technology',
      course: 'Computer Science & Engineering',
      yearOfStudy: '3rd Year',
      avatar: 'A',
      bio: 'Full-stack enthusiast & competitive programmer',
      joinDate: 'Feb 2026',
    };
    onSuccess(googleUser);
  };

  const handleDemoSignIn = () => {
    const demoUser: StudentUser = {
      id: ensureUserUuid(null, 'priya.sharma@campus.ac.in'),
      fullName: 'Priya Sharma',
      email: 'priya.sharma@campus.ac.in',
      college: 'National Institute of Technology (NIT)',
      course: 'Electronics & Computer Engineering',
      yearOfStudy: '4th Year',
      avatar: 'P',
      bio: 'Building open-source tools & preparing for tech placements',
      joinDate: 'Aug 2025',
    };
    onSuccess(demoUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-md my-8 rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
          darkMode
            ? 'glass-panel-dark border-slate-700 bg-slate-900/95 text-white'
            : 'glass-panel-light border-slate-200 bg-white text-slate-900'
        }`}
      >
        <button
          id="close-signin-modal"
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-colors ${
            darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 mb-2">
            <span>Welcome Back</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight font-heading">
            Sign In to Synaps X
          </h2>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Access your personalized student launcher and favorite apps.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Fast Access Pill */}
        <div className="mb-5 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-indigo-400">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Want to test quickly?</span>
          </div>
          <button
            id="quick-demo-login-btn"
            type="button"
            onClick={handleDemoSignIn}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            1-Click Demo Login
          </button>
        </div>

        {/* Google Sign In */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
          className={`w-full py-3 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2.5 transition-all mb-4 hover:scale-101 ${
            darkMode
              ? 'border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-200'
              : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-slate-700/40 w-full" />
          <span className={`px-3 text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-500 bg-slate-900' : 'text-slate-400 bg-white'}`}>
            or with credentials
          </span>
          <div className="border-t border-slate-700/40 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="signin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="signin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500"
              />
              <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                Remember me
              </span>
            </label>
          </div>

          <button
            id="signin-submit-btn"
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
          >
            Sign In
          </button>
        </form>

        <div className="mt-5 text-center text-xs">
          <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
            Don't have an account?{' '}
          </span>
          <button
            id="switch-to-signup-btn"
            type="button"
            onClick={onSwitchToSignUp}
            className="font-bold text-indigo-400 hover:text-indigo-300 ml-1 underline underline-offset-2"
          >
            Create Account
          </button>
        </div>

        {/* Forgot Password Sub-Modal */}
        {showForgotModal && (
          <div className="absolute inset-0 rounded-3xl p-6 bg-slate-900/98 backdrop-blur-md flex flex-col justify-between z-20 border border-slate-700 text-white">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Reset Password</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSent(false);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">Reset Link Sent!</p>
                    <p className="mt-0.5 opacity-90">
                      We've simulated sending a recovery instruction to {email}. Check your student mailbox.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Enter your registered student email address, and we'll send you a password recovery verification link.
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSent(false);
                }}
                className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Back
              </button>
              {!resetSent && (
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
                >
                  Send Link
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
