import { getUserPreferences, saveUserPreferences } from '../src/services/preferenceService';
import { ensureUserUuid } from '../src/utils/userUtils';

async function testPreferences() {
  console.log('Testing User Preference Service...\n');

  const user1 = ensureUserUuid(null, 'student1@university.edu');
  const user2 = ensureUserUuid(null, 'student2@university.edu');

  console.log(`User 1 UUID: ${user1}`);
  console.log(`User 2 UUID: ${user2}`);

  // 1. Get default preferences for User 1
  const initialPrefs1 = await getUserPreferences(user1);
  console.log('\nUser 1 initial favorites:', initialPrefs1.favorites);

  // 2. Save custom favorites for User 1
  const updatedPrefs1 = await saveUserPreferences(user1, {
    favorites: ['leetcode', 'github'],
    darkMode: false,
  });
  console.log('User 1 updated favorites:', updatedPrefs1.favorites);
  console.log('User 1 dark mode:', updatedPrefs1.darkMode);

  // 3. Verify User 2 is not affected (Multi-user isolation)
  const prefs2 = await getUserPreferences(user2);
  console.log('\nUser 2 favorites (isolated):', prefs2.favorites);
  console.log('User 2 dark mode (isolated):', prefs2.darkMode);

  // 4. Verify User 1 preferences persist
  const reloadedPrefs1 = await getUserPreferences(user1);
  console.log('\nUser 1 reloaded favorites:', reloadedPrefs1.favorites);

  const isIsolated =
    reloadedPrefs1.favorites.length === 2 &&
    prefs2.favorites.length > 2 &&
    reloadedPrefs1.darkMode === false &&
    prefs2.darkMode === true;

  console.log('\nMulti-user preference isolation verified:', isIsolated);
}

testPreferences().catch(console.error);
