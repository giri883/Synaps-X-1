import React, { useState } from 'react';
import { Search, ExternalLink, Play, Sparkles, BookOpen, Code, Compass, ArrowRight } from 'lucide-react';

interface YouTubeSectionProps {
  darkMode: boolean;
  onTrackAction?: (name: string) => void;
}

export const YouTubeSection: React.FC<YouTubeSectionProps> = ({
  darkMode,
  onTrackAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
      onTrackAction?.('YouTube');
      return;
    }
    const queryUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchQuery.trim()
    )}`;
    window.open(queryUrl, '_blank', 'noopener,noreferrer');
    onTrackAction?.(`YouTube: ${searchQuery.trim()}`);
  };

  const handleTopicClick = (topicQuery: string, topicLabel: string) => {
    const queryUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      topicQuery
    )}`;
    window.open(queryUrl, '_blank', 'noopener,noreferrer');
    onTrackAction?.(`YouTube Topic: ${topicLabel}`);
  };

  const QUICK_TOPICS = [
    { label: 'Data Structures & Algorithms', query: 'data structures and algorithms full course in english', icon: Code },
    { label: 'Full-Stack Web Dev', query: 'full stack web development roadmap project tutorial', icon: Sparkles },
    { label: 'Engineering Mathematics', query: 'engineering mathematics lectures linear algebra calculus', icon: BookOpen },
    { label: 'Tech Placements & Resume', query: 'campus placement interview preparation tips resume review', icon: Compass },
    { label: 'Artificial Intelligence', query: 'machine learning deep learning generative ai full course', icon: Sparkles },
  ];

  return (
    <div
      id="youtube-education-hub"
      className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-red-950/40 via-slate-900/90 to-slate-950 border-red-500/20'
          : 'bg-gradient-to-br from-red-50/90 via-white to-orange-50/70 border-red-200 shadow-xl shadow-red-500/5'
      }`}
    >
      {/* Background ambient accents */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              <Play className="h-7 w-7 fill-white translate-x-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-2xl font-extrabold tracking-tight ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  YouTube
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/30">
                  Video Learning
                </span>
              </div>
              <p
                className={`text-sm mt-0.5 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Learn, explore, and watch educational content, programming guides, and career roadmaps.
              </p>
            </div>
          </div>

          <button
            id="open-youtube-direct"
            type="button"
            onClick={() => {
              window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
              onTrackAction?.('YouTube');
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md shadow-red-600/20 transition-all active:scale-95 self-start lg:self-auto"
          >
            <span>Open YouTube</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* YouTube Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-3xl mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-red-500" />
            <input
              id="youtube-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search YouTube for lectures, tutorials, interview prep, tech talks..."
              className={`w-full pl-12 pr-32 py-3.5 rounded-2xl text-sm font-medium transition-all outline-none border ${
                darkMode
                  ? 'bg-slate-900/90 text-white placeholder-slate-400 border-red-500/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'bg-white text-slate-900 placeholder-slate-400 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-sm'
              }`}
            />
            <button
              id="youtube-search-submit"
              type="submit"
              className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Quick Topic Chips */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Curated Student Topics:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTopicClick(topic.query, topic.label)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    darkMode
                      ? 'bg-slate-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700/60 hover:border-red-500/40'
                      : 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 shadow-xs'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-red-500" />
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
