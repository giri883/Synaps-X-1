import React, { useState } from 'react';
import { X, Lock, Mail, User, School, BookOpen, Calendar, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { StudentUser } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ensureUserUuid } from '../utils/userUtils';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
  onSuccess: (user: StudentUser) => void;
  darkMode: boolean;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignIn,
  onSuccess,
  darkMode,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || !email.trim() || !password || !college.trim() || !course.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const assignedId = ensureUserUuid(null, email.trim());
    const newUser: StudentUser = {
      id: assignedId,
      fullName: fullName.trim(),
      email: email.trim(),
      college: college.trim(),
      course: course.trim(),
      yearOfStudy,
      avatar: fullName.trim().charAt(0).toUpperCase(),
      bio: `${course} student at ${college}`,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    if (isSupabaseConfigured) {
      supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            college: college.trim(),
            course: course.trim(),
          },
        },
      }).then(({ data, error: authError }) => {
        if (authError) {
          console.warn('[Supabase Auth] SignUp notice:', authError.message);
        } else if (data?.user?.id) {
          newUser.id = data.user.id;
        }
      }).catch((e) => {
        console.warn('[Supabase Auth] SignUp error:', e);
      });
    }

    onSuccess(newUser);
  };

  const handleGoogleSignUp = () => {
    const googleUser: StudentUser = {
      id: ensureUserUuid(null, 'alex.morgan@university.edu'),
      fullName: 'Alex Morgan',
      email: 'alex.morgan@university.edu',
      college: 'Institute of Technology',
      course: 'Computer Science & Engineering',
      yearOfStudy: '3rd Year',
      avatar: 'A',
      bio: 'Full-stack enthusiast & competitive programmer',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    onSuccess(googleUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-lg my-8 rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
          darkMode
            ? 'glass-panel-dark border-slate-700 bg-slate-900/95 text-white'
            : 'glass-panel-light border-slate-200 bg-white text-slate-900'
        }`}
      >
        <button
          id="close-signup-modal"
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
            <span>Synaps X Account</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight font-heading">
            Create Student Account
          </h2>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Join your personalized digital academic launcher in seconds.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Continue */}
        <button
          id="google-signup-btn"
          type="button"
          onClick={handleGoogleSignUp}
          className={`w-full py-3 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2.5 transition-all mb-5 hover:scale-101 ${
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
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-700/40 w-full" />
          <span className={`px-3 text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-500 bg-slate-900' : 'text-slate-400 bg-white'}`}>
            or with student email
          </span>
          <div className="border-t border-slate-700/40 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="signup-name-input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Saran Giri"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="signup-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@college.edu"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="signup-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-semibold mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="signup-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">Password Strength:</span>
                <span className="font-semibold">{strengthLabels[Math.min(strengthScore, 4)]}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden flex gap-1">
                {[0, 1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all ${
                      step <= strengthScore ? strengthColors[Math.min(strengthScore, 4)] : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">College / Institution *</label>
              <div className="relative">
                <School className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="signup-college-input"
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Stanford / IIT / University"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Year of Study</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <select
                  id="signup-year-select"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all appearance-none ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
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
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Course / Major *</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="signup-course-input"
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech Computer Science / AI / Data Science"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            className="w-full mt-3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
          >
            Create Account
          </button>
        </form>

        <div className="mt-5 text-center text-xs">
          <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
            Already have an account?{' '}
          </span>
          <button
            id="switch-to-signin-btn"
            type="button"
            onClick={onSwitchToSignIn}
            className="font-bold text-indigo-400 hover:text-indigo-300 ml-1 underline underline-offset-2"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
