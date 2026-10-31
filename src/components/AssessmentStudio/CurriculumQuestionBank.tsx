import React, { useState } from 'react';
import {
  HelpCircle, CheckCircle2, Search, Filter, BookOpen,
  Award, Copy, Check, Printer, Sparkles, Layers, ArrowUpDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export interface BankQuestion {
  id: string;
  grade: string;
  subject: string;
  unit: string;
  level: 'معرفة' | 'تطبيق' | 'قدرات عليا';
  type: 'multiple_choice' | 'map_interpretation' | 'short_answer' | 'essay';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  vision2040Link?: string;
}

export const OMAN_CURRICULUM_QUESTIONS: BankQuestion[] = [
  {
    id: 'bq-1',
    grade: 'الصف 11',
    subject: 'الجغرافيا والتقنيات الحديثة',
    unit: 'الوحدة الأولى: علم الخرائط ونظم المعلومات الجغرافية',
    level: 'معرفة',
    type: 'multiple_choice',
    prompt: 'ما العنصر الكارتوغرافي الذي يوضح النسبة بين الأبعاد على الخريطة وما يقابلها على سطح الأرض في الطبيعة؟',
    options: ['عنوان الخريطة', 'مقياس الرسم', 'شبكة الإحداثيات', 'اتجاه الشمال'],
    correctAnswer: 'مقياس الرسم',
    explanation: 'مقياس الرسم هو النسبة الرياضية بين المسافة المقاسة على الخريطة والمسافة الحقيقية المقابلة لها على الطبيعة.',
    points: 2,
    vision2040Link: 'التعليم والبحث العلمي والقدرات الوطنية'
  },
  {
    id: 'bq-2',
    grade: 'الصف 11',
    subject: 'الجغرافيا والتقنيات الحديثة',
    unit: 'الوحدة الأولى: علم الخرائط ونظم المعلومات الجغرافية',
    level: 'تطبيق',
    type: 'map_interpretation',
    prompt: 'إذا كانت المسافة بين ولايتي صحار ومسقط على خريطة بمقياس رسم (1: 2,000,000) تساوي 11.5 سم، فكم تبلغ المسافة الحقيقية بالكيلومترات على أرض الواقع؟',
    correctAnswer: '230 كم (الحساب: 11.5 × 2,000,000 سم = 23,000,000 سم ÷ 100,000 = 230 كيلومتراً).',
    explanation: 'تطبيق رياضي كارتوغرافي مباشر لتحويل المسافة الورقية إلى كيلومترات طبيعية.',
    points: 3,
    vision2040Link: 'بناء القدرات العلمية والتطبيقية للطلبة'
  },
  {
    id: 'bq-3',
    grade: 'الصف 11',
    subject: 'الجغرافيا والتقنيات الحديثة',
    unit: 'الوحدة الثانية: الاستشعار عن بعد ونظم GIS',
    level: 'قدرات عليا',
    type: 'essay',
    prompt: 'فسر كيف ساهمت نظم المعلومات الجغرافية (GIS) والاستشعار عن بعد في إدارة الأزمات المناخية والأنواء الاستثنائية التي تعرضت لها سلطنة عمان (مثل إعصار جونو أو شاهين).',
    correctAnswer: '1. التنبؤ المبكر بمسار الإعصار وتحديد نقاط التلاقي الساحلية. 2. نمذجة مجاري الأودية ومناطق الغمر السكاني لتوجيه عمليات الإخلاء الآمن. 3. تقييم الأضرار وحصر الطرق والمنشآت المتضررة بالأقمار الصناعية لتسريع إعادة الإعمار.',
    explanation: 'سؤال استدلال وتحليل لحل المشكلات البيئية والمناخية باستخدام الجيوماتكس.',
    points: 5,
    vision2040Link: 'الاستدامة البيئية وحماية الموارد الطبيعية'
  },
  {
    id: 'bq-4',
    grade: 'الصف 12',
    subject: 'هذا وطني (تاريخ وجغرافيا عمان)',
    unit: 'الوحدة الأولى: عُمان المكان والحضارة',
    level: 'معرفة',
    type: 'multiple_choice',
    prompt: 'الموقع الجغرافي الذي يشرف عليه الطرف الشمالي لمحافظة مسندم ويعد من أهم الممرات المائية الإستراتيجية في العالم هو:',
    options: ['مضيق باب المندب', 'مضيق هرمز', 'مضيق جبل طارق', 'مضيق البوسفور'],
    correctAnswer: 'مضيق هرمز',
    explanation: 'يقع مضيق هرمز تحت الإشراف المباشر لسلطنة عمان (محافظة مسندم)، وتمر منه حصة كبرى من تجارة النفط العالمية.',
    points: 2,
    vision2040Link: 'الموقع الجيوسياسي واللوجستي العالمي لسلطنة عمان'
  },
  {
    id: 'bq-5',
    grade: 'الصف 12',
    subject: 'هذا وطني (تاريخ وجغرافيا عمان)',
    unit: 'الوحدة الثانية: التنمية الاقتصادية المستدامة',
    level: 'تطبيق',
    type: 'short_answer',
    prompt: 'وضح أثر إنشاء المنطقة الاقتصادية الخاصة بالدقم في محافظة الوسطى على تنويع مصادر الدخل القومي لسلطنة عمان وفق مستهدفات رؤية عمان 2040.',
    correctAnswer: '1. استثمار الموقع البحري المفتوح على بحر العرب بعيداً عن المضائق. 2. إنشاء مجمعات تصدير الهيدروجين الأخضر والطاقة المتجددة. 3. تشغيل الحوض الجاف لصيانة السفن العالمية وجذب الاستثمارات الصناعية والبتروكيماوية.',
    explanation: 'ربط المعرفة الجغرافية الميدانية بمستهدفات التنويع الاقتصادي الوطني.',
    points: 4,
    vision2040Link: 'تنويع الاقتصاد وتطوير المحافظات'
  },
  {
    id: 'bq-6',
    grade: 'الصف 10',
    subject: 'الدراسات الاجتماعية',
    unit: 'الوحدة الأولى: كوكب الأرض والتضاريس',
    level: 'معرفة',
    type: 'multiple_choice',
    prompt: 'أعلى قمة جبلية في سلطنة عُمان تقع في سلسلة جبال الحجر الغربي بارتفاع يتجاوز 3000 متر هي قمة:',
    options: ['جبل شمس', 'جبل سمحان', 'جبل القرا', 'جبل حفيت'],
    correctAnswer: 'جبل شمس',
    explanation: 'يبلغ ارتفاع جبل شمس 3009 أمتار ويقع في محافظة الداخلية ويعد أعلى قمة في شبه الجزيرة العربية الشرقية.',
    points: 2,
    vision2040Link: 'السياحة الجيولوجية والبيئية المستدامة'
  },
  {
    id: 'bq-7',
    grade: 'الصف 9',
    subject: 'الدراسات الاجتماعية',
    unit: 'الوحدة الثانية: التراث المائي العماني',
    level: 'تطبيق',
    type: 'short_answer',
    prompt: 'صنف نوع الفلج الذي يمثل فلج "دارس" بولاية نزوى، مع ذكر الخاصية الهندسية المميزة لهذا النوع.',
    correctAnswer: 'نوعه: فلج داوودي. الخاصية الهندسية: يستمد مياهه من طبقات مائية جوفية عميقة جداً عبر قنوات تمتد لعدة كيلومترات تحت الأرض وتتدفق بالانحدار الطبيعي.',
    explanation: 'تطبيق المفاهيم الهيدرولوجية على النماذج العمانية التراثية المدرجة باليونسكو.',
    points: 3,
    vision2040Link: 'صون التراث الثقافي والهوية العمانية'
  },
  {
    id: 'bq-8',
    grade: 'الصف 8',
    subject: 'الدراسات الاجتماعية',
    unit: 'الوحدة الأولى: الغلاف الجوي والطقس',
    level: 'قدرات عليا',
    type: 'essay',
    prompt: 'علل: انفراد محافظة ظفار (صلالة) بانخفاض درجات الحرارة وتساقط الأمطار الصيفية خلال شهري يوليو وأغسطس بخلاف باقي مناطق شبه الجزيرة العربية.',
    correctAnswer: 'بسبب هبوب الرياح الموسمية الجنوبية الغربية (Southwest Monsoon) القادمة من المحيط الهندي، والتي تصطدم بحواف السلاسل الجبلية الشاهقة بظفار فترتفع وتتكثف مسببة هطول الرذاذ وتكون الضباب وانخفاض الحرارة دون 25°م.',
    explanation: 'تفسير الظواهر المناخية الاستوائية المركبة وعلاقتها بحركة الرياح والتضاريس.',
    points: 5,
    vision2040Link: 'السياحة البيئية والمواسم المناخية الفريدة'
  }
];

export const CurriculumQuestionBank: React.FC = () => {
  const { showToast } = useApp();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Exam preview modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const filteredQuestions = OMAN_CURRICULUM_QUESTIONS.filter(q => {
    if (selectedGrade !== 'all' && q.grade !== selectedGrade) return false;
    if (selectedLevel !== 'all' && q.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const qText = `${q.prompt} ${q.correctAnswer} ${q.unit}`.toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const handleCopyQuestion = (q: BankQuestion) => {
    const text = `السؤال (${q.grade} - ${q.level}): ${q.prompt}\nالإجابة النموذجية: ${q.correctAnswer}\nالدرجة: ${q.points} درجات`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    showToast('تم نسخ السؤال ونموذج إجابته إلى الحافظة بنجاح!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Instant Exam Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-900/20">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>بنك المفردات الاختبارية المعياري لمناهج سلطنة عُمان</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                وثيقة التقويم المستمر
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أسئلة معيارية مصنفة حسب مستويات بلوم (معرفة، تطبيق، قدرات عليا) متوافقة مع مصفوفات الاختبارات الوزارية
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExamModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>توليد ورقة اختبار وزاري كاملة</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأسئلة، المفاهيم، أو الوحدات..."
            className="w-full pr-9 pl-3 py-2 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        {/* Grade Filter */}
        <select
          value={selectedGrade}
          onChange={e => setSelectedGrade(e.target.value)}
          className="px-3 py-2 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-xs font-bold"
        >
          <option value="all">كافة الصفوف الدراسية (5 - 12)</option>
          <option value="الصف 12">الصف 12 (هذا وطني)</option>
          <option value="الصف 11">الصف 11 (الجغرافيا والتقنيات الحديثة)</option>
          <option value="الصف 10">الصف 10 (الدراسات الاجتماعية)</option>
          <option value="الصف 9">الصف 9 (الدراسات الاجتماعية)</option>
          <option value="الصف 8">الصف 8 (الدراسات الاجتماعية)</option>
        </select>

        {/* Level Filter */}
        <select
          value={selectedLevel}
          onChange={e => setSelectedLevel(e.target.value)}
          className="px-3 py-2 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-xs font-bold"
        >
          <option value="all">كافة المستويات المعرفية</option>
          <option value="معرفة">المستوى 1: المعرفة والتذكر</option>
          <option value="تطبيق">المستوى 2: الفهم والتطبيق</option>
          <option value="قدرات عليا">المستوى 3: الاستدلال والقدرات العليا</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const isCopied = copiedId === q.id;
          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition hover:border-teal-400"
            >
              {/* Top metadata tags */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-600 text-white">
                    {q.grade}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {q.subject}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      q.level === 'معرفة'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : q.level === 'تطبيق'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}
                  >
                    مستوى: {q.level} • ({q.points} درجات)
                  </span>
                </div>

                <button
                  onClick={() => handleCopyQuestion(q)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'تم النسخ' : 'نسخ السؤال'}</span>
                </button>
              </div>

              {/* Question Text */}
              <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                {idx + 1}. {q.prompt}
              </p>

              {/* Multiple Choice Options if applicable */}
              {q.options && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                        opt === q.correctAnswer
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Official Answer Key Box */}
              <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الإجابة النموذجية المعتمدة في وثيقة التقويم:</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                  {q.correctAnswer}
                </p>
                {q.vision2040Link && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium pt-1">
                    🎯 مواءمة رؤية عُمان 2040: {q.vision2040Link}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL MINISTERIAL EXAM MODAL / PRINT PREVIEW */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
              <h3 className="text-sm font-black text-slate-800">
                معاينة ورقة الاختبار الوزاري النموذجي لسلطنة عُمان
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة ورقة الاختبار فوراً</span>
                </button>
                <button
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Printable Exam Paper */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-900 text-xs">
              {/* Ministry Formal Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-right space-y-0.5">
                    <p className="font-black text-sm">سلطنة عُمان</p>
                    <p className="font-bold">وزارة التربية والتعليم</p>
                    <p>المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة</p>
                    <p>مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-black text-lg">
                      🇴🇲
                    </div>
                    <h2 className="text-base font-black">امتحان مادة الجغرافيا والدراسات الاجتماعية</h2>
                    <p className="font-semibold text-slate-700">الفصل الدراسي الأول • الدور الأول • العام الدراسي 2026 / 2027 م</p>
                  </div>
                  <div className="text-left space-y-0.5">
                    <p>الزمن: ساعتان ونصف</p>
                    <p>الدرجة الكلية: ( 60 ) درجة</p>
                    <p>عدد الصفحات: ( 4 ) صفحات</p>
                  </div>
                </div>

                <div className="p-2 border border-slate-800 rounded-lg flex items-center justify-between text-[11px] font-bold">
                  <span>اسم الطالب: .......................................................................................</span>
                  <span>الصف والشعبة: ...........................................</span>
                  <span>رقم الجلوس: ...........................................</span>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-5">
                <div>
                  <h4 className="font-black text-sm mb-3 underline">
                    أولاً: الأسئلة الموضوعية (المفردات من 1 إلى 4) - لكل مفردة درجتان:
                  </h4>
                  <div className="space-y-4">
                    {OMAN_CURRICULUM_QUESTIONS.filter(q => q.type === 'multiple_choice').map((q, i) => (
                      <div key={q.id} className="space-y-2">
                        <p className="font-bold">{i + 1}. {q.prompt}</p>
                        <div className="grid grid-cols-4 gap-2 pr-4">
                          {q.options?.map((opt, oI) => (
                            <span key={oI} className="p-1.5 border border-slate-400 rounded-md">
                              ( ) {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-300">
                  <h4 className="font-black text-sm mb-3 underline">
                    ثانياً: الأسئلة المقالية وتفسير الخرائط ونظم GIS:
                  </h4>
                  <div className="space-y-5">
                    {OMAN_CURRICULUM_QUESTIONS.filter(q => q.type !== 'multiple_choice').slice(0, 3).map((q, i) => (
                      <div key={q.id} className="space-y-2">
                        <p className="font-bold">{i + 5}. {q.prompt} ({q.points} درجات)</p>
                        <div className="min-h-[50px] border-b border-dashed border-slate-400" />
                        <div className="min-h-[50px] border-b border-dashed border-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-6 text-center text-[11px] font-bold text-slate-600 border-t border-slate-300">
                انتهت الأسئلة مع أصدق الأمنيات بالنجاح والتفوق • المكتبة التربوية الذكية لسلطنة عمان 🇴🇲
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
