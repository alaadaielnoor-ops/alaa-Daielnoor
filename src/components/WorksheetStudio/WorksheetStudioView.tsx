import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import { api } from '../../services/api.ts';
import { Worksheet } from '../../types/index.ts';
import {
  FileText, Plus, Sparkles, Printer, Trash2,
  CheckCircle2, BookOpen, Clock, X, Users, Compass, Building2,
  Download, ExternalLink, Loader2
} from 'lucide-react';
import { exportUnifiedPdf } from '../../utils/pdfExport.ts';

export const WorksheetStudioView: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const {
    schoolProfile,
    schoolName,
    teacherName,
    supervisorName,
    governorateName,
    directorateName,
    countryName,
    ministryName,
    academicYear,
    semester,
    principalName,
    stampText,
    openSchoolProfileModal,
    openEditModal
  } = useSchoolProfile();

  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);

  const [selectedWs, setSelectedWs] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const worksheetPrintRef = useRef<HTMLDivElement>(null);

  // Generation Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSubject, setGenSubject] = useState('الجغرافيا العامة والبيئة');
  const [genGrade, setGenGrade] = useState('الصف الثاني الثانوي');
  const [genUnit, setGenUnit] = useState('الوحدة الأولى: كوكب الأرض وتكتونية الصفائح');
  const [genObjective, setGenObjective] = useState('تصنيف حدود الصفائح وتفسير نشأة البحر الأحمر والحرات');
  const [genDifficulty, setGenDifficulty] = useState<'mixed' | 'beginner' | 'intermediate' | 'advanced'>('mixed');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadWorksheets();
  }, []);

  const loadWorksheets = async () => {
    setLoading(true);
    try {
      const res = await api.getWorksheets();
      if (res.success && res.worksheets) {
        setWorksheets(res.worksheets);
        if (res.worksheets.length > 0) {
          setSelectedWs(res.worksheets[0]);
        }
      }
    } catch (e) {
      console.warn('Error loading worksheets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.generateWorksheet({
        subjectName: genSubject,
        gradeName: genGrade,
        unitTitle: genUnit,
        targetObjective: genObjective,
        difficulty: genDifficulty,
        userId: currentUser.id
      });

      if (res.success && res.worksheet) {
        setWorksheets(prev => [res.worksheet, ...prev]);
        setSelectedWs(res.worksheet);
        setShowGenModal(false);
        showToast('تم إنشاء ورقة العمل بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteWorksheet(id);
      const remaining = worksheets.filter(w => w.id !== id);
      setWorksheets(remaining);
      setSelectedWs(remaining.length > 0 ? remaining[0] : null);
      setDeleteConfirmId(null);
      showToast('تم الحذف بنجاح', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExportPdf = async () => {
    if (!worksheetPrintRef.current || !selectedWs) return;
    setIsExportingPdf(true);
    showToast('جاري تجهيز وتحويل ورقة العمل إلى PDF عالي الجودة...', 'info');
    try {
      const fileName = `ورقة_عمل_${selectedWs.title.replace(/[\s/\\:]+/g, '_')}`;
      const res = await exportUnifiedPdf(worksheetPrintRef.current, {
        filename: `${fileName}.pdf`,
        orientation: 'portrait',
        title: selectedWs.title,
        scale: 2,
        addPageNumbers: true,
        uploadToServer: true,
        hideSelectors: ['.no-print', '[data-no-print]', 'button']
      });

      if (res.success) {
        const link = res.viewerUrl || res.fullUrl || res.blobUrl;
        if (link) {
          setPdfUrl(link);
        }
        showToast('تم إنشاء ملف PDF وتنزيله بنجاح! يمكنك أيضاً معاينته من الزر المخصص.', 'success');
      } else {
        showToast('تعذر تصدير ملف PDF، يمكنك استخدام خيار الطباعة المباشرة.', 'error');
      }
    } catch (err: any) {
      console.error('Worksheet PDF export error:', err);
      showToast('حدث خطأ أثناء تصدير PDF، يمكنك استخدام أمر الطباعة بدلاً من ذلك.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>استوديو الأنشطة وأوراق العمل</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تصميم أوراق عمل استقصائية وتطبيقات خرائط صماء تراعي الفروق الفردية للطلاب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openSchoolProfileModal}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition text-xs font-bold shadow-xs"
            title="تعديل ترويسة المدرسة والمديرية والختم المعتمد"
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>تعديل ترويسة المدرسة والختم</span>
          </button>

          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>توليد ورقة عمل بالذكاء الاصطناعي</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Worksheets list */}
        <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2 no-print shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block pb-2 border-b border-slate-100 dark:border-slate-800">
            أوراق العمل المحفوظة ({worksheets.length})
          </span>

          <div className="space-y-2 max-h-[650px] overflow-y-auto">
            {worksheets.map(ws => (
              <div
                key={ws.id}
                onClick={() => setSelectedWs(ws)}
                className={`p-3 rounded-2xl cursor-pointer text-xs transition border ${
                  selectedWs?.id === ws.id
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 font-bold shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <h4 className="font-bold line-clamp-1">{ws.title}</h4>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>{ws.gradeName}</span>
                  <span>{ws.activities.length} أنشطة</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worksheet Printable Viewer */}
        <div className="lg:col-span-3">
          {selectedWs ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
              {/* Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 no-print">
                <span className="text-xs font-bold text-slate-500">
                  {selectedWs.subjectName} • {selectedWs.gradeName}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={openSchoolProfileModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>تعديل الترويسة</span>
                  </button>

                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                    title="تصدير ورقة العمل كملف PDF عالي الجودة"
                  >
                    {isExportingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري التحويل...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>تصدير PDF</span>
                      </>
                    )}
                  </button>

                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-xs"
                      title="معاينة أو تنزيل ملف PDF الذي تم إنشاؤه"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>معاينة PDF 📥</span>
                    </a>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedWs.id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                    title="حذف ورقة العمل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Wrapper */}
              <div ref={worksheetPrintRef} className="space-y-6 bg-white dark:bg-slate-900 p-2 rounded-2xl">
              {/* Printable Official Omani Ministry Header */}
              <div className="border-2 border-slate-800 dark:border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-right space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {countryName} • {ministryName}
                    </h3>
                    <button
                      onClick={openEditModal}
                      className="no-print text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      ✏️ تعديل
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    {directorateName} | <strong className="text-teal-700 dark:text-teal-400">{schoolName}</strong>
                    {governorateName && <span className="text-slate-500 text-[11px]"> (محافظة {governorateName})</span>}
                  </p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                    مادة: {selectedWs.subjectName} • العام الدراسي: {academicYear} {semester ? `(${semester})` : ''}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    إعداد الأستاذ: <strong className="text-slate-800 dark:text-slate-200">{teacherName}</strong>
                    {supervisorName && (
                      <span> | إشراف: <strong className="text-slate-800 dark:text-slate-200">{supervisorName}</strong></span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 border-t md:border-t-0 md:border-r border-slate-300 dark:border-slate-700 pt-2 md:pt-0 md:pr-4">
                  <div className="space-y-1 text-slate-700 dark:text-slate-300">
                    <div>اسم الطالب: .................................................</div>
                    <div>الصف والشعبة: {selectedWs.gradeName}</div>
                  </div>
                  {schoolProfile.stampText && (
                    <div className="px-3 py-1.5 rounded-xl border border-dashed border-teal-600 text-teal-800 dark:text-teal-300 text-[10px] text-center font-bold">
                      {schoolProfile.stampText}
                    </div>
                  )}
                </div>
              </div>


              {/* Worksheet Title & Instructions */}
              <div>
                <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                  {selectedWs.title}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong>التعليمات:</strong> {selectedWs.instructions}
                </p>
              </div>

              {/* Activities */}
              <div className="space-y-6">
                {(selectedWs.activities || []).map((act, idx) => (
                  <div
                    key={act.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        {act.type === 'collaborative' ? (
                          <Users className="w-4 h-4 text-blue-600" />
                        ) : act.type === 'map_exercise' ? (
                          <Compass className="w-4 h-4 text-amber-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-teal-600" />
                        )}
                        <span>{act.title}</span>
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {act.type === 'individual' ? 'نشاط فردي' : act.type === 'collaborative' ? 'نشاط تعلم تعاوني' : act.type === 'map_exercise' ? 'تطبيق خريطة صماء' : 'تفكير ناقد'}
                      </span>
                    </div>

                    <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {act.prompt}
                    </div>

                    {/* Answer Area for student */}
                    <div className="h-20 border-b border-dashed border-slate-300 dark:border-slate-700 mt-4 text-[10px] text-slate-400">
                      مساحة إجابة الطالب:
                    </div>

                    {act.rubric && (
                      <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>معيار التقييم: {act.rubric}</span>
                        <span>الدرجة المستحقة: [     ]</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400">
              اختر ورقة عمل لعرضها أو توليد ورقة جديدة
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>توليد ورقة عمل بالذكاء الاصطناعي</span>
              </h3>
              <button onClick={() => setShowGenModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المادة والصف</label>
                <input
                  type="text"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الوحدة والموضوع</label>
                <input
                  type="text"
                  value={genUnit}
                  onChange={(e) => setGenUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الهدف التعليمي المستهدف</label>
                <textarea
                  rows={2}
                  value={genObjective}
                  onChange={(e) => setGenObjective(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مستوى التمايز (الفروق الفردية)</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="mixed">متدرج ومختلط لجميع المستويات</option>
                  <option value="beginner">مبسط ودعم بصري</option>
                  <option value="intermediate">متوسط واستيعابي</option>
                  <option value="advanced">متقدم وتفكير استقصائي</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm"
                >
                  {isGenerating ? 'جارٍ التوليد...' : 'توليد ورقة العمل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
