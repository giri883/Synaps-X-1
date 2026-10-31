import {
  ExpenseTrackingPeriod,
  ExpenseTransaction,
  ExpenseSummary,
  ExpenseTrackingProposal,
  ExpenseTrackingStatus,
} from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ensureUserUuid, getUserStorageKey, isUuid } from '../utils/userUtils';
import { appStorage } from '../utils/storage';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function notifyExpenseUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('synapsx_expense_updated'));
  }
}

/**
 * Returns the current date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculates end date string (YYYY-MM-DD) given duration in days
 */
export function calculateEndDate(startDate: string, durationDays: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + Math.max(1, durationDays));
  return d.toISOString().split('T')[0];
}

/**
 * Formats tracking proposal for explicit student confirmation before activation
 */
export function prepareTrackingProposal(
  durationDays: number,
  budget?: number,
  currency = 'INR'
): ExpenseTrackingProposal {
  const startDate = getTodayDateString();
  const endDate = calculateEndDate(startDate, durationDays);

  return {
    durationDays,
    budget,
    currency,
    startDate,
    endDate,
    disclaimer:
      'Synapse X Privacy Guarantee: Expenditure monitoring is strictly opt-in. We never connect to bank portals, collect UPI PINs, or read third-party payment apps automatically. Only expenses you explicitly record will be tracked.',
  };
}

/**
 * Retrieve user's current or latest tracking period.
 * Fallback to user-scoped localStorage.
 */
export async function getActivePeriod(userId: string): Promise<ExpenseTrackingPeriod | null> {
  const cleanUserId = ensureUserUuid(null, userId);

  // Check Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('expense_tracking_periods')
        .select('*')
        .eq('user_id', cleanUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const period: ExpenseTrackingPeriod = {
          id: row.id,
          userId: row.user_id,
          status: row.status as ExpenseTrackingStatus,
          startDate: row.start_date.split('T')[0],
          endDate: row.end_date.split('T')[0],
          durationDays: row.duration_days,
          budget: row.budget ? Number(row.budget) : undefined,
          currency: row.currency || 'INR',
          consentGiven: Boolean(row.consent_given),
          createdAt: new Date(row.created_at).getTime(),
          updatedAt: new Date(row.updated_at).getTime(),
        };

        // Check if tracking reached its end date
        const today = getTodayDateString();
        if (period.status === 'active' && period.endDate < today) {
          period.status = 'completed';
          await updatePeriodStatusInCloud(period.id, cleanUserId, 'completed');
        }

        // Cache locally in user-scoped storage
        savePeriodLocally(cleanUserId, period);
        return period;
      }
    } catch (e) {
      console.warn('[ExpenseService] Cloud getActivePeriod error:', e);
    }
  }

  // Fallback to user-isolated localStorage
  return getPeriodLocally(cleanUserId);
}

function getPeriodLocally(userId: string): ExpenseTrackingPeriod | null {
  const key = getUserStorageKey('synapsx_expense_period', userId);
  const raw = appStorage.getItem(key);
  if (!raw) return null;
  try {
    const period: ExpenseTrackingPeriod = JSON.parse(raw);
    const today = getTodayDateString();
    if (period.status === 'active' && period.endDate < today) {
      period.status = 'completed';
      savePeriodLocally(userId, period);
    }
    return period;
  } catch {
    return null;
  }
}

function savePeriodLocally(userId: string, period: ExpenseTrackingPeriod | null) {
  const key = getUserStorageKey('synapsx_expense_period', userId);
  if (!period) {
    appStorage.removeItem(key);
  } else {
    appStorage.setItem(key, JSON.stringify(period));
  }
  notifyExpenseUpdate();
}

async function updatePeriodStatusInCloud(periodId: string, userId: string, status: ExpenseTrackingStatus): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase
      .from('expense_tracking_periods')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', periodId)
      .eq('user_id', userId);
  } catch (e) {
    console.warn('[ExpenseService] Cloud status update notice:', e);
  }
}

