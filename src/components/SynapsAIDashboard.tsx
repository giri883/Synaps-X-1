import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  CheckSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  MessageSquare,
  Plus,
  RefreshCw,
  Check,
  X,
  FileText,
  Sliders,
  TrendingUp,
  Cpu,
  Trash2,
  Activity,
  ListOrdered,
  Workflow,
  ArrowRight,
  Terminal,
  Image as ImageIcon,
  Download,
  Maximize2,
} from 'lucide-react';
import {
  AIChatMessage,
  AIChatSession,
  ActionProposal,
  StudentTask,
  StudentUser,
  AppItem,
  ToolDefinition,
  WorkflowPlan,
  ToolExecutionActivity,
  ConnectedToolItem,
  GeneratedImageItem,
} from '../types';
import { getAllTools, EXECUTABLE_TOOLS } from '../services/toolRegistry';
import { sendChatMessage } from '../services/aiService';
import { executeActionProposal } from '../services/actionExecutor';
import { getProgressSummary } from '../services/progressTracker';
import { toggleTaskStatus, toggleSubtask, getTasks } from '../services/taskService';

interface SynapsAIDashboardProps {
  user: StudentUser | null;
  tasks: StudentTask[];
  onOpenApp?: (app: AppItem) => void;
  apps: AppItem[];
  darkMode: boolean;
  onTaskCreatedNotification?: (title: string) => void;
  onNavigateToTasks?: () => void;
  initialPrompt?: string;
}

const EXAMPLE_PROMPTS = [
  'Explain thermodynamics to me.',
  'What is the difference between heat and temperature?',
  'Explain the first law of thermodynamics with an example.',
  'Create a task to study thermodynamics tomorrow.',
  'Explain thermodynamics and create three revision tasks.',
  'Generate a photorealistic image of a futuristic university campus.',
  'Track my expenditure for the next 12 days with a ₹3,000 budget.',
  'Help me prepare for a software engineering interview in seven days.',
];

import { getUserStorageKey } from '../utils/userUtils';
import { appStorage } from '../utils/storage';

function getDefaultWelcomeSession(user?: StudentUser | null): AIChatSession[] {
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Student';
  return [
    {
      id: 'session-default',
      title: 'Learning & Productivity Copilot',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: `### 🎓 Welcome to Central AI — Your Intelligent Student Tutor & Copilot

Hello **${firstName}**! I am your **interactive learning tutor and workflow execution engine**. I can:
1. **Explain any academic concept step-by-step** (Physics, CS, Mathematics, Engineering) with intuitive definitions, analogies, formulas, and practice questions — completely distraction-free.
2. **Create structured task roadmaps** when you explicitly request them (e.g. 7-day interview prep, study tasks).
3. **Generate authentic AI images, logos, and posters** using neural rendering engines.
4. **Manage user-controlled expenditure tracking** with 100% privacy and opt-in consent.

**Try asking:**
> *"Explain thermodynamics to me."*
> *"What is the difference between heat and temperature?"*
> *"Explain the first law of thermodynamics with an example."*
> *"Create a task to study thermodynamics tomorrow."*`,
          timestamp: Date.now(),
        },
      ],
    },
  ];
}

function loadUserSessions(user?: StudentUser | null): AIChatSession[] {
  const key = getUserStorageKey('synapsx_ai_sessions', user);
  const raw = appStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse AI sessions:', e);
    }
  }
  return getDefaultWelcomeSession(user);
}

