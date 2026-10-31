import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Resource, ProcessingJob } from '../../types/index.ts';
import {
  BookOpen, GraduationCap, FileText, CheckSquare,
  Compass, HardDrive, Database, Plus, Search,
  ArrowUpRight, Clock, CheckCircle2, AlertTriangle, RefreshCw,
  CalendarRange, CalendarDays, Mail, MessageSquare, CalendarCheck, UserCheck, Layers
} from 'lucide-react';

export const DashboardView: React.FC<{ onOpenUpload: () => void }> = ({ onOpenUpload }) => {
  const {
    stats,
    refreshStats,
    setActiveView,
    setSelectedResourceIdForPreview,
    showToast,
    openEditUserModal,
    currentUser
  } = useApp();
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await refreshStats();
      const res = await api.getResources();
      if (res.success && res.resources) {
        setRecentResources(res.resources.slice(0, 5));
      }
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBackup = async () => {
    setBackingUp(true);
    try {
      const res = await api.createBackup();
      if (res.success) {
        showToast(`تم إنشاء نسخة احتياطية جديدة بنجاح (${(res.backup.sizeBytes / 1024).toFixed(1)} KB)`, 'success');
        await refreshStats();
      }
    } catch (err: any) {
      showToast(`فشل النسخ الاحتياطي: ${err.message}`, 'error');
    } finally {
      setBackingUp(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي الكتب والمراجع',
      value: stats?.totalResources || 0,
      sub: `${stats?.totalFiles || 0} ملفات رقمية مخزنة`,
      icon: BookOpen,
      color: 'from-teal-600 to-emerald-700',
      action: () => setActiveView('library'),
    },
    {
      title: 'الدروس والخطط النموذجية',
      value: stats?.totalLessons || 0,
      sub: 'موثقة بالمراجع وأرقام الصفحات',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-700',
      action: () => setActiveView('lesson_studio'),
    },
    {
      title: 'أوراق العمل والأنشطة',
      value: stats?.totalWorksheets || 0,
      sub: 'أنشطة استقصائية وفروق فردية',
      icon: FileText,
      color: 'from-amber-500 to-orange-600',
      action: () => setActiveView('worksheets'),
    },
    {
      title: 'الاختبارات والتقويم',
      value: stats?.totalAssessments || 0,
      sub: 'مع مفاتيح الإجابة وتوزيع الدرجات',
      icon: CheckSquare,
      color: 'from-purple-600 to-violet-700',
      action: () => setActiveView('assessments'),
    },
    {
      title: 'الموارد والخرائط الجغرافية',
      value: stats?.totalGeographicResources || 0,
      sub: 'خرائط تضاريسية وصور فضائية',
      icon: Compass,
      color: 'from-emerald-600 to-teal-800',
      action: () => setActiveView('geography'),
    },
    {
      title: 'الصفحات المفهرسة للاسترجاع',
      value: stats?.indexedPages || 0,
      sub: 'جاهزة للبحث الدلالي والذكاء الاصطناعي',
      icon: HardDrive,
      color: 'from-slate-700 to-slate-900',
      action: () => setActiveView('search'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-teal-950 via-teal-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-400/20">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>سلطنة عُمان • مناهج وزارة التربية والتعليم من الصف 1 إلى 12 وأدلة المعلم</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              المكتبة الجغرافية والتربوية الذكية
            </h2>
            <p className="mt-2 text-sm text-teal-100/90 leading-relaxed">
              منظومة مدرسية وتربوية متكاملة تضم كتب الطالب المعتمدة وأدلة المعلم لجميع المراحل والصفوف (من الصف الأول حتى الثاني عشر)، مع استرجاع دلالي دقيق (RAG) وإعداد الخطط والأنشطة والاختبارات المطابقة لجداول المواصفات العمانية.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveView('taxonomy')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition shadow-lg cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-950" />
                <span>الهيكل الشجري وفهرس الكتب 🌳⚡</span>
              </button>
              <button
                onClick={() => setActiveView('library')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>تصفح مناهج وأدلة المعلم (صفوف 1-12)</span>
              </button>
              <button
                onClick={() => setActiveView('geography')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition border border-teal-400/40 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>أطلس محافظات عمان الـ 11</span>
              </button>
              <button
                onClick={() => setActiveView('whatsapp')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>المساعد الذكي عبر الواتساب</span>
              </button>
              <button
                onClick={() => setActiveView('educational_calendar')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800/90 hover:bg-teal-700 text-white text-xs font-bold transition border border-teal-400/40 cursor-pointer shadow-md"
              >
                <CalendarCheck className="w-4 h-4 text-amber-300" />
                <span>التقويم وجدولة الاختبارات</span>
              </button>
              <button
                onClick={() => setActiveView('students')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition border border-amber-400/40 cursor-pointer shadow-md"
              >
                <UserCheck className="w-4 h-4 text-white" />
                <span>سجل وملفات الطلاب</span>
              </button>
            </div>
          </div>

          {/* بطاقة مالك ومؤسس المكتبة الرقمية */}
          <div className="shrink-0 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-3xl p-5 flex sm:flex-col items-center sm:items-center text-right sm:text-center gap-4 shadow-xl max-w-xs">
            <div className="relative shrink-0">
              <img
                src="/owner_avatar.jpg"
                alt="الاستاذ علاءالدين ضي النور محمد خليفة"
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover ring-2 ring-amber-400 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] shadow-sm">
                مالك المنصة
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-300 block">
                مالك ومؤسس المكتبة الرقمية
              </span>
              <h3 className="text-sm md:text-base font-black text-white mt-0.5">
                الاستاذ علاءالدين ضي النور محمد خليفة
              </h3>
              <p className="text-[11px] text-teal-100/80 mt-1">
                المشرف العام وإدارة المنظومة التعليمية
              </p>
              <button
                type="button"
                onClick={() => openEditUserModal(currentUser)}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>✏️ تعديل اسم وصورة المالك</span>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative backdrop graphics */}
        <div className="absolute left-[-40px] bottom-[-40px] w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <Compass className="absolute left-6 bottom-4 w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={c.action}
              className="cursor-pointer group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 transition shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {loading ? '...' : c.value}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                  {c.title}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {c.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Omani Educational Planning & Correspondence Suite */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 border border-teal-800/40 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>منظومة العمل المدرسي والتربوي - سلطنة عمان</span>
            </div>
            <h2 className="text-base md:text-lg font-black">
              الخطط السنوية وجدول الحصص والمراسلات المعتمدة
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plan Card */}
          <div
            onClick={() => setActiveView('annual_plans')}
            className="cursor-pointer group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400 transition text-right"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <CalendarRange className="w-5 h-5 text-amber-300" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-300 transition" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-teal-300 transition">
              الخطط السنوية والفصلية
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              توزيع المنهاج أسبوعياً للصفوف (1 - 12) مع تحديد مخرجات التعلم والاستراتيجيات وأدوات التقويم والطباعة الرسمية.
            </p>
          </div>

          {/* Timetable Card */}
          <div
            onClick={() => setActiveView('timetable')}
            className="cursor-pointer group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-400 transition text-right"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-sky-300" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 transition" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-sky-300 transition">
              جدول الحصص الأسبوعي
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              جدول الحصص التفاعلي (الأحد إلى الخميس) مع احتساب نصاب الحصص والصفوف والقاعات ومواعيد الحصص المعتمدة.
            </p>
          </div>

          {/* Letters Card */}
          <div
            onClick={() => setActiveView('letters')}
            className="cursor-pointer group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400 transition text-right"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-300" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 transition" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-300 transition">
              المراسلات والخطابات الرسمية
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              صياغة خطابات موجهة للمديرية التعليمية، وإدارة المدرسة، وأولياء أمور الطلبة وفق بروتوكول وزارة التربية والتعليم.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recently Added Resources */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>المصادر والكتب المضافة حديثاً</span>
            </h3>
            <button
              onClick={() => setActiveView('library')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>عرض كل المكتبة</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentResources.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  setSelectedResourceIdForPreview(res.id);
                  setActiveView('library');
                }}
                className="cursor-pointer group p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={res.coverImageUrl || '/covers/cover_om_grd5_tb.svg'}
                      alt={res.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/covers/cover_om_grd5_tb.svg';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {res.author} • {res.pageCount || 1} صفحة • {res.reliability === 'official' ? 'معتمد رسميًا' : 'أكاديمي'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    res.processingStatus === 'indexed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : res.processingStatus === 'processing'
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                  }`}>
                    {res.processingStatus === 'indexed' ? 'مفهرس وجاهز' : res.processingStatus === 'processing' ? 'قيد المعالجة' : 'يحتاج فحص'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Backup & System Status */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>حالة النظام والنسخ الاحتياطي</span>
          </h3>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">آخر عملية نسخ احتياطي:</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {stats?.lastBackupDate ? new Date(stats.lastBackupDate).toLocaleDateString('ar-SA') : 'جاهز للنسخ الآن'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">حالة قاعدة البيانات:</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>متصلة وسليمة</span>
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">المساحة التقديرية للملفات:</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {((stats?.totalStorageBytes || 0) / (1024 * 1024)).toFixed(1)} ميجابايت
              </span>
            </div>

            <button
              onClick={handleQuickBackup}
              disabled={backingUp}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${backingUp ? 'animate-spin' : ''}`} />
              <span>{backingUp ? 'جارٍ حفظ النسخة...' : 'إنشاء نسخة احتياطية فورية الآن'}</span>
            </button>

            <button
              onClick={() => setActiveView('sync_backup')}
              className="w-full py-2 text-center text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              عرض سجل النسخ والاستعادة والتحقق من السلامة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
