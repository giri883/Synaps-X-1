import {
  ActionProposal,
  AIChatMessage,
  AIChatSession,
  StudentTask,
  StudentUser,
  WorkflowPlan,
  ToolExecutionActivity,
  ConnectedToolItem,
  GeneratedImageItem,
  ExpenseTrackingProposal,
  ExpenseSummary,
} from '../types';
import { findToolsForGoal } from './toolRegistry';
import { getAnswerForProgressQuery, getProgressSummary } from './progressTracker';
import { batchCreateTasks } from './taskService';
import { addNotification } from './notificationService';
import { classifyIntent } from './intentRouter';
import { generateTutorExplanation } from './educationalTutor';

export interface AIResponsePayload {
  text: string;
  workflowPlan?: WorkflowPlan;
  executionActivities?: ToolExecutionActivity[];
  createdTasks?: StudentTask[];
  generatedImages?: GeneratedImageItem[];
  notifications?: any[];
  connectedTools?: ConnectedToolItem[];
  planSummary?: {
    goal: string;
    totalSteps: number;
    duration: string;
    toolsRecommended: string[];
    targetRole?: string;
  };
  proposedActions?: ActionProposal[];
  calendarData?: {
    eventTitle?: string;
    date?: string;
    time?: string;
    description?: string;
    googleCalendarUrl?: string;
  };
  fallbackUsed?: boolean;
  learningContent?: any[];
  progressSummary?: any;
  expenseProposal?: ExpenseTrackingProposal;
  expenseSummary?: ExpenseSummary;
}

