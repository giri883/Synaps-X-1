import { StudentTask, TaskMetrics, TaskPriority, TaskStatus, TaskCategory, SubTask } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ensureUserUuid, getUserStorageKey } from '../utils/userUtils';
import { appStorage } from '../utils/storage';

const STORAGE_PREFIX = 'synapsx_tasks';

const DEFAULT_SEEDS: Omit<StudentTask, 'id' | 'createdAt'>[] = [
  {
    title: 'Solve 5 Dynamic Programming Problems on LeetCode',
    description: 'Master 1D and 2D DP patterns: Coin Change, Longest Increasing Subsequence, and 0/1 Knapsack.',
    priority: 'high',
    status: 'in_progress',
    category: 'Coding Practice',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    dueTime: '18:00',
    relatedToolId: 'leetcode',
    relatedToolName: 'LeetCode',
    subtasks: [
      { id: 'sub-1', title: 'Climbing Stairs (Easy warm-up)', completed: true },
      { id: 'sub-2', title: 'House Robber (1D DP State)', completed: true },
      { id: 'sub-3', title: 'Coin Change (Unbounded Knapsack)', completed: false },
      { id: 'sub-4', title: 'Longest Increasing Subsequence', completed: false },
      { id: 'sub-5', title: '0/1 Knapsack Partition Problem', completed: false },
    ],
  },
  {
    title: 'Revise Core OOP Concepts & Design Principles',
    description: 'Review Polymorphism, Encapsulation, Abstract Classes vs Interfaces, and SOLID principles for technical rounds.',
    priority: 'high',
    status: 'todo',
    category: 'Interview Preparation',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dueTime: '15:30',
    relatedToolId: 'geeksforgeeks',
    relatedToolName: 'GeeksforGeeks',
    subtasks: [
      { id: 'sub-21', title: 'Inheritance and runtime polymorphism (virtual functions)', completed: false },
      { id: 'sub-22', title: 'Interface vs Abstract class memory allocation', completed: false },
      { id: 'sub-23', title: 'SOLID principles with quick code examples', completed: false },
    ],
  },
  {
    title: 'Refactor Software Engineer Resume on Google Docs',
    description: 'Update bullet points with XYZ format: Accomplished [X] as measured by [Y], by doing [Z]. Verify ATS compatibility.',
    priority: 'medium',
    status: 'todo',
    category: 'Interview Preparation',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    dueTime: '20:00',
    relatedToolId: 'google-docs',
    relatedToolName: 'Google Docs',
    subtasks: [
      { id: 'sub-31', title: 'Quantify metrics in capstone project experience', completed: false },
      { id: 'sub-32', title: 'Verify GitHub and LinkedIn hyperlinked correctly', completed: false },
      { id: 'sub-33', title: 'Export clean PDF and test in ATS parser', completed: false },
    ],
  },
  {
    title: 'DBMS Indexing & B+ Trees Study Session',
    description: 'Prepare transaction isolation levels (ACID), indexing mechanisms, and SQL query optimization.',
    priority: 'medium',
    status: 'completed',
    category: 'Academics',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    dueTime: '17:00',
    relatedToolId: 'geeksforgeeks',
    relatedToolName: 'GeeksforGeeks',
    completedAt: Date.now() - 86400000,
    subtasks: [
      { id: 'sub-41', title: 'B-Tree vs B+ Tree search complexity', completed: true },
      { id: 'sub-42', title: 'Write 5 complex JOIN & GROUP BY queries', completed: true },
    ],
  },
  {
    title: 'Submit Semester Project Milestone 2 on Classroom',
    description: 'Push sprint code to GitHub repository and submit architecture diagram PDF to Google Classroom.',
    priority: 'high',
    status: 'todo',
    category: 'Projects',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    dueTime: '23:59',
    relatedToolId: 'google-classroom',
    relatedToolName: 'Google Classroom',
    subtasks: [
      { id: 'sub-51', title: 'Merge feature branches on GitHub', completed: false },
      { id: 'sub-52', title: 'Generate PDF report and attach to Classroom', completed: false },
    ],
  },
];

function getStorageKey(userEmailOrId?: string): string {
  return getUserStorageKey(STORAGE_PREFIX, userEmailOrId);
}

// Broadcaster to inform UI components of changes
function notifyTaskUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('synapsx_tasks_changed'));
  }
}

