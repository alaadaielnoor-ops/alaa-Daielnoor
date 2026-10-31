import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleType, SystemStats, SchoolProfile, StudentPerformanceAlert } from '../types/index.ts';
import { api } from '../services/api.ts';

export type ViewType =
  | 'dashboard'
  | 'library'
  | 'users'
  | 'taxonomy'
  | 'annual_plans'
  | 'timetable'
  | 'educational_calendar'
  | 'students'
  | 'letters'
  | 'search'
  | 'assistant'
  | 'lesson_studio'
  | 'worksheets'
  | 'assessments'
  | 'presentations'
  | 'geography'
  | 'water_atlas_3d'
  | 'geological_maps'
  | 'geological_3d'
  | 'external_references'
  | 'bookmarks'
  | 'sync_backup'
  | 'settings'
  | 'whatsapp'
  | 'pedagogy';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  currentUser: User;
  users: User[];
  refreshUsers: () => Promise<void>;
  switchUser: (userId: string) => void;
  switchUserRole: (role: RoleType) => void;
  updateCurrentUser: (user: User) => void;
  isEditUserModalOpen: boolean;
  setIsEditUserModalOpen: (open: boolean) => void;
  userToEdit: User | null;
  openEditUserModal: (user?: User) => void;
  closeEditUserModal: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  stats: SystemStats | null;
  refreshStats: () => Promise<void>;
  notifications: NotificationToast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  selectedResourceIdForPreview: string | null;
  setSelectedResourceIdForPreview: (id: string | null) => void;
  searchInitialQuery: string;
  setSearchInitialQuery: (q: string) => void;
  openSearchWithQuery: (q: string) => void;
  schoolProfile: SchoolProfile;
  refreshSchoolProfile: () => Promise<void>;
  updateSchoolProfile: (updates: Partial<SchoolProfile>, cascade?: boolean) => Promise<boolean>;
  isSchoolProfileModalOpen: boolean;
  openSchoolProfileModal: () => void;
  closeSchoolProfileModal: () => void;
  studentAlerts: StudentPerformanceAlert[];
  unreadStudentAlertsCount: number;
  studentAlertStats: { total: number; unread: number; critical: number; warning: number; notice: number };
  refreshStudentAlerts: () => Promise<void>;
  markAlertAsRead: (alertId: string, isRead?: boolean) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'الاستاذ علاءالدين ضي النور محمد خليفة',
    email: 'arzag111@gmail.com',
    role: 'admin',
    avatarUrl: '/owner_avatar.jpg',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'usr-teacher-1',
    name: 'أ. مريم المعمرية (معلم أول دراسات وجغرافيا)',
    email: 'mariam.teacher@moe.om',
    role: 'teacher',
    createdAt: '2026-09-05T09:30:00Z'
  },
  {
    id: 'usr-viewer-1',
    name: 'سالم الحارثي (متدرب / باحث تربوي)',
    email: 'salim.intern@moe.om',
    role: 'viewer',
    createdAt: '2026-09-10T11:00:00Z'
  }
];

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
  teacherName: 'أ. علاءالدين ضي النور محمد خليفة',
  supervisorName: 'أ. أحمد بن سالم البلوشي (مشرف أول الدراسات الاجتماعية والجغرافيا)',
  governorateName: 'شمال الباطنة',
  directorateName: 'المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',
  ministryName: 'وزارة التربية والتعليم',
  countryName: 'سلطنة عمان',
  academicYear: '2026 / 2027 م',
  semester: 'الفصل الدراسي الأول',
  principalName: 'أ. سالم بن خميس البلوشي',
  firstTeacherName: 'أ. مريم المعمرية (معلم أول دراسات اجتماعية وجغرافيا)',
  subjectName: 'الدراسات الاجتماعية والجغرافيا',
  stampText: 'مدرسة كعب بن برشة • سلطنة عمان'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USERS[0]);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [isSchoolProfileModalOpen, setIsSchoolProfileModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [selectedResourceIdForPreview, setSelectedResourceIdForPreview] = useState<string | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  const refreshSchoolProfile = async () => {
    try {
      const res = await api.getSchoolProfile();
      if (res.success && res.schoolProfile) {
        setSchoolProfile(res.schoolProfile);
      }
    } catch (e) {
      console.warn('Could not load school profile:', e);
    }
  };

  const updateSchoolProfile = async (updates: Partial<SchoolProfile>, cascade: boolean = true) => {
    try {
      const res = await api.updateSchoolProfile(updates, cascade, currentUser.id);
      if (res.success && res.schoolProfile) {
        setSchoolProfile(res.schoolProfile);
        showToast(`تم تعميم وحفظ بيانات المدرسة والمعلم والمشرف والمحافظة وتطبيقها بنجاح على جدول الحصص والخطابات والخطط وأوراق العمل فوراً! ✨`, 'success');
        if (updates.teacherName) {
          refreshUsers();
        }
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('تعذر تحديث بيانات المدرسة: ' + err.message, 'error');
      return false;
    }
  };

  const openSchoolProfileModal = () => setIsSchoolProfileModalOpen(true);
  const closeSchoolProfileModal = () => setIsSchoolProfileModalOpen(false);

  const refreshUsers = async () => {
    try {
      const res = await api.getUsers();
      if (res.success && res.users && res.users.length > 0) {
        setUsers(res.users);
        // Sync currentUser if it was updated
        setCurrentUser(prev => {
          const match = res.users.find(u => u.id === prev.id);
          return match || res.users[0];
        });
      }
    } catch (e) {
      console.warn('Could not refresh users:', e);
    }
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showToast(`تم التبديل إلى المستخدم: ${found.name}`, 'info');
    }
  };

  const switchUserRole = (role: RoleType) => {
    const found = users.find(u => u.role === role) || users[0];
    if (found) {
      setCurrentUser(found);
      showToast(`تم التبديل إلى دور: ${role === 'admin' ? 'مالك المكتبة' : role === 'teacher' ? 'معلم ومؤلف' : 'مطلع وزائر'}`, 'info');
    }
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const openEditUserModal = (user?: User) => {
    setUserToEdit(user || currentUser);
    setIsEditUserModalOpen(true);
  };

  const closeEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setUserToEdit(null);
  };

  // Handle dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const refreshStats = async () => {
    try {
      const res = await api.getStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (e) {
      console.warn('Could not refresh stats:', e);
    }
  };

  useEffect(() => {
    refreshStats();
    refreshUsers();
    refreshSchoolProfile();
    refreshStudentAlerts();
  }, []);

  const [studentAlerts, setStudentAlerts] = useState<StudentPerformanceAlert[]>([]);
  const [studentAlertStats, setStudentAlertStats] = useState({
    total: 0,
    unread: 0,
    critical: 0,
    warning: 0,
    notice: 0
  });

  const refreshStudentAlerts = async () => {
    try {
      const res = await api.getStudentAlerts();
      if (res.success && res.alerts) {
        setStudentAlerts(res.alerts);
        if (res.stats) {
          setStudentAlertStats(res.stats);
        }
      }
    } catch (e) {
      console.warn('Could not refresh student alerts:', e);
    }
  };

  const markAlertAsRead = async (alertId: string, isRead: boolean = true) => {
    try {
      const res = await api.markStudentAlertRead(alertId, isRead);
      if (res.success && res.alert) {
        setStudentAlerts(prev => prev.map(a => a.id === alertId ? res.alert : a));
        setStudentAlertStats(prev => ({
          ...prev,
          unread: isRead ? Math.max(0, prev.unread - 1) : prev.unread + 1
        }));
      }
    } catch (e) {
      console.warn('Could not mark alert read:', e);
    }
  };

  const markAllAlertsAsRead = async () => {
    try {
      const res = await api.markAllStudentAlertsRead();
      if (res.success) {
        setStudentAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
        setStudentAlertStats(prev => ({ ...prev, unread: 0 }));
        showToast('تم تحديد كافة تنبيهات انحدار الأداء كمقروءة', 'info');
      }
    } catch (e) {
      console.warn('Could not mark all alerts read:', e);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const openSearchWithQuery = (q: string) => {
    setSearchInitialQuery(q);
    setActiveView('search');
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        currentUser,
        users,
        refreshUsers,
        switchUser,
        switchUserRole,
        updateCurrentUser,
        isEditUserModalOpen,
        setIsEditUserModalOpen,
        userToEdit,
        openEditUserModal,
        closeEditUserModal,
        isDarkMode,
        toggleDarkMode,
        stats,
        refreshStats,
        notifications,
        showToast,
        removeToast,
        selectedResourceIdForPreview,
        setSelectedResourceIdForPreview,
        searchInitialQuery,
        setSearchInitialQuery,
        openSearchWithQuery,
        schoolProfile,
        refreshSchoolProfile,
        updateSchoolProfile,
        isSchoolProfileModalOpen,
        openSchoolProfileModal,
        closeSchoolProfileModal,
        studentAlerts,
        unreadStudentAlertsCount: studentAlertStats.unread,
        studentAlertStats,
        refreshStudentAlerts,
        markAlertAsRead,
        markAllAlertsAsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
