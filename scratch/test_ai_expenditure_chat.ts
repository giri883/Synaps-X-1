async function testAIChatExpenditure() {
  console.log('Testing Central AI /api/chat Expenditure & Image responses...\n');

  // Test 1: Expense inquiry when tracking is disabled
  try {
    const res1 = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'How much have I spent so far on campus?',
        userProfile: {
          fullName: 'Test Student',
          email: 'test.student@univ.edu',
        },
      }),
    });

    const data1 = await res1.json();
    console.log('Test 1 - Inquiry when disabled:');
    console.log('Response text:', data1.text);
    console.log('Expense Summary present:', Boolean(data1.expenseSummary));
    if (data1.expenseSummary) {
      console.log('Tracking status:', data1.expenseSummary.trackingStatus);
    }
  } catch (e: any) {
    console.error('Test 1 failed:', e.message);
  }

  // Test 2: Request tracking setup
  try {
    const res2 = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Start tracking my expenses with a ₹3,000 budget for 12 days',
        userProfile: {
          fullName: 'Test Student',
          email: 'test.student@univ.edu',
        },
      }),
    });

    const data2 = await res2.json();
    console.log('\nTest 2 - Setup request:');
    console.log('Response text:', data2.text);
    console.log('Expense Proposal returned:', Boolean(data2.expenseProposal));
    if (data2.expenseProposal) {
      console.log('Proposal duration:', data2.expenseProposal.durationDays);
      console.log('Proposal budget:', data2.expenseProposal.budget);
      console.log('Proposal disclaimer:', data2.expenseProposal.disclaimer);
    }
  } catch (e: any) {
    console.error('Test 2 failed:', e.message);
  }

  // Test 3: Verify image generation still works and does not create tasks
  try {
    const res3 = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Generate an image of a neon cybernetic owl for my student dashboard banner',
        userProfile: {
          fullName: 'Test Student',
          email: 'test.student@univ.edu',
        },
      }),
    });

    const data3 = await res3.json();
    console.log('\nTest 3 - Image generation preservation:');
    console.log('Generated Images count:', data3.generatedImages?.length || 0);
    console.log('Created Tasks count:', data3.createdTasks?.length || 0);
    if (data3.generatedImages?.length > 0) {
      console.log('Image URL received:', data3.generatedImages[0].url.slice(0, 60) + '...');
    }
  } catch (e: any) {
    console.error('Test 3 failed:', e.message);
  }
}

testAIChatExpenditure();
