import React, { useState, useEffect } from 'react';
import { StudentUser, AppItem, RecentlyUsedItem, NotificationItem, StudentTask } from './types';
import { APPS_DATA } from './data/appsData';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { TasksDashboard } from './components/TasksDashboard';
import { SynapsAIDashboard } from './components/SynapsAIDashboard';
import { SignUpModal } from './components/SignUpModal';
import { SignInModal } from './components/SignInModal';
import { ProfileModal } from './components/ProfileModal';
import { ToastContainer, ToastData } from './components/Toast';
import { Footer } from './components/Footer';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ensureUserUuid, DEMO_USER_UUIDS } from './utils/userUtils';
import { appStorage } from './utils/storage';
import {
  getUserPreferences,
  saveUserPreferences,
  DEFAULT_FAVORITES,
  DEFAULT_RECENTLY_USED,
} from './services/preferenceService';
import {
  getNotifications,
  markNotificationRead,
} from './services/notificationService';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  toggleSubtask,
  fetchTasksFromCloud,
} from './services/taskService';

const INITIAL_USER: StudentUser = {
  id: DEMO_USER_UUIDS.SARAN,
  fullName: 'Saran Giri',
  email: 'girisaran370@gmail.com',
  college: 'Indian Institute of Technology (IIT)',
  course: 'Computer Science & Engineering',
  yearOfStudy: '3rd Year',
  avatar: 'S',
  bio: 'Competitive coding, full-stack architectures & machine learning explorer',
  joinDate: 'Sept 2025',
};

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // User state
  const [user, setUser] = useState<StudentUser | null>(() => {
    const saved = appStorage.getItem('synapsx_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.email) {
        parsed.id = ensureUserUuid(parsed.id, parsed.email);
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Current view: 'landing' or 'dashboard'
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>(() => {
    const savedUser = appStorage.getItem('synapsx_user');
    return savedUser ? 'dashboard' : 'landing';
  });

  // Favorites state (user-isolated)
  const [favorites, setFavorites] = useState<string[]>([...DEFAULT_FAVORITES]);

  // Recently used state (user-isolated)
  const [recentlyUsed, setRecentlyUsed] = useState<RecentlyUsedItem[]>([...DEFAULT_RECENTLY_USED]);

  // Student Tasks State (user-isolated)
  const [tasks, setTasks] = useState<StudentTask[]>(() => {
    if (user) {
      return getTasks(user.id || user.email);
    }
    return [];
  });

  // Active Category filter / workspace view
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Synaps AI initial prompt passing
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications state (user-isolated)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Toasts state
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Load user-isolated data when user logs in or switches accounts
  useEffect(() => {
    if (user) {
      const userUid = ensureUserUuid(user.id, user.email);
      user.id = userUid;
      appStorage.setItem('synapsx_user', JSON.stringify(user));

      // 1. Load user tasks
      setTasks(getTasks(userUid));
      fetchTasksFromCloud(userUid).then((cloudTasks) => {
        if (cloudTasks && cloudTasks.length > 0) {
          setTasks(cloudTasks);
        }
      });

      // 2. Load user preferences
      getUserPreferences(userUid).then((prefs) => {
        setFavorites(prefs.favorites);
        setRecentlyUsed(prefs.recentlyUsed);
        setDarkMode(prefs.darkMode);
      });

      // 3. Load user notifications
      getNotifications(userUid).then((notifs) => {
        setNotifications(notifs);
      });
    } else {
      appStorage.removeItem('synapsx_user');
      setTasks([]);
      setFavorites([...DEFAULT_FAVORITES]);
      setRecentlyUsed([...DEFAULT_RECENTLY_USED]);
      setNotifications([]);
    }
  }, [user?.id, user?.email]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for task changes triggered by AI executor or other modules & sync cloud
  useEffect(() => {
    const handleStorageEvent = () => {
      const userUid = user ? (user.id || user.email) : undefined;
      setTasks(getTasks(userUid));
    };

    window.addEventListener('synapsx_tasks_changed', handleStorageEvent);

    return () => {
      window.removeEventListener('synapsx_tasks_changed', handleStorageEvent);
    };
  }, [user]);

  // Listen for notification changes triggered across the app
  useEffect(() => {
    const handleNotifEvent = () => {
      if (user) {
        const userUid = user.id || user.email;
        getNotifications(userUid).then(setNotifications);
      }
    };

    window.addEventListener('synapsx_notifications_changed', handleNotifEvent);

    return () => {
      window.removeEventListener('synapsx_notifications_changed', handleNotifEvent);
    };
  }, [user]);

  // Toast trigger helper
  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastData = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Open App handler
  const handleOpenApp = (app: AppItem) => {
    const filtered = recentlyUsed.filter((item) => item.appId !== app.id);
    const updated = [{ appId: app.id, timestamp: Date.now() }, ...filtered].slice(0, 15);
    setRecentlyUsed(updated);
    if (user) {
      saveUserPreferences(user.id || user.email, { recentlyUsed: updated });
    }

    addToast(
      'info',
      `Launching ${app.name}`,
      `Redirecting to official portal: ${new URL(app.url).hostname}`
    );

    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  // Toggle Favorite handler
  const handleToggleFavorite = (appId: string) => {
    const app = APPS_DATA.find((a) => a.id === appId);
    const appName = app ? app.name : 'App';

    let newFavorites: string[];
    if (favorites.includes(appId)) {
      newFavorites = favorites.filter((id) => id !== appId);
      addToast('info', 'Favorite Removed', `Unpinned ${appName} from your favorites.`);
    } else {
      newFavorites = [...favorites, appId];
      addToast('success', 'Favorite Pinned', `Added ${appName} to your quick launch favorites!`);
    }

    setFavorites(newFavorites);
    if (user) {
      saveUserPreferences(user.id || user.email, { favorites: newFavorites });
    }
  };

  // Task Management Handlers
  const handleCreateTask = (taskData: Omit<StudentTask, 'id' | 'createdAt'>) => {
    const userUid = user ? (user.id || user.email) : undefined;
    const created = createTask(taskData, userUid);
    setTasks(getTasks(userUid));
    addToast('success', 'Task Created', `Added "${created.title}" to your tasks.`);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<StudentTask>) => {
    const userUid = user ? (user.id || user.email) : undefined;
    updateTask(taskId, updates, userUid);
    setTasks(getTasks(userUid));
    addToast('info', 'Task Updated', 'Saved task details successfully.');
  };

  const handleDeleteTask = (taskId: string) => {
    const userUid = user ? (user.id || user.email) : undefined;
    const success = deleteTask(taskId, userUid);
    if (success) {
      setTasks(getTasks(userUid));
      addToast('info', 'Task Deleted', 'Task removed from your schedule.');
    }
  };

  const handleToggleTaskStatus = (taskId: string) => {
    const userUid = user ? (user.id || user.email) : undefined;
    const updated = toggleTaskStatus(taskId, userUid);
    if (updated) {
      setTasks(getTasks(userUid));
      if (updated.status === 'completed') {
        addToast('success', 'Task Completed! 🎉', `Great job finishing "${updated.title}".`);
      }
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const userUid = user ? (user.id || user.email) : undefined;
    toggleSubtask(taskId, subtaskId, userUid);
    setTasks(getTasks(userUid));
  };

  // Navigation Helpers
  const handleNavigateToTasks = () => {
    setActiveCategory('tasks');
    setSearchQuery('');
  };

  const handleNavigateToAI = (prompt?: string) => {
    if (prompt) {
      setAiInitialPrompt(prompt);
    }
    setActiveCategory('synaps-ai');
    setSearchQuery('');
  };

  // Auth Handlers
  const handleSignUpSuccess = (newUser: StudentUser) => {
    const assignedUser: StudentUser = {
      ...newUser,
      id: ensureUserUuid(newUser.id, newUser.email),
    };
    setUser(assignedUser);
    setIsSignUpOpen(false);
    setCurrentView('dashboard');
    addToast('success', 'Welcome to Synaps X!', `Account created for ${assignedUser.fullName}.`);
  };

  const handleSignInSuccess = (loggedInUser: StudentUser) => {
    const assignedUser: StudentUser = {
      ...loggedInUser,
      id: ensureUserUuid(loggedInUser.id, loggedInUser.email),
    };
    setUser(assignedUser);
    setIsSignInOpen(false);
    setCurrentView('dashboard');
    addToast('success', 'Signed In', `Welcome back to your hub, ${assignedUser.fullName.split(' ')[0]}!`);
  };

  const handleExploreDemo = () => {
    setUser(INITIAL_USER);
    setCurrentView('dashboard');
    addToast('info', 'Demo Hub Active', 'Browsing Synaps X with full student privileges.');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[Supabase Auth] SignOut error:', e);
      }
    }

    // Completely clear user state and cached session records
    appStorage.removeItem('synapsx_user');
    setUser(null);
    setTasks([]);
    setFavorites([...DEFAULT_FAVORITES]);
    setRecentlyUsed([...DEFAULT_RECENTLY_USED]);
    setNotifications([]);
    setIsProfileOpen(false);
    setCurrentView('landing');
    addToast('info', 'Signed Out', 'You have been safely signed out of Synaps X.');
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (user) {
      markNotificationRead(user.id || user.email, id);
    }
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div
      className={`min-h-screen font-body flex flex-col transition-colors duration-300 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Toast notifications container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        darkMode={darkMode}
      />

      {/* Auth Modals */}
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignUpOpen(false);
          setIsSignInOpen(true);
        }}
        onSuccess={handleSignUpSuccess}
        darkMode={darkMode}
      />

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSwitchToSignUp={() => {
          setIsSignInOpen(false);
          setIsSignUpOpen(true);
        }}
        onSuccess={handleSignInSuccess}
        darkMode={darkMode}
      />

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onUpdateUser={(updated) => {
            setUser(updated);
            addToast('success', 'Profile Updated', 'Student profile details saved.');
          }}
          onLogout={handleLogout}
          favoriteApps={APPS_DATA.filter((a) => favorites.includes(a.id))}
          onOpenApp={handleOpenApp}
          onRemoveFavorite={handleToggleFavorite}
          darkMode={darkMode}
        />
      )}

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
          if (currentView !== 'dashboard') setCurrentView('dashboard');
        }}
        favoritesCount={favorites.length}
        recentlyUsedCount={recentlyUsed.length}
        pendingTasksCount={pendingTasksCount}
        onOpenProfile={() => {
          if (user) {
            setIsProfileOpen(true);
          } else {
            setIsSignInOpen(true);
          }
        }}
        darkMode={darkMode}
      />

      {/* Render based on currentView */}
      {currentView === 'landing' ? (
        <LandingPage
          onOpenSignUp={() => setIsSignUpOpen(true)}
          onOpenSignIn={() => setIsSignInOpen(true)}
          onExploreDemo={handleExploreDemo}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      ) : (
        /* Main Student Dashboard Layout */
        <div className="flex flex-col min-h-screen">
          <Navbar
            user={user}
            onOpenProfile={() => setIsProfileOpen(true)}
            onLogout={handleLogout}
            onOpenSignIn={() => setIsSignInOpen(true)}
            onOpenSignUp={() => setIsSignUpOpen(true)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            mobileMenuOpen={isMobileMenuOpen}
          />

          <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop Sidebar */}
            <Sidebar
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setSearchQuery('');
              }}
              favoritesCount={favorites.length}
              recentlyUsedCount={recentlyUsed.length}
              pendingTasksCount={pendingTasksCount}
              onOpenProfile={() => {
                if (user) {
                  setIsProfileOpen(true);
                } else {
                  setIsSignInOpen(true);
                }
              }}
              darkMode={darkMode}
            />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 py-6 lg:pl-8">
              {activeCategory === 'tasks' ? (
                /* Task Management Workspace */
                <TasksDashboard
                  tasks={tasks}
                  onToggleStatus={handleToggleTaskStatus}
                  onToggleSubtask={handleToggleSubtask}
                  onCreateTask={handleCreateTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenApp={handleOpenApp}
                  apps={APPS_DATA}
                  darkMode={darkMode}
                  user={user}
                  onNavigateToAI={handleNavigateToAI}
                />
              ) : activeCategory === 'synaps-ai' ? (
                /* Centralized Synaps AI Dashboard */
                <SynapsAIDashboard
                  user={user}
                  tasks={tasks}
                  onOpenApp={handleOpenApp}
                  apps={APPS_DATA}
                  darkMode={darkMode}
                  initialPrompt={aiInitialPrompt}
                  onTaskCreatedNotification={(title) => {
                    setTasks(getTasks(user ? (user.id || user.email) : undefined));
                    addToast('success', 'Synaps AI Task Synchronized', title);
                  }}
                  onNavigateToTasks={handleNavigateToTasks}
                />
              ) : (
                /* Application Launcher & Hub View */
                <DashboardView
                  user={user || INITIAL_USER}
                  apps={APPS_DATA}
                  favorites={favorites}
                  recentlyUsed={recentlyUsed}
                  tasks={tasks}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenApp={handleOpenApp}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                  onNavigateToTasks={handleNavigateToTasks}
                  onNavigateToAI={handleNavigateToAI}
                  darkMode={darkMode}
                />
              )}
            </main>
          </div>

          <Footer darkMode={darkMode} />
        </div>
      )}
    </div>
  );
}
