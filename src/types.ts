export type AppCategory =
  | 'study'
  | 'communication'
  | 'social'
  | 'payments'
  | 'entertainment'
  | 'productivity'
  | 'ai';

export interface AppItem {
  id: string;
  name: string;
  category: AppCategory;
  description: string;
  url: string;
  iconName: string;
  badge?: string;
  color: {
    bg: string;
    text: string;
    border: string;
    glow: string;
  };
  tags: string[];
  features?: string[];
  popular?: boolean;
}

export interface StudentUser {
  id?: string; // Authenticated Supabase User UUID
  fullName: string;
  email: string;
  college: string;
  course: string;
  yearOfStudy: string;
  avatar: string;
  bio?: string;
  joinDate: string;
}

export interface RecentlyUsedItem {
  appId: string;
  timestamp: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: 'system' | 'academic' | 'security' | 'task' | 'ai';
}

// ================= Task Management Types =================
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskCategory =
  | 'Academics'
  | 'Interview Preparation'
  | 'Coding Practice'
  | 'Projects'
  | 'Personal Productivity';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface StudentTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  subtasks: SubTask[];
  reminder?: string;
  relatedToolId?: string;
  relatedToolName?: string;
  createdAt: number;
  completedAt?: number;
}

export interface TaskMetrics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  todayCount: number;
  upcomingCount: number;
}

// ================= Tool Registry & Orchestration Types =================
export type ToolConnectionStatus =
  | 'internal' // Native inside Synaps X
  | 'external_link' // Curated launcher with zero-auth risk
  | 'integration_available' // Calendar / Exports available
  | 'authorized'; // Authorized user connection

export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  url?: string;
  connectionStatus: ToolConnectionStatus;
  supportedActions: string[];
  requiredPermissions: string[];
  reasonWhyUseful: string;
  iconName: string;
  badge?: string;
}

export interface ToolExecutionActivity {
  id: string;
  stepNumber: number;
  toolName: string;
  actionLabel: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  errorMessage?: string;
  timestamp: number;
}

export interface WorkflowPlanStep {
  stepNumber: number;
  title: string;
  toolRequired: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
}

export interface WorkflowPlan {
  goal: string;
  summary: string;
  duration: string;
  steps: WorkflowPlanStep[];
  toolsUsed: string[];
}

export interface ConnectedToolItem {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'available' | 'unconfigured' | 'external';
  type: 'native' | 'integration' | 'external_link';
  description: string;
  permissions: string;
  badge?: string;
}

export interface ActionProposal {
  id: string;
  toolId: string;
  toolName: string;
  actionType: 'create_task' | 'update_task' | 'delete_task' | 'schedule_calendar' | 'open_external';
  title: string;
  description: string;
  priority?: TaskPriority;
  deadline?: string;
  time?: string;
  category?: TaskCategory;
  subtasks?: string[];
  isInternal: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
}

export interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio?: string;
  style?: string;
  provider: string;
  model: string;
  createdAt: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
  status?: 'completed' | 'failed' | 'generating';
  errorMessage?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  workflowPlan?: WorkflowPlan;
  executionActivities?: ToolExecutionActivity[];
  createdTasks?: StudentTask[];
  actionProposals?: ActionProposal[];
  generatedImages?: GeneratedImageItem[];
  planSummary?: {
    goal: string;
    totalSteps: number;
    duration: string;
    toolsRecommended: string[];
    targetRole?: string;
  };
  calendarData?: {
    eventTitle?: string;
    title?: string;
    date?: string;
    time?: string;
    startTime?: string;
    description?: string;
    googleCalendarUrl?: string;
    calendarUrl?: string;
  };
  fallbackUsed?: boolean;
  error?: string;
  expenseProposal?: ExpenseTrackingProposal;
  expenseSummary?: ExpenseSummary;
}

export interface AIChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: AIChatMessage[];
}

// ================= Privacy-First Expenditure Tracking Types =================
export type ExpenseTrackingStatus = 'active' | 'paused' | 'stopped' | 'completed';

export interface ExpenseTrackingPeriod {
  id: string;
  userId: string;
  status: ExpenseTrackingStatus;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  durationDays: number;
  budget?: number;
  currency: string;
  consentGiven: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ExpenseTransaction {
  id: string;
  periodId: string;
  userId: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string; // ISO date YYYY-MM-DD
  createdAt: number;
}

export interface ExpenseSummary {
  period: ExpenseTrackingPeriod | null;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  transactionsCount: number;
  daysRemaining: number;
  isOverBudget: boolean;
  recentTransactions: ExpenseTransaction[];
  categoryBreakdown: Record<string, number>;
  trackingStatus: ExpenseTrackingStatus | 'disabled';
}

export interface ExpenseTrackingProposal {
  durationDays: number;
  budget?: number;
  currency: string;
  startDate: string;
  endDate: string;
  disclaimer: string;
}

