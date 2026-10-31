import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { SchoolProfile } from '../../types/index.ts';
import {
  School, X, Check, Sparkles, Building2, User, UserCheck, MapPin,
  CheckCircle2, AlertCircle, CalendarDays, RefreshCw, FileText
} from 'lucide-react';

interface EditSchoolProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditSchoolProfileModal: React.FC<EditSchoolProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { schoolProfile, updateSchoolProfile } = useApp();

  const [form, setForm] = useState<SchoolProfile>({
    schoolName: '',
    teacherName: '',
    supervisorName: '',
    governorateName: 'شمال الباطنة',
    directorateName: 'المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',
    ministryName: 'وزارة التربية والتعليم',
    countryName: 'سلطنة عمان',
    academicYear: '2026 / 2027 م',
    semester: 'الفصل الدراسي الأول',
    principalName: '',
    firstTeacherName: '',
    subjectName: 'الدراسات الاجتماعية والجغرافيا',
    stampText: ''
  });

  const [cascadeToAll, setCascadeToAll] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && schoolProfile) {
      setForm({
        schoolName: schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || 'أ. علاءالدين ضي النور محمد خليفة',
        supervisorName: schoolProfile.supervisorName || 'أ. أحمد بن سالم البلوشي',
        governorateName: schoolProfile.governorateName || 'شمال الباطنة',
        directorateName: schoolProfile.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',
        ministryName: schoolProfile.ministryName || 'وزارة التربية والتعليم',
        countryName: schoolProfile.countryName || 'سلطنة عمان',
        academicYear: schoolProfile.academicYear || '2026 / 2027 م',
        semester: schoolProfile.semester || 'الفصل الدراسي الأول',
        principalName: schoolProfile.principalName || 'أ. سالم بن خميس البلوشي',
        firstTeacherName: schoolProfile.firstTeacherName || 'أ. مريم المعمرية',
        subjectName: schoolProfile.subjectName || 'الدراسات الاجتماعية والجغرافيا',
        stampText: schoolProfile.stampText || 'مدرسة كعب بن برشة • سلطنة عمان'
      });
      setError(null);
    }
  }, [isOpen, schoolProfile]);

  if (!isOpen) return null;

  // Handle governorate change with automatic directorate synchronization
  const handleGovernorateChange = (gov: string) => {
    const cleanGov = gov.trim().replace(/^محافظة\s+/, '');
    setForm(prev => ({
      ...prev,
      governorateName: cleanGov,
      directorateName: cleanGov ? `المديرية العامة للتربية والتعليم بمحافظة ${cleanGov}` : prev.directorateName
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolName.trim()) {
      setError('يرجى إدخال اسم المدرسة');
      return;
    }
    if (!form.teacherName?.trim()) {
      setError('يرجى إدخال اسم الأستاذ / المعلم');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const ok = await updateSchoolProfile(form, cascadeToAll);
      if (ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'فشل تحديث بيانات المدرسة والتعميم الموحد');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-sky-50/80 dark:from-slate-950/80 dark:to-teal-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-700/20">
              <Building2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>إعدادات المدرسة والمعلم والمشرف والمحافظة الموحدة</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold">
                  تعميم فوري شامل 🚀
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تسمع التغييرات فوراً في جدول الحصص، الخطابات، خطط الدروس، الخطط السنوية، أوراق العمل، والاختبارات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Live Letterhead Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>معاينة حية للترويسة المعتمدة (تظهر في الطباعة وجميع الوثائق):</span>
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                تحديث لحظي أثناء الكتابة ⚡
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-2 border-teal-500/40 shadow-xs space-y-3">
              <div className="text-center font-serif text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-widest">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              <div className="flex items-start justify-between text-xs font-semibold leading-relaxed border-b border-dashed border-slate-200 dark:border-slate-800 pb-3">
                <div className="text-right space-y-0.5">
                  <p className="font-extrabold text-slate-900 dark:text-white">{form.countryName || 'سلطنة عمان'}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{form.ministryName || 'وزارة التربية والتعليم'}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{form.directorateName || `المديرية العامة للتربية والتعليم بمحافظة ${form.governorateName}`}</p>
                  <p className="text-teal-700 dark:text-teal-400 font-black text-sm">
                    {form.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي'}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-md">
                    <School className="w-7 h-7" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 mt-1">ترويسة معتمدة</span>
                </div>

                <div className="text-left space-y-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  <p>العام: <span className="font-sans font-semibold text-slate-700 dark:text-slate-300">{form.academicYear}</span></p>
                  <p>الفصل: <span className="font-sans text-slate-700 dark:text-slate-300">{form.semester}</span></p>
                  <p>التاريخ: <span className="font-sans">{new Date().toLocaleDateString('ar-OM')}</span></p>
                </div>
              </div>

              {/* Badges of Teacher & Supervisor */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60">
                  <span className="text-slate-500 block text-[10px]">الأستاذ / المعلم:</span>
                  <span className="font-black text-teal-900 dark:text-teal-200 truncate block">
                    {form.teacherName || 'أ. علاءالدين ضي النور'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-sky-50/70 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60">
                  <span className="text-slate-500 block text-[10px]">المشرف التربوي:</span>
                  <span className="font-black text-sky-900 dark:text-sky-200 truncate block">
                    {form.supervisorName || 'أ. أحمد بن سالم البلوشي'}
                  </span>
                </div>
                <div className="col-span-2 md:col-span-1 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60">
                  <span className="text-slate-500 block text-[10px]">المحافظة:</span>
                  <span className="font-black text-amber-900 dark:text-amber-200 truncate block">
                    {form.governorateName ? `محافظة ${form.governorateName}` : 'شمال الباطنة'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Core 4 Requested Fields */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>البيانات الأساسية الأربعة المطلوبة (التعميم الشامل)</span>
            </h4>

            {/* 1. اسم المدرسة */}
            <div>
              <label className="block font-black text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5 text-xs">
                <School className="w-4 h-4 text-teal-600" />
                <span>1. اسم المدرسة الرسمية:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.schoolName}
                onChange={e => setForm(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="مثال: مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                يطبق هذا الاسم في أعلى جدول الحصص، وأعلى الخطابات الرسمية، والخطط السنوية وأوراق العمل.
              </span>
            </div>

            {/* 2 & 3. اسم الأستاذ واسم المشرف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-black text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5 text-xs">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>2. اسم الأستاذ / المعلم:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.teacherName || ''}
                  onChange={e => setForm(prev => ({ ...prev, teacherName: e.target.value }))}
                  placeholder="مثال: أ. علاءالدين ضي النور محمد خليفة"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  يسمع في ترويسة جدول الحصص، صفة الراسل في الخطابات، خانة معد الخطة، وبطاقات الطلاب.
                </span>
              </div>

              <div>
                <label className="block font-black text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5 text-xs">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <span>3. اسم المشرف التربوي / المعلم الأول:</span>
                </label>
                <input
                  type="text"
                  value={form.supervisorName || ''}
                  onChange={e => setForm(prev => ({ ...prev, supervisorName: e.target.value }))}
                  placeholder="مثال: أ. أحمد بن سالم البلوشي"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  يسمع في استمارة تحضير الدروس، خانة المشرف في الخطط السنوية، واعتمادات الخطابات.
                </span>
              </div>
            </div>

            {/* 4. اسم المحافظة والمديرية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-black text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>4. اسم المحافظة التعليمية:</span>
                </label>
                <input
                  type="text"
                  value={form.governorateName || ''}
                  onChange={e => handleGovernorateChange(e.target.value)}
                  placeholder="مثال: شمال الباطنة أو مسقط أو الداخلية"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  تلقائياً تحدث ترويسة المديرية في أعلى كافة الوثائق والكتب.
                </span>
              </div>

              <div>
                <label className="block font-black text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>نص ترويسة المديرية العامة:</span>
                </label>
                <input
                  type="text"
                  value={form.directorateName}
                  onChange={e => setForm(prev => ({ ...prev, directorateName: e.target.value }))}
                  placeholder="مثال: المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Additional details: Academic Year, Semester, Stamp */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  العام الدراسي:
                </label>
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={e => setForm(prev => ({ ...prev, academicYear: e.target.value }))}
                  placeholder="2026 / 2027 م"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  الفصل الدراسي:
                </label>
                <input
                  type="text"
                  value={form.semester || 'الفصل الدراسي الأول'}
                  onChange={e => setForm(prev => ({ ...prev, semester: e.target.value }))}
                  placeholder="الفصل الدراسي الأول"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  نص ختم المدرسة المعتمد:
                </label>
                <input
                  type="text"
                  value={form.stampText || ''}
                  onChange={e => setForm(prev => ({ ...prev, stampText: e.target.value }))}
                  placeholder="مدرسة كعب بن برشة • سلطنة عمان"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            {/* Cascade Confirmation Box */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-800 space-y-2">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="cascadeToAllModal"
                  checked={cascadeToAll}
                  onChange={e => setCascadeToAll(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500 cursor-pointer mt-0.5 shrink-0"
                />
                <label htmlFor="cascadeToAllModal" className="text-xs text-teal-950 dark:text-teal-200 font-extrabold cursor-pointer leading-relaxed">
                  تعميم البيانات وتحديثها تلقائياً على كامل أقسام المنصة (جدول الحصص، الخطابات، خطط وتحضير الدروس، الخطط السنوية، أوراق العمل والاختبارات، وسجلات الطلاب)
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 pt-1 text-[10px] text-teal-800 dark:text-teal-300">
                <div className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>جدول الحصص الأسبوعي</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>المراسلات والخطابات الرسمية</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>خطط وتحضير الدروس</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>الخطط السنوية والفصلية</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>أوراق العمل والأنشطة</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>سجل وتقارير وبطاقات الطلاب</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold transition shadow-md shadow-teal-700/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التعميم والتحديث الشامل...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>حفظ وتعميم الترويسة على كل المنصة 🚀</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
