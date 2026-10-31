import { StudentTask, TaskMetrics } from '../types';
import { calculateMetrics } from './taskService';

export interface ProgressSummary {
  metrics: TaskMetrics;
  categoryBreakdown: { category: string; total: number; completed: number; percentage: number }[];
  overdueList: StudentTask[];
  todayList: StudentTask[];
  upcomingList: StudentTask[];
  aiBriefing: string;
}

export function getProgressSummary(tasks: StudentTask[]): ProgressSummary {
  const metrics = calculateMetrics(tasks);
  const todayStr = new Date().toISOString().split('T')[0];

  const categories = [
    'Academics',
    'Interview Preparation',
    'Coding Practice',
    'Projects',
    'Personal Productivity',
  ] as const;

  const categoryBreakdown = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completed = catTasks.filter((t) => t.status === 'completed').length;
    const percentage = catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0;
    return {
      category: cat,
      total: catTasks.length,
      completed,
      percentage,
    };
  });

  const overdueList = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
  );

  const todayList = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate === todayStr
  );

  const upcomingList = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate > todayStr
  );

  let briefing = `You currently have ${metrics.totalTasks} active tasks logged in Synaps X (${metrics.completionPercentage}% completed). `;

  if (overdueList.length > 0) {
    briefing += `⚠️ Attention: You have ${overdueList.length} overdue item(s): "${overdueList[0].title}". `;
  } else {
    briefing += `✅ Excellent work! No overdue tasks at the moment. `;
  }

  if (todayList.length > 0) {
    briefing += `📅 Today's schedule features ${todayList.length} priority task(s).`;
  }

  return {
    metrics,
    categoryBreakdown,
    overdueList,
    todayList,
    upcomingList,
    aiBriefing: briefing,
  };
}

export function getAnswerForProgressQuery(query: string, tasks: StudentTask[]): string {
  const summary = getProgressSummary(tasks);
  const q = query.toLowerCase();

  if (q.includes('interview') || q.includes('interview preparation')) {
    const interviewData = summary.categoryBreakdown.find((c) => c.category === 'Interview Preparation');
    if (!interviewData || interviewData.total === 0) {
      return `You currently don't have any Interview Preparation tasks tracked. Ask Synaps AI to generate a personalized Interview Preparation plan (e.g., "Help me prepare for a software engineering interview") to get started!`;
    }
    return `### 🎯 Interview Preparation Progress Report
- **Total Preparation Tasks:** ${interviewData.total}
- **Completed Tasks:** ${interviewData.completed} (${interviewData.percentage}% complete)
- **Remaining Tasks:** ${interviewData.total - interviewData.completed}

**Current Focus:**
${tasks
  .filter((t) => t.category === 'Interview Preparation' && t.status !== 'completed')
  .slice(0, 3)
  .map((t) => `- **${t.title}** (Due: ${t.dueDate || 'Unscheduled'})`)
  .join('\n') || 'All current interview tasks are completed!'}`;
  }

  if (q.includes('today') || q.includes('what should i study')) {
    if (summary.todayList.length === 0) {
      const topPriority = tasks.filter((t) => t.status !== 'completed').slice(0, 3);
      return `### 📅 Today's Recommended Study Plan
You don't have any tasks strictly scheduled for today's date, but here are your highest-priority pending items:
${topPriority.map((t) => `- **[${t.priority.toUpperCase()}] ${t.title}** (${t.category})`).join('\n') || 'All tasks are completed!'}`;
    }
    return `### 📅 Today's Focused Agenda (${summary.todayList.length} Tasks)
${summary.todayList.map((t) => `- **[${t.priority.toUpperCase()}] ${t.title}** - Due at ${t.dueTime || 'end of day'}`).join('\n')}`;
  }

  if (q.includes('overdue')) {
    if (summary.overdueList.length === 0) {
      return `🎉 **Great news!** You have zero overdue tasks in your Synaps X task manager. You are completely up to date!`;
    }
    return `### ⚠️ Overdue Deadlines Alert (${summary.overdueList.length} Tasks)
The following tasks have passed their deadline:
${summary.overdueList.map((t) => `- **${t.title}** (Was due: ${t.dueDate}) - Priority: ${t.priority.toUpperCase()}`).join('\n')}

*Tip: You can ask Synaps AI "Update my plan because I missed my tasks" to automatically reschedule them to realistic upcoming dates.*`;
  }

  return `### 📊 Synaps X Student Productivity Status
- **Overall Completion:** ${summary.metrics.completionPercentage}% (${summary.metrics.completedTasks}/${summary.metrics.totalTasks} tasks)
- **In-Progress:** ${summary.metrics.inProgressTasks}
- **Due Today:** ${summary.metrics.todayCount}
- **Overdue:** ${summary.metrics.overdueTasks}
${summary.aiBriefing}`;
}
