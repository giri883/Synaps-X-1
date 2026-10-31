import React from 'react';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface PaymentSecurityNoticeProps {
  darkMode: boolean;
}

export const PaymentSecurityNotice: React.FC<PaymentSecurityNoticeProps> = ({ darkMode }) => {
  return (
    <div
      id="payment-security-disclaimer"
      className={`rounded-2xl p-5 mb-6 border transition-all ${
        darkMode
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold tracking-tight">
              Verified Official Payment Redirection Hub
            </h4>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                darkMode
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-emerald-200/60 text-emerald-800'
              }`}
            >
              <Lock className="w-2.5 h-2.5" />
              100% Client-Side Launcher
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            <strong>Important Security Notice:</strong> Synaps X is solely an aggregator and launcher. Synaps X does{' '}
            <strong>NOT</strong> process transactions, host gateways, or store your banking credentials, UPI PIN,
            card information, ATM passwords, or payment details. Clicking any payment service opens their official,
            encrypted banking portal directly.
          </p>
        </div>
      </div>
    </div>
  );
};
