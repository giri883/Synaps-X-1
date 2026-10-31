import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  GraduationCap,
  MessageSquare,
  Globe,
  CreditCard,
  PlayCircle,
  Bot,
  ExternalLink,
  Lock,
  Compass,
  Star,
  CheckCircle,
  Layers,
} from 'lucide-react';
import { CATEGORIES, APPS_DATA } from '../data/appsData';

interface LandingPageProps {
  onOpenSignUp: () => void;
  onOpenSignIn: () => void;
  onExploreDemo: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenSignUp,
  onOpenSignIn,
  onExploreDemo,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 flex flex-col justify-between selection:bg-indigo-500 selection:text-white`}>
      {/* Top Navigation */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        darkMode ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <span className="font-extrabold text-xl tracking-tighter">SX</span>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight font-heading bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Synaps X
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Student Digital Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="theme-toggle-landing"
              type="button"
              onClick={onToggleDarkMode}
              className={`p-2.5 rounded-xl border transition-colors ${
                darkMode
                  ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button
              id="nav-signin-btn"
              type="button"
              onClick={onOpenSignIn}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                darkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Sign In
            </button>

            <button
              id="nav-signup-btn"
              type="button"
              onClick={onOpenSignUp}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all hover:scale-102 active:scale-98"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Ambient lighting glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>One Hub. Every Student Need.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-heading max-w-4xl mx-auto leading-[1.1] mb-6">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Synaps X
            </span>
            <br />
            <span className={darkMode ? 'text-slate-100' : 'text-slate-900'}>
              Your Digital Student Hub
            </span>
          </h1>

          <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-normal leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Everything students need, connected in one place. Instant access to study platforms, communication apps, coding portals, payment services, and cutting-edge AI tools.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              id="hero-signup-btn"
              type="button"
              onClick={onOpenSignUp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
            >
              <span>Get Started — Sign Up</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="hero-signin-btn"
              type="button"
              onClick={onOpenSignIn}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base border transition-all hover:scale-102 active:scale-98 ${
                darkMode
                  ? 'bg-slate-900/80 border-slate-700 hover:bg-slate-800 text-white'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-900 shadow-sm'
              }`}
            >
              <span>Sign In to Hub</span>
            </button>

            <button
              id="hero-demo-btn"
              type="button"
              onClick={onExploreDemo}
              className={`w-full sm:w-auto px-5 py-4 rounded-2xl font-semibold text-sm transition-all underline underline-offset-4 ${
                darkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              Explore Live Demo →
            </button>
          </div>

          {/* Interactive Interactive Dashboard Mockup Visual */}
          <div className={`rounded-3xl p-3 sm:p-5 border shadow-2xl transition-all max-w-5xl mx-auto text-left relative ${
            darkMode
              ? 'glass-panel-dark border-indigo-500/20 shadow-indigo-500/10'
              : 'glass-panel-light border-slate-300/80 shadow-2xl shadow-indigo-500/10'
          }`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/40 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono ml-2 opacity-50">synapsx.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Zap className="w-3.5 h-3.5" />
                <span>35+ Curated Applications</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {APPS_DATA.slice(0, 8).map((app) => (
                <div
                  key={app.id}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    darkMode
                      ? 'bg-slate-900/60 border-slate-800/80'
                      : 'bg-white/80 border-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${app.color.bg} ${app.color.text}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{app.name}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{app.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Overview Showcase */}
      <section className={`py-16 border-t ${
        darkMode ? 'border-slate-800/80 bg-slate-900/30' : 'border-slate-200/80 bg-slate-100/50'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mb-3">
              One Unified Interface for Every Academic Need
            </h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Clean direct launchpads. No recreated clone interfaces — we connect you directly to the verified official websites.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
                  darkMode
                    ? 'glass-panel-dark border-slate-800/90 hover:border-indigo-500/40'
                    : 'glass-panel-light border-slate-200 hover:border-indigo-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h3 className="font-bold text-base">{cat.label}</h3>
                </div>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Student Trust Banner */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6">
        <div className={`rounded-3xl p-6 sm:p-8 border ${
          darkMode
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/20'
            : 'bg-gradient-to-r from-indigo-50 via-white to-cyan-50 border-indigo-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">
                Zero Data Interception. Absolute Student Privacy.
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Synaps X never handles or stores your passwords, UPI PINs, ATM keys, or personal credentials. Every click safely navigates you straight to official HTTPS destinations via modern secure browser sandboxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className={`border-t py-12 ${
        darkMode ? 'border-slate-800/80 bg-slate-950' : 'border-slate-200/80 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/30 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                SX
              </div>
              <div>
                <span className="text-xl font-bold font-heading">Synaps X</span>
                <p className="text-xs text-slate-400">“Your Digital Student Hub”</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
              <button type="button" onClick={onExploreDemo} className="hover:text-indigo-400 transition-colors">
                About
              </button>
              <button type="button" onClick={onExploreDemo} className="hover:text-indigo-400 transition-colors">
                Privacy
              </button>
              <button type="button" onClick={onExploreDemo} className="hover:text-indigo-400 transition-colors">
                Terms
              </button>
              <button type="button" onClick={onExploreDemo} className="hover:text-indigo-400 transition-colors">
                Contact
              </button>
              <button type="button" onClick={onExploreDemo} className="hover:text-indigo-400 transition-colors">
                Help
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>© 2026 Synaps X. Built for students.</p>
            <p className="font-semibold text-indigo-400">
              Synaps X — One Hub. Every Student Need.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