export function getTasks(userEmailOrId?: string): StudentTask[] {
  const key = getStorageKey(userEmailOrId);
  const raw = appStorage.getItem(key);

  if (!raw) {
    const isDemoAccount =
      !userEmailOrId ||
      userEmailOrId === 'girisaran370@gmail.com' ||
      userEmailOrId === 'guest_student';

    if (isDemoAccount) {
      const seeded: StudentTask[] = DEFAULT_SEEDS.map((item, idx) => ({
        ...item,
        id: `task-seed-${idx + 1}`,
        createdAt: Date.now() - (5 - idx) * 3600000 * 12,
      }));
      try {
        appStorage.setItem(key, JSON.stringify(seeded));
      } catch (e) {
        console.warn('Storage limit reached:', e);
      }
      return seeded;
    }
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse tasks:', err);
    return [];
  }
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ensureUuid(id?: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  return generateUuid();
}

// Asynchronous Cloud Synchronization Helpers (Aligned with Supabase Schema)
export async function syncTaskToCloud(task: StudentTask, userEmailOrId?: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data: authData } = await supabase.auth.getUser();
    const effectiveUserId = authData?.user?.id || (userEmailOrId ? ensureUserUuid(null, userEmailOrId) : null);
    if (!effectiveUserId) {
      return;
    }

    const uuid = ensureUuid(task.id);
    const dbStatus = task.status === 'todo' ? 'pending' : task.status;
    let dueAt: string | null = null;
    if (task.dueDate) {
      dueAt = task.dueTime
        ? new Date(`${task.dueDate}T${task.dueTime}:00`).toISOString()
        : new Date(`${task.dueDate}T23:59:59`).toISOString();
    }

    const { error: taskError } = await supabase.from('tasks').upsert({
      id: uuid,
      user_id: effectiveUserId,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      status: dbStatus,
      due_at: dueAt,
      created_at: new Date(task.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (taskError) {
      console.warn('[Supabase] Task sync notice:', taskError.message);
      return;
    }

    // Upsert associated subtasks if present
    if (task.subtasks && task.subtasks.length > 0) {
      const subtaskRows = task.subtasks.map((st, idx) => ({
        id: ensureUuid(st.id),
        task_id: uuid,
        title: st.title,
        is_completed: Boolean(st.completed),
        position: idx,
      }));
      await supabase.from('subtasks').upsert(subtaskRows);
    }
  } catch (err) {
    console.warn('[Supabase] Task sync exception:', err);
  }
}

export async function deleteTaskFromCloud(taskId: string, userEmailOrId?: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data: authData } = await supabase.auth.getUser();
    const effectiveUserId = authData?.user?.id || (userEmailOrId ? ensureUserUuid(null, userEmailOrId) : null);
    if (!effectiveUserId) return;
    const uuid = ensureUuid(taskId);
    await supabase.from('tasks').delete().eq('id', uuid).eq('user_id', effectiveUserId);
  } catch (err) {
    console.warn('[Supabase] Task delete exception:', err);
  }
}

export async function fetchTasksFromCloud(userEmailOrId?: string): Promise<StudentTask[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: authData } = await supabase.auth.getUser();
    const effectiveUserId = authData?.user?.id || (userEmailOrId ? ensureUserUuid(null, userEmailOrId) : null);
    if (!effectiveUserId) return null;

    const { data, error } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Could not fetch tasks from cloud:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    const mapped: StudentTask[] = data.map((d: any) => {
      const uiStatus: TaskStatus = d.status === 'pending' ? 'todo' : (d.status as TaskStatus);
      const subtasks: SubTask[] = Array.isArray(d.subtasks)
        ? d.subtasks
            .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
            .map((st: any) => ({
              id: st.id,
              title: st.title,
              completed: Boolean(st.is_completed),
            }))
        : [];

      let dueDate = new Date().toISOString().split('T')[0];
      let dueTime: string | undefined = undefined;
      if (d.due_at) {
        try {
          const dt = new Date(d.due_at);
          dueDate = dt.toISOString().split('T')[0];
          dueTime = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
        } catch {
          // ignore
        }
      }

      return {
        id: d.id,
        title: d.title,
        description: d.description || '',
        priority: (d.priority as TaskPriority) || 'medium',
        status: uiStatus,
        category: 'Personal Productivity',
        dueDate,
        dueTime,
        subtasks,
        createdAt: new Date(d.created_at).getTime() || Date.now(),
        completedAt: d.status === 'completed' ? new Date(d.updated_at).getTime() : undefined,
      };
    });

    // Update local cache
    const key = getStorageKey(userEmailOrId);
    appStorage.setItem(key, JSON.stringify(mapped));
    notifyTaskUpdate();
    return mapped;
  } catch (err) {
    console.warn('[Supabase] fetchTasksFromCloud error:', err);
    return null;
  }
}

export function saveTasks(tasks: StudentTask[], userEmailOrId?: string): void {
  const key = getStorageKey(userEmailOrId);
  try {
    appStorage.setItem(key, JSON.stringify(tasks));
    notifyTaskUpdate();
  } catch (err) {
    console.error('Failed to save tasks to storage:', err);
  }
}