export const SynapsAIDashboard: React.FC<SynapsAIDashboardProps> = ({
  user,
  tasks,
  onOpenApp,
  apps,
  darkMode,
  onTaskCreatedNotification,
  onNavigateToTasks,
  initialPrompt,
}) => {
  const tools = getAllTools();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Collapsible Workflow Inspector state
  const [showInspector, setShowInspector] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'plan' | 'activity' | 'tasks' | 'tools'>('plan');

  // User-isolated chat sessions state
  const [sessions, setSessions] = useState<AIChatSession[]>(() => loadUserSessions(user));

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions.length > 0 ? sessions[0].id : 'session-default';
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentExecutionStep, setCurrentExecutionStep] = useState<string>('');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<GeneratedImageItem | null>(null);

  // Check health endpoint for active engine status
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasGeminiKey(Boolean(data.hasGeminiKey));
      })
      .catch(() => {
        setHasGeminiKey(false);
      });
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const progressSummary = getProgressSummary(tasks);

  // Extract latest workflow plan and execution activities from current session
  const latestAIMessageWithPlan = [...(activeSession?.messages || [])]
    .reverse()
    .find((m) => m.workflowPlan || m.executionActivities);

  const activePlan: WorkflowPlan | undefined = latestAIMessageWithPlan?.workflowPlan;
  const activeActivities: ToolExecutionActivity[] = latestAIMessageWithPlan?.executionActivities || [];

  // Filter tasks created by Central AI or relevant to current goal
  const aiCreatedTasks = tasks.filter(
    (t) => t.id.startsWith('task-ai-') || t.category === 'Interview Preparation' || t.category === 'Coding Practice'
  );

  // Reload sessions when user changes or logs out
  useEffect(() => {
    const loaded = loadUserSessions(user);
    setSessions(loaded);
    setActiveSessionId(loaded.length > 0 ? loaded[0].id : 'session-default');
  }, [user?.id, user?.email]);

  // Auto-save sessions under user-specific storage key
  useEffect(() => {
    const key = getUserStorageKey('synapsx_ai_sessions', user);
    appStorage.setItem(key, JSON.stringify(sessions));
  }, [sessions, user?.id, user?.email]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  // Handle initial prompt passed from other pages
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleCreateNewSession = () => {
    const newSession: AIChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Student Workflow',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: '### 🚀 Central AI Ready\nWhat academic, interview, or scheduling goal should we orchestrate today?',
          timestamp: Date.now(),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleCreateNewSession();
      return;
    }
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated[0].id);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    // Update active session messages
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const isFirstUserMsg = s.messages.filter((m) => m.role === 'user').length === 0;
          return {
            ...s,
            title: isFirstUserMsg ? textToSend.slice(0, 36) + '...' : s.title,
            updatedAt: Date.now(),
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInputMessage('');
    setIsLoading(true);
    setCurrentExecutionStep('Analyzing goal & selecting tools...');

    try {
      const result = await sendChatMessage(
        textToSend,
        activeSession ? activeSession.messages : [],
        user,
        tasks
      );

      const aiMsg: AIChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: result.text,
        timestamp: Date.now(),
        workflowPlan: result.workflowPlan,
        executionActivities: result.executionActivities,
        createdTasks: result.createdTasks,
        generatedImages: result.generatedImages || [],
        calendarData: result.calendarData,
        fallbackUsed: result.fallbackUsed,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, aiMsg],
            };
          }
          return s;
        })
      );

      if (onTaskCreatedNotification && result.createdTasks && result.createdTasks.length > 0) {
        onTaskCreatedNotification(`Created and synced ${result.createdTasks.length} tasks!`);
      }
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Orchestration error: ${err?.message || 'Failed to communicate with orchestrator endpoint'}. You can try again.`,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setIsLoading(false);
      setCurrentExecutionStep('');
    }
  };

  const handleToggleSubtaskLocal = (taskId: string, subtaskId: string) => {
    toggleSubtask(taskId, subtaskId, user?.email);
    if (onTaskCreatedNotification) {
      onTaskCreatedNotification('Progress updated!');
    }
  };

  const handleToggleTaskStatusLocal = (taskId: string) => {
    toggleTaskStatus(taskId, user?.email);
    if (onTaskCreatedNotification) {
      onTaskCreatedNotification('Task status changed!');
    }
  };

  const handleRegenerateImage = (prompt: string) => {
    handleSendMessage(`Generate another version of: ${prompt}`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6.5rem)] gap-4 pb-4">
      {/* ================= LEFT SIDEBAR: WORKFLOW SESSIONS ================= */}
      <div
        className={`w-full lg:w-64 shrink-0 rounded-3xl border flex flex-col justify-between overflow-hidden transition-all ${
          darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="p-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-xs font-heading block">Central AI</span>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Orchestrator</span>
              </div>
            </div>
            <button
              id="new-workflow-btn"
              type="button"
              onClick={handleCreateNewSession}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs cursor-pointer"
              title="Start New Orchestration Workflow"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2 px-1">
            Saved Workflows
          </span>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                      : darkMode
                      ? 'hover:bg-slate-900 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Workflow className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className={`p-1 rounded-md opacity-40 hover:opacity-100 hover:text-rose-400 transition-opacity ${
                      isActive ? 'text-white' : ''
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Progress Card */}
        <div className="p-3 border-t border-slate-700/40 space-y-2 text-xs">
          <div
            className={`p-3 rounded-2xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Live Task Completion
              </span>
              <span className="text-cyan-400 font-black">{progressSummary.metrics.completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-700/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressSummary.metrics.completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
              <span>{progressSummary.metrics.completedTasks} completed</span>
              <span>{progressSummary.metrics.totalTasks} total tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN DASHBOARD AREA ================= */}
      <div
        className={`flex-1 rounded-3xl border flex flex-col justify-between overflow-hidden ${
          darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Clean Header Bar */}
        <div className="px-5 py-3 border-b border-slate-700/40 flex flex-wrap items-center justify-between gap-3 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block">Synapse Central AI</span>
              <span className="text-[10px] text-cyan-400 font-medium">Interactive Tutor & Learning Assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasGeminiKey === true ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Gemini 3.8 Flash Reasoning
              </span>
            ) : (
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5"
                title="Running Synaps Central Knowledge Engine with offline pedagogical lessons"
              >
                <Cpu className="w-3 h-3 text-indigo-400" />
                Synaps Knowledge Engine
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Server Tool Execution
            </span>

            <button
              type="button"
              onClick={() => setShowInspector((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                showInspector
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : darkMode
                  ? 'bg-slate-900 border-slate-700/70 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
              }`}
              title="Toggle Workflow Inspector"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Workflow Inspector</span>
              {(activePlan || activeActivities.length > 0 || aiCreatedTasks.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Main Workspace: Conversational Learning Stream + Collapsible Workflow Inspector */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Primary View: Clean Conversational Tutor Interface */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0">
            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeSession.messages.map((msg) => {
                const isAI = msg.role === 'assistant';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-4xl ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isAI
                          ? 'bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-xs'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isAI ? <Sparkles className="w-4 h-4" /> : user?.avatar || 'S'}
                    </div>

                    <div className="space-y-3 flex-1 min-w-0">
                      <div
                        className={`p-4 sm:p-5 rounded-2xl text-xs leading-relaxed ${
                          isAI
                            ? darkMode
                              ? 'bg-slate-900 border border-slate-800 text-slate-200'
                              : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                            : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        {isAI && msg.id !== 'msg-welcome' && (
                          <div className="mb-2 pb-1.5 border-b border-slate-700/40">
                            {msg.fallbackUsed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                <Cpu className="w-3 h-3 text-indigo-400" />
                                Synaps Knowledge Engine (Offline Mode)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                Gemini 3.8 Flash Reasoning
                              </span>
                            )}
                          </div>
                        )}
                        <div className="whitespace-pre-line prose-invert">{msg.content}</div>
                      </div>

                      {/* Inline Generated Images */}
                      {msg.generatedImages && msg.generatedImages.length > 0 && (
                        <div className="space-y-3">
                          {msg.generatedImages.map((img) => (
                            <div
                              key={img.id}
                              className={`p-4 rounded-2xl border transition-all overflow-hidden ${
                                darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-700/40">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-xs block text-slate-200">
                                      Generated Visual Asset
                                    </span>
                                    <span className="text-[10px] text-cyan-400 font-mono">
                                      {img.provider} • {img.model}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {img.aspectRatio && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                      {img.aspectRatio}
                                    </span>
                                  )}
                                  {img.style && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                                      {img.style}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Real Image Container */}
                              <div className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[160px]">
                                <img
                                  src={img.url}
                                  alt={img.prompt}
                                  loading="lazy"
                                  onClick={() => setSelectedPreviewImage(img)}
                                  className="w-full max-h-[460px] object-contain rounded-xl cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => setSelectedPreviewImage(img)}
                                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer shadow-md"
                                  title="View Full Size"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Prompt Caption */}
                              <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                <span className="italic leading-relaxed">"{img.prompt}"</span>
                              </div>

                              {/* Action Controls */}
                              <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={img.url}
                                    download={`${img.id}.jpg`}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Image</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleRegenerateImage(img.prompt)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Generate Another Version</span>
                                  </button>
                                </div>
                                <a
                                  href={img.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Open in New Tab</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Workflow Execution Summary (Only shown when genuine actions or plans were executed) */}
                      {(msg.workflowPlan || (msg.executionActivities && msg.executionActivities.length > 0)) && (
                        <div
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                            darkMode ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50/80 border-indigo-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                              <Workflow className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="font-bold block text-slate-200 truncate">
                                {msg.workflowPlan?.goal || 'Workflow Actions Executed'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {msg.executionActivities?.length || msg.workflowPlan?.steps.length || 0} tool steps verified
                                {msg.createdTasks && msg.createdTasks.length > 0 && ` • ${msg.createdTasks.length} tasks scheduled`}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowInspector(true);
                              setInspectorTab(msg.workflowPlan ? 'plan' : 'activity');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shrink-0"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Calendar 1-Click Link Card if available */}
                      {(msg.calendarData?.calendarUrl || msg.calendarData?.googleCalendarUrl) && (
                        <div
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                            darkMode
                              ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
                              : 'bg-cyan-50 border-cyan-200 text-cyan-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold leading-tight">
                                {msg.calendarData.title || msg.calendarData.eventTitle || 'Study Session Block'}
                              </p>
                              <span className="text-[10px] opacity-75">
                                1-Click Google Calendar Intent • {msg.calendarData.date} at {msg.calendarData.startTime || msg.calendarData.time || '10:00'}
                              </span>
                            </div>
                          </div>
                          <a
                            href={msg.calendarData.calendarUrl || msg.calendarData.googleCalendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                          >
                            <span>Add to Calendar</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Privacy-First Expenditure Monitoring Proposal Card */}
                      {msg.expenseProposal && (
                        <div
                          className={`p-4 rounded-2xl border ${
                            darkMode
                              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                              : 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                              Privacy-First Confirmation Required
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3 text-xs">
                            <div className="p-2.5 rounded-xl bg-black/20 border border-amber-500/20">
                              <span className="text-[10px] text-slate-400 block">Duration</span>
                              <span className="font-bold">{msg.expenseProposal.durationDays} Days</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/20 border border-amber-500/20">
                              <span className="text-[10px] text-slate-400 block">Budget Limit</span>
                              <span className="font-bold">
                                {msg.expenseProposal.budget
                                  ? `${msg.expenseProposal.currency === 'INR' ? '₹' : msg.expenseProposal.currency}${msg.expenseProposal.budget.toLocaleString()}`
                                  : 'No Limit'}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/20 border border-amber-500/20 col-span-2 sm:col-span-1">
                              <span className="text-[10px] text-slate-400 block">Active Until</span>
                              <span className="font-bold">{msg.expenseProposal.endDate}</span>
                            </div>
                          </div>

                          <p className="text-[11px] opacity-80 leading-relaxed mb-3">
                            {msg.expenseProposal.disclaimer}
                          </p>

                          <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20">
                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage('Confirm');
                              }}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Confirm & Start Tracking</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage('Cancel');
                              }}
                              className="px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Expenditure Summary Card */}
                      {msg.expenseSummary && (
                        <div
                          className={`p-4 rounded-2xl border ${
                            darkMode
                              ? 'bg-slate-900/90 border-slate-800'
                              : 'bg-white border-slate-200 shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/40">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">₹</span>
                              <span className="font-bold text-xs">Expenditure Status</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              msg.expenseSummary.trackingStatus === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {msg.expenseSummary.trackingStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
                            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                              <span className="text-[10px] text-slate-400 block">Total Spent</span>
                              <span className="font-bold text-rose-400">₹{msg.expenseSummary.totalSpent.toLocaleString()}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                              <span className="text-[10px] text-slate-400 block">Remaining</span>
                              <span className="font-bold text-emerald-400">₹{msg.expenseSummary.remainingBudget.toLocaleString()}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                              <span className="text-[10px] text-slate-400 block">Transactions</span>
                              <span className="font-bold">{msg.expenseSummary.transactionsCount}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                              <span className="text-[10px] text-slate-400 block">Days Left</span>
                              <span className="font-bold">{msg.expenseSummary.daysRemaining}</span>
                            </div>
                          </div>

                          {msg.expenseSummary.totalBudget > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Budget Consumption</span>
                                <span>{Math.round((msg.expenseSummary.totalSpent / msg.expenseSummary.totalBudget) * 100)}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, Math.round((msg.expenseSummary.totalSpent / msg.expenseSummary.totalBudget) * 100))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3 text-xs text-indigo-400 font-semibold p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 max-w-md animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <div>
                    <span className="font-bold block">Central AI Orchestrating...</span>
                    <span className="text-[10px] text-slate-400">
                      {currentExecutionStep || 'Calling registered tools and executing plan...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Bar */}
            <div className="px-4 py-2 border-t border-slate-700/30 overflow-x-auto flex items-center gap-2 no-scrollbar bg-slate-900/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Example Goals:
              </span>
              {EXAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border shrink-0 transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white'
                      : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-700 shadow-2xs'
                  }`}
                >
                  {prompt.length > 60 ? prompt.slice(0, 58) + '...' : prompt}
                </button>
              ))}
            </div>

            {/* Input Form Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 border-t border-slate-700/40 flex items-center gap-2 bg-slate-900/40"
            >
              <input
                id="central-ai-command-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Give Central AI a goal (e.g. 'Help me prepare for an SDE interview in seven days' or 'Plan my project schedule')..."
                className={`flex-1 px-4 py-3 rounded-2xl text-xs outline-none border transition-all ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-400 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />

              <button
                id="central-ai-submit-btn"
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                <span>Orchestrate</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Secondary Collapsible Workflow Inspector Panel */}
          {showInspector && (
            <div
              className={`w-full lg:w-[440px] shrink-0 border-l flex flex-col justify-between overflow-hidden transition-all shadow-xl z-20 ${
                darkMode ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Inspector Header with sub-tabs and close button */}
              <div className="px-4 py-3 border-b border-slate-700/40 flex items-center justify-between gap-2 bg-slate-900/40">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('plan')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inspectorTab === 'plan'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : darkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <ListOrdered className="w-3 h-3" />
                    <span>Plan</span>
                    {activePlan && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorTab('activity')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inspectorTab === 'activity'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : darkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    <span>Activity</span>
                    {activeActivities.length > 0 && (
                      <span className="px-1 py-0.2 rounded text-[9px] bg-indigo-500/30 text-indigo-300 font-mono">
                        {activeActivities.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorTab('tasks')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inspectorTab === 'tasks'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : darkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>Tasks</span>
                    <span className="px-1 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300">
                      {aiCreatedTasks.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorTab('tools')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inspectorTab === 'tools'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : darkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Tools</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInspector(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inspector Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Inspector Tab 1: Workflow Plan */}
                {inspectorTab === 'plan' && (
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-700/40">
                      <h4 className="text-sm font-extrabold font-heading text-slate-100">
                        {activePlan?.goal || 'No Active Workflow Plan'}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {activePlan?.summary || 'Ask Central AI to orchestrate a goal (such as 7-day interview prep) to inspect the execution roadmap.'}
                      </p>
                      {activePlan && (
                        <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Duration: {activePlan.duration}
                        </span>
                      )}
                    </div>

                    {activePlan ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <Workflow className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Sequential Steps ({activePlan.steps.length})</span>
                        </div>

                        <div className="space-y-2.5">
                          {activePlan.steps.map((step) => (
                            <div
                              key={step.stepNumber}
                              className={`p-3 rounded-xl border text-xs ${
                                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5">
                                  <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                                    {step.stepNumber}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-xs text-slate-200">{step.title}</h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                      {step.description}
                                    </p>
                                  </div>
                                </div>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                  Done
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center justify-between">
                          <span>Planned tasks registered in Task Manager.</span>
                          <button
                            type="button"
                            onClick={() => setInspectorTab('tasks')}
                            className="font-bold underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Tasks</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        <Workflow className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="font-bold">No active plan for this conversation.</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Educational questions explain concepts without creating plans.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Inspector Tab 2: Execution Activity */}
                {inspectorTab === 'activity' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="pb-3 border-b border-slate-700/40 flex items-center justify-between font-sans">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tool Execution Log</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Verified server-side actions.</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {activeActivities.length} Calls
                      </span>
                    </div>

                    {activeActivities.length > 0 ? (
                      activeActivities.map((act) => (
                        <div
                          key={act.id}
                          className={`p-3 rounded-xl border ${
                            act.status === 'completed'
                              ? darkMode
                                ? 'bg-slate-900/80 border-slate-800'
                                : 'bg-white border-slate-200'
                              : 'bg-rose-950/30 border-rose-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold text-[9px]">
                                #{act.stepNumber}
                              </span>
                              <span className="font-bold text-indigo-300 font-sans text-xs">{act.toolName}</span>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                act.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {act.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-lg text-[10px] text-slate-300 overflow-x-auto mb-1.5 border border-slate-800/80">
                            <span className="text-slate-500 font-bold block text-[9px]">Parameters:</span>
                            <pre className="text-cyan-300 whitespace-pre-wrap">{JSON.stringify(act.parameters, null, 2)}</pre>
                          </div>

                          <div className="bg-slate-950/80 p-2 rounded-lg text-[10px] text-slate-300 overflow-x-auto border border-slate-800/80">
                            <span className="text-slate-500 font-bold block text-[9px]">Output:</span>
                            <pre className="text-emerald-400 whitespace-pre-wrap">{JSON.stringify(act.result || act.errorMessage, null, 2)}</pre>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400 text-xs font-sans">
                        <Terminal className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="font-bold">No tool activities executed yet.</p>
                        <p className="text-[10px] text-slate-500 mt-1">Actions appear when Central AI executes tools.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Inspector Tab 3: Tasks & Progress */}
                {inspectorTab === 'tasks' && (
                  <div className="space-y-3 text-xs">
                    <div className="pb-3 border-b border-slate-700/40 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Tasks Created ({aiCreatedTasks.length})</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Toggle subtasks to update progress live.</p>
                      </div>

                      {onNavigateToTasks && (
                        <button
                          type="button"
                          onClick={onNavigateToTasks}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        >
                          <span>Full App</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {aiCreatedTasks.map((task) => {
                        const isCompleted = task.status === 'completed';
                        const subtasksCount = task.subtasks.length;
                        const completedSubtasksCount = task.subtasks.filter((st) => st.completed).length;

                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border transition-all ${
                              isCompleted
                                ? 'bg-emerald-950/20 border-emerald-500/30'
                                : darkMode
                                ? 'bg-slate-900/60 border-slate-800'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={() => handleToggleTaskStatusLocal(task.id)}
                                className="mt-0.5 rounded accent-indigo-600 cursor-pointer h-3.5 w-3.5"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className={`text-xs font-bold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                  {task.title}
                                </h5>
                                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>
                                <div className="flex items-center gap-2 mt-1.5 text-[9px]">
                                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-semibold">{task.category}</span>
                                  <span className="text-slate-400">Due: {task.dueDate}</span>
                                  {subtasksCount > 0 && (
                                    <span className="text-cyan-400 font-bold">
                                      {completedSubtasksCount}/{subtasksCount} Done
                                    </span>
                                  )}
                                </div>

                                {task.subtasks.length > 0 && (
                                  <div className="mt-2 space-y-1 pl-1.5 border-l border-slate-700/60">
                                    {task.subtasks.map((st) => (
                                      <label key={st.id} className="flex items-center gap-1.5 text-[10px] cursor-pointer text-slate-300 hover:text-white">
                                        <input
                                          type="checkbox"
                                          checked={st.completed}
                                          onChange={() => handleToggleSubtaskLocal(task.id, st.id)}
                                          className="rounded accent-indigo-500 h-2.5 w-2.5 cursor-pointer"
                                        />
                                        <span className={st.completed ? 'line-through text-slate-500' : ''}>{st.title}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inspector Tab 4: Connected Tools Registry */}
                {inspectorTab === 'tools' && (
                  <div className="space-y-3 text-xs">
                    <div className="pb-3 border-b border-slate-700/40">
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Connected Tool Registry</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Native tools and external integrations.</p>
                    </div>

                    <div className="space-y-2.5">
                      {EXECUTABLE_TOOLS.map((tool) => (
                        <div
                          key={tool.name}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-indigo-300 font-mono">{tool.name}</span>
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                                tool.availabilityStatus === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              }`}
                            >
                              {tool.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{tool.description}</p>
                          <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800 flex items-center justify-between">
                            <span>Permissions: {tool.permissionRequirements}</span>
                            <span className="font-bold uppercase text-slate-400">{tool.connectionType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Image Preview Modal */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center p-4 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white truncate max-w-md">
                  {selectedPreviewImage.prompt}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedPreviewImage.url}
                  download={`${selectedPreviewImage.id}.jpg`}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewImage(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img
              src={selectedPreviewImage.url}
              alt={selectedPreviewImage.prompt}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-lg"
            />
            <div className="w-full mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>{selectedPreviewImage.provider} • {selectedPreviewImage.model}</span>
              <span className="uppercase font-mono">{selectedPreviewImage.aspectRatio || '1:1'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
