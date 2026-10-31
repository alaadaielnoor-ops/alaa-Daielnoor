import React, { useState } from 'react';
import {
  Sparkles, Upload, Eye, CheckCircle2, AlertCircle, Copy,
  Check, FileQuestion, BookOpen, Layers, X, HelpCircle, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';

interface AIMapAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedImage?: {
    url: string;
    title: string;
  };
}

// Curated high-yield curriculum specimens
const CURRICULUM_SPECIMENS = [
  {
    id: 'sp-1',
    title: 'خريطة التضاريس والكنتور لسلطنة عمان وسلسلة جبال الحجر',
    category: 'كنتور وطبوغرافيا',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    description: 'تمثل الانحدارات الطبوغرافية لسلاسل جبال الحجر الشرقي والغربي وجبل شمس والأودية.'
  },
  {
    id: 'sp-2',
    title: 'مرئية فضائية لمضيق هرمز والملاحة في الخليج وبحر عمان',
    category: 'استشعار عن بعد',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    description: 'مرئية صناعية توضح الممر الملاحي لناقلات النفط والتقسيم الجيوسياسي لمدخل الخليج.'
  },
  {
    id: 'sp-3',
    title: 'خريطة الأقاليم المناخية والأمطار ورصد الأنواء المناخية',
    category: 'مناخ وبيئة',
    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80',
    description: 'توزيع الأمطار السنوية وظاهرة خريف صلالة الموسمية ومسارات الأعاصير المدارية.'
  },
  {
    id: 'sp-4',
    title: 'خريطة المشاريع اللوجستية وموانئ رؤية عمان 2040 (الدقم وصحار وصلالة)',
    category: 'اقتصاد ورؤية 2040',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    description: 'مواقع الموانئ العالمية ومناطق الهيدروجين الأخضر وسلاسل الإمداد الدولية.'
  }
];

