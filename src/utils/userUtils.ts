import { StudentUser } from '../types';

/**
 * Validates whether a string is a standard RFC 4122 UUID.
 */
export function isUuid(val?: string | null): boolean {
  if (!val) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val.trim());
}

/**
 * Simple, fast hash function to convert a string into an integer.
 */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c64e6d ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Generates a deterministic RFC-4122 v4-formatted UUID from an email.
 * This guarantees consistent UUID generation across browser sessions for the same email
 * when Supabase Auth session token is offline or in local demo mode.
 */
export function getDeterministicUserUuid(email?: string | null): string {
  const cleanEmail = (email || 'guest@synapsex.student').toLowerCase().trim();
  
  // Use multiple seeds to generate 128 bits of deterministic data
  const p1 = cyrb53(cleanEmail, 101).toString(16).padStart(12, '0');
  const p2 = cyrb53(cleanEmail, 202).toString(16).padStart(12, '0');
  const p3 = cyrb53(cleanEmail, 303).toString(16).padStart(8, '0');

  const combined = (p1 + p2 + p3).slice(0, 32);

  // Format as standard UUID: 8-4-4-4-12, setting version 4 and variant bits
  const s0 = combined.slice(0, 8);
  const s1 = combined.slice(8, 12);
  const s2 = '4' + combined.slice(13, 16); // UUID version 4
  const hexVariant = (parseInt(combined.slice(16, 17), 16) & 0x3 | 0x8).toString(16);
  const s3 = hexVariant + combined.slice(17, 20); // RFC 4122 variant
  const s4 = combined.slice(20, 32);

  return `${s0}-${s1}-${s2}-${s3}-${s4}`.toLowerCase();
}

/**
 * Returns a guaranteed valid user UUID for any user object, UUID string, or email.
 */
export function ensureUserUuid(
  userOrId?: Partial<StudentUser> | string | null,
  fallbackEmailOrId?: string
): string {
  if (typeof userOrId === 'string') {
    if (isUuid(userOrId)) return userOrId;
    if (fallbackEmailOrId && isUuid(fallbackEmailOrId)) return fallbackEmailOrId;
    return getDeterministicUserUuid(userOrId || fallbackEmailOrId);
  }
  if (userOrId?.id && isUuid(userOrId.id)) {
    return userOrId.id;
  }
  if (fallbackEmailOrId && isUuid(fallbackEmailOrId)) {
    return fallbackEmailOrId;
  }
  const targetEmail = userOrId?.email || fallbackEmailOrId;
  return getDeterministicUserUuid(targetEmail);
}

/**
 * Returns a user-scoped storage key for localStorage to prevent any cross-user data leakage.
 */
export function getUserStorageKey(prefix: string, userOrId?: Partial<StudentUser> | string | null): string {
  if (!userOrId) {
    return `${prefix}_guest`;
  }
  if (typeof userOrId === 'string') {
    if (isUuid(userOrId)) return `${prefix}_${userOrId}`;
    return `${prefix}_${getDeterministicUserUuid(userOrId)}`;
  }
  const uuid = ensureUserUuid(userOrId);
  return `${prefix}_${uuid}`;
}

/**
 * Predefined deterministic UUIDs for demo users
 */
export const DEMO_USER_UUIDS = {
  SARAN: getDeterministicUserUuid('girisaran370@gmail.com'),
  ALEX: getDeterministicUserUuid('alex.morgan@university.edu'),
  PRIYA: getDeterministicUserUuid('priya.sharma@campus.ac.in'),
  STUDENT: getDeterministicUserUuid('student@university.edu'),
};
