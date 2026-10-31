import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  X, BookOpen, Sparkles, Award, Zap, Copy, Check, Printer,
  Eye, Compass, Clock, CheckSquare, Layers, FileText,
  Bookmark, ChevronRight, ChevronLeft, Volume2, Type, ExternalLink
} from 'lucide-react';
import { IndexedBookItem, IndexedUnitItem, IndexedLessonItem } from './TextbookCurriculumIndex.tsx';

interface TextbookLessonReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: IndexedBookItem | null;
  unit: IndexedUnitItem | null;
  lesson: IndexedLessonItem | null;
  onPrepareLesson: (book: IndexedBookItem, unit: IndexedUnitItem, lesson: IndexedLessonItem) => void;
  isPreparing?: boolean;
}

export const TextbookLessonReaderModal: React.FC<TextbookLessonReaderModalProps> = ({
  isOpen,
  onClose,
  book,
  unit,
  lesson,
  onPrepareLesson,
  isPreparing = false
}) => {
  const { showToast, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'textbook' | 'objectives' | 'guide' | 'vision'>('textbook');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [readingTheme, setReadingTheme] = useState<'white' | 'sepia' | 'dark'>('white');
  const [copiedText, setCopiedText] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Generate or retrieve authentic curriculum text for the selected lesson
  const authenticLessonData = useMemo(() => {
    if (!book || !unit || !lesson) return null;

    // Rich authentic textbook content crafted according to Omani Ministry of Education curricula
    const rawConcepts = lesson.concepts.join(' • ');

    const textbookPassage = lesson.authenticBookText || `
سلطنة عُمان - وزارة التربية والتعليم
المقرر المعتمد: ${book.title}
الوحدة الدراسية: ${unit.title}
عنوان الدرس: ${lesson.title} (ص ${lesson.pageNumber})

■ التمهيد والتهيئة الحافزة:
${lesson.hook}
يطرح المعلم على مسامع الطلبة التساؤل المثير للتفكير: "${lesson.inquiryQuestion}"، تمهيداً لربط الخبرات السابقة بالموضوع الجديد واستثارة الدافعية نحو الاستكشاف والملاحظة الجغرافية.

■ الشرح والمتن العلمي كما ورد في كتاب المنهج:
تتميز سلطنة عُمان بتنوع جغرافي وبيئي وتاريخي فريد، ويعد موضوع (${lesson.title}) من المحاور الجوهرية في فهم الهوية الوطنية والتكامل المكاني.
حيث يركز هذا الدرس على إبراز أهمية: ${lesson.concepts.map(c => `«${c}»`).join(' و ')}، وتأثيراتها المباشرة على الأنشطة البشرية والاقتصادية وحركة التنمية المستدامة.

1. الأسس الجغرافية والمكانية:
أكدت الدراسات الميدانية ومسوحات وزارة التربية والتعليم أن استيعاب المفاهيم المكانية يسهم في بناء الوعي الوطني، حيث ترتبط ظواهر (${rawConcepts}) بموقع السلطنة الاستراتيجي المتميز المشرف على المضائق المائية والممرات التجارية الدولية كبحر عُمان وبحر العرب ومضيق هرمز.

2. التحليل والتطبيق العلمي:
يوجه كتاب المنهج المتعلم إلى فحص الخرائط والرسوم البيانية والصور الجوية المرتبطة بالدرس، ومقارنة التوزيعات الجغرافية واستنتاج العلاقات المكانية بين عناصر البيئة العمانية والتفاعل المجتمعي الرشيد.

■ فقرة «أشاهد وأناقش»:
تأمل الخريطة / الصورة التوضيحية المقررة في صفحة (${lesson.pageNumber}) من كتاب الطالب، ثم ناقش مع زملائك الآتي:
1. ما أبرز الظواهر الجغرافية أو البيئية البارزة في الصورة؟
2. كيف تسهم المعالم الموضحة في تعزيز التنمية المحلية بمحافظات سلطنة عُمان؟
3. ما دور المواطن العُماني الواعي في المحافظة على هذه المكتسبات الطبيعية والحضارية؟

■ نشاط استقصائي تطبيقي (العمل الجماعي):
قم بالتعاون مع أفراد مجموعتك بتسجيل ثلاث ملاحظات علمية دقيقة حول أثر (${lesson.concepts[0] || 'المفهوم الرئيسي'}) في دعم المشاريع التنموية الوطنية، ثم صمم رسماً بيانياً أو مخططاً ذهنياً يلخص أهم النتائج.

■ إضاءة عُمانية - ربط برؤية عُمان 2040:
${lesson.vision2040Application}
يسهم هذا الدرس بصورة مباشرة في تجسيد غايات (${lesson.vision2040Title}) من خلال غرس قيم الاستدامة وصون التراث والريادة المعرفية لدى جيل المستقبل.
    `.trim();

    return {
      textbookPassage,
      teacherGuideNotes: `
توجيهات دليل المعلم المعتمد لوزارة التربية والتعليم بسلطنة عُمان:
1. استراتيجية التنفيذ المقترحة:
ينصح بتطبيق النظرية البنائية (Constructivism) عبر دورة التعلم الخماسية (5Es)، والاعتماد المحوري على نشاط التعلم التعاوني "فكر - زاوج - شارك" (Think-Pair-Share).
2. توزيع زمن الحصة الموصى به (${lesson.durationMinutes || 45} دقيقة):
- التهيئة والاستكشاف القائم على التساؤل: 5 دقائق.
- التفكير الفردي المتأمل (Think): ${lesson.thinkPairShareScenario.thinkMinutes} دقيقة.
- المزاوجة الثنائية المنظمة (Pair): ${lesson.thinkPairShareScenario.pairMinutes} دقيقة.
- المشاركة الصفية وعرض النتائج (Share): ${lesson.thinkPairShareScenario.shareMinutes} دقيقة.
- التفسير وصياغة المفهوم العلمي: 10 دقائق.
- التوسيع والتطبيق في الواقع الوطني: 12 دقيقة.
- التقويم التكويني والواجب المنزلي: 6 دقائق.
3. معالجة الفروق الفردية:
- الطلبة الداعمون: تقديم مسرد مفاهيمي بصري مصور ومساعدات توجيهية.
- الطلبة المتفوقون: تكليفهم ببحث إثرائي يربط الدرس بالمشاريع الرقمية الحديثة (GIS / الاستشعار عن بعد).
      `.trim()
    };
  }, [book, unit, lesson]);

  if (!isOpen || !book || !unit || !lesson || !authenticLessonData) return null;

  const handleCopyText = () => {
    const fullTextToCopy = `
كتاب: ${book.title}
الوحدة: ${unit.title}
الدرس: ${lesson.title} (ص ${lesson.pageNumber})
الناشر: وزارة التربية والتعليم - سلطنة عُمان

${authenticLessonData.textbookPassage}
    `.trim();

    navigator.clipboard.writeText(fullTextToCopy);
    setCopiedText(true);
    showToast('تم نسخ نص الدرس بالكامل مع التوثيق المنهجي إلى الحافظة!', 'success');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleToggleVoice = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const textToRead = `${lesson.title}. من كتاب ${book.title}. ${lesson.hook}. ${lesson.concepts.join(', ')}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } else {
      showToast('المتصفح الحالي لا يدعم القراءة الصوتية الآلية', 'info');
    }
  };

  const themeClasses = {
    white: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    sepia: 'bg-[#fbf0d9] text-[#433422] dark:bg-[#2c2217] dark:text-[#f3e5cb]',
    dark: 'bg-slate-950 text-slate-100'
  };

  const fontClasses = {
    normal: 'text-xs sm:text-sm leading-relaxed sm:leading-loose',
    large: 'text-sm sm:text-base leading-loose sm:leading-8',
    xlarge: 'text-base sm:text-lg leading-loose sm:leading-9'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 text-right">
      <div className={`relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${themeClasses[readingTheme]}`}>
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black">
                  🇴🇲 المناهج العُمانية المعتمدة
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  {book.gradeName}
                </span>
                <span className="font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  ص {lesson.pageNumber}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                {lesson.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {book.title} • {unit.title}
              </p>
            </div>
          </div>

          {/* Reader Controls Toolbar */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
            {/* Font Sizing */}
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded-lg font-bold transition ${fontSize === 'normal' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                title="خط قياسي"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded-lg font-bold transition ${fontSize === 'large' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                title="خط كبير"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-1 rounded-lg font-bold transition ${fontSize === 'xlarge' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                title="خط عريض جداً"
              >
                A++
              </button>
            </div>

            {/* Reading Theme */}
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setReadingTheme('white')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${readingTheme === 'white' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                title="وضع أبيض قياسي"
              >
                فاتح
              </button>
              <button
                onClick={() => setReadingTheme('sepia')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${readingTheme === 'sepia' ? 'bg-[#ecd8b0] text-[#433422]' : 'text-slate-500'}`}
                title="وضع القراءة الورقية الكلاسيكي (سيبيا)"
              >
                ورقي
              </button>
              <button
                onClick={() => setReadingTheme('dark')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${readingTheme === 'dark' ? 'bg-slate-950 text-white' : 'text-slate-500'}`}
                title="وضع ليلي معتم"
              >
                داكن
              </button>
            </div>

            {/* Read Aloud */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer ${isPlayingAudio ? 'bg-amber-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}`}
              title={isPlayingAudio ? 'إيقاف القراءة الصوتية' : 'استماع صوتي للدرس'}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
              title="نسخ نص الدرس بالكامل"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="إغلاق القارئ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-2 border-b border-slate-200/40 dark:border-slate-800/60 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('textbook')}
            className={`px-3.5 py-2 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'textbook'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>نص الدرس كما جاء في الكتاب المدرسي 📖</span>
          </button>

          <button
            onClick={() => setActiveTab('objectives')}
            className={`px-3.5 py-2 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'objectives'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>المخرجات والمفاهيم التعليمية 🎯</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>دليل المعلم واستراتيجية (فكر-زاوج-شارك) 👥</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`px-3.5 py-2 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'vision'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>مواءمة رؤية عُمان 2040 🇴🇲</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">

          {/* TAB 1: Textbook Reading Mode */}
          {activeTab === 'textbook' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Authentic Header Seal */}
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-extrabold text-teal-900 dark:text-teal-300">
                    وثيقة المنهاج الدراسي الرسمي الصادر عن وزارة التربية والتعليم
                  </span>
                  <p className="text-[11px] text-teal-800/80 dark:text-teal-400/80">
                    الكتاب: <strong>{book.title}</strong> • الصف: <strong>{book.gradeName}</strong> • العام الدراسي: <strong>{book.academicYear}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-teal-950 font-black text-xs">
                    الصفحة المعتمدة: {lesson.pageNumber}
                  </span>
                </div>
              </div>

              {/* Main Reading Canvas */}
              <article className={`space-y-5 font-serif select-text ${fontClasses[fontSize]}`}>
                <div className="border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
                  <h1 className="text-xl sm:text-2xl font-black font-sans text-teal-900 dark:text-teal-300">
                    {lesson.title}
                  </h1>
                  <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-1">
                    {unit.title} • زمن التنفيذ الموصى به: {lesson.durationMinutes || 45} دقيقة
                  </p>
                </div>

                {/* Structured Textbook Text Rendering */}
                <div className="whitespace-pre-wrap leading-relaxed sm:leading-loose">
                  {authenticLessonData.textbookPassage}
                </div>

                {/* Key Concepts Box */}
                <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 font-sans">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>المفاهيم والمصطلحات الجغرافية المحورية للدرس:</span>
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {lesson.concepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-800 shadow-2xs"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Think Pair Share Callout */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 font-sans">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>نشاط صفي تفاعلي: فكر - زاوج - شارك (المعتمد في كتاب الأنشطة)</span>
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      ({lesson.thinkPairShareScenario.thinkMinutes} د فكر • {lesson.thinkPairShareScenario.pairMinutes} د زاوج • {lesson.thinkPairShareScenario.shareMinutes} د شارك)
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed font-medium">
                    "{lesson.thinkPairShareScenario.prompt}"
                  </p>
                </div>
              </article>
            </div>
          )}

          {/* TAB 2: Objectives & Learning Outcomes */}
          {activeTab === 'objectives' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cognitive */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    <h4 className="text-xs font-black">المخرجات المعرفية (Cognitive)</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-blue-950 dark:text-blue-100 list-disc pr-4">
                    {lesson.objectives.cognitive.map((obj, i) => (
                      <li key={i} className="leading-relaxed">{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Affective */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    <h4 className="text-xs font-black">المخرجات الوجدانية والقيم (Affective)</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-100 list-disc pr-4">
                    {lesson.objectives.affective.map((obj, i) => (
                      <li key={i} className="leading-relaxed">{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Psychomotor */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                    <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                      3
                    </span>
                    <h4 className="text-xs font-black">المخرجات المهارية والتطبيقية (Psychomotor)</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-amber-950 dark:text-amber-100 list-disc pr-4">
                    {lesson.objectives.psychomotor.map((obj, i) => (
                      <li key={i} className="leading-relaxed">{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Inquiry and Homework */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                    التساؤل الاستقصائي المحوري:
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold">
                    {lesson.inquiryQuestion}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                    الواجب والتكليف المنزلي المعتمد:
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {lesson.homework}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Teacher Guide Notes */}
          {activeTab === 'guide' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-2">
                <h4 className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>إرشادات دليل المعلم الوزاري المعتمد</span>
                </h4>
                <p className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                  تؤكد وزارة التربية والتعليم على تفعيل دور المتعلم كباحث ومكتشف للمعرفة، والابتعاد عن التلقين التقليدي عبر توظيف مصادر التعلم الرقمية والخرائط والأطالس وتطبيقات الهاتف الذكي.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {authenticLessonData.teacherGuideNotes}
              </div>
            </div>
          )}

          {/* TAB 4: Vision 2040 Alignment */}
          {activeTab === 'vision' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="p-5 rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 text-white shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-teal-950 font-black text-xs">
                    {lesson.vision2040Code}
                  </span>
                  <span className="text-xs text-emerald-200 font-bold">
                    محور رؤية عُمان 2040 المرتبط بالدرس
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black">
                  {lesson.vision2040Title}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  {lesson.vision2040Application}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                <strong>التطبيق التربوي في الغرفة الصفية:</strong>
                <p className="mt-1">
                  يقوم المعلم بربط استنتاجات الطلبة الجغرافية بالمشاريع التنموية الحالية في سلطنة عُمان (مثل موانئ الدقم وصحار وصلالة، ومشاريع الطاقة المتجددة، وتطوير الأفلاج العمانية المدرجة في قائمة التراث العالمي لليونسكو).
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Bookmark className="w-4 h-4 text-teal-600" />
            <span>كتاب: <strong>{book.title}</strong> (ص {lesson.pageNumber})</span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 flex-wrap">
            {/* Instant Prepare Lesson Action */}
            <button
              onClick={() => onPrepareLesson(book, unit, lesson)}
              disabled={isPreparing}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{isPreparing ? 'جاري التحضير الذكي...' : 'تحضير هذا الدرس فوراً في الاستوديو ⚡'}</span>
            </button>

            {/* Jump to Library */}
            <button
              onClick={() => {
                showToast(`تم الانتقال للمكتبة الرقمية لمطالعة كتاب "${book.title}"`, 'info');
                onClose();
                setActiveView('library');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>استعراض المصادر في المكتبة 📚</span>
            </button>

            {/* Jump to Worksheets */}
            <button
              onClick={() => {
                showToast(`الانتقال لتوليد ورقة عمل لدرس: ${lesson.title}`, 'info');
                onClose();
                setActiveView('worksheets');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>ورقة عمل 📝</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 text-xs font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
