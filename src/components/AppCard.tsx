import React from 'react';
import { ExternalLink, Star, ShieldCheck } from 'lucide-react';
import { AppItem } from '../types';
import { AppIcon } from './AppIcon';

interface AppCardProps {
  app: AppItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenApp: (app: AppItem) => void;
  darkMode: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  isFavorite,
  onToggleFavorite,
  onOpenApp,
  darkMode,
}) => {
  const isPayment = app.category === 'payments';

  return (
    <div
      id={`app-card-${app.id}`}
      className={`group relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${
        darkMode
          ? 'glass-panel-dark hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10'
          : 'glass-panel-light hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10'
      }`}
    >
      <div>
        {/* Top Header: Icon, Badges, Favorite */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 border ${app.color.bg} ${app.color.border} ${app.color.text}`}
            >
              <AppIcon name={app.iconName} className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3
                  className={`text-base font-bold tracking-tight transition-colors group-hover:text-indigo-500 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {app.name}
                </h3>
                {app.badge && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      darkMode
                        ? 'bg-slate-800 text-indigo-300 border border-indigo-500/20'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {app.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs capitalize font-medium ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {app.category === 'entertainment' ? 'Video & Hub' : app.category}
              </span>
            </div>
          </div>

          <button
            id={`fav-btn-${app.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(app.id);
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isFavorite
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 scale-105'
                : darkMode
                ? 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
            }`}
          >
            <Star
              className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`}
            />
          </button>
        </div>

        {/* Description */}
        <p
          className={`text-xs leading-relaxed line-clamp-2 mb-3.5 ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {app.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {app.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                darkMode
                  ? 'bg-slate-800/80 text-slate-400'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Action button & Security indicator */}
      <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800/80 flex items-center justify-between gap-2">
        {isPayment ? (
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Portal</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            {new URL(app.url).hostname.replace('www.', '')}
          </span>
        )}

        <button
          id={`open-btn-${app.id}`}
          type="button"
          onClick={() => onOpenApp(app)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 ${
            isPayment
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40'
          }`}
        >
          <span>Open {app.name.split(' ')[0]}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
