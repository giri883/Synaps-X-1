import { ToolDefinition } from '../types';

export const TOOL_REGISTRY: ToolDefinition[] = [
  // Internal Synaps X Capabilities
  {
    id: 'synaps-tasks',
    name: 'Synaps Task Manager',
    category: 'Internal Productivity',
    description: 'Native task orchestration engine with priorities, deadlines, categories, and subtasks.',
    connectionStatus: 'internal',
    supportedActions: [
      'Create task with priority and deadline',
      'Toggle completion and manage subtasks',
      'Filter and prioritize academic workloads',
      'Track overdue deadlines in real-time',
    ],
    requiredPermissions: ['User Confirmation on Creation / Modification'],
    reasonWhyUseful:
      'Provides persistent, local task tracking directly inside your Synaps X dashboard with zero external login friction.',
    iconName: 'CheckSquare',
    badge: 'Native Internal',
  },
  {
    id: 'synaps-progress',
    name: 'Synaps Progress Tracker',
    category: 'Internal Analytics',
    description: 'Real-time completion percentage metrics, upcoming deadline schedule, and study streak analyzer.',
    connectionStatus: 'internal',
    supportedActions: [
      'Compute overall completion rates',
      'Identify critical overdue deadlines',
      'Generate daily student study status',
    ],
    requiredPermissions: ['Read Internal Task State'],
    reasonWhyUseful:
      'Keeps you accountable with transparent visual metrics across all your academic and career goals.',
    iconName: 'TrendingUp',
    badge: 'Native Internal',
  },
  // Calendar Integration
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'Schedule & Time',
    description: 'World-standard calendar for study blocks, exam alerts, and interview sessions.',
    url: 'https://calendar.google.com',
    connectionStatus: 'integration_available',
    supportedActions: [
      'Generate calendar-ready timetables',
      'Generate 1-click Google Calendar web import URLs',
      'Export standard .ics iCalendar files',
    ],
    requiredPermissions: ['Browser Web Navigation / Download'],
    reasonWhyUseful:
      'Allows you to seamlessly lock in your Synaps X study schedule into your daily calendar without sharing private Google tokens.',
    iconName: 'Calendar',
    badge: 'Direct Export',
  },
  // Coding & Technical
  {
    id: 'leetcode',
    name: 'LeetCode',
    category: 'Technical Prep',
    description: 'Industry-standard coding interview problem repository and contest portal.',
    url: 'https://leetcode.com',
    connectionStatus: 'external_link',
    supportedActions: [
      'Launch algorithmic problem sets',
      'Navigate to company-tagged questions',
      'Track DSA practice externally',
    ],
    requiredPermissions: ['External Web Navigation'],
    reasonWhyUseful:
      'Essential for cracking coding assessments (FAANG, tier-1 tech, startups) with curated DSA challenges.',
    iconName: 'Code',
    badge: 'External Link',
  },
  {
    id: 'geeksforgeeks',
    name: 'GeeksforGeeks',
    category: 'CS Fundamentals',
    description: 'Comprehensive computer science tutorials, DBMS, OS, Computer Networks, and interview archives.',
    url: 'https://www.geeksforgeeks.org',
    connectionStatus: 'external_link',
    supportedActions: [
      'Review core CS concepts (OS, DBMS, OOP, CN)',
      'Access company-specific interview experiences',
      'Read language reference documentation',
    ],
    requiredPermissions: ['External Web Navigation'],
    reasonWhyUseful:
      'Provides the best quick-revision cheat sheets for theoretical technical rounds and campus placements.',
    iconName: 'BookOpen',
    badge: 'External Link',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Projects & Code',
    description: 'Code repository hosting, open-source portfolio, and version control.',
    url: 'https://github.com',
    connectionStatus: 'external_link',
    supportedActions: [
      'Manage capstone project repositories',
      'Showcase open source contributions on resume',
      'Deploy full-stack portfolio demos',
    ],
    requiredPermissions: ['External Web Navigation'],
    reasonWhyUseful:
      'Every software engineering interviewer reviews your GitHub projects and code commits.',
    iconName: 'Github',
    badge: 'External Link',
  },
  // Resume & Documentation
  {
    id: 'google-docs',
    name: 'Google Docs',
    category: 'Resume & Documents',
    description: 'Collaborative cloud document editor for single-page tech resumes and academic reports.',
    url: 'https://docs.google.com',
    connectionStatus: 'external_link',
    supportedActions: [
      'Draft ATS-friendly tech resumes',
      'Format project documentation',
      'Collaborate on team project papers',
    ],
    requiredPermissions: ['External Web Navigation'],
    reasonWhyUseful:
      'Standard editor for crafting clean, ATS-compliant tech resumes using standard bullet points and quantified metrics.',
    iconName: 'FileText',
    badge: 'External Link',
  },
  // Classroom & Academia
  {
    id: 'google-classroom',
    name: 'Google Classroom',
    category: 'Academics',
    description: 'Official university class portal for assignments, lecture notes, and teacher announcements.',
    url: 'https://classroom.google.com',
    connectionStatus: 'external_link',
    supportedActions: [
      'View upcoming course assignments',
      'Submit academic deliverables',
      'Access faculty lecture notes',
    ],
    requiredPermissions: ['External Web Navigation'],
    reasonWhyUseful:
      'Direct link to your university coursework so you never miss an official grading deadline.',
    iconName: 'GraduationCap',
    badge: 'External Link',
  },
  // AI Research & Mock Interviews
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'AI Assistants',
    description: 'OpenAI conversational assistant for code debugging and behavioral interview simulation.',
    url: 'https://chat.openai.com',
    connectionStatus: 'external_link',
    supportedActions: [
      'Simulate mock behavioral interview rounds',
      'Generate code debugging hypotheses',
      'Draft cover letters and outreach templates',
    ],
    requiredPermissions: ['External Web Navigation'],
    reasonWhyUseful:
      'Great auxiliary tool for mock behavioral interview question drills (STAR method).',
    iconName: 'Bot',
    badge: 'External Link',
  },
  {
    id: 'youtube-hub',
    name: 'YouTube Educational Hub',
    category: 'Video Learning',
    description: 'Curated video tutorials on DSA, system design, placement roadmaps, and college subjects.',
    url: 'https://www.youtube.com',
    connectionStatus: 'external_link',
    supportedActions: [
      'Search curated placement video playlists',
      'Watch visualized algorithm walkthroughs',
      'Follow project step-by-step code tutorials',
    ],
    requiredPermissions: ['External Web Navigation'],
    reasonWhyUseful:
      'Provides visual and auditory explanations when textbook documentation is difficult to grasp.',
    iconName: 'PlayCircle',
    badge: 'Integrated Search',
  },
  // Professional Networking
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'Career Networking',
    description: 'Professional student networking, alumni search, and internship applications.',
    url: 'https://www.linkedin.com',
    connectionStatus: 'external_link',
    supportedActions: [
      'Reach out to college alumni for referrals',
      'Search for active summer internships',
      'Share project milestones with recruiters',
    ],
    requiredPermissions: ['External Web Navigation'],
    reasonWhyUseful:
      'Direct channel to connect with tech recruiters, alumni, and discover unlisted internship openings.',
    iconName: 'Briefcase',
    badge: 'External Link',
  },
  // Creative & Visual AI Generation
  {
    id: 'synaps-image-gen',
    name: 'Central AI Image Generator',
    category: 'Creative & Media',
    description: 'Server-side neural image generation engine for genuine photorealistic visuals, logos, posters, and diagrams.',
    connectionStatus: 'internal',
    supportedActions: [
      'Generate photorealistic images and visual scenes',
      'Design brand logos and app icons',
      'Create college event and club posters',
      'Custom aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4)',
    ],
    requiredPermissions: ['Server Media Generation'],
    reasonWhyUseful:
      'Enables direct creation of visual assets, event posters, and portfolio graphics without external design tools.',
    iconName: 'Image',
    badge: 'Native Executable',
  },
];

