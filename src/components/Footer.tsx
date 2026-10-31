import React, { useState } from 'react';
import { Shield, Sparkles, X, Heart } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const handleOpenInfo = (title: string, body: string) => {
    setModalContent({ title, body });
  };

  return (
    <footer
      className={`border-t py-10 transition-colors mt-auto ${
        darkMode ? 'bg-slate-950 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200/90 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/40 dark:border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-600/20">
              SX
            </div>
            <div>
              <span className="text-xl font-black font-heading tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Synaps X
              </span>
              <p className="text-xs text-slate-400">“Your Digital Student Hub”</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() =>
                handleOpenInfo(
                  'About Synaps X',
                  'Synaps X is a streamlined digital launcher built specifically for college and university students. It organizes essential study platforms, collaborative tools, payment portals, coding repositories, and state-of-the-art AI assistants into a single, high-speed launchpad.'
                )
              }
              className="hover:text-indigo-400 transition-colors"
            >
              About
            </button>

            <button
              type="button"
              onClick={() =>
                handleOpenInfo(
                  'Privacy Policy & Credential Safety',
                  'Synaps X operates as a client-side digital aggregator. Synaps X does NOT record or store your bank accounts, UPI PINs, social media passwords, or academic credentials. All application buttons redirect directly to the official, secure HTTPS endpoints.'
                )
              }
              className="hover:text-indigo-400 transition-colors"
            >
              Privacy
            </button>

            <button
              type="button"
              onClick={() =>
                handleOpenInfo(
                  'Terms of Service',
                  'Synaps X is a student productivity tool providing navigational convenience to third-party services. All trademarks, service marks, and brand names belong to their respective official owners.'
                )
              }
              className="hover:text-indigo-400 transition-colors"
            >
              Terms
            </button>

            <button
              type="button"
              onClick={() =>
                handleOpenInfo(
                  'Contact Synaps X Student Team',
                  'Have suggestions for new student platforms or campus features? Reach out to support@synapsx.student or through your campus student council representative.'
                )
              }
              className="hover:text-indigo-400 transition-colors"
            >
              Contact
            </button>

            <button
              type="button"
              onClick={() =>
                handleOpenInfo(
                  'Help & FAQ',
                  'How to use Synaps X: Click on any app card to launch its official site in a new tab. Click the ⭐ star to save tools to your Favorites list. Use the top search bar (or quick topic filters) to find tools instantly.'
                )
              }
              className="hover:text-indigo-400 transition-colors"
            >
              Help
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 Synaps X. Built for students.</p>
          <div className="flex items-center gap-1.5 font-bold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synaps X — One Hub. Every Student Need.</span>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`relative w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-heading">{modalContent.title}</h3>
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 dark:text-slate-400">
              {modalContent.body}
            </p>
            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