/**
 * Checks whether expenditure tracking is currently active for this user.
 * Default is FALSE (privacy-first opt-in).
 */
export async function isTrackingActive(userId: string): Promise<boolean> {
  const period = await getActivePeriod(userId);
  if (!period) return false;
  if (period.status !== 'active') return false;
  const today = getTodayDateString();
  return period.endDate >= today;
}

/**
 * Starts a new tracking period with explicit user consent.
 */
export async function startTracking(
  userId: string,
  params: {
    durationDays: number;
    budget?: number;
    currency?: string;
    consentGiven: boolean;
  }
): Promise<ExpenseTrackingPeriod> {
  if (!params.consentGiven) {
    throw new Error('Explicit student confirmation is required before expense monitoring can begin.');
  }

  const cleanUserId = ensureUserUuid(null, userId);
  const startDate = getTodayDateString();
  const endDate = calculateEndDate(startDate, params.durationDays);
  const periodId = generateUuid();
  const now = Date.now();

  const period: ExpenseTrackingPeriod = {
    id: periodId,
    userId: cleanUserId,
    status: 'active',
    startDate,
    endDate,
    durationDays: params.durationDays,
    budget: params.budget,
    currency: params.currency || 'INR',
    consentGiven: true,
    createdAt: now,
    updatedAt: now,
  };

  // Save to user-scoped storage
  savePeriodLocally(cleanUserId, period);

  // Sync to Supabase
  if (isSupabaseConfigured) {
    try {
      await supabase.from('expense_tracking_periods').insert({
        id: period.id,
        user_id: cleanUserId,
        status: period.status,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate + 'T23:59:59').toISOString(),
        duration_days: period.durationDays,
        budget: period.budget ?? null,
        currency: period.currency,
        consent_given: true,
        created_at: new Date(now).toISOString(),
        updated_at: new Date(now).toISOString(),
      });
    } catch (e) {
      console.warn('[ExpenseService] Cloud insert period error:', e);
    }
  }

  notifyExpenseUpdate();
  return period;
}

/**
 * Pauses active expenditure tracking.
 */
export async function pauseTracking(userId: string): Promise<ExpenseTrackingPeriod> {
  const cleanUserId = ensureUserUuid(null, userId);
  const current = await getActivePeriod(cleanUserId);
  if (!current) {
    throw new Error('No active tracking period found to pause.');
  }

  current.status = 'paused';
  current.updatedAt = Date.now();
  savePeriodLocally(cleanUserId, current);
  await updatePeriodStatusInCloud(current.id, cleanUserId, 'paused');
  notifyExpenseUpdate();
  return current;
}

/**
 * Resumes paused expenditure tracking.
 */
export async function resumeTracking(userId: string): Promise<ExpenseTrackingPeriod> {
  const cleanUserId = ensureUserUuid(null, userId);
  const current = await getActivePeriod(cleanUserId);
  if (!current) {
    throw new Error('No tracking period found to resume.');
  }

  const today = getTodayDateString();
  if (current.endDate < today) {
    current.status = 'completed';
    savePeriodLocally(cleanUserId, current);
    await updatePeriodStatusInCloud(current.id, cleanUserId, 'completed');
    throw new Error(`This tracking period already reached its end date on ${current.endDate}. Please start a new tracking period.`);
  }

  current.status = 'active';
  current.updatedAt = Date.now();
  savePeriodLocally(cleanUserId, current);
  await updatePeriodStatusInCloud(current.id, cleanUserId, 'active');
  notifyExpenseUpdate();
  return current;
}

/**
 * Stops expenditure tracking immediately.
 */