// Generate deterministic student intelligence workflow plans when server API key is absent or offline
function generateDeterministicPlan(
  userPrompt: string,
  userProfile?: StudentUser | null,
  activeTasks: StudentTask[] = []
): AIResponsePayload {
  const promptLower = userPrompt.toLowerCase();
  const userName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Student';
  const intent = classifyIntent(userPrompt);

  // 0. Educational & Concept Explanations (ZERO tasks created!)
  if (intent.category === 'learning_explanation' || intent.category === 'general_question') {
    const lesson = generateTutorExplanation(intent.topic || userPrompt, userPrompt, userProfile);
    return {
      text: lesson,
      proposedActions: [],
      fallbackUsed: true,
    };
  }

  // 1. Progress & Status Inquiries
  if (
    promptLower.includes('how much of my interview') ||
    promptLower.includes('what should i study today') ||
    promptLower.includes('which important tasks are overdue') ||
    promptLower.includes('status of my tasks') ||
    promptLower.includes('completion rate')
  ) {
    const answer = getAnswerForProgressQuery(userPrompt, activeTasks);
    return {
      text: answer,
    };
  }

  // 2. Rescheduling / Missed tasks
  if (promptLower.includes('missed yesterday') || promptLower.includes('update my plan')) {
    const overdueTasks = activeTasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]
    );

    const rescheduledActions: ActionProposal[] = overdueTasks.map((t, idx) => ({
      id: `prop-reschedule-${Date.now()}-${idx}`,
      toolId: 'synaps-tasks',
      toolName: 'Synaps Task Manager',
      actionType: 'create_task',
      title: `[Rescheduled] ${t.title}`,
      description: `Catch-up session: ${t.description}`,
      priority: 'high',
      deadline: new Date(Date.now() + 86400000 * (idx + 1)).toISOString().split('T')[0],
      time: '17:00',
      category: t.category,
      subtasks: t.subtasks.map((s) => s.title),
      isInternal: true,
      status: 'pending',
    }));

    return {
      text: `### 🔄 Adjusted Recovery Schedule for ${userName}\nDon't worry about missing yesterday's schedule — consistency is built by adapting! I've analyzed your ${overdueTasks.length} uncompleted tasks and recalibrated their deadlines over the next few days to avoid burnout. Review and confirm the adjusted tasks below:`,
      planSummary: {
        goal: 'Missed Task Recovery Plan',
        totalSteps: rescheduledActions.length,
        duration: `${rescheduledActions.length + 1} Days`,
        toolsRecommended: ['Synaps Task Manager', 'Google Calendar'],
      },
      proposedActions: rescheduledActions,
    };
  }

  // 3. Software Engineering Interview Preparation Workflow
  if (
    promptLower.includes('interview') ||
    promptLower.includes('software engineering') ||
    promptLower.includes('sde') ||
    promptLower.includes('placement')
  ) {
    const today = new Date();
    const d1 = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
    const d2 = new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0];
    const d3 = new Date(today.getTime() + 86400000 * 3).toISOString().split('T')[0];
    const d4 = new Date(today.getTime() + 86400000 * 4).toISOString().split('T')[0];
    const d5 = new Date(today.getTime() + 86400000 * 5).toISOString().split('T')[0];
    const d6 = new Date(today.getTime() + 86400000 * 6).toISOString().split('T')[0];

    const proposals: ActionProposal[] = [
      {
        id: `prop-${Date.now()}-1`,
        toolId: 'leetcode',
        toolName: 'LeetCode',
        actionType: 'create_task',
        title: 'Master Top 5 Array & Two-Pointer Problems on LeetCode',
        description: 'Solve Two Sum, 3Sum, Container With Most Water, Best Time to Buy & Sell Stock, and Trapping Rain Water.',
        priority: 'high',
        category: 'Coding Practice',
        deadline: d1,
        time: '18:00',
        subtasks: ['Two Sum (Hashmap O(N))', 'Two-pointer 3Sum sorting approach', 'Container With Most Water', 'Trapping Rain Water logic'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-${Date.now()}-2`,
        toolId: 'geeksforgeeks',
        toolName: 'GeeksforGeeks',
        actionType: 'create_task',
        title: 'Revise OOP Concepts & SOLID Design Principles',
        description: 'Deep dive into Polymorphism, Inheritance vs Composition, Abstract Classes, and SOLID architectural rules.',
        priority: 'high',
        category: 'Interview Preparation',
        deadline: d2,
        time: '15:00',
        subtasks: ['Compile vs Runtime Polymorphism (vptr/vtable)', 'Dependency Inversion Principle code sample', 'Singleton & Factory pattern sketch'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-${Date.now()}-3`,
        toolId: 'geeksforgeeks',
        toolName: 'GeeksforGeeks',
        actionType: 'create_task',
        title: 'DBMS & SQL Query Optimization Practice',
        description: 'Review ACID properties, B+ Tree indexing, and write 5 complex SQL queries with JOINs & subqueries.',
        priority: 'medium',
        category: 'Interview Preparation',
        deadline: d3,
        time: '17:00',
        subtasks: ['Clustered vs Non-clustered indexing', 'Write 2nd Highest Salary query in SQL', 'Transaction Isolation Levels comparison table'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-${Date.now()}-4`,
        toolId: 'geeksforgeeks',
        toolName: 'GeeksforGeeks',
        actionType: 'create_task',
        title: 'Operating Systems & Concurrency Revision',
        description: 'Review Process vs Threads, Virtual Memory, Deadlock Conditions (Coffman), and Mutex vs Semaphore.',
        priority: 'medium',
        category: 'Interview Preparation',
        deadline: d4,
        time: '16:00',
        subtasks: ['Deadlock prevention vs avoidance (Banker’s algorithm)', 'Page replacement algorithms (LRU, FIFO)', 'Thread synchronization primitives'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-${Date.now()}-5`,
        toolId: 'google-docs',
        toolName: 'Google Docs',
        actionType: 'create_task',
        title: 'Resume Polish & Project Talking Points Review',
        description: 'Ensure 1-page format with XYZ bullet points. Prepare 2-minute elevator pitch for top GitHub repository.',
        priority: 'high',
        category: 'Projects',
        deadline: d5,
        time: '19:00',
        subtasks: ['Quantify metrics on primary full-stack project', 'Draft answers to "What was your biggest technical challenge?"', 'Run ATS keyword check on Google Docs'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-${Date.now()}-6`,
        toolId: 'chatgpt',
        toolName: 'ChatGPT / Gemini',
        actionType: 'create_task',
        title: 'Mock Behavioral & STAR-Method Interview Simulation',
        description: 'Simulate behavioral questions using STAR method: Situation, Task, Action, Result. Focus on leadership and conflict resolution.',
        priority: 'medium',
        category: 'Interview Preparation',
        deadline: d6,
        time: '14:00',
        subtasks: ['Prepare "Tell me about a time a project failed"', 'Prepare "How do you handle disagreement with a teammate?"', 'Do 30-minute timed mock interview session'],
        isInternal: true,
        status: 'pending',
      },
    ];

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      'Synaps X: Software Engineering Interview Prep Block'
    )}&dates=${d1.replace(/-/g, '')}T100000Z/${d1.replace(/-/g, '')}T120000Z&details=${encodeURIComponent(
      'Daily 2-hour technical interview prep session organized via Synaps X.'
    )}`;

    return {
      text: `### 🚀 Software Engineering Interview Preparation Masterplan

Welcome, **${userName}**! To help you excel in campus placements and top-tier tech rounds, I have synthesized a battle-tested preparation blueprint.

#### 1. Strategic Focus Areas
- **Data Structures & Algorithms**: Focus on High-Frequency patterns (Arrays, Two Pointers, Trees, Graphs, DP).
- **Core Computer Science Fundamentals**: OOP, DBMS (Indexes & Transactions), Operating Systems (Concurrency & Memory), and Computer Networks (TCP/IP, HTTP/HTTPS).
- **Project Deep-Dive**: Ability to explain your GitHub portfolio architectures and trade-offs.
- **Behavioral Rounds**: Delivering structured STAR-method answers.

#### 2. Recommended Synaps X Tools
- **LeetCode** *(External)*: Solve targeted array, tree, and dynamic programming problems.
- **GeeksforGeeks** *(External)*: Rapid revision of OS, DBMS, and OOP interview cheat sheets.
- **Google Docs** *(External)*: Refine your ATS-compliant tech resume.
- **GitHub** *(External)*: Polish README files and pin demo deployment links.
- **Google Calendar** *(Available Integration)*: Schedule uninterrupted 2-hour deep-work practice blocks.
- **ChatGPT / Gemini** *(External)*: Practice mock technical and behavioral drill questions.

*Note on Tool Access:* Synaps X acts as your central intelligence orchestrator. Clicking external tools opens verified portals directly. For your convenience, **I have prepared 6 high-yield internal tasks below**. Review and confirm them to automatically populate your Synaps X Task Manager!`,
      planSummary: {
        goal: 'Software Engineering Interview Preparation',
        totalSteps: 6,
        duration: '6 Days Intensive (expandable to 3 weeks)',
        targetRole: 'Software Development Engineer (SDE 1 / Intern)',
        toolsRecommended: ['LeetCode', 'GeeksforGeeks', 'Google Docs', 'GitHub', 'Google Calendar', 'ChatGPT'],
      },
      proposedActions: proposals,
      calendarData: {
        eventTitle: 'SDE Technical Interview Prep Block',
        date: d1,
        time: '10:00',
        description: '2-hour focused coding and fundamentals session generated by Synaps AI.',
        googleCalendarUrl: calendarUrl,
      },
    };
  }

  // 4. 7-Day DSA Preparation Plan
  if (promptLower.includes('dsa') || promptLower.includes('7-day') || promptLower.includes('data structures')) {
    const today = new Date();
    const days = [1, 2, 3, 4, 5, 6, 7].map((d) =>
      new Date(today.getTime() + 86400000 * d).toISOString().split('T')[0]
    );

    const dsaProposals: ActionProposal[] = [
      {
        id: `prop-dsa-1`,
        toolId: 'leetcode',
        toolName: 'LeetCode',
        actionType: 'create_task',
        title: 'Day 1: Arrays & Sliding Window Patterns',
        description: 'Solve Maximum Subarray (Kadane), Minimum Size Subarray Sum, and Longest Substring Without Repeating Characters.',
        priority: 'high',
        category: 'Coding Practice',
        deadline: days[0],
        time: '17:00',
        subtasks: ['Kadane Algorithm analysis', 'Variable sliding window template', 'Fixed sliding window template'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-dsa-2`,
        toolId: 'leetcode',
        toolName: 'LeetCode',
        actionType: 'create_task',
        title: 'Day 2: Two Pointers & Binary Search',
        description: 'Practice search in rotated sorted array, peak element, and 3Sum closest.',
        priority: 'high',
        category: 'Coding Practice',
        deadline: days[1],
        time: '17:00',
        subtasks: ['Binary Search boundary handling', 'Search in Rotated Sorted Array', 'Two sum II input array is sorted'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-dsa-3`,
        toolId: 'leetcode',
        toolName: 'LeetCode',
        actionType: 'create_task',
        title: 'Day 3: Linked Lists & Fast-Slow Pointers',
        description: 'Reverse Linked List, detect cycle (Floyd cycle finding), and Merge K Sorted Lists.',
        priority: 'medium',
        category: 'Coding Practice',
        deadline: days[2],
        time: '17:00',
        subtasks: ['Iterative & Recursive reverse linked list', 'Linked List Cycle II detection', 'LRU Cache design overview'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-dsa-4`,
        toolId: 'leetcode',
        toolName: 'LeetCode',
        actionType: 'create_task',
        title: 'Day 4: Stacks, Queues & Monotonic Stack',
        description: 'Next Greater Element, Daily Temperatures, and Min Stack design.',
        priority: 'medium',
        category: 'Coding Practice',
        deadline: days[3],
        time: '17:00',
        subtasks: ['Valid Parentheses warm-up', 'Monotonic decreasing stack pattern', 'Min Stack implementation with 2 stacks'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-dsa-5`,
        toolId: 'leetcode',
        toolName: 'LeetCode',
        actionType: 'create_task',
        title: 'Day 5: Trees & Binary Search Trees (DFS/BFS)',
        description: 'Invert Binary Tree, Lowest Common Ancestor (LCA), and Binary Tree Level Order Traversal.',
        priority: 'high',
        category: 'Coding Practice',
        deadline: days[4],
        time: '17:00',
        subtasks: ['Recursive vs Iterative DFS', 'Queue-based BFS level order traversal', 'Validate Binary Search Tree property'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-dsa-6`,
        toolId: 'leetcode',
        toolName: 'LeetCode',
        actionType: 'create_task',
        title: 'Day 6: Graphs (BFS, DFS, Dijkstra)',
        description: 'Number of Islands, Clone Graph, and Course Schedule (Topological Sort).',
        priority: 'high',
        category: 'Coding Practice',
        deadline: days[5],
        time: '17:00',
        subtasks: ['Adjacency list representation', 'Cycle detection in directed graph (Kahn algorithm)', 'Number of Islands DFS grid traversal'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-dsa-7`,
        toolId: 'leetcode',
        toolName: 'LeetCode',
        actionType: 'create_task',
        title: 'Day 7: Dynamic Programming Fundamentals',
        description: 'Climbing Stairs, House Robber, Coin Change, and Longest Common Subsequence.',
        priority: 'high',
        category: 'Coding Practice',
        deadline: days[6],
        time: '17:00',
        subtasks: ['Memoization vs Tabulation trade-offs', '1D DP array space optimization', 'LCS 2D grid matrix trace'],
        isInternal: true,
        status: 'pending',
      },
    ];

    return {
      text: `### ⚡ 7-Day High-Impact DSA Bootcamp

Here is your focused 7-day algorithmic sprint designed to maximize pattern recognition across top interview topics.

- **Tools Recommended**: LeetCode (for hands-on coding) and GeeksforGeeks (for concept breakdowns).
- **Daily Commitment**: 2 to 3 hours per day.
- **Strategy**: Focus on the underlying pattern rather than memorizing individual solutions.

Review the 7 planned daily tasks below and confirm them to sync straight into your Synaps X Task Manager:`,
      planSummary: {
        goal: '7-Day Intensive DSA Bootcamp',
        totalSteps: 7,
        duration: '7 Days',
        toolsRecommended: ['LeetCode', 'GeeksforGeeks', 'YouTube Educational Hub'],
      },
      proposedActions: dsaProposals,
    };
  }

  // 5. College Project Completion Plan
  if (promptLower.includes('project') || promptLower.includes('deadline')) {
    const d1 = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const d2 = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
    const d3 = new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0];

    const projectProposals: ActionProposal[] = [
      {
        id: `prop-proj-1`,
        toolId: 'github',
        toolName: 'GitHub',
        actionType: 'create_task',
        title: 'Finalize Core API Endpoints & Bug Fixes on GitHub',
        description: 'Complete remaining backend CRUD routes, handle error boundaries, and merge open pull requests.',
        priority: 'high',
        category: 'Projects',
        deadline: d1,
        time: '20:00',
        subtasks: ['Verify JWT authentication flow', 'Write unit tests for core controllers', 'Merge sprint branch to main'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-proj-2`,
        toolId: 'google-docs',
        toolName: 'Google Docs',
        actionType: 'create_task',
        title: 'Draft Project Documentation & System Architecture Report',
        description: 'Include ER diagram, system architecture flowcharts, API schemas, and installation steps in Google Docs.',
        priority: 'medium',
        category: 'Projects',
        deadline: d2,
        time: '18:00',
        subtasks: ['Export ER diagram from database schema', 'Write introduction, problem statement & methodology', 'Format bibliography and references'],
        isInternal: true,
        status: 'pending',
      },
      {
        id: `prop-proj-3`,
        toolId: 'google-classroom',
        toolName: 'Google Classroom',
        actionType: 'create_task',
        title: 'Prepare Final Slide Deck & Submit to Classroom',
        description: 'Create 10-slide presentation highlighting problem statement, tech stack, live demo video, and conclusion.',
        priority: 'high',
        category: 'Academics',
        deadline: d3,
        time: '23:59',
        subtasks: ['Record 2-minute backup screen demo video', 'Review grading rubric on Google Classroom', 'Submit final report PDF'],
        isInternal: true,
        status: 'pending',
      },
    ];

    return {
      text: `### 🎯 College Project Finalization Sprint

I have organized a high-efficiency 3-phase delivery roadmap to get your college project completed and submitted ahead of the deadline!

- **GitHub**: For code reviews, staging merges, and clean commit history.
- **Google Docs**: For compiling your academic report and system architecture documentation.
- **Google Classroom**: For verifying submission requirements and uploading final deliverables.

Approve the 3 milestone tasks below to add them to your Synaps X Task Manager:`,
      planSummary: {
        goal: 'College Project Completion Sprint',
        totalSteps: 3,
        duration: '1 Week',
        toolsRecommended: ['GitHub', 'Google Docs', 'Google Classroom'],
      },
      proposedActions: projectProposals,
    };
  }

  // 6. Generic intelligent response
  if (!intent.requiresTasks) {
    return {
      text: generateTutorExplanation(intent.topic || userPrompt, userPrompt, userProfile),
      proposedActions: [],
      fallbackUsed: true,
    };
  }

  const tools = findToolsForGoal(userPrompt);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const defaultProposal: ActionProposal = {
    id: `prop-gen-${Date.now()}`,
    toolId: 'synaps-tasks',
    toolName: 'Synaps Task Manager',
    actionType: 'create_task',
    title: userPrompt.replace(/^(create\s+a\s+task\s+to\s+|add\s+a\s+task\s+to\s+)/i, '').slice(0, 60),
    description: `Task scheduled by student request: "${userPrompt}"`,
    priority: 'medium',
    category: 'Personal Productivity',
    deadline: tomorrow,
    time: '18:00',
    subtasks: ['Initial research & setup', 'Execute core work block', 'Review & finalize'],
    isInternal: true,
    status: 'pending',
  };

  return {
    text: `### 📋 Task Recommendation for ${userName}\nI have prepared a task based on your request: "${defaultProposal.title}". You can confirm and save it directly into your task list:`,
    planSummary: {
      goal: userPrompt.slice(0, 60),
      totalSteps: 1,
      duration: 'Flexible',
      toolsRecommended: tools.map((t) => t.name),
    },
    proposedActions: [defaultProposal],
  };
}

export async function sendChatMessage(
  message: string,
  history: AIChatMessage[] = [],
  userProfile?: StudentUser | null,
  activeTasks: StudentTask[] = []
): Promise<AIResponsePayload> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
        userProfile,
        activeTasks: activeTasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          category: t.category,
        })),
        userGoal: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // Automatically sync created tasks into the user's task repository
    let syncedTasks: StudentTask[] = [];
    if (Array.isArray(data.createdTasks) && data.createdTasks.length > 0) {
      syncedTasks = batchCreateTasks(data.createdTasks, userProfile?.email);
    }

    // Automatically store notifications in user-isolated notification store
    if (Array.isArray(data.notifications) && data.notifications.length > 0) {
      try {
        const userId = userProfile?.id || userProfile?.email;
        for (const notif of data.notifications) {
          addNotification(userId, {
            title: notif.title || 'System Alert',
            message: notif.message || '',
            category: notif.category || 'ai',
            read: false,
          });
        }
      } catch (e) {
        console.warn('Could not save notifications:', e);
      }
    }

    return {
      text: data.text || 'Workflow executed successfully.',
      workflowPlan: data.workflowPlan,
      executionActivities: data.executionActivity,
      createdTasks: syncedTasks.length > 0 ? syncedTasks : data.createdTasks,
      generatedImages: data.generatedImages || [],
      notifications: data.notifications,
      calendarData: data.calendarData,
      learningContent: data.learningContent,
      progressSummary: data.progressSummary,
      connectedTools: data.connectedTools,
      fallbackUsed: Boolean(data.fallbackUsed),
      expenseProposal: data.expenseProposal,
      expenseSummary: data.expenseSummary,
    };
  } catch (err: any) {
    console.warn('API call failed, switching to local Synaps AI engine:', err);
    const fallbackResponse = generateDeterministicPlan(message, userProfile, activeTasks);
    // Auto sync proposed actions as real tasks in fallback mode too
    let syncedFallbackTasks: StudentTask[] = [];
    if (fallbackResponse.proposedActions && fallbackResponse.proposedActions.length > 0) {
      const tasksToCreate = fallbackResponse.proposedActions
        .filter((p) => p.actionType === 'create_task')
        .map((p) => ({
          title: p.title,
          description: p.description,
          priority: p.priority || 'medium',
          status: 'todo' as const,
          category: p.category || 'Interview Preparation',
          dueDate: p.deadline || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          dueTime: p.time || '18:00',
          subtasks: (p.subtasks || []).map((st, idx) => ({
            id: `st-${Date.now()}-${idx}`,
            title: st,
            completed: false,
          })),
        }));
      syncedFallbackTasks = batchCreateTasks(tasksToCreate, userProfile?.email);
    }

    return {
      ...fallbackResponse,
      createdTasks: syncedFallbackTasks,
      fallbackUsed: true,
    };
  }
}

export async function generateStandaloneImage(
  prompt: string,
  options?: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    style?: 'photorealistic' | 'digital-art' | 'logo' | 'poster' | 'minimalist' | 'concept-art';
    outputFormat?: 'jpeg' | 'png' | 'webp';
    testMode?: string;
  }
): Promise<GeneratedImageItem> {
  const response = await fetch('/api/ai/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      ...options,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Image generation failed with HTTP ${response.status}`);
  }

  return response.json();
}
