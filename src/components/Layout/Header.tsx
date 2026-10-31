import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { PWAInstallButton } from '../PWAInstallButton.tsx';
import {
  Menu, Search, Plus, Moon, Sun, Shield,
  BookPlus, GraduationCap, ChevronDown, Bell,
  AlertTriangle, ArrowRight, CheckCircle2, TrendingDown
} from 'lucide-react';
import { RoleType } from '../../types/index.ts';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, onOpenUploadModal }) => {
  const {
    openSearchWithQuery,
    setActiveView,
    currentUser,
    switchUserRole,
    isDarkMode,
    toggleDarkMode,
    openEditUserModal,
    studentAlerts,
    unreadStudentAlertsCount,
    markAlertAsRead,
    markAllAlertsAsRead
  } = useApp();

  const [headerSearch, setHeaderSearch] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      openSearchWithQuery(headerSearch.trim());
    } else {
      setActiveView('search');
    }
  };

  const roles: Array<{ key: RoleType; label: string; desc: string }> = [
    { key: 'admin', label: 'مدير النظام (كامل الصلاحيات)', desc: 'إدارة الكتب والمستخدمين والنسخ الاحتياطي والحذف' },
    { key: 'teacher', label: 'معلم ومؤلف', desc: 'إعداد الدروس والأنشطة والاختبارات والمحادثة مع الكتب' },
    { key: 'viewer', label: 'مطلع وزائر', desc: 'قراءة الكتب والبحث واستعراض الدروس فقط' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      {/* Right side: Mobile Menu Trigger + Quick Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          title="القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            placeholder="ابحث في الكتب والمفاهيم الجغرافية والصفحات..."
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>
      </div>

      {/* Left side actions */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* بطاقة مالك المكتبة الرقمية (قابلة للنقر للتعديل) */}
        <div
          onClick={() => openEditUserModal(currentUser)}
          className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-teal-50/80 to-emerald-50/80 dark:from-slate-800/90 dark:to-teal-950/60 border border-teal-200/70 dark:border-teal-800/60 shadow-xs cursor-pointer hover:border-teal-400 hover:shadow-sm transition"
          title="انقر لتعديل اسم وصورة المستخدم"
        >
          <img
            src={currentUser.avatarUrl || '/owner_avatar.jpg'}
            alt={currentUser.name}
            className="w-8 h-8 rounded-xl object-cover ring-1.5 ring-teal-600 shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="text-right leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                {currentUser.role === 'admin' ? 'مالك المكتبة:' : 'المستخدم:'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[170px]">
              {currentUser.name}
            </p>
          </div>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold px-1.5 py-0.5 rounded-md bg-teal-100/50 dark:bg-teal-900/40">
            ✏️
          </span>
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Quick New Lesson */}
        <button
          onClick={() => setActiveView('lesson_studio')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-800 dark:text-teal-200 text-xs font-bold transition border border-teal-200/50 dark:border-teal-800/50"
          title="إعداد خطة درس جديدة"
        >
          <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>درس جديد</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
          title="رفع كتب ومصادر جديدة"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">إضافة مصدر</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden lg:inline">{currentUser.role === 'admin' ? 'المدير' : currentUser.role === 'teacher' ? 'المعلم' : 'الزائر'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
                تغيير الصلاحيات لاختبار النظام:
              </div>
              {roles.map(r => (
                <button
                  key={r.key}
                  onClick={() => {
                    switchUserRole(r.key);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-right p-2.5 rounded-xl text-xs transition flex flex-col gap-0.5 ${
                    currentUser.role === r.key
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold">{r.label}</span>
                  <span className="text-[10px] text-slate-400">{r.desc}</span>
                </button>
              ))}

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    openEditUserModal(currentUser);
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-right p-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition flex items-center justify-between"
                >
                  <span>✏️ تعديل اسم وصورة الحساب</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('users');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-right p-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-between"
                >
                  <span>👥 إدارة وتعديل المستخدمين والأسماء</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Student Performance Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAlertsDropdown(!showAlertsDropdown);
              setShowRoleMenu(false);
            }}
            className={`relative p-2 rounded-xl transition ${
              showAlertsDropdown
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="تنبيهات انحدار أداء الطلاب مقارنة بمتوسط الصف"
          >
            <Bell className="w-4 h-4" />
            {unreadStudentAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-black shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadStudentAlertsCount > 9 ? '+9' : unreadStudentAlertsCount}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-3.5 bg-gradient-to-r from-rose-50/80 via-white to-amber-50/80 dark:from-slate-800 dark:to-slate-800 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">
                      تنبيهات انحدار أداء الطلاب
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      مقارنة أداء الطالب بمتوسط الشعبة والصف
                    </p>
                  </div>
                </div>

                {unreadStudentAlertsCount > 0 && (
                  <button
                    onClick={() => markAllAlertsAsRead()}
                    className="text-[10px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تحديد الكل كمقروء</span>
                  </button>
                )}
              </div>

              {/* Alert List */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {studentAlerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <span className="text-2xl block mb-2">🌟</span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">لا توجد تنبيهات انحدار حالياً</p>
                    <p className="text-[10px] text-slate-400 mt-1">كافة الطلاب يؤدون ضمن أو أعلى من متوسط أداء الصف.</p>
                  </div>
                ) : (
                  studentAlerts.slice(0, 5).map(alert => {
                    const isCritical = alert.severity === 'critical';
                    return (
                      <div
                        key={alert.id}
                        onClick={() => {
                          if (!alert.isRead) markAlertAsRead(alert.id);
                          setActiveView('students');
                          setShowAlertsDropdown(false);
                        }}
                        className={`p-3 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          !alert.isRead ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {!alert.isRead && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                            )}
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {alert.studentName}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold shrink-0">
                              {alert.section}
                            </span>
                          </div>

                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {isCritical ? 'انحدار حرج ⚠️' : 'تنبيه انخفاض ⚡'}
                          </span>
                        </div>

                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">
                          {alert.assessmentName}
                        </p>

                        {/* Deviation Meter */}
                        <div className="mt-2 flex items-center justify-between text-[10px] bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div>
                            <span className="text-slate-400">درجة الطالب: </span>
                            <span className="font-black text-rose-600 dark:text-rose-400">{alert.studentScore} / {alert.maxScore}</span>
                            <span className="text-slate-400 text-[9px] mr-1">({alert.studentPercentage}%)</span>
                          </div>
                          <div>
                            <span className="text-slate-400">متوسط الصف: </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{alert.classAverageScore} / {alert.maxScore}</span>
                            <span className="text-slate-400 text-[9px] mr-1">({alert.classAveragePercentage}%)</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-rose-600 font-black">
                            <TrendingDown className="w-3 h-3" />
                            <span>{alert.deviationPercentage}%</span>
                          </div>
                        </div>

                        {alert.remedialPlanSuggested && (
                          <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-1.5 line-clamp-1">
                            💡 خطة مقترحة: {alert.remedialPlanSuggested}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setActiveView('students');
                    setShowAlertsDropdown(false);
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <span>عرض جميع تنبيهات انحدار الأداء والخطط العلاجية</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
