import { NotificationItem } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ensureUserUuid, getUserStorageKey } from '../utils/userUtils';
import { appStorage } from '../utils/storage';

const DEFAULT_SEEDS: Omit<NotificationItem, 'id'>[] = [
  {
    title: 'Semester Timetable Synchronized',
    message: 'New assignment submission deadlines updated on Google Classroom.',
    time: '15m ago',
    read: false,
    category: 'academic',
  },
  {
    title: 'Synaps AI Copilot Ready',
    message: 'Centralized multi-step tool coordinator enabled with Gemini 3.8 Flash.',
    time: '1h ago',
    read: false,
    category: 'ai',
  },
  {
    title: 'Smart Task Management Active',
    message: 'Track priorities, deadlines, and subtask milestones locally.',
    time: '2h ago',
    read: false,
    category: 'task',
  },
  {
    title: 'Payment Security Reminder',
    message: 'Synaps X never asks for UPI PINs or card CVVs. Always verify official bank URLs.',
    time: '1d ago',
    read: true,
    category: 'security',
  },
];

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('synapsx_notifications_changed'));
  }
}

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

/**
 * Get user-isolated notifications
 */
export async function getNotifications(userId?: string | null): Promise<NotificationItem[]> {
  const cleanUserId = ensureUserUuid(null, userId || undefined);
  const key = getUserStorageKey('synapsx_notifications', cleanUserId);

  // Check Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', cleanUserId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: NotificationItem[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          message: d.message,
          time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: Boolean(d.read),
          category: d.category || 'system',
        }));
        appStorage.setItem(key, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('[NotificationService] Cloud fetch warning:', e);
    }
  }

  // Local storage check
  const raw = appStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  // Seed default items for fresh user
  const seeded: NotificationItem[] = DEFAULT_SEEDS.map((s, idx) => ({
    ...s,
    id: `notif-seed-${idx + 1}-${cleanUserId.slice(0, 6)}`,
  }));
  appStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

/**
 * Add a notification for a specific user
 */
export async function addNotification(
  userId: string | null | undefined,
  notif: Omit<NotificationItem, 'id' | 'time'>
): Promise<NotificationItem> {
  const cleanUserId = ensureUserUuid(null, userId || undefined);
  const key = getUserStorageKey('synapsx_notifications', cleanUserId);
  const existing = await getNotifications(cleanUserId);

  const newNotif: NotificationItem = {
    ...notif,
    id: generateUuid(),
    time: 'Just now',
    read: false,
  };

  const updated = [newNotif, ...existing].slice(0, 50);
  appStorage.setItem(key, JSON.stringify(updated));
  notifyChange();

  // Cloud sync
  if (isSupabaseConfigured) {
    try {
      await supabase.from('notifications').insert({
        id: newNotif.id,
        user_id: cleanUserId,
        title: newNotif.title,
        message: newNotif.message,
        category: newNotif.category,
        read: false,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[NotificationService] Cloud insert error:', e);
    }
  }

  return newNotif;
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(userId: string | null | undefined, notifId: string): Promise<void> {
  const cleanUserId = ensureUserUuid(null, userId || undefined);
  const key = getUserStorageKey('synapsx_notifications', cleanUserId);
  const existing = await getNotifications(cleanUserId);

  const updated = existing.map((n) => (n.id === notifId ? { ...n, read: true } : n));
  appStorage.setItem(key, JSON.stringify(updated));
  notifyChange();

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notifId)
        .eq('user_id', cleanUserId);
    } catch (e) {
      console.warn('[NotificationService] Cloud update error:', e);
    }
  }
}

/**
 * Clear all notifications for user
 */
export function clearNotificationsLocal(userId?: string | null): void {
  const cleanUserId = ensureUserUuid(null, userId || undefined);
  const key = getUserStorageKey('synapsx_notifications', cleanUserId);
  appStorage.removeItem(key);
  notifyChange();
}