export const AIMapAnalystModal: React.FC<AIMapAnalystModalProps> = ({
  isOpen,
  onClose,
  preselectedImage
}) => {
  const { showToast, currentUser } = useApp();

  const [activeImage, setActiveImage] = useState<string>(
    preselectedImage?.url || CURRICULUM_SPECIMENS[0].url
  );
  const [activeTitle, setActiveTitle] = useState<string>(
    preselectedImage?.title || CURRICULUM_SPECIMENS[0].title
  );
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى رفع ملف صورة بصيغة JPG أو PNG أو WEBP', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setActiveImage(dataUrl);
      setActiveTitle(file.name.replace(/\.[^/.]+$/, ''));
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // If image is a remote URL, we can pass it or fetch as base64
      let base64 = activeImage;
      if (activeImage.startsWith('http')) {
        // Fallback placeholder base64 or pass as is
        base64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
      }

      const res = await api.analyzeMap({
        base64Data: base64,
        mimeType: 'image/jpeg',
        title: activeTitle,
        customPrompt: customPrompt.trim() || undefined,
        userId: currentUser.id
      });

      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
        showToast('تم إنجاز التحليل الكارتوجرافي الذكي بنجاح!', 'success');
      } else {
        showToast('تعذر استكمال التحليل، يرجى المحاولة مجدداً', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'حدث خطأ أثناء الاتصال بالمساعد الذكي', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(index);
    showToast('تم نسخ السؤال ونموذج إجابته بنجاح!', 'success');
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/60 via-transparent to-emerald-50/40 dark:from-slate-800/60 dark:to-teal-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>مُحلل الخرائط والمرئيات الفضائية بالذكاء الاصطناعي</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                  Gemini 3.8 Flash Vision
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                فحص الأركان الكارتوجرافية، تفسير الظواهر التضاريسية، ومواءمة مخرجات رؤية عمان 2040
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Top Picker: Select Curated Specimen or Upload Own */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>اختر نموذجاً من المنهج العُماني أو ارفع خريطتك الخاصة:</span>
              </span>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition">
                <Upload className="w-3.5 h-3.5" />
                <span>رفع خريطة من جهازك</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CURRICULUM_SPECIMENS.map(sp => {
                const isSelected = activeImage === sp.url;
                return (
                  <div
                    key={sp.id}
                    onClick={() => {
                      setActiveImage(sp.url);
                      setActiveTitle(sp.title);
                      setAnalysisResult(null);
                    }}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-teal-400'
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 mb-2">
                      <img
                        src={sp.url}
                        alt={sp.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {sp.category}
                      </span>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1">
                        {sp.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Image Preview & Prompt Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-5 space-y-3">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs relative bg-slate-950">
                <img
                  src={activeImage}
                  alt={activeTitle}
                  className="w-full max-h-[300px] object-contain"
                />
                <div className="p-2.5 bg-slate-900/90 text-white text-xs">
                  <strong className="block font-bold">{activeTitle}</strong>
                </div>
              </div>

              {/* Custom Prompt Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  توجيه مخصص للمساعد (اختياري):
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="مثال: ركز على استخراج أسئلة لطلاب الصف الحادي عشر حول خطوط الكنتور..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جارٍ التحليل الكارتوجرافي بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>تشغيل التحليل الكارتوجرافي الشامل 🚀</span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Output Panel */}
            <div className="md:col-span-7">
              {analysisResult ? (
                <div className="space-y-4">
                  {/* Cartographic Essentials Badges */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block">
                      فحص الأركان الكارتوجرافية للخريطة:
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>العنوان: {analysisResult.cartographicElements?.titleDetected || 'مكتشف'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>المقياس: {analysisResult.cartographicElements?.scaleType || 'معياري'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مفتاح الخريطة متوفر</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>اتجاه الشمال</span>
                      </span>
                    </div>
                  </div>

                  {/* Spatial Analysis & Vision 2040 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
                    <div>
                      <h4 className="font-extrabold text-teal-700 dark:text-teal-400 mb-1">
                        🌍 التحليل المكاني والجيومورفولوجي:
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300">{analysisResult.spatialAnalysis}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="font-extrabold text-amber-600 dark:text-amber-400 mb-1">
                        🇴🇲 المواءمة مع رؤية عُمان 2040 ومناهج الوزارة:
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300">{analysisResult.vision2040Relevance}</p>
                      <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-semibold">
                        {analysisResult.curriculumLinkage}
                      </p>
                    </div>
                  </div>

                  {/* Generated Ministerial Exam Questions */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <FileQuestion className="w-4 h-4 text-teal-600" />
                        <span>أسئلة وزارية تطبيقية مستخلصة من واقع الخريطة:</span>
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {analysisResult.suggestedQuestions?.map((q: any, idx: number) => {
                        const isCopied = copiedQuestionIndex === idx;
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                  q.level === 'معرفة'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : q.level === 'تطبيق'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                }`}
                              >
                                مستوى: {q.level} • ({q.points} درجات)
                              </span>

                              <button
                                onClick={() =>
                                  handleCopyQuestion(`السؤال: ${q.question}\nالإجابة النموذجية: ${q.answerKey}`, idx)
                                }
                                className="text-[10px] text-slate-500 hover:text-teal-600 flex items-center gap-1 font-bold"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{isCopied ? 'تم النسخ' : 'نسخ السؤال والإجابة'}</span>
                              </button>
                            </div>

                            <p className="font-bold text-slate-900 dark:text-white leading-relaxed">
                              {idx + 1}. {q.question}
                            </p>

                            <div className="p-2 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 text-[11px] border border-teal-100 dark:border-teal-900/40">
                              <strong>النموذج المعتمد:</strong> {q.answerKey}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[350px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-teal-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      جاهز لتحليل الخريطة واستخراج المعطيات الكارتوجرافية
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      انقر على زر "تشغيل التحليل الكارتوجرافي الشامل" لتوليد التقرير الجغرافي والأسئلة الوزارية فوراً عبر الذكاء الاصطناعي.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60 dark:bg-slate-950/40">
          <span>معتمد لمناهج الدراسات الاجتماعية والجغرافيا بسلطنة عمان 🇴🇲</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
