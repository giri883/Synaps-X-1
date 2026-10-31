export type AIIntentCategory =
  | 'learning_explanation'
  | 'general_question'
  | 'image_generation'
  | 'task_management'
  | 'expense_tracking'
  | 'multi_action_workflow';

export interface ClassifiedIntent {
  category: AIIntentCategory;
  primaryGoal: string;
  topic?: string;
  requiresTasks: boolean;
  taskCount?: number;
  requiresImage: boolean;
  requiresExpense: boolean;
  isMixedWorkflow: boolean;
  requestedActions: string[];
}

/**
 * Classifies the student's message into unambiguous intent categories
 * before any tool execution occurs.
 */
export function classifyIntent(message: string): ClassifiedIntent {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // 1. Explicit task creation or manipulation pattern
  // Matches "create a task", "add 3 tasks", "create three revision tasks", "schedule a task"
  const taskCreationRegex =
    /\b(create|add|schedule|set up|generate|make|log)\s+(?:(?:a|an|the|\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+)?(?:revision\s+|study\s+|follow-up\s+)?(task|tasks|todo|todos|to-do|reminders?)\b/i;
  
  const hasTaskCreation = taskCreationRegex.test(lower);
  const hasTaskQuery = /\b(my tasks|list tasks|active tasks|overdue tasks|task status|show tasks)\b/i.test(lower);
  const hasTaskCommand = hasTaskCreation || hasTaskQuery;

  // Extract task count if specified (e.g. "create three revision tasks", "add 5 tasks")
  let taskCount = 1;
  const countMatch = lower.match(/\b(create|add|schedule)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(revision\s+|study\s+)?tasks?\b/i);
  if (countMatch && countMatch[2]) {
    const wordToNum: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
    };
    taskCount = wordToNum[countMatch[2].toLowerCase()] || parseInt(countMatch[2], 10) || 1;
  }

  // 2. Educational & Learning Explanation pattern
  // Matches "explain", "teach", "what is", "how does ... work", "concept of", "difference between", etc.
  const isExplanationPrompt =
    /\b(explain|teach|what is|what are|what's|how does|how do|how to|concept of|difference between|compare|describe|define|overview of|lesson on|walk me through|demystify)\b/i.test(lower) ||
    /\b(understand|tutorial|learn about|examples of|meaning of)\b/i.test(lower) ||
    lower.startsWith('why is') ||
    lower.startsWith('why do') ||
    lower.startsWith('can you explain') ||
    lower.startsWith('tell me about');

  // 3. Image Generation pattern
  // Matches "generate image", "create a photorealistic image", "draw", "logo for", "poster for"
  const isImagePrompt =
    /\b(generate|create|draw|render|design|make)\s+(a\s+|an\s+|the\s+)?(photorealistic\s+|digital\s+|anime\s+|3d\s+)?(image|picture|photo|artwork|illustration|logo|poster|banner|drawing|graphic)\b/i.test(lower) ||
    /\b(photorealistic|visual asset|event poster|college logo)\b/i.test(lower);

  // 4. Expense Tracking pattern
  const isExpensePrompt =
    /\b(track my expenditure|track my expenses|start tracking expenses|start expense tracking|spent ₹|spent rs|spent inr|how much did i spend|how much have i spent|expense summary|spending summary|pause expense|resume expense|stop expense|delete expense)\b/i.test(lower) ||
    (lower.includes('spent') && /\d+/.test(lower)) ||
    (lower.includes('budget') && (lower.includes('track') || lower.includes('days')));

  // 5. Multi-Day Career Preparation Workflow (e.g. 7-day SDE interview prep)
  const isSdeInterviewWorkflow =
    (lower.includes('interview') || lower.includes('software engineering') || lower.includes('sde') || lower.includes('placement')) &&
    (lower.includes('seven days') || lower.includes('7 day') || lower.includes('prepare') || lower.includes('study plan') || lower.includes('roadmap'));

  // ---------------- ROUTING LOGIC ----------------

  // Case A: Mixed Multi-Action Workflow (Learning + Explicit Task Creation)
  // Example: "Explain thermodynamics and create three revision tasks"
  if (isExplanationPrompt && hasTaskCreation) {
    const topic = extractLearningTopic(trimmed);
    return {
      category: 'multi_action_workflow',
      primaryGoal: `Explain ${topic} and schedule ${taskCount} revision tasks`,
      topic,
      requiresTasks: true,
      taskCount,
      requiresImage: false,
      requiresExpense: false,
      isMixedWorkflow: true,
      requestedActions: ['explain_concept', 'create_tasks'],
    };
  }

  // Case B: Mixed Multi-Action Workflow (Image + Publication Task)
  // Example: "Generate a poster and create a task to publish it tomorrow"
  if (isImagePrompt && hasTaskCreation) {
    return {
      category: 'multi_action_workflow',
      primaryGoal: 'Generate visual artwork and schedule publication task',
      requiresTasks: true,
      taskCount: 1,
      requiresImage: true,
      requiresExpense: false,
      isMixedWorkflow: true,
      requestedActions: ['generate_image', 'create_task'],
    };
  }

  // Case C: Multi-Day Structured Career Prep
  // Example: "Help me prepare for an SDE interview in seven days..."
  if (isSdeInterviewWorkflow) {
    return {
      category: 'multi_action_workflow',
      primaryGoal: 'Multi-day software engineering interview preparation roadmap',
      requiresTasks: true,
      taskCount: 7,
      requiresImage: false,
      requiresExpense: false,
      isMixedWorkflow: true,
      requestedActions: ['create_roadmap_tasks', 'schedule_calendar', 'generate_resources'],
    };
  }

  // Case D: Pure Expense Tracking
  if (isExpensePrompt) {
    return {
      category: 'expense_tracking',
      primaryGoal: 'Manage user-controlled expenditure tracking',
      requiresTasks: false,
      requiresImage: false,
      requiresExpense: true,
      isMixedWorkflow: false,
      requestedActions: ['expense_tracking_action'],
    };
  }

  // Case E: Pure Image Generation
  // Example: "Generate a photorealistic image of a futuristic campus"
  if (isImagePrompt && !hasTaskCreation) {
    return {
      category: 'image_generation',
      primaryGoal: 'Synthesize visual artwork',
      requiresTasks: false,
      requiresImage: true,
      requiresExpense: false,
      isMixedWorkflow: false,
      requestedActions: ['generate_image'],
    };
  }

  // Case F: Explicit Task Management
  // Example: "Create a task to study thermodynamics tomorrow"
  if (hasTaskCommand && !isExplanationPrompt) {
    return {
      category: 'task_management',
      primaryGoal: 'Manage student schedule and tasks',
      requiresTasks: true,
      taskCount: taskCount || 1,
      requiresImage: false,
      requiresExpense: false,
      isMixedWorkflow: false,
      requestedActions: ['task_management_action'],
    };
  }

  // Case G: Pure Learning & Educational Explanation
  // Example: "Explain thermodynamics to me", "What is recursion?", "Teach me SQL joins"
  if (isExplanationPrompt) {
    const topic = extractLearningTopic(trimmed);
    return {
      category: 'learning_explanation',
      primaryGoal: `Explain ${topic}`,
      topic,
      requiresTasks: false,
      requiresImage: false,
      requiresExpense: false,
      isMixedWorkflow: false,
      requestedActions: ['provide_educational_explanation'],
    };
  }

  // Case H: General Knowledge or Conversation
  // Example: "Why is the sky blue?", "Who invented C++?", "Hello", "How are you?"
  return {
    category: 'general_question',
    primaryGoal: 'Direct conversational answer',
    requiresTasks: false,
    requiresImage: false,
    requiresExpense: false,
    isMixedWorkflow: false,
    requestedActions: ['direct_answer'],
  };
}

/**
 * Extracts the clean topic from an educational question
 */
export function extractLearningTopic(prompt: string): string {
  let cleaned = prompt
    .replace(/^can you (please )?(explain|teach|describe|tell me about)\s+(me\s+about\s+|me\s+|about\s+)?/i, '')
    .replace(/^(please )?(explain|teach|describe|tell me about)\s+(me\s+about\s+|me\s+|about\s+)?/i, '')
    .replace(/^(what is|what are|what's|define|concept of)\s+/i, '')
    .replace(/^(how does|how do)\s+/i, '')
    .replace(/\s+(with examples?|to me|for beginners?|in simple terms?|please)\s*$/i, '')
    .replace(/\s+and create.*$/i, '')
    .trim();

  // Remove trailing punctuation
  cleaned = cleaned.replace(/[?.!]+$/, '').trim();

  return cleaned || 'the requested topic';
}

export interface ExtractedTaskDetails {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category: 'Academics' | 'Interview Preparation' | 'Coding Practice' | 'Projects' | 'Personal Productivity';
  subtasks: string[];
}

/**
 * Extracts clean, actionable task parameters from a natural language prompt
 */
export function extractTaskDetails(message: string, baseDate: Date = new Date()): ExtractedTaskDetails {
  const lower = message.toLowerCase();

  // Calculate due date
  let dueDateOffset = 1; // default tomorrow
  if (lower.includes('today') || lower.includes('tonight')) {
    dueDateOffset = 0;
  } else if (lower.includes('tomorrow')) {
    dueDateOffset = 1;
  } else {
    const daysMatch = lower.match(/in\s+(\d+)\s+days?/);
    if (daysMatch) {
      dueDateOffset = parseInt(daysMatch[1], 10);
    }
  }
  const dueDate = new Date(baseDate.getTime() + 86400000 * dueDateOffset).toISOString().split('T')[0];

  // Clean title
  let cleaned = message
    .replace(/^please\s+/i, '')
    .replace(/^(can you\s+)?(please\s+)?(create|add|schedule|set up|make|log)\s+(a\s+|an\s+)?(revision\s+|study\s+|follow-up\s+)?(task|todo|to-do|reminder)\s+(to\s+|for\s+)?/i, '')
    .replace(/\s+(tomorrow|today|tonight|next week|by tomorrow|by today)\s*$/i, '')
    .replace(/\s+(for me|please)\s*$/i, '')
    .trim();

  // If starts with "to ", remove it
  cleaned = cleaned.replace(/^to\s+/i, '').trim();

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  } else {
    cleaned = 'Study Session';
  }

  // Determine category
  const cleanedLower = cleaned.toLowerCase();
  let category: 'Academics' | 'Interview Preparation' | 'Coding Practice' | 'Projects' | 'Personal Productivity' = 'Academics';
  if (cleanedLower.includes('code') || cleanedLower.includes('leetcode') || cleanedLower.includes('program') || cleanedLower.includes('bug')) {
    category = 'Coding Practice';
  } else if (cleanedLower.includes('interview') || cleanedLower.includes('resume') || cleanedLower.includes('sde') || cleanedLower.includes('mock')) {
    category = 'Interview Preparation';
  } else if (cleanedLower.includes('project') || cleanedLower.includes('design') || cleanedLower.includes('poster') || cleanedLower.includes('build')) {
    category = 'Projects';
  } else if (cleanedLower.includes('workout') || cleanedLower.includes('grocer') || cleanedLower.includes('clean') || cleanedLower.includes('call')) {
    category = 'Personal Productivity';
  }

  // Generate appropriate subtasks
  let subtasks: string[] = [];
  if (category === 'Academics') {
    subtasks = [
      `Review lecture notes and fundamental principles`,
      `Work through textbook examples and problem sets`,
      `Complete self-assessment checklist and summary notes`,
    ];
  } else if (category === 'Coding Practice') {
    subtasks = [
      `Review algorithmic patterns and edge cases`,
      `Implement optimal solution with clean code`,
      `Analyze time and space complexity`,
    ];
  } else if (category === 'Interview Preparation') {
    subtasks = [
      `Review high-frequency interview questions`,
      `Practice timed explanation using STAR framework`,
      `Note down improvement points and follow-ups`,
    ];
  } else {
    subtasks = [
      `Define scope and assemble necessary materials`,
      `Execute primary work block`,
      `Review deliverables and mark milestone complete`,
    ];
  }

  return {
    title: cleaned,
    description: `Targeted task orchestrated by Central AI for: ${cleaned}`,
    dueDate,
    priority: 'high',
    category,
    subtasks,
  };
}

/**
 * Generates tailored academic revision tasks for a specific topic
 */
export function generateRevisionTasks(topic: string, count: number = 3, baseDate: Date = new Date()) {
  const cleanTopic = extractLearningTopic(topic);
  const capitalizedTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

  const modules = [
    { name: 'Core Foundations & Definitions', focus: 'Fundamental principles, formulas, and terminology' },
    { name: 'Step-by-Step Mechanisms & Laws', focus: 'Underlying processes, governing equations, and proofs' },
    { name: 'Applied Problem Solving & Analysis', focus: 'Representative numerical problems and practical scenarios' },
    { name: 'Comprehensive Review & Mock Test', focus: 'Self-assessment questions and active recall test' },
  ];

  const tasks = [];
  for (let i = 0; i < Math.min(count, 8); i++) {
    const mod = modules[i % modules.length];
    const dueDate = new Date(baseDate.getTime() + 86400000 * (i + 1)).toISOString().split('T')[0];
    tasks.push({
      title: `${capitalizedTopic} Revision ${i + 1}: ${mod.name}`,
      description: `Structured revision session focusing on ${mod.focus}.`,
      dueDate,
      priority: (i === 0 ? 'high' : 'medium') as 'high' | 'medium',
      category: 'Academics' as const,
      subtasks: [
        `Review theoretical foundations of ${mod.name}`,
        `Solve 2-3 application problems`,
        `Complete self-check quiz without reference notes`,
      ],
    });
  }

  return tasks;
}

