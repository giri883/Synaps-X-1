import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock3,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Tag,
  ExternalLink,
  Sparkles,
  ArrowUpDown,
  X,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import {
  StudentTask,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  StudentUser,
  AppItem,
} from '../types';
import { calculateMetrics } from '../services/taskService';

interface TasksDashboardProps {
  tasks: StudentTask[];
  onToggleStatus: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onCreateTask: (taskData: Omit<StudentTask, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<StudentTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenApp?: (app: AppItem) => void;
  apps: AppItem[];
  darkMode: boolean;
  user: StudentUser | null;
  onNavigateToAI?: (prompt?: string) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Academics',
  'Interview Preparation',
  'Coding Practice',
  'Projects',
  'Personal Productivity',
];

export const TasksDashboard: React.FC<TasksDashboardProps> = ({
  tasks,
  onToggleStatus,
  onToggleSubtask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onOpenApp,
  apps,
  darkMode,
  user,
  onNavigateToAI,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'newest'>('deadline');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Form State for Create / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo');
  const [formCategory, setFormCategory] = useState<TaskCategory>('Academics');
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [formDueTime, setFormDueTime] = useState('18:00');
  const [formRelatedToolId, setFormRelatedToolId] = useState('');
  const [formSubtasks, setFormSubtasks] = useState<string[]>(['']);

  // Expanded subtasks accordion map
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  const metrics = useMemo(() => calculateMetrics(tasks), [tasks]);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenCreateModal = () => {
    setFormTitle('');
    setFormDescription('');
    setFormPriority('medium');
    setFormStatus('todo');
    setFormCategory('Academics');
    setFormDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setFormDueTime('18:00');
    setFormRelatedToolId('');
    setFormSubtasks(['']);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (task: StudentTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormCategory(task.category);
    setFormDueDate(task.dueDate || '');
    setFormDueTime(task.dueTime || '18:00');
    setFormRelatedToolId(task.relatedToolId || '');
    setFormSubtasks(task.subtasks.map((s) => s.title));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const matchedApp = apps.find((a) => a.id === formRelatedToolId);

    const validSubtasks = formSubtasks
      .map((st) => st.trim())
      .filter(Boolean)
      .map((title, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title,
        completed: false,
      }));

    if (editingTask) {
      // Update
      onUpdateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        status: formStatus,
        category: formCategory,
        dueDate: formDueDate,
        dueTime: formDueTime,
        relatedToolId: formRelatedToolId || undefined,
        relatedToolName: matchedApp ? matchedApp.name : undefined,
        subtasks: validSubtasks.length > 0 ? validSubtasks : editingTask.subtasks,
      });
      setEditingTask(null);
    } else {
      // Create
      onCreateTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        status: formStatus,
        category: formCategory,
        dueDate: formDueDate,
        dueTime: formDueTime,
        relatedToolId: formRelatedToolId || undefined,
        relatedToolName: matchedApp ? matchedApp.name : undefined,
        subtasks: validSubtasks,
      });
      setIsCreateModalOpen(false);
    }
  };

  const toggleAccordion = (taskId: string) => {
    setExpandedSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description.toLowerCase().includes(q);
          const matchesCat = task.category.toLowerCase().includes(q);
          const matchesSub = task.subtasks.some((s) => s.title.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesCat && !matchesSub) return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'todo' && task.status !== 'todo') return false;
          if (selectedStatus === 'in_progress' && task.status !== 'in_progress') return false;
          if (selectedStatus === 'completed' && task.status !== 'completed') return false;
          if (selectedStatus === 'overdue') {
            if (task.status === 'completed' || !task.dueDate || task.dueDate >= todayStr)
              return false;
          }
        }

        // Priority filter
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'priority') {
          const rank = { high: 3, medium: 2, low: 1 };
          return rank[b.priority] - rank[a.priority];
        }
        return b.createdAt - a.createdAt;
      });
  }, [tasks, searchQuery, selectedStatus, selectedPriority, selectedCategory, sortBy, todayStr]);

  const priorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            LOW
          </span>
        );
    }
  };

  const statusBadge = (status: TaskStatus, dueDate?: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
        </span>
      );
    }
    if (dueDate && dueDate < todayStr) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500">
          <AlertTriangle className="w-3.5 h-3.5" /> Overdue
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400">
          <Clock3 className="w-3.5 h-3.5" /> In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
        <Circle className="w-3.5 h-3.5" /> To Do
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden transition-all ${
          darkMode
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800'
            : 'bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/80 border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 mb-3">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Synaps X Smart Task Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
              Student Tasks & Milestones
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Organize assignments, coding practice, placement prep, and project deadlines with zero friction.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigateToAI && (
              <button
                type="button"
                onClick={() => onNavigateToAI('Help me organize and prioritize my pending tasks')}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  darkMode
                    ? 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300'
                    : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Auto-Plan</span>
              </button>
            )}

            <button
              id="create-task-btn"
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Local Prototype Storage Notice */}
        <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between text-[11px] text-slate-400">
          <span>🔒 Local Prototype Storage: Data securely saved in this student browser profile.</span>
          <span className="font-mono">{tasks.length} Total Registered Tasks</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-102 ${
            selectedStatus === 'all'
              ? 'border-indigo-500 bg-indigo-500/10'
              : darkMode
              ? 'glass-panel-dark border-slate-800'
              : 'glass-panel-light border-slate-200 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Tasks</span>
          <p className="text-2xl font-black mt-1 font-heading text-indigo-500">{metrics.totalTasks}</p>
        </div>

        <div
          onClick={() => setSelectedStatus('in_progress')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-102 ${
            selectedStatus === 'in_progress'
              ? 'border-cyan-500 bg-cyan-500/10'
              : darkMode
              ? 'glass-panel-dark border-slate-800'
              : 'glass-panel-light border-slate-200 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">In Progress</span>
          <p className="text-2xl font-black mt-1 font-heading text-cyan-400">{metrics.inProgressTasks}</p>
        </div>

        <div
          onClick={() => setSelectedStatus('completed')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-102 ${
            selectedStatus === 'completed'
              ? 'border-emerald-500 bg-emerald-500/10'
              : darkMode
              ? 'glass-panel-dark border-slate-800'
              : 'glass-panel-light border-slate-200 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Completed</span>
          <p className="text-2xl font-black mt-1 font-heading text-emerald-400">{metrics.completedTasks}</p>
        </div>

        <div
          onClick={() => setSelectedStatus('overdue')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-102 ${
            selectedStatus === 'overdue'
              ? 'border-rose-500 bg-rose-500/10'
              : darkMode
              ? 'glass-panel-dark border-slate-800'
              : 'glass-panel-light border-slate-200 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </span>
          <p className="text-2xl font-black mt-1 font-heading text-rose-500">{metrics.overdueTasks}</p>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Due Today</span>
          <p className="text-2xl font-black mt-1 font-heading text-amber-400">{metrics.todayCount}</p>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Completion Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-black font-heading text-indigo-400">
              {metrics.completionPercentage}%
            </p>
          </div>
          <div className="w-full bg-slate-700/30 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter, Search, and Category Controls */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, subtask, or description..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs outline-none border transition-all ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
            <option value="newest">Sort: Recently Added</option>
          </select>
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div
            className={`p-12 rounded-3xl border text-center space-y-3 ${
              darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
            }`}
          >
            <ListTodo className="w-10 h-10 mx-auto text-indigo-400 opacity-60" />
            <h3 className="text-base font-bold">No tasks found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No tasks match "${searchQuery}". Clear your search or filters to see all items.`
                : 'Your task list is empty. Create a new task or ask Synaps AI to generate a study plan!'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Create New Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate && task.dueDate < todayStr;
            const isExpanded = Boolean(expandedSubtasks[task.id]);
            const completedSubCount = task.subtasks.filter((s) => s.completed).length;

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? darkMode
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                      : 'bg-slate-50 border-slate-200/80 opacity-75'
                    : isOverdue
                    ? darkMode
                      ? 'bg-rose-950/20 border-rose-500/30 shadow-xs'
                      : 'bg-rose-50/70 border-rose-200 shadow-xs'
                    : darkMode
                    ? 'glass-panel-dark border-slate-800 hover:border-slate-700'
                    : 'glass-panel-light border-slate-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Checkbox & Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(task.id)}
                      className={`mt-0.5 p-1 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : darkMode
                          ? 'border-slate-700 hover:border-indigo-400 text-transparent'
                          : 'border-slate-300 hover:border-indigo-500 text-transparent'
                      }`}
                      aria-label="Toggle task completion"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'block' : 'opacity-0 hover:opacity-40'}`} />
                    </button>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-bold leading-tight ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        {priorityBadge(task.priority)}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.category}
                        </span>
                        {statusBadge(task.status, task.dueDate)}
                      </div>

                      {task.description && (
                        <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {task.description}
                        </p>
                      )}

                      {/* Meta pills: Deadline, Time, Related Tool */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {task.dueDate === todayStr
                                ? 'Due Today'
                                : new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                              {task.dueTime ? ` at ${task.dueTime}` : ''}
                            </span>
                          </div>
                        )}

                        {task.relatedToolName && (
                          <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                            <Tag className="w-3 h-3" />
                            <span>Tool: {task.relatedToolName}</span>
                          </div>
                        )}

                        {task.subtasks.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleAccordion(task.id)}
                            className="flex items-center gap-1 hover:text-indigo-400 transition-colors font-medium cursor-pointer"
                          >
                            <span>
                              Subtasks ({completedSubCount}/{task.subtasks.length})
                            </span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Subtasks Accordion */}
                      {isExpanded && task.subtasks.length > 0 && (
                        <div
                          className={`mt-3 p-3 rounded-xl border space-y-2 ${
                            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          {task.subtasks.map((st) => (
                            <div
                              key={st.id}
                              onClick={() => onToggleSubtask(task.id, st.id)}
                              className="flex items-center gap-2.5 text-xs cursor-pointer select-none"
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                  st.completed
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : darkMode
                                    ? 'border-slate-700'
                                    : 'border-slate-300'
                                }`}
                              >
                                {st.completed && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span className={`${st.completed ? 'line-through text-slate-400' : ''}`}>
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Launch Tool, Edit, Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {task.relatedToolId && onOpenApp && (
                      <button
                        type="button"
                        onClick={() => {
                          const app = apps.find((a) => a.id === task.relatedToolId);
                          if (app) onOpenApp(app);
                        }}
                        className={`p-1.5 rounded-lg border text-indigo-400 hover:text-indigo-300 transition-all ${
                          darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                        }`}
                        title={`Open ${task.relatedToolName || 'Tool'}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(task)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        darkMode
                          ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingTaskId(task.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/15 transition-all"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Task Modal */}
      {(isCreateModalOpen || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`relative w-full max-w-lg rounded-3xl p-6 border shadow-2xl max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/40">
              <h3 className="text-lg font-bold font-heading">
                {editingTask ? 'Edit Task' : 'Create New Student Task'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingTask(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Task Title *</label>
                <input
                  id="modal-task-title-input"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Solve 5 Graph BFS Problems on LeetCode"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Specific concepts, problem names, notes, or grading requirements..."
                  className={`w-full px-3.5 py-2 rounded-xl text-xs outline-none border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl text-xs outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl text-xs outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Due Time</label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Link to Hub Tool (Optional)</label>
                <select
                  value={formRelatedToolId}
                  onChange={(e) => setFormRelatedToolId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs outline-none border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">No Tool Linked</option>
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtasks builder */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold">Subtasks</label>
                  <button
                    type="button"
                    onClick={() => setFormSubtasks([...formSubtasks, ''])}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Subtask
                  </button>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {formSubtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={st}
                        onChange={(e) => {
                          const updated = [...formSubtasks];
                          updated[idx] = e.target.value;
                          setFormSubtasks(updated);
                        }}
                        placeholder={`Subtask #${idx + 1}`}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs outline-none border ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                      {formSubtasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormSubtasks(formSubtasks.filter((_, i) => i !== idx))}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`relative w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold font-heading">Delete Task?</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(deletingTaskId);
                  setDeletingTaskId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
