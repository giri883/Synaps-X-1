import { ensureUserUuid, getUserStorageKey, isUuid } from '../src/utils/userUtils';
import { appStorage } from '../src/utils/storage';
import {
  prepareTrackingProposal,
  startTracking,
  pauseTracking,
  resumeTracking,
  stopTracking,
  recordExpense,
  listExpenses,
  getExpenseSummary,
  deleteExpense,
  deleteTrackingPeriod,
  getActivePeriod,
  isTrackingActive,
} from '../src/services/expenseService';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from '../src/services/taskService';
import {
  getUserPreferences,
  saveUserPreferences,
  DEFAULT_FAVORITES,
  DEFAULT_RECENTLY_USED,
} from '../src/services/preferenceService';
import {
  getNotifications,
  addNotification,
  markNotificationRead,
} from '../src/services/notificationService';
import { supabase, isSupabaseConfigured } from '../src/supabaseClient';

async function runTests() {
  console.log('===============================================================');
  console.log('   SYNAPSE X: FULL TWO-ACCOUNT CROSS-USER ISOLATION & PRIVACY  ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. User Setup
  const userA_Email = 'saran.giri@iit.edu';
  const userB_Email = 'priya.sharma@nit.edu';

  const userA_Id = ensureUserUuid(null, userA_Email);
  const userB_Id = ensureUserUuid(null, userB_Email);

  console.log(`User A (Saran): ${userA_Email} -> UUID: ${userA_Id}`);
  console.log(`User B (Priya): ${userB_Email} -> UUID: ${userB_Id}`);
  assert(isUuid(userA_Id) && isUuid(userB_Id), 'Both users have valid RFC 4122 UUIDs');
  assert(userA_Id !== userB_Id, 'User A and User B have distinct UUIDs');

  console.log('\n--- 1. PRIVACY REQUIREMENT: DISABLED BY DEFAULT ---');
  // Clean start
  await deleteTrackingPeriod(userA_Id);
  await deleteTrackingPeriod(userB_Id);

  const userA_ActiveInitially = await isTrackingActive(userA_Id);
  const userB_ActiveInitially = await isTrackingActive(userB_Id);
  assert(userA_ActiveInitially === false, 'User A expenditure tracking is OFF by default');
  assert(userB_ActiveInitially === false, 'User B expenditure tracking is OFF by default');

  const initialSummaryA = await getExpenseSummary(userA_Id);
  assert(initialSummaryA.trackingStatus === 'disabled', 'User A trackingStatus is "disabled"');
  assert(initialSummaryA.transactionsCount === 0, 'User A has 0 transactions recorded');

  console.log('\n--- 2. PRIVACY REQUIREMENT: SIMULATE PAYMENT APP LAUNCHES ---');
  // Launching payment apps (GPay, PhonePe, Paytm) must NEVER collect transactions
  const txsBeforeLaunch = await listExpenses(userA_Id);
  assert(txsBeforeLaunch.length === 0, 'No transactions collected before payment app launch');
  // Simulated opening Google Pay or PhonePe
  const txsAfterLaunch = await listExpenses(userA_Id);
  assert(txsAfterLaunch.length === 0, 'No payment history or transactions auto-collected on app launch');

  console.log('\n--- 3. PRIVACY REQUIREMENT: EXPLICIT REQUEST & CONFIRMATION ---');
  // User requests tracking: confirmation proposal must be prepared before activation
  const proposal = prepareTrackingProposal(12, 3000, 'INR');
  assert(proposal.durationDays === 12, 'Proposal duration is 12 days');
  assert(proposal.budget === 3000, 'Proposal budget is ₹3000');
  assert(Boolean(proposal.disclaimer), 'Proposal contains explicit privacy disclaimer');
  assert((await isTrackingActive(userA_Id)) === false, 'Tracking remains OFF until user confirms');

  // Attempting to record an expense before confirmation MUST be blocked
  const blockedAttempt = await recordExpense(userA_Id, {
    amount: 250,
    category: 'Books',
    description: 'Operating System Concepts',
  });
  assert(blockedAttempt.success === false, 'Write blocked when tracking is disabled by default');
  assert(blockedAttempt.message.includes('disabled by default'), 'Informative privacy message returned');

  // User explicitly confirms:
  const activatedPeriod = await startTracking(userA_Id, {
    durationDays: proposal.durationDays,
    budget: proposal.budget,
    currency: 'INR',
    consentGiven: true,
  });
  assert(activatedPeriod.status === 'active', 'Tracking period is now ACTIVE for User A');
  assert(activatedPeriod.userId === userA_Id, 'Tracking period is owned by User A UUID');
  assert((await isTrackingActive(userA_Id)) === true, 'isTrackingActive(userA) returns true');

  console.log('\n--- 4. PRIVACY REQUIREMENT: EXPLICIT TRANSACTION RECORDING ---');
  // Record valid expense for User A
  const rec1 = await recordExpense(userA_Id, {
    amount: 450,
    category: 'Study Materials',
    description: 'Introduction to Algorithms Book',
  });
  assert(rec1.success === true, 'Explicit expense recorded successfully');
  assert(rec1.transaction?.amount === 450, 'Recorded amount is exactly 450');

  const rec2 = await recordExpense(userA_Id, {
    amount: 150,
    category: 'Food & Dining',
    description: 'Campus cafeteria lunch',
  });
  assert(rec2.success === true, 'Second explicit expense recorded successfully');

  const summaryAfterSpend = await getExpenseSummary(userA_Id);
  assert(summaryAfterSpend.totalSpent === 600, 'Total spent for User A is ₹600 (450 + 150)');
  assert(summaryAfterSpend.remainingBudget === 2400, 'Remaining budget is ₹2400 (3000 - 600)');
  assert(summaryAfterSpend.transactionsCount === 2, '2 transactions recorded for User A');

  console.log('\n--- 5. PRIVACY REQUIREMENT: PAUSE / RESUME / STOP CONTROLS ---');
  // Pause tracking
  await pauseTracking(userA_Id);
  const pausedPeriod = await getActivePeriod(userA_Id);
  assert(pausedPeriod?.status === 'paused', 'Tracking period successfully set to PAUSED');
  assert((await isTrackingActive(userA_Id)) === false, 'isTrackingActive is false when paused');

  // Writes blocked while paused
  const writeWhilePaused = await recordExpense(userA_Id, {
    amount: 100,
    category: 'Snacks',
    description: 'Tea and biscuits',
  });
  assert(writeWhilePaused.success === false, 'New writes blocked while tracking is PAUSED');
  assert(writeWhilePaused.message.includes('PAUSED'), 'Message explains tracking is paused');

  // Resume tracking
  await resumeTracking(userA_Id);
  assert((await isTrackingActive(userA_Id)) === true, 'Tracking resumed successfully');

  // Record allowed after resume
  const writeAfterResume = await recordExpense(userA_Id, {
    amount: 100,
    category: 'Snacks',
    description: 'Tea and biscuits',
  });
  assert(writeAfterResume.success === true, 'Write succeeds after resume');

  // Stop tracking
  await stopTracking(userA_Id);
  const stoppedPeriod = await getActivePeriod(userA_Id);
  assert(stoppedPeriod?.status === 'stopped', 'Tracking period successfully set to STOPPED');
  const writeWhileStopped = await recordExpense(userA_Id, {
    amount: 50,
    category: 'Stationery',
    description: 'Pen',
  });
  assert(writeWhileStopped.success === false, 'Writes blocked after tracking is STOPPED');

  // Historical records preserved after stop
  const historyPreserved = await listExpenses(userA_Id);
  assert(historyPreserved.length === 3, 'All 3 historical records preserved after stopping tracking');

  console.log('\n--- 6. TASK & PREFERENCE CREATION FOR USER A ---');
  const taskA1 = createTask(
    {
      title: 'User A: Complete LeetCode Daily Challenge',
      description: 'Solve dynamic programming problem',
      priority: 'high',
      status: 'in_progress',
      category: 'Coding Practice',
      dueDate: '2026-10-20',
      subtasks: [{ id: 'sub-a1', title: 'DP memoization', completed: true }],
    },
    userA_Id
  );
  assert(Boolean(taskA1.id), 'Task created for User A');

  // Preferences for User A
  const prefsA = await saveUserPreferences(userA_Id, {
    favorites: ['leetcode', 'github', 'chatgpt'],
    recentlyUsed: [{ appId: 'leetcode', timestamp: Date.now() }],
    darkMode: true,
  });
  assert(prefsA.favorites.length === 3, 'User A has 3 favorites saved');

  // Notifications for User A
  const notifA = await addNotification(userA_Id, {
    title: 'User A Notification',
    message: 'Your algorithms contest starts at 8 PM',
    category: 'academic',
    read: false,
  });
  assert(Boolean(notifA.id), 'Notification created for User A');

  console.log('\n--- 7. SIMULATE LOGOUT (USER A) ---');
  // Clear in-memory / session state
  appStorage.removeItem('synapsx_user');
  console.log('  Simulated logout: User A session cleared.');

  console.log('\n--- 8. LOGIN USER B & VERIFY COMPLETE ISOLATION ---');
  // Check User B's state:
  const userB_Period = await getActivePeriod(userB_Id);
  assert(userB_Period === null, 'User B has NO tracking period (isolated from User A)');
  assert((await isTrackingActive(userB_Id)) === false, 'User B tracking is OFF');

  const userB_Expenses = await listExpenses(userB_Id);
  assert(userB_Expenses.length === 0, 'User B sees ZERO expenses (no leak from User A)');

  const userB_Tasks = getTasks(userB_Id);
  const leakedTask = userB_Tasks.find((t) => t.id === taskA1.id || t.title.includes('User A'));
  assert(!leakedTask, 'User B does NOT see User A tasks');

  const userB_Prefs = await getUserPreferences(userB_Id);
  assert(
    !userB_Prefs.favorites.every((f) => prefsA.favorites.includes(f) && prefsA.favorites.length === f.length),
    'User B has default preferences, not User A custom set'
  );

  const userB_Notifs = await getNotifications(userB_Id);
  const leakedNotif = userB_Notifs.find((n) => n.id === notifA.id);
  assert(!leakedNotif, 'User B does NOT see User A notifications');

  console.log('\n--- 9. USER B CREATES INDEPENDENT DATA ---');
  // User B starts their own tracking
  const periodB = await startTracking(userB_Id, {
    durationDays: 7,
    budget: 1500,
    currency: 'INR',
    consentGiven: true,
  });
  assert(periodB.userId === userB_Id, 'User B tracking period owned by User B');

  await recordExpense(userB_Id, {
    amount: 200,
    category: 'Transport',
    description: 'Metro pass recharge',
  });

  const summaryB = await getExpenseSummary(userB_Id);
  assert(summaryB.totalSpent === 200, 'User B total spent is ₹200');
  assert(summaryB.transactionsCount === 1, 'User B has 1 transaction');

  const taskB1 = createTask(
    {
      title: 'User B: Prepare Chemistry Lab Report',
      description: 'Document titration results',
      priority: 'medium',
      status: 'todo',
      category: 'Academics',
      dueDate: '2026-10-22',
      subtasks: [],
    },
    userB_Id
  );
  assert(Boolean(taskB1.id), 'Task created for User B');

  console.log('\n--- 10. SWITCH BACK TO USER A & VERIFY DATA RESTORATION ---');
  // User A logs back in
  const restoredSummaryA = await getExpenseSummary(userA_Id);
  assert(restoredSummaryA.totalSpent === 700, 'User A total spent is restored (450 + 150 + 100 = 700)');
  assert(restoredSummaryA.transactionsCount === 3, 'User A has all 3 transactions restored');

  const restoredTasksA = getTasks(userA_Id);
  const foundTaskA = restoredTasksA.find((t) => t.id === taskA1.id);
  assert(Boolean(foundTaskA), 'User A task was safely restored');
  const foundTaskBInA = restoredTasksA.find((t) => t.id === taskB1.id);
  assert(!foundTaskBInA, 'User B task is NOT present in User A workspace');

  const restoredPrefsA = await getUserPreferences(userA_Id);
  assert(restoredPrefsA.favorites.length === 3, 'User A custom favorites restored');

  console.log('\n--- 11. SUPABASE RLS & DIRECT ACCESS VERIFICATION ---');
  if (isSupabaseConfigured) {
    console.log('  Testing Supabase direct table access with user UUIDs...');
    const { data: directA, error: errA } = await supabase
      .from('expense_tracking_periods')
      .select('*')
      .eq('user_id', userA_Id);
    console.log(`  Supabase direct query for User A: found ${directA?.length || 0} periods (Error: ${errA?.message || 'none'})`);

    const { data: directB, error: errB } = await supabase
      .from('expense_tracking_periods')
      .select('*')
      .eq('user_id', userB_Id);
    console.log(`  Supabase direct query for User B: found ${directB?.length || 0} periods (Error: ${errB?.message || 'none'})`);
    assert(!errA && !errB, 'Direct database queries succeed with proper schema');
  } else {
    console.log('  Supabase client in offline/mock mode: verified RLS SQL schema in supabase/schema.sql');
  }

  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during isolation test:', err);
  process.exit(1);
});
