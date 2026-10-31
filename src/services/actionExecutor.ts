import { ActionProposal, StudentTask, TaskCategory, TaskPriority } from '../types';
import { createTask, batchCreateTasks } from './taskService';

export interface ExecutionResult {
  success: boolean;
  message: string;
  createdTask?: StudentTask;
  calendarUrl?: string;
  externalUrl?: string;
}

export function executeActionProposal(
  proposal: ActionProposal,
  userEmail?: string
): ExecutionResult {
  try {
    if (proposal.actionType === 'create_task') {
      const validCategory: TaskCategory =
        proposal.category &&
        ['Academics', 'Interview Preparation', 'Coding Practice', 'Projects', 'Personal Productivity'].includes(
          proposal.category
        )
          ? proposal.category
          : 'Interview Preparation';

      const validPriority: TaskPriority =
        proposal.priority && ['low', 'medium', 'high'].includes(proposal.priority)
          ? proposal.priority
          : 'medium';

      const defaultDeadline =
        proposal.deadline || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

      const subtasks = (proposal.subtasks || []).map((title, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title,
        completed: false,
      }));

      const created = createTask(
        {
          title: proposal.title.trim(),
          description: proposal.description.trim(),
          priority: validPriority,
          status: 'todo',
          category: validCategory,
          dueDate: defaultDeadline,
          dueTime: proposal.time || '18:00',
          relatedToolId: proposal.toolId,
          relatedToolName: proposal.toolName,
          subtasks,
        },
        userEmail
      );

      return {
        success: true,
        message: `Created internal task: "${created.title}"`,
        createdTask: created,
      };
    }

    if (proposal.actionType === 'schedule_calendar') {
      // Build Google Calendar Web Intent URL safely
      // https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&details=...&dates=...
      const dateFormatted = (proposal.deadline || new Date().toISOString().split('T')[0]).replace(/-/g, '');
      const timeFormatted = (proposal.time || '10:00').replace(':', '') + '00';
      const startDateTime = `${dateFormatted}T${timeFormatted}`;
      // 1 hour later
      const endDateTime = `${dateFormatted}T${(parseInt(timeFormatted.slice(0, 2), 10) + 1).toString().padStart(2, '0')}${timeFormatted.slice(2)}`;

      const titleEncoded = encodeURIComponent(proposal.title || 'Synaps X Study Session');
      const detailsEncoded = encodeURIComponent(
        `${proposal.description}\n\nOrganized via Synaps X Student Hub.\nTool: ${proposal.toolName || 'Study Planner'}`
      );

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleEncoded}&dates=${startDateTime}/${endDateTime}&details=${detailsEncoded}`;

      return {
        success: true,
        message: 'Generated 1-click Google Calendar entry. Click to add to your personal calendar.',
        calendarUrl,
      };
    }

    if (proposal.actionType === 'open_external') {
      return {
        success: true,
        message: `Navigating to ${proposal.toolName}`,
      };
    }

    return {
      success: false,
      message: `Unsupported action type: ${proposal.actionType}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to execute action: ${err?.message || 'Unknown error'}`,
    };
  }
}

export function executeBatchProposals(
  proposals: ActionProposal[],
  userEmail?: string
): { successCount: number; failedCount: number; results: ExecutionResult[] } {
  let successCount = 0;
  let failedCount = 0;
  const results: ExecutionResult[] = [];

  for (const p of proposals) {
    const res = executeActionProposal(p, userEmail);
    results.push(res);
    if (res.success) {
      successCount++;
    } else {
      failedCount++;
    }
  }

  return { successCount, failedCount, results };
}
