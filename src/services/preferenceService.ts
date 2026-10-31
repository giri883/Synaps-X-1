import { RecentlyUsedItem } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ensureUserUuid, getUserStorageKey } from '../utils/userUtils';
import { appStorage } from '../utils/storage';

export const DEFAULT_FAVORITES = [
  'leetcode',
  'github',
  'chatgpt',
  'google-classroom',
  'gmail',
  'youtube-main',
];

export const DEFAULT_RECENTLY_USED: RecentlyUsedItem[] = [
  { appId: 'gmail', timestamp: Date.now() - 1000 * 60 * 12 },
  { appId: 'leetcode', timestamp: Date.now() - 1000 * 60 * 45 },
  { appId: 'chatgpt', timestamp: Date.now() - 1000 * 60 * 120 },
  { appId: 'google-classroom', timestamp: Date.now() - 1000 * 60 * 240 },
];

export interface UserPreferences {
  favorites: string[];
  recentlyUsed: RecentlyUsedItem[];
  darkMode: boolean;
}

/**
 * Load preferences for a specific user
 */
export async function getUserPreferences(userId?: string | null): Promise<UserPreferences> {
  const cleanUserId = ensureUserUuid(null, userId || undefined);
  const key = getUserStorageKey('synapsx_prefs', cleanUserId);

  // Cloud sync if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', cleanUserId)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const prefs: UserPreferences = {
          favorites: Array.isArray(row.favorites) ? row.favorites : DEFAULT_FAVORITES,
          recentlyUsed: Array.isArray(row.recently_used) ? row.recently_used : DEFAULT_RECENTLY_USED,
          darkMode: typeof row.dark_mode === 'boolean' ? row.dark_mode : true,
        };
        appStorage.setItem(key, JSON.stringify(prefs));
        return prefs;
      }
    } catch (e) {
      console.warn('[PreferenceService] Cloud fetch notice:', e);
    }
  }

  // Local storage check
  const raw = appStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : DEFAULT_FAVORITES,
        recentlyUsed: Array.isArray(parsed.recentlyUsed) ? parsed.recentlyUsed : DEFAULT_RECENTLY_USED,
        darkMode: typeof parsed.darkMode === 'boolean' ? parsed.darkMode : true,
      };
    } catch {
      // ignore
    }
  }

  // Return clean defaults for this user
  const defaults: UserPreferences = {
    favorites: [...DEFAULT_FAVORITES],
    recentlyUsed: [...DEFAULT_RECENTLY_USED],
    darkMode: true,
  };
  appStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

/**
 * Save preferences for a specific user
 */
export async function saveUserPreferences(
  userId: string | null | undefined,
  prefs: Partial<UserPreferences>
): Promise<UserPreferences> {
  const cleanUserId = ensureUserUuid(null, userId || undefined);
  const key = getUserStorageKey('synapsx_prefs', cleanUserId);
  const current = await getUserPreferences(cleanUserId);

  const merged: UserPreferences = {
    ...current,
    ...prefs,
  };

  appStorage.setItem(key, JSON.stringify(merged));

  // Sync to Supabase
  if (isSupabaseConfigured) {
    try {
      await supabase.from('user_preferences').upsert({
        user_id: cleanUserId,
        favorites: merged.favorites,
        recently_used: merged.recentlyUsed,
        dark_mode: merged.darkMode,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[PreferenceService] Cloud upsert error:', e);
    }
  }

  return merged;
}
