import React from 'react';
import { ExternalLink, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  darkMode: boolean;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss, darkMode }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClass = 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10';

        if (toast.type === 'success') {
          Icon = CheckCircle;
          colorClass = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClass = 'border-amber-500/30 text-amber-400 bg-amber-500/10';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-3 ${
              darkMode ? 'bg-slate-900/95 text-white border-slate-700' : 'bg-white/95 text-slate-900 border-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl border ${colorClass} shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight">{toast.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
