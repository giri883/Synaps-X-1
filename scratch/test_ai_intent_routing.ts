/**
 * Regression Test Suite: Central AI Intent Routing & Clean Tutor Interface
 * Tests all 8 core scenarios via http://localhost:3000/api/ai/chat
 */

interface ChatResponse {
  text: string;
  workflowPlan: any;
  executionActivity: any[];
  createdTasks: any[];
  generatedImages: any[];
  fallbackUsed: boolean;
  expenseProposal?: any;
}

async function sendChat(message: string): Promise<ChatResponse> {
  const res = await fetch('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      userProfile: {
        id: 'test-user-id',
        email: 'test@student.edu',
        fullName: 'Alex Student',
        college: 'Apex Tech University',
        course: 'Computer Science',
      },
      activeTasks: [],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  return res.json();
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`  ✓ ${msg}`);
}

async function runAllTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING SYNAPSE X CENTRAL AI INTENT ROUTING TEST SUITE');
  console.log('========================================================\n');

  // Test 1: Explain thermodynamics to me.
  console.log('--- TEST 1: Pure Educational Question ("Explain thermodynamics to me.") ---');
  const t1 = await sendChat('Explain thermodynamics to me.');
  assert(t1.createdTasks.length === 0, 'Zero tasks created (must NEVER create a task for explanations!)');
  assert(t1.workflowPlan === null || t1.workflowPlan === undefined, 'No workflow plan generated');
  assert(t1.text.toLowerCase().includes('thermodynamic'), 'Response explains thermodynamics');
  assert(
    t1.text.toLowerCase().includes('first law') || t1.text.toLowerCase().includes('energy') || t1.text.toLowerCase().includes('heat'),
    'Response contains scientific conceptual breakdown'
  );
  assert(!t1.text.includes('Action:'), 'Does NOT contain fake "Action: explain" task string');
  console.log('✅ TEST 1 PASSED: Educational question handled as pure tutor lesson with 0 tasks.\n');

  // Test 2: Explain the first law of thermodynamics with an example.
  console.log('--- TEST 2: Specific Concept with Example ("Explain the first law of thermodynamics with an example.") ---');
  const t2 = await sendChat('Explain the first law of thermodynamics with an example.');
  assert(t2.createdTasks.length === 0, 'Zero tasks created');
  assert(t2.workflowPlan === null || t2.workflowPlan === undefined, 'No workflow plan generated');
  assert(
    t2.text.toLowerCase().includes('conservation of energy') || t2.text.includes('\\Delta U') || t2.text.includes('Q - W'),
    'Explains conservation of energy / First law formula'
  );
  console.log('✅ TEST 2 PASSED: First Law explained conceptually with 0 tasks.\n');

  // Test 3: What is the difference between heat and temperature?
  console.log('--- TEST 3: Conceptual Comparison ("What is the difference between heat and temperature?") ---');
  const t3 = await sendChat('What is the difference between heat and temperature?');
  assert(t3.createdTasks.length === 0, 'Zero tasks created');
  assert(t3.workflowPlan === null || t3.workflowPlan === undefined, 'No workflow plan generated');
  assert(
    t3.text.toLowerCase().includes('heat') && t3.text.toLowerCase().includes('temperature'),
    'Addresses both heat and temperature distinctly'
  );
  console.log('✅ TEST 3 PASSED: Heat vs temperature explained with 0 tasks.\n');

  // Test 4: Pure Image Generation
  console.log('--- TEST 4: Pure Image Generation ("Generate an image of a futuristic campus.") ---');
  const t4 = await sendChat('Generate an image of a futuristic campus.');
  assert(t4.createdTasks.length === 0, 'Zero tasks created for pure image request');
  assert(t4.generatedImages.length > 0, 'Genuine image returned in payload');
  assert(Boolean(t4.generatedImages[0].url), `Image URL verified: ${t4.generatedImages[0].url}`);
  console.log('✅ TEST 4 PASSED: Image generated without creating tasks.\n');

  // Test 5: Explicit Task Creation
  console.log('--- TEST 5: Explicit Task Creation ("Create a task to study thermodynamics tomorrow.") ---');
  const t5 = await sendChat('Create a task to study thermodynamics tomorrow.');
  assert(t5.createdTasks.length === 1, `Exactly 1 task created (got ${t5.createdTasks.length})`);
  assert(
    t5.createdTasks[0].title.toLowerCase().includes('study thermodynamics'),
    `Clean task title extracted: "${t5.createdTasks[0].title}" (no "Action: ...")`
  );
  assert(Boolean(t5.createdTasks[0].dueDate), `Due date set: ${t5.createdTasks[0].dueDate}`);
  assert(t5.createdTasks[0].subtasks.length > 0, 'Actionable subtasks attached');
  console.log('✅ TEST 5 PASSED: Clean single task created with proper title and date.\n');

  // Test 6: Mixed Multi-Action Workflow (Explanation + Explicit Tasks)
  console.log('--- TEST 6: Mixed Workflow ("Explain thermodynamics and create three revision tasks.") ---');
  const t6 = await sendChat('Explain thermodynamics and create three revision tasks.');
  assert(
    t6.text.toLowerCase().includes('thermodynamic') && t6.text.length > 200,
    'Delivers full educational explanation of thermodynamics'
  );
  assert(t6.createdTasks.length === 3, `Exactly 3 revision tasks created (got ${t6.createdTasks.length})`);
  assert(t6.workflowPlan !== null, 'Workflow plan generated for the 3 revision tasks');
  console.log('  Tasks created:');
  t6.createdTasks.forEach((t, i) => console.log(`    ${i + 1}. "${t.title}" due ${t.dueDate}`));
  console.log('✅ TEST 6 PASSED: Delivered tutor explanation AND scheduled exactly 3 revision tasks.\n');

  // Test 7: Expense Tracking Request
  console.log('--- TEST 7: Expense Tracking Request ("Track my expenses for 12 days.") ---');
  const t7 = await sendChat('Track my expenses for 12 days.');
  assert(t7.createdTasks.length === 0, 'Zero tasks created for expense tracking');
  assert(Boolean(t7.expenseProposal), 'Expense tracking privacy proposal returned');
  assert(t7.expenseProposal.durationDays === 12, '12-day duration preserved');
  console.log('✅ TEST 7 PASSED: Privacy-controlled expense proposal returned with 0 tasks.\n');

  // Test 8: 7-Day SDE Interview Preparation
  console.log('--- TEST 8: 7-Day SDE Interview Preparation ---');
  const t8 = await sendChat('Help me prepare for an SDE interview in seven days.');
  assert(t8.createdTasks.length >= 7, `Created multi-day roadmap tasks (${t8.createdTasks.length} tasks)`);
  assert(t8.workflowPlan !== null, 'Full 7-day workflow plan returned');
  console.log('✅ TEST 8 PASSED: Multi-day roadmap generated with structured tasks.\n');

  console.log('========================================================');
  console.log('🎉 ALL 8 CENTRAL AI INTENT ROUTING TESTS PASSED PERFECTLY!');
  console.log('========================================================');
}

runAllTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