export function getAllTools(): ToolDefinition[] {
  return TOOL_REGISTRY;
}

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((t) => t.id === id);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return TOOL_REGISTRY.filter((t) => t.category.toLowerCase().includes(category.toLowerCase()));
}

export function findToolsForGoal(goalText: string): ToolDefinition[] {
  const lower = goalText.toLowerCase();
  const selected: ToolDefinition[] = [];

  // Always include internal task manager
  const taskTool = getToolById('synaps-tasks');
  if (taskTool) selected.push(taskTool);

  if (lower.includes('image') || lower.includes('logo') || lower.includes('poster') || lower.includes('photo') || lower.includes('photorealistic')) {
    const imgTool = getToolById('synaps-image-gen');
    if (imgTool && !selected.some((s) => s.id === imgTool.id)) selected.push(imgTool);
  }

  if (lower.includes('interview') || lower.includes('software') || lower.includes('job') || lower.includes('placement')) {
    const ids = ['leetcode', 'geeksforgeeks', 'google-docs', 'github', 'linkedin', 'google-calendar', 'chatgpt'];
    ids.forEach((id) => {
      const tool = getToolById(id);
      if (tool && !selected.some((s) => s.id === tool.id)) selected.push(tool);
    });
  } else if (lower.includes('dsa') || lower.includes('coding') || lower.includes('algorithm') || lower.includes('code')) {
    const ids = ['leetcode', 'geeksforgeeks', 'youtube-hub', 'github'];
    ids.forEach((id) => {
      const tool = getToolById(id);
      if (tool && !selected.some((s) => s.id === tool.id)) selected.push(tool);
    });
  } else if (lower.includes('project') || lower.includes('college project') || lower.includes('app') || lower.includes('build')) {
    const ids = ['github', 'google-docs', 'google-classroom', 'google-calendar'];
    ids.forEach((id) => {
      const tool = getToolById(id);
      if (tool && !selected.some((s) => s.id === tool.id)) selected.push(tool);
    });
  } else if (lower.includes('study') || lower.includes('schedule') || lower.includes('exam') || lower.includes('timetable')) {
    const ids = ['google-calendar', 'google-classroom', 'geeksforgeeks', 'youtube-hub', 'synaps-progress'];
    ids.forEach((id) => {
      const tool = getToolById(id);
      if (tool && !selected.some((s) => s.id === tool.id)) selected.push(tool);
    });
  } else {
    // Default helpful subset
    const ids = ['leetcode', 'google-calendar', 'geeksforgeeks', 'google-docs'];
    ids.forEach((id) => {
      const tool = getToolById(id);
      if (tool && !selected.some((s) => s.id === tool.id)) selected.push(tool);
    });
  }

  return selected;
}