export async function stopTracking(userId: string): Promise<ExpenseTrackingPeriod> {
  const cleanUserId = ensureUserUuid(null, userId);
  const current = await getActivePeriod(cleanUserId);
  if (!current) {
    throw new Error('No tracking period found to stop.');
  }

  current.status = 'stopped';
  current.updatedAt = Date.now();
  savePeriodLocally(cleanUserId, current);
  await updatePeriodStatusInCloud(current.id, cleanUserId, 'stopped');
  notifyExpenseUpdate();
  return current;
}

/**
 * Deletes the tracking period and its transactions.
 */
export async function deleteTrackingPeriod(userId: string, periodId?: string): Promise<boolean> {
  const cleanUserId = ensureUserUuid(null, userId);
  const current = await getActivePeriod(cleanUserId);
  const targetId = periodId || current?.id;
  if (!targetId) return false;

  // Clear local storage
  savePeriodLocally(cleanUserId, null);
  saveTransactionsLocally(cleanUserId, []);

  // Delete from Supabase
  if (isSupabaseConfigured) {
    try {
      await supabase.from('expense_transactions').delete().eq('period_id', targetId).eq('user_id', cleanUserId);
      await supabase.from('expense_tracking_periods').delete().eq('id', targetId).eq('user_id', cleanUserId);
    } catch (e) {
      console.warn('[ExpenseService] Cloud delete error:', e);
    }
  }

  notifyExpenseUpdate();
  return true;
}

/**
 * User-scoped LocalStorage helpers for transactions
 */
function getTransactionsLocally(userId: string): ExpenseTransaction[] {
  const key = getUserStorageKey('synapsx_expense_txs', userId);
  const raw = appStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTransactionsLocally(userId: string, txs: ExpenseTransaction[]) {
  const key = getUserStorageKey('synapsx_expense_txs', userId);
  appStorage.setItem(key, JSON.stringify(txs));
  notifyExpenseUpdate();
}

/**
 * Record an explicit expense transaction.
 * BLOCKS writes if tracking is OFF, paused, stopped, or completed!
 */
export async function recordExpense(
  userId: string,
  params: {
    amount: number;
    category: string;
    description: string;
    date?: string;
    currency?: string;
  }
): Promise<{ success: boolean; transaction?: ExpenseTransaction; message: string }> {
  const cleanUserId = ensureUserUuid(null, userId);
  const current = await getActivePeriod(cleanUserId);

  // 1. Verify tracking is ON
  if (!current || current.status !== 'active') {
    const statusMsg = !current
      ? 'Expense tracking is disabled by default for your privacy.'
      : `Expense tracking is currently ${current.status.toUpperCase()}.`;

    return {
      success: false,
      message: `${statusMsg} Synapse X will only record transactions during an active, user-confirmed tracking period. Ask Central AI to "Start tracking my expenses" to activate.`,
    };
  }

  // 2. Check end date
  const today = getTodayDateString();
  if (current.endDate < today) {
    current.status = 'completed';
    savePeriodLocally(cleanUserId, current);
    await updatePeriodStatusInCloud(current.id, cleanUserId, 'completed');
    return {
      success: false,
      message: `Your previous tracking period ended on ${current.endDate}. Please ask Central AI to start a new tracking period.`,
    };
  }

  // 3. Validate input
  if (typeof params.amount !== 'number' || params.amount <= 0 || isNaN(params.amount)) {
    return {
      success: false,
      message: 'Please provide a valid expense amount greater than 0.',
    };
  }

  const txDate = params.date || today;
  const newTx: ExpenseTransaction = {
    id: generateUuid(),
    periodId: current.id,
    userId: cleanUserId,
    amount: Math.round(params.amount * 100) / 100,
    currency: params.currency || current.currency || 'INR',
    category: params.category || 'General',
    description: params.description || 'Expense entry',
    date: txDate,
    createdAt: Date.now(),
  };

  // Save locally in user-scoped storage
  const localList = getTransactionsLocally(cleanUserId);
  const updated = [newTx, ...localList];
  saveTransactionsLocally(cleanUserId, updated);

  // Sync to Supabase
  if (isSupabaseConfigured) {
    try {
      await supabase.from('expense_transactions').insert({
        id: newTx.id,
        period_id: current.id,
        user_id: cleanUserId,
        amount: newTx.amount,
        currency: newTx.currency,
        category: newTx.category,
        description: newTx.description,
        date: new Date(txDate).toISOString(),
        created_at: new Date(newTx.createdAt).toISOString(),
      });
    } catch (e) {
      console.warn('[ExpenseService] Cloud tx insert error:', e);
    }
  }

  return {
    success: true,
    transaction: newTx,
    message: `Recorded ${newTx.currency === 'INR' ? '₹' : newTx.currency}${newTx.amount} for "${newTx.description}" under ${newTx.category}.`,
  };
}

/**
 * Delete a specific expense transaction.
 */
export async function deleteExpense(userId: string, transactionId: string): Promise<boolean> {
  const cleanUserId = ensureUserUuid(null, userId);
  const localList = getTransactionsLocally(cleanUserId);
  const filtered = localList.filter((tx) => tx.id !== transactionId);

  if (filtered.length === localList.length) return false;

  saveTransactionsLocally(cleanUserId, filtered);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('expense_transactions').delete().eq('id', transactionId).eq('user_id', cleanUserId);
    } catch (e) {
      console.warn('[ExpenseService] Cloud tx delete error:', e);
    }
  }

  return true;
}

