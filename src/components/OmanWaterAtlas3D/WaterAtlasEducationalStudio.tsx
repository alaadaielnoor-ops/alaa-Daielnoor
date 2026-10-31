import React, { useState } from 'react';
import { WaterQuizQuestion, WaterFeature } from './types.ts';
import { WATER_QUIZ_QUESTIONS } from './waterAtlasData.ts';
import {
  Award, CheckCircle2, XCircle, HelpCircle, BookOpen,
  ArrowRight, RotateCcw, Sparkles, Compass, Download, BarChart2
} from 'lucide-react';

interface WaterAtlasEducationalStudioProps {
  onFlyToCoords?: (coords: { lat: number; lng: number }) => void;
  onOpenFeature?: (featureId: string) => void;
  features: WaterFeature[];
}

export const WaterAtlasEducationalStudio: React.FC<WaterAtlasEducationalStudioProps> = ({
  onFlyToCoords,
  onOpenFeature,
  features
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'quiz' | 'compare' | 'facts'>('quiz');

  const currentQ = WATER_QUIZ_QUESTIONS[currentQuestionIdx];

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = currentQ.options?.find(o => o.id === selectedOptionId)?.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (onFlyToCoords) {
      onFlyToCoords(currentQ.targetCoords);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < WATER_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
  };

  // Compare top dams
  const topDams = features
    .filter(f => f.category === 'dams' && f.hydrologicalProperties.capacityMillionM3)
    .sort((a, b) => (b.hydrologicalProperties.capacityMillionM3 || 0) - (a.hydrologicalProperties.capacityMillionM3 || 0));

  // Compare top aflaj
  const topAflaj = features
    .filter(f => f.category === 'aflaj' && f.hydrologicalProperties.flowRateLps)
    .sort((a, b) => (b.hydrologicalProperties.flowRateLps || 0) - (a.hydrologicalProperties.flowRateLps || 0));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs space-y-6" dir="rtl">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>القسم التعليمي واختبارات الموارد المائية</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                منهاج عُمان 🇴🇲
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              أنشطة صفية، اختبارات تفاعلية لتحديد المواقع، ومقارنات هيدرولوجية موثقة
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'quiz' ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            اختبار تحديد المواقع
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'compare' ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            مقارنة السدود والأفلاج
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'facts' ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            حقائق مائية عمانية
          </button>
        </div>
      </div>

      {/* TAB 1: QUIZ */}
      {activeTab === 'quiz' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
              السؤال {currentQuestionIdx + 1} من {WATER_QUIZ_QUESTIONS.length}
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              النتيجة: {score} / {WATER_QUIZ_QUESTIONS.length}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50/50 via-white to-sky-50/40 dark:from-slate-800/60 dark:to-teal-950/30 border border-teal-200/60 dark:border-teal-800 space-y-3">
            <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white">
              {currentQ.promptAr}
            </h4>

            {currentQ.hintAr && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>تلميح: {currentQ.hintAr}</span>
              </p>
            )}

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {currentQ.options?.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400';

                if (isAnswerSubmitted) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !opt.isCorrect) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-3.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt.labelAr}</span>
                    {isAnswerSubmitted && opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isAnswerSubmitted && isSelected && !opt.isCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submission */}
            {isAnswerSubmitted && (
              <div className="p-3.5 rounded-xl bg-teal-100/70 dark:bg-teal-950/80 text-teal-950 dark:text-teal-100 text-xs font-bold border border-teal-300 dark:border-teal-700 mt-3 animate-in fade-in duration-200">
                <span>💡 {currentQ.explanationAr}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleRestartQuiz}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الاختبار</span>
            </button>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer disabled:opacity-50"
              >
                تأكيد الإجابة والانتقال للموقع
              </button>
            ) : currentQuestionIdx < WATER_QUIZ_QUESTIONS.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer flex items-center gap-1"
              >
                <span>السؤال التالي</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-black text-emerald-600">
                🎉 أحسنت! أكملت جميع أسئلة الاختبار المائي.
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HYDROLOGICAL COMPARISONS */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Top Dams Capacity Comparison */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-orange-600" />
              <span>مقارنة السدود الكبرى في سلطنة عمان حسب السعة التخزينية (مليون م³):</span>
            </h4>
            <div className="space-y-2">
              {topDams.map(dam => {
                const cap = dam.hydrologicalProperties.capacityMillionM3 || 1;
                const pct = Math.min((cap / 100) * 100, 100);
                return (
                  <div key={dam.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{dam.nameAr}</span>
                      <span className="text-orange-600 font-mono">{cap} مليون م³</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Aflaj Flow Rate Comparison */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-600" />
              <span>مقارنة الأفلاج العمانية حسب معدل التدفق الطبيعي (لتر/ثانية):</span>
            </h4>
            <div className="space-y-2">
              {topAflaj.map(falaj => {
                const flow = falaj.hydrologicalProperties.flowRateLps || 10;
                const pct = Math.min((flow / 250) * 100, 100);
                return (
                  <div key={falaj.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{falaj.nameAr}</span>
                      <span className="text-sky-600 font-mono">{flow} لتر/ثانية</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OMANI WATER FACTS */}
      {activeTab === 'facts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5">
            <span className="font-black text-teal-900 dark:text-teal-200 block text-sm">
              🏛️ إجمالي الأفلاج في سلطنة عُمان
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              تحتضن السلطنة أكثر من 4,112 فلجاً مسجلاً، منها أكثر من 3,010 أفلاج حية متدفقة تسقي بساتين النخيل والواحات، ومصنفة إلى ثلاثة أنواع رئيسية: داوودية (45%)، غيلية (28%)، وعينية (27%).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-1.5">
            <span className="font-black text-sky-900 dark:text-sky-200 block text-sm">
              🛡️ منظومة السدود في عُمان
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              شيدت سلطنة عُمان أكثر من 174 سداً مائياً بسعة تخزينية إجمالية تتجاوز 325 مليون متر مكعب، تتوزع بين سدود التغذية الجوفية وسدود الحماية من مخاطر الفيضانات وسدود التخزين السطحي.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
            <span className="font-black text-amber-900 dark:text-amber-200 block text-sm">
              🌊 تحلية مياه البحر والتناضح العكسي
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              تؤمن محطات تحلية مياه البحر الكبرى (بركاء، الغبرة، صحار، قريات، صلالة، الدقم) أكثر من 85% من الاحتياج الوطني لمياه الشرب الحضرية، مع الاعتماد الكامل على تقنيات التناضح العكسي (SWRO) الموفرة للطاقة.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <span className="font-black text-emerald-900 dark:text-emerald-200 block text-sm">
              🌿 الأراضي الرطبة ومحميات الأخوار
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              تمتلك سلطنة عمان مواقع معتمدة ضمن اتفاقية رامسار الدولية للأراضي الرطبة، ومنها أخوار محافظة ظفار ومحمية القرم ومحمية الأراضي الرطبة بمحوت التي تستقبل سنوياً ملايين الطيور المهاجرة.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
