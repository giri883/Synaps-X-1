import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Play,
  Pause,
  Square,
  Trash2,
  Plus,
  Calendar,
  IndianRupee,
  AlertCircle,
  Clock,
  PieChart,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { StudentUser, ExpenseSummary, ExpenseTrackingPeriod, ExpenseTransaction } from '../types';
import {
  getExpenseSummary,
  startTracking,
  pauseTracking,
  resumeTracking,
  stopTracking,
  deleteTrackingPeriod,
  recordExpense,
  deleteExpense,
  prepareTrackingProposal,
} from '../services/expenseService';

interface ExpenseTrackerCardProps {
  user: StudentUser | null;
  darkMode: boolean;
  onNavigateToAI?: (prompt?: string) => void;
}

export const ExpenseTrackerCard: React.FC<ExpenseTrackerCardProps> = ({
  user,
  darkMode,
  onNavigateToAI,
}) => {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStartForm, setShowStartForm] = useState(false);
  const [durationDays, setDurationDays] = useState(14);
  const [budget, setBudget] = useState<string>('3000');
  const [showProposalConfirm, setShowProposalConfirm] = useState(false);

  // Quick manual expense entry
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCat, setExpenseCat] = useState('Study Materials');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const userId = user?.id || user?.email || 'demo-user';

  const loadSummary = async () => {
    if (!user) return;
    try {
      const data = await getExpenseSummary(userId);
      setSummary(data);
    } catch (e) {
      console.warn('[ExpenseTrackerCard] loadSummary error:', e);
    }
  };

  useEffect(() => {
    loadSummary();

    const handleUpdate = () => {
      loadSummary();
    };

    window.addEventListener('synapsx_expense_updated', handleUpdate);
    return () => {
      window.removeEventListener('synapsx_expense_updated', handleUpdate);
    };
  }, [userId, user]);

  const showTempFeedback = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Start tracking after explicit confirmation
  const handleConfirmStart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await startTracking(userId, {
        durationDays: Number(durationDays) || 14,
        budget: budget ? Number(budget) : undefined,
        consentGiven: true,
      });
      setShowProposalConfirm(false);
      setShowStartForm(false);
      showTempFeedback('success', `Expenditure tracking active for ${durationDays} days!`);
      loadSummary();
    } catch (err: any) {
      showTempFeedback('error', err.message || 'Failed to start tracking.');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!user) return;
    try {
      await pauseTracking(userId);
      showTempFeedback('info', 'Expense tracking paused. New recordings are blocked until resumed.');
      loadSummary();
    } catch (err: any) {
      showTempFeedback('error', err.message);
    }
  };

  const handleResume = async () => {
    if (!user) return;
    try {
      await resumeTracking(userId);
      showTempFeedback('success', 'Expense tracking resumed.');
      loadSummary();
    } catch (err: any) {
      showTempFeedback('error', err.message);
    }
  };

  const handleStop = async () => {
    if (!user) return;
    try {
      await stopTracking(userId);
      showTempFeedback('info', 'Expense tracking stopped. Past records are kept.');
      loadSummary();
    } catch (err: any) {
      showTempFeedback('error', err.message);
    }
  };

  const handleDeletePeriod = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete this tracking period and all recorded expenses? This cannot be undone.')) {
      return;
    }
    try {
      await deleteTrackingPeriod(userId);
      showTempFeedback('info', 'Tracking period and expense records deleted.');
      loadSummary();
    } catch (err: any) {
      showTempFeedback('error', err.message);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      showTempFeedback('error', 'Please enter a valid amount.');
      return;
    }
    if (!expenseDesc.trim()) {
      showTempFeedback('error', 'Please enter a description for the expense.');
      return;
    }

    const res = await recordExpense(userId, {
      amount: amt,
      category: expenseCat,
      description: expenseDesc.trim(),
    });

    if (res.success) {
      showTempFeedback('success', res.message);
      setExpenseAmount('');
      setExpenseDesc('');
      loadSummary();
    } else {
      showTempFeedback('error', res.message);
    }
  };

  const handleDeleteItem = async (txId: string) => {
    if (!user) return;
    try {
      await deleteExpense(userId, txId);
      showTempFeedback('info', 'Transaction removed.');
      loadSummary();
    } catch (err: any) {
      showTempFeedback('error', err.message);
    }
  };

  const isTrackingOn = summary?.trackingStatus === 'active';
  const isPaused = summary?.trackingStatus === 'paused';
  const isStopped = summary?.trackingStatus === 'stopped';
  const isCompleted = summary?.trackingStatus === 'completed';
  const hasPeriod = summary?.period != null;

  return (
    <div
      id="synapsx-expense-tracker"
      className={`rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/20 border-slate-800 text-white shadow-xl'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/15 text-indigo-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base font-heading">
                Privacy-First Expenditure Monitor
              </h3>
              {/* Privacy Shield Badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                Opt-in Only
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Disabled by default. Synapse X never connects to bank accounts or reads payment history.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {isTrackingOn && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Tracking Active
            </span>
          )}
          {isPaused && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Pause className="w-3 h-3" />
              Tracking Paused
            </span>
          )}
          {isStopped && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <Square className="w-3 h-3" />
              Tracking Stopped
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
              <CheckCircle className="w-3 h-3" />
              Period Ended
            </span>
          )}
          {!hasPeriod && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
              Tracking Disabled
            </span>
          )}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`my-3 p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : feedback.type === 'error'
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* When Tracking is OFF / Disabled */}
      {(!hasPeriod || isStopped || isCompleted) && !showStartForm && !showProposalConfirm && (
        <div className="py-6 space-y-4">
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <p className="font-semibold text-sm mb-1 text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Privacy Principle: Explicit Student Control
            </p>
            Expenditure tracking is completely turned off for your account. Synapse X does not monitor UPI transactions,
            does not request bank logins, and will never record any spending without your explicit command.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowStartForm(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              Start Expense Tracking Period
            </button>

            {onNavigateToAI && (
              <button
                type="button"
                onClick={() => onNavigateToAI('Start tracking my expenses with a ₹3,000 budget for 14 days')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all border flex items-center gap-2 ${
                  darkMode
                    ? 'border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300'
                    : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Ask Central AI to Setup
              </button>
            )}
          </div>
        </div>
      )}

      {/* Start Period Form */}
      {showStartForm && !showProposalConfirm && (
        <div className="py-4 space-y-4">
          <h4 className="text-sm font-bold">Configure Opt-in Tracking Period</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Budget (Optional, ₹ INR)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 3000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowProposalConfirm(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
            >
              Review Privacy & Confirm
            </button>
            <button
              type="button"
              onClick={() => setShowStartForm(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Explicit Confirmation Proposal Modal/Card */}
      {showProposalConfirm && (
        <div
          className={`my-4 p-5 rounded-2xl border ${
            darkMode ? 'bg-indigo-950/40 border-indigo-500/40' : 'bg-indigo-50/80 border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            Explicit Student Confirmation Required
          </div>
          <p className="text-xs leading-relaxed mb-3">
            You are authorizing Synapse X to activate expenditure monitoring for{' '}
            <strong>{durationDays} days</strong>
            {budget ? ` with a budget of ₹${budget}` : ''}.
          </p>
          <ul className="text-xs space-y-1.5 list-disc list-inside opacity-90 mb-4">
            <li>Synapse X will <strong>never</strong> connect to banks or UPI apps.</li>
            <li>Expenses will be logged <strong>only</strong> when you explicitly tell Central AI or enter them here.</li>
            <li>You can pause, stop, or delete your records at any time.</li>
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmStart}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md"
            >
              {loading ? 'Activating...' : 'Yes, Confirm & Start Tracking'}
            </button>
            <button
              type="button"
              onClick={() => setShowProposalConfirm(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active or Paused Tracking Dashboard Metrics */}
      {hasPeriod && (isTrackingOn || isPaused) && (
        <div className="py-4 space-y-5">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Spent
              </span>
              <p className="text-xl font-black text-indigo-400 mt-1">
                ₹{summary?.totalSpent || 0}
              </p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Budget
              </span>
              <p className="text-xl font-black text-cyan-400 mt-1">
                {summary?.totalBudget ? `₹${summary.totalBudget}` : 'No Limit'}
              </p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Days Remaining
              </span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {summary?.daysRemaining ?? 0}d
              </p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Logged Records
              </span>
              <p className="text-xl font-black text-amber-400 mt-1">
                {summary?.transactionsCount || 0}
              </p>
            </div>
          </div>

          {/* Budget Progress Bar */}
          {summary?.totalBudget ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                  Budget Utilization: {Math.round(((summary.totalSpent || 0) / summary.totalBudget) * 100)}%
                </span>
                <span className={summary.isOverBudget ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {summary.isOverBudget
                    ? `Over budget by ₹${Math.abs(summary.totalSpent - summary.totalBudget)}`
                    : `₹${summary.remainingBudget} remaining`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    summary.isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'
                  }`}
                  style={{
                    width: `${Math.min(100, ((summary.totalSpent || 0) / summary.totalBudget) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* Quick Record Form */}
          <form
            onSubmit={handleAddExpense}
            className={`p-4 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Explicitly Log Expense
              </span>
              <span className="text-[10px] text-slate-400">
                Or tell Central AI in chat: "Spent ₹120 on lunch"
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="number"
                step="any"
                min="1"
                placeholder="Amount (₹)"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
                }`}
              />
              <select
                value={expenseCat}
                onChange={(e) => setExpenseCat(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Study Materials">Study Materials</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Transport">Transport</option>
                <option value="Tuition & Exam Fees">Tuition & Exam Fees</option>
                <option value="Personal">Personal</option>
                <option value="General">General</option>
              </select>
              <input
                type="text"
                placeholder="Description (e.g. Algorithms Book)"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!isTrackingOn}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                isTrackingOn
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isTrackingOn ? 'Record Expense' : 'Resume Tracking to Log'}
            </button>
          </form>

          {/* Controls Bar (Pause, Resume, Stop, Delete) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {isTrackingOn && (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Pause Tracking
                </button>
              )}
              {isPaused && (
                <button
                  type="button"
                  onClick={handleResume}
                  className="px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Resume Tracking
                </button>
              )}
              <button
                type="button"
                onClick={handleStop}
                className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                Stop Tracking
              </button>
            </div>

            <button
              type="button"
              onClick={handleDeletePeriod}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                darkMode ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Period & Records
            </button>
          </div>

          {/* Transactions List */}
          {summary?.recentTransactions && summary.recentTransactions.length > 0 && (
            <div className="pt-2 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Explicit Records ({summary.recentTransactions.length})
              </h5>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {summary.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      darkMode ? 'bg-slate-800/40 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold block truncate">{tx.description}</span>
                      <span className="text-[10px] text-slate-400">
                        {tx.category} • {tx.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ml-2">
                      <span className="font-extrabold text-indigo-400">₹{tx.amount}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(tx.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Delete expense entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