/**
 * Lists expenses for the user.
 */
export async function listExpenses(userId: string, periodId?: string): Promise<ExpenseTransaction[]> {
  const cleanUserId = ensureUserUuid(null, userId);

  // Check Supabase if configured
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('expense_transactions')
        .select('*')
        .eq('user_id', cleanUserId)
        .order('created_at', { ascending: false });

      if (periodId) {
        query = query.eq('period_id', periodId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped: ExpenseTransaction[] = data.map((d: any) => ({
          id: d.id,
          periodId: d.period_id,
          userId: d.user_id,
          amount: Number(d.amount),
          currency: d.currency || 'INR',
          category: d.category,
          description: d.description,
          date: d.date ? d.date.split('T')[0] : getTodayDateString(),
          createdAt: new Date(d.created_at).getTime(),
        }));
        saveTransactionsLocally(cleanUserId, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[ExpenseService] Cloud listExpenses error:', e);
    }
  }

  // Fallback to user-scoped storage
  const local = getTransactionsLocally(cleanUserId);
  if (periodId) {
    return local.filter((tx) => tx.periodId === periodId);
  }
  return local;
}

/**
 * Calculates real-time expenditure summary metrics.
 */
export async function getExpenseSummary(userId: string): Promise<ExpenseSummary> {
  const cleanUserId = ensureUserUuid(null, userId);
  const period = await getActivePeriod(cleanUserId);
  const transactions = await listExpenses(cleanUserId, period?.id);

  const totalSpent = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const totalBudget = period?.budget || 0;
  const remainingBudget = totalBudget > 0 ? Math.max(0, totalBudget - totalSpent) : 0;
  const isOverBudget = totalBudget > 0 ? totalSpent > totalBudget : false;

  let daysRemaining = 0;
  if (period && period.endDate) {
    const today = new Date(getTodayDateString()).getTime();
    const end = new Date(period.endDate).getTime();
    daysRemaining = Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
  }

  const categoryBreakdown: Record<string, number> = {};
  for (const tx of transactions) {
    categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
  }

  const trackingStatus = !period
    ? 'disabled'
    : (period.status as ExpenseTrackingStatus);

  return {
    period,
    totalBudget,
    totalSpent: Math.round(totalSpent * 100) / 100,
    remainingBudget: Math.round(remainingBudget * 100) / 100,
    transactionsCount: transactions.length,
    daysRemaining,
    isOverBudget,
    recentTransactions: transactions.slice(0, 10),
    categoryBreakdown,
    trackingStatus,
  };
}
