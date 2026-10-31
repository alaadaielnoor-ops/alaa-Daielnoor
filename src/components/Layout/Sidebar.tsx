import React from 'react';
import { useApp, ViewType } from '../../context/AppContext.tsx';
import {
  LayoutDashboard, BookOpen, Layers, Search, Bot,
  GraduationCap, FileText, CheckSquare, Presentation,
  Compass, Globe, Bookmark, Database, Settings, ShieldAlert,
  ChevronLeft, CalendarRange, CalendarDays, Mail, Users, MessageSquare,
  CalendarCheck, UserCheck, Brain, Box, Map, Droplets
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeView, setActiveView, stats, currentUser, openEditUserModal } = useApp();

  const menuItems: Array<{
    id: ViewType;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    category?: string;
  }> = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'library', label: 'المكتبة الرقمية', icon: BookOpen, badge: stats?.totalResources },
    { id: 'pedagogy', label: 'المرجع التربوي واستراتيجيات التدريس', icon: Brain, badge: 'معتمد' },
    { id: 'users', label: 'المستخدمون وتعديل الأسماء', icon: Users, badge: 'إدارة' },
    { id: 'students', label: 'سجل وملفات الطلاب', icon: UserCheck, badge: stats?.totalStudents || 'شامل' },
    { id: 'taxonomy', label: 'فهرس الكتب والهيكل الشجري', icon: Layers, badge: 'شجري 🌳' },
    { id: 'annual_plans', label: 'الخطط السنوية والفصلية', icon: CalendarRange, badge: stats?.totalAnnualPlans },
    { id: 'timetable', label: 'جدول الحصص الأسبوعي', icon: CalendarDays, badge: stats?.totalTimetables },
    { id: 'educational_calendar', label: 'التقويم التربوي والمواعيد', icon: CalendarCheck, badge: stats?.totalCalendarEvents || 'مجدول' },
    { id: 'letters', label: 'المراسلات والخطابات الرسمية', icon: Mail, badge: stats?.totalOfficialLetters },
    { id: 'search', label: 'البحث الذكي والهجين', icon: Search },
    { id: 'assistant', label: 'المساعد التربوي (AI)', icon: Bot, badge: 'RAG' },
    { id: 'lesson_studio', label: 'استوديو إعداد الدروس', icon: GraduationCap, badge: stats?.totalLessons },
    { id: 'worksheets', label: 'الأنشطة وأوراق العمل', icon: FileText, badge: stats?.totalWorksheets },
    { id: 'assessments', label: 'الاختبارات والتقويم', icon: CheckSquare, badge: stats?.totalAssessments },
    { id: 'presentations', label: 'العروض والملخصات', icon: Presentation },
    { id: 'geography', label: 'مركز الخرائط والجغرافيا', icon: Compass, badge: stats?.totalGeographicResources },
    { id: 'water_atlas_3d', label: 'الأطلس المائي 3D', icon: Droplets, badge: 'Cesium 🌊' },
    { id: 'geological_maps', label: 'معرض الخرائط الجيولوجية', icon: Map, badge: 'جديد 🗺️' },
    { id: 'geological_3d', label: 'المختبر والمجسمات 3D', icon: Box, badge: 'Three.js 🪐' },
    { id: 'external_references', label: 'المصادر والمراجع الخارجية', icon: Globe, badge: stats?.totalExternalReferences },
    { id: 'bookmarks', label: 'المفضلة والملاحظات', icon: Bookmark },
    { id: 'whatsapp', label: 'ربط الواتساب الذكي', icon: MessageSquare, badge: 'جديد' },
    { id: 'sync_backup', label: 'المزامنة والنسخ الاحتياطي', icon: Database },
    { id: 'settings', label: 'الإعدادات وسجل التدقيق', icon: Settings },
  ];

  const handleSelect = (view: ViewType) => {
    setActiveView(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-60 md:z-40 w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo and Brand */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-teal-900/20 shrink-0">
            <Compass className="w-5 h-5 text-amber-300" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              المكتبة التربوية الذكية
            </h1>
            <p className="text-[10px] font-medium text-teal-600 dark:text-teal-400 truncate">
              سلطنة عمان • الصفوف 1 - 12
            </p>
          </div>
        </div>

        {/* بطاقة المستخدم ومالك المكتبة (انقر لتعديل الاسم والصورة) */}
        <div
          onClick={() => openEditUserModal(currentUser)}
          className="mx-3 mt-3 p-3 rounded-2xl bg-gradient-to-br from-teal-50/90 via-emerald-50/50 to-teal-50/20 dark:from-slate-800/90 dark:via-slate-800/50 dark:to-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 shadow-xs flex items-center gap-3 cursor-pointer hover:border-teal-400 hover:shadow-sm transition group"
          title="انقر لتعديل اسم وصورة الحساب"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatarUrl || '/owner_avatar.jpg'}
              alt={currentUser.name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-teal-600 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] text-white font-bold" title="حساب مفعل">
              ✓
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-teal-600 text-white">
                {currentUser.role === 'admin' ? 'مالك المكتبة' : currentUser.role === 'teacher' ? 'معلم ومؤلف' : 'مطلع'}
              </span>
              <span className="text-[9px] text-teal-600 dark:text-teal-400 font-bold opacity-75 group-hover:opacity-100">
                ✏️ تعديل
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate mt-0.5 leading-snug">
              {currentUser.name}
            </h4>
            <p className="text-[10px] text-teal-700 dark:text-teal-300 font-medium truncate">
              {currentUser.email || 'المشرف العام ومؤسس المنصة'}
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition group ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-700/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-amber-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-teal-700 text-teal-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/50 group-hover:text-teal-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-9 h-9 rounded-xl object-cover ring-1.5 ring-teal-600 shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser.name.slice(0, 1)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentUser.name}
              </p>
              <span className="inline-block text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-medium">
                {currentUser.role === 'admin' ? 'مالك المكتبة (مدير النظام)' : currentUser.role === 'teacher' ? 'معلم ومؤلف' : 'زائر ومطّلع'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
