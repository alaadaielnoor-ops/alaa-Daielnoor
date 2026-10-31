import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import { api } from '../../services/api.ts';
import { Assessment, AssessmentQuestion } from '../../types/index.ts';
import {
  CheckSquare, Plus, Sparkles, Printer, Trash2,
  CheckCircle2, BookOpen, Clock, X, Eye, EyeOff,
  HelpCircle, Compass, Award, Building2,
  Download, ExternalLink, Loader2
} from 'lucide-react';
import { CurriculumQuestionBank } from './CurriculumQuestionBank.tsx';
import { exportUnifiedPdf } from '../../utils/pdfExport.ts';

export const AssessmentStudioView: React.FC = () => {
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
    stampText,
    principalName,
    openSchoolProfileModal,
    openEditModal
  } = useSchoolProfile();

  const [activeTab, setActiveTab] = useState<'assessments' | 'question_bank'>('assessments');

  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [selectedAsmt, setSelectedAsmt] = useState<Assessment | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const assessmentPrintRef = useRef<HTMLDivElement>(null);

  // Generation Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSubject, setGenSubject] = useState('الجغرافيا العامة والبيئة');
  const [genGrade, setGenGrade] = useState('الصف الثاني الثانوي');
  const [genUnit, setGenUnit] = useState('الوحدة الأولى: كوكب الأرض والغلاف الصخري وتكتونية الصفائح');
  const [genCount, setGenCount] = useState(5);
  const [genDifficulty, setGenDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await api.getAssessments();
      if (res.success && res.assessments) {
        setAssessments(res.assessments);
        if (res.assessments.length > 0) {
          setSelectedAsmt(res.assessments[0]);
        }
      }
    } catch (e) {
      console.warn('Error loading assessments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.generateAssessment({
        subjectName: genSubject,
        gradeName: genGrade,
        unitTitle: genUnit,
        questionCount: genCount,
        difficulty: genDifficulty,
        userId: currentUser.id
      });

      if (res.success && res.assessment) {
        setAssessments(prev => [res.assessment, ...prev]);
        setSelectedAsmt(res.assessment);
        setShowGenModal(false);
        showToast('تم توليد الاختبار ومفتاح الإجابة وتوزيع الدرجات بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAssessment(id);
      const remaining = assessments.filter(a => a.id !== id);
      setAssessments(remaining);
      setSelectedAsmt(remaining.length > 0 ? remaining[0] : null);
      showToast('تم حذف الاختبار بنجاح', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExportPdf = async () => {
    if (!assessmentPrintRef.current || !selectedAsmt) return;
    setIsExportingPdf(true);
    showToast('جاري تجهيز وتصدير الاختبار كملف PDF عالي الجودة...', 'info');
    try {
      const fileName = `اختبار_${selectedAsmt.title.replace(/[\s/\\:]+/g, '_')}`;
      const res = await exportUnifiedPdf(assessmentPrintRef.current, {
        filename: `${fileName}.pdf`,
        orientation: 'portrait',
        title: selectedAsmt.title,
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
      console.error('Assessment PDF export error:', err);
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
            <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>استوديو الاختبارات والتقويم التحصيلي</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            بناء اختبارات تحصيلية موثقة بأسئلة موضوعية ومقالية وتفسير خرائط مع مفتاح إجابة مستقل
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>توليد اختبار بالذكاء الاصطناعي</span>
          </button>
        </div>
      </div>


      {/* Sub-Tabs: Assessments vs Question Bank */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 no-print">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'assessments'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-teal-600" />
          <span>الاختبارات الفترية والتقويم التحصيلي ({assessments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('question_bank')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'question_bank'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>بنك المفردات الاختبارية العُمانية المعياري (الصفوف 5 - 12) 🇴🇲</span>
          <span className="text-[10px] bg-amber-400/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded-md">
            معتمد
          </span>
        </button>
      </div>

      {activeTab === 'question_bank' ? (
        <CurriculumQuestionBank />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved Assessments Sidebar */}
        <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2 no-print shadow-xs">

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block pb-2 border-b border-slate-100 dark:border-slate-800">
            الاختبارات المحفوظة ({assessments.length})
          </span>

          <div className="space-y-2 max-h-[650px] overflow-y-auto">
            {assessments.map(asmt => (
              <div
                key={asmt.id}
                onClick={() => setSelectedAsmt(asmt)}
                className={`p-3 rounded-2xl cursor-pointer text-xs transition border ${
                  selectedAsmt?.id === asmt.id
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 font-bold shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <h4 className="font-bold line-clamp-1">{asmt.title}</h4>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>{asmt.gradeName}</span>
                  <span>{asmt.totalPoints} درجة</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Viewer */}
        <div className="lg:col-span-3">
          {selectedAsmt ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 no-print">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      showAnswerKey
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                    }`}
                  >
                    {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAnswerKey ? 'إخفاء نموذج الإجابة' : 'عرض نموذج الإجابة وتوزيع الدرجات'}</span>
                  </button>
                </div>

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
                    title="تصدير الاختبار كملف PDF عالي الجودة"
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
                    onClick={() => handleDelete(selectedAsmt.id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                    title="حذف الاختبار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Wrapper */}
              <div ref={assessmentPrintRef} className="space-y-6 bg-white dark:bg-slate-900 p-2 rounded-2xl">
              {/* Printable Formal Omani Header */}
              <div className="border-2 border-slate-900 dark:border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs bg-slate-50/50 dark:bg-slate-900/50">
                <div className="space-y-0.5 text-right">
                  <div className="flex items-center gap-2">
                    <div className="font-black text-sm text-slate-900 dark:text-white">
                      {countryName} • {ministryName}
                    </div>
                    <button
                      onClick={openEditModal}
                      className="no-print text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      ✏️ تعديل
                    </button>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">
                    {directorateName} | <strong className="text-teal-700 dark:text-teal-400">{schoolName}</strong>
                    {governorateName && <span className="text-slate-500 text-[11px]"> (محافظة {governorateName})</span>}
                  </div>
                  <div className="text-teal-700 dark:text-teal-400 font-semibold text-[11px]">
                    مقرر: {selectedAsmt.subjectName} • العام الدراسي: {academicYear} {semester ? `(${semester})` : ''}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    إعداد الأستاذ: <strong className="text-slate-800 dark:text-slate-200">{teacherName}</strong>
                    {supervisorName && (
                      <span> | إشراف: <strong className="text-slate-800 dark:text-slate-200">{supervisorName}</strong></span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-black text-sm text-slate-900 dark:text-white">{selectedAsmt.title}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    الزمن: {selectedAsmt.timeLimitMinutes} دقيقة • الدرجة الكلية: {selectedAsmt.totalPoints} درجات
                  </div>
                  {stampText && (
                    <div className="mt-1 inline-block px-2.5 py-0.5 rounded-lg border border-dashed border-teal-600 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                      {stampText}
                    </div>
                  )}
                </div>

                <div className="space-y-1 border-t md:border-t-0 md:border-r border-slate-300 dark:border-slate-700 pt-2 md:pt-0 md:pr-4 text-[11px] text-slate-700 dark:text-slate-300">
                  <div>اسم الطالب: .......................................</div>
                  <div>الصف والشعبة: {selectedAsmt.gradeName}</div>
                  <div className="font-bold text-teal-800 dark:text-teal-300">الدرجة المرصودة: [      / {selectedAsmt.totalPoints} ]</div>
                </div>
              </div>


              {/* Questions List */}
              <div className="space-y-6">
                {(selectedAsmt.questions || []).map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                            {q.prompt}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            {q.isDirectFromTextbook ? (
                              <span className="text-teal-600 dark:text-teal-400 font-bold">
                                • سؤال مستخرج ومطابق لنص الكتاب المدرسي
                              </span>
                            ) : (
                              <span>• سؤال تحصيلي بنائي</span>
                            )}
                            {q.sourceCitation && (
                              <span>({q.sourceCitation.resourceTitle} - ص {q.sourceCitation.pageNumber})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold shrink-0">
                        [{q.points} درجات]
                      </span>
                    </div>

                    {/* MCQ Options */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 mr-8">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border text-xs ${
                              showAnswerKey && opt === q.correctAnswer
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-100 font-bold'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Essay or Map Answer Line */}
                    {(q.type === 'essay' || q.type === 'map_interpretation' || q.type === 'data_analysis' || q.type === 'fill_blank') && (
                      <div className="mr-8 h-14 border-b border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-slate-400 flex items-end pb-1">
                        إجابة الطالب: ................................................................................................................................................
                      </div>
                    )}

                    {/* Answer Key Disclosure */}
                    {showAnswerKey && (
                      <div className="mr-8 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>الإجابة النموذجية: {q.correctAnswer}</span>
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>التعليل والشاهد العلمي:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Grading Rubric table */}
              {showAnswerKey && selectedAsmt.gradingRubric && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>جدول توزيع الدرجات ومعايير التصحيح (Rubric)</span>
                  </h4>
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">
                        <th className="pb-2">معيار التقييم</th>
                        <th className="pb-2">الدرجة</th>
                        <th className="pb-2">الوصف ومؤشر الأداء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedAsmt.gradingRubric.map((rub, i) => (
                        <tr key={i}>
                          <td className="py-2 font-bold">{rub.criteria}</td>
                          <td className="py-2 font-extrabold text-teal-600">{rub.points}</td>
                          <td className="py-2 text-slate-600 dark:text-slate-300">{rub.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400">
              اختر اختباراً لعرضه أو أنشئ اختباراً جديداً
            </div>
          )}
        </div>
      </div>
      )}

      {/* Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>توليد اختبار بالذكاء الاصطناعي</span>
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الوحدة والموضوع المستهدف</label>
                <textarea
                  rows={2}
                  value={genUnit}
                  onChange={(e) => setGenUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عدد الأسئلة</label>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مستوى الصعوبة</label>
                  <select
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="easy">سهل ومباشر</option>
                    <option value="medium">متوسط وشامل</option>
                    <option value="hard">متقدم وتفكير ناقد وتفسير خرائط</option>
                  </select>
                </div>
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
                  {isGenerating ? 'جارٍ صياغة الأسئلة ومفتاح الإجابة...' : 'بدء توليد الاختبار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