// ================= Central AI Executable Tools Registry =================
export interface ToolParameterProperty {
  type: string;
  description: string;
  enum?: string[];
  items?: { type: string };
}

export interface ExecutableToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameterProperty>;
    required: string[];
  };
  availabilityStatus: 'active' | 'available' | 'unconfigured' | 'external';
  connectionType: 'native' | 'integration' | 'external_link';
  permissionRequirements: string;
  badge: string;
}

export const EXECUTABLE_TOOLS: ExecutableToolDefinition[] = [
  {
    name: 'create_task',
    description: 'Create an internal Synapse X task with title, description, priority, category, dueDate, and subtasks.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Actionable title of the study or prep task' },
        description: { type: 'string', description: 'Comprehensive details, instructions, or topics to cover' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Urgency of the task' },
        category: {
          type: 'string',
          enum: ['Academics', 'Interview Preparation', 'Coding Practice', 'Projects', 'Personal Productivity'],
          description: 'Task classification',
        },
        dueDate: { type: 'string', description: 'ISO Date string YYYY-MM-DD for the target deadline' },
        dueTime: { type: 'string', description: 'Target time of day in HH:mm format (e.g. 18:00)' },
        subtasks: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of specific subtask milestones or problems to solve',
        },
        relatedToolId: { type: 'string', description: 'Associated tool ID (e.g. leetcode, geeksforgeeks)' },
      },
      required: ['title', 'dueDate', 'category'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Internal Task Storage (User Confirmed / Orchestrated)',
    badge: 'Native Executable',
  },
  {
    name: 'create_subtasks',
    description: 'Add detailed subtask action items to an existing task by its taskId.',
    parameters: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'ID of the task to add subtasks to' },
        subtasks: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of subtask action descriptions',
        },
      },
      required: ['taskId', 'subtasks'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Internal Task Storage',
    badge: 'Native Executable',
  },
  {
    name: 'list_tasks',
    description: 'Retrieve the student current active tasks, filtered optionally by category or status.',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Optional category filter' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'completed'], description: 'Optional status filter' },
      },
      required: [],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Internal Task Read',
    badge: 'Native Executable',
  },
  {
    name: 'update_task_status',
    description: 'Update the status of a task (todo, in_progress, completed).',
    parameters: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'ID of the task to update' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'completed'], description: 'New status' },
      },
      required: ['taskId', 'status'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Internal Task Storage',
    badge: 'Native Executable',
  },
  {
    name: 'schedule_calendar_event',
    description: 'Generate a verified 1-click Google Calendar study session URL and .ics export. Does not write secretly to Google without user authorization.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the study block or mock interview' },
        description: { type: 'string', description: 'Agenda and notes for the session' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        startTime: { type: 'string', description: 'Start time in HH:mm format' },
        durationMinutes: { type: 'string', description: 'Duration in minutes (e.g. 60, 90, 120)' },
      },
      required: ['title', 'date', 'startTime'],
    },
    availabilityStatus: 'available',
    connectionType: 'integration',
    permissionRequirements: 'Browser Web Navigation / Download Intent',
    badge: '1-Click Export',
  },
  {
    name: 'generate_learning_content',
    description: 'Generate targeted high-yield technical interview questions, conceptual breakdowns, or problem links.',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Topic name (e.g. Dynamic Programming, DBMS Indexing, OOP Principles)' },
        difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], description: 'Target skill level' },
        resourceType: { type: 'string', enum: ['interview_questions', 'cheat_sheet', 'problem_set'], description: 'Type of content' },
      },
      required: ['topic'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'AI Content Generation',
    badge: 'AI Provider',
  },
  {
    name: 'create_notification',
    description: 'Send a high-priority system/academic notification alert to the student dashboard.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short alert header' },
        message: { type: 'string', description: 'Notification body message' },
        category: { type: 'string', enum: ['academic', 'task', 'ai', 'system'], description: 'Category' },
      },
      required: ['title', 'message'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Dashboard Notification Center',
    badge: 'Native Executable',
  },
  {
    name: 'get_progress_summary',
    description: 'Calculate real-time completion rates, overdue counts, and category breakdowns across active student tasks.',
    parameters: {
      type: 'object',
      properties: {
        categoryFilter: { type: 'string', description: 'Optional category to focus analysis on' },
      },
      required: [],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Read Analytics',
    badge: 'Native Executable',
  },
  {
    name: 'search_available_apps',
    description: 'Query Synaps X directory of 40+ student apps by query string or category.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword to search (e.g. coding, docs, math, calendar)' },
        category: { type: 'string', description: 'Category to filter' },
      },
      required: ['query'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'App Directory Query',
    badge: 'Native Executable',
  },
  {
    name: 'generate_image',
    description: 'Generate genuine visual artwork, logos, posters, or photorealistic scenes via server-side AI Image Generation.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Visual prompt describing the image in detail' },
        aspectRatio: {
          type: 'string',
          enum: ['1:1', '16:9', '9:16', '4:3', '3:4'],
          description: 'Aspect ratio of the generated image (e.g. 1:1, 16:9, 9:16)',
        },
        style: {
          type: 'string',
          enum: ['photorealistic', 'digital-art', 'logo', 'poster', 'minimalist', 'concept-art'],
          description: 'Artistic style for image rendering',
        },
        outputFormat: {
          type: 'string',
          enum: ['jpeg', 'png', 'webp'],
          description: 'Output image file format',
        },
      },
      required: ['prompt'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Neural Media Generation Engine',
    badge: 'AI Media Generator',
  },
  {
    name: 'start_expense_tracking',
    description: 'Start an opt-in expenditure tracking period for the student with duration and optional budget. Requires explicit student confirmation before activation. Synapse X never collects bank credentials.',
    parameters: {
      type: 'object',
      properties: {
        durationDays: { type: 'number', description: 'Tracking duration in days (e.g. 7, 12, 30)' },
        budget: { type: 'number', description: 'Optional spending budget limit for this period' },
        currency: { type: 'string', description: 'Currency code (e.g. INR, USD)' },
        consentConfirmed: { type: 'boolean', description: 'True if the user has explicitly confirmed the tracking parameters' },
      },
      required: ['durationDays'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'User Consent & Opt-In Confirmation',
    badge: 'Privacy-First Opt-In',
  },
  {
    name: 'record_expense',
    description: 'Record an explicit student expense during an active tracking period. Rejects writes if tracking is OFF, paused, or ended.',
    parameters: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Amount spent (> 0)' },
        category: {
          type: 'string',
          enum: ['Food', 'Academics', 'Books', 'Travel', 'Tech', 'Hostel', 'Entertainment', 'Personal', 'General'],
          description: 'Expense category',
        },
        description: { type: 'string', description: 'Description of what was purchased (e.g. Lunch, Course Textbook)' },
        date: { type: 'string', description: 'Optional ISO date YYYY-MM-DD' },
      },
      required: ['amount', 'description'],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Active Tracking Session Validation',
    badge: 'User-Recorded Only',
  },
  {
    name: 'pause_expense_tracking',
    description: 'Temporarily pause active expenditure tracking to prevent new writes until resumed.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Internal State Update',
    badge: 'Privacy Control',
  },
  {
    name: 'resume_expense_tracking',
    description: 'Resume a paused expenditure tracking period.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Internal State Update',
    badge: 'Privacy Control',
  },
  {
    name: 'stop_expense_tracking',
    description: 'Stop expenditure tracking immediately. Preserves historical records but blocks future logging.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Internal State Update',
    badge: 'Privacy Control',
  },
  {
    name: 'list_expenses',
    description: 'Retrieve the student authorized expense history and transactions.',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Optional category filter' },
      },
      required: [],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Read Authorized Records',
    badge: 'Private User Data',
  },
  {
    name: 'get_expense_summary',
    description: 'Calculate real-time expenditure metrics, total spent, remaining budget, days left, and category breakdown.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    availabilityStatus: 'active',
    connectionType: 'native',
    permissionRequirements: 'Read Authorized Records',
    badge: 'Private Analytics',
  },
];