export function createTask(
  taskData: Omit<StudentTask, 'id' | 'createdAt'>,
  userEmail?: string
): StudentTask {
  const current = getTasks(userEmail);
  const newTask: StudentTask = {
    ...taskData,
    id: ensureUuid(),
    createdAt: Date.now(),
    subtasks: (taskData.subtasks || []).map((st) => ({
      ...st,
      id: ensureUuid(st.id),
    })),
  };

  const updated = [newTask, ...current];
  saveTasks(updated, userEmail);
  // Asynchronously sync to Supabase cloud
  syncTaskToCloud(newTask, userEmail);
  return newTask;
}

export function batchCreateTasks(
  tasksData: Omit<StudentTask, 'id' | 'createdAt'>[],
  userEmail?: string
): StudentTask[] {
  const current = getTasks(userEmail);
  const created: StudentTask[] = [];

  tasksData.forEach((taskData, idx) => {
    // Basic deduplication by title
    const exists = current.some((c) => c.title.toLowerCase().trim() === taskData.title.toLowerCase().trim());
    if (!exists) {
      const newTask: StudentTask = {
        ...taskData,
        id: ensureUuid(),
        createdAt: Date.now() + idx * 10,
        subtasks: (taskData.subtasks || []).map((st) => ({
          ...st,
          id: ensureUuid(st.id),
        })),
      };
      created.push(newTask);
      // Asynchronously sync to Supabase cloud
      syncTaskToCloud(newTask, userEmail);
    }
  });

  if (created.length > 0) {
    saveTasks([...created, ...current], userEmail);
  }

  return created;
}

export function updateTask(
  taskId: string,
  updates: Partial<StudentTask>,
  userEmail?: string
): StudentTask | null {
  const current = getTasks(userEmail);
  let updatedTask: StudentTask | null = null;

  const next = current.map((t) => {
    if (t.id === taskId) {
      updatedTask = {
        ...t,
        ...updates,
        completedAt:
          updates.status === 'completed' && t.status !== 'completed'
            ? Date.now()
            : updates.status && updates.status !== 'completed'
            ? undefined
            : t.completedAt,
      };
      return updatedTask;
    }
    return t;
  });

  if (updatedTask) {
    saveTasks(next, userEmail);
    // Asynchronously sync to Supabase cloud
    syncTaskToCloud(updatedTask, userEmail);
  }
  return updatedTask;
}

export function deleteTask(taskId: string, userEmail?: string): boolean {
  const current = getTasks(userEmail);
  const filtered = current.filter((t) => t.id !== taskId);
  if (filtered.length !== current.length) {
    saveTasks(filtered, userEmail);
    // Asynchronously delete from Supabase cloud
    deleteTaskFromCloud(taskId, userEmail);
    return true;
  }
  return false;
}


export function toggleTaskStatus(taskId: string, userEmail?: string): StudentTask | null {
  const current = getTasks(userEmail);
  const found = current.find((t) => t.id === taskId);
  if (!found) return null;

  const nextStatus: TaskStatus = found.status === 'completed' ? 'todo' : 'completed';
  return updateTask(taskId, { status: nextStatus }, userEmail);
}

export function toggleSubtask(
  taskId: string,
  subtaskId: string,
  userEmail?: string
): StudentTask | null {
  const current = getTasks(userEmail);
  const found = current.find((t) => t.id === taskId);
  if (!found) return null;

  const nextSubtasks: SubTask[] = found.subtasks.map((st) =>
    st.id === subtaskId ? { ...st, completed: !st.completed } : st
  );

  // If all subtasks are completed, mark task as completed; if unchecking, set in_progress if todo
  const allCompleted = nextSubtasks.length > 0 && nextSubtasks.every((st) => st.completed);
  const anyCompleted = nextSubtasks.some((st) => st.completed);

  let newStatus = found.status;
  if (allCompleted) {
    newStatus = 'completed';
  } else if (anyCompleted && found.status === 'todo') {
    newStatus = 'in_progress';
  } else if (!anyCompleted && found.status === 'completed') {
    newStatus = 'in_progress';
  }

  return updateTask(
    taskId,
    {
      subtasks: nextSubtasks,
      status: newStatus,
    },
    userEmail
  );
}

export function calculateMetrics(tasks: StudentTask[]): TaskMetrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    return t.dueDate < todayStr;
  }).length;

  const todayCount = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed').length;
  const upcomingCount = tasks.filter((t) => t.dueDate > todayStr && t.status !== 'completed').length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    completionPercentage,
    todayCount,
    upcomingCount,
  };
}
